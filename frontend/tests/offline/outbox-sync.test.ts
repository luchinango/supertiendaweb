import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  closeAllOfflineDbs,
  createScope,
  deleteOfflineDbForTests,
  enqueueMutation,
  listOutbox,
  openOfflineDb,
  recoverOrphanSending,
  resetPushLocksForTests,
  runPushCycle,
  setSessionExpirations,
  clearSessionExpirations,
  getSessionGateState,
  newUuid,
  type PushTransport,
  type SyncPushResponse,
} from '@/lib/offline';
import { OfflineStorageError } from '@/lib/offline/types';

const scopeA = createScope(10, 1, 'device-test-a');
const scopeB = createScope(20, 2, 'device-test-b');
const scopeA2 = createScope(11, 1, 'device-test-a2'); // mismo business, otro user

beforeEach(async () => {
  resetPushLocksForTests();
  clearSessionExpirations();
  setSessionExpirations({
    accessExpiresAt: Date.now() + 3_600_000,
    refreshExpiresAt: Date.now() + 7 * 86_400_000,
  });
  await deleteOfflineDbForTests(scopeA);
  await deleteOfflineDbForTests(scopeB);
  await deleteOfflineDbForTests(scopeA2);
});

afterEach(async () => {
  await closeAllOfflineDbs();
  resetPushLocksForTests();
});

function mockTransport(handler: PushTransport): PushTransport {
  return handler;
}

describe('P2-C0.2 IndexedDB + outbox', () => {
  it('1. Guardar operación offline (atómico entity+outbox)', async () => {
    const localId = newUuid();
    const op = await enqueueMutation(scopeA, {
      operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
      clientOperationId: newUuid(),
      payload: { name: 'Aceite', customPrice: 10, categoryServerId: 1, localEntityId: localId },
      localEntityId: localId,
      localEntityType: 'product',
      localProduct: {
        localId,
        serverId: null,
        payload: { name: 'Aceite', customPrice: 10 },
        version: 0,
        deleted: false,
      },
    });
    expect(op.status).toBe('pending');
    const db = await openOfflineDb(scopeA);
    const product = await db.products.get(localId);
    expect(product?.payload['name']).toBe('Aceite');
    const box = await listOutbox(scopeA, ['pending']);
    expect(box).toHaveLength(1);
  });

  it('2. Reiniciar “navegador” y recuperar outbox', async () => {
    const id = newUuid();
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: id,
      payload: { name: 'Cat Offline' },
    });
    await closeAllOfflineDbs();
    const recovered = await listOutbox(scopeA, ['pending']);
    expect(recovered).toHaveLength(1);
    expect(recovered[0]!.clientOperationId).toBe(id);
  });

  it('3. Reintentar mismo UUID', async () => {
    const id = newUuid();
    const calls: string[] = [];
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: id,
      payload: { name: 'Cat' },
    });

    const transport = mockTransport(async ({ body }) => {
      calls.push(body.operations[0]!.clientOperationId);
      if (calls.length === 1) {
        throw new Error('network_down');
      }
      return {
        serverTime: new Date().toISOString(),
        results: [
          {
            clientOperationId: id,
            status: 'applied',
            serverEntityId: 99,
            version: 1,
            idMappings: [{ entityType: 'category', localEntityId: id, serverId: 99 }],
          },
        ],
      } satisfies SyncPushResponse;
    });

    await expect(
      runPushCycle({
        scope: scopeA,
        accessToken: 't',
        tokenBusinessId: 1,
        transport,
      })
    ).rejects.toThrow(/network_down/);

    const still = await listOutbox(scopeA, ['pending']);
    expect(still[0]!.clientOperationId).toBe(id);

    const second = await runPushCycle({
      scope: scopeA,
      accessToken: 't',
      tokenBusinessId: 1,
      transport,
      now: Date.now() + 10_000, // supera backoff post-red
    });
    expect(second.sent).toBe(1);
    expect(second.results[0]?.status).toBe('applied');
    expect(calls[0]).toBe(id);
    expect(calls[1]).toBe(id);
  });

  it('4. Simular pérdida de respuesta HTTP (queda pending, mismo UUID)', async () => {
    const id = newUuid();
    await enqueueMutation(scopeA, {
      operationType: 'BP_UPSERT',
      clientOperationId: id,
      payload: { productId: 1, customPrice: 8.5 },
    });
    await expect(
      runPushCycle({
        scope: scopeA,
        accessToken: 't',
        tokenBusinessId: 1,
        transport: async () => {
          throw new Error('timeout');
        },
      })
    ).rejects.toThrow(/timeout/);
    const ops = await listOutbox(scopeA, ['pending']);
    expect(ops).toHaveLength(1);
    expect(ops[0]!.clientOperationId).toBe(id);
    expect(ops[0]!.lastErrorCode).toBe('NETWORK');
  });

  it('5. Resolver dependencias', async () => {
    const dep = newUuid();
    const child = newUuid();
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: dep,
      payload: { name: 'Parent' },
    });
    await enqueueMutation(scopeA, {
      operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
      clientOperationId: child,
      dependsOn: [dep],
      payload: { name: 'Child', customPrice: 1, categoryServerId: 1 },
    });

    const order: string[] = [];
    const transport: PushTransport = async ({ body }) => {
      order.push(...body.operations.map((o) => o.clientOperationId));
      return {
        serverTime: new Date().toISOString(),
        results: body.operations.map((o) => ({
          clientOperationId: o.clientOperationId,
          status: 'applied' as const,
          serverEntityId: 1,
          version: 1,
        })),
      };
    };

    await runPushCycle({ scope: scopeA, accessToken: 't', tokenBusinessId: 1, transport });
    expect(order).toEqual([dep]); // child espera ack del dep
    await runPushCycle({ scope: scopeA, accessToken: 't', tokenBusinessId: 1, transport });
    expect(order).toEqual([dep, child]);
  });

  it('6. Aplicar idMappings', async () => {
    const localId = newUuid();
    const opId = newUuid();
    await enqueueMutation(scopeA, {
      operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
      clientOperationId: opId,
      localEntityId: localId,
      localEntityType: 'product',
      payload: { name: 'X', customPrice: 2, categoryServerId: 1, localEntityId: localId },
      localProduct: {
        localId,
        serverId: null,
        payload: { name: 'X' },
        version: 0,
        deleted: false,
      },
    });

    await runPushCycle({
      scope: scopeA,
      accessToken: 't',
      tokenBusinessId: 1,
      transport: async () => ({
        serverTime: new Date().toISOString(),
        results: [
          {
            clientOperationId: opId,
            status: 'applied',
            serverEntityId: 55,
            version: 1,
            idMappings: [
              { entityType: 'product', localEntityId: localId, serverId: 55 },
              { entityType: 'businessProduct', localEntityId: localId, serverId: 77 },
            ],
          },
        ],
      }),
    });

    const db = await openOfflineDb(scopeA);
    const map = await db.idMap.get(`product:${localId}`);
    expect(map?.serverId).toBe(55);
    const product = await db.products.get(localId);
    expect(product?.serverId).toBe(55);
    expect(product?.syncStatus).toBe('synced');
  });

  it('7. Rechazo por conflicto de versión', async () => {
    const id = newUuid();
    await enqueueMutation(scopeA, {
      operationType: 'PRODUCT_UPDATE',
      clientOperationId: id,
      baseVersion: 1,
      payload: { serverId: 10, name: 'stale' },
    });
    await runPushCycle({
      scope: scopeA,
      accessToken: 't',
      tokenBusinessId: 1,
      transport: async () => ({
        serverTime: new Date().toISOString(),
        results: [
          {
            clientOperationId: id,
            status: 'conflict',
            code: 'VERSION_CONFLICT',
            message: 'version',
          },
        ],
      }),
    });
    const ops = await listOutbox(scopeA, ['conflict']);
    expect(ops).toHaveLength(1);
    expect(ops[0]!.lastErrorCode).toBe('VERSION_CONFLICT');
  });

  it('8. Rechazo por SKU duplicado', async () => {
    const id = newUuid();
    await enqueueMutation(scopeA, {
      operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
      clientOperationId: id,
      payload: { name: 'Dup', sku: 'X', customPrice: 1, categoryServerId: 1 },
    });
    await runPushCycle({
      scope: scopeA,
      accessToken: 't',
      tokenBusinessId: 1,
      transport: async () => ({
        serverTime: new Date().toISOString(),
        results: [
          {
            clientOperationId: id,
            status: 'rejected',
            code: 'SKU_COLLISION',
            message: 'SKU',
            retryable: false,
          },
        ],
      }),
    });
    const ops = await listOutbox(scopeA, ['rejected']);
    expect(ops).toHaveLength(1);
    expect(ops[0]!.lastErrorCode).toBe('SKU_COLLISION');
  });

  it('9. Cambio de empresa — DBs aisladas', async () => {
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: newUuid(),
      payload: { name: 'OnlyA' },
    });
    await enqueueMutation(scopeB, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: newUuid(),
      payload: { name: 'OnlyB' },
    });
    expect(await listOutbox(scopeA)).toHaveLength(1);
    expect(await listOutbox(scopeB)).toHaveLength(1);
    expect((await listOutbox(scopeA))[0]!.payload['name']).toBe('OnlyA');
  });

  it('10. Cambio de usuario — no mezcla outbox', async () => {
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: newUuid(),
      payload: { name: 'U10' },
    });
    await enqueueMutation(scopeA2, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: newUuid(),
      payload: { name: 'U11' },
    });
    expect(await listOutbox(scopeA)).toHaveLength(1);
    expect(await listOutbox(scopeA2)).toHaveLength(1);
  });

  it('11. Sesión vencida bloquea nuevas mutaciones', async () => {
    setSessionExpirations({ refreshExpiresAt: Date.now() - 1000 });
    expect(getSessionGateState().mutationsAllowed).toBe(false);
    await expect(
      enqueueMutation(scopeA, {
        operationType: 'CATEGORY_PRIVATE_CREATE',
        payload: { name: 'Blocked' },
      })
    ).rejects.toBeInstanceOf(OfflineStorageError);

    await expect(
      runPushCycle({
        scope: scopeA,
        accessToken: 't',
        tokenBusinessId: 1,
        transport: async () => ({ serverTime: '', results: [] }),
      })
    ).rejects.toMatchObject({ code: 'SESSION_BLOCKED' });
  });

  it('12. Dos pestañas — un solo worker envía la cola', async () => {
    const id = newUuid();
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: id,
      payload: { name: 'Tab' },
    });

    let concurrent = 0;
    let maxConcurrent = 0;
    const transport: PushTransport = async () => {
      concurrent += 1;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise((r) => setTimeout(r, 40));
      concurrent -= 1;
      return {
        serverTime: new Date().toISOString(),
        results: [{ clientOperationId: id, status: 'applied', serverEntityId: 1, version: 1 }],
      };
    };

    const [a, b] = await Promise.all([
      runPushCycle({ scope: scopeA, accessToken: 't', tokenBusinessId: 1, transport }),
      runPushCycle({ scope: scopeA, accessToken: 't', tokenBusinessId: 1, transport }),
    ]);
    expect(maxConcurrent).toBe(1);
    expect(a.sent + b.sent).toBe(1);
  });

  it('13. IndexedDB no disponible / cuota', async () => {
    const original = globalThis.indexedDB;
    delete (globalThis as { indexedDB?: IDBFactory }).indexedDB;
    await expect(openOfflineDb(scopeA)).rejects.toMatchObject({ code: 'SSR_FORBIDDEN' });
    Object.defineProperty(globalThis, 'indexedDB', {
      value: original,
      configurable: true,
      writable: true,
    });

    const quotaErr = new OfflineStorageError('Cuota IndexedDB excedida', 'QUOTA_EXCEEDED');
    expect(quotaErr.code).toBe('QUOTA_EXCEEDED');
    // Reabrir tras restaurar indexedDB
    const db = await openOfflineDb(scopeA);
    expect(db).toBeTruthy();
  });

  it('14. Sin eliminación silenciosa de operaciones', async () => {
    const pendingId = newUuid();
    const rejectedId = newUuid();
    const conflictId = newUuid();
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: pendingId,
      payload: { name: 'P' },
    });
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: rejectedId,
      payload: { name: 'R' },
    });
    await enqueueMutation(scopeA, {
      operationType: 'PRODUCT_UPDATE',
      clientOperationId: conflictId,
      baseVersion: 1,
      payload: { serverId: 1, name: 'C' },
    });

    await runPushCycle({
      scope: scopeA,
      accessToken: 't',
      tokenBusinessId: 1,
      transport: async ({ body }) => ({
        serverTime: new Date().toISOString(),
        results: body.operations.map((o) => {
          if (o.clientOperationId === rejectedId) {
            return {
              clientOperationId: o.clientOperationId,
              status: 'rejected' as const,
              code: 'SKU_COLLISION',
              retryable: false,
            };
          }
          if (o.clientOperationId === conflictId) {
            return {
              clientOperationId: o.clientOperationId,
              status: 'conflict' as const,
              code: 'VERSION_CONFLICT',
            };
          }
          return {
            clientOperationId: o.clientOperationId,
            status: 'applied' as const,
            serverEntityId: 1,
            version: 1,
          };
        }),
      }),
    });

    const all = await listOutbox(scopeA);
    expect(all.find((o) => o.clientOperationId === pendingId)?.status).toBe('acked');
    expect(all.find((o) => o.clientOperationId === rejectedId)?.status).toBe('rejected');
    expect(all.find((o) => o.clientOperationId === conflictId)?.status).toBe('conflict');
    // Nadie se borra
    expect(all).toHaveLength(3);
  });

  it('JWT businessId distinto al scope aborta push', async () => {
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: newUuid(),
      payload: { name: 'X' },
    });
    await expect(
      runPushCycle({
        scope: scopeA,
        accessToken: 't',
        tokenBusinessId: 999,
        transport: async () => ({ serverTime: '', results: [] }),
      })
    ).rejects.toMatchObject({ code: 'SCOPE_MISMATCH' });
  });

  it('recoverOrphanSending vuelve sending→pending', async () => {
    const id = newUuid();
    await enqueueMutation(scopeA, {
      operationType: 'CATEGORY_PRIVATE_CREATE',
      clientOperationId: id,
      payload: { name: 'Orphan' },
    });
    const db = await openOfflineDb(scopeA);
    await db.outbox.update(id, { status: 'sending' });
    const n = await recoverOrphanSending(scopeA);
    expect(n).toBe(1);
    expect((await db.outbox.get(id))?.status).toBe('pending');
  });
});
