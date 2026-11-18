/** Tipos de operación alineados al enum Prisma SyncOperationType (sin importar generated para TSOA). */
export type SyncPushOpType =
  | 'PRODUCT_PRIVATE_CREATE_WITH_BP'
  | 'PRODUCT_UPDATE'
  | 'CATEGORY_PRIVATE_CREATE'
  | 'CATEGORY_UPDATE'
  | 'BP_UPSERT'
  | 'STOCK_ADJUST'
  | 'SALE_CREATE'
  | 'SALE_COMPLETE'
  | 'SALE_CANCEL'
  | 'CUSTOMER_CREATE'
  | 'CASH_OPEN'
  | 'CASH_CLOSE'
  | string;

export interface SyncPushOperation {
  clientOperationId: string;
  operationType: string;
  baseVersion?: number | null;
  dependsOn?: string[];
  payload: { [key: string]: any };
  clientCreatedAt?: string;
}

export interface SyncPushRequest {
  operations: SyncPushOperation[];
  /** Si se envía, debe coincidir con JWT (P0.3). */
  businessId?: number;
}

export interface SyncIdMapping {
  entityType: string;
  localEntityId: string;
  serverId: number;
}

export type SyncItemStatus = 'applied' | 'duplicate' | 'conflict' | 'rejected';

export interface SyncPushResultItem {
  clientOperationId: string;
  status: SyncItemStatus;
  operationType: string;
  serverEntityId?: number;
  version?: number;
  idMappings?: SyncIdMapping[];
  code?: string;
  message?: string;
  retryable?: boolean;
  server?: Record<string, unknown>;
}

export interface SyncPushResponse {
  serverTime: string;
  results: SyncPushResultItem[];
}

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
  /** Watermark del snapshot de esta sesión de pull (ISO). */
  snapshotAt: string;
}
