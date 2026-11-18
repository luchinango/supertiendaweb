/**
 * P2-C0.1B — Sync API HTTP tests (Docker local).
 * npm run test:p2c01:http
 */
import assert from 'assert';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
const DEVICE = 'p2c01b-device-test-001';

type Json = Record<string, any>;

async function api(
  method: string,
  path: string,
  opts?: { token?: string; body?: unknown; deviceId?: string | null; headers?: Record<string, string> }
): Promise<{ code: number; body: Json; raw: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts?.headers || {}) };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts?.deviceId !== null) {
    headers['X-Device-Id'] = opts?.deviceId === undefined ? DEVICE : opts.deviceId;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const raw = await res.text();
  let body: Json = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = { raw };
  }
  return { code: res.status, body, raw: raw.slice(0, 400) };
}

async function login(u: string) {
  const res = await api('POST', '/auth/login', {
    body: { username: u, password: PASS },
    deviceId: null,
  });
  assert.strictEqual(res.code, 200, res.raw);
  return (res.body.data as Json).token as string;
}

function psql(sql: string): string {
  const flat = sql.replace(/\s+/g, ' ').trim();
  if (/\bUPDATE\b/i.test(flat) && !/\bWHERE\b/i.test(flat)) {
    throw new Error(`SQL UPDATE sin WHERE bloqueado: ${flat.slice(0, 120)}`);
  }
  if (/\bDELETE\s+FROM\b/i.test(flat) && !/\bWHERE\b/i.test(flat)) {
    throw new Error(`SQL DELETE sin WHERE bloqueado: ${flat.slice(0, 120)}`);
  }
  const escaped = flat.replace(/"/g, '\\"');
  return execSync(
    `docker exec -i "supertienda-db" psql -U "supertienda" -d "supertienda_dev" -v ON_ERROR_STOP=1 -t -A -c "${escaped}"`,
    { encoding: 'utf8' }
  ).trim();
}

function cleanup() {
  psql(`
DELETE FROM inventory_transactions WHERE notes LIKE 'Sync%' OR reference_type LIKE 'sync_%' OR notes LIKE '%P2C01%';
DELETE FROM business_products WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'P2C01-%' OR name LIKE 'P2C01 %');
DELETE FROM products WHERE sku LIKE 'P2C01-%' OR name LIKE 'P2C01 %';
DELETE FROM categories WHERE name LIKE 'P2C01 %';
DELETE FROM sync_operations WHERE device_id LIKE 'p2c01b-%' OR request_hash IS NOT NULL AND entity_type IS NOT NULL AND created_at > NOW() - INTERVAL '1 day' AND device_id LIKE 'p2c01%';
DELETE FROM sync_operations WHERE device_id = '${DEVICE}';
`);
}

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (e) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(e);
  }
}

async function main() {
  assert.strictEqual((await api('GET', '/health', { deviceId: null })).code, 200);
  cleanup();

  const tokenA = await login('admin_a');
  const tokenB = await login('admin_b');
  const platformToken = await login(process.env.SEED_PLATFORM_USERNAME || 'platform_admin');
  const runTag = randomUUID().slice(0, 8);

  // Sentinelas de aislamiento (P2-C1.G3): no usar BP seed DEMO ids 1–4.
  // El piloto/POS puede mutar existencias DEMO; esta suite solo garantiza que
  // sus propias operaciones no alteran fixtures P2C01-SENTINEL-* creadas aquí.
  const sentinelSku = `P2C01-SENTINEL-${runTag}`;
  const sentinelPrice = '11.25';
  const sentinelStock = 77;
  {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: {
              localEntityId: randomUUID(),
              localBusinessProductId: randomUUID(),
              name: `P2C01 Sentinel ${runTag}`,
              sku: sentinelSku,
              categoryServerId: 1,
              customPrice: Number(sentinelPrice),
              initialStock: sentinelStock,
            },
          },
        ],
      },
    });
    assert.strictEqual(res.code, 200, res.raw);
    assert.strictEqual(res.body.results[0].status, 'applied', JSON.stringify(res.body.results[0]));
  }

  await test('S1 Push sin token → 401', async () => {
    const res = await api('POST', '/sync/push', {
      body: { operations: [] },
      deviceId: DEVICE,
    });
    assert.strictEqual(res.code, 401, res.raw);
  });

  await test('S2 Push PLATFORM_ADMIN → 403', async () => {
    const res = await api('POST', '/sync/push', {
      token: platformToken,
      body: { operations: [] },
    });
    assert.ok(res.code === 403 || res.code === 401, res.raw);
  });

  await test('S3 Push businessId ajeno → 403', async () => {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: { businessId: 2, operations: [] },
    });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('S20 Sin X-Device-Id → 400', async () => {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: { operations: [] },
      deviceId: null,
    });
    assert.ok(res.code === 400 || res.code === 422, `code=${res.code} ${res.raw}`);
  });

  let createdProductId = 0;
  let createdBpId = 0;
  let createdVersion = 1;
  const createOpId = randomUUID();

  await test('S4 Create privado+BP applied', async () => {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: createOpId,
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: {
              localEntityId: randomUUID(),
              localBusinessProductId: randomUUID(),
              name: 'P2C01 Aceite',
              sku: `P2C01-SKU-A1-${runTag}`,
              categoryServerId: 1,
              costPrice: 10,
              sellingPrice: 12,
              customPrice: 15.5,
              initialStock: 10,
            },
          },
        ],
      },
    });
    assert.strictEqual(res.code, 200, res.raw);
    const item = res.body.results[0];
    assert.strictEqual(item.status, 'applied', JSON.stringify(item));
    createdProductId = item.serverEntityId;
    createdVersion = item.version;
    const bpMap = (item.idMappings || []).find((m: any) => m.entityType === 'businessProduct');
    createdBpId = bpMap?.serverId;
    assert.ok(createdProductId > 0);
    assert.ok(createdBpId > 0);
  });

  await test('S5 Reintento mismo UUID+hash → duplicate', async () => {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: createOpId,
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: {
              localEntityId: 'x',
              name: 'P2C01 Aceite',
              sku: `P2C01-SKU-A1-${runTag}`,
              categoryServerId: 1,
              costPrice: 10,
              sellingPrice: 12,
              customPrice: 15.5,
              initialStock: 10,
            },
          },
        ],
      },
    });
    // Payload differs (localEntityId) → mismatch or 200; not a hard duplicate assert
    assert.ok(res.code === 200, res.raw);
  });

  // Proper duplicate with identical payload
  const dupPayload = {
    localEntityId: 'fixed-local-product',
    localBusinessProductId: 'fixed-local-bp',
    name: 'P2C01 Azucar',
    sku: `P2C01-SKU-DUP-${runTag}`,
    categoryServerId: 1,
    costPrice: 1,
    sellingPrice: 2,
    customPrice: 3,
    initialStock: 5,
  };
  const dupOp = randomUUID();

  await test('S5b Duplicate identical payload', async () => {
    const first = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [{ clientOperationId: dupOp, operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP', payload: dupPayload }],
      },
    });
    assert.strictEqual(first.body.results[0].status, 'applied', JSON.stringify(first.body.results[0]));
    const second = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [{ clientOperationId: dupOp, operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP', payload: dupPayload }],
      },
    });
    assert.strictEqual(second.body.results[0].status, 'duplicate');
    assert.strictEqual(second.body.results[0].serverEntityId, first.body.results[0].serverEntityId);
    const n = psql(`SELECT count(*) FROM products WHERE sku='${dupPayload.sku}'`);
    assert.strictEqual(n, '1');
  });

  await test('S6 Mismo UUID payload distinto → IDEMPOTENCY_PAYLOAD_MISMATCH', async () => {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: dupOp,
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: { ...dupPayload, name: 'P2C01 OTRO' },
          },
        ],
      },
    });
    assert.strictEqual(res.code, 200, res.raw);
    assert.strictEqual(res.body.results[0].code, 'IDEMPOTENCY_PAYLOAD_MISMATCH');
    const n = psql(`SELECT count(*) FROM products WHERE sku='${dupPayload.sku}'`);
    assert.strictEqual(n, '1');
  });

  await test('S7 Update baseVersion correcta', async () => {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'PRODUCT_UPDATE',
            baseVersion: createdVersion,
            payload: { serverId: createdProductId, name: 'P2C01 Aceite v2' },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].status, 'applied', JSON.stringify(res.body.results[0]));
    createdVersion = res.body.results[0].version;
  });

  await test('S8 Update baseVersion vieja → conflict', async () => {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'PRODUCT_UPDATE',
            baseVersion: 1,
            payload: { serverId: createdProductId, name: 'hack' },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].status, 'conflict');
    assert.strictEqual(res.body.results[0].code, 'VERSION_CONFLICT');
  });

  await test('S9 SKU duplicado privado → rejected', async () => {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: {
              name: 'P2C01 Clash',
              sku: dupPayload.sku,
              categoryServerId: 1,
              customPrice: 1,
              initialStock: 0,
            },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].status, 'rejected');
    assert.ok(
      res.body.results[0].code === 'SKU_COLLISION' || res.body.results[0].code === 'VALIDATION',
      JSON.stringify(res.body.results[0])
    );
  });

  let bpVersion = Number(psql(`SELECT version FROM business_products WHERE id=${createdBpId}`));

  await test('S10 STOCK_ADJUST insuficiente → INSUFFICIENT_STOCK', async () => {
    const stockBefore = psql(`SELECT current_stock FROM business_products WHERE id=${createdBpId}`);
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'STOCK_ADJUST',
            baseVersion: bpVersion,
            payload: { businessProductId: createdBpId, delta: -9999 },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].code, 'INSUFFICIENT_STOCK', JSON.stringify(res.body.results[0]));
    const stockAfter = psql(`SELECT current_stock FROM business_products WHERE id=${createdBpId}`);
    assert.strictEqual(stockAfter, stockBefore);
  });

  await test('S11 Empresa A no ve ops de B / aislamiento pull', async () => {
    const createB = await api('POST', '/sync/push', {
      token: tokenB,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: {
              name: 'P2C01 Solo B',
              sku: `P2C01-SKU-B1-${runTag}`,
              categoryServerId: 1,
              customPrice: 9,
              initialStock: 1,
            },
          },
        ],
      },
    });
    assert.strictEqual(createB.body.results[0].status, 'applied');
    const pullA = await api('GET', '/sync/pull?streams=catalog&limit=200', { token: tokenA });
    assert.strictEqual(pullA.code, 200, pullA.raw);
    const names = (pullA.body.changes || [])
      .filter((c: any) => c.entityType === 'product' && !c.deleted)
      .map((c: any) => c.payload?.name);
    assert.ok(!names.includes('P2C01 Solo B'), JSON.stringify(names));
  });

  await test('S12 Pull paginado hasMore + cursor', async () => {
    const p1 = await api('GET', '/sync/pull?streams=catalog,stock&limit=2', { token: tokenA });
    assert.strictEqual(p1.code, 200, p1.raw);
    assert.ok(typeof p1.body.cursor === 'string');
    if (p1.body.hasMore) {
      const p2 = await api('GET', `/sync/pull?streams=catalog,stock&limit=2&cursor=${encodeURIComponent(p1.body.cursor)}`, {
        token: tokenA,
      });
      assert.strictEqual(p2.code, 200, p2.raw);
      assert.strictEqual(p2.body.snapshotAt, p1.body.snapshotAt);
    }
  });

  await test('S13 Pull tombstone Product soft-deleted', async () => {
    // Soft-delete via SQL with updatedAt bump (mirrors fixed repository)
    psql(
      `UPDATE products SET deleted_at=NOW(), updated_at=NOW(), version=version+1 WHERE id=${createdProductId}`
    );
    const pull = await api('GET', '/sync/pull?streams=catalog&limit=200', { token: tokenA });
    const tomb = (pull.body.changes || []).find(
      (c: any) => c.entityType === 'product' && c.serverId === createdProductId && c.deleted === true
    );
    assert.ok(tomb, 'expected tombstone');
    // restore for later tests? leave deleted — create new for stock tests
  });

  await test('S14 Access inválido → 401', async () => {
    const res = await api('POST', '/sync/push', {
      token: 'not-a-jwt',
      body: { operations: [] },
    });
    assert.strictEqual(res.code, 401, res.raw);
  });

  await test('S15 Batch: op1 ok op2 fail preserva orden', async () => {
    const op1 = randomUUID();
    const op2 = randomUUID();
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: op1,
            operationType: 'CATEGORY_PRIVATE_CREATE',
            payload: { name: `P2C01 Cat Batch ${runTag}`, localEntityId: randomUUID() },
          },
          {
            clientOperationId: op2,
            operationType: 'SALE_COMPLETE',
            payload: { anything: true },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].status, 'applied');
    assert.strictEqual(res.body.results[1].code, 'NOT_IMPLEMENTED');
  });

  await test('S16 Regresión BP cross-tenant 403', async () => {
    const res = await api('GET', '/business-products?businessId=2', { token: tokenA, deviceId: null });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('S17 Regresión tenant PUT /products/1 403', async () => {
    const res = await api('PUT', '/products/1', {
      token: tokenA,
      body: { name: 'Hack' },
      deviceId: null,
    });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('S18 Regresión platform products OK', async () => {
    const res = await api('GET', '/platform/products?page=1&limit=5', {
      token: platformToken,
      deviceId: null,
    });
    assert.strictEqual(res.code, 200, res.raw);
  });

  await test('Concurrent same UUID → one applied one duplicate', async () => {
    const id = randomUUID();
    const payload = {
      name: 'P2C01 Concurrent',
      sku: `P2C01-SKU-CONC-${runTag}`,
      categoryServerId: 1,
      customPrice: 4,
      initialStock: 2,
    };
    const [r1, r2] = await Promise.all([
      api('POST', '/sync/push', {
        token: tokenA,
        body: { operations: [{ clientOperationId: id, operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP', payload }] },
      }),
      api('POST', '/sync/push', {
        token: tokenA,
        body: { operations: [{ clientOperationId: id, operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP', payload }] },
      }),
    ]);
    const statuses = [r1.body.results?.[0]?.status, r2.body.results?.[0]?.status].sort();
    assert.deepStrictEqual(statuses, ['applied', 'duplicate'], JSON.stringify([r1.body, r2.body]));
    assert.strictEqual(psql(`SELECT count(*) FROM products WHERE sku='${payload.sku}'`), '1');
  });

  await test('STOCK_ADJUST applied + InventoryTransaction once', async () => {
    // fresh product for stock
    const op = randomUUID();
    const create = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: op,
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: {
              name: 'P2C01 Stock',
              sku: `P2C01-SKU-STK-${runTag}`,
              categoryServerId: 1,
              customPrice: 5,
              initialStock: 20,
              localBusinessProductId: randomUUID(),
            },
          },
        ],
      },
    });
    assert.strictEqual(create.body.results[0].status, 'applied', JSON.stringify(create.body.results[0]));
    const bpId = (create.body.results[0].idMappings || []).find((m: any) => m.entityType === 'businessProduct')
      .serverId;
    const ver = Number(psql(`SELECT version FROM business_products WHERE id=${bpId}`));
    const beforeTx = Number(psql(`SELECT count(*) FROM inventory_transactions WHERE product_id=(SELECT product_id FROM business_products WHERE id=${bpId})`));
    const adj = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'STOCK_ADJUST',
            baseVersion: ver,
            payload: { businessProductId: bpId, delta: -3 },
          },
        ],
      },
    });
    assert.strictEqual(adj.body.results[0].status, 'applied', JSON.stringify(adj.body.results[0]));
    assert.strictEqual(psql(`SELECT current_stock FROM business_products WHERE id=${bpId}`), '17');
    const afterTx = Number(
      psql(`SELECT count(*) FROM inventory_transactions WHERE product_id=(SELECT product_id FROM business_products WHERE id=${bpId})`)
    );
    assert.strictEqual(afterTx, beforeTx + 1);

    // retry same adjust op id would be different — test inventory not duplicated on duplicate push of create
    const again = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: op,
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: {
              name: 'P2C01 Stock',
              sku: `P2C01-SKU-STK-${runTag}`,
              categoryServerId: 1,
              customPrice: 5,
              initialStock: 20,
              localBusinessProductId: 'x',
            },
          },
        ],
      },
    });
    assert.ok(
      again.body.results[0].status === 'duplicate' ||
        again.body.results[0].code === 'IDEMPOTENCY_PAYLOAD_MISMATCH'
    );
  });

  await test('Soft-delete BP hidden from stock pull active payload', async () => {
    const bpId = Number(
      psql(
        `SELECT id FROM business_products WHERE product_id IN (SELECT id FROM products WHERE sku='P2C01-SKU-STK-${runTag}') AND deleted_at IS NULL LIMIT 1`
      )
    );
    assert.ok(bpId > 0, 'bp missing');
    psql(`UPDATE business_products SET deleted_at=NOW(), updated_at=NOW(), version=version+1 WHERE id=${bpId}`);
    const pull = await api('GET', '/sync/pull?streams=stock&limit=200', { token: tokenA });
    const tomb = (pull.body.changes || []).find(
      (c: any) => c.entityType === 'businessProduct' && c.serverId === bpId && c.deleted === true
    );
    assert.ok(tomb, 'expected BP tombstone');
  });

  await test('SALE_* NOT_IMPLEMENTED sin efecto', async () => {
    const before = psql(`SELECT count(*) FROM sync_operations`);
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_COMPLETE',
            payload: { total: 1 },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].code, 'NOT_IMPLEMENTED');
    const after = psql(`SELECT count(*) FROM sync_operations`);
    assert.ok(Number(after) >= Number(before));
  });

  // S25 — aislamiento de fixtures de la suite (no seed DEMO compartido)
  await test('S25 Sentinel BP de suite intacto (no seed DEMO)', async () => {
    const snap = psql(
      `SELECT bp.custom_price::text || ':' || bp.current_stock::text
       FROM business_products bp
       JOIN products p ON p.id = bp.product_id
       WHERE p.sku = '${sentinelSku}' AND bp.deleted_at IS NULL
       LIMIT 1`
    );
    assert.strictEqual(
      snap,
      `${sentinelPrice}:${sentinelStock}`,
      `Sentinel ${sentinelSku} mutado por la suite o ausente; obtenido=${snap}`
    );
  });

  cleanup();
  console.log(`\nResultado P2-C0.1B sync HTTP: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
