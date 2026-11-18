/**
 * P1-G — autorización plataforma (HTTP Docker local).
 * npm run test:p1g:http
 */
import assert from 'assert';

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
  return { code: res.status, body, raw: raw.slice(0, 240) };
}

function decodePayload(token: string): Json {
  const part = token.split('.')[1];
  const padded = part + '='.repeat((4 - (part.length % 4)) % 4);
  const json = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  return JSON.parse(json) as Json;
}

async function login(username: string) {
  const res = await api('POST', '/auth/login', { body: { username, password: PASS } });
  assert.strictEqual(res.code, 200, `${username}: ${res.raw}`);
  const data = res.body.data as Json;
  return {
    token: data.token as string,
    refresh: data.refreshToken as string,
    user: data.user as Json,
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
  assert.strictEqual((await api('GET', '/health')).code, 200);

  let platformToken = '';
  let platformRefresh = '';
  let tokenA = '';
  let tokenB = '';
  let tokenE = '';

  await test('1. Login platform_admin', async () => {
    const data = await login(PLATFORM_USER);
    platformToken = data.token;
    platformRefresh = data.refresh;
    assert.strictEqual(data.user.role, 'PLATFORM_ADMIN');
    assert.ok(!data.user.employee);
  });

  await test('2. Refresh platform_admin', async () => {
    const res = await api('POST', '/auth/refresh', { body: { refreshToken: platformRefresh } });
    assert.strictEqual(res.code, 200, res.raw);
    const data = res.body.data as Json;
    platformToken = data.token as string;
    platformRefresh = data.refreshToken as string;
    assert.strictEqual(decodePayload(platformToken).tokenType, 'access');
    assert.strictEqual(decodePayload(platformRefresh).tokenType, 'refresh');
  });

  await test('3. Plataforma sin businessId', async () => {
    const p = decodePayload(platformToken);
    assert.strictEqual(p.role, 'PLATFORM_ADMIN');
    assert.ok(p.businessId === null || p.businessId === undefined);
  });

  await test('4. Plataforma /platform/health 200', async () => {
    const res = await api('GET', '/platform/health', { token: platformToken });
    assert.strictEqual(res.code, 200, res.raw);
    const data = res.body.data as Json;
    assert.strictEqual(data.scope, 'platform');
    assert.strictEqual(data.role, 'PLATFORM_ADMIN');
  });

  await test('5. Plataforma no accede rutas tenant', async () => {
    const res = await api('GET', '/business-products?page=1&limit=5', { token: platformToken });
    assert.ok(res.code === 403 || res.code === 401, res.raw);
    const res2 = await api('GET', '/products?page=1&limit=5', { token: platformToken });
    assert.ok(res2.code === 403 || res2.code === 401, res2.raw);
  });

  await test('6-8. A/B/empleado no acceden /platform/health', async () => {
    tokenA = (await login('admin_a')).token;
    tokenB = (await login('admin_b')).token;
    tokenE = (await login('employee_a')).token;
    for (const [label, tok] of [
      ['A', tokenA],
      ['B', tokenB],
      ['E', tokenE],
    ] as const) {
      const res = await api('GET', '/platform/health', { token: tok });
      assert.strictEqual(res.code, 403, `${label}: ${res.raw}`);
    }
  });

  await test('9. Claims manipulados no escalan', async () => {
    // Reescribir claim role a PLATFORM_ADMIN sobre token de empresa A (firma rota → 401)
    const parts = tokenA.split('.');
    const payload = decodePayload(tokenA);
    payload.role = 'PLATFORM_ADMIN';
    payload.businessId = null;
    const fakePayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const forged = `${parts[0]}.${fakePayload}.${parts[2]}`;
    const res = await api('GET', '/platform/health', { token: forged });
    assert.ok(res.code === 401 || res.code === 403, res.raw);

    // Sin token / token basura
    assert.strictEqual((await api('GET', '/platform/health')).code, 401);
    assert.strictEqual((await api('GET', '/platform/health', { token: 'x.y.z' })).code, 401);
  });

  await test('10. Login/refresh empresariales OK', async () => {
    const a = await login('admin_a');
    assert.strictEqual(decodePayload(a.token).businessId, 1);
    const ref = await api('POST', '/auth/refresh', { body: { refreshToken: a.refresh } });
    assert.strictEqual(ref.code, 200, ref.raw);
    assert.strictEqual(decodePayload((ref.body.data as Json).token as string).businessId, 1);
  });

  await test('11. BusinessProduct aislamiento', async () => {
    const cross = await api('GET', '/business-products?businessId=2', { token: tokenA });
    assert.strictEqual(cross.code, 403, cross.raw);
    const own = await api('GET', '/business-products?page=1&limit=10', { token: tokenA });
    assert.strictEqual(own.code, 200, own.raw);
  });

  await test('12. Mutaciones globales bloqueadas (P1-F)', async () => {
    const res = await api('PUT', '/products/1', {
      token: tokenA,
      body: { name: 'Hack' },
    });
    assert.strictEqual(res.code, 403, res.raw);
    const resP = await api('POST', '/products', {
      token: platformToken,
      body: {
        name: 'Hack Platform',
        categoryId: 1,
        costPrice: 1,
        sellingPrice: 2,
        minStock: 0,
        reorderPoint: 0,
      },
    });
    // Plataforma tampoco puede mutar /products (P1-F + sin CRUD maestro)
    assert.ok(resP.code === 403 || resP.code === 401, resP.raw);
  });

  console.log(`\nResultado P1-G platform HTTP: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
