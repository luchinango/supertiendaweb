import { PrismaClient } from '../../generated';
import { Decimal } from '@prisma/client/runtime/library';
import { IBusinessProductRepository } from '../interfaces/repositories/IBusinessProductRepository';
import {
  BusinessProductResponse,
  CreateBusinessProductRequest,
  UpdateBusinessProductRequest,
  BusinessProductListResponse,
  BusinessProductStats,
  BusinessProductSearchResult,
  StockAdjustmentRequest,
  RestockRequest,
  PaginationMeta
} from '../types/api';
import { PaginationParams } from '../types/pagination';
import { createPaginationMeta } from '../utils/pagination';

export class BusinessProductRepository implements IBusinessProductRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToBusinessProductResponse(businessProduct: any): BusinessProductResponse {
    console.log(businessProduct);
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

  async findById(id: number): Promise<BusinessProductResponse | null> {
    const businessProduct = await this.prisma.businessProduct.findFirst({
      where: { id, deletedAt: null },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
    });

    return businessProduct ? this.mapToBusinessProductResponse(businessProduct) : null;
  }

  async findByBusinessAndProduct(businessId: number, productId: number): Promise<BusinessProductResponse | null> {
    // Unique parcial activo: Prisma ya no expone businessId_productId
    const businessProduct = await this.prisma.businessProduct.findFirst({
      where: {
        businessId,
        productId,
        deletedAt: null,
      },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
    });

    return businessProduct ? this.mapToBusinessProductResponse(businessProduct) : null;
  }

  async findMany(
    paginationParams: PaginationParams,
    additionalFilters?: {
      businessId?: number;
      productId?: number;
      minStock?: number;
      maxStock?: number;
      minPrice?: number;
      maxPrice?: number;
      categoryId?: number;
      brand?: string;
      lowStock?: boolean;
      outOfStock?: boolean;
    }
  ): Promise<BusinessProductListResponse> {
    const { page, limit } = paginationParams;
    const skip = ((page || 1) - 1) * (limit || 10);

    const where: any = { deletedAt: null };

    if (additionalFilters?.businessId) {
      where.businessId = additionalFilters.businessId;
    }

    if (additionalFilters?.productId) {
      where.productId = additionalFilters.productId;
    }

    if (additionalFilters?.minStock !== undefined) {
      where.currentStock = { ...where.currentStock, gte: additionalFilters.minStock };
    }

    if (additionalFilters?.maxStock !== undefined) {
      where.currentStock = { ...where.currentStock, lte: additionalFilters.maxStock };
    }

    if (additionalFilters?.minPrice !== undefined) {
      where.customPrice = { ...where.customPrice, gte: new Decimal(additionalFilters.minPrice) };
    }

    if (additionalFilters?.maxPrice !== undefined) {
      where.customPrice = { ...where.customPrice, lte: new Decimal(additionalFilters.maxPrice) };
    }

    if (additionalFilters?.lowStock) {
      where.currentStock = { lte: 10 };
    }

    if (additionalFilters?.outOfStock) {
      where.currentStock = { lte: 0 };
    }

    if (additionalFilters?.categoryId || additionalFilters?.brand) {
      where.product = {};

      if (additionalFilters.categoryId) {
        where.product.categoryId = additionalFilters.categoryId;
      }

      if (additionalFilters.brand) {
        where.product.brand = {
          contains: additionalFilters.brand,
          mode: 'insensitive',
        };
      }
    }

    const [businessProducts, total] = await Promise.all([
      this.prisma.businessProduct.findMany({
        where,
        include: {
          product: {
            include: { category: true },
          },
          business: true,
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.businessProduct.count({ where }),
    ]);

    const data = businessProducts.map(bp => this.mapToBusinessProductResponse(bp));
    const meta = this.createBusinessProductPagination(total, page || 1, limit || 10);

    return { data, meta };
  }

  async create(data: CreateBusinessProductRequest): Promise<BusinessProductResponse> {
    const active = await this.prisma.businessProduct.findFirst({
      where: {
        businessId: data.businessId,
        productId: data.productId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (active) {
      throw new Error('Ya existe un BusinessProduct activo para este negocio y producto');
    }
    // Soft-deleted previo: no se reactiva; se crea fila nueva (unique parcial lo permite)

    const businessProduct = await this.prisma.businessProduct.create({
      data: {
        businessId: data.businessId,
        productId: data.productId,
        customPrice: new Decimal(data.customPrice),
        currentStock: data.currentStock || 0,
        reservedStock: data.reservedStock || 0,
        availableStock: data.availableStock || data.currentStock || 0,
        version: 1,
      },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
    });

    return this.mapToBusinessProductResponse(businessProduct);
  }

  async update(id: number, data: UpdateBusinessProductRequest): Promise<BusinessProductResponse> {
    const updateData: any = {};

    if (data.customPrice !== undefined) {
      updateData.customPrice = new Decimal(data.customPrice);
    }

    if (data.currentStock !== undefined) {
      updateData.currentStock = data.currentStock;
    }

    if (data.reservedStock !== undefined) {
      updateData.reservedStock = data.reservedStock;
    }

    if (data.availableStock !== undefined) {
      updateData.availableStock = data.availableStock;
    }

    if (data.lastRestock !== undefined) {
      updateData.lastRestock = data.lastRestock;
    }

    updateData.updatedAt = new Date();
    updateData.version = { increment: 1 };

    const existing = await this.prisma.businessProduct.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      throw new Error('BusinessProduct not found');
    }

    const businessProduct = await this.prisma.businessProduct.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
    });

    return this.mapToBusinessProductResponse(businessProduct);
  }

  async updateByBusinessAndProduct(
    businessId: number,
    productId: number,
    data: UpdateBusinessProductRequest
  ): Promise<BusinessProductResponse> {
    const existing = await this.prisma.businessProduct.findFirst({
      where: { businessId, productId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      throw new Error('BusinessProduct not found');
    }
    return this.update(existing.id, data);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.prisma.businessProduct.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      throw new Error('BusinessProduct not found');
    }
    await this.prisma.businessProduct.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
        version: { increment: 1 },
      },
    });
  }

  async deleteByBusinessAndProduct(businessId: number, productId: number): Promise<void> {
    const existing = await this.prisma.businessProduct.findFirst({
      where: { businessId, productId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      throw new Error('BusinessProduct not found');
    }
    await this.delete(existing.id);
  }

  async search(query: string, businessId?: number): Promise<BusinessProductSearchResult[]> {
    if (query.length < 2) {
      return [];
    }

    const where: any = {
      deletedAt: null,
      product: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      },
    };

    if (businessId) {
      where.businessId = businessId;
    }

    const businessProducts = await this.prisma.businessProduct.findMany({
      where,
      include: {
        product: {
          include: { category: true },
        },
      },
      take: 20,
      orderBy: { product: { name: 'asc' } },
    });

    return businessProducts.map(bp => ({
      id: bp.id,
      businessId: bp.businessId,
      productId: bp.productId,
      productName: bp.product.name,
      productSku: bp.product.sku || undefined,
      productBarcode: bp.product.barcode || undefined,
      customPrice: Number(bp.customPrice),
      currentStock: bp.currentStock,
      availableStock: bp.availableStock,
      category: bp.product.category ? {
        id: bp.product.category.id,
        name: bp.product.category.name,
      } : undefined,
    }));
  }

  async findByBusiness(businessId: number): Promise<BusinessProductResponse[]> {
    const businessProducts = await this.prisma.businessProduct.findMany({
      where: { businessId, deletedAt: null },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
      orderBy: { product: { name: 'asc' } },
    });

    return businessProducts.map(bp => this.mapToBusinessProductResponse(bp));
  }

  async findByProduct(productId: number): Promise<BusinessProductResponse[]> {
    const businessProducts = await this.prisma.businessProduct.findMany({
      where: { productId, deletedAt: null },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
      orderBy: { business: { name: 'asc' } },
    });

    return businessProducts.map(bp => this.mapToBusinessProductResponse(bp));
  }

  async findLowStock(businessId: number, threshold: number = 10): Promise<BusinessProductResponse[]> {
    const businessProducts = await this.prisma.businessProduct.findMany({
      where: {
        businessId,
        deletedAt: null,
        currentStock: { lte: threshold },
      },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
      orderBy: { currentStock: 'asc' },
    });

    return businessProducts.map(bp => this.mapToBusinessProductResponse(bp));
  }

  async findOutOfStock(businessId: number): Promise<BusinessProductResponse[]> {
    const businessProducts = await this.prisma.businessProduct.findMany({
      where: {
        businessId,
        deletedAt: null,
        currentStock: { lte: 0 },
      },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
      orderBy: { product: { name: 'asc' } },
    });

    return businessProducts.map(bp => this.mapToBusinessProductResponse(bp));
  }

  async findByCategory(categoryId: number, businessId?: number): Promise<BusinessProductResponse[]> {
    const where: any = {
      deletedAt: null,
      product: { categoryId },
    };

    if (businessId) {
      where.businessId = businessId;
    }

    const businessProducts = await this.prisma.businessProduct.findMany({
      where,
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
      orderBy: { product: { name: 'asc' } },
    });

    return businessProducts.map(bp => this.mapToBusinessProductResponse(bp));
  }

  async findByBrand(brand: string, businessId?: number): Promise<BusinessProductResponse[]> {
    const where: any = {
      deletedAt: null,
      product: {
        brand: { contains: brand, mode: 'insensitive' },
      },
    };

    if (businessId) {
      where.businessId = businessId;
    }

    const businessProducts = await this.prisma.businessProduct.findMany({
      where,
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
      orderBy: { product: { name: 'asc' } },
    });

    return businessProducts.map(bp => this.mapToBusinessProductResponse(bp));
  }

  async findRecentlyRestocked(businessId: number, days: number = 7): Promise<BusinessProductResponse[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const businessProducts = await this.prisma.businessProduct.findMany({
      where: {
        businessId,
        deletedAt: null,
        lastRestock: { gte: dateThreshold },
      },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
      orderBy: { lastRestock: 'desc' },
    });

    return businessProducts.map(bp => this.mapToBusinessProductResponse(bp));
  }

  async adjustStock(id: number, adjustment: StockAdjustmentRequest): Promise<BusinessProductResponse> {
    const businessProduct = await this.prisma.businessProduct.findFirst({
      where: { id, deletedAt: null },
    });

    if (!businessProduct) {
      throw new Error('BusinessProduct not found');
    }

    const newStock = Math.max(0, businessProduct.currentStock + adjustment.quantity);
    const newAvailableStock = Math.max(0, newStock - businessProduct.reservedStock);

    const updated = await this.prisma.businessProduct.update({
      where: { id },
      data: {
        currentStock: newStock,
        availableStock: newAvailableStock,
        updatedAt: new Date(),
        version: { increment: 1 },
      },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
    });

    return this.mapToBusinessProductResponse(updated);
  }

  async restock(id: number, restockData: RestockRequest): Promise<BusinessProductResponse> {
    const businessProduct = await this.prisma.businessProduct.findFirst({
      where: { id, deletedAt: null },
    });

    if (!businessProduct) {
      throw new Error('BusinessProduct not found');
    }

    const newStock = businessProduct.currentStock + restockData.quantity;
    const newAvailableStock = Math.max(0, newStock - businessProduct.reservedStock);

    const updated = await this.prisma.businessProduct.update({
      where: { id },
      data: {
        currentStock: newStock,
        availableStock: newAvailableStock,
        lastRestock: new Date(),
        updatedAt: new Date(),
        version: { increment: 1 },
      },
      include: {
        product: {
          include: { category: true },
        },
        business: true,
      },
    });

    return this.mapToBusinessProductResponse(updated);
  }

  async getStats(businessId: number): Promise<BusinessProductStats> {
    const [
      totalProducts,
      stockData,
      lowStockCount,
      outOfStockCount,
      recentlyRestockedCount,
    ] = await Promise.all([
      this.prisma.businessProduct.count({
        where: { businessId, deletedAt: null },
      }),
      this.prisma.businessProduct.aggregate({
        where: { businessId, deletedAt: null },
        _sum: {
          currentStock: true,
        },
        _avg: {
          currentStock: true,
        },
      }),
      this.prisma.businessProduct.count({
        where: {
          businessId,
          deletedAt: null,
          currentStock: { lte: 10 },
        },
      }),
      this.prisma.businessProduct.count({
        where: {
          businessId,
          deletedAt: null,
          currentStock: { lte: 0 },
        },
      }),
      this.prisma.businessProduct.count({
        where: {
          businessId,
          deletedAt: null,
          lastRestock: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // últimos 7 días
          },
        },
      }),
    ]);

    // Calcular valor total del stock
    const businessProducts = await this.prisma.businessProduct.findMany({
      where: { businessId, deletedAt: null },
      select: {
        currentStock: true,
        customPrice: true,
      },
    });

    const totalStockValue = businessProducts.reduce((sum, bp) => {
      return sum + (bp.currentStock * Number(bp.customPrice));
    }, 0);

    return {
      totalProducts,
      totalStockValue,
      averageStockLevel: Number(stockData._avg.currentStock) || 0,
      lowStockProducts: lowStockCount,
      outOfStockProducts: outOfStockCount,
      recentlyRestockedProducts: recentlyRestockedCount,
    };
  }

  async exists(businessId: number, productId: number): Promise<boolean> {
    const count = await this.prisma.businessProduct.count({
      where: {
        businessId,
        productId,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  async existsById(id: number): Promise<boolean> {
    const count = await this.prisma.businessProduct.count({
      where: { id, deletedAt: null },
    });

    return count > 0;
  }

  private createBusinessProductPagination(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    };
  }
}