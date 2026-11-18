/**
 * Resumen de jornada/caja POS — solo lectura sobre tablas existentes (P2-C1.G4).
 * Sin migraciones. Autoridad: CashRegister + CashMovement + Sale.
 */
import { CashMovementType, CashRegisterStatus, Prisma } from '../../generated';
import prisma from '../config/prisma';
import { ForbiddenError, NotFoundError, ValidationError } from '../errors';
import type { TenantAuthUser } from '../helpers/tenantContext';

function moneyStr(v: Prisma.Decimal | number | string | null | undefined): string | null {
  if (v == null) return null;
  const n = typeof v === 'object' && v !== null && 'toFixed' in v ? Number(v.toString()) : Number(v);
  if (!Number.isFinite(n)) return null;
  return n.toFixed(2);
}

export type CashSessionEnvelopeDto = {
  session: CashSessionSummaryDto | null;
  /** Si la sesión activa es OPEN, opcionalmente la última CLOSED del mismo dispositivo. */
  previousClosed: CashSessionSummaryDto | null;
};

export type CashSessionSummaryDto = {
  source: 'server';
  cash: {
    id: number;
    businessId: number;
    userId: number;
    username: string | null;
    deviceId: string;
    registerNumber: string;
    status: string;
    version: number;
    openingAmount: string;
    currentAmount: string;
    closingAmount: string | null;
    openingDate: string;
    closingDate: string | null;
    notes: string | null;
  };
  totals: {
    /** Suma SALE_CASH de la caja (confirmados servidor). */
    saleCashTotal: string;
    cashInTotal: string;
    cashOutTotal: string;
    /** opening + SALE_CASH + CASH_IN − CASH_OUT (sin CLOSING_COUNT). */
    expectedFromMovements: string;
    /** currentAmount del registro (autoritativo en OPEN; en CLOSED sigue siendo el saldo de sistema). */
    expectedAmount: string;
    /** Solo si CLOSED. */
    countedAmount: string | null;
    /** counted − expected; solo si CLOSED y ambos conocidos. */
    difference: string | null;
    confirmedSalesCount: number;
    movementCount: number;
  };
  movements: Array<{
    id: number;
    movementType: string;
    amount: string;
    balanceAfter: string | null;
    saleId: number | null;
    commercialNumber: string | null;
    notes: string | null;
    createdAt: string;
  }>;
  confirmedSales: Array<{
    id: number;
    commercialNumber: string | null;
    totalAmount: string;
    paymentMethod: string;
    createdAt: string;
    clientOperationId: string | null;
  }>;
};

async function loadRegisterForActor(
  actor: TenantAuthUser,
  deviceId: string,
  cashRegisterId?: number | null
) {
  if (cashRegisterId != null && Number.isFinite(cashRegisterId) && cashRegisterId > 0) {
    const cash = await prisma.cashRegister.findFirst({
      where: {
        id: cashRegisterId,
        businessId: actor.businessId,
        deletedAt: null,
      },
    });
    if (!cash) throw new NotFoundError('Caja no encontrada');
    if (cash.userId !== actor.userId || cash.deviceId !== deviceId) {
      throw new ForbiddenError('Caja no pertenece a este usuario/dispositivo');
    }
    return cash;
  }

  let cash = await prisma.cashRegister.findFirst({
    where: {
      businessId: actor.businessId,
      userId: actor.userId,
      deviceId,
      status: CashRegisterStatus.OPEN,
      deletedAt: null,
    },
    orderBy: { id: 'desc' },
  });
  if (!cash) {
    cash = await prisma.cashRegister.findFirst({
      where: {
        businessId: actor.businessId,
        userId: actor.userId,
        deviceId,
        deletedAt: null,
      },
      orderBy: { id: 'desc' },
    });
  }
  return cash;
}

export async function getCashSessionEnvelope(
  actor: TenantAuthUser,
  deviceId: string,
  cashRegisterId?: number | null
): Promise<CashSessionEnvelopeDto> {
  const session = await getCashSessionSummary(actor, deviceId, cashRegisterId);
  let previousClosed: CashSessionSummaryDto | null = null;
  if (session && session.cash.status === 'OPEN' && (cashRegisterId == null || !cashRegisterId)) {
    const prev = await prisma.cashRegister.findFirst({
      where: {
        businessId: actor.businessId,
        userId: actor.userId,
        deviceId,
        status: CashRegisterStatus.CLOSED,
        deletedAt: null,
        id: { not: session.cash.id },
      },
      orderBy: { id: 'desc' },
    });
    if (prev) {
      previousClosed = await getCashSessionSummary(actor, deviceId, prev.id);
    }
  }
  return { session, previousClosed };
}

export async function getCashSessionSummary(
  actor: TenantAuthUser,
  deviceId: string,
  cashRegisterId?: number | null
): Promise<CashSessionSummaryDto | null> {
  if (!deviceId?.trim()) {
    throw new ValidationError('Header X-Device-Id es obligatorio');
  }

  const cash = await loadRegisterForActor(actor, deviceId, cashRegisterId);

  if (!cash) return null;

  const user = await prisma.user.findFirst({
    where: { id: cash.userId },
    select: { username: true },
  });

  const movements = await prisma.cashMovement.findMany({
    where: {
      businessId: actor.businessId,
      cashRegisterId: cash.id,
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sale: { select: { commercialNumber: true } },
    },
  });

  const sales = await prisma.sale.findMany({
    where: {
      businessId: actor.businessId,
      cashRegisterId: cash.id,
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      commercialNumber: true,
      totalAmount: true,
      paymentMethod: true,
      createdAt: true,
      clientOperationId: true,
    },
  });

  let saleCash = new Prisma.Decimal(0);
  let cashIn = new Prisma.Decimal(0);
  let cashOut = new Prisma.Decimal(0);
  for (const m of movements) {
    const amt = new Prisma.Decimal(m.amount);
    if (m.movementType === CashMovementType.SALE_CASH) saleCash = saleCash.plus(amt);
    else if (m.movementType === CashMovementType.CASH_IN) cashIn = cashIn.plus(amt);
    else if (m.movementType === CashMovementType.CASH_OUT) cashOut = cashOut.plus(amt);
  }

  const opening = new Prisma.Decimal(cash.openingAmount);
  const expectedFromMovements = opening.plus(saleCash).plus(cashIn).minus(cashOut);
  const expectedAmount = new Prisma.Decimal(cash.currentAmount);
  const counted =
    cash.status === CashRegisterStatus.CLOSED && cash.closingAmount != null
      ? new Prisma.Decimal(cash.closingAmount)
      : null;
  const difference = counted != null ? counted.minus(expectedAmount) : null;

  return {
    source: 'server',
    cash: {
      id: cash.id,
      businessId: cash.businessId,
      userId: cash.userId,
      username: user?.username ?? null,
      deviceId: cash.deviceId,
      registerNumber: cash.registerNumber,
      status: cash.status,
      version: cash.version,
      openingAmount: opening.toFixed(2),
      currentAmount: expectedAmount.toFixed(2),
      closingAmount: moneyStr(cash.closingAmount),
      openingDate: cash.openingDate.toISOString(),
      closingDate: cash.closingDate ? cash.closingDate.toISOString() : null,
      notes: cash.notes,
    },
    totals: {
      saleCashTotal: saleCash.toFixed(2),
      cashInTotal: cashIn.toFixed(2),
      cashOutTotal: cashOut.toFixed(2),
      expectedFromMovements: expectedFromMovements.toFixed(2),
      expectedAmount: expectedAmount.toFixed(2),
      countedAmount: counted ? counted.toFixed(2) : null,
      difference: difference ? difference.toFixed(2) : null,
      confirmedSalesCount: sales.length,
      movementCount: movements.length,
    },
    movements: movements.map((m) => ({
      id: m.id,
      movementType: m.movementType,
      amount: new Prisma.Decimal(m.amount).toFixed(2),
      balanceAfter: moneyStr(m.balanceAfter),
      saleId: m.saleId,
      commercialNumber: m.sale?.commercialNumber ?? null,
      notes: m.notes,
      createdAt: m.createdAt.toISOString(),
    })),
    confirmedSales: sales.map((s) => ({
      id: s.id,
      commercialNumber: s.commercialNumber,
      totalAmount: new Prisma.Decimal(s.totalAmount).toFixed(2),
      paymentMethod: String(s.paymentMethod),
      createdAt: s.createdAt.toISOString(),
      clientOperationId: s.clientOperationId,
    })),
  };
}
