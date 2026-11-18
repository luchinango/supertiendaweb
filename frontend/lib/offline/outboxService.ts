import type { SuperTiendaOfflineDb } from './db';
import { openOfflineDb } from './db';
import { assertMutationsAllowed } from './sessionGate';
import { newUuid } from './scope';
import type {
  LocalBusinessProduct,
  LocalCategory,
  LocalProduct,
  OfflineEntityType,
  OutboxOperation,
  SyncOperationType,
  TenantScope,
} from './types';
import { OfflineStorageError } from './types';

const MAX_ATTEMPTS_BEFORE_DEAD = 25;

export interface EnqueueMutationInput {
  operationType: SyncOperationType;
  payload: Record<string, unknown>;
  baseVersion?: number | null;
  dependsOn?: string[];
  clientOperationId?: string;
  /** Proyección local atómica (opcional por tipo). */
  localProduct?: Omit<LocalProduct, 'businessId' | 'updatedAtLocal' | 'syncStatus'> & {
    syncStatus?: LocalProduct['syncStatus'];
  };
  localCategory?: Omit<LocalCategory, 'businessId' | 'updatedAtLocal' | 'syncStatus'> & {
    syncStatus?: LocalCategory['syncStatus'];
  };
  localBusinessProduct?: Omit<LocalBusinessProduct, 'businessId' | 'updatedAtLocal' | 'syncStatus'> & {
    syncStatus?: LocalBusinessProduct['syncStatus'];
  };
  localEntityId?: string;
  localEntityType?: OfflineEntityType;
}

function mapQuota(err: unknown): never {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'QuotaExceededError') {
    throw new OfflineStorageError('Cuota IndexedDB excedida', 'QUOTA_EXCEEDED');
  }
  throw err as Error;
}

/**
 * Guarda atómicamente proyección local + fila outbox.
 * Nunca elimina ops pendientes/rechazadas/conflicto.
 */
export async function enqueueMutation(
  scope: TenantScope,
  input: EnqueueMutationInput
): Promise<OutboxOperation> {
  assertMutationsAllowed();
  const db = await openOfflineDb(scope);
  const now = new Date().toISOString();
  const clientOperationId = input.clientOperationId || newUuid();

  const op: OutboxOperation = {
    clientOperationId,
    operationType: input.operationType,
    payload: input.payload,
    baseVersion: input.baseVersion ?? null,
    dependsOn: input.dependsOn ?? [],
    createdAt: now,
    status: 'pending',
    attempts: 0,
    nextAttemptAt: now,
    lastError: null,
    lastErrorCode: null,
    localEntityId: input.localEntityId ?? input.localProduct?.localId ?? input.localCategory?.localId ?? input.localBusinessProduct?.localId ?? null,
    localEntityType: input.localEntityType ?? (input.localProduct ? 'product' : input.localCategory ? 'category' : input.localBusinessProduct ? 'businessProduct' : null),
    serverEntityId: null,
    serverResult: null,
    businessId: scope.businessId,
    userId: scope.userId,
    deviceId: scope.deviceId,
  };

  try {
    await db.transaction(
      'rw',
      db.products,
      db.categories,
      db.businessProducts,
      db.outbox,
      async () => {
        if (input.localProduct) {
          await db.products.put({
            ...input.localProduct,
            businessId: scope.businessId,
            updatedAtLocal: now,
            syncStatus: input.localProduct.syncStatus ?? 'pending',
            deleted: input.localProduct.deleted ?? false,
            version: input.localProduct.version ?? 0,
          });
        }
        if (input.localCategory) {
          await db.categories.put({
            ...input.localCategory,
            businessId: scope.businessId,
            updatedAtLocal: now,
            syncStatus: input.localCategory.syncStatus ?? 'pending',
            deleted: input.localCategory.deleted ?? false,
            version: input.localCategory.version ?? 0,
          });
        }
        if (input.localBusinessProduct) {
          await db.businessProducts.put({
            ...input.localBusinessProduct,
            businessId: scope.businessId,
            updatedAtLocal: now,
            syncStatus: input.localBusinessProduct.syncStatus ?? 'pending',
            deleted: input.localBusinessProduct.deleted ?? false,
            version: input.localBusinessProduct.version ?? 0,
          });
        }
        const existing = await db.outbox.get(clientOperationId);
        if (existing) {
          // No sobrescribir payload de op existente (idempotencia local).
          return;
        }
        await db.outbox.put(op);
      }
    );
  } catch (e) {
    mapQuota(e);
  }

  const stored = await db.outbox.get(clientOperationId);
  if (!stored) {
    throw new OfflineStorageError('No se pudo persistir la operación en outbox', 'IDB_UNAVAILABLE');
  }
  return stored;
}

export async function listOutbox(
  scope: TenantScope,
  statuses?: OutboxOperation['status'][]
): Promise<OutboxOperation[]> {
  const db = await openOfflineDb(scope);
  const all = await db.outbox.where('businessId').equals(scope.businessId).toArray();
  const filtered = all.filter((o) => o.userId === scope.userId && o.deviceId === scope.deviceId);
  if (!statuses?.length) return filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return filtered
    .filter((o) => statuses.includes(o.status))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function countOutboxByStatus(scope: TenantScope): Promise<Record<string, number>> {
  const ops = await listOutbox(scope);
  const counts: Record<string, number> = {};
  for (const o of ops) {
    counts[o.status] = (counts[o.status] || 0) + 1;
  }
  return counts;
}

/** Marca envío; no elimina. */
export async function markSending(db: SuperTiendaOfflineDb, ids: string[]): Promise<void> {
  const now = new Date().toISOString();
  await db.transaction('rw', db.outbox, db.sales, async () => {
    for (const id of ids) {
      const row = await db.outbox.get(id);
      if (!row || row.status !== 'pending') continue;
      await db.outbox.update(id, {
        status: 'sending',
        attempts: row.attempts + 1,
        nextAttemptAt: now,
      });
      if (row.operationType === 'SALE_CREATE' && row.localEntityId) {
        const sale = await db.sales.get(row.localEntityId);
        if (sale && (sale.syncStatus === 'pending' || sale.syncStatus === 'sending')) {
          await db.sales.put({ ...sale, syncStatus: 'sending' });
        }
      }
    }
  });
}

export async function applyPushResults(
  db: SuperTiendaOfflineDb,
  results: {
    clientOperationId: string;
    status: string;
    serverEntityId?: number;
    version?: number;
    idMappings?: { entityType: string; localEntityId: string; serverId: number }[];
    code?: string;
    message?: string;
    retryable?: boolean;
    server?: Record<string, unknown>;
  }[]
): Promise<void> {
  const now = new Date().toISOString();
  await db.transaction(
    'rw',
    [db.outbox, db.idMap, db.products, db.categories, db.businessProducts, db.sales],
    async () => {
      for (const r of results) {
        const row = await db.outbox.get(r.clientOperationId);
        if (!row) continue;

        if (r.status === 'applied' || r.status === 'duplicate') {
          await db.outbox.update(r.clientOperationId, {
            status: 'acked',
            serverEntityId: r.serverEntityId ?? row.serverEntityId,
            serverResult: r as unknown as Record<string, unknown>,
            lastError: null,
            lastErrorCode: null,
          });
          if (r.idMappings?.length) {
            for (const m of r.idMappings) {
              const entityType = m.entityType as OfflineEntityType;
              if (
                entityType !== 'product' &&
                entityType !== 'category' &&
                entityType !== 'businessProduct' &&
                entityType !== 'sale' &&
                entityType !== 'cashRegister'
              ) {
                continue;
              }
              await db.idMap.put({
                key: `${entityType}:${m.localEntityId}`,
                entityType,
                localId: m.localEntityId,
                serverId: m.serverId,
                mappedAt: now,
                businessId: row.businessId,
              });
              if (entityType === 'product') {
                const p = await db.products.get(m.localEntityId);
                if (p) {
                  await db.products.put({
                    ...p,
                    serverId: m.serverId,
                    version: r.version ?? p.version,
                    syncStatus: 'synced',
                    updatedAtServer: now,
                  });
                }
              }
              if (entityType === 'category') {
                const c = await db.categories.get(m.localEntityId);
                if (c) {
                  await db.categories.put({
                    ...c,
                    serverId: m.serverId,
                    version: r.version ?? c.version,
                    syncStatus: 'synced',
                    updatedAtServer: now,
                  });
                }
              }
              if (entityType === 'businessProduct') {
                const bp = await db.businessProducts.get(m.localEntityId);
                if (bp) {
                  await db.businessProducts.put({
                    ...bp,
                    serverId: m.serverId,
                    version: r.version ?? bp.version,
                    syncStatus: 'synced',
                    updatedAtServer: now,
                  });
                }
              }
            }
          } else if (r.serverEntityId != null && row.localEntityId && row.localEntityType) {
            await db.idMap.put({
              key: `${row.localEntityType}:${row.localEntityId}`,
              entityType: row.localEntityType,
              localId: row.localEntityId,
              serverId: r.serverEntityId,
              mappedAt: now,
              businessId: row.businessId,
            });
          }

          if (row.operationType === 'SALE_CREATE') {
            const saleId = row.localEntityId;
            if (saleId) {
              const sale = await db.sales.get(saleId);
              if (sale) {
                const server = (r.server || {}) as Record<string, unknown>;
                const commercial =
                  typeof server['commercialNumber'] === 'string'
                    ? server['commercialNumber']
                    : sale.commercialNumber;
                const confirmedTotal =
                  server['totalAmount'] != null && Number.isFinite(Number(server['totalAmount']))
                    ? Number(server['totalAmount'])
                    : null;
                const confirmedSubtotal =
                  server['subtotal'] != null && Number.isFinite(Number(server['subtotal']))
                    ? Number(server['subtotal'])
                    : null;
                const confirmedTax =
                  server['taxAmount'] != null && Number.isFinite(Number(server['taxAmount']))
                    ? Number(server['taxAmount'])
                    : null;
                const totalsAdjusted =
                  confirmedTotal != null &&
                  Math.abs(confirmedTotal - sale.provisionalTotal) > 0.009;
                const change =
                  confirmedTotal != null
                    ? Math.max(0, Math.round((sale.cashReceived - confirmedTotal) * 100) / 100)
                    : sale.change;
                await db.sales.put({
                  ...sale,
                  syncStatus: 'confirmed',
                  serverSaleId: r.serverEntityId ?? sale.serverSaleId,
                  commercialNumber: commercial ?? null,
                  confirmedAt: now,
                  confirmedTotal,
                  confirmedSubtotal,
                  confirmedTax,
                  totalsAdjusted,
                  // Conservar provisionalTotal intacto; actualizar cambio al total definitivo
                  change,
                  lastError: null,
                  lastErrorCode: null,
                  serverResult: r as unknown as Record<string, unknown>,
                });
              }
            }
          }
          continue;
        }

        if (r.status === 'conflict') {
          await db.outbox.update(r.clientOperationId, {
            status: 'conflict',
            lastError: r.message || 'VERSION_CONFLICT',
            lastErrorCode: r.code || 'VERSION_CONFLICT',
            serverResult: r as unknown as Record<string, unknown>,
          });
          if (row.localEntityId && row.localEntityType === 'product') {
            const p = await db.products.get(row.localEntityId);
            if (p) await db.products.put({ ...p, syncStatus: 'conflict' });
          }
          if (row.operationType === 'SALE_CREATE' && row.localEntityId) {
            const sale = await db.sales.get(row.localEntityId);
            if (sale) {
              await db.sales.put({
                ...sale,
                syncStatus: 'conflict',
                lastError: r.message || 'VERSION_CONFLICT',
                lastErrorCode: r.code || 'VERSION_CONFLICT',
                serverResult: r as unknown as Record<string, unknown>,
              });
            }
          }
          continue;
        }

        // rejected
        const definitive =
          r.retryable === false ||
          [
            'SKU_COLLISION',
            'FORBIDDEN_ROLE',
            'FORBIDDEN',
            'VALIDATION',
            'IDEMPOTENCY_PAYLOAD_MISMATCH',
            'NOT_FOUND',
            'PRICE_MISMATCH',
            'INSUFFICIENT_STOCK',
            'CASH_CLOSED',
          ].includes(r.code || '');
        const attempts = row.attempts;
        const nextStatus =
          definitive || attempts >= MAX_ATTEMPTS_BEFORE_DEAD
            ? definitive
              ? 'rejected'
              : 'dead'
            : 'pending';
        await db.outbox.update(r.clientOperationId, {
          status: nextStatus,
          lastError: r.message || r.code || 'rejected',
          lastErrorCode: r.code || 'REJECTED',
          serverResult: r as unknown as Record<string, unknown>,
          nextAttemptAt: definitive
            ? now
            : new Date(Date.now() + Math.min(60_000, 1000 * 2 ** Math.min(attempts, 6))).toISOString(),
        });

        if (row.operationType === 'SALE_CREATE' && row.localEntityId) {
          const sale = await db.sales.get(row.localEntityId);
          if (sale) {
            await db.sales.put({
              ...sale,
              syncStatus:
                nextStatus === 'pending'
                  ? 'pending'
                  : nextStatus === 'dead'
                    ? 'dead'
                    : 'rejected',
              lastError: r.message || r.code || 'rejected',
              lastErrorCode: r.code || 'REJECTED',
              serverResult: r as unknown as Record<string, unknown>,
            });
          }
        }
      }
    }
  );
}

/** Reintenta ops en sending huérfanas (crash mid-flight) → pending, mismo UUID. */
export async function recoverOrphanSending(scope: TenantScope): Promise<number> {
  const db = await openOfflineDb(scope);
  const sending = await db.outbox.where('status').equals('sending').toArray();
  let n = 0;
  for (const row of sending) {
    if (row.businessId !== scope.businessId || row.userId !== scope.userId) continue;
    await db.outbox.update(row.clientOperationId, {
      status: 'pending',
      nextAttemptAt: new Date().toISOString(),
    });
    if (row.operationType === 'SALE_CREATE' && row.localEntityId) {
      const sale = await db.sales.get(row.localEntityId);
      if (sale && sale.syncStatus === 'sending') {
        await db.sales.put({ ...sale, syncStatus: 'pending' });
      }
    }
    n += 1;
  }
  return n;
}

/**
 * API explícita: NUNCA borrar outbox automáticamente.
 * Solo tests pueden usar purgeOutboxForTests.
 */
export async function purgeOutboxForTests(scope: TenantScope): Promise<void> {
  const db = await openOfflineDb(scope);
  await db.outbox.clear();
}
