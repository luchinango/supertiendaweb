import { ProductResponse, ProductListResponse } from '../types/api';

/**
 * Mapear Product entity a ProductResponse DTO
 */
export function mapProductToProductResponse(product: any): ProductResponse {
  return {
    id: product.id,
    categoryId: product.categoryId,
    sku: product.sku || undefined,
    barcode: product.barcode || undefined,
    name: product.name,
    description: product.description || undefined,
    brand: product.brand || undefined,
    model: product.model || undefined,
    unit: product.unit || undefined,
    weight: product.weight ? Number(product.weight) : undefined,
    dimensions: product.dimensions || undefined,
    costPrice: Number(product.costPrice),
    sellingPrice: Number(product.sellingPrice),
    taxType: product.taxType,
    taxRate: Number(product.taxRate),
    minStock: product.minStock,
    maxStock: product.maxStock || undefined,
    reorderPoint: product.reorderPoint,
    isActive: product.isActive,
    status: product.status,
    expiryDate: product.expiryDate?.toISOString() || undefined,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    deletedAt: product.deletedAt?.toISOString() || undefined,
    createdBy: product.createdBy,
    updatedBy: product.updatedBy,
    deletedBy: product.deletedBy || undefined,
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      description: product.category.description || undefined,
    } : undefined,
  };
}

/**
 * Mapear lista de productos a response
 */
export function mapProductsToResponse(products: any[]): ProductResponse[] {
  return products.map(mapProductToProductResponse);
}

/**
 * Mapear resultado paginado de productos
 */
export function mapPaginatedProductsToResponse(
  products: any[],
  total: number,
  page: number,
  limit: number
): ProductListResponse {
  return {
    products: products.map(mapProductToProductResponse),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
}
