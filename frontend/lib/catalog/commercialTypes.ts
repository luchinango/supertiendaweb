import type { LocalEntitySyncStatus } from '@/lib/offline/types';

export type CatalogVisibilityFilter = 'all' | 'private' | 'shared';

export interface CommercialCatalogRow {
  productLocalId: string;
  productServerId: number | null;
  bpLocalId: string | null;
  bpServerId: number | null;
  name: string;
  sku: string | null;
  categoryId: number | null;
  /** localId de categoría pendiente (sin serverId aún) */
  categoryLocalId: string | null;
  categoryName: string;
  /** Solo BusinessProduct.customPrice — nunca Product.sellingPrice */
  customPrice: number | null;
  /** IVA % del Product (pull); default motor = 13 si ausente */
  taxRate: number | null;
  currentStock: number | null;
  reservedStock: number | null;
  availableStock: number | null;
  visibility: string;
  productVersion: number;
  bpVersion: number | null;
  syncStatus: LocalEntitySyncStatus;
  deleted: boolean;
  isPrivate: boolean;
  isSharedAdopted: boolean;
}

/** Umbral UI local: minStock no viaja en pull BP (P2-C0.3). */
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export interface CreatePrivateProductInput {
  name: string;
  /** Categoría ya sincronizada */
  categoryServerId?: number;
  /** Categoría privada aún pending — requiere dependsOn */
  categoryLocalId?: string;
  customPrice: number;
  sku?: string;
  barcode?: string;
  unit?: string;
  initialStock?: number;
}

export interface StockAdjustInput {
  bpLocalId: string;
  businessProductServerId: number;
  baseVersion: number;
  /** Positivo = entrada; negativo = salida (UI envía signo) */
  delta: number;
  reason: string;
}

export interface UpdatePrivateProductInput {
  productLocalId: string;
  productServerId: number;
  baseVersion: number;
  name?: string;
  sku?: string | null;
  barcode?: string | null;
  categoryServerId?: number;
}

export interface CreatePrivateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdatePrivateCategoryInput {
  categoryLocalId: string;
  categoryServerId: number;
  baseVersion: number;
  name?: string;
  description?: string;
}

export interface AdoptSharedInput {
  productServerId: number;
  customPrice: number;
}
