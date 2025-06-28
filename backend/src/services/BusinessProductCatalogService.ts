import { PrismaClient } from '../../prisma/generated';
import {
  BusinessProductCatalogItem,
  BusinessProductCatalogResponse,
  BusinessProductCatalogFilters,
  BulkConfigureProductsRequest,
  BulkConfigureProductsResponse
} from '../types/businessProductTypes';
import { PaginationParams } from '../types/pagination';
import { ValidationError, NotFoundError } from '../errors';

export class BusinessProductCatalogService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Obtiene el catálogo completo de productos para un business específico
   * Incluye productos configurados y no configurados
   */
  async getBusinessProductCatalog(
    businessId: number,
    paginationParams: PaginationParams,
    filters?: BusinessProductCatalogFilters
  ): Promise<BusinessProductCatalogResponse> {
    if (!businessId || businessId <= 0) {
      throw new ValidationError('El ID del business es requerido y debe ser válido');
    }

    const business = await this.prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      throw new NotFoundError('Business no encontrado');
    }

    const { page = 1, limit = 10 } = paginationParams;
    const skip = (page - 1) * limit;

    const productWhere: any = {
      isActive: filters?.isActive ?? true
    };

    if (filters?.categoryId) {
      productWhere.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      productWhere.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters?.brand) {
      productWhere.brand = { contains: filters.brand, mode: 'insensitive' };
    }

    const [products, totalProducts] = await Promise.all([
      this.prisma.product.findMany({
        where: productWhere,
        include: {
          category: true,
          businessProducts: {
            where: { businessId },
            take: 1
          }
        },
        orderBy: [
          { category: { name: 'asc' } },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      this.prisma.product.count({ where: productWhere })
    ]);

    let catalogItems = products.map(product => this.transformToBusinessProductCatalogItem(product, businessId));

    if (filters?.stockStatus) {
      catalogItems = catalogItems.filter(item => item.stockStatus === filters.stockStatus);
    }

    if (filters?.isConfigured !== undefined) {
      catalogItems = catalogItems.filter(item =>
        filters.isConfigured ? item.isAvailableInBusiness : !item.isAvailableInBusiness
      );
    }

    if (filters?.minPrice !== undefined) {
      catalogItems = catalogItems.filter(item => item.effectivePrice >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      catalogItems = catalogItems.filter(item => item.effectivePrice <= filters.maxPrice!);
    }

    const summary = this.calculateSummary(catalogItems);

    const totalPages = Math.ceil(totalProducts / limit);

    return {
      items: catalogItems,
      meta: {
        total: totalProducts,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      },
      summary
    };
  }

  /**
   * Obtiene productos por categoría para un business específico
   */
  async getProductsByCategory(
    businessId: number,
    categoryId: number,
    paginationParams?: PaginationParams
  ): Promise<BusinessProductCatalogResponse> {
    const filters: BusinessProductCatalogFilters = { categoryId };
    const pagination = paginationParams || { page: 1, limit: 50 };

    return this.getBusinessProductCatalog(businessId, pagination, filters);
  }

  /**
   * Configurar productos masivamente para un business
   */
  async bulkConfigureProducts(request: BulkConfigureProductsRequest): Promise<BulkConfigureProductsResponse> {
    const { businessId, productIds, defaultCustomPrice, defaultStock = 0 } = request;

    if (!businessId || businessId <= 0) {
      throw new ValidationError('El ID del business es requerido');
    }

    if (!productIds || productIds.length === 0) {
      throw new ValidationError('Se requiere al menos un ID de producto');
    }

    const business = await this.prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      throw new NotFoundError('Business no encontrado');
    }

    let configured = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const productId of productIds) {
      try {
        const product = await this.prisma.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          errors.push(`Producto con ID ${productId} no encontrado`);
          continue;
        }

        const existingBusinessProduct = await this.prisma.businessProduct.findUnique({
          where: {
            businessId_productId: { businessId, productId }
          }
        });

        if (existingBusinessProduct) {
          skipped++;
          continue;
        }

        const customPrice = defaultCustomPrice ?? Number(product.sellingPrice);

        await this.prisma.businessProduct.create({
          data: {
            businessId,
            productId,
            customPrice,
            currentStock: defaultStock,
            reservedStock: 0,
            availableStock: defaultStock
          }
        });

        configured++;
      } catch (error) {
        errors.push(`Error configurando producto ${productId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return { configured, skipped, errors };
  }

  /**
   * Obtener estadísticas del catálogo de productos para un business
   */
  async getCatalogStats(businessId: number): Promise<any> {
    if (!businessId || businessId <= 0) {
      throw new ValidationError('El ID del business es requerido');
    }

    const [
      totalProducts,
      configuredProducts,
      businessProducts
    ] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.businessProduct.count({ where: { businessId } }),
      this.prisma.businessProduct.findMany({
        where: { businessId },
        include: { product: true }
      })
    ]);

    const inStock = businessProducts.filter(bp => bp.currentStock > 0).length;
    const lowStock = businessProducts.filter(bp =>
      bp.currentStock > 0 && bp.currentStock <= bp.product.minStock
    ).length;
    const outOfStock = businessProducts.filter(bp => bp.currentStock === 0).length;

    const totalStockValue = businessProducts.reduce((sum, bp) =>
      sum + (bp.currentStock * Number(bp.customPrice)), 0
    );

    return {
      totalProducts,
      configuredProducts,
      notConfiguredProducts: totalProducts - configuredProducts,
      inStockProducts: inStock,
      lowStockProducts: lowStock,
      outOfStockProducts: outOfStock,
      totalStockValue,
      averageStockLevel: configuredProducts > 0 ?
        businessProducts.reduce((sum, bp) => sum + bp.currentStock, 0) / configuredProducts : 0
    };
  }

  /**
   * Transforma un producto de Prisma a BusinessProductCatalogItem
   */
  private transformToBusinessProductCatalogItem(
    product: any,
    businessId: number
  ): BusinessProductCatalogItem {
    const businessProduct = product.businessProducts?.[0] || null;
    const effectivePrice = businessProduct ? Number(businessProduct.customPrice) : Number(product.sellingPrice);
    const effectiveStock = businessProduct ? businessProduct.currentStock : 0;
    const isAvailableInBusiness = !!businessProduct;

    let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NOT_CONFIGURED';

    if (!isAvailableInBusiness) {
      stockStatus = 'NOT_CONFIGURED';
    } else if (effectiveStock === 0) {
      stockStatus = 'OUT_OF_STOCK';
    } else if (effectiveStock <= product.minStock) {
      stockStatus = 'LOW_STOCK';
    } else {
      stockStatus = 'IN_STOCK';
    }

    return {
      id: product.id,
      categoryId: product.categoryId,
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      description: product.description,
      brand: product.brand,
      model: product.model,
      unit: product.unit,
      weight: product.weight ? Number(product.weight) : undefined,
      dimensions: product.dimensions,
      taxType: product.taxType,
      taxRate: Number(product.taxRate),
      minStock: product.minStock,
      maxStock: product.maxStock,
      reorderPoint: product.reorderPoint,
      isActive: product.isActive,
      status: product.status,
      expiryDate: product.expiryDate?.toISOString(),
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description
      } : undefined,
      businessProduct: businessProduct ? {
        id: businessProduct.id,
        businessId: businessProduct.businessId,
        customPrice: Number(businessProduct.customPrice),
        currentStock: businessProduct.currentStock,
        reservedStock: businessProduct.reservedStock,
        availableStock: businessProduct.availableStock,
        lastRestock: businessProduct.lastRestock,
        createdAt: businessProduct.createdAt,
        updatedAt: businessProduct.updatedAt
      } : null,
      effectivePrice,
      effectiveStock,
      isAvailableInBusiness,
      stockStatus
    };
  }

  /**
   * Calcula el resumen del catálogo
   */
  private calculateSummary(items: BusinessProductCatalogItem[]) {
    return {
      totalProducts: items.length,
      configuredProducts: items.filter(item => item.isAvailableInBusiness).length,
      notConfiguredProducts: items.filter(item => !item.isAvailableInBusiness).length,
      inStockProducts: items.filter(item => item.stockStatus === 'IN_STOCK').length,
      lowStockProducts: items.filter(item => item.stockStatus === 'LOW_STOCK').length,
      outOfStockProducts: items.filter(item => item.stockStatus === 'OUT_OF_STOCK').length
    };
  }
}
