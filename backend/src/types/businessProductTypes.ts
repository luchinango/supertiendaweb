import { Department, DocumentType, PaymentMethod } from '../../prisma/generated';
import { PaginationMeta } from './api';


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
  product?: {
    id: number;
    categoryId: number;
    name: string;
    sku?: string;
    barcode?: string;
    description?: string;
    brand?: string;
    unit?: string;
    costPrice: number;
    sellingPrice: number;
    taxType: string;
    taxRate: number;
    minStock: number;
    reorderPoint: number;
    isActive: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  business?: {
    id: number;
    name: string;
  };
}

export interface CreateBusinessProductRequest {
  businessId: number;
  productId: number;
  customPrice: number;
  currentStock?: number;
  reservedStock?: number;
  availableStock?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
}

export interface UpdateBusinessProductRequest {
  customPrice?: number;
  currentStock?: number;
  reservedStock?: number;
  availableStock?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
}

export interface BusinessProductListResponse {
  data: BusinessProductResponse[];
  meta: PaginationMeta;
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

export interface BusinessProductStats {
  totalProducts: number;
  totalStockValue: number;
  averageStockLevel: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentlyRestockedProducts: number;
}

export interface StockAdjustmentRequest {
  quantity: number;
  reason?: string;
  adjustmentType: 'ADD' | 'SUBTRACT' | 'SET';
}

export interface RestockRequest {
  quantity: number;
  costPerUnit?: number;
  supplierReference?: string;
  notes?: string;
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