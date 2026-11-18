import {
  CashMovementType,
  CashRegisterStatus,
  InventoryTransactionType,
  InvoiceType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  SaleStatus,
} from '../../generated';
import { Decimal } from '@prisma/client/runtime/library';
import { TenantAuthUser } from '../helpers/tenantContext';
import { SyncPushOperation, SyncPushResultItem } from '../types/syncTypes';
import { issueCashLease, publicLeaseFields, verifyCashLeaseToken } from './CashLeaseService';

type Tx = Prisma.TransactionClient;

function money(v: Decimal | number | string): Decimal {
  return v instanceof Decimal ? v : new Decimal(v);
}

function sameMoney(a: Decimal, b: Decimal): boolean {
  return a.toFixed(2) === b.toFixed(2);
}

function registerNumberFromLocalId(localCashId: string): string {
  const hex = localCashId.replace(/-/g, '').toLowerCase();
  return `R${hex.slice(0, 19)}`;
}

export class PosCashSyncService {
  rej(op: SyncPushOperation, code: string, message: string): SyncPushResultItem {
    return {
      clientOperationId: op.clientOperationId,
      status: 'rejected',
      operationType: String(op.operationType),
      code,
      message,
      retryable: false,
    };
  }

  async handleCashOpen(
    tx: Tx,
    actor: TenantAuthUser,
    deviceId: string,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    const payload = op.payload || {};
    const localCashId = typeof payload.localCashId === 'string' ? payload.localCashId.trim() : '';
    const openingAmountRaw = payload.openingAmount;
    const notes = typeof payload.notes === 'string' ? payload.notes : null;
    const payloadDevice =
      typeof payload.deviceId === 'string' && payload.deviceId.trim()
        ? payload.deviceId.trim()
        : null;

    if (!localCashId || !/^[0-9a-f-]{36}$/i.test(localCashId)) {
      return this.rej(op, 'VALIDATION', 'localCashId UUID requerido');
    }
    if (openingAmountRaw == null || Number.isNaN(Number(openingAmountRaw))) {
      return this.rej(op, 'VALIDATION', 'openingAmount numérico requerido');
    }
    const openingAmount = money(openingAmountRaw);
    if (openingAmount.lt(0)) {
      return this.rej(op, 'VALIDATION', 'openingAmount no puede ser negativo');
    }
    if (payloadDevice && payloadDevice !== deviceId) {
      return this.rej(op, 'VALIDATION', 'payload.deviceId no coincide con X-Device-Id');
    }

    const existingOpen = await tx.cashRegister.findFirst({
      where: {
        businessId: actor.businessId,
        userId: actor.userId,
        deviceId,
        status: CashRegisterStatus.OPEN,
        deletedAt: null,
      },
    });
    if (existingOpen) {
      return this.rej(
        op,
        'CASH_ALREADY_OPEN',
        `Ya existe caja OPEN id=${existingOpen.id} para este dispositivo`
      );
    }

    const registerNumber = registerNumberFromLocalId(localCashId);

    let cash;
    try {
      cash = await tx.cashRegister.create({
        data: {
          businessId: actor.businessId,
          userId: actor.userId,
          registerNumber,
          deviceId,
          version: 1,
          clientOperationId: op.clientOperationId,
          openingAmount,
          currentAmount: openingAmount,
          status: CashRegisterStatus.OPEN,
          notes,
          createdBy: actor.userId,
          updatedBy: actor.userId,
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return this.rej(op, 'CASH_ALREADY_OPEN', 'Conflicto de unicidad al abrir caja (OPEN/device o registerNumber)');
      }
      throw err;
    }

    await tx.cashMovement.create({
      data: {
        businessId: actor.businessId,
        cashRegisterId: cash.id,
        userId: actor.userId,
        movementType: CashMovementType.OPENING,
        amount: openingAmount,
        balanceAfter: openingAmount,
        clientOperationId: op.clientOperationId,
        notes: notes ?? `CASH_OPEN ${op.clientOperationId}`,
      },
    });

    await tx.auditCashRegister.create({
      data: {
        cashRegisterId: cash.id,
        userId: actor.userId,
        action: 'OPEN',
        amount: openingAmount,
        details: `Sync CASH_OPEN device=${deviceId}`,
      },
    });

    const lease = issueCashLease({
      businessId: cash.businessId,
      userId: cash.userId,
      deviceId: cash.deviceId,
      cashRegisterId: cash.id,
      openingDate: cash.openingDate,
    });
    const pub = publicLeaseFields(lease);

    return {
      clientOperationId: op.clientOperationId,
      status: 'applied',
      operationType: 'CASH_OPEN',
      serverEntityId: cash.id,
      version: cash.version,
      idMappings: [
        { entityType: 'cashRegister', localEntityId: localCashId, serverId: cash.id },
      ],
      server: {
        registerNumber: cash.registerNumber,
        deviceId: cash.deviceId,
        openingAmount: openingAmount.toFixed(2),
        currentAmount: openingAmount.toFixed(2),
        status: cash.status,
        openingDate: cash.openingDate.toISOString(),
        ...pub,
      },
    };
  }

  async handleCashClose(
    tx: Tx,
    actor: TenantAuthUser,
    deviceId: string,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    const payload = op.payload || {};
    const cashRegisterId =
      payload.cashRegisterId != null ? Number(payload.cashRegisterId) : null;
    const closingAmountRaw = payload.closingAmount;
    const notes = typeof payload.notes === 'string' ? payload.notes : null;
    const baseVersion =
      op.baseVersion != null
        ? Number(op.baseVersion)
        : payload.baseVersion != null
          ? Number(payload.baseVersion)
          : null;

    if (!cashRegisterId || Number.isNaN(cashRegisterId)) {
      return this.rej(op, 'VALIDATION', 'cashRegisterId requerido');
    }
    if (closingAmountRaw == null || Number.isNaN(Number(closingAmountRaw))) {
      return this.rej(op, 'VALIDATION', 'closingAmount numérico requerido');
    }
    const closingAmount = money(closingAmountRaw);
    if (closingAmount.lt(0)) {
      return this.rej(op, 'VALIDATION', 'closingAmount no puede ser negativo');
    }

    const cash = await tx.cashRegister.findFirst({
      where: {
        id: cashRegisterId,
        businessId: actor.businessId,
        deletedAt: null,
      },
    });
    if (!cash) {
      return this.rej(op, 'NOT_FOUND', 'Caja no encontrada');
    }
    if (cash.userId !== actor.userId || cash.deviceId !== deviceId) {
      return this.rej(op, 'FORBIDDEN', 'Caja no pertenece a este usuario/dispositivo');
    }
    if (cash.status !== CashRegisterStatus.OPEN) {
      return this.rej(op, 'CASH_CLOSED', 'La caja ya no está OPEN');
    }
    if (baseVersion != null && cash.version !== baseVersion) {
      return {
        clientOperationId: op.clientOperationId,
        status: 'conflict',
        operationType: 'CASH_CLOSE',
        code: 'VERSION_CONFLICT',
        retryable: false,
        server: { serverEntityId: cash.id, version: cash.version, status: cash.status },
      };
    }

    const expected = money(cash.currentAmount);
    const difference = closingAmount.minus(expected);

    const updated = await tx.cashRegister.updateMany({
      where: {
        id: cash.id,
        businessId: actor.businessId,
        userId: actor.userId,
        deviceId,
        status: CashRegisterStatus.OPEN,
        version: cash.version,
        deletedAt: null,
      },
      data: {
        status: CashRegisterStatus.CLOSED,
        closingAmount,
        closingDate: new Date(),
        notes: notes ?? cash.notes,
        version: { increment: 1 },
        updatedBy: actor.userId,
        updatedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      const fresh = await tx.cashRegister.findFirst({ where: { id: cash.id } });
      return {
        clientOperationId: op.clientOperationId,
        status: 'conflict',
        operationType: 'CASH_CLOSE',
        code: 'VERSION_CONFLICT',
        retryable: false,
        server: {
          serverEntityId: cash.id,
          version: fresh?.version,
          status: fresh?.status,
        },
      };
    }

    await tx.cashMovement.create({
      data: {
        businessId: actor.businessId,
        cashRegisterId: cash.id,
        userId: actor.userId,
        movementType: CashMovementType.CLOSING_COUNT,
        amount: closingAmount,
        balanceAfter: closingAmount,
        clientOperationId: op.clientOperationId,
        notes:
          notes ??
          `CASH_CLOSE expected=${expected.toFixed(2)} counted=${closingAmount.toFixed(2)} diff=${difference.toFixed(2)}`,
      },
    });

    await tx.auditCashRegister.create({
      data: {
        cashRegisterId: cash.id,
        userId: actor.userId,
        action: 'CLOSE',
        amount: closingAmount,
        details: `Sync CASH_CLOSE diff=${difference.toFixed(2)}`,
      },
    });

    return {
      clientOperationId: op.clientOperationId,
      status: 'applied',
      operationType: 'CASH_CLOSE',
      serverEntityId: cash.id,
      version: cash.version + 1,
      server: {
        expectedAmount: expected.toFixed(2),
        closingAmount: closingAmount.toFixed(2),
        difference: difference.toFixed(2),
        status: 'CLOSED',
      },
    };
  }

  async handleSaleCreate(
    tx: Tx,
    actor: TenantAuthUser,
    deviceId: string,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    const payload = op.payload || {};
    const localSaleId = typeof payload.localSaleId === 'string' ? payload.localSaleId.trim() : '';
    const cashRegisterId =
      payload.cashRegisterId != null ? Number(payload.cashRegisterId) : null;
    const paymentMethod = String(payload.paymentMethod || '');
    const discountAmount = money(payload.discountAmount ?? 0);
    const notes = typeof payload.notes === 'string' ? payload.notes : null;
    const lines = Array.isArray(payload.lines) ? payload.lines : null;

    if (!localSaleId) {
      return this.rej(op, 'VALIDATION', 'localSaleId requerido');
    }
    if (!cashRegisterId || Number.isNaN(cashRegisterId)) {
      return this.rej(op, 'VALIDATION', 'cashRegisterId requerido');
    }
    if (paymentMethod !== 'CASH') {
      return this.rej(op, 'VALIDATION', 'MVP solo admite paymentMethod=CASH');
    }
    if (!lines || lines.length === 0) {
      return this.rej(op, 'VALIDATION', 'lines[] requerido');
    }
    if (discountAmount.lt(0)) {
      return this.rej(op, 'VALIDATION', 'discountAmount no puede ser negativo');
    }

    const cash = await tx.cashRegister.findFirst({
      where: {
        id: cashRegisterId,
        businessId: actor.businessId,
        deletedAt: null,
      },
    });
    if (!cash) {
      return this.rej(op, 'NOT_FOUND', 'Caja no encontrada');
    }
    if (cash.userId !== actor.userId || cash.deviceId !== deviceId) {
      return this.rej(op, 'FORBIDDEN', 'Caja no pertenece a este usuario/dispositivo');
    }
    if (cash.status !== CashRegisterStatus.OPEN) {
      return this.rej(op, 'CASH_CLOSED', 'Se requiere caja OPEN para vender');
    }

    // P2-C1.F1: si el cliente envía cashLeaseToken (ventas offline/provisionales), debe ser válido.
    // Ausencia = camino online compatible; no sustituye validaciones de caja/tenant/precio/stock.
    const leaseToken =
      typeof payload.cashLeaseToken === 'string' ? payload.cashLeaseToken.trim() : '';
    if (leaseToken) {
      const leaseCheck = verifyCashLeaseToken(leaseToken, {
        businessId: actor.businessId,
        userId: actor.userId,
        deviceId,
        cashRegisterId: cash.id,
      });
      if (leaseCheck.ok === false) {
        return this.rej(op, leaseCheck.code, leaseCheck.message);
      }
    }

    type PreparedLine = {
      bpId: number;
      productId: number;
      productName: string;
      sku: string | null;
      quantity: number;
      unitPrice: Decimal;
      taxRate: Decimal;
      taxAmount: Decimal;
      discountAmount: Decimal;
      totalPrice: Decimal;
      baseVersion: number;
      currentStock: number;
    };

    const prepared: PreparedLine[] = [];
    let subtotal = new Decimal(0);
    let taxTotal = new Decimal(0);

    for (const raw of lines) {
      const bpId = raw.businessProductId != null ? Number(raw.businessProductId) : null;
      const productId = raw.productId != null ? Number(raw.productId) : null;
      const quantity = Number(raw.quantity);
      const clientUnitPrice =
        raw.unitPrice != null ? money(raw.unitPrice) : null;
      const baseVersion = raw.baseVersion != null ? Number(raw.baseVersion) : null;
      const lineDiscount = money(raw.discountAmount ?? 0);

      if ((!bpId && !productId) || !quantity || quantity <= 0 || !Number.isInteger(quantity)) {
        return this.rej(op, 'VALIDATION', 'Cada línea requiere businessProductId|productId y quantity entero > 0');
      }
      if (baseVersion == null || Number.isNaN(baseVersion)) {
        return this.rej(op, 'VALIDATION', 'baseVersion requerido por línea');
      }
      if (clientUnitPrice == null) {
        return this.rej(op, 'VALIDATION', 'unitPrice requerido por línea (validación vs customPrice)');
      }
      if (lineDiscount.lt(0)) {
        return this.rej(op, 'VALIDATION', 'discountAmount de línea inválido');
      }

      const bp = await tx.businessProduct.findFirst({
        where: {
          deletedAt: null,
          businessId: actor.businessId,
          ...(bpId ? { id: bpId } : { productId: productId! }),
        },
        include: { product: true },
      });
      if (!bp || !bp.product) {
        return this.rej(op, 'NOT_FOUND', 'BusinessProduct activo no encontrado para la empresa');
      }
      if (bp.product.deletedAt != null) {
        return this.rej(op, 'NOT_FOUND', 'Producto eliminado');
      }
      if (bp.version !== baseVersion) {
        return {
          clientOperationId: op.clientOperationId,
          status: 'conflict',
          operationType: 'SALE_CREATE',
          code: 'VERSION_CONFLICT',
          retryable: false,
          server: {
            businessProductId: bp.id,
            version: bp.version,
            currentStock: bp.currentStock,
            customPrice: money(bp.customPrice).toFixed(2),
          },
        };
      }

      const authorizedPrice = money(bp.customPrice);
      if (!sameMoney(clientUnitPrice, authorizedPrice)) {
        return this.rej(
          op,
          'PRICE_MISMATCH',
          `Precio no autorizado. Esperado ${authorizedPrice.toFixed(2)}, recibido ${clientUnitPrice.toFixed(2)}`
        );
      }

      if (bp.currentStock < quantity) {
        return {
          clientOperationId: op.clientOperationId,
          status: 'rejected',
          operationType: 'SALE_CREATE',
          code: 'INSUFFICIENT_STOCK',
          message: `Stock insuficiente BP ${bp.id}. Disponible: ${bp.currentStock}`,
          retryable: false,
          server: { businessProductId: bp.id, currentStock: bp.currentStock, version: bp.version },
        };
      }

      const taxRate = money(bp.product.taxRate ?? 13);
      const lineSub = authorizedPrice.mul(quantity);
      const lineTax = lineSub.mul(taxRate).div(100);
      const lineTotal = lineSub.plus(lineTax).minus(lineDiscount);
      if (lineTotal.lt(0)) {
        return this.rej(op, 'VALIDATION', 'total de línea inválido');
      }

      subtotal = subtotal.plus(lineSub);
      taxTotal = taxTotal.plus(lineTax);
      prepared.push({
        bpId: bp.id,
        productId: bp.productId,
        productName: bp.product.name.slice(0, 200),
        sku: bp.product.sku ? bp.product.sku.slice(0, 100) : null,
        quantity,
        unitPrice: authorizedPrice,
        taxRate,
        taxAmount: lineTax,
        discountAmount: lineDiscount,
        totalPrice: lineTotal,
        baseVersion,
        currentStock: bp.currentStock,
      });
    }

    const totalAmount = subtotal.plus(taxTotal).minus(discountAmount);
    if (totalAmount.lt(0)) {
      return this.rej(op, 'VALIDATION', 'totalAmount inválido');
    }

    // Stock CAS por línea (anti-oversell)
    for (const line of prepared) {
      const newStock = line.currentStock - line.quantity;
      const updated = await tx.businessProduct.updateMany({
        where: {
          id: line.bpId,
          businessId: actor.businessId,
          deletedAt: null,
          version: line.baseVersion,
          currentStock: line.currentStock,
        },
        data: {
          currentStock: newStock,
          availableStock: Math.max(0, newStock),
          version: { increment: 1 },
          updatedAt: new Date(),
        },
      });
      if (updated.count !== 1) {
        const fresh = await tx.businessProduct.findFirst({ where: { id: line.bpId } });
        if (fresh && fresh.currentStock < line.quantity) {
          return {
            clientOperationId: op.clientOperationId,
            status: 'rejected',
            operationType: 'SALE_CREATE',
            code: 'INSUFFICIENT_STOCK',
            message: `Stock insuficiente bajo concurrencia BP ${line.bpId}`,
            retryable: false,
            server: {
              businessProductId: line.bpId,
              currentStock: fresh.currentStock,
              version: fresh.version,
            },
          };
        }
        return {
          clientOperationId: op.clientOperationId,
          status: 'conflict',
          operationType: 'SALE_CREATE',
          code: 'VERSION_CONFLICT',
          retryable: false,
          server: {
            businessProductId: line.bpId,
            version: fresh?.version,
            currentStock: fresh?.currentStock,
          },
        };
      }
    }

    // Numeración comercial (lock de fila)
    const seqRows = await tx.$queryRaw<
      Array<{ current_number: number; prefix: string }>
    >`
      UPDATE business_document_sequences
      SET current_number = current_number + 1, updated_at = NOW()
      WHERE business_id = ${actor.businessId} AND doc_type = 'COMMERCIAL_TICKET'
      RETURNING current_number, prefix
    `;
    if (!seqRows.length) {
      return this.rej(op, 'VALIDATION', 'Secuencia COMMERCIAL_TICKET no configurada para la empresa');
    }
    const n = seqRows[0].current_number;
    const prefix = seqRows[0].prefix || 'COM';
    const commercialNumber = `${prefix}-${String(n).padStart(8, '0')}`;

    const sale = await tx.sale.create({
      data: {
        businessId: actor.businessId,
        cartId: null,
        userId: actor.userId,
        customerId:
          payload.customerId != null && !Number.isNaN(Number(payload.customerId))
            ? Number(payload.customerId)
            : null,
        invoiceNumber: null,
        commercialNumber,
        documentKind: 'COMMERCIAL_TICKET',
        isFiscal: false,
        clientOperationId: op.clientOperationId,
        deviceId,
        invoiceType: InvoiceType.NOTA_SIMPLE,
        status: SaleStatus.COMPLETED,
        subtotal,
        taxAmount: taxTotal,
        discountAmount,
        totalAmount,
        paymentMethod: PaymentMethod.CASH,
        paymentStatus: PaymentStatus.PAID,
        notes,
        cashRegisterId: cash.id,
        createdBy: actor.userId,
        updatedBy: actor.userId,
      },
    });

    for (const line of prepared) {
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: line.productId,
          productName: line.productName,
          sku: line.sku,
          businessProductId: line.bpId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxAmount: line.taxAmount,
          discountAmount: line.discountAmount,
          totalPrice: line.totalPrice,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          businessId: actor.businessId,
          productId: line.productId,
          userId: actor.userId,
          transactionType: InventoryTransactionType.SALE,
          quantity: -line.quantity,
          unitCost: line.unitPrice,
          totalCost: line.totalPrice,
          referenceId: sale.id,
          referenceType: 'sale',
          notes: `SALE_CREATE ${commercialNumber} ${op.clientOperationId}`,
        },
      });
    }

    const newCashBalance = money(cash.currentAmount).plus(totalAmount);
    const cashUpd = await tx.cashRegister.updateMany({
      where: {
        id: cash.id,
        businessId: actor.businessId,
        status: CashRegisterStatus.OPEN,
        version: cash.version,
        deletedAt: null,
      },
      data: {
        currentAmount: newCashBalance,
        version: { increment: 1 },
        updatedAt: new Date(),
        updatedBy: actor.userId,
      },
    });
    if (cashUpd.count !== 1) {
      // No debería ocurrir en la misma tx si nadie más tocó la caja; forzar fallo atómico
      throw new Error('CASH_REGISTER_CONCURRENT_UPDATE');
    }

    await tx.cashMovement.create({
      data: {
        businessId: actor.businessId,
        cashRegisterId: cash.id,
        userId: actor.userId,
        movementType: CashMovementType.SALE_CASH,
        amount: totalAmount,
        balanceAfter: newCashBalance,
        saleId: sale.id,
        clientOperationId: op.clientOperationId,
        notes: `SALE_CASH ${commercialNumber}`,
      },
    });

    return {
      clientOperationId: op.clientOperationId,
      status: 'applied',
      operationType: 'SALE_CREATE',
      serverEntityId: sale.id,
      idMappings: [
        { entityType: 'sale', localEntityId: localSaleId, serverId: sale.id },
      ],
      server: {
        commercialNumber,
        invoiceNumber: null,
        documentKind: 'COMMERCIAL_TICKET',
        isFiscal: false,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxTotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        lines: prepared.map((l) => ({
          businessProductId: l.bpId,
          quantity: l.quantity,
          unitPrice: l.unitPrice.toFixed(2),
          taxRate: l.taxRate.toFixed(2),
          taxAmount: l.taxAmount.toFixed(2),
          lineSubtotal: l.unitPrice.mul(l.quantity).toFixed(2),
          lineTotal: l.totalPrice.toFixed(2),
          productName: l.productName,
        })),
        cashRegisterId: cash.id,
        cashVersion: cash.version + 1,
        currentAmount: newCashBalance.toFixed(2),
      },
    };
  }
}
