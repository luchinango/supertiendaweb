import { enqueueMutation, listOutbox, openOfflineDb } from '@/lib/offline';
import { newUuid } from '@/lib/offline/scope';
import type { TenantScope } from '@/lib/offline/types';
import { pendingSaleQtyByBp } from '@/lib/pos/posSaleOfflineService';
import type {
  AdoptSharedInput,
  CatalogVisibilityFilter,
  CommercialCatalogRow,
  CreatePrivateCategoryInput,
  CreatePrivateProductInput,
  StockAdjustInput,
  UpdatePrivateCategoryInput,
  UpdatePrivateProductInput,
} from './commercialTypes';

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function str(v: unknown): string | null {
  if (v == null) return null;
  return String(v);
}

/** Lista comercial: productos con BP activo; precio solo desde customPrice. */
export async function listCommercialCatalog(
  scope: TenantScope,
  opts?: { search?: string; visibility?: CatalogVisibilityFilter }
): Promise<CommercialCatalogRow[]> {
  const db = await openOfflineDb(scope);
  const [products, categories, bps, outbox, saleReserved] = await Promise.all([
    db.products.filter((p) => !p.deleted || p.syncStatus === 'pending').toArray(),
    db.categories.toArray(),
    db.businessProducts.filter((b) => !b.deleted || b.syncStatus === 'pending').toArray(),
    listOutbox(scope),
    pendingSaleQtyByBp(scope),
  ]);

  const catByServer = new Map<number, string>();
  const catByLocal = new Map<string, string>();
  for (const c of categories) {
    if (c.deleted) continue;
    const name = str(c.payload['name']) || '—';
    catByLocal.set(c.localId, name);
    if (c.serverId != null) catByServer.set(c.serverId, name);
  }

  const outboxByEntity = new Map<string, (typeof outbox)[number]>();
  for (const o of outbox) {
    if (!o.localEntityId) continue;
    if (!['pending', 'sending', 'conflict', 'rejected', 'dead'].includes(o.status)) continue;
    const prev = outboxByEntity.get(o.localEntityId);
    // Preferir conflict/rejected sobre pending para el chip UI
    const rank = (s: string) =>
      s === 'conflict' || s === 'rejected' || s === 'dead' ? 2 : s === 'sending' ? 1 : 0;
    if (!prev || rank(o.status) >= rank(prev.status)) outboxByEntity.set(o.localEntityId, o);
  }

  const rows: CommercialCatalogRow[] = [];

  for (const p of products) {
    if (p.deleted && p.syncStatus !== 'pending') continue;
    const visibility = str(p.payload['visibility']) || (p.payload['businessId'] != null ? 'BUSINESS_PRIVATE' : 'PLATFORM_SHARED');
    const isPrivate = visibility === 'BUSINESS_PRIVATE';
    const isShared = visibility === 'PLATFORM_SHARED';

    const bp =
      bps.find(
        (b) =>
          (p.serverId != null && b.productServerId === p.serverId) ||
          b.productLocalId === p.localId
      ) || null;

    // Shared sin adoptar: no listar como comercial de la tienda
    if (isShared && !bp) continue;
    // Privado sin BP aún (pending create): sí listar con precio del payload outbox si existe
    if (isPrivate && !bp && p.syncStatus !== 'pending') continue;

    const categoryId = num(p.payload['categoryId']);
    const categoryLocalId = str(p.payload['categoryLocalId']);
    // Precio comercial SOLO desde BusinessProduct.customPrice (o proyección local pendiente del create)
    const customPrice = bp ? num(bp.payload['customPrice']) : num(p.payload['customPrice']);
    const relatedOutbox =
      outboxByEntity.get(p.localId) ||
      (bp ? outboxByEntity.get(bp.localId) : undefined);
    let syncStatus = p.syncStatus;
    if (relatedOutbox?.status === 'conflict' || relatedOutbox?.status === 'rejected' || relatedOutbox?.status === 'dead') {
      syncStatus = 'conflict';
    } else if (
      relatedOutbox ||
      p.syncStatus === 'pending' ||
      bp?.syncStatus === 'pending' ||
      bp?.syncStatus === 'conflict'
    ) {
      syncStatus = bp?.syncStatus === 'conflict' ? 'conflict' : 'pending';
    }

    const categoryName =
      (categoryId != null ? catByServer.get(categoryId) : null) ||
      (categoryLocalId ? catByLocal.get(categoryLocalId) : null) ||
      (categoryId != null ? `Cat #${categoryId}` : '—');

    rows.push({
      productLocalId: p.localId,
      productServerId: p.serverId ?? null,
      bpLocalId: bp?.localId ?? null,
      bpServerId: bp?.serverId ?? null,
      name: str(p.payload['name']) || 'Sin nombre',
      sku: str(p.payload['sku']),
      categoryId,
      categoryLocalId,
      categoryName,
      customPrice,
      taxRate: num(p.payload['taxRate']),
      currentStock: bp ? num(bp.payload['currentStock']) : num(p.payload['initialStock']),
      reservedStock: bp ? num(bp.payload['reservedStock']) : 0,
      availableStock: (() => {
        const base = bp ? num(bp.payload['availableStock']) : num(p.payload['initialStock']);
        if (base == null) return null;
        const bpServerId = bp?.serverId;
        const reserved = bpServerId != null ? saleReserved.get(bpServerId) || 0 : 0;
        return Math.max(0, base - reserved);
      })(),
      visibility,
      productVersion: p.version,
      bpVersion: bp?.version ?? null,
      syncStatus,
      deleted: p.deleted,
      isPrivate,
      isSharedAdopted: isShared && !!bp,
    });
  }

  const search = opts?.search?.trim().toLowerCase();
  let filtered = rows;
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        (r.sku && r.sku.toLowerCase().includes(search)) ||
        r.categoryName.toLowerCase().includes(search)
    );
  }
  if (opts?.visibility === 'private') filtered = filtered.filter((r) => r.isPrivate);
  if (opts?.visibility === 'shared') filtered = filtered.filter((r) => r.isSharedAdopted);

  return filtered.sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export async function listLocalCategories(scope: TenantScope) {
  const db = await openOfflineDb(scope);
  const cats = await db.categories.filter((c) => !c.deleted).toArray();
  return cats
    .map((c) => ({
      localId: c.localId,
      serverId: c.serverId ?? null,
      name: str(c.payload['name']) || '—',
      visibility: str(c.payload['visibility']) || '',
      version: c.version,
      isPrivate: str(c.payload['visibility']) === 'BUSINESS_PRIVATE',
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

/** Shared visibles localmente sin BP activo (candidatos a adoptar). */
export async function listAdoptableShared(scope: TenantScope) {
  const db = await openOfflineDb(scope);
  const [products, bps] = await Promise.all([
    db.products.filter((p) => !p.deleted).toArray(),
    db.businessProducts.filter((b) => !b.deleted).toArray(),
  ]);
  const adopted = new Set(
    bps.map((b) => b.productServerId).filter((id): id is number => typeof id === 'number')
  );
  return products
    .filter((p) => {
      const vis = str(p.payload['visibility']);
      return vis === 'PLATFORM_SHARED' && p.serverId != null && !adopted.has(p.serverId);
    })
    .map((p) => ({
      serverId: p.serverId as number,
      localId: p.localId,
      name: str(p.payload['name']) || '—',
      sku: str(p.payload['sku']),
    }));
}

export async function createPrivateProduct(scope: TenantScope, input: CreatePrivateProductInput) {
  const localId = newUuid();
  const bpLocalId = newUuid();
  const clientOperationId = newUuid();
  const customPrice = Number(input.customPrice);
  const hasServerCat = input.categoryServerId != null && Number.isFinite(input.categoryServerId);
  const hasLocalCat = !!input.categoryLocalId?.trim();
  if (!input.name.trim() || (!hasServerCat && !hasLocalCat) || Number.isNaN(customPrice) || customPrice < 0) {
    throw new Error('Nombre, categoría y precio comercial son obligatorios');
  }

  const dependsOn: string[] = [];
  let resolvedCategoryServerId = hasServerCat ? Number(input.categoryServerId) : null;
  if (hasLocalCat && resolvedCategoryServerId == null) {
    const db = await openOfflineDb(scope);
    const map = await db.idMap.get(`category:${input.categoryLocalId}`);
    if (map?.serverId != null) {
      resolvedCategoryServerId = map.serverId;
    } else {
      const ops = await listOutbox(scope);
      const catOp = ops.find(
        (o) =>
          o.operationType === 'CATEGORY_PRIVATE_CREATE' &&
          o.localEntityId === input.categoryLocalId &&
          ['pending', 'sending', 'acked'].includes(o.status)
      );
      if (!catOp) {
        throw new Error('Categoría local sin operación outbox — sincroniza o vuelve a crear la categoría');
      }
      if (catOp.status === 'acked') {
        throw new Error('Categoría acked sin idMap — sincroniza pull y reintenta');
      }
      dependsOn.push(catOp.clientOperationId);
    }
  }

  return enqueueMutation(scope, {
    clientOperationId,
    operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
    localEntityId: localId,
    localEntityType: 'product',
    dependsOn,
    payload: {
      name: input.name.trim(),
      ...(resolvedCategoryServerId != null
        ? { categoryServerId: resolvedCategoryServerId }
        : { categoryLocalId: input.categoryLocalId }),
      customPrice,
      sku: input.sku?.trim() || undefined,
      barcode: input.barcode?.trim() || undefined,
      unit: input.unit || 'pcs',
      initialStock: input.initialStock ?? 0,
      localEntityId: localId,
      localBusinessProductId: bpLocalId,
    },
    localProduct: {
      localId,
      serverId: null,
      payload: {
        name: input.name.trim(),
        sku: input.sku?.trim() || null,
        barcode: input.barcode?.trim() || null,
        ...(resolvedCategoryServerId != null ? { categoryId: resolvedCategoryServerId } : {}),
        ...(hasLocalCat ? { categoryLocalId: input.categoryLocalId } : {}),
        visibility: 'BUSINESS_PRIVATE',
        businessId: scope.businessId,
        customPrice,
        initialStock: input.initialStock ?? 0,
        unit: input.unit || 'pcs',
      },
      version: 0,
      deleted: false,
      syncStatus: 'pending',
    },
    localBusinessProduct: {
      localId: bpLocalId,
      serverId: null,
      productLocalId: localId,
      productServerId: null,
      payload: {
        customPrice,
        currentStock: input.initialStock ?? 0,
        reservedStock: 0,
        availableStock: input.initialStock ?? 0,
      },
      version: 0,
      deleted: false,
      syncStatus: 'pending',
    },
  });
}

/**
 * Ajuste de stock comercial. Optimistic local en BP; InventoryTransaction solo en servidor.
 * Payload canónico: businessProductId + delta (+ reason local para UI/outbox).
 */
export async function adjustStock(scope: TenantScope, input: StockAdjustInput) {
  const delta = Number(input.delta);
  const reason = input.reason.trim();
  if (!Number.isFinite(delta) || delta === 0) throw new Error('La cantidad debe ser distinta de cero');
  if (reason.length < 2) throw new Error('Motivo obligatorio');
  if (!input.businessProductServerId) {
    throw new Error('BusinessProduct sin ID de servidor — sincroniza antes de ajustar');
  }

  const db = await openOfflineDb(scope);
  const bp = await db.businessProducts.get(input.bpLocalId);
  if (!bp || bp.deleted) throw new Error('BusinessProduct no encontrado');
  if (bp.serverId !== input.businessProductServerId) {
    throw new Error('ID de BusinessProduct inconsistente');
  }

  const current = num(bp.payload['currentStock']) ?? 0;
  const reserved = num(bp.payload['reservedStock']) ?? 0;
  if (current + delta < 0) {
    throw new Error(`Stock insuficiente. Disponible actual: ${current}`);
  }
  const nextCurrent = current + delta;
  const nextAvailable = Math.max(0, nextCurrent - reserved);

  return enqueueMutation(scope, {
    clientOperationId: newUuid(),
    operationType: 'STOCK_ADJUST',
    baseVersion: input.baseVersion,
    localEntityId: bp.localId,
    localEntityType: 'businessProduct',
    payload: {
      businessProductId: input.businessProductServerId,
      delta,
      reason,
    },
    localBusinessProduct: {
      ...bp,
      payload: {
        ...bp.payload,
        currentStock: nextCurrent,
        availableStock: nextAvailable,
        pendingStockAdjust: true,
      },
      syncStatus: 'pending',
      deleted: false,
    },
  });
}

export async function updatePrivateProduct(scope: TenantScope, input: UpdatePrivateProductInput) {
  const clientOperationId = newUuid();
  const db = await openOfflineDb(scope);
  const existing = await db.products.get(input.productLocalId);
  if (!existing || existing.deleted) throw new Error('Producto no encontrado');
  if (str(existing.payload['visibility']) === 'PLATFORM_SHARED') {
    throw new Error('No se pueden editar productos maestros/compartidos desde la tienda');
  }
  const payload: Record<string, unknown> = {
    serverId: input.productServerId,
  };
  if (input.name !== undefined) payload['name'] = input.name.trim();
  if (input.sku !== undefined) payload['sku'] = input.sku;
  if (input.barcode !== undefined) payload['barcode'] = input.barcode;
  if (input.categoryServerId !== undefined) payload['categoryServerId'] = input.categoryServerId;

  const nextPayload = {
    ...existing.payload,
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.sku !== undefined ? { sku: input.sku } : {}),
    ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
    ...(input.categoryServerId !== undefined ? { categoryId: input.categoryServerId } : {}),
  };

  return enqueueMutation(scope, {
    clientOperationId,
    operationType: 'PRODUCT_UPDATE',
    baseVersion: input.baseVersion,
    localEntityId: input.productLocalId,
    localEntityType: 'product',
    payload,
    localProduct: {
      ...existing,
      payload: nextPayload,
      syncStatus: 'pending',
      deleted: false,
    },
  });
}

export async function createPrivateCategory(scope: TenantScope, input: CreatePrivateCategoryInput) {
  const localId = newUuid();
  const clientOperationId = newUuid();
  if (input.name.trim().length < 2) throw new Error('Nombre de categoría inválido');
  return enqueueMutation(scope, {
    clientOperationId,
    operationType: 'CATEGORY_PRIVATE_CREATE',
    localEntityId: localId,
    localEntityType: 'category',
    payload: {
      name: input.name.trim(),
      description: input.description,
      localEntityId: localId,
    },
    localCategory: {
      localId,
      serverId: null,
      payload: {
        name: input.name.trim(),
        description: input.description ?? null,
        visibility: 'BUSINESS_PRIVATE',
        businessId: scope.businessId,
      },
      version: 0,
      deleted: false,
      syncStatus: 'pending',
    },
  });
}

export async function updatePrivateCategory(scope: TenantScope, input: UpdatePrivateCategoryInput) {
  const clientOperationId = newUuid();
  const db = await openOfflineDb(scope);
  const existing = await db.categories.get(input.categoryLocalId);
  if (!existing || existing.deleted) throw new Error('Categoría no encontrada');
  if (str(existing.payload['visibility']) === 'PLATFORM_SHARED') {
    throw new Error('No se pueden editar categorías de plataforma');
  }
  return enqueueMutation(scope, {
    clientOperationId,
    operationType: 'CATEGORY_UPDATE',
    baseVersion: input.baseVersion,
    localEntityId: input.categoryLocalId,
    localEntityType: 'category',
    payload: {
      serverId: input.categoryServerId,
      name: input.name,
      description: input.description,
    },
    localCategory: {
      ...existing,
      payload: {
        ...existing.payload,
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
      syncStatus: 'pending',
      deleted: false,
    },
  });
}

export async function adoptSharedProduct(scope: TenantScope, input: AdoptSharedInput) {
  const bpLocalId = newUuid();
  const clientOperationId = newUuid();
  const customPrice = Number(input.customPrice);
  if (!input.productServerId || Number.isNaN(customPrice) || customPrice < 0) {
    throw new Error('Producto y precio comercial son obligatorios');
  }
  return enqueueMutation(scope, {
    clientOperationId,
    operationType: 'BP_UPSERT',
    localEntityId: bpLocalId,
    localEntityType: 'businessProduct',
    payload: {
      productId: input.productServerId,
      customPrice,
      localEntityId: bpLocalId,
    },
    localBusinessProduct: {
      localId: bpLocalId,
      serverId: null,
      productServerId: input.productServerId,
      productLocalId: null,
      payload: {
        productId: input.productServerId,
        customPrice,
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0,
      },
      version: 0,
      deleted: false,
      syncStatus: 'pending',
    },
  });
}

export async function updateCommercialPrice(
  scope: TenantScope,
  opts: { productServerId: number; customPrice: number; baseVersion: number; bpLocalId?: string }
) {
  const clientOperationId = newUuid();
  const customPrice = Number(opts.customPrice);
  if (Number.isNaN(customPrice) || customPrice < 0) throw new Error('Precio inválido');
  const db = await openOfflineDb(scope);
  const bp =
    (opts.bpLocalId ? await db.businessProducts.get(opts.bpLocalId) : null) ||
    (await db.businessProducts.where('productServerId').equals(opts.productServerId).first());

  return enqueueMutation(scope, {
    clientOperationId,
    operationType: 'BP_UPSERT',
    baseVersion: opts.baseVersion,
    localEntityId: bp?.localId,
    localEntityType: 'businessProduct',
    payload: {
      productId: opts.productServerId,
      customPrice,
    },
    localBusinessProduct: bp
      ? {
          ...bp,
          payload: { ...bp.payload, customPrice },
          syncStatus: 'pending',
          deleted: false,
        }
      : undefined,
  });
}

/**
 * Corrige un PRODUCT_PRIVATE_CREATE_WITH_BP aún pending (mismo UUID).
 * No aplica a ops ya enviadas/acked — ahí hace falta PRODUCT_UPDATE / nuevo UUID.
 */
export async function revisePendingPrivateProduct(
  scope: TenantScope,
  input: {
    productLocalId: string;
    name?: string;
    sku?: string | null;
    categoryServerId?: number;
    customPrice?: number;
  }
) {
  const db = await openOfflineDb(scope);
  const existing = await db.products.get(input.productLocalId);
  if (!existing || existing.deleted) throw new Error('Producto no encontrado');
  if (existing.serverId != null) {
    throw new Error('Producto ya tiene ID de servidor — usa edición versionada');
  }
  const ops = await listOutbox(scope, ['pending']);
  const createOp = ops.find(
    (o) =>
      o.operationType === 'PRODUCT_PRIVATE_CREATE_WITH_BP' && o.localEntityId === input.productLocalId
  );
  if (!createOp) {
    throw new Error('No hay creación pendiente revisable; sincroniza o revisa la cola');
  }

  const nextName = input.name?.trim() ?? str(existing.payload['name']) ?? '';
  const nextSku =
    input.sku !== undefined ? input.sku : (str(existing.payload['sku']) as string | null);
  const nextCat =
    input.categoryServerId ?? num(existing.payload['categoryId']) ?? undefined;
  const bp = await db.businessProducts.where('productLocalId').equals(input.productLocalId).first();
  const nextPrice =
    input.customPrice !== undefined
      ? Number(input.customPrice)
      : num(bp?.payload['customPrice']) ?? num(existing.payload['customPrice']) ?? 0;
  if (!nextName || nextCat == null || Number.isNaN(nextPrice) || nextPrice < 0) {
    throw new Error('Nombre, categoría y precio comercial son obligatorios');
  }

  const now = new Date().toISOString();
  await db.transaction('rw', db.products, db.businessProducts, db.outbox, async () => {
    await db.products.put({
      ...existing,
      payload: {
        ...existing.payload,
        name: nextName,
        sku: nextSku,
        categoryId: nextCat,
        customPrice: nextPrice,
      },
      syncStatus: 'pending',
      updatedAtLocal: now,
    });
    if (bp) {
      await db.businessProducts.put({
        ...bp,
        payload: { ...bp.payload, customPrice: nextPrice },
        syncStatus: 'pending',
        updatedAtLocal: now,
      });
    }
    await db.outbox.put({
      ...createOp,
      payload: {
        ...createOp.payload,
        name: nextName,
        sku: nextSku || undefined,
        categoryServerId: nextCat,
        customPrice: nextPrice,
      },
    });
  });
  return createOp.clientOperationId;
}
