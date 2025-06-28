import { Department, DocumentType, PaymentMethod, BusinessProduct, Product, Category } from '../../prisma/generated';
import { PaginationMeta } from './pagination';


export interface BusinessProductResponse {
  id: number;
  businessId: number;
  productId: number;
  customPrice: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lastRestock?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product?: ProductResponse;
  business?: {
    id: number;
    name: string;
  };
}

export interface ProductResponse {
  id: number;
  categoryId: number;
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  unit?: string;
  weight?: number;
  dimensions?: string;
  costPrice: number;
  sellingPrice: number;
  taxType: string;
  taxRate: number;
  minStock: number;
  maxStock?: number;
  reorderPoint: number;
  isActive: boolean;
  status: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy: number;
  updatedBy: number;
  deletedBy?: number;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface BusinessProductCatalogItem {
  id: number;
  categoryId: number;
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  unit?: string;
  weight?: number;
  dimensions?: string;
  taxType: string;
  taxRate: number;
  minStock: number;
  maxStock?: number;
  reorderPoint: number;
  isActive: boolean;
  status: string;
  expiryDate?: string;
  category?: {
    id: number;
    name: string;
    description?: string;
  };

  businessProduct?: {
    id: number;
    businessId: number;
    customPrice: number;
    currentStock: number;
    reservedStock: number;
    availableStock: number;
    lastRestock?: Date;
    createdAt: Date;
    updatedAt: Date;
  } | null;

  effectivePrice: number;
  effectiveStock: number;
  isAvailableInBusiness: boolean;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NOT_CONFIGURED';
}

export interface BusinessProductCatalogResponse {
  items: BusinessProductCatalogItem[];
  meta: PaginationMeta;
  summary: {
    totalProducts: number;
    configuredProducts: number;
    notConfiguredProducts: number;
    inStockProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
}

export interface BusinessProductCatalogFilters {
  categoryId?: number;
  search?: string;
  isActive?: boolean;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NOT_CONFIGURED';
  isConfigured?: boolean;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateBusinessProductRequest {
  businessId: number;
  productId: number;
  customPrice: number;
  currentStock?: number;
  reservedStock?: number;
  availableStock?: number;
}

export interface UpdateBusinessProductRequest {
  customPrice?: number;
  currentStock?: number;
  reservedStock?: number;
  availableStock?: number;
  lastRestock?: Date;
}

export interface BusinessProductListResponse {
  data: BusinessProductResponse[];
  meta: PaginationMeta;
}

export interface BusinessProductStats {
  totalProducts: number;
  totalStockValue: number;
  averageStockLevel: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentlyRestockedProducts: number;
}

export interface BusinessProductSearchResult {
  id: number;
  businessId: number;
  productId: number;
  productName: string;
  productSku?: string;
  productBarcode?: string;
  customPrice: number;
  currentStock: number;
  availableStock: number;
  category?: {
    id: number;
    name: string;
  };
}

export interface BusinessProductSearchResponse {
  data: BusinessProductSearchResult[];
  meta: PaginationMeta;
}

export interface StockAdjustmentRequest {
  quantity: number;
  reason: string;
  notes?: string;
}

export interface RestockRequest {
  quantity: number;
  unitCost?: number;
  reason?: string;
  notes?: string;
}

export interface BulkConfigureProductsRequest {
  businessId: number;
  productIds: number[];
  defaultCustomPrice?: number;
  defaultStock?: number;
}

export interface BulkConfigureProductsResponse {
  configured: number;
  skipped: number;
  errors: string[];
}

// POS Related Types
export interface QuickProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode?: string;
}

export interface CartItemInput {
  productId: number;
  quantity: number;
}

export interface CustomerInput {
  firstName: string;
  lastName?: string;
  documentType: DocumentType;
  documentNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: Department;
}

export interface PaymentInput {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface SearchProductsInput {
  query: string;
  businessId?: number;
}

export interface QuickProductsInput {
  businessId?: number;
  limit?: number;
}