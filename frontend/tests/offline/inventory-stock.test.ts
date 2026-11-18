import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyPullChanges,
  clearSessionExpirations,
  closeAllOfflineDbs,
  createScope,
  deleteOfflineDbForTests,
  listOutbox,
  openOfflineDb,
  setSessionExpirations,
  type SyncPullChange,
} from '@/lib/offline';
import {
  adjustStock,
  createPrivateCategory,
  createPrivateProduct,
  listCommercialCatalog,
} from '@/lib/catalog/commercialCatalogService';

const scope = createScope(10, 1, 'dev-inv-d2');

beforeEach(async () => {
  clearSessionExpirations();
  setSessionExpirations({
    accessExpiresAt: Date.now() + 3_600_000,
    refreshExpiresAt: Date.now() + 7 * 86_400_000,
  });
  await deleteOfflineDbForTests(scope);
});

afterEach(async () => {
  await closeAllOfflineDbs();
});

describe('P2-D2 inventory + category dependsOn', () => {
  it('STOCK_ADJUST encola UUID, actualiza BP local y no inventa InventoryTransaction', async () => {
    const changes: SyncPullChange[] = [
      {
        stream: 'catalog',
        entityType: 'product',
        serverId: 50,
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: {
          name: 'Inv Item',
          sku: 'INV-1',
          visibility: 'BUSINESS_PRIVATE',
          businessId: 1,
          categoryId: 1,
          sellingPrice: 99,
        },
      },
      {
        stream: 'stock',
        entityType: 'businessProduct',
        serverId: 500,
        version: 3,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: {
          productId: 50,
          customPrice: 11,
          currentStock: 10,
          reservedStock: 2,
          availableStock: 8,
        },
      },
    ];
    await applyPullChanges(scope, changes);
    const rows = await listCommercialCatalog(scope);
    expect(rows[0]!.customPrice).toBe(11);
    expect(rows[0]!.customPrice).not.toBe(99);
    expect(rows[0]!.reservedStock).toBe(2);

    const op = await adjustStock(scope, {
      bpLocalId: rows[0]!.bpLocalId!,
      businessProductServerId: 500,
      baseVersion: 3,
      delta: -3,
      reason: 'Conteo físico',
    });
    expect(op.status).toBe('pending');
    expect(op.operationType).toBe('STOCK_ADJUST');
    expect(op.payload['delta']).toBe(-3);
    expect(op.payload['reason']).toBe('Conteo físico');
    expect(op.baseVersion).toBe(3);

    const after = await listCommercialCatalog(scope);
    expect(after[0]!.currentStock).toBe(7);
    expect(after[0]!.availableStock).toBe(5);
    expect(after[0]!.syncStatus).toBe('pending');

    await expect(
      adjustStock(scope, {
        bpLocalId: after[0]!.bpLocalId!,
        businessProductServerId: 500,
        baseVersion: 3,
        delta: -100,
        reason: 'demasiado',
      })
    ).rejects.toThrow(/insuficiente/i);
  });

  it('producto con categoría pending usa dependsOn y categoryLocalId (sin serverId falso)', async () => {
    const catOp = await createPrivateCategory(scope, { name: 'Cat Pending D2' });
    expect(catOp.status).toBe('pending');

    const cats = await (await import('@/lib/catalog/commercialCatalogService')).listLocalCategories(
      scope
    );
    const pending = cats.find((c) => c.name === 'Cat Pending D2');
    expect(pending?.serverId).toBeNull();

    const prodOp = await createPrivateProduct(scope, {
      name: 'Prod Dep Cat',
      categoryLocalId: pending!.localId,
      customPrice: 2.5,
    });
    expect(prodOp.dependsOn).toEqual([catOp.clientOperationId]);
    expect(prodOp.payload['categoryLocalId']).toBe(pending!.localId);
    expect(prodOp.payload['categoryServerId']).toBeUndefined();

    const outbox = await listOutbox(scope, ['pending']);
    expect(outbox).toHaveLength(2);
  });

  it('tras mapear categoría, resolveOutbound deja categoryServerId listo', async () => {
    const catOp = await createPrivateCategory(scope, { name: 'Cat Mapped' });
    const db = await openOfflineDb(scope);
    const catLocal = catOp.localEntityId!;
    await db.idMap.put({
      key: `category:${catLocal}`,
      entityType: 'category',
      localId: catLocal,
      serverId: 77,
      mappedAt: new Date().toISOString(),
      businessId: scope.businessId,
    });
    await db.categories.update(catLocal, { serverId: 77, syncStatus: 'synced' });
    await db.outbox.update(catOp.clientOperationId, { status: 'acked' });

    const prodOp = await createPrivateProduct(scope, {
      name: 'Prod After Map',
      categoryLocalId: catLocal,
      customPrice: 1,
    });
    // Ya había serverId en idMap → no dependsOn; categoryServerId materializado
    expect(prodOp.dependsOn).toEqual([]);
    expect(prodOp.payload['categoryServerId']).toBe(77);
  });
});
