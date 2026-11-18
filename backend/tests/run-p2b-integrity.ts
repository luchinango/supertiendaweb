/**
 * P2-B — integridad de constraints del catálogo híbrido (Docker local).
 * Usa transacciones revertidas / cleanup controlado. No deja residuos.
 * npm run test:p2b:integrity
 */
import assert from 'assert';
import { execSync } from 'child_process';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
const PLATFORM_USER = process.env.SEED_PLATFORM_USERNAME || 'platform_admin';

function psql(sql: string): string {
  // Aplanar whitespace: cmd.exe -c "..." corta en saltos de línea (riesgo UPDATE sin WHERE).
  const flat = sql.replace(/\s+/g, ' ').trim();
  if (/\bUPDATE\b/i.test(flat) && !/\bWHERE\b/i.test(flat)) {
    throw new Error(`SQL UPDATE sin WHERE bloqueado por seguridad: ${flat.slice(0, 120)}`);
  }
  if (/\bDELETE\s+FROM\b/i.test(flat) && !/\bWHERE\b/i.test(flat)) {
    throw new Error(`SQL DELETE sin WHERE bloqueado por seguridad: ${flat.slice(0, 120)}`);
  }
  const escaped = flat.replace(/"/g, '\\"');
  return execSync(
    `docker exec -i "supertienda-db" psql -U "supertienda" -d "supertienda_dev" -v ON_ERROR_STOP=1 -t -A -c "${escaped}"`,
    { encoding: 'utf8' }
  ).trim();
}

function psqlExpectFail(sql: string): void {
  let failed = false;
  try {
    psql(sql);
  } catch {
    failed = true;
  }
  assert.ok(failed, `Expected SQL to fail: ${sql.slice(0, 80)}`);
}

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
  return { code: res.status, body, raw: raw.slice(0, 200) };
}

async function login(u: string) {
  const res = await api('POST', '/auth/login', { body: { username: u, password: PASS } });
  assert.strictEqual(res.code, 200, res.raw);
  return (res.body.data as Json).token as string;
}

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void) {
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

  await test('CHECK: shared con businessId no nulo → rechazado', () => {
    psqlExpectFail(
      `INSERT INTO products (category_id, business_id, visibility, name, cost_price, selling_price) VALUES (1, 1, 'PLATFORM_SHARED', 'P2B bad shared', 1, 2)`
    );
  });

  await test('CHECK: private sin businessId → rechazado', () => {
    psqlExpectFail(
      `INSERT INTO products (category_id, business_id, visibility, name, cost_price, selling_price) VALUES (1, NULL, 'BUSINESS_PRIVATE', 'P2B bad private', 1, 2)`
    );
  });

  await test('SKU duplicado misma empresa privada → rechazado', () => {
    psql(
      `INSERT INTO products (category_id, business_id, visibility, name, sku, cost_price, selling_price) VALUES (1, 1, 'BUSINESS_PRIVATE', 'P2B priv A1', 'P2B-SKU-DUP', 1, 2)`
    );
    psqlExpectFail(
      `INSERT INTO products (category_id, business_id, visibility, name, sku, cost_price, selling_price) VALUES (1, 1, 'BUSINESS_PRIVATE', 'P2B priv A2', 'P2B-SKU-DUP', 1, 2)`
    );
    psql(`DELETE FROM products WHERE sku = 'P2B-SKU-DUP'`);
  });

  await test('SKU igual entre dos empresas privadas → permitido', () => {
    psql(
      `INSERT INTO products (category_id, business_id, visibility, name, sku, cost_price, selling_price) VALUES (1, 1, 'BUSINESS_PRIVATE', 'P2B priv A', 'P2B-SKU-CROSS', 1, 2)`
    );
    psql(
      `INSERT INTO products (category_id, business_id, visibility, name, sku, cost_price, selling_price) VALUES (1, 2, 'BUSINESS_PRIVATE', 'P2B priv B', 'P2B-SKU-CROSS', 1, 2)`
    );
    const n = psql(`SELECT count(*) FROM products WHERE sku = 'P2B-SKU-CROSS'`);
    assert.strictEqual(n, '2');
    psql(`DELETE FROM products WHERE sku = 'P2B-SKU-CROSS'`);
  });

  await test('Categoría shared duplicada → rechazada', () => {
    psqlExpectFail(
      `INSERT INTO categories (name, visibility, business_id) VALUES ('Abarrotes Dev', 'PLATFORM_SHARED', NULL)`
    );
  });

  const tokenA = await login('admin_a');
  const tokenB = await login('admin_b');
  const platformToken = await login(PLATFORM_USER);

  await test('BusinessProduct aislamiento A/B', async () => {
    const cross = await api('GET', '/business-products?businessId=2', { token: tokenA });
    assert.strictEqual(cross.code, 403, cross.raw);
    const own = await api('GET', '/business-products?page=1&limit=10', { token: tokenA });
    assert.strictEqual(own.code, 200, own.raw);
    assert.ok(((own.body.data as Json[]) || []).every((r) => r.businessId === 1));
  });

  await test('Mutaciones tenant maestro siguen 403', async () => {
    const res = await api('PUT', '/products/1', { token: tokenA, body: { name: 'Hack' } });
    assert.strictEqual(res.code, 403, res.raw);
  });

  await test('PLATFORM_ADMIN opera en plataforma', async () => {
    const h = await api('GET', '/platform/health', { token: platformToken });
    assert.strictEqual(h.code, 200, h.raw);
    const list = await api('GET', '/platform/products?page=1&limit=10', { token: platformToken });
    assert.strictEqual(list.code, 200, list.raw);
  });

  await test('BP precios/stocks seed intactos', () => {
    const snap = psql(
      `SELECT string_agg(id||':'||custom_price||':'||current_stock, ',' ORDER BY id) FROM business_products WHERE id IN (1,2,3,4)`
    );
    assert.strictEqual(snap, '1:8.50:100,2:9.00:40,3:15.00:25,4:7.00:60');
  });

  // Ensure no leftover P2B rows
  psql(`DELETE FROM products WHERE name LIKE 'P2B %' OR sku LIKE 'P2B-%'`);
  psql(`DELETE FROM categories WHERE name LIKE 'P2B %'`);

  console.log(`\nResultado P2-B integrity: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
