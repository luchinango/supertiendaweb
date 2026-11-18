import Dexie, { type Table } from 'dexie';
import type {
  DeviceMetaRow,
  IdMappingRow,
  LocalBusinessProduct,
  LocalCashRegister,
  LocalCategory,
  LocalProduct,
  LocalSale,
  OutboxOperation,
  SyncStateRow,
  TenantScope,
} from './types';
import { OfflineStorageError } from './types';
import { assertBrowser, buildDbName } from './scope';

export class SuperTiendaOfflineDb extends Dexie {
  products!: Table<LocalProduct, string>;
  categories!: Table<LocalCategory, string>;
  businessProducts!: Table<LocalBusinessProduct, string>;
  outbox!: Table<OutboxOperation, string>;
  idMap!: Table<IdMappingRow, string>;
  syncState!: Table<SyncStateRow, string>;
  deviceMeta!: Table<DeviceMetaRow, string>;
  /** P2-C1.C */
  sales!: Table<LocalSale, string>;
  cashRegisters!: Table<LocalCashRegister, number>;

  readonly scope: TenantScope;

  constructor(scope: TenantScope) {
    super(buildDbName(scope));
    this.scope = scope;

    this.version(1).stores({
      products: 'localId, serverId, businessId, syncStatus, updatedAtLocal',
      categories: 'localId, serverId, businessId, syncStatus, updatedAtLocal',
      businessProducts: 'localId, serverId, businessId, productLocalId, productServerId, syncStatus',
      outbox: 'clientOperationId, status, nextAttemptAt, businessId, userId, createdAt, operationType',
      idMap: 'key, entityType, localId, serverId, businessId',
      syncState: 'stream, businessId',
      deviceMeta: 'key',
    });

    this.version(2).stores({
      sales: 'localId, clientOperationId, businessId, syncStatus, cashRegisterId, createdAtLocal',
      cashRegisters: 'serverId, businessId, status, deviceId, userId',
    });
  }
}

const openDbs = new Map<string, SuperTiendaOfflineDb>();

export async function openOfflineDb(scope: TenantScope): Promise<SuperTiendaOfflineDb> {
  assertBrowser();
  try {
    const name = buildDbName(scope);
    let db = openDbs.get(name);
    if (!db) {
      db = new SuperTiendaOfflineDb(scope);
      await db.open();
      await db.deviceMeta.put({ key: 'userId', value: String(scope.userId) });
      await db.deviceMeta.put({ key: 'businessId', value: String(scope.businessId) });
      await db.deviceMeta.put({ key: 'deviceId', value: scope.deviceId });
      await db.deviceMeta.put({ key: 'schemaVersion', value: '2' });
      openDbs.set(name, db);
    }
    return db;
  } catch (err: unknown) {
    const name = err instanceof DOMException ? err.name : '';
    if (name === 'QuotaExceededError') {
      throw new OfflineStorageError('Cuota IndexedDB excedida', 'QUOTA_EXCEEDED');
    }
    if (typeof indexedDB === 'undefined') {
      throw new OfflineStorageError('IndexedDB no disponible', 'IDB_UNAVAILABLE');
    }
    throw err;
  }
}

/** Cierra conexión del scope; no borra la base. */
export async function closeOfflineDb(scope: TenantScope): Promise<void> {
  const name = buildDbName(scope);
  const db = openDbs.get(name);
  if (db) {
    db.close();
    openDbs.delete(name);
  }
}

/** Solo para tests: cierra todo. */
export async function closeAllOfflineDbs(): Promise<void> {
  for (const db of openDbs.values()) {
    db.close();
  }
  openDbs.clear();
}

export async function deleteOfflineDbForTests(scope: TenantScope): Promise<void> {
  assertBrowser();
  await closeOfflineDb(scope);
  await Dexie.delete(buildDbName(scope));
}
