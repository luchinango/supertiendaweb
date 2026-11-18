/** DTOs HTTP — catálogo privado comercial (P2-C.B). TSOA-friendly. */

export interface CreatePrivateProductBody {
  name: string;
  categoryServerId: number;
  customPrice: number;
  sku?: string | null;
  barcode?: string | null;
  costPrice?: number;
  sellingPrice?: number;
  unit?: string;
  description?: string;
  brand?: string;
  initialStock?: number;
  localEntityId?: string;
  localBusinessProductId?: string;
}

export interface UpdatePrivateProductBody {
  baseVersion: number;
  name?: string;
  sku?: string | null;
  barcode?: string | null;
  description?: string;
  brand?: string;
  unit?: string;
  costPrice?: number;
  sellingPrice?: number;
  categoryServerId?: number;
}

export interface CreatePrivateCategoryBody {
  name: string;
  description?: string;
  parentServerId?: number;
  sortOrder?: number;
  localEntityId?: string;
}

export interface UpdatePrivateCategoryBody {
  baseVersion: number;
  name?: string;
  description?: string;
}

export interface AdoptSharedProductBody {
  customPrice: number;
  localEntityId?: string;
}

export interface UpdateBusinessProductPriceBody {
  customPrice: number;
  baseVersion: number;
}

export interface PrivateProductCommercialDto {
  productId: number;
  businessProductId: number;
  version: number;
  businessProductVersion: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  categoryId: number;
  customPrice: number;
  currentStock: number;
  availableStock: number;
  visibility: string;
  clientOperationId: string;
  status: string;
  idMappings?: { entityType: string; localEntityId: string; serverId: number }[];
}

export interface PrivateCategoryDto {
  categoryId: number;
  version: number;
  name: string;
  visibility: string;
  clientOperationId: string;
  status: string;
  idMappings?: { entityType: string; localEntityId: string; serverId: number }[];
}

export interface AdoptResultDto {
  businessProductId: number;
  productId: number;
  version: number;
  customPrice: number;
  clientOperationId: string;
  status: string;
  idMappings?: { entityType: string; localEntityId: string; serverId: number }[];
}

export interface PriceUpdateResultDto {
  businessProductId: number;
  productId: number;
  version: number;
  customPrice: number;
  clientOperationId: string;
  status: string;
}

export interface PrivateProductListItem {
  productId: number;
  businessProductId: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  categoryId: number;
  customPrice: number;
  currentStock: number;
  availableStock: number;
  version: number;
  businessProductVersion: number;
  updatedAt: string;
}

export interface PrivateProductListResponse {
  items: PrivateProductListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
