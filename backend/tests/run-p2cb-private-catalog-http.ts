/**
 * P2-C.B — API comercial catálogo privado (Docker local).
 * npm run test:p2cb:http
 */
import assert from 'assert';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
const DEVICE = 'p2cb-device-001';

type Json = Record<string, any>;

async function api(
  method: string,
  path: string,
  opts?: {
    token?: string;
    body?: unknown;
    deviceId?: string | null;
    idempotencyKey?: string | null;
    headers?: Record<string, string>;
  }
): Promise<{ code: number; body: Json; raw: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts?.headers || {}),
  };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts?.deviceId !== null) {
    headers['X-Device-Id'] = opts?.deviceId === undefined ? DEVICE : opts.deviceId;
  }
  if (opts?.idempotencyKey) {
    headers['Idempotency-Key'] = opts.idempotencyKey;
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
  return { code: res.status, body, raw: raw.slice(0, 500) };
}

async function login(u: string) {
  const res = await api('POST', '/auth/login', {
    body: { username: u, password: PASS },
    deviceId: null,
    idempotencyKey: null,
  });
  assert.strictEqual(res.code, 200, res.raw);
  return (res.body.data as Json).token as string;
}

function psql(sql: string): string {
  // Una sola línea: cmd.exe -c "..." corta en saltos de línea y puede ejecutar UPDATE sin WHERE.
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

function cleanup(tag: string) {
  psql(
    `DELETE FROM inventory_transactions WHERE notes LIKE '%${tag}%' OR (notes LIKE 'Sync init%' AND created_at > NOW() - INTERVAL '2 hours'); ` +
      `DELETE FROM business_products WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'P2CB-${tag}-%' OR name LIKE 'P2CB ${tag} %'); ` +
      `DELETE FROM products WHERE sku LIKE 'P2CB-${tag}-%' OR name LIKE 'P2CB ${tag} %'; ` +
      `DELETE FROM categories WHERE name LIKE 'P2CB ${tag} %'; ` +
      `DELETE FROM sync_operations WHERE device_id = '${DEVICE}' OR device_id LIKE 'p2cb-%';`
  );
}

/** Repara seed BP 1–4 tras accidentes de pruebas (unique parcial activo). */
function restoreSeedBusinessProducts() {
  psql(
    `DELETE FROM business_products WHERE id > 4 AND product_id IN (1,2,3) AND business_id IN (1,2); ` +
      `UPDATE business_products SET deleted_at = NULL, custom_price = 8.50, current_stock = 100, reserved_stock = 0, available_stock = 100, version = 1, updated_at = NOW() WHERE id = 1; ` +
      `UPDATE business_products SET deleted_at = NULL, custom_price = 9.00, current_stock = 40, reserved_stock = 0, available_stock = 40, version = 1, updated_at = NOW() WHERE id = 2; ` +
      `UPDATE business_products SET deleted_at = NULL, custom_price = 15.00, current_stock = 25, reserved_stock = 0, available_stock = 25, version = 1, updated_at = NOW() WHERE id = 3; ` +
      `UPDATE business_products SET deleted_at = NULL, custom_price = 7.00, current_stock = 60, reserved_stock = 0, available_stock = 60, version = 1, updated_at = NOW() WHERE id = 4;`
  );
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
  assert.strictEqual((await api('GET', '/health', { deviceId: null, idempotencyKey: null })).code, 200);

  const tag = randomUUID().slice(0, 8);
  restoreSeedBusinessProducts();
  cleanup(tag);

  const tokenA = await login('admin_a');
  const tokenB = await login('admin_b');
  const tokenEmp = await login('employee_a');
  const platformToken = await login(process.env.SEED_PLATFORM_USERNAME || 'platform_admin');

  const sharedCatId = Number(
    psql(`SELECT id FROM categories WHERE visibility = 'PLATFORM_SHARED' AND deleted_at IS NULL ORDER BY id LIMIT 1`)
  );
  assert.ok(sharedCatId > 0, 'categoría shared requerida');

  const sharedProductId = Number(
    psql(
      `SELECT id FROM products WHERE visibility = 'PLATFORM_SHARED' AND business_id IS NULL AND deleted_at IS NULL ORDER BY id LIMIT 1`
    )
  );
  assert.ok(sharedProductId > 0, 'producto shared requerido');

  let createdProductId = 0;
  let createdBpId = 0;
  let createdCatId = 0;
  let productVersion = 1;

  await test('POST privado ADMIN crea Product+BP atómicos', async () => {
    const key = randomUUID();
    const res = await api('POST', '/products/private', {
      token: tokenA,
      idempotencyKey: key,
      body: {
        name: `P2CB ${tag} Priv A`,
        categoryServerId: sharedCatId,
        customPrice: 12.5,
        sku: `P2CB-${tag}-A1`,
        initialStock: 3,
        localEntityId: `local-p-${tag}`,
        localBusinessProductId: `local-bp-${tag}`,
      },
    });
    assert.strictEqual(res.code, 200, res.raw);
    assert.ok(res.body.productId > 0);
    assert.ok(res.body.businessProductId > 0);
    assert.strictEqual(res.body.customPrice, 12.5);
    assert.strictEqual(res.body.currentStock, 3);
    assert.strictEqual(res.body.status, 'applied');
    assert.ok(Array.isArray(res.body.idMappings) && res.body.idMappings.length >= 1);
    createdProductId = res.body.productId;
    createdBpId = res.body.businessProductId;
    productVersion = res.body.version;
  });

  await test('POST privado EMPLOYEE → 403 FORBIDDEN_ROLE', async () => {
    const res = await api('POST', '/products/private', {
      token: tokenEmp,
      idempotencyKey: randomUUID(),
      body: {
        name: `P2CB ${tag} Emp Block`,
        categoryServerId: sharedCatId,
        customPrice: 1,
      },
    });
    assert.strictEqual(res.code, 403, res.raw);
    assert.strictEqual(res.body.code, 'FORBIDDEN_ROLE');
  });

  await test('POST privado PLATFORM_ADMIN → 403', async () => {
    const res = await api('POST', '/products/private', {
      token: platformToken,
      idempotencyKey: randomUUID(),
      body: {
        name: `P2CB ${tag} Plat Block`,
        categoryServerId: sharedCatId,
        customPrice: 1,
      },
    });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('Idempotency: reintento mismo UUID+payload → duplicate mismos IDs', async () => {
    const key = randomUUID();
    const body = {
      name: `P2CB ${tag} Idem`,
      categoryServerId: sharedCatId,
      customPrice: 9.99,
      sku: `P2CB-${tag}-IDEM`,
      localEntityId: `local-idem-${tag}`,
    };
    const r1 = await api('POST', '/products/private', { token: tokenA, idempotencyKey: key, body });
    assert.strictEqual(r1.code, 200, r1.raw);
    const r2 = await api('POST', '/products/private', { token: tokenA, idempotencyKey: key, body });
    assert.strictEqual(r2.code, 200, r2.raw);
    assert.strictEqual(r2.body.status, 'duplicate');
    assert.strictEqual(r2.body.productId, r1.body.productId);
    assert.strictEqual(r2.body.businessProductId, r1.body.businessProductId);
  });

  await test('Mismo UUID payload distinto → IDEMPOTENCY_PAYLOAD_MISMATCH', async () => {
    const key = randomUUID();
    const r1 = await api('POST', '/products/private', {
      token: tokenA,
      idempotencyKey: key,
      body: {
        name: `P2CB ${tag} Mismatch1`,
        categoryServerId: sharedCatId,
        customPrice: 5,
        sku: `P2CB-${tag}-MM1`,
      },
    });
    assert.strictEqual(r1.code, 200, r1.raw);
    const r2 = await api('POST', '/products/private', {
      token: tokenA,
      idempotencyKey: key,
      body: {
        name: `P2CB ${tag} Mismatch2`,
        categoryServerId: sharedCatId,
        customPrice: 6,
        sku: `P2CB-${tag}-MM2`,
      },
    });
    assert.strictEqual(r2.code, 409, r2.raw);
    assert.strictEqual(r2.body.code, 'IDEMPOTENCY_PAYLOAD_MISMATCH');
  });

  await test('Sin Idempotency-Key → 400', async () => {
    const res = await api('POST', '/products/private', {
      token: tokenA,
      idempotencyKey: null,
      body: { name: 'x', categoryServerId: sharedCatId, customPrice: 1 },
    });
    assert.strictEqual(res.code, 400, res.raw);
  });

  await test('GET privado ADMIN y EMPLOYEE ven solo empresa JWT', async () => {
    const listA = await api('GET', '/products/private?limit=50&search=P2CB', {
      token: tokenA,
      idempotencyKey: null,
    });
    assert.strictEqual(listA.code, 200, listA.raw);
    assert.ok((listA.body.items || []).some((i: any) => i.productId === createdProductId));

    const listEmp = await api('GET', '/products/private?limit=50&search=P2CB', {
      token: tokenEmp,
      idempotencyKey: null,
    });
    assert.strictEqual(listEmp.code, 200, listEmp.raw);
    assert.ok((listEmp.body.items || []).some((i: any) => i.productId === createdProductId));

    const listB = await api('GET', '/products/private?limit=50&search=P2CB', {
      token: tokenB,
      idempotencyKey: null,
    });
    assert.strictEqual(listB.code, 200, listB.raw);
    assert.ok(!(listB.body.items || []).some((i: any) => i.productId === createdProductId));
  });

  await test('PUT privado ADMIN actualiza; EMPLOYEE 403; versión conflict', async () => {
    const ok = await api('PUT', `/products/private/${createdProductId}`, {
      token: tokenA,
      idempotencyKey: randomUUID(),
      body: { baseVersion: productVersion, name: `P2CB ${tag} Priv A v2` },
    });
    assert.strictEqual(ok.code, 200, ok.raw);
    assert.strictEqual(ok.body.name, `P2CB ${tag} Priv A v2`);
    productVersion = ok.body.version;

    const emp = await api('PUT', `/products/private/${createdProductId}`, {
      token: tokenEmp,
      idempotencyKey: randomUUID(),
      body: { baseVersion: productVersion, name: 'nope' },
    });
    assert.strictEqual(emp.code, 403, emp.raw);

    const conflict = await api('PUT', `/products/private/${createdProductId}`, {
      token: tokenA,
      idempotencyKey: randomUUID(),
      body: { baseVersion: 1, name: 'stale' },
    });
    assert.strictEqual(conflict.code, 409, conflict.raw);
    assert.strictEqual(conflict.body.code, 'VERSION_CONFLICT');
  });

  await test('PUT producto PLATFORM_SHARED vía privado → NOT_FOUND', async () => {
    const res = await api('PUT', `/products/private/${sharedProductId}`, {
      token: tokenA,
      idempotencyKey: randomUUID(),
      body: { baseVersion: 1, name: 'hack shared' },
    });
    assert.strictEqual(res.code, 404, res.raw);
  });

  await test('Empresa B no edita producto privado de A', async () => {
    const res = await api('PUT', `/products/private/${createdProductId}`, {
      token: tokenB,
      idempotencyKey: randomUUID(),
      body: { baseVersion: productVersion, name: 'cross' },
    });
    assert.strictEqual(res.code, 404, res.raw);
  });

  await test('Categoría privada create/update + ajena', async () => {
    const key = randomUUID();
    const c1 = await api('POST', '/categories/private', {
      token: tokenA,
      idempotencyKey: key,
      body: { name: `P2CB ${tag} Cat A`, localEntityId: `local-cat-${tag}` },
    });
    assert.strictEqual(c1.code, 200, c1.raw);
    createdCatId = c1.body.categoryId;

    const cDup = await api('POST', '/categories/private', {
      token: tokenA,
      idempotencyKey: key,
      body: { name: `P2CB ${tag} Cat A`, localEntityId: `local-cat-${tag}` },
    });
    assert.strictEqual(cDup.code, 200, cDup.raw);
    assert.strictEqual(cDup.body.status, 'duplicate');

    const up = await api('PUT', `/categories/private/${createdCatId}`, {
      token: tokenA,
      idempotencyKey: randomUUID(),
      body: { baseVersion: c1.body.version, name: `P2CB ${tag} Cat A2` },
    });
    assert.strictEqual(up.code, 200, up.raw);

    const cross = await api('PUT', `/categories/private/${createdCatId}`, {
      token: tokenB,
      idempotencyKey: randomUUID(),
      body: { baseVersion: up.body.version, name: 'stolen' },
    });
    assert.strictEqual(cross.code, 404, cross.raw);

    // Producto con categoría privada ajena
    const bad = await api('POST', '/products/private', {
      token: tokenB,
      idempotencyKey: randomUUID(),
      body: {
        name: `P2CB ${tag} Bad Cat`,
        categoryServerId: createdCatId,
        customPrice: 2,
        sku: `P2CB-${tag}-BADCAT`,
      },
    });
    assert.strictEqual(bad.code, 404, bad.raw);
    assert.ok(['CATEGORY_NOT_FOUND', 'NOT_FOUND'].includes(bad.body.code), bad.raw);
  });

  await test('Adopt shared + precio independiente + soft-delete no reactiva', async () => {
    // Soft-delete solo el BP seed id=1 (shared A); no tocar el resto
    psql(
      `UPDATE business_products SET deleted_at = NOW(), updated_at = NOW(), version = version + 1 WHERE id = 1 AND deleted_at IS NULL`
    );

    const adoptKey = randomUUID();
    const adopt = await api('POST', `/products/shared/${sharedProductId}/adopt`, {
      token: tokenA,
      idempotencyKey: adoptKey,
      body: { customPrice: 33.3, localEntityId: `adopt-${tag}` },
    });
    assert.strictEqual(adopt.code, 200, adopt.raw);
    assert.strictEqual(adopt.body.customPrice, 33.3);
    assert.strictEqual(adopt.body.productId, sharedProductId);
    const newBpId = adopt.body.businessProductId;
    assert.notStrictEqual(newBpId, 1, 'no debe reactivar BP soft-deleted id=1');

    const activeCount = Number(
      psql(
        `SELECT COUNT(*) FROM business_products WHERE business_id = 1 AND product_id = ${sharedProductId} AND deleted_at IS NULL`
      )
    );
    assert.strictEqual(activeCount, 1);
    const deletedSeed = psql(`SELECT deleted_at IS NOT NULL FROM business_products WHERE id = 1`);
    assert.strictEqual(deletedSeed, 't');

    const adopt2 = await api('POST', `/products/shared/${sharedProductId}/adopt`, {
      token: tokenA,
      idempotencyKey: adoptKey,
      body: { customPrice: 33.3, localEntityId: `adopt-${tag}` },
    });
    assert.strictEqual(adopt2.code, 200, adopt2.raw);
    assert.strictEqual(adopt2.body.status, 'duplicate');
    assert.strictEqual(adopt2.body.businessProductId, newBpId);

    // B mantiene/actualiza precio independiente sobre su BP seed id=2
    const verB = Number(psql(`SELECT version FROM business_products WHERE id = 2 AND deleted_at IS NULL`));
    assert.ok(verB > 0);
    const priceB = await api('PUT', `/business-products/2/price`, {
      token: tokenB,
      idempotencyKey: randomUUID(),
      body: { customPrice: 44.4, baseVersion: verB },
    });
    assert.strictEqual(priceB.code, 200, priceB.raw);
    assert.strictEqual(priceB.body.customPrice, 44.4);
    const priceA = Number(psql(`SELECT custom_price FROM business_products WHERE id = ${newBpId}`));
    assert.strictEqual(priceA, 33.3);
  });

  await test('PUT price BP propio + conflict + cross-tenant', async () => {
    const bpRow = psql(
      `SELECT id || '|' || version FROM business_products WHERE business_id = 1 AND product_id = ${createdProductId} AND deleted_at IS NULL LIMIT 1`
    );
    assert.ok(bpRow.includes('|'), `BP activo esperado para product ${createdProductId}`);
    const [bpIdStr, verStr] = bpRow.split('|');
    const bpId = Number(bpIdStr);
    const ver = Number(verStr);
    createdBpId = bpId;

    const ok = await api('PUT', `/business-products/${bpId}/price`, {
      token: tokenA,
      idempotencyKey: randomUUID(),
      body: { customPrice: 19.5, baseVersion: ver },
    });
    assert.strictEqual(ok.code, 200, ok.raw);
    assert.strictEqual(ok.body.customPrice, 19.5);

    const conflict = await api('PUT', `/business-products/${bpId}/price`, {
      token: tokenA,
      idempotencyKey: randomUUID(),
      body: { customPrice: 20, baseVersion: ver },
    });
    assert.strictEqual(conflict.code, 409, conflict.raw);
    assert.strictEqual(conflict.body.code, 'VERSION_CONFLICT');

    const cross = await api('PUT', `/business-products/${bpId}/price`, {
      token: tokenB,
      idempotencyKey: randomUUID(),
      body: { customPrice: 1, baseVersion: 1 },
    });
    assert.strictEqual(cross.code, 404, cross.raw);

    const emp = await api('PUT', `/business-products/${bpId}/price`, {
      token: tokenEmp,
      idempotencyKey: randomUUID(),
      body: { customPrice: 1, baseVersion: ok.body.version },
    });
    assert.strictEqual(emp.code, 403, emp.raw);
  });

  await test('SKU duplicado privado → SKU_COLLISION', async () => {
    const res = await api('POST', '/products/private', {
      token: tokenA,
      idempotencyKey: randomUUID(),
      body: {
        name: `P2CB ${tag} Dup SKU`,
        categoryServerId: sharedCatId,
        customPrice: 1,
        sku: `P2CB-${tag}-A1`,
      },
    });
    assert.strictEqual(res.code, 409, res.raw);
    assert.strictEqual(res.body.code, 'SKU_COLLISION');
  });

  await test('Regresión sync push/pull sigue operativo', async () => {
    const push = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: {
              name: `P2CB ${tag} ViaSync`,
              categoryServerId: sharedCatId,
              customPrice: 7,
              sku: `P2CB-${tag}-SYNC`,
            },
          },
        ],
      },
    });
    assert.strictEqual(push.code, 200, push.raw);
    assert.strictEqual(push.body.results[0].status, 'applied');

    const pull = await api('GET', '/sync/pull?streams=catalog&limit=5', {
      token: tokenA,
      deviceId: DEVICE,
    });
    assert.strictEqual(pull.code, 200, pull.raw);
    assert.ok(pull.body.snapshotAt);
    assert.ok(Array.isArray(pull.body.changes));
  });

  await test('Regresión P1-F: tenant no muta maestro', async () => {
    const res = await api('PUT', `/products/${sharedProductId}`, {
      token: tokenA,
      idempotencyKey: null,
      body: { name: 'hack' },
    });
    assert.ok([403, 404].includes(res.code), res.raw);
  });

  cleanup(tag);
  restoreSeedBusinessProducts();

  console.log(`\nResultado P2-C.B private catalog HTTP: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
