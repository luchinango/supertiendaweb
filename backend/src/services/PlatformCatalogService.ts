import { PrismaClient, ProductStatus, TaxType } from '../../generated';
import { Decimal } from '@prisma/client/runtime/library';
import {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListResponse,
} from '../types/api';
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryListResponse,
} from '../types/categoryTypes';
import { PaginationParams } from '../types/pagination';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../errors';
import { PlatformAuthUser } from '../helpers/platformAuth';

/**
 * Catálogo maestro CODEMEDIIA (P1-H).
 * Solo invocable con PlatformAuthUser verificado.
 * No toca BusinessProduct, stock ni precios de tenant.
 */
export class PlatformCatalogService {
  constructor(private prisma: PrismaClient) {}

  private assertPlatform(actor: PlatformAuthUser): void {
    if (!actor?.userId || actor.role !== 'PLATFORM_ADMIN' || actor.businessId != null) {
      throw new ForbiddenError('Se requiere administrador de plataforma');
    }
  }

  private mapProduct(product: any): ProductResponse {
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
      expiryDate: product.expiryDate?.toISOString?.() || product.expiryDate || undefined,
      createdAt: product.createdAt.toISOString?.() || product.createdAt,
      updatedAt: product.updatedAt.toISOString?.() || product.updatedAt,
      deletedAt: product.deletedAt?.toISOString?.() || product.deletedAt || undefined,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy,
      deletedBy: product.deletedBy || undefined,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            description: product.category.description || undefined,
          }
        : undefined,
    };
  }

  private mapCategory(category: any): CategoryResponse {
    return {
      id: category.id,
      businessId: category.businessId ?? null,
      visibility: category.visibility,
      version: category.version ?? 1,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      deletedAt: category.deletedAt,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      deletedBy: category.deletedBy,
      productCount: category._count?.products ?? 0,
    };
  }

  async listProducts(
    actor: PlatformAuthUser,
    pagination: PaginationParams,
    search?: string
  ): Promise<ProductListResponse> {
    this.assertPlatform(actor);
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return {
      data: rows.map((p) => this.mapProduct(p)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async getProduct(actor: PlatformAuthUser, id: number): Promise<ProductResponse> {
    this.assertPlatform(actor);
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }
    return this.mapProduct(product);
  }

  async createProduct(
    actor: PlatformAuthUser,
    data: CreateProductRequest
  ): Promise<ProductResponse> {
    this.assertPlatform(actor);

    if (!data.name?.trim()) {
      throw new ValidationError('El nombre del producto es requerido');
    }
    if (data.costPrice < 0 || data.sellingPrice < 0) {
      throw new ValidationError('Los precios no pueden ser negativos');
    }

    const category = await this.prisma.category.findFirst({
      where: { id: data.categoryId, deletedAt: null },
    });
    if (!category) {
      throw new ValidationError('La categoría especificada no existe');
    }

    if (data.sku) {
      const exists = await this.prisma.product.findFirst({
        where: { sku: data.sku, visibility: 'PLATFORM_SHARED', deletedAt: null },
      });
      if (exists) throw new ConflictError(`Ya existe un producto con el SKU: ${data.sku}`);
    }
    if (data.barcode) {
      const exists = await this.prisma.product.findFirst({
        where: { barcode: data.barcode, visibility: 'PLATFORM_SHARED', deletedAt: null },
      });
      if (exists) {
        throw new ConflictError(`Ya existe un producto con el código de barras: ${data.barcode}`);
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: data.name.trim(),
        categoryId: data.categoryId,
        businessId: null,
        visibility: 'PLATFORM_SHARED',
        costPrice: new Decimal(data.costPrice),
        sellingPrice: new Decimal(data.sellingPrice),
        minStock: data.minStock ?? 0,
        reorderPoint: data.reorderPoint ?? 0,
        isActive: true,
        status: ProductStatus.ACTIVE,
        taxType: (data.taxType as TaxType) || TaxType.IVA_13,
        taxRate: new Decimal(data.taxRate ?? 13),
        sku: data.sku,
        barcode: data.barcode,
        description: data.description,
        brand: data.brand,
        model: data.model,
        unit: data.unit ?? 'pcs',
        weight: data.weight != null ? new Decimal(data.weight) : undefined,
        dimensions: data.dimensions,
        maxStock: data.maxStock,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        createdBy: actor.userId,
        updatedBy: actor.userId,
      },
      include: { category: true },
    });

    return this.mapProduct(product);
  }

  /**
   * Actualiza campos de catálogo maestro.
   * Campos de alto impacto (status/isActive) rechazados si el producto
   * ya está vinculado a alguna empresa (BusinessProduct).
   * Nunca modifica BusinessProduct / stock / customPrice.
   */
  async updateProduct(
    actor: PlatformAuthUser,
    id: number,
    data: UpdateProductRequest
  ): Promise<ProductResponse> {
    this.assertPlatform(actor);

    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { businessProducts: true } } },
    });
    if (!existing) {
      throw new NotFoundError('Producto no encontrado');
    }

    const linked = existing._count.businessProducts > 0;
    if (linked && (data.status !== undefined || data.isActive !== undefined)) {
      throw new ForbiddenError(
        'No se puede cambiar status/isActive de un producto vinculado a empresas. Contención P1-H.'
      );
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw new ValidationError('El nombre del producto es requerido');
    }
    if (data.costPrice !== undefined && data.costPrice < 0) {
      throw new ValidationError('El precio de costo no puede ser negativo');
    }
    if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
      throw new ValidationError('El precio de venta no puede ser negativo');
    }

    if (data.sku && data.sku !== existing.sku) {
      const clash = await this.prisma.product.findFirst({
        where: {
          sku: data.sku,
          visibility: 'PLATFORM_SHARED',
          deletedAt: null,
          id: { not: id },
        },
      });
      if (clash) throw new ConflictError(`Ya existe un producto con el SKU: ${data.sku}`);
    }
    if (data.barcode && data.barcode !== existing.barcode) {
      const clash = await this.prisma.product.findFirst({
        where: {
          barcode: data.barcode,
          visibility: 'PLATFORM_SHARED',
          deletedAt: null,
          id: { not: id },
        },
      });
      if (clash) {
        throw new ConflictError(`Ya existe un producto con el código de barras: ${data.barcode}`);
      }
    }

    if (data.categoryId !== undefined) {
      const category = await this.prisma.category.findFirst({
        where: { id: data.categoryId, deletedAt: null },
      });
      if (!category) throw new ValidationError('La categoría especificada no existe');
    }

    const updateData: any = {
      updatedBy: actor.userId,
      updatedAt: new Date(),
      version: { increment: 1 },
    };
    if (data.name !== undefined) updateData.name = data.name.trim();
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
    if (data.expiryDate !== undefined) updateData.expiryDate = new Date(data.expiryDate);
    // status/isActive solo si no hay vínculos
    if (!linked) {
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.status !== undefined) updateData.status = data.status;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return this.mapProduct(product);
  }

  async listCategories(
    actor: PlatformAuthUser,
    pagination: PaginationParams,
    search?: string
  ): Promise<CategoryListResponse> {
    this.assertPlatform(actor);
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [rows, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { products: true } } },
      }),
      this.prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return {
      items: rows.map((c) => this.mapCategory(c)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async createCategory(
    actor: PlatformAuthUser,
    data: CreateCategoryRequest
  ): Promise<CategoryResponse> {
    this.assertPlatform(actor);

    if (!data.name?.trim() || data.name.trim().length < 2) {
      throw new ValidationError('El nombre de la categoría es requerido');
    }

    const existing = await this.prisma.category.findFirst({
      where: {
        name: data.name.trim(),
        visibility: 'PLATFORM_SHARED',
        businessId: null,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ValidationError('Ya existe una categoría con ese nombre');
    }

    if (data.parentId) {
      const parent = await this.prisma.category.findFirst({
        where: { id: data.parentId, deletedAt: null },
      });
      if (!parent) throw new ValidationError('La categoría padre no existe');
    }

    const category = await this.prisma.category.create({
      data: {
        name: data.name.trim(),
        businessId: null,
        visibility: 'PLATFORM_SHARED',
        description: data.description,
        parentId: data.parentId,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        createdBy: actor.userId,
        updatedBy: actor.userId,
      },
      include: { _count: { select: { products: true } } },
    });

    return this.mapCategory(category);
  }

  async updateCategory(
    actor: PlatformAuthUser,
    id: number,
    data: UpdateCategoryRequest
  ): Promise<CategoryResponse> {
    this.assertPlatform(actor);

    const existing = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      throw new NotFoundError('Categoría no encontrada');
    }

    if (data.isActive === false && existing._count.products > 0) {
      throw new ForbiddenError(
        'No se puede desactivar una categoría con productos asociados'
      );
    }

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (name.length < 2) throw new ValidationError('Nombre de categoría inválido');
      const clash = await this.prisma.category.findFirst({
        where: {
          name,
          visibility: 'PLATFORM_SHARED',
          businessId: null,
          deletedAt: null,
          id: { not: id },
        },
      });
      if (clash) throw new ValidationError('Ya existe una categoría con ese nombre');
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        updatedBy: actor.userId,
        updatedAt: new Date(),
        version: { increment: 1 },
      },
      include: { _count: { select: { products: true } } },
    });

    return this.mapCategory(category);
  }
}
