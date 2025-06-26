import { PrismaClient, ProductStatus, TaxType } from '../../prisma/generated';
import { Decimal } from '@prisma/client/runtime/library';
import { IProductRepository } from '../interfaces/repositories/IProductRepository';
import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
  ProductStats,
  ProductSearchResult
} from '../types/api';
import { PaginationParams } from '../types/pagination';

export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToProductResponse(product: any): ProductResponse {
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

  async findById(id: number): Promise<ProductResponse | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    return product ? this.mapToProductResponse(product) : null;
  }

  async findMany(
    paginationParams: PaginationParams,
    additionalFilters?: {
      categoryId?: number;
      status?: string;
      isActive?: boolean;
      minStock?: number;
      maxStock?: number;
      minPrice?: number;
      maxPrice?: number;
      brand?: string;
      taxType?: string;
    }
  ): Promise<ProductListResponse> {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = paginationParams;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Additional filters
    if (additionalFilters?.categoryId) {
      where.categoryId = additionalFilters.categoryId;
    }
    if (additionalFilters?.status) {
      where.status = additionalFilters.status as ProductStatus;
    }
    if (additionalFilters?.isActive !== undefined) {
      where.isActive = additionalFilters.isActive;
    }
    if (additionalFilters?.minStock !== undefined) {
      where.minStock = { gte: additionalFilters.minStock };
    }
    if (additionalFilters?.maxStock !== undefined) {
      where.maxStock = { lte: additionalFilters.maxStock };
    }
    if (additionalFilters?.minPrice !== undefined) {
      where.sellingPrice = { gte: new Decimal(additionalFilters.minPrice) };
    }
    if (additionalFilters?.maxPrice !== undefined) {
      where.sellingPrice = { ...where.sellingPrice, lte: new Decimal(additionalFilters.maxPrice) };
    }
    if (additionalFilters?.brand) {
      where.brand = { contains: additionalFilters.brand, mode: 'insensitive' };
    }
    if (additionalFilters?.taxType) {
      where.taxType = additionalFilters.taxType as TaxType;
    }

    // Sorting
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    const mappedProducts = products.map(product => this.mapToProductResponse(product));

    const totalPages = Math.ceil(total / limit);

    return {
      data: mappedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      }
    };
  }

  async create(data: CreateProductRequest, businessId: number): Promise<ProductResponse> {
    const productData: any = {
      name: data.name,
      categoryId: data.categoryId,
      costPrice: new Decimal(data.costPrice),
      sellingPrice: new Decimal(data.sellingPrice),
      minStock: data.minStock || 0,
      reorderPoint: data.reorderPoint || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      status: data.status || ProductStatus.ACTIVE,
      taxType: data.taxType || TaxType.IVA_13,
      taxRate: new Decimal(data.taxRate || 13),
    };

    // Add optional fields only if defined
    if (data.sku !== undefined) productData.sku = data.sku;
    if (data.barcode !== undefined) productData.barcode = data.barcode;
    if (data.description !== undefined) productData.description = data.description;
    if (data.brand !== undefined) productData.brand = data.brand;
    if (data.model !== undefined) productData.model = data.model;
    if (data.unit !== undefined) productData.unit = data.unit;
    if (data.weight !== undefined) productData.weight = new Decimal(data.weight);
    if (data.dimensions !== undefined) productData.dimensions = data.dimensions;
    if (data.maxStock !== undefined) productData.maxStock = data.maxStock;
    if (data.expiryDate !== undefined) productData.expiryDate = new Date(data.expiryDate);

    const product = await this.prisma.product.create({
      data: productData,
      include: { category: true },
    });

    return this.mapToProductResponse(product);
  }

  async update(id: number, data: UpdateProductRequest): Promise<ProductResponse> {
    const updateData: any = {};

    // Only update fields that are defined
    if (data.name !== undefined) updateData.name = data.name;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.barcode !== undefined) updateData.barcode = data.barcode;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.weight !== undefined) updateData.weight = new Decimal(data.weight);
    if (data.dimensions !== undefined) updateData.dimensions = data.dimensions;
    if (data.costPrice !== undefined) updateData.costPrice = new Decimal(data.costPrice);
    if (data.sellingPrice !== undefined) updateData.sellingPrice = new Decimal(data.sellingPrice);
    if (data.taxType !== undefined) updateData.taxType = data.taxType;
    if (data.taxRate !== undefined) updateData.taxRate = new Decimal(data.taxRate);
    if (data.minStock !== undefined) updateData.minStock = data.minStock;
    if (data.maxStock !== undefined) updateData.maxStock = data.maxStock;
    if (data.reorderPoint !== undefined) updateData.reorderPoint = data.reorderPoint;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.expiryDate !== undefined) updateData.expiryDate = new Date(data.expiryDate);

    updateData.updatedAt = new Date();

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return this.mapToProductResponse(product);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async search(query: string, businessId: number): Promise<ProductSearchResult[]> {
    if (query.length < 2) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
        businessProducts: {
          some: {
            businessId,
          },
        },
      },
      include: {
        category: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku || undefined,
      barcode: product.barcode || undefined,
      brand: product.brand || undefined,
      sellingPrice: Number(product.sellingPrice),
      status: product.status,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
      } : undefined,
    }));
  }

  async findByCategory(categoryId: number, businessId: number): Promise<ProductResponse[]> {
    const products = await this.prisma.product.findMany({
      where: {
        categoryId,
        businessProducts: {
          some: {
            businessId,
          },
        },
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    return products.map(product => this.mapToProductResponse(product));
  }

  async findByStatus(status: string, businessId: number): Promise<ProductResponse[]> {
    const products = await this.prisma.product.findMany({
      where: {
        status: status as ProductStatus,
        businessProducts: {
          some: {
            businessId,
          },
        },
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    return products.map(product => this.mapToProductResponse(product));
  }

  async findByBrand(brand: string, businessId: number): Promise<ProductResponse[]> {
    const products = await this.prisma.product.findMany({
      where: {
        brand: { contains: brand, mode: 'insensitive' },
        businessProducts: {
          some: {
            businessId,
          },
        },
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    return products.map(product => this.mapToProductResponse(product));
  }

  async findLowStock(businessId: number): Promise<ProductResponse[]> {
    const products = await this.prisma.product.findMany({
      where: {
        businessProducts: {
          some: {
            businessId,
            currentStock: {
              lte: 10,
            },
          },
        },
      },
      include: {
        category: true,
        businessProducts: {
          where: { businessId },
        },
      },
      orderBy: { name: 'asc' },
    });

    return products.map(product => this.mapToProductResponse(product));
  }

  async findOutOfStock(businessId: number): Promise<ProductResponse[]> {
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { status: ProductStatus.OUT_OF_STOCK },
          {
            businessProducts: {
              some: {
                businessId,
                currentStock: 0,
              },
            },
          },
        ],
      },
      include: {
        category: true,
        businessProducts: {
          where: { businessId },
        },
      },
      orderBy: { name: 'asc' },
    });

    return products.map(product => this.mapToProductResponse(product));
  }

  async findBySku(sku: string, businessId: number): Promise<ProductResponse | null> {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        businessProducts: {
          where: { businessId },
        },
      },
    });

    return product ? this.mapToProductResponse(product) : null;
  }

  async findByBarcode(barcode: string, businessId: number): Promise<ProductResponse | null> {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        businessProducts: {
          where: { businessId },
        },
      },
    });

    return product ? this.mapToProductResponse(product) : null;
  }

  async getStats(businessId: number): Promise<ProductStats> {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      discontinuedProducts,
      outOfStockProducts,
      lowStockProducts,
      priceStats,
    ] = await Promise.all([
      this.prisma.product.count({
        where: {
          businessProducts: {
            some: { businessId },
          },
        },
      }),
      this.prisma.product.count({
        where: {
          status: ProductStatus.ACTIVE,
          businessProducts: {
            some: { businessId },
          },
        },
      }),
      this.prisma.product.count({
        where: {
          status: ProductStatus.INACTIVE,
          businessProducts: {
            some: { businessId },
          },
        },
      }),
      this.prisma.product.count({
        where: {
          status: ProductStatus.DISCONTINUED,
          businessProducts: {
            some: { businessId },
          },
        },
      }),
      this.prisma.product.count({
        where: {
          status: ProductStatus.OUT_OF_STOCK,
          businessProducts: {
            some: { businessId },
          },
        },
      }),
      this.prisma.product.count({
        where: {
          businessProducts: {
            some: {
              businessId,
              currentStock: {
                lte: 10,
              },
            },
          },
        },
      }),
      this.prisma.product.aggregate({
        where: {
          businessProducts: {
            some: { businessId },
          },
        },
        _avg: {
          sellingPrice: true,
        },
        _sum: {
          sellingPrice: true,
        },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      discontinuedProducts,
      outOfStockProducts,
      lowStockProducts,
      averagePrice: Number(priceStats._avg.sellingPrice) || 0,
      totalValue: Number(priceStats._sum.sellingPrice) || 0,
    };
  }

  async existsBySku(sku: string, businessId: number, excludeId?: number): Promise<boolean> {
    const where: any = { sku };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.product.count({ where });
    return count > 0;
  }

  async existsByBarcode(barcode: string, businessId: number, excludeId?: number): Promise<boolean> {
    const where: any = { barcode };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.product.count({ where });
    return count > 0;
  }
}