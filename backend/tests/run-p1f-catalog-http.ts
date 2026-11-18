/**
 * P1-F — contención catálogo maestro (HTTP Docker local).
 * npm run test:p1f:http
 */
import assert from 'assert';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';

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
  return { code: res.status, body, raw: raw.slice(0, 220) };
}

async function login(username: string) {
  const res = await api('POST', '/auth/login', { body: { username, password: PASS } });
  assert.strictEqual(res.code, 200, res.raw);
  const data = res.body.data as Json;
  return {
    token: data.token as string,
    refresh: data.refreshToken as string,
  };
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
  const health = await api('GET', '/health');
  assert.strictEqual(health.code, 200);

  const a = await login('admin_a');
  const b = await login('admin_b');
  const e = await login('employee_a');

  const beforeBp = await api('GET', '/business-products?page=1&limit=50', { token: a.token });
  assert.strictEqual(beforeBp.code, 200);
  const snapA = JSON.stringify(
    ((beforeBp.body.data as Json[]) || []).map((r) => ({
      id: r.id,
      price: r.customPrice,
      stock: r.currentStock,
    }))
  );

  await test('A no modifica producto compartido', async () => {
    const res = await api('PUT', '/products/1', {
      token: a.token,
      body: { name: 'HACK A' },
    });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('B no modifica producto de A', async () => {
    const res = await api('PUT', '/products/2', {
      token: b.token,
      body: { name: 'HACK B' },
    });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('A no desactiva producto de B', async () => {
    const res = await api('PUT', '/products/3/deactivate', { token: a.token });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('Empleado no crea categoría global', async () => {
    const res = await api('POST', '/categories', {
      token: e.token,
      body: { name: 'Hack Cat P1F', isActive: true, sortOrder: 1 },
    });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('Admin A no crea producto maestro', async () => {
    const res = await api('POST', '/products', {
      token: a.token,
      body: {
        name: 'Hack Product',
        categoryId: 1,
        costPrice: 1,
        sellingPrice: 2,
        minStock: 0,
        reorderPoint: 0,
      },
    });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('A no ve producto exclusivo de B (GET id)', async () => {
    const res = await api('GET', '/products/3', { token: a.token });
    assert.strictEqual(res.code, 404, res.raw);
  });

  await test('A lista no incluye producto exclusivo B', async () => {
    const res = await api('GET', '/products?page=1&limit=50', { token: a.token });
    assert.strictEqual(res.code, 200, res.raw);
    const rows = (res.body.data as Json[]) || [];
    const ids = rows.map((r) => r.id);
    assert.ok(ids.includes(1), 'shared visible');
    assert.ok(ids.includes(2), 'A-only visible');
    assert.ok(!ids.includes(3), 'B-only hidden');
  });

  await test('B lista no incluye producto exclusivo A', async () => {
    const res = await api('GET', '/products?page=1&limit=50', { token: b.token });
    assert.strictEqual(res.code, 200, res.raw);
    const ids = ((res.body.data as Json[]) || []).map((r) => r.id);
    assert.ok(ids.includes(1));
    assert.ok(ids.includes(3));
    assert.ok(!ids.includes(2));
  });

  await test('Shared product GET ok for A and B', async () => {
    const ra = await api('GET', '/products/1', { token: a.token });
    const rb = await api('GET', '/products/1', { token: b.token });
    assert.strictEqual(ra.code, 200, ra.raw);
    assert.strictEqual(rb.code, 200, rb.raw);
  });

  await test('BusinessProduct legítimo A', async () => {
    const res = await api('GET', '/business-products?page=1&limit=20', { token: a.token });
    assert.strictEqual(res.code, 200, res.raw);
    const ids = ((res.body.data as Json[]) || []).map((r) => r.businessId);
    assert.ok(ids.every((id) => id === 1));
  });

  await test('BP cross-tenant sigue 403', async () => {
    const res = await api('GET', '/business-products?businessId=2', { token: a.token });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('Stock/precios demo intactos', async () => {
    const after = await api('GET', '/business-products?page=1&limit=50', { token: a.token });
    const snap = JSON.stringify(
      ((after.body.data as Json[]) || []).map((r) => ({
        id: r.id,
        price: r.customPrice,
        stock: r.currentStock,
      }))
    );
    assert.strictEqual(snap, snapA);
  });

  await test('Login+refresh siguen OK', async () => {
    const ref = await api('POST', '/auth/refresh', { body: { refreshToken: a.refresh } });
    assert.strictEqual(ref.code, 200, ref.raw);
  });

  await test('DELETE producto maestro 403', async () => {
    const res = await api('DELETE', '/products/1', { token: a.token });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('PUT categoría 403', async () => {
    const res = await api('PUT', '/categories/1', {
      token: a.token,
      body: { name: 'Hack' },
    });
    assert.strictEqual(res.code, 403, res.raw);
  });

  console.log(`\nResultado P1-F catalog HTTP: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
