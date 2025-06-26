import { BusinessProductResponse, BusinessProductListResponse } from '../types/api';
import { PaginatedResult } from '../types/pagination';

export function mapBusinessProductToBusinessProductResponse(businessProduct: any): BusinessProductResponse {
  return {
    id: businessProduct.id,
    businessId: businessProduct.businessId,
    productId: businessProduct.productId,
    customPrice: Number(businessProduct.customPrice),
    currentStock: businessProduct.currentStock,
    reservedStock: businessProduct.reservedStock,
    availableStock: businessProduct.availableStock,
    lastRestock: businessProduct.lastRestock,
    createdAt: businessProduct.createdAt,
    updatedAt: businessProduct.updatedAt,
    product: businessProduct.product ? {
      id: businessProduct.product.id,
      categoryId: businessProduct.product.categoryId,
      sku: businessProduct.product.sku || undefined,
      barcode: businessProduct.product.barcode || undefined,
      name: businessProduct.product.name,
      description: businessProduct.product.description || undefined,
      brand: businessProduct.product.brand || undefined,
      model: businessProduct.product.model || undefined,
      unit: businessProduct.product.unit || undefined,
      weight: businessProduct.product.weight ? Number(businessProduct.product.weight) : undefined,
      dimensions: businessProduct.product.dimensions || undefined,
      costPrice: Number(businessProduct.product.costPrice),
      sellingPrice: Number(businessProduct.product.sellingPrice),
      taxType: businessProduct.product.taxType,
      taxRate: Number(businessProduct.product.taxRate),
      minStock: businessProduct.product.minStock,
      maxStock: businessProduct.product.maxStock || undefined,
      reorderPoint: businessProduct.product.reorderPoint,
      isActive: businessProduct.product.isActive,
      status: businessProduct.product.status,
      expiryDate: businessProduct.product.expiryDate,
      createdAt: businessProduct.product.createdAt,
      updatedAt: businessProduct.product.updatedAt,
      deletedAt: businessProduct.product.deletedAt,
      createdBy: businessProduct.product.createdBy,
      updatedBy: businessProduct.product.updatedBy,
      deletedBy: businessProduct.product.deletedBy || undefined,
      category: businessProduct.product.category ? {
        id: businessProduct.product.category.id,
        name: businessProduct.product.category.name,
        description: businessProduct.product.category.description || undefined,
      } : undefined,
    } : undefined,
    business: businessProduct.business ? {
      id: businessProduct.business.id,
      name: businessProduct.business.name,
    } : undefined,
  };
}

export function mapPaginatedBusinessProductsToResponse(
  paginatedResult: PaginatedResult<any>
): BusinessProductListResponse {
  return {
    data: paginatedResult.data.map(mapBusinessProductToBusinessProductResponse),
    meta: {
      total: paginatedResult.meta.total,
      page: paginatedResult.meta.page || 1,
      limit: paginatedResult.meta.limit || 10,
      totalPages: paginatedResult.meta.totalPages,
      hasNextPage: paginatedResult.meta.hasNextPage,
      hasPrevPage: paginatedResult.meta.hasPrevPage,
      nextPage: paginatedResult.meta.nextPage,
      prevPage: paginatedResult.meta.prevPage,
    },
  };
}