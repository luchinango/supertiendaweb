import {Decimal} from '@prisma/client/runtime/library';
import {ProductStatus} from 'prisma/generated';

/**
 * Tipos para operaciones de productos
 */

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  status?: string;
  isActive?: boolean;
  minStock?: number;
  maxStock?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateProductRequest {
  name: string;
  costPrice: number | Decimal;
  sellingPrice: number | Decimal;
  sku: string;
  barcode: string;
  brand?: string;
  unit?: string;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  expiryDate?: Date;
  status?: ProductStatus;
  categoryId?: number;
  description?: string;
}

export interface UpdateProductRequest {
  name?: string;
  costPrice?: number | Decimal;
  sellingPrice?: number | Decimal;
  sku?: string;
  barcode?: string;
  brand?: string;
  unit?: string;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  expiryDate?: Date;
  status?: ProductStatus;
  categoryId?: number;
  description?: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  costPrice: Decimal;
  sellingPrice: Decimal;
  sku: string;
  barcode: string;
  brand?: string;
  unit?: string;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  expiryDate?: Date;
  status: ProductStatus;
  categoryId?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface ProductListResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ProductPathParams {
  id: string;
  categoryId?: string;
}

export interface ProductErrorResponse {
  message: string;
  error?: string;
  details?: string[];
}
