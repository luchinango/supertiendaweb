import crypto from 'crypto';
import {
  Prisma,
  PrismaClient,
  ProductVisibility,
  CategoryVisibility,
  SyncOperationStatus,
  SyncOperationType,
  InventoryTransactionType,
} from '../../generated';
import { Decimal } from '@prisma/client/runtime/library';
import { ForbiddenError, ValidationError } from '../errors';
import { TenantAuthUser } from '../helpers/tenantContext';
import {
  SyncPushOperation,
  SyncPushRequest,
  SyncPushResponse,
  SyncPushResultItem,
  SyncPullChange,
  SyncPullResponse,
} from '../types/syncTypes';
import { CatalogCommercialService } from './CatalogCommercialService';
import { PosCashSyncService } from './PosCashSyncService';

const MAX_OPS = 50;
const MAX_BYTES = 512 * 1024;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const IMPLEMENTED = new Set<string>([
  'PRODUCT_PRIVATE_CREATE_WITH_BP',
  'PRODUCT_UPDATE',
  'CATEGORY_PRIVATE_CREATE',
  'CATEGORY_UPDATE',
  'BP_UPSERT',
  'STOCK_ADJUST',
  'SALE_CREATE',
  'CASH_OPEN',
  'CASH_CLOSE',
]);

const NOT_IMPLEMENTED = new Set<string>([
  'SALE_COMPLETE',
  'SALE_CANCEL',
  'CUSTOMER_CREATE',
]);

type Tx = Prisma.TransactionClient;

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

function canonicalHash(operationType: string, payload: Record<string, unknown>): string {
  return crypto
    .createHash('sha256')
    .update(stableStringify({ operationType, payload }))
    .digest('hex');
}

function advisoryKey(businessId: number, clientOperationId: string): bigint {
  const h = crypto
    .createHash('sha256')
    .update(`${businessId}:${clientOperationId}`)
    .digest();
  return h.readBigInt64BE(0);
}

function encodeCursor(parts: {
  snapshotAt: string;
  updatedAt: string;
  rank: number;
  entityType: string;
  id: number;
}): string {
  return Buffer.from(JSON.stringify(parts), 'utf8').toString('base64url');
}

function decodeCursor(cursor: string): {
  snapshotAt: string;
  updatedAt: string;
  rank: number;
  entityType: string;
  id: number;
} | null {
  if (!cursor) return null;
  try {
    const raw = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (
      typeof raw.snapshotAt !== 'string' ||
      typeof raw.updatedAt !== 'string' ||
      typeof raw.rank !== 'number' ||
      typeof raw.entityType !== 'string' ||
      typeof raw.id !== 'number'
    ) {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

const ENTITY_RANK: Record<string, number> = {
  category: 1,
  product: 2,
  businessProduct: 3,
};

export class SyncService {
  private catalog: CatalogCommercialService;
  private posCash: PosCashSyncService;

  constructor(private prisma: PrismaClient) {
    this.catalog = new CatalogCommercialService(prisma);
    this.posCash = new PosCashSyncService();
  }

  async push(
    actor: TenantAuthUser,
    deviceId: string,
    body: SyncPushRequest
  ): Promise<SyncPushResponse> {
    this.assertDeviceId(deviceId);
    if (body.businessId != null && Number(body.businessId) !== actor.businessId) {
      throw new ForbiddenError('No autorizado para acceder a datos de otra empresa');
    }
    if (!Array.isArray(body.operations)) {
      throw new ValidationError('operations es requerido');
    }
    if (body.operations.length > MAX_OPS) {
      throw new ValidationError(`Máximo ${MAX_OPS} operaciones por lote`);
    }
    const bytes = Buffer.byteLength(JSON.stringify(body), 'utf8');
    if (bytes > MAX_BYTES) {
      throw new ValidationError(`Payload excede ${MAX_BYTES} bytes`);
    }

    const results: SyncPushResultItem[] = [];
    for (const op of body.operations) {
      results.push(await this.processOne(actor, deviceId, op));
    }

    return {
      serverTime: new Date().toISOString(),
      results,
    };
  }

  async pull(
    actor: TenantAuthUser,
    deviceId: string,
    opts: { cursor?: string; limit?: number; streams?: string }
  ): Promise<SyncPullResponse> {
    this.assertDeviceId(deviceId);
    const limit = Math.min(Math.max(opts.limit ?? 100, 1), 200);
    const streams = (opts.streams || 'catalog,stock')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const wantCatalog = streams.includes('catalog');
    const wantStock = streams.includes('stock');
    if (!wantCatalog && !wantStock) {
      throw new ValidationError('streams debe incluir catalog y/o stock');
    }

    const decoded = opts.cursor ? decodeCursor(opts.cursor) : null;
    if (opts.cursor && !decoded) {
      throw new ValidationError('cursor inválido');
    }

    const serverNow = new Date();
    const snapshotAt = decoded?.snapshotAt ? new Date(decoded.snapshotAt) : serverNow;
    if (Number.isNaN(snapshotAt.getTime())) {
      throw new ValidationError('cursor snapshotAt inválido');
    }

    const bid = actor.businessId;
    const changes: SyncPullChange[] = [];
    // Keyset: fetch limit+1 per stream AFTER cursor (not "first N oldest" — that lost pages).
    const fetchN = limit + 1;

    if (wantCatalog) {
      const cats = await this.prisma.category.findMany({
        where: {
          AND: [
            { updatedAt: { lte: snapshotAt } },
            {
              OR: [
                { visibility: CategoryVisibility.PLATFORM_SHARED, businessId: null },
                { visibility: CategoryVisibility.BUSINESS_PRIVATE, businessId: bid },
              ],
            },
            this.keysetWhere(decoded, 'category'),
          ],
        },
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
        take: fetchN,
      });
      for (const c of cats) {
        changes.push({
          stream: 'catalog',
          entityType: 'category',
          serverId: c.id,
          version: c.version,
          updatedAt: c.updatedAt.toISOString(),
          deleted: c.deletedAt != null,
          deletedAt: c.deletedAt?.toISOString() ?? null,
          payload:
            c.deletedAt != null
              ? null
              : {
                  name: c.name,
                  description: c.description,
                  parentId: c.parentId,
                  visibility: c.visibility,
                  businessId: c.businessId,
                  isActive: c.isActive,
                  sortOrder: c.sortOrder,
                },
        });
      }

      const products = await this.prisma.product.findMany({
        where: {
          AND: [
            { updatedAt: { lte: snapshotAt } },
            {
              OR: [
                {
                  visibility: ProductVisibility.BUSINESS_PRIVATE,
                  businessId: bid,
                },
                {
                  visibility: ProductVisibility.PLATFORM_SHARED,
                  businessId: null,
                  businessProducts: { some: { businessId: bid } },
                },
              ],
            },
            this.keysetWhere(decoded, 'product'),
          ],
        },
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
        take: fetchN,
      });
      for (const p of products) {
        changes.push({
          stream: 'catalog',
          entityType: 'product',
          serverId: p.id,
          version: p.version,
          updatedAt: p.updatedAt.toISOString(),
          deleted: p.deletedAt != null,
          deletedAt: p.deletedAt?.toISOString() ?? null,
          payload:
            p.deletedAt != null
              ? null
              : {
                  name: p.name,
                  sku: p.sku,
                  barcode: p.barcode,
                  categoryId: p.categoryId,
                  visibility: p.visibility,
                  businessId: p.businessId,
                  costPrice: Number(p.costPrice),
                  sellingPrice: Number(p.sellingPrice),
                  /** IVA % del producto — usado por POS (SALE_CREATE) y totales FE (P2-C1.F3). */
                  taxRate: Number(p.taxRate ?? 13),
                  isActive: p.isActive,
                  status: p.status,
                  unit: p.unit,
                  brand: p.brand,
                },
        });
      }
    }

    if (wantStock) {
      const bps = await this.prisma.businessProduct.findMany({
        where: {
          AND: [
            { businessId: bid },
            { updatedAt: { lte: snapshotAt } },
            this.keysetWhere(decoded, 'businessProduct'),
          ],
        },
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
        take: fetchN,
      });
      for (const bp of bps) {
        changes.push({
          stream: 'stock',
          entityType: 'businessProduct',
          serverId: bp.id,
          version: bp.version,
          updatedAt: bp.updatedAt.toISOString(),
          deleted: bp.deletedAt != null,
          deletedAt: bp.deletedAt?.toISOString() ?? null,
          payload:
            bp.deletedAt != null
              ? { productId: bp.productId }
              : {
                  productId: bp.productId,
                  customPrice: Number(bp.customPrice),
                  currentStock: bp.currentStock,
                  reservedStock: bp.reservedStock,
                  availableStock: bp.availableStock,
                },
        });
      }
    }

    changes.sort((a, b) => {
      const ta = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (ta !== 0) return ta;
      const ra = ENTITY_RANK[a.entityType] - ENTITY_RANK[b.entityType];
      if (ra !== 0) return ra;
      if (a.entityType !== b.entityType) return a.entityType < b.entityType ? -1 : 1;
      return a.serverId - b.serverId;
    });

    const page = changes.slice(0, limit);
    const hasMore = changes.length > limit;
    let nextCursor = opts.cursor || '';
    if (page.length > 0) {
      const last = page[page.length - 1];
      nextCursor = encodeCursor({
        snapshotAt: snapshotAt.toISOString(),
        updatedAt: last.updatedAt,
        rank: ENTITY_RANK[last.entityType] ?? 99,
        entityType: last.entityType,
        id: last.serverId,
      });
    } else if (!decoded) {
      nextCursor = encodeCursor({
        snapshotAt: snapshotAt.toISOString(),
        updatedAt: snapshotAt.toISOString(),
        rank: 0,
        entityType: '',
        id: 0,
      });
    } else {
      nextCursor = opts.cursor!;
    }

    return {
      serverTime: serverNow.toISOString(),
      snapshotAt: snapshotAt.toISOString(),
      cursor: nextCursor,
      hasMore,
      changes: page,
    };
  }

  /**
   * Keyset AFTER cursor for one entity type within a multi-stream merge.
   * Order: (updatedAt, rank, entityType, id).
   */
  private keysetWhere(
    decoded: {
      snapshotAt: string;
      updatedAt: string;
      rank: number;
      entityType: string;
      id: number;
    } | null,
    entityType: 'category' | 'product' | 'businessProduct'
  ): Prisma.Enumerable<any> | object {
    if (!decoded || !decoded.entityType) {
      return {};
    }
    const rank = ENTITY_RANK[entityType];
    const ct = new Date(decoded.updatedAt);
    const cr = decoded.rank;
    const ce = decoded.entityType;
    const ci = decoded.id;

    const or: object[] = [{ updatedAt: { gt: ct } }];

    // Same timestamp, our stream ranks after cursor stream
    if (rank > cr) {
      or.push({ updatedAt: ct });
    } else if (rank === cr) {
      if (entityType > ce) {
        or.push({ updatedAt: ct });
      } else if (entityType === ce) {
        or.push({ updatedAt: ct, id: { gt: ci } });
      }
      // rank === cr && entityType < ce → nothing at same timestamp (already passed)
    }
    // rank < cr → only updatedAt > ct (already in or[0])

    return { OR: or };
  }

  private assertDeviceId(deviceId: string) {
    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length === 0) {
      throw new ValidationError('Header X-Device-Id es obligatorio');
    }
    if (deviceId.length > 64) {
      throw new ValidationError('X-Device-Id excede 64 caracteres');
    }
  }

  private async processOne(
    actor: TenantAuthUser,
    deviceId: string,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    if (!op?.clientOperationId || !UUID_RE.test(op.clientOperationId)) {
      return this.rejectLocal(op, 'INVALID_OPERATION', 'clientOperationId UUID inválido');
    }
    if (!op.operationType || typeof op.payload !== 'object' || op.payload == null) {
      return this.rejectLocal(op, 'INVALID_OPERATION', 'operationType/payload inválidos');
    }
    if (Array.isArray(op.dependsOn) && op.dependsOn.length > 0) {
      // Dependencies must already be applied in this business
      for (const dep of op.dependsOn) {
        const row = await this.prisma.syncOperation.findUnique({
          where: {
            businessId_clientOperationId: {
              businessId: actor.businessId,
              clientOperationId: dep,
            },
          },
        });
        if (!row || (row.status !== SyncOperationStatus.APPLIED && row.status !== SyncOperationStatus.DUPLICATE)) {
          return {
            clientOperationId: op.clientOperationId,
            status: 'rejected',
            operationType: String(op.operationType),
            code: 'DEPENDENCY_PENDING',
            message: `Dependencia no aplicada: ${dep}`,
            retryable: true,
          };
        }
      }
    }

    const operationType = String(op.operationType);
    const hash = canonicalHash(operationType, op.payload as Record<string, unknown>);

    // Catálogo privado / precio: solo ADMIN empresarial (EMPLOYEE no administra catálogo).
    const catalogAdminOps = new Set([
      'PRODUCT_PRIVATE_CREATE_WITH_BP',
      'PRODUCT_UPDATE',
      'CATEGORY_PRIVATE_CREATE',
      'CATEGORY_UPDATE',
      'BP_UPSERT',
    ]);
    if (catalogAdminOps.has(operationType) && actor.role !== 'ADMIN') {
      return {
        clientOperationId: op.clientOperationId,
        status: 'rejected',
        operationType,
        code: 'FORBIDDEN_ROLE',
        message: 'Solo ADMIN empresarial puede administrar catálogo privado',
        retryable: false,
      };
    }

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const lockKey = advisoryKey(actor.businessId, op.clientOperationId);
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

          const existing = await tx.syncOperation.findUnique({
            where: {
              businessId_clientOperationId: {
                businessId: actor.businessId,
                clientOperationId: op.clientOperationId,
              },
            },
          });

          if (existing) {
            if (existing.requestHash === hash) {
              const stored = existing.responseJson as unknown as SyncPushResultItem;
              return {
                ...stored,
                status: 'duplicate',
                clientOperationId: op.clientOperationId,
                operationType,
              };
            }
            return {
              clientOperationId: op.clientOperationId,
              status: 'rejected',
              operationType,
              code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
              message: 'clientOperationId reutilizado con payload distinto',
              retryable: false,
            };
          }

          if (NOT_IMPLEMENTED.has(operationType) || !IMPLEMENTED.has(operationType)) {
            const rejected: SyncPushResultItem = {
              clientOperationId: op.clientOperationId,
              status: 'rejected',
              operationType,
              code: 'NOT_IMPLEMENTED',
              message: `Operación ${operationType} no implementada en P2-C0.1B`,
              retryable: false,
            };
            await this.persist(tx, actor, deviceId, op, hash, SyncOperationStatus.REJECTED, rejected, 'NOT_IMPLEMENTED');
            return rejected;
          }

          // SAVEPOINT: unique violations abort the subxact; keep outer tx for REJECTED persist
          await tx.$executeRaw`SAVEPOINT sync_op_work`;
          let outcome: SyncPushResultItem;
          try {
            outcome = await this.dispatch(tx, actor, deviceId, op);
            await tx.$executeRaw`RELEASE SAVEPOINT sync_op_work`;
          } catch (dispatchErr: any) {
            await tx.$executeRaw`ROLLBACK TO SAVEPOINT sync_op_work`;
            if (dispatchErr?.code === 'P2002') {
              const isCash =
                operationType === 'CASH_OPEN' ||
                operationType === 'CASH_CLOSE' ||
                operationType === 'SALE_CREATE';
              outcome = {
                clientOperationId: op.clientOperationId,
                status: 'rejected',
                operationType,
                code: isCash ? 'CASH_ALREADY_OPEN' : 'SKU_COLLISION',
                message: isCash
                  ? 'Violación de unicidad de caja/venta'
                  : 'Violación de unicidad (SKU/barcode/nombre)',
                retryable: false,
              };
            } else {
              throw dispatchErr;
            }
          }

          const statusEnum =
            outcome.status === 'applied'
              ? SyncOperationStatus.APPLIED
              : outcome.status === 'conflict'
                ? SyncOperationStatus.CONFLICT
                : SyncOperationStatus.REJECTED;

          await this.persist(
            tx,
            actor,
            deviceId,
            op,
            hash,
            statusEnum,
            outcome,
            outcome.code ?? null,
            outcome.serverEntityId,
            outcome.idMappings?.[0]?.entityType
          );
          return outcome;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 20000 }
      );
    } catch (err: any) {
      // Transient / unexpected: do NOT persist REJECTED
      if (err?.code === 'P2002') {
        // Unique race — re-read
        const existing = await this.prisma.syncOperation.findUnique({
          where: {
            businessId_clientOperationId: {
              businessId: actor.businessId,
              clientOperationId: op.clientOperationId,
            },
          },
        });
        if (existing && existing.requestHash === hash) {
          const stored = existing.responseJson as unknown as SyncPushResultItem;
          return { ...stored, status: 'duplicate', clientOperationId: op.clientOperationId, operationType };
        }
        if (existing) {
          return {
            clientOperationId: op.clientOperationId,
            status: 'rejected',
            operationType,
            code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
            message: 'clientOperationId reutilizado con payload distinto',
            retryable: false,
          };
        }
      }
      throw err;
    }
  }

  private rejectLocal(
    op: SyncPushOperation | undefined,
    code: string,
    message: string
  ): SyncPushResultItem {
    return {
      clientOperationId: op?.clientOperationId || '00000000-0000-0000-0000-000000000000',
      status: 'rejected',
      operationType: String(op?.operationType || 'UNKNOWN'),
      code,
      message,
      retryable: false,
    };
  }

  private async persist(
    tx: Tx,
    actor: TenantAuthUser,
    deviceId: string,
    op: SyncPushOperation,
    hash: string,
    status: SyncOperationStatus,
    response: SyncPushResultItem,
    errorCode: string | null,
    entityServerId?: number,
    entityType?: string
  ) {
    await tx.syncOperation.create({
      data: {
        businessId: actor.businessId,
        clientOperationId: op.clientOperationId,
        deviceId,
        userId: actor.userId,
        operationType: op.operationType as SyncOperationType,
        requestHash: hash,
        status,
        responseJson: response as any,
        errorCode: errorCode,
        entityServerId: entityServerId ?? null,
        entityType: entityType ?? null,
      },
    });
  }

  private async dispatch(
    tx: Tx,
    actor: TenantAuthUser,
    deviceId: string,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    switch (String(op.operationType)) {
      case 'PRODUCT_PRIVATE_CREATE_WITH_BP':
        return this.catalog.handleProductPrivateCreate(tx, actor, op);
      case 'PRODUCT_UPDATE':
        return this.catalog.handleProductUpdate(tx, actor, op);
      case 'CATEGORY_PRIVATE_CREATE':
        return this.catalog.handleCategoryCreate(tx, actor, op);
      case 'CATEGORY_UPDATE':
        return this.catalog.handleCategoryUpdate(tx, actor, op);
      case 'BP_UPSERT':
        return this.catalog.handleBpUpsert(tx, actor, op);
      case 'STOCK_ADJUST':
        return this.handleStockAdjust(tx, actor, op);
      case 'CASH_OPEN':
        return this.posCash.handleCashOpen(tx, actor, deviceId, op);
      case 'CASH_CLOSE':
        return this.posCash.handleCashClose(tx, actor, deviceId, op);
      case 'SALE_CREATE':
        return this.posCash.handleSaleCreate(tx, actor, deviceId, op);
      default:
        return {
          clientOperationId: op.clientOperationId,
          status: 'rejected',
          operationType: String(op.operationType),
          code: 'NOT_IMPLEMENTED',
          message: 'Operación no soportada',
          retryable: false,
        };
    }
  }

  private async handleStockAdjust(
    tx: Tx,
    actor: TenantAuthUser,
    op: SyncPushOperation
  ): Promise<SyncPushResultItem> {
    const bpId = op.payload.businessProductId != null ? Number(op.payload.businessProductId) : null;
    const productId = op.payload.productId != null ? Number(op.payload.productId) : null;
    const delta = Number(op.payload.delta);
    const baseVersion = op.baseVersion;

    if (Number.isNaN(delta) || delta === 0) {
      return this.rej(op, 'VALIDATION', 'delta distinto de cero requerido');
    }
    if (baseVersion == null) {
      return this.rej(op, 'VALIDATION', 'baseVersion requerido para STOCK_ADJUST');
    }

    const bp = await tx.businessProduct.findFirst({
      where: {
        deletedAt: null,
        businessId: actor.businessId,
        ...(bpId ? { id: bpId } : {}),
        ...(productId && !bpId ? { productId } : {}),
      },
    });
    if (!bp) {
      return this.rej(op, 'NOT_FOUND', 'BusinessProduct activo no encontrado');
    }
    if (bp.version !== baseVersion) {
      return {
        clientOperationId: op.clientOperationId,
        status: 'conflict',
        operationType: 'STOCK_ADJUST',
        code: 'VERSION_CONFLICT',
        retryable: false,
        server: {
          serverEntityId: bp.id,
          version: bp.version,
          currentStock: bp.currentStock,
        },
      };
    }

    if (bp.currentStock + delta < 0) {
      return {
        clientOperationId: op.clientOperationId,
        status: 'rejected',
        operationType: 'STOCK_ADJUST',
        code: 'INSUFFICIENT_STOCK',
        message: `Stock insuficiente. Disponible: ${bp.currentStock}`,
        retryable: false,
        server: { currentStock: bp.currentStock, version: bp.version },
      };
    }

    const newStock = bp.currentStock + delta;
    const newAvailable = Math.max(0, newStock - bp.reservedStock);

    const updated = await tx.businessProduct.updateMany({
      where: {
        id: bp.id,
        businessId: actor.businessId,
        deletedAt: null,
        version: baseVersion,
        currentStock: bp.currentStock,
      },
      data: {
        currentStock: newStock,
        availableStock: newAvailable,
        updatedAt: new Date(),
        version: { increment: 1 },
        ...(delta > 0 ? { lastRestock: new Date() } : {}),
      },
    });

    if (updated.count !== 1) {
      const fresh = await tx.businessProduct.findFirst({ where: { id: bp.id } });
      return {
        clientOperationId: op.clientOperationId,
        status: 'conflict',
        operationType: 'STOCK_ADJUST',
        code: 'VERSION_CONFLICT',
        retryable: false,
        server: {
          serverEntityId: bp.id,
          version: fresh?.version,
          currentStock: fresh?.currentStock,
        },
      };
    }

    await tx.inventoryTransaction.create({
      data: {
        businessId: actor.businessId,
        productId: bp.productId,
        userId: actor.userId,
        transactionType: InventoryTransactionType.ADJUSTMENT,
        quantity: delta,
        unitCost: new Decimal(0),
        totalCost: new Decimal(0),
        referenceType: 'sync_stock_adjust',
        notes: `Sync STOCK_ADJUST ${op.clientOperationId}`,
      },
    });

    return {
      clientOperationId: op.clientOperationId,
      status: 'applied',
      operationType: 'STOCK_ADJUST',
      serverEntityId: bp.id,
      version: baseVersion + 1,
      server: { currentStock: newStock, availableStock: newAvailable },
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
