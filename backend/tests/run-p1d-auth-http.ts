/**
 * P1-D — batería HTTP real contra backend Docker local.
 * Ejecutar (host): npx ts-node --transpile-only tests/run-p1d-auth-http.ts
 * Requiere: http://127.0.0.1:5000 healthy + seed demo.
 */
import assert from 'assert';
import { execSync } from 'child_process';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';

type Json = Record<string, unknown>;

async function api(
  method: string,
  path: string,
  opts?: { token?: string; body?: unknown }
): Promise<{ code: number; body: Json; raw: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts?.token) {
    headers.Authorization = `Bearer ${opts.token}`;
  }
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

function decodePayload(token: string): Json {
  const part = token.split('.')[1];
  const padded = part + '='.repeat((4 - (part.length % 4)) % 4);
  const json = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  return JSON.parse(json) as Json;
}

function mintExpiredRefresh(): string {
  if (process.env.P1D_EXPIRED_REFRESH) {
    return process.env.P1D_EXPIRED_REFRESH;
  }
  try {
    return execSync(
      `docker exec -i supertienda-backend node -e "const fs=require('fs');const jwt=require('jsonwebtoken');const pk=fs.readFileSync('/app/keys/private.pem','utf8');process.stdout.write(jwt.sign({userId:1,username:'admin_a',role:'ADMIN',businessId:1,tokenType:'refresh'},pk,{algorithm:'RS256',expiresIn:-5}));"`,
      { encoding: 'utf8' }
    ).trim();
  } catch {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        userId: 1,
        username: 'admin_a',
        role: 'ADMIN',
        businessId: 1,
        tokenType: 'refresh',
        iat: Math.floor(Date.now() / 1000) - 3600,
        exp: Math.floor(Date.now() / 1000) - 10,
      })
    ).toString('base64url');
    return `${header}.${payload}.fakesig`;
  }
}

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(error);
  }
}

async function login(username: string) {
  const res = await api('POST', '/auth/login', { body: { username, password: PASS } });
  assert.strictEqual(res.code, 200, res.raw);
  const data = res.body.data as Json;
  assert.ok(data.token && data.refreshToken);
  return data as { token: string; refreshToken: string; user: Json };
}

async function main() {
  const health = await api('GET', '/health');
  assert.strictEqual(health.code, 200, 'backend unhealthy');

  let accessA = '';
  let refreshA = '';
  let accessB = '';
  let refreshB = '';

  await test('1. Login válido A', async () => {
    const data = await login('admin_a');
    accessA = data.token;
    refreshA = data.refreshToken;
    assert.notStrictEqual(accessA, refreshA);
    assert.strictEqual(decodePayload(accessA).tokenType, 'access');
    assert.strictEqual(decodePayload(refreshA).tokenType, 'refresh');
    assert.strictEqual((data.user as Json).employee && ((data.user as Json).employee as Json).businessId, 1);
  });

  await test('2. Refresh válido', async () => {
    const res = await api('POST', '/auth/refresh', { body: { refreshToken: refreshA } });
    assert.strictEqual(res.code, 200, res.raw);
    const data = res.body.data as Json;
    assert.ok(typeof data.token === 'string');
    assert.ok(typeof data.refreshToken === 'string');
    assert.strictEqual(decodePayload(data.token as string).tokenType, 'access');
    assert.strictEqual(decodePayload(data.refreshToken as string).tokenType, 'refresh');
    accessA = data.token as string;
    refreshA = data.refreshToken as string;
  });

  await test('3. Refresh inválido', async () => {
    const res = await api('POST', '/auth/refresh', { body: { refreshToken: 'not.a.jwt' } });
    assert.strictEqual(res.code, 401, res.raw);
  });

  await test('4. Refresh expirado', async () => {
    const expired = mintExpiredRefresh();
    const res = await api('POST', '/auth/refresh', { body: { refreshToken: expired } });
    assert.strictEqual(res.code, 401, res.raw);
  });

  await test('5. Access usado como refresh', async () => {
    const res = await api('POST', '/auth/refresh', { body: { refreshToken: accessA } });
    assert.strictEqual(res.code, 401, res.raw);
  });

  await test('6. Refresh usado como access', async () => {
    const res = await api('GET', '/business-products?page=1&limit=5', { token: refreshA });
    assert.strictEqual(res.code, 401, res.raw);
  });

  await test('7. Empresa A conserva businessId en refresh', async () => {
    const before = decodePayload(accessA).businessId;
    const res = await api('POST', '/auth/refresh', { body: { refreshToken: refreshA } });
    assert.strictEqual(res.code, 200, res.raw);
    const data = res.body.data as Json;
    const after = decodePayload(data.token as string).businessId;
    assert.strictEqual(before, 1);
    assert.strictEqual(after, 1);
    accessA = data.token as string;
    refreshA = data.refreshToken as string;
  });

  await test('8. Empresa B conserva businessId', async () => {
    const data = await login('admin_b');
    accessB = data.token;
    refreshB = data.refreshToken;
    assert.strictEqual(decodePayload(accessB).businessId, 2);
    const res = await api('POST', '/auth/refresh', { body: { refreshToken: refreshB } });
    assert.strictEqual(res.code, 200, res.raw);
    const refreshed = (res.body.data as Json).token as string;
    assert.strictEqual(decodePayload(refreshed).businessId, 2);
    accessB = refreshed;
    refreshB = (res.body.data as Json).refreshToken as string;
  });

  await test('9. Refresh no permite acceso cruzado BP', async () => {
    const res = await api('GET', '/business-products?businessId=2', { token: accessA });
    assert.strictEqual(res.code, 403, res.raw);
    const res2 = await api('GET', '/business-products/4', { token: accessA });
    assert.ok(res2.code === 403 || res2.code === 404, res2.raw);
  });

  await test('10. Logout es solo local (sin endpoint de revocación)', async () => {
    const res = await api('POST', '/auth/logout', { token: accessA, body: {} });
    assert.ok(res.code === 404 || res.code === 405 || res.code === 401, `unexpected ${res.code}`);
    const still = await api('GET', '/business-products?page=1&limit=5', { token: accessA });
    assert.strictEqual(still.code, 200, 'JWT sigue válido tras "logout" local — sin revocación server-side');
  });

  await test('11. Acceso sin token', async () => {
    const res = await api('GET', '/business-products');
    assert.strictEqual(res.code, 401, res.raw);
  });

  await test('12. Regresión tenancy BusinessProduct', async () => {
    const listA = await api('GET', '/business-products?page=1&limit=50', { token: accessA });
    assert.strictEqual(listA.code, 200, listA.raw);
    const rowsA = (listA.body.data as Json[]) || [];
    assert.ok(rowsA.every((r) => r.businessId === 1));

    const listB = await api('GET', '/business-products?page=1&limit=50', { token: accessB });
    assert.strictEqual(listB.code, 200, listB.raw);
    const rowsB = (listB.body.data as Json[]) || [];
    assert.ok(rowsB.every((r) => r.businessId === 2));

    const cross = await api('POST', '/business-products', {
      token: accessA,
      body: { businessId: 2, productId: 2, customPrice: 1.5, currentStock: 1, reservedStock: 0 },
    });
    assert.strictEqual(cross.code, 403, cross.raw);
  });

  console.log(`\nResultado P1-D auth HTTP: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
