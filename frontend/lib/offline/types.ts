/** Tipos IndexedDB / outbox — P2-C0.2 / P2-C1.C (alineados a sync API). */

export type OfflineEntityType = 'product' | 'category' | 'businessProduct' | 'sale' | 'cashRegister';

export type LocalEntitySyncStatus = 'synced' | 'pending' | 'conflict' | 'tombstone';

export type OutboxLocalStatus =
  | 'pending'
  | 'sending'
  | 'acked'
  | 'conflict'
  | 'rejected'
  | 'dead';

/** Proyección local de venta comercial (provisional → confirmada). */
export type LocalSaleSyncStatus =
  | 'pending'
  | 'sending'
  | 'confirmed'
  | 'conflict'
  | 'rejected'
  | 'dead';

/** operationType canónico del backend SyncService */
export type SyncOperationType =
  | 'PRODUCT_PRIVATE_CREATE_WITH_BP'
  | 'PRODUCT_UPDATE'
  | 'CATEGORY_PRIVATE_CREATE'
  | 'CATEGORY_UPDATE'
  | 'BP_UPSERT'
  | 'STOCK_ADJUST'
  | 'SALE_CREATE'
  | 'CASH_OPEN'
  | 'CASH_CLOSE'
  | string;

export interface TenantScope {
  userId: number;
  businessId: number;
  deviceId: string;
}

export interface LocalProduct {
  localId: string;
  serverId?: number | null;
  businessId: number;
  payload: Record<string, unknown>;
  version: number;
  updatedAtLocal: string;
  updatedAtServer?: string | null;
  syncStatus: LocalEntitySyncStatus;
  deleted: boolean;
}

export interface LocalCategory {
  localId: string;
  serverId?: number | null;
  businessId: number;
  payload: Record<string, unknown>;
  version: number;
  updatedAtLocal: string;
  updatedAtServer?: string | null;
  syncStatus: LocalEntitySyncStatus;
  deleted: boolean;
}

export interface LocalBusinessProduct {
  localId: string;
  serverId?: number | null;
  businessId: number;
  productLocalId?: string | null;
  productServerId?: number | null;
  payload: Record<string, unknown>;
  version: number;
  updatedAtLocal: string;
  updatedAtServer?: string | null;
  syncStatus: LocalEntitySyncStatus;
  deleted: boolean;
}

/** Caja OPEN confirmada por servidor — evidencia local para ventas offline. */
export interface LocalCashRegister {
  /** PK = server cashRegisterId */
  serverId: number;
  businessId: number;
  userId: number;
  deviceId: string;
  registerNumber: string;
  version: number;
  status: 'OPEN' | 'CLOSED';
  openingAmount: string;
  currentAmount: string;
  openingDate: string;
  notes: string | null;
  /** Última lectura/confirmación de metadatos (GET no renueva lease). */
  serverConfirmedAt: string;
  updatedAtLocal: string;
  /** P2-C1.F1 cash lease firmado por servidor */
  leaseId?: string | null;
  leaseIssuedAt?: string | null;
  leaseExpiresAt?: string | null;
  cashLeaseToken?: string | null;
}

export interface LocalSaleLine {
  businessProductId: number;
  quantity: number;
  unitPrice: number;
  baseVersion: number;
  productName: string;
  sku?: string | null;
  /** IVA % usado en totales provisionales (espejo Product.taxRate). */
  taxRate?: number | null;
}

export interface LocalSale {
  localId: string;
  clientOperationId: string;
  businessId: number;
  userId: number;
  deviceId: string;
  cashRegisterId: number;
  lines: LocalSaleLine[];
  discountAmount: number;
  /** Total provisional (subtotal + IVA − dto) según fórmula compartida. */
  provisionalTotal: number;
  provisionalSubtotal?: number;
  provisionalTax?: number;
  cashReceived: number;
  change: number;
  paymentMethod: 'CASH';
  notes: string | null;
  createdAtLocal: string;
  syncStatus: LocalSaleSyncStatus;
  lastError?: string | null;
  lastErrorCode?: string | null;
  serverSaleId?: number | null;
  commercialNumber?: string | null;
  confirmedAt?: string | null;
  /** Total definitivo del servidor (no sobrescribe provisionalTotal). */
  confirmedTotal?: number | null;
  confirmedSubtotal?: number | null;
  confirmedTax?: number | null;
  /** Si el total servidor difiere del provisional (aviso explícito). */
  totalsAdjusted?: boolean;
  serverResult?: Record<string, unknown> | null;
}

export interface OutboxOperation {
  clientOperationId: string;
  operationType: SyncOperationType;
  payload: Record<string, unknown>;
  baseVersion?: number | null;
  dependsOn: string[];
  createdAt: string;
  status: OutboxLocalStatus;
  attempts: number;
  nextAttemptAt: string;
  lastError?: string | null;
  lastErrorCode?: string | null;
  localEntityId?: string | null;
  localEntityType?: OfflineEntityType | null;
  serverEntityId?: number | null;
  serverResult?: Record<string, unknown> | null;
  businessId: number;
  userId: number;
  deviceId: string;
}

export interface IdMappingRow {
  /** `${entityType}:${localId}` */
  key: string;
  entityType: OfflineEntityType;
  localId: string;
  serverId: number;
  mappedAt: string;
  businessId: number;
}

export interface SyncStateRow {
  stream: string;
  cursor: string;
  snapshotAt?: string | null;
  lastPullAt?: string | null;
  lastPushAt?: string | null;
  lastError?: string | null;
  businessId: number;
}

export interface DeviceMetaRow {
  key: string;
  value: string;
}

export interface SessionGateState {
  /** epoch ms — expiración del refresh conocida (no se guarda el token en IDB) */
  refreshExpiresAt: number | null;
  accessExpiresAt: number | null;
  mutationsAllowed: boolean;
  reason?: string;
}

export interface SyncPushResultItem {
  clientOperationId: string;
  status: 'applied' | 'duplicate' | 'conflict' | 'rejected';
  operationType?: string;
  serverEntityId?: number;
  version?: number;
  idMappings?: { entityType: string; localEntityId: string; serverId: number }[];
  code?: string;
  message?: string;
  retryable?: boolean;
  server?: Record<string, unknown>;
}

export interface SyncPushResponse {
  serverTime: string;
  results: SyncPushResultItem[];
}

/** Contrato real GET /sync/pull (backend SyncPullChange). */
export interface SyncPullChange {
  stream: 'catalog' | 'stock';
  entityType: 'product' | 'category' | 'businessProduct';
  serverId: number;
  version: number;
  updatedAt: string;
  deleted: boolean;
  deletedAt?: string | null;
  payload: Record<string, unknown> | null;
}

export interface SyncPullResponse {
  serverTime: string;
  cursor: string;
  hasMore: boolean;
  changes: SyncPullChange[];
  snapshotAt: string;
}

export interface CatalogSyncCycleResult {
  pushed: number;
  pullPages: number;
  pullChanges: number;
  snapshotAt: string | null;
  cursor: string | null;
  skippedLocalPending: number;
  errors: string[];
}

export class OfflineStorageError extends Error {
  code:
    | 'IDB_UNAVAILABLE'
    | 'QUOTA_EXCEEDED'
    | 'SSR_FORBIDDEN'
    | 'SCOPE_MISMATCH'
    | 'SESSION_BLOCKED'
    | 'SYNC_LOCKED'
    | 'NETWORK'
    | 'VALIDATION'
    | 'DEPENDENCY_UNRESOLVED';

  constructor(
    message: string,
    code: OfflineStorageError['code']
  ) {
    super(message);
    this.name = 'OfflineStorageError';
    this.code = code;
  }
}
