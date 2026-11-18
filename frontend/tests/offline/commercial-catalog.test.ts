import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyPullChanges,
  clearSessionExpirations,
  closeAllOfflineDbs,
  createScope,
  deleteOfflineDbForTests,
  listOutbox,
  setSessionExpirations,
  type SyncPullChange,
} from '@/lib/offline';
import {
  adoptSharedProduct,
  createPrivateCategory,
  createPrivateProduct,
  listAdoptableShared,
  listCommercialCatalog,
  listLocalCategories,
  revisePendingPrivateProduct,
  updatePrivateProduct,
} from '@/lib/catalog/commercialCatalogService';

const scope = createScope(10, 1, 'dev-catalog-ui');

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

describe('P2-D1 commercial catalog service', () => {
  it('lista privados y compartidos adoptados; precio solo customPrice', async () => {
    const changes: SyncPullChange[] = [
      {
        stream: 'catalog',
        entityType: 'category',
        serverId: 1,
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: { name: 'Bebidas', visibility: 'PLATFORM_SHARED', businessId: null },
      },
      {
        stream: 'catalog',
        entityType: 'product',
        serverId: 10,
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: {
          name: 'Shared A',
          sku: 'SA',
          visibility: 'PLATFORM_SHARED',
          businessId: null,
          categoryId: 1,
          sellingPrice: 999,
        },
      },
      {
        stream: 'catalog',
        entityType: 'product',
        serverId: 11,
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: {
          name: 'Privado B',
          sku: 'PB',
          visibility: 'BUSINESS_PRIVATE',
          businessId: 1,
          categoryId: 1,
          sellingPrice: 50,
        },
      },
      {
        stream: 'stock',
        entityType: 'businessProduct',
        serverId: 100,
        version: 2,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: {
          productId: 11,
          customPrice: 12.5,
          currentStock: 3,
          reservedStock: 0,
          availableStock: 3,
        },
      },
    ];
    await applyPullChanges(scope, changes);

    const all = await listCommercialCatalog(scope);
    expect(all.map((r) => r.name).sort()).toEqual(['Privado B']);
    expect(all[0]!.customPrice).toBe(12.5);
    expect(all[0]!.customPrice).not.toBe(50);

    await adoptSharedProduct(scope, { productServerId: 10, customPrice: 7.25 });
    const afterAdopt = await listCommercialCatalog(scope);
    const shared = afterAdopt.find((r) => r.productServerId === 10);
    expect(shared).toBeTruthy();
    expect(shared!.customPrice).toBe(7.25);
    expect(shared!.customPrice).not.toBe(999);
    expect(shared!.isSharedAdopted).toBe(true);

    const adoptable = await listAdoptableShared(scope);
    expect(adoptable.find((a) => a.serverId === 10)).toBeUndefined();
  });

  it('crea producto privado offline visible de inmediato (pending)', async () => {
    await applyPullChanges(scope, [
      {
        stream: 'catalog',
        entityType: 'category',
        serverId: 5,
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: { name: 'Snacks', visibility: 'PLATFORM_SHARED', businessId: null },
      },
    ]);

    const op = await createPrivateProduct(scope, {
      name: 'Galleta Offline',
      categoryServerId: 5,
      customPrice: 3.5,
      sku: 'OFF-1',
      initialStock: 2,
    });
    expect(op.status).toBe('pending');
    expect(op.clientOperationId).toBeTruthy();

    const rows = await listCommercialCatalog(scope, { search: 'galleta' });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.name).toBe('Galleta Offline');
    expect(rows[0]!.customPrice).toBe(3.5);
    expect(rows[0]!.syncStatus).toBe('pending');
    expect(rows[0]!.productServerId).toBeNull();
  });

  it('revisa creación pending con mismo UUID y filtra por visibilidad', async () => {
    await applyPullChanges(scope, [
      {
        stream: 'catalog',
        entityType: 'category',
        serverId: 5,
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: { name: 'Snacks', visibility: 'PLATFORM_SHARED', businessId: null },
      },
    ]);
    await createPrivateProduct(scope, {
      name: 'Temp',
      categoryServerId: 5,
      customPrice: 1,
      sku: 'T1',
    });
    const before = await listCommercialCatalog(scope);
    const localId = before[0]!.productLocalId;
    const opsBefore = await listOutbox(scope, ['pending']);
    const uuid = opsBefore[0]!.clientOperationId;

    await revisePendingPrivateProduct(scope, {
      productLocalId: localId,
      name: 'Temp Corregido',
      sku: 'T1-FIX',
      customPrice: 4.2,
    });

    const opsAfter = await listOutbox(scope, ['pending']);
    expect(opsAfter).toHaveLength(1);
    expect(opsAfter[0]!.clientOperationId).toBe(uuid);
    expect(opsAfter[0]!.payload['name']).toBe('Temp Corregido');

    const rows = await listCommercialCatalog(scope, { visibility: 'private' });
    expect(rows[0]!.name).toBe('Temp Corregido');
    expect(rows[0]!.sku).toBe('T1-FIX');
    expect(rows[0]!.customPrice).toBe(4.2);
  });

  it('bloquea edición de producto PLATFORM_SHARED y crea categoría privada', async () => {
    await applyPullChanges(scope, [
      {
        stream: 'catalog',
        entityType: 'product',
        serverId: 88,
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: {
          name: 'Master',
          visibility: 'PLATFORM_SHARED',
          businessId: null,
          categoryId: 1,
        },
      },
      {
        stream: 'stock',
        entityType: 'businessProduct',
        serverId: 200,
        version: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        deleted: false,
        payload: { productId: 88, customPrice: 9, currentStock: 1, availableStock: 1 },
      },
    ]);

    const rows = await listCommercialCatalog(scope);
    const shared = rows.find((r) => r.productServerId === 88)!;
    await expect(
      updatePrivateProduct(scope, {
        productLocalId: shared.productLocalId,
        productServerId: 88,
        baseVersion: 1,
        name: 'Hack',
      })
    ).rejects.toThrow(/maestros|compartidos/i);

    await createPrivateCategory(scope, { name: 'Mi Cat Privada' });
    const cats = await listLocalCategories(scope);
    expect(cats.some((c) => c.name === 'Mi Cat Privada' && c.isPrivate)).toBe(true);
  });
});
