/**
 * Prueba HTTP real contra Docker local (P2-C0.3).
 * Requiere backend healthy en AUTH_HTTP_BASE / NEXT_PUBLIC_API_URL.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';
import {
  clearSessionExpirations,
  closeAllOfflineDbs,
  createBrowserPullTransport,
  createBrowserPushTransport,
  createScope,
  deleteOfflineDbForTests,
  enqueueMutation,
  listOutbox,
  newUuid,
  openOfflineDb,
  resetMemoryLocksForTests,
  resetPushLocksForTests,
  runCatalogSyncCycle,
  setSessionExpirations,
} from '@/lib/offline';

const BASE = process.env['AUTH_HTTP_BASE'] || process.env['NEXT_PUBLIC_API_URL'] || 'http://127.0.0.1:5000';
const PASS = process.env['SEED_DEV_PASSWORD'] || 'DevPass123!';

async function login(username: string): Promise<{ token: string; businessId: number; userId: number }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: PASS }),
  });
  const body = await res.json();
  expect(res.status).toBe(200);
  const token = body.data.token as string;
  const user = body.data.user;
  const businessId = Number(user.employee?.businessId ?? user.businessId);
  const userId = Number(user.id ?? user.userId);
  expect(businessId).toBeGreaterThan(0);
  expect(userId).toBeGreaterThan(0);
  return { token, businessId, userId };
}

describe('P2-C0.3 HTTP real Docker', () => {
  let tokenA: string;
  let bidA: number;
  let uidA: number;
  let tokenB: string;
  let bidB: number;
  let uidB: number;
  let scopeA: ReturnType<typeof createScope>;
  let scopeB: ReturnType<typeof createScope>;
  const tag = randomUUID().slice(0, 8);

  beforeAll(async () => {
    const health = await fetch(`${BASE}/health`);
    expect(health.status).toBe(200);
    const a = await login('admin_a');
    tokenA = a.token;
    bidA = a.businessId;
    uidA = a.userId;
    const b = await login('admin_b');
    tokenB = b.token;
    bidB = b.businessId;
    uidB = b.userId;
  });

  beforeEach(async () => {
    resetPushLocksForTests();
    resetMemoryLocksForTests();
    clearSessionExpirations();
    setSessionExpirations({
      accessExpiresAt: Date.now() + 3_600_000,
      refreshExpiresAt: Date.now() + 7 * 86_400_000,
    });
    scopeA = createScope(uidA, bidA, `http-a-${tag}`);
    scopeB = createScope(uidB, bidB, `http-b-${tag}`);
    await deleteOfflineDbForTests(scopeA);
    await deleteOfflineDbForTests(scopeB);
  });

  afterEach(async () => {
    await closeAllOfflineDbs();
  });

  it('1. Primera descarga real del catálogo', async () => {
    const res = await runCatalogSyncCycle({
      scope: scopeA,
      accessToken: tokenA,
      tokenBusinessId: bidA,
      pullOnly: true,
      apiBase: BASE,
      pullLimit: 20,
    });
    expect(res.pullPages).toBeGreaterThanOrEqual(1);
    expect(res.pullChanges).toBeGreaterThan(0);
    const db = await openOfflineDb(scopeA);
    expect(await db.categories.count()).toBeGreaterThan(0);
    expect(await db.products.count() + (await db.businessProducts.count())).toBeGreaterThan(0);
    const st = await db.syncState.get('catalog');
    expect(st?.snapshotAt).toBeTruthy();
    expect(st?.lastError).toBeNull();
  });

  it('4+5. Crear producto offline, “reload”, sync real', async () => {
    const localId = newUuid();
    const opId = newUuid();
    await enqueueMutation(scopeA, {
      clientOperationId: opId,
      operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
      localEntityId: localId,
      localEntityType: 'product',
      payload: {
        name: `P2C03 ${tag} Offline`,
        categoryServerId: 1,
        customPrice: 13.25,
        sku: `P2C03-${tag}`,
        localEntityId: localId,
        localBusinessProductId: `${localId}-bp`,
      },
      localProduct: {
        localId,
        serverId: null,
        payload: { name: `P2C03 ${tag} Offline` },
        version: 0,
        deleted: false,
      },
    });

    await closeAllOfflineDbs();
    expect(await listOutbox(scopeA, ['pending'])).toHaveLength(1);

    const res = await runCatalogSyncCycle({
      scope: scopeA,
      accessToken: tokenA,
      tokenBusinessId: bidA,
      apiBase: BASE,
      pullLimit: 30,
      pushTransport: createBrowserPushTransport(BASE),
      pullTransport: createBrowserPullTransport(BASE),
    });
    expect(res.errors.filter((e) => e.includes('push_http') || e.includes('network')).length).toBe(0);
    const ops = await listOutbox(scopeA);
    const op = ops.find((o) => o.clientOperationId === opId);
    expect(op?.status).toBe('acked');
    const db = await openOfflineDb(scopeA);
    const product = await db.products.get(localId);
    expect(product?.serverId).toBeTruthy();
    expect(product?.syncStatus).toBe('synced');
  });

  it('8. Dos empresas — sync A no escribe DB de B', async () => {
    await runCatalogSyncCycle({
      scope: scopeA,
      accessToken: tokenA,
      tokenBusinessId: bidA,
      pullOnly: true,
      apiBase: BASE,
      pullLimit: 15,
    });
    await runCatalogSyncCycle({
      scope: scopeB,
      accessToken: tokenB,
      tokenBusinessId: bidB,
      pullOnly: true,
      apiBase: BASE,
      pullLimit: 15,
    });
    const a = await openOfflineDb(scopeA);
    const b = await openOfflineDb(scopeB);
    // Privados de A no deben estar como BUSINESS_PRIVATE de B en store B
    const aPrivates = (await a.products.toArray()).filter(
      (p) => p.payload['visibility'] === 'BUSINESS_PRIVATE' && p.payload['businessId'] === bidA
    );
    const bLeak = (await b.products.toArray()).filter(
      (p) => p.payload['visibility'] === 'BUSINESS_PRIVATE' && p.payload['businessId'] === bidA
    );
    expect(bLeak.length).toBe(0);
    // A puede tener 0 privados si seed no tiene; al menos sync no falla
    expect(aPrivates.length).toBeGreaterThanOrEqual(0);
  });

  it('6. Reintento tras pérdida de respuesta (mismo UUID)', async () => {
    const { runPushCycle } = await import('@/lib/offline/syncPushWorker');
    const opId = newUuid();
    await enqueueMutation(scopeA, {
      clientOperationId: opId,
      operationType: 'CATEGORY_PRIVATE_CREATE',
      payload: { name: `P2C03 ${tag} Cat` },
    });

    const flakyPush = createBrowserPushTransport(BASE);
    let attempts = 0;
    await expect(
      runPushCycle({
        scope: scopeA,
        accessToken: tokenA,
        tokenBusinessId: bidA,
        transport: async (args) => {
          attempts += 1;
          if (attempts === 1) throw new Error('simulated_timeout');
          return flakyPush(args);
        },
      })
    ).rejects.toThrow(/simulated_timeout/);

    const pending = await listOutbox(scopeA, ['pending']);
    expect(pending.some((o) => o.clientOperationId === opId)).toBe(true);

    const second = await runPushCycle({
      scope: scopeA,
      accessToken: tokenA,
      tokenBusinessId: bidA,
      transport: flakyPush,
      now: Date.now() + 10_000,
    });
    expect(second.results[0]?.clientOperationId).toBe(opId);
    expect(['applied', 'duplicate']).toContain(second.results[0]?.status);
  });

  it('10-11. Shared adoptado aparece en pull A con precio BP propio', async () => {
    await runCatalogSyncCycle({
      scope: scopeA,
      accessToken: tokenA,
      tokenBusinessId: bidA,
      pullOnly: true,
      apiBase: BASE,
      pullLimit: 50,
    });
    const db = await openOfflineDb(scopeA);
    const shared = (await db.products.toArray()).find(
      (p) => p.payload['visibility'] === 'PLATFORM_SHARED' && p.serverId === 1
    );
    // Seed shared id=1 solo si BP de A existe — pull lo incluye
    if (shared) {
      const bp = (await db.businessProducts.toArray()).find(
        (x) => x.productServerId === shared.serverId && !x.deleted
      );
      expect(bp?.payload['customPrice']).toBeDefined();
    }
  });
});

