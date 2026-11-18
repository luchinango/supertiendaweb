import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyPullChanges,
  clearSessionExpirations,
  closeAllOfflineDbs,
  createScope,
  deleteOfflineDbForTests,
  enqueueMutation,
  listOutbox,
  newUuid,
  openOfflineDb,
  resetMemoryLocksForTests,
  resetPushLocksForTests,
  runCatalogSyncCycle,
  serverLocalId,
  setSessionExpirations,
  type PullTransport,
  type PushTransport,
  type SyncPullChange,
  type SyncPullResponse,
} from '@/lib/offline';
import { OfflineStorageError } from '@/lib/offline/types';

const scopeA = createScope(10, 1, 'dev-a');
const scopeB = createScope(20, 2, 'dev-b');

function pullPage(partial: Partial<SyncPullResponse> & { changes: SyncPullChange[] }): SyncPullResponse {
  return {
    serverTime: new Date().toISOString(),
    cursor: partial.cursor ?? 'cur',
    hasMore: partial.hasMore ?? false,
    snapshotAt: partial.snapshotAt ?? new Date().toISOString(),
    changes: partial.changes,
  };
}

beforeEach(async () => {
  resetPushLocksForTests();
  resetMemoryLocksForTests();
  clearSessionExpirations();
  setSessionExpirations({
    accessExpiresAt: Date.now() + 3_600_000,
    refreshExpiresAt: Date.now() + 7 * 86_400_000,
  });
  await deleteOfflineDbForTests(scopeA);
  await deleteOfflineDbForTests(scopeB);
});

afterEach(async () => {
  await closeAllOfflineDbs();
  resetPushLocksForTests();
  resetMemoryLocksForTests();
});

describe('P2-C0.3 catalog sync unit', () => {
  it('1-2. Primera descarga + paginación completa', async () => {
    let calls = 0;
    const transport: PullTransport = async ({ cursor }) => {
      calls += 1;
      if (!cursor) {
        return pullPage({
          hasMore: true,
          cursor: 'page1',
          snapshotAt: '2026-01-01T00:00:00.000Z',
          changes: [
            {
              stream: 'catalog',
              entityType: 'category',
              serverId: 1,
              version: 1,
              updatedAt: '2026-01-01T00:00:00.000Z',
              deleted: false,
              payload: { name: 'Cat', visibility: 'PLATFORM_SHARED', businessId: null },
            },
          ],
        });
      }
      return pullPage({
        hasMore: false,
        cursor: 'page2',
        snapshotAt: '2026-01-01T00:00:00.000Z',
        changes: [
          {
            stream: 'catalog',
            entityType: 'product',
            serverId: 10,
            version: 1,
            updatedAt: '2026-01-01T00:00:01.000Z',
            deleted: false,
            payload: {
              name: 'Shared',
              visibility: 'PLATFORM_SHARED',
              businessId: null,
              categoryId: 1,
            },
          },
          {
            stream: 'stock',
            entityType: 'businessProduct',
            serverId: 100,
            version: 1,
            updatedAt: '2026-01-01T00:00:02.000Z',
            deleted: false,
            payload: { productId: 10, customPrice: 8.5, currentStock: 5, reservedStock: 0, availableStock: 5 },
          },
        ],
      });
    };

    const res = await runCatalogSyncCycle({
      scope: scopeA,
      accessToken: 't',
      tokenBusinessId: 1,
      pullOnly: true,
      pullTransport: transport,
      pushTransport: async () => ({ serverTime: '', results: [] }),
    });
    expect(calls).toBe(2);
    expect(res.pullPages).toBe(2);
    expect(res.pullChanges).toBe(3);
    const db = await openOfflineDb(scopeA);
    expect(await db.categories.count()).toBe(1);
    expect(await db.products.count()).toBe(1);
    expect(await db.businessProducts.count()).toBe(1);
    const st = await db.syncState.get('catalog');
    expect(st?.lastError).toBeNull();
    expect(st?.cursor).toBe('page2');
  });

  it('17-18. Cursor persistido y reinicio durante paginación', async () => {
    let n = 0;
    const transport: PullTransport = async () => {
      n += 1;
      if (n === 1) {
        return pullPage({
          hasMore: true,
          cursor: 'mid',
          snapshotAt: 'snap',
          changes: [
            {
              stream: 'catalog',
              entityType: 'category',
              serverId: 2,
              version: 1,
              updatedAt: 'a',
              deleted: false,
              payload: { name: 'A' },
            },
          ],
        });
      }
      // segunda página tras “reinicio” con cursor mid
      return pullPage({
        hasMore: false,
        cursor: 'end',
        snapshotAt: 'snap',
        changes: [],
      });
    };

    // Simula crash: solo primera página aplicada manualmente
    const page1 = await transport({ scope: scopeA, accessToken: 't' });
    await applyPullChanges(scopeA, page1.changes);
    const db = await openOfflineDb(scopeA);
    await db.syncState.put({
      stream: 'catalog',
      cursor: page1.cursor,
      snapshotAt: page1.snapshotAt,
      lastPullAt: new Date().toISOString(),
      lastError: 'PULL_IN_PROGRESS',
      businessId: 1,
    });

    await runCatalogSyncCycle({
      scope: scopeA,
      accessToken: 't',
      tokenBusinessId: 1,
      pullOnly: true,
      pullTransport: transport,
      pushTransport: async () => ({ serverTime: '', results: [] }),
    });
    // transport llamado otra vez con cursor mid → n=2
    expect(n).toBe(2);
    expect((await db.syncState.get('catalog'))?.lastError).toBeNull();
  });

  it('4+15. Create offline + no sobrescribir pending en pull remoto', async () => {
    const localId = newUuid();
    const opId = newUuid();
    await enqueueMutation(scopeA, {
      clientOperationId: opId,
      operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
      localEntityId: localId,
      localEntityType: 'product',
      payload: { name: 'LocalPending', customPrice: 1, categoryServerId: 1 },
      localProduct: {
        localId,
        serverId: null,
        payload: { name: 'LocalPending' },
        version: 0,
        deleted: false,
      },
    });

    // Pull trae otro producto; no toca el pending
    await applyPullChanges(scopeA, [
      {
        stream: 'catalog',
        entityType: 'product',
        serverId: 99,
        version: 1,
        updatedAt: 't',
        deleted: false,
        payload: { name: 'Remote', visibility: 'BUSINESS_PRIVATE', businessId: 1 },
      },
    ]);

    const db = await openOfflineDb(scopeA);
    const local = await db.products.get(localId);
    expect(local?.syncStatus).toBe('pending');
    expect(local?.payload['name']).toBe('LocalPending');
    expect(await db.products.get(serverLocalId('product', 99))).toBeTruthy();
  });

  it('12. Tombstone BP', async () => {
    await applyPullChanges(scopeA, [
      {
        stream: 'stock',
        entityType: 'businessProduct',
        serverId: 5,
        version: 2,
        updatedAt: 't',
        deleted: false,
        payload: { productId: 1, customPrice: 9, currentStock: 1, reservedStock: 0, availableStock: 1 },
      },
    ]);
    await applyPullChanges(scopeA, [
      {
        stream: 'stock',
        entityType: 'businessProduct',
        serverId: 5,
        version: 3,
        updatedAt: 't2',
        deleted: true,
        deletedAt: 't2',
        payload: { productId: 1 },
      },
    ]);
    const db = await openOfflineDb(scopeA);
    const bp = await db.businessProducts.where('serverId').equals(5).first();
    expect(bp?.deleted).toBe(true);
    expect(bp?.syncStatus).toBe('tombstone');
  });

  it('13-14. Conflicto versión y SKU en ciclo push', async () => {
    const conflictId = newUuid();
    const skuId = newUuid();
    await enqueueMutation(scopeA, {
      clientOperationId: conflictId,
      operationType: 'PRODUCT_UPDATE',
      baseVersion: 1,
      payload: { serverId: 1, name: 'x' },
    });
    await enqueueMutation(scopeA, {
      clientOperationId: skuId,
      operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
      payload: { name: 'y', sku: 'DUP', customPrice: 1, categoryServerId: 1 },
    });

    const push: PushTransport = async ({ body }) => ({
      serverTime: new Date().toISOString(),
      results: body.operations.map((o) =>
        o.clientOperationId === conflictId
          ? { clientOperationId: o.clientOperationId, status: 'conflict' as const, code: 'VERSION_CONFLICT' }
          : {
              clientOperationId: o.clientOperationId,
              status: 'rejected' as const,
              code: 'SKU_COLLISION',
              retryable: false,
            }
      ),
    });

    await runCatalogSyncCycle({
      scope: scopeA,
      accessToken: 't',
      tokenBusinessId: 1,
      pushOnly: true,
      pushTransport: push,
      pullTransport: async () => pullPage({ changes: [], hasMore: false }),
    });

    const ops = await listOutbox(scopeA);
    expect(ops.find((o) => o.clientOperationId === conflictId)?.status).toBe('conflict');
    expect(ops.find((o) => o.clientOperationId === skuId)?.status).toBe('rejected');
    expect(ops).toHaveLength(2);
  });

  it('8-9. Dos empresas / usuarios aislados en pull', async () => {
    await applyPullChanges(scopeA, [
      {
        stream: 'catalog',
        entityType: 'product',
        serverId: 1,
        version: 1,
        updatedAt: 't',
        deleted: false,
        payload: { name: 'A', businessId: 1, visibility: 'BUSINESS_PRIVATE' },
      },
    ]);
    await applyPullChanges(scopeB, [
      {
        stream: 'catalog',
        entityType: 'product',
        serverId: 2,
        version: 1,
        updatedAt: 't',
        deleted: false,
        payload: { name: 'B', businessId: 2, visibility: 'BUSINESS_PRIVATE' },
      },
    ]);
    expect(await (await openOfflineDb(scopeA)).products.count()).toBe(1);
    expect(await (await openOfflineDb(scopeB)).products.count()).toBe(1);
  });

  it('16. Refresh vencido bloquea sync', async () => {
    setSessionExpirations({ refreshExpiresAt: Date.now() - 1 });
    await expect(
      runCatalogSyncCycle({
        scope: scopeA,
        accessToken: 't',
        tokenBusinessId: 1,
        pullOnly: true,
        pullTransport: async () => pullPage({ changes: [], hasMore: false }),
        pushTransport: async () => ({ serverTime: '', results: [] }),
      })
    ).rejects.toMatchObject({ code: 'SESSION_BLOCKED' });
  });

  it('20. Ninguna op desaparece en ciclo', async () => {
    const id = newUuid();
    await enqueueMutation(scopeA, {
      clientOperationId: id,
      operationType: 'CATEGORY_PRIVATE_CREATE',
      payload: { name: 'Keep' },
    });
    await runCatalogSyncCycle({
      scope: scopeA,
      accessToken: 't',
      tokenBusinessId: 1,
      pushTransport: async () => ({
        serverTime: '',
        results: [{ clientOperationId: id, status: 'rejected', code: 'VALIDATION', retryable: false }],
      }),
      pullTransport: async () => pullPage({ changes: [], hasMore: false }),
    });
    expect(await listOutbox(scopeA)).toHaveLength(1);
  });

  it('19. Fallo de IndexedDB en open', async () => {
    const original = globalThis.indexedDB;
    delete (globalThis as { indexedDB?: IDBFactory }).indexedDB;
    await expect(openOfflineDb(scopeA)).rejects.toBeInstanceOf(OfflineStorageError);
    Object.defineProperty(globalThis, 'indexedDB', {
      value: original,
      configurable: true,
      writable: true,
    });
  });

  it('push antes de pull: pending protegido ante change remoto mismo serverId', async () => {
    // Entidad local conflict en serverId 7
    const db = await openOfflineDb(scopeA);
    const localId = serverLocalId('product', 7);
    await db.products.put({
      localId,
      serverId: 7,
      businessId: 1,
      payload: { name: 'Mine' },
      version: 2,
      updatedAtLocal: new Date().toISOString(),
      syncStatus: 'conflict',
      deleted: false,
    });
    const r = await applyPullChanges(scopeA, [
      {
        stream: 'catalog',
        entityType: 'product',
        serverId: 7,
        version: 9,
        updatedAt: 't',
        deleted: false,
        payload: { name: 'ServerWinsAttempt' },
      },
    ]);
    expect(r.skippedLocalPending).toBe(1);
    expect((await db.products.get(localId))?.payload['name']).toBe('Mine');
  });
});
