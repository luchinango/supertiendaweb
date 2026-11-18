/**
 * P2-C1.B2-B — GET /cash-registers/open (Docker local).
 * npm run test:p2c1b2b:http
 */
import assert from 'assert';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
const DEVICE = 'p2c1b2b-device-read';

type Json = Record<string, any>;

async function api(
  method: string,
  path: string,
  opts?: { token?: string; body?: unknown; deviceId?: string | null }
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
  const res = await api('POST', '/auth/login', { body: { username: u, password: PASS }, deviceId: null });
  assert.strictEqual(res.code, 200, res.raw);
  return (res.body.data as Json).token as string;
}

function psql(sql: string): string {
  const flat = sql.replace(/\s+/g, ' ').trim();
  const escaped = flat.replace(/"/g, '\\"');
  return execSync(
    `docker exec -i "supertienda-db" psql -U "supertienda" -d "supertienda_dev" -v ON_ERROR_STOP=1 -t -A -c "${escaped}"`,
    { encoding: 'utf8' }
  ).trim();
}

function cleanup() {
  psql(`
DELETE FROM cash_movements WHERE cash_register_id IN (SELECT id FROM cash_registers WHERE device_id LIKE 'p2c1b2b-%');
DELETE FROM audit_cash_registers WHERE cash_register_id IN (SELECT id FROM cash_registers WHERE device_id LIKE 'p2c1b2b-%');
DELETE FROM cash_registers WHERE device_id LIKE 'p2c1b2b-%';
DELETE FROM sync_operations WHERE device_id LIKE 'p2c1b2b-%';
`);
}

async function main() {
  assert.strictEqual((await api('GET', '/health', { deviceId: null })).code, 200);
  cleanup();
  const tokenA = await login('admin_a');
  const tokenB = await login('admin_b');

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

  await test('GET open sin token → 401', async () => {
    const res = await api('GET', '/cash-registers/open');
    assert.strictEqual(res.code, 401);
  });

  await test('GET open sin device → 400', async () => {
    const res = await api('GET', '/cash-registers/open', { token: tokenA, deviceId: null });
    assert.ok(res.code === 400 || res.code === 422, String(res.code));
  });

  await test('GET open sin caja → open null', async () => {
    const res = await api('GET', '/cash-registers/open', { token: tokenA, deviceId: DEVICE });
    assert.strictEqual(res.code, 200, res.raw);
    assert.strictEqual(res.body.open, null);
  });

  await test('GET open tras CASH_OPEN → datos tenant/device', async () => {
    const open = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE,
      body: {
        businessId: 1,
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'CASH_OPEN',
            payload: {
              localCashId: randomUUID(),
              openingAmount: 55,
              deviceId: DEVICE,
              notes: 'p2c1b2b',
            },
          },
        ],
      },
    });
    assert.strictEqual(open.body.results[0].status, 'applied', JSON.stringify(open.body.results[0]));
    const res = await api('GET', '/cash-registers/open', { token: tokenA, deviceId: DEVICE });
    assert.strictEqual(res.code, 200, res.raw);
    assert.ok(res.body.open);
    assert.strictEqual(res.body.open.businessId, 1);
    assert.strictEqual(res.body.open.deviceId, DEVICE);
    assert.strictEqual(res.body.open.status, 'OPEN');
    assert.strictEqual(res.body.open.openingAmount, '55.00');
  });

  await test('GET open cross-tenant no ve caja ajena', async () => {
    const res = await api('GET', '/cash-registers/open', { token: tokenB, deviceId: DEVICE });
    assert.strictEqual(res.code, 200, res.raw);
    assert.strictEqual(res.body.open, null);
  });

  cleanup();
  console.log(`\nResultado P2-C1.B2-B cash read: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
