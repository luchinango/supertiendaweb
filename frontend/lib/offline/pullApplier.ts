import type { SuperTiendaOfflineDb } from './db';
import { openOfflineDb } from './db';
import { newUuid } from './scope';
import type {
  LocalBusinessProduct,
  LocalCategory,
  LocalProduct,
  OfflineEntityType,
  SyncPullChange,
  TenantScope,
} from './types';

export function serverLocalId(entityType: OfflineEntityType, serverId: number): string {
  return `srv:${entityType}:${serverId}`;
}

async function findByServerId(
  db: SuperTiendaOfflineDb,
  entityType: OfflineEntityType,
  serverId: number
): Promise<{ localId: string; syncStatus: string; version: number } | null> {
  if (entityType === 'product') {
    const rows = await db.products.where('serverId').equals(serverId).toArray();
    const row = rows[0];
    return row ? { localId: row.localId, syncStatus: row.syncStatus, version: row.version } : null;
  }
  if (entityType === 'category') {
    const rows = await db.categories.where('serverId').equals(serverId).toArray();
    const row = rows[0];
    return row ? { localId: row.localId, syncStatus: row.syncStatus, version: row.version } : null;
  }
  const rows = await db.businessProducts.where('serverId').equals(serverId).toArray();
  const row = rows[0];
  return row ? { localId: row.localId, syncStatus: row.syncStatus, version: row.version } : null;
}

function isProtectedStatus(status: string): boolean {
  return status === 'pending' || status === 'conflict';
}

/**
 * Aplica changes[] del pull al store local.
 * No sobrescribe entidades con syncStatus pending|conflict (salvo tombstone remoto
 * sobre fila ya mapeada a serverId cuando no hay outbox pendiente de esa entidad —
 * la protección pending/conflict gana siempre).
 */
export async function applyPullChanges(
  scope: TenantScope,
  changes: SyncPullChange[]
): Promise<{ applied: number; skippedLocalPending: number }> {
  const db = await openOfflineDb(scope);
  let applied = 0;
  let skippedLocalPending = 0;
  const now = new Date().toISOString();

  await db.transaction(
    'rw',
    db.products,
    db.categories,
    db.businessProducts,
    db.idMap,
    async () => {
      for (const ch of changes) {
        const existing = await findByServerId(db, ch.entityType, ch.serverId);
        if (existing && isProtectedStatus(existing.syncStatus)) {
          skippedLocalPending += 1;
          continue;
        }

        // Idempotencia: misma versión ya aplicada → no-op
        if (existing && existing.version === ch.version && !ch.deleted) {
          continue;
        }
        if (existing && ch.deleted) {
          // tombstone
        } else if (existing && existing.version > ch.version) {
          // local synced newer than pull page (raro) — no degradar
          continue;
        }

        const localId = existing?.localId ?? serverLocalId(ch.entityType, ch.serverId);

        if (ch.entityType === 'category') {
          const row: LocalCategory = {
            localId,
            serverId: ch.serverId,
            businessId: scope.businessId,
            payload: ch.deleted ? {} : { ...(ch.payload || {}) },
            version: ch.version,
            updatedAtLocal: now,
            updatedAtServer: ch.updatedAt,
            syncStatus: ch.deleted ? 'tombstone' : 'synced',
            deleted: ch.deleted,
          };
          await db.categories.put(row);
          await db.idMap.put({
            key: `category:${localId}`,
            entityType: 'category',
            localId,
            serverId: ch.serverId,
            mappedAt: now,
            businessId: scope.businessId,
          });
          applied += 1;
          continue;
        }

        if (ch.entityType === 'product') {
          const row: LocalProduct = {
            localId,
            serverId: ch.serverId,
            businessId: scope.businessId,
            payload: ch.deleted ? {} : { ...(ch.payload || {}) },
            version: ch.version,
            updatedAtLocal: now,
            updatedAtServer: ch.updatedAt,
            syncStatus: ch.deleted ? 'tombstone' : 'synced',
            deleted: ch.deleted,
          };
          await db.products.put(row);
          await db.idMap.put({
            key: `product:${localId}`,
            entityType: 'product',
            localId,
            serverId: ch.serverId,
            mappedAt: now,
            businessId: scope.businessId,
          });
          applied += 1;
          continue;
        }

        // businessProduct
        const productServerId =
          ch.payload && typeof ch.payload['productId'] === 'number'
            ? (ch.payload['productId'] as number)
            : null;
        const row: LocalBusinessProduct = {
          localId,
          serverId: ch.serverId,
          businessId: scope.businessId,
          productServerId,
          productLocalId: productServerId != null ? serverLocalId('product', productServerId) : null,
          payload: ch.deleted
            ? { productId: productServerId }
            : { ...(ch.payload || {}) },
          version: ch.version,
          updatedAtLocal: now,
          updatedAtServer: ch.updatedAt,
          syncStatus: ch.deleted ? 'tombstone' : 'synced',
          deleted: ch.deleted,
        };
        await db.businessProducts.put(row);
        await db.idMap.put({
          key: `businessProduct:${localId}`,
          entityType: 'businessProduct',
          localId,
          serverId: ch.serverId,
          mappedAt: now,
          businessId: scope.businessId,
        });
        applied += 1;
      }
    }
  );

  return { applied, skippedLocalPending };
}

/** Solo tests / harness: genera UUID local nuevo (no server-prefixed). */
export { newUuid };
