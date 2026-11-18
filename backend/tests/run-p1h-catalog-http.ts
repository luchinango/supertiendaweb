/**
 * P1-H — catálogo maestro vía /platform (HTTP Docker local).
 * npm run test:p1h:http
 * Limpia solo registros creados por esta suite (prefijo P1H).
 */
import assert from 'assert';
import { execSync } from 'child_process';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
const PLATFORM_USER = process.env.SEED_PLATFORM_USERNAME || 'platform_admin';

type Json = Record<string, unknown>;

async function api(
  method: string,
  path: string,
  opts?: { token?: string; body?: unknown }
): Promise<{ code: number; body: Json; raw: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const raw = await res.text();
  let body: Json = {};
  try {
    body = raw ? (JSON.parse(raw) as Json) : {};
  } catch {
    body = { raw };
  }
  return { code: res.status, body, raw: raw.slice(0, 260) };
}

async function login(username: string) {
  const res = await api('POST', '/auth/login', { body: { username, password: PASS } });
  assert.strictEqual(res.code, 200, `${username}: ${res.raw}`);
  return (res.body.data as Json).token as string;
}

function cleanupSuiteArtifacts() {
  execSync(
    `docker exec -i "supertienda-db" psql -U "supertienda" -d "supertienda_dev" -c "UPDATE products SET deleted_at=NOW(), is_active=false WHERE sku LIKE 'P1H-%' OR name LIKE 'P1H %'; UPDATE categories SET deleted_at=NOW() WHERE name LIKE 'P1H %';"`,
    { encoding: 'utf8' }
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
  assert.strictEqual((await api('GET', '/health')).code, 200);

  const platformToken = await login(PLATFORM_USER);
  const tokenA = await login('admin_a');
  const tokenB = await login('admin_b');
  const tokenE = await login('employee_a');

  const bpBefore = await api('GET', '/business-products?page=1&limit=50', { token: tokenA });
  assert.strictEqual(bpBefore.code, 200);
  const snapA = JSON.stringify(
    ((bpBefore.body.data as Json[]) || []).map((r) => ({
      id: r.id,
      price: r.customPrice,
      stock: r.currentStock,
    }))
  );
  const bpBeforeB = await api('GET', '/business-products?page=1&limit=50', { token: tokenB });
  const snapB = JSON.stringify(
    ((bpBeforeB.body.data as Json[]) || []).map((r) => ({
      id: r.id,
      price: r.customPrice,
      stock: r.currentStock,
    }))
  );

  const sharedBefore = await api('GET', '/products/1', { token: tokenA });
  const sharedNameBefore = (sharedBefore.body.data as Json)?.name;

  let createdProductId: number | null = null;
  let createdCategoryId: number | null = null;

  await test('1. PLATFORM crea producto maestro', async () => {
    const res = await api('POST', '/platform/products', {
      token: platformToken,
      body: {
        name: 'P1H Producto Maestro',
        categoryId: 1,
        sku: 'P1H-SKU-001',
        costPrice: 3,
        sellingPrice: 5,
        minStock: 0,
        reorderPoint: 0,
      },
    });
    assert.strictEqual(res.code, 201, res.raw);
    createdProductId = (res.body.data as Json).id as number;
    assert.ok(createdProductId > 0);
  });

  await test('2. PLATFORM consulta productos maestros', async () => {
    const res = await api('GET', '/platform/products?page=1&limit=50', { token: platformToken });
    assert.strictEqual(res.code, 200, res.raw);
    const rows = (res.body.data as Json[]) || [];
    assert.ok(rows.some((r) => r.sku === 'P1H-SKU-001'));
    assert.ok(rows.some((r) => r.id === 1));
  });

  await test('3. PLATFORM modifica campos autorizados', async () => {
    assert.ok(createdProductId);
    const res = await api('PUT', `/platform/products/${createdProductId}`, {
      token: platformToken,
      body: { name: 'P1H Producto Maestro Editado', description: 'edit' },
    });
    assert.strictEqual(res.code, 200, res.raw);
    assert.strictEqual((res.body.data as Json).name, 'P1H Producto Maestro Editado');

    const blocked = await api('PUT', '/platform/products/1', {
      token: platformToken,
      body: { isActive: false },
    });
    assert.strictEqual(blocked.code, 403, blocked.raw);
  });

  await test('4. PLATFORM administra categorías', async () => {
    const create = await api('POST', '/platform/categories', {
      token: platformToken,
      body: { name: 'P1H Cat Maestro', description: 'suite', isActive: true, sortOrder: 50 },
    });
    assert.strictEqual(create.code, 201, create.raw);
    createdCategoryId = (create.body.data as Json).id as number;

    const list = await api('GET', '/platform/categories?page=1&limit=50', { token: platformToken });
    assert.strictEqual(list.code, 200, list.raw);
    assert.ok(((list.body.data as Json[]) || []).some((c) => c.id === createdCategoryId));

    const upd = await api('PUT', `/platform/categories/${createdCategoryId}`, {
      token: platformToken,
      body: { description: 'suite-edit' },
    });
    assert.strictEqual(upd.code, 200, upd.raw);
  });

  await test('5-7. A/B/empleado 403 en /platform/products', async () => {
    for (const [label, tok] of [
      ['A', tokenA],
      ['B', tokenB],
      ['E', tokenE],
    ] as const) {
      const res = await api('GET', '/platform/products', { token: tok });
      assert.strictEqual(res.code, 403, `${label}: ${res.raw}`);
      const post = await api('POST', '/platform/products', {
        token: tok,
        body: { name: 'Hack', categoryId: 1, costPrice: 1, sellingPrice: 2 },
      });
      assert.strictEqual(post.code, 403, `${label} post: ${post.raw}`);
    }
  });

  await test('8. Sin token 401', async () => {
    assert.strictEqual((await api('GET', '/platform/products')).code, 401);
  });

  await test('9. Plataforma no accede rutas comerciales tenant', async () => {
    const res = await api('GET', '/business-products?page=1&limit=5', { token: platformToken });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('10. Mutaciones globales antiguas bloqueadas', async () => {
    const res = await api('PUT', '/products/1', {
      token: tokenA,
      body: { name: 'Hack Tenant' },
    });
    assert.strictEqual(res.code, 403, res.raw);
    const res2 = await api('POST', '/categories', {
      token: tokenA,
      body: { name: 'Hack Cat Tenant', isActive: true },
    });
    assert.strictEqual(res2.code, 403, res2.raw);
  });

  await test('11. Precios/stock A/B intactos', async () => {
    const afterA = await api('GET', '/business-products?page=1&limit=50', { token: tokenA });
    const afterB = await api('GET', '/business-products?page=1&limit=50', { token: tokenB });
    const sA = JSON.stringify(
      ((afterA.body.data as Json[]) || []).map((r) => ({
        id: r.id,
        price: r.customPrice,
        stock: r.currentStock,
      }))
    );
    const sB = JSON.stringify(
      ((afterB.body.data as Json[]) || []).map((r) => ({
        id: r.id,
        price: r.customPrice,
        stock: r.currentStock,
      }))
    );
    assert.strictEqual(sA, snapA);
    assert.strictEqual(sB, snapB);
  });

  await test('12. Referencias históricas no dañadas', async () => {
    const shared = await api('GET', '/products/1', { token: tokenA });
    assert.strictEqual(shared.code, 200, shared.raw);
    assert.strictEqual((shared.body.data as Json).name, sharedNameBefore);
    assert.strictEqual((shared.body.data as Json).sku, 'SKU-SHARED-001');
  });

  cleanupSuiteArtifacts();

  console.log(`\nResultado P1-H catalog HTTP: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
