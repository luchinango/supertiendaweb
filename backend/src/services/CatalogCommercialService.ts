import {
  Prisma,
  PrismaClient,
  ProductVisibility,
  CategoryVisibility,
  InventoryTransactionType,
} from '../../generated';
import { Decimal } from '@prisma/client/runtime/library';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../errors';
import { TenantAuthUser } from '../helpers/tenantContext';
import {
  SyncIdMapping,
  SyncPushOperation,
  SyncPushResultItem,
} from '../types/syncTypes';
import {
  AdoptResultDto,
  AdoptSharedProductBody,
  CreatePrivateCategoryBody,
  CreatePrivateProductBody,
  PriceUpdateResultDto,
  PrivateCategoryDto,
  PrivateProductCommercialDto,
  PrivateProductListResponse,
  UpdateBusinessProductPriceBody,
  UpdatePrivateCategoryBody,
  UpdatePrivateProductBody,
} from '../types/catalogCommercialTypes';
type Tx = Prisma.TransactionClient;

const DEFAULT_DEVICE = 'commercial-http';

/**
 * Núcleo de reglas comerciales de catálogo privado.
 * SyncService.dispatch y los endpoints unitarios HTTP invocan estos handlers
 * (las mutaciones HTTP pasan por SyncService.push → mismos locks/idempotencia).
 */
export class CatalogCommercialService {
  constructor(private prisma: PrismaClient) {}

  assertCatalogAdmin(actor: TenantAuthUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenError(
        'Solo ADMIN empresarial puede administrar catálogo privado',
        'FORBIDDEN_ROLE'
      );
    }
  }

  // ─── Handlers (misma lógica que usaba SyncService) ─────────────────────

  async handleProductPrivateCreate(
    tx: Tx,
    actor: TenantAuthUser,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    const p = op.payload;
    const name = String(p.name || '').trim();
    const categoryServerId = Number(p.categoryServerId);
    const customPrice = Number(p.customPrice);
    const initialStock = Number(p.initialStock ?? 0);
    const localEntityId = String(p.localEntityId || '');
    const localBpId = String(p.localBusinessProductId || p.localEntityId || '');

    if (!name || !categoryServerId || Number.isNaN(customPrice)) {
      return this.rej(op, 'VALIDATION', 'name, categoryServerId y customPrice son requeridos');
    }
    if (initialStock < 0) {
      return this.rej(op, 'VALIDATION', 'initialStock no puede ser negativo');
    }

    const category = await tx.category.findFirst({
      where: {
        id: categoryServerId,
        deletedAt: null,
        OR: [
          { visibility: CategoryVisibility.PLATFORM_SHARED, businessId: null },
          { visibility: CategoryVisibility.BUSINESS_PRIVATE, businessId: actor.businessId },
        ],
      },
    });
    if (!category) {
      return this.rej(op, 'CATEGORY_NOT_FOUND', 'Categoría no visible para la empresa');
    }

    const sku = p.sku != null ? String(p.sku) : null;
    const barcode = p.barcode != null ? String(p.barcode) : null;

    if (sku) {
      const clash = await tx.product.findFirst({
        where: {
          sku,
          visibility: ProductVisibility.BUSINESS_PRIVATE,
          businessId: actor.businessId,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (clash) {
        return this.rej(op, 'SKU_COLLISION', 'SKU duplicado en ámbito privado');
      }
    }
    if (barcode) {
      const clash = await tx.product.findFirst({
        where: {
          barcode,
          visibility: ProductVisibility.BUSINESS_PRIVATE,
          businessId: actor.businessId,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (clash) {
        return this.rej(op, 'SKU_COLLISION', 'Barcode duplicado en ámbito privado');
      }
    }

    const product = await tx.product.create({
      data: {
        name,
        categoryId: categoryServerId,
        businessId: actor.businessId,
        visibility: ProductVisibility.BUSINESS_PRIVATE,
        sku,
        barcode,
        costPrice: new Decimal(Number(p.costPrice ?? 0)),
        sellingPrice: new Decimal(Number(p.sellingPrice ?? customPrice)),
        unit: p.unit != null ? String(p.unit) : 'pcs',
        description: p.description != null ? String(p.description) : undefined,
        brand: p.brand != null ? String(p.brand) : undefined,
        version: 1,
        createdBy: actor.userId,
        updatedBy: actor.userId,
      },
    });

    const bp = await tx.businessProduct.create({
      data: {
        businessId: actor.businessId,
        productId: product.id,
        customPrice: new Decimal(customPrice),
        currentStock: initialStock,
        reservedStock: 0,
        availableStock: initialStock,
        version: 1,
      },
    });

    if (initialStock !== 0) {
      await tx.inventoryTransaction.create({
        data: {
          businessId: actor.businessId,
          productId: product.id,
          userId: actor.userId,
          transactionType: InventoryTransactionType.ADJUSTMENT,
          quantity: initialStock,
          unitCost: new Decimal(Number(p.costPrice ?? 0)),
          totalCost: new Decimal(Number(p.costPrice ?? 0) * initialStock),
          referenceType: 'sync_stock_init',
          notes: `Sync init ${op.clientOperationId}`,
        },
      });
    }

    const mappings: SyncIdMapping[] = [];
    if (localEntityId) {
      mappings.push({ entityType: 'product', localEntityId, serverId: product.id });
    }
    if (localBpId) {
      mappings.push({ entityType: 'businessProduct', localEntityId: localBpId, serverId: bp.id });
    }

    return {
      clientOperationId: op.clientOperationId,
      status: 'applied',
      operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
      serverEntityId: product.id,
      version: product.version,
      idMappings: mappings,
    };
  }

  async handleProductUpdate(
    tx: Tx,
    actor: TenantAuthUser,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    const serverId = Number(op.payload.serverId);
    const baseVersion = op.baseVersion;
    if (!serverId || baseVersion == null) {
      return this.rej(op, 'VALIDATION', 'serverId y baseVersion requeridos');
    }

    const existing = await tx.product.findFirst({
      where: {
        id: serverId,
        deletedAt: null,
        visibility: ProductVisibility.BUSINESS_PRIVATE,
        businessId: actor.businessId,
      },
    });
    if (!existing) {
      return this.rej(op, 'NOT_FOUND', 'Producto privado no encontrado');
    }
    if (existing.version !== baseVersion) {
      return {
        clientOperationId: op.clientOperationId,
        status: 'conflict',
        operationType: 'PRODUCT_UPDATE',
        code: 'VERSION_CONFLICT',
        retryable: false,
        server: {
          serverEntityId: existing.id,
          version: existing.version,
          payload: { name: existing.name, sku: existing.sku, barcode: existing.barcode },
        },
      };
    }

    const data: any = {
      updatedAt: new Date(),
      updatedBy: actor.userId,
      version: { increment: 1 },
    };
    const p = op.payload;
    if (p.name !== undefined) data.name = String(p.name).trim();
    if (p.sku !== undefined) data.sku = p.sku == null ? null : String(p.sku);
    if (p.barcode !== undefined) data.barcode = p.barcode == null ? null : String(p.barcode);
    if (p.description !== undefined) data.description = p.description;
    if (p.brand !== undefined) data.brand = p.brand;
    if (p.unit !== undefined) data.unit = p.unit;
    if (p.costPrice !== undefined) data.costPrice = new Decimal(Number(p.costPrice));
    if (p.sellingPrice !== undefined) data.sellingPrice = new Decimal(Number(p.sellingPrice));
    if (p.categoryServerId !== undefined) data.categoryId = Number(p.categoryServerId);

    try {
      const updated = await tx.product.updateMany({
        where: {
          id: serverId,
          businessId: actor.businessId,
          visibility: ProductVisibility.BUSINESS_PRIVATE,
          deletedAt: null,
          version: baseVersion,
        },
        data,
      });
      if (updated.count !== 1) {
        const fresh = await tx.product.findFirst({ where: { id: serverId } });
        return {
          clientOperationId: op.clientOperationId,
          status: 'conflict',
          operationType: 'PRODUCT_UPDATE',
          code: 'VERSION_CONFLICT',
          retryable: false,
          server: { serverEntityId: serverId, version: fresh?.version },
        };
      }
      return {
        clientOperationId: op.clientOperationId,
        status: 'applied',
        operationType: 'PRODUCT_UPDATE',
        serverEntityId: serverId,
        version: baseVersion + 1,
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return this.rej(op, 'SKU_COLLISION', 'SKU/barcode duplicado');
      }
      throw err;
    }
  }

  async handleCategoryCreate(
    tx: Tx,
    actor: TenantAuthUser,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    const name = String(op.payload.name || '').trim();
    const localEntityId = String(op.payload.localEntityId || '');
    if (name.length < 2) {
      return this.rej(op, 'VALIDATION', 'Nombre de categoría inválido');
    }
    try {
      const cat = await tx.category.create({
        data: {
          name,
          businessId: actor.businessId,
          visibility: CategoryVisibility.BUSINESS_PRIVATE,
          description: op.payload.description != null ? String(op.payload.description) : undefined,
          parentId: op.payload.parentServerId != null ? Number(op.payload.parentServerId) : undefined,
          sortOrder: op.payload.sortOrder != null ? Number(op.payload.sortOrder) : 0,
          version: 1,
          createdBy: actor.userId,
          updatedBy: actor.userId,
        },
      });
      return {
        clientOperationId: op.clientOperationId,
        status: 'applied',
        operationType: 'CATEGORY_PRIVATE_CREATE',
        serverEntityId: cat.id,
        version: cat.version,
        idMappings: localEntityId
          ? [{ entityType: 'category', localEntityId, serverId: cat.id }]
          : [],
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return this.rej(op, 'CATEGORY_NAME_COLLISION', 'Nombre de categoría duplicado');
      }
      throw err;
    }
  }

  async handleCategoryUpdate(
    tx: Tx,
    actor: TenantAuthUser,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    const serverId = Number(op.payload.serverId);
    const baseVersion = op.baseVersion;
    if (!serverId || baseVersion == null) {
      return this.rej(op, 'VALIDATION', 'serverId y baseVersion requeridos');
    }
    const existing = await tx.category.findFirst({
      where: {
        id: serverId,
        deletedAt: null,
        visibility: CategoryVisibility.BUSINESS_PRIVATE,
        businessId: actor.businessId,
      },
    });
    if (!existing) {
      return this.rej(op, 'NOT_FOUND', 'Categoría privada no encontrada');
    }
    if (existing.version !== baseVersion) {
      return {
        clientOperationId: op.clientOperationId,
        status: 'conflict',
        operationType: 'CATEGORY_UPDATE',
        code: 'VERSION_CONFLICT',
        retryable: false,
        server: {
          serverEntityId: existing.id,
          version: existing.version,
          payload: { name: existing.name },
        },
      };
    }
    try {
      const updated = await tx.category.updateMany({
        where: {
          id: serverId,
          businessId: actor.businessId,
          visibility: CategoryVisibility.BUSINESS_PRIVATE,
          deletedAt: null,
          version: baseVersion,
        },
        data: {
          ...(op.payload.name !== undefined ? { name: String(op.payload.name).trim() } : {}),
          ...(op.payload.description !== undefined
            ? { description: op.payload.description as string }
            : {}),
          updatedAt: new Date(),
          updatedBy: actor.userId,
          version: { increment: 1 },
        },
      });
      if (updated.count !== 1) {
        const fresh = await tx.category.findFirst({ where: { id: serverId } });
        return {
          clientOperationId: op.clientOperationId,
          status: 'conflict',
          operationType: 'CATEGORY_UPDATE',
          code: 'VERSION_CONFLICT',
          retryable: false,
          server: { serverEntityId: serverId, version: fresh?.version },
        };
      }
      return {
        clientOperationId: op.clientOperationId,
        status: 'applied',
        operationType: 'CATEGORY_UPDATE',
        serverEntityId: serverId,
        version: baseVersion + 1,
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return this.rej(op, 'CATEGORY_NAME_COLLISION', 'Nombre duplicado');
      }
      throw err;
    }
  }

  async handleBpUpsert(
    tx: Tx,
    actor: TenantAuthUser,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    const productId = Number(op.payload.productId);
    const customPrice = Number(op.payload.customPrice);
    const localEntityId = String(op.payload.localEntityId || '');
    if (!productId || Number.isNaN(customPrice) || customPrice < 0) {
      return this.rej(op, 'VALIDATION', 'productId y customPrice válidos requeridos');
    }

    const product = await tx.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        OR: [
          { visibility: ProductVisibility.PLATFORM_SHARED, businessId: null },
          { visibility: ProductVisibility.BUSINESS_PRIVATE, businessId: actor.businessId },
        ],
      },
    });
    if (!product) {
      return this.rej(op, 'PRODUCT_NOT_FOUND', 'Producto no disponible');
    }

    const active = await tx.businessProduct.findFirst({
      where: { businessId: actor.businessId, productId, deletedAt: null },
    });

    if (active) {
      if (op.baseVersion != null && active.version !== op.baseVersion) {
        return {
          clientOperationId: op.clientOperationId,
          status: 'conflict',
          operationType: 'BP_UPSERT',
          code: 'VERSION_CONFLICT',
          retryable: false,
          server: {
            serverEntityId: active.id,
            version: active.version,
            payload: { customPrice: Number(active.customPrice), productId },
          },
        };
      }
      const updated = await tx.businessProduct.update({
        where: { id: active.id },
        data: {
          customPrice: new Decimal(customPrice),
          updatedAt: new Date(),
          version: { increment: 1 },
        },
      });
      return {
        clientOperationId: op.clientOperationId,
        status: 'applied',
        operationType: 'BP_UPSERT',
        serverEntityId: updated.id,
        version: updated.version,
        idMappings: localEntityId
          ? [{ entityType: 'businessProduct', localEntityId, serverId: updated.id }]
          : [],
      };
    }

    // Soft-deleted exists: do NOT reactivate — create new active row
    const created = await tx.businessProduct.create({
      data: {
        businessId: actor.businessId,
        productId,
        customPrice: new Decimal(customPrice),
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0,
        version: 1,
      },
    });
    return {
      clientOperationId: op.clientOperationId,
      status: 'applied',
      operationType: 'BP_UPSERT',
      serverEntityId: created.id,
      version: created.version,
      idMappings: localEntityId
        ? [{ entityType: 'businessProduct', localEntityId, serverId: created.id }]
        : [],
    };
  }

  // ─── Lectura ────────────────────────────────────────────────────────────

  async listPrivateProducts(
    actor: TenantAuthUser,
    opts: { page?: number; limit?: number; search?: string }
  ): Promise<PrivateProductListResponse> {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
    const search = opts.search?.trim();

    const where: Prisma.ProductWhereInput = {
      visibility: ProductVisibility.BUSINESS_PRIVATE,
      businessId: actor.businessId,
      deletedAt: null,
      businessProducts: {
        some: { businessId: actor.businessId, deletedAt: null },
      },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { barcode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          businessProducts: {
            where: { businessId: actor.businessId, deletedAt: null },
            take: 1,
          },
        },
      }),
    ]);

    const items = products
      .map((p) => {
        const bp = p.businessProducts[0];
        if (!bp) return null;
        return {
          productId: p.id,
          businessProductId: bp.id,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          categoryId: p.categoryId,
          customPrice: Number(bp.customPrice),
          currentStock: bp.currentStock,
          availableStock: bp.availableStock,
          version: p.version,
          businessProductVersion: bp.version,
          updatedAt: p.updatedAt.toISOString(),
        };
      })
      .filter(Boolean) as PrivateProductListResponse['items'];

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  // ─── HTTP: mutaciones vía SyncService.push (misma idempotencia) ─────────

  async createPrivateProduct(
    actor: TenantAuthUser,
    idempotencyKey: string,
    body: CreatePrivateProductBody,
    deviceId = DEFAULT_DEVICE
  ): Promise<PrivateProductCommercialDto> {
    this.assertCatalogAdmin(actor);
    const result = await this.pushOne(actor, deviceId, {
      clientOperationId: idempotencyKey,
      operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
      payload: { ...body },
    });
    this.throwIfFailed(result);
    return this.loadPrivateProductDto(actor, result);
  }

  async updatePrivateProduct(
    actor: TenantAuthUser,
    productId: number,
    idempotencyKey: string,
    body: UpdatePrivateProductBody,
    deviceId = DEFAULT_DEVICE
  ): Promise<PrivateProductCommercialDto> {
    this.assertCatalogAdmin(actor);
    const result = await this.pushOne(actor, deviceId, {
      clientOperationId: idempotencyKey,
      operationType: 'PRODUCT_UPDATE',
      baseVersion: body.baseVersion,
      payload: {
        serverId: productId,
        name: body.name,
        sku: body.sku,
        barcode: body.barcode,
        description: body.description,
        brand: body.brand,
        unit: body.unit,
        costPrice: body.costPrice,
        sellingPrice: body.sellingPrice,
        categoryServerId: body.categoryServerId,
      },
    });
    this.throwIfFailed(result);
    return this.loadPrivateProductDto(actor, result, productId);
  }

  async createPrivateCategory(
    actor: TenantAuthUser,
    idempotencyKey: string,
    body: CreatePrivateCategoryBody,
    deviceId = DEFAULT_DEVICE
  ): Promise<PrivateCategoryDto> {
    this.assertCatalogAdmin(actor);
    const result = await this.pushOne(actor, deviceId, {
      clientOperationId: idempotencyKey,
      operationType: 'CATEGORY_PRIVATE_CREATE',
      payload: { ...body },
    });
    this.throwIfFailed(result);
    const cat = await this.prisma.category.findFirst({
      where: {
        id: result.serverEntityId!,
        businessId: actor.businessId,
        visibility: CategoryVisibility.BUSINESS_PRIVATE,
      },
    });
    if (!cat) {
      throw new NotFoundError('Categoría creada no encontrada', 'NOT_FOUND');
    }
    return {
      categoryId: cat.id,
      version: result.version ?? cat.version,
      name: cat.name,
      visibility: cat.visibility,
      clientOperationId: result.clientOperationId,
      status: result.status,
      idMappings: result.idMappings,
    };
  }

  async updatePrivateCategory(
    actor: TenantAuthUser,
    categoryId: number,
    idempotencyKey: string,
    body: UpdatePrivateCategoryBody,
    deviceId = DEFAULT_DEVICE
  ): Promise<PrivateCategoryDto> {
    this.assertCatalogAdmin(actor);
    const result = await this.pushOne(actor, deviceId, {
      clientOperationId: idempotencyKey,
      operationType: 'CATEGORY_UPDATE',
      baseVersion: body.baseVersion,
      payload: {
        serverId: categoryId,
        name: body.name,
        description: body.description,
      },
    });
    this.throwIfFailed(result);
    const cat = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        businessId: actor.businessId,
        visibility: CategoryVisibility.BUSINESS_PRIVATE,
        deletedAt: null,
      },
    });
    if (!cat) {
      throw new NotFoundError('Categoría privada no encontrada', 'NOT_FOUND');
    }
    return {
      categoryId: cat.id,
      version: result.version ?? cat.version,
      name: cat.name,
      visibility: cat.visibility,
      clientOperationId: result.clientOperationId,
      status: result.status,
      idMappings: result.idMappings,
    };
  }

  async adoptSharedProduct(
    actor: TenantAuthUser,
    productId: number,
    idempotencyKey: string,
    body: AdoptSharedProductBody,
    deviceId = DEFAULT_DEVICE
  ): Promise<AdoptResultDto> {
    this.assertCatalogAdmin(actor);
    const shared = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        visibility: ProductVisibility.PLATFORM_SHARED,
        businessId: null,
      },
    });
    if (!shared) {
      throw new NotFoundError('Producto compartido no encontrado o inactivo', 'NOT_FOUND');
    }
    const result = await this.pushOne(actor, deviceId, {
      clientOperationId: idempotencyKey,
      operationType: 'BP_UPSERT',
      payload: {
        productId,
        customPrice: body.customPrice,
        localEntityId: body.localEntityId,
      },
    });
    this.throwIfFailed(result);
    const bp = await this.prisma.businessProduct.findFirst({
      where: { id: result.serverEntityId!, businessId: actor.businessId, deletedAt: null },
    });
    if (!bp) {
      throw new NotFoundError('BusinessProduct no encontrado tras adopción', 'NOT_FOUND');
    }
    return {
      businessProductId: bp.id,
      productId: bp.productId,
      version: result.version ?? bp.version,
      customPrice: Number(bp.customPrice),
      clientOperationId: result.clientOperationId,
      status: result.status,
      idMappings: result.idMappings,
    };
  }

  async updateBusinessProductPrice(
    actor: TenantAuthUser,
    businessProductId: number,
    idempotencyKey: string,
    body: UpdateBusinessProductPriceBody,
    deviceId = DEFAULT_DEVICE
  ): Promise<PriceUpdateResultDto> {
    this.assertCatalogAdmin(actor);
    const bp = await this.prisma.businessProduct.findFirst({
      where: {
        id: businessProductId,
        businessId: actor.businessId,
        deletedAt: null,
      },
    });
    if (!bp) {
      throw new NotFoundError('BusinessProduct no encontrado', 'NOT_FOUND');
    }
    const result = await this.pushOne(actor, deviceId, {
      clientOperationId: idempotencyKey,
      operationType: 'BP_UPSERT',
      baseVersion: body.baseVersion,
      payload: {
        productId: bp.productId,
        customPrice: body.customPrice,
      },
    });
    this.throwIfFailed(result);
    const fresh = await this.prisma.businessProduct.findFirst({
      where: { id: result.serverEntityId ?? businessProductId, businessId: actor.businessId },
    });
    return {
      businessProductId: fresh?.id ?? businessProductId,
      productId: bp.productId,
      version: result.version ?? fresh?.version ?? body.baseVersion + 1,
      customPrice: Number(fresh?.customPrice ?? body.customPrice),
      clientOperationId: result.clientOperationId,
      status: result.status,
    };
  }

  // ─── Internals ──────────────────────────────────────────────────────────

  private async pushOne(
    actor: TenantAuthUser,
    deviceId: string,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    // Lazy require evita ciclo SyncService ↔ CatalogCommercialService en carga de módulo.
    const { SyncService } = require('./SyncService') as typeof import('./SyncService');
    const sync = new SyncService(this.prisma);
    const res = await sync.push(actor, deviceId, { operations: [op] });
    return res.results[0];
  }

  private throwIfFailed(result: SyncPushResultItem): void {
    if (result.status === 'applied' || result.status === 'duplicate') {
      return;
    }
    const code = result.code || 'REJECTED';
    const message = result.message || code;
    const details = result.server ? { server: result.server } : undefined;
    if (result.status === 'conflict' || code === 'VERSION_CONFLICT') {
      throw new ConflictError(message, 'VERSION_CONFLICT', details);
    }
    if (code === 'FORBIDDEN_ROLE') {
      throw new ForbiddenError(message, 'FORBIDDEN_ROLE', details);
    }
    if (
      code === 'NOT_FOUND' ||
      code === 'PRODUCT_NOT_FOUND' ||
      code === 'CATEGORY_NOT_FOUND'
    ) {
      throw new NotFoundError(message, code, details);
    }
    if (
      code === 'SKU_COLLISION' ||
      code === 'CATEGORY_NAME_COLLISION' ||
      code === 'IDEMPOTENCY_PAYLOAD_MISMATCH'
    ) {
      throw new ConflictError(message, code, details);
    }
    throw new ValidationError(message, code, details);
  }

  private async loadPrivateProductDto(
    actor: TenantAuthUser,
    result: SyncPushResultItem,
    productIdHint?: number
  ): Promise<PrivateProductCommercialDto> {
    const productId =
      result.idMappings?.find((m) => m.entityType === 'product')?.serverId ??
      result.serverEntityId ??
      productIdHint;
    if (!productId) {
      throw new NotFoundError('Producto no resuelto tras operación', 'NOT_FOUND');
    }
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        businessId: actor.businessId,
        visibility: ProductVisibility.BUSINESS_PRIVATE,
        deletedAt: null,
      },
      include: {
        businessProducts: {
          where: { businessId: actor.businessId, deletedAt: null },
          take: 1,
        },
      },
    });
    if (!product || !product.businessProducts[0]) {
      throw new NotFoundError('Producto o BP no encontrado', 'NOT_FOUND');
    }
    const bp = product.businessProducts[0];
    return {
      productId: product.id,
      businessProductId: bp.id,
      version: result.version ?? product.version,
      businessProductVersion: bp.version,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      categoryId: product.categoryId,
      customPrice: Number(bp.customPrice),
      currentStock: bp.currentStock,
      availableStock: bp.availableStock,
      visibility: product.visibility,
      clientOperationId: result.clientOperationId,
      status: result.status,
      idMappings: result.idMappings,
    };
  }

  private rej(op: SyncPushOperation, code: string, message: string): SyncPushResultItem {
    return {
      clientOperationId: op.clientOperationId,
      status: 'rejected',
      operationType: String(op.operationType),
      code,
      message,
      retryable: false,
    };
  }
}
