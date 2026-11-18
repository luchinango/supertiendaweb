/**
 * Ventas POS durable + outbox — P2-C1.C.
 * Persiste LocalSale + SALE_CREATE atómicamente. No inventa commercialNumber.
 */
import { openOfflineDb } from '@/lib/offline/db';
import { assertMutationsAllowed } from '@/lib/offline/sessionGate';
import { newUuid } from '@/lib/offline/scope';
import { createBrowserPushTransport, runPushCycle } from '@/lib/offline/syncPushWorker';
import { broadcastSyncEvent } from '@/lib/offline/syncLock';
import type { LocalSale, LocalSaleLine, OutboxOperation, TenantScope } from '@/lib/offline/types';
import { OfflineStorageError } from '@/lib/offline/types';
import { assertOfflineCashAuthorized } from './posCashAuth';
import {
  clearPendingSale,
  loadPendingSale,
  type PendingSaleRecord,
  type PosSaleLineInput,
} from './posOnlineService';
import { computeChange, computeCommercialTotals } from './commercialTotals';

function mapQuota(err: unknown): never {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'QuotaExceededError') {
    throw new OfflineStorageError('Cuota IndexedDB excedida', 'QUOTA_EXCEEDED');
  }
  throw err as Error;
}

export type PersistSaleInput = {
  clientOperationId?: string;
  localSaleId?: string;
  cashRegisterId: number;
  lines: LocalSaleLine[];
  cashReceived: number;
  discountAmount?: number;
  notes?: string | null;
};

/** Payload canónico enviado a /sync/push (sin campos solo-UI). */
export function buildSaleCreatePayload(
  sale: LocalSale,
  cashLeaseToken?: string | null
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    localSaleId: sale.localId,
    cashRegisterId: sale.cashRegisterId,
    paymentMethod: 'CASH',
    discountAmount: sale.discountAmount,
    notes: sale.notes,
    lines: sale.lines.map((l) => ({
      businessProductId: l.businessProductId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      baseVersion: l.baseVersion,
    })),
  };
  if (cashLeaseToken) {
    payload['cashLeaseToken'] = cashLeaseToken;
  }
  return payload;
}

/**
 * Persiste venta provisional + outbox SALE_CREATE en una transacción.
 * Requiere caja OPEN confirmada (política offline) aunque haya red.
 */
export async function persistSaleCreate(
  scope: TenantScope,
  input: PersistSaleInput
): Promise<{ sale: LocalSale; outbox: OutboxOperation }> {
  assertMutationsAllowed();
  const cash = await assertOfflineCashAuthorized(scope);
  if (cash.serverId !== input.cashRegisterId) {
    throw new OfflineStorageError(
      'cashRegisterId no coincide con la caja OPEN local confirmada',
      'VALIDATION'
    );
  }

  if (!input.lines.length) {
    throw new OfflineStorageError('Venta sin líneas', 'VALIDATION');
  }
  for (const l of input.lines) {
    if (!Number.isFinite(l.quantity) || l.quantity <= 0 || Math.floor(l.quantity) !== l.quantity) {
      throw new OfflineStorageError('Cantidad inválida', 'VALIDATION');
    }
    if (!Number.isFinite(l.unitPrice) || l.unitPrice < 0) {
      throw new OfflineStorageError('Precio inválido', 'VALIDATION');
    }
  }

  const discount = input.discountAmount ?? 0;
  const totals = computeCommercialTotals(
    input.lines.map((l) => ({
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: l.taxRate,
      name: l.productName,
    })),
    discount
  );
  const provisionalTotal = totals.totalAmount;
  if (!Number.isFinite(input.cashReceived) || input.cashReceived < provisionalTotal) {
    throw new OfflineStorageError(
      `Efectivo recibido insuficiente (total c/IVA Bs ${provisionalTotal.toFixed(2)})`,
      'VALIDATION'
    );
  }

  const now = new Date().toISOString();
  const clientOperationId = input.clientOperationId || newUuid();
  const localSaleId = input.localSaleId || newUuid();
  const change = computeChange(input.cashReceived, provisionalTotal);

  const sale: LocalSale = {
    localId: localSaleId,
    clientOperationId,
    businessId: scope.businessId,
    userId: scope.userId,
    deviceId: scope.deviceId,
    cashRegisterId: input.cashRegisterId,
    lines: input.lines,
    discountAmount: discount,
    provisionalTotal,
    provisionalSubtotal: totals.subtotal,
    provisionalTax: totals.taxAmount,
    cashReceived: input.cashReceived,
    change,
    paymentMethod: 'CASH',
    notes: input.notes ?? null,
    createdAtLocal: now,
    syncStatus: 'pending',
    lastError: null,
    lastErrorCode: null,
    serverSaleId: null,
    commercialNumber: null,
    confirmedAt: null,
    serverResult: null,
  };

  if (!cash.cashLeaseToken) {
    throw new OfflineStorageError(
      'Cash lease requerido para encolar venta offline',
      'VALIDATION'
    );
  }

  const op: OutboxOperation = {
    clientOperationId,
    operationType: 'SALE_CREATE',
    payload: buildSaleCreatePayload(sale, cash.cashLeaseToken),
    baseVersion: null,
    dependsOn: [],
    createdAt: now,
    status: 'pending',
    attempts: 0,
    nextAttemptAt: now,
    lastError: null,
    lastErrorCode: null,
    localEntityId: localSaleId,
    localEntityType: 'sale',
    serverEntityId: null,
    serverResult: null,
    businessId: scope.businessId,
    userId: scope.userId,
    deviceId: scope.deviceId,
  };

  const db = await openOfflineDb(scope);
  try {
    await db.transaction('rw', db.sales, db.outbox, async () => {
      const existingOp = await db.outbox.get(clientOperationId);
      if (existingOp) {
        return;
      }
      const existingSale = await db.sales.get(localSaleId);
      if (existingSale) {
        return;
      }
      await db.sales.put(sale);
      await db.outbox.put(op);
    });
  } catch (e) {
    mapQuota(e);
  }

  const storedSale = await db.sales.get(localSaleId);
  const storedOp = await db.outbox.get(clientOperationId);
  if (!storedSale || !storedOp) {
    throw new OfflineStorageError('No se pudo persistir la venta offline', 'IDB_UNAVAILABLE');
  }

  broadcastSyncEvent(scope, { type: 'outbox-changed' });
  return { sale: storedSale, outbox: storedOp };
}

export async function listLocalSales(scope: TenantScope): Promise<LocalSale[]> {
  const db = await openOfflineDb(scope);
  const rows = await db.sales.where('businessId').equals(scope.businessId).toArray();
  return rows
    .filter((s) => s.userId === scope.userId && s.deviceId === scope.deviceId)
    .sort((a, b) => b.createdAtLocal.localeCompare(a.createdAtLocal));
}

export async function listPendingLocalSales(scope: TenantScope): Promise<LocalSale[]> {
  const all = await listLocalSales(scope);
  return all.filter((s) => s.syncStatus === 'pending' || s.syncStatus === 'sending');
}

/** Ventas ya confirmadas (COM visible en POS tras sync — P2-C1.G2). */
export async function listRecentConfirmedLocalSales(
  scope: TenantScope,
  limit = 8
): Promise<LocalSale[]> {
  const all = await listLocalSales(scope);
  return all
    .filter((s) => s.syncStatus === 'confirmed' && !!s.commercialNumber)
    .slice(0, Math.max(1, limit));
}

/** Ventas locales problemáticas para bandeja de jornada (P2-C1.G4). */
export async function listProblemLocalSales(scope: TenantScope): Promise<LocalSale[]> {
  const all = await listLocalSales(scope);
  return all.filter(
    (s) =>
      s.syncStatus === 'rejected' ||
      s.syncStatus === 'conflict' ||
      s.syncStatus === 'dead'
  );
}

export async function getLocalSaleByClientOp(
  scope: TenantScope,
  clientOperationId: string
): Promise<LocalSale | null> {
  const db = await openOfflineDb(scope);
  const rows = await db.sales.where('clientOperationId').equals(clientOperationId).toArray();
  return rows[0] ?? null;
}

/**
 * Migra pending B2-B (sessionStorage) → IndexedDB sin duplicar UUID.
 */
export async function migrateSessionPendingSale(scope: TenantScope): Promise<LocalSale | null> {
  const pending = loadPendingSale();
  if (!pending) return null;
  if (pending.businessId !== scope.businessId || pending.deviceId !== scope.deviceId) {
    return null;
  }

  const existing = await getLocalSaleByClientOp(scope, pending.clientOperationId);
  if (existing) {
    clearPendingSale();
    return existing;
  }

  const lines: LocalSaleLine[] = pending.lines.map((l: PosSaleLineInput) => ({
    businessProductId: l.businessProductId,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    baseVersion: l.baseVersion,
    productName: l.productName,
    sku: l.sku ?? null,
  }));

  try {
    const { sale } = await persistSaleCreate(scope, {
      clientOperationId: pending.clientOperationId,
      localSaleId: pending.localSaleId,
      cashRegisterId: pending.cashRegisterId,
      lines,
      cashReceived: pending.cashReceived,
      notes: 'Migrado desde pending sessionStorage (B2-B)',
    });
    clearPendingSale();
    return sale;
  } catch {
    // Si falla (p.ej. caja auth), conservar sessionStorage para no perder el UUID.
    return null;
  }
}

/** Intenta empujar outbox (incluye SALE_CREATE). Idempotente. */
export async function flushPosOutbox(args: {
  scope: TenantScope;
  accessToken: string;
}): Promise<{ pushed: number; results: import('@/lib/offline/types').SyncPushResultItem[] }> {
  const transport = createBrowserPushTransport();
  const result = await runPushCycle({
    scope: args.scope,
    accessToken: args.accessToken,
    tokenBusinessId: args.scope.businessId,
    transport,
  });
  return { pushed: result.sent, results: result.results };
}

export function pendingRecordFromSale(sale: LocalSale): PendingSaleRecord {
  return {
    clientOperationId: sale.clientOperationId,
    localSaleId: sale.localId,
    cashRegisterId: sale.cashRegisterId,
    businessId: sale.businessId,
    deviceId: sale.deviceId,
    lines: sale.lines.map((l) => ({
      businessProductId: l.businessProductId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      baseVersion: l.baseVersion,
      productName: l.productName,
      sku: l.sku,
    })),
    cashReceived: sale.cashReceived,
    createdAt: sale.createdAtLocal,
  };
}

/** Qty reservada por ventas SALE_CREATE aún no acked (por businessProductId). */
export async function pendingSaleQtyByBp(scope: TenantScope): Promise<Map<number, number>> {
  const db = await openOfflineDb(scope);
  const ops = await db.outbox.where('businessId').equals(scope.businessId).toArray();
  const map = new Map<number, number>();
  for (const op of ops) {
    if (op.userId !== scope.userId || op.deviceId !== scope.deviceId) continue;
    if (op.operationType !== 'SALE_CREATE') continue;
    if (!['pending', 'sending'].includes(op.status)) continue;
    const lines = op.payload['lines'];
    if (!Array.isArray(lines)) continue;
    for (const raw of lines) {
      const line = raw as Record<string, unknown>;
      const bpId = Number(line['businessProductId']);
      const qty = Number(line['quantity']);
      if (!Number.isFinite(bpId) || !Number.isFinite(qty) || qty <= 0) continue;
      map.set(bpId, (map.get(bpId) || 0) + qty);
    }
  }
  return map;
}
