/**
 * P2-C1.F1 — Cash Lease HTTP (Docker local).
 * npm run test:p2c1f1:http
 */
import assert from 'assert';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import {
  issueCashLease,
  verifyCashLeaseToken,
  CASH_LEASE_TTL_MS,
} from '../src/services/CashLeaseService';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
const DEVICE = 'p2c1f1-lease-device';

type Json = Record<string, any>;

async function api(
  method: string,
  path: string,
  opts?: { token?: string; body?: unknown; deviceId?: string | null }
): Promise<{ code: number; body: Json; raw: string }> {
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
  return { code: res.status, body, raw: raw.slice(0, 600) };
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
  const escaped = flat.replace(/"/g, '\\"');
  return execSync(
    `docker exec -i "supertienda-db" psql -U "supertienda" -d "supertienda_dev" -v ON_ERROR_STOP=1 -t -A -c "${escaped}"`,
    { encoding: 'utf8' }
  ).trim();
}

function cleanup() {
  psql(`
DELETE FROM cash_movements WHERE cash_register_id IN (SELECT id FROM cash_registers WHERE device_id LIKE 'p2c1f1-%');
DELETE FROM audit_cash_registers WHERE cash_register_id IN (SELECT id FROM cash_registers WHERE device_id LIKE 'p2c1f1-%');
DELETE FROM inventory_transactions WHERE reference_type = 'sale' AND reference_id IN (SELECT id FROM sales WHERE device_id LIKE 'p2c1f1-%');
DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE device_id LIKE 'p2c1f1-%');
DELETE FROM sales WHERE device_id LIKE 'p2c1f1-%';
DELETE FROM cash_registers WHERE device_id LIKE 'p2c1f1-%';
DELETE FROM sync_operations WHERE device_id LIKE 'p2c1f1-%';
UPDATE business_products SET current_stock = 100, available_stock = 100, version = version + 1, updated_at = NOW() WHERE id = 1;
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

  await test('unit: lease válido verifica OK', async () => {
    const opening = new Date();
    const lease = issueCashLease({
      businessId: 1,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 99,
      openingDate: opening,
    });
    const v = verifyCashLeaseToken(lease.token, {
      businessId: 1,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 99,
    });
    assert.strictEqual(v.ok, true);
    assert.strictEqual(lease.expiresAt, new Date(opening.getTime() + CASH_LEASE_TTL_MS).toISOString());
  });

  await test('unit: lease manipulado → LEASE_TAMPERED', async () => {
    const lease = issueCashLease({
      businessId: 1,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 99,
      openingDate: new Date(),
    });
    const tampered = lease.token.slice(0, -4) + 'XXXX';
    const v = verifyCashLeaseToken(tampered, {
      businessId: 1,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 99,
    });
    assert.strictEqual(v.ok, false);
    if (!v.ok) assert.ok(['LEASE_TAMPERED', 'LEASE_INVALID'].includes(v.code));
  });

  await test('unit: scope incorrecto → LEASE_SCOPE', async () => {
    const lease = issueCashLease({
      businessId: 1,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 99,
      openingDate: new Date(),
    });
    const wrongBiz = verifyCashLeaseToken(lease.token, {
      businessId: 2,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 99,
    });
    assert.strictEqual(wrongBiz.ok, false);
    if (!wrongBiz.ok) assert.strictEqual(wrongBiz.code, 'LEASE_SCOPE');

    const wrongUser = verifyCashLeaseToken(lease.token, {
      businessId: 1,
      userId: 999,
      deviceId: DEVICE,
      cashRegisterId: 99,
    });
    assert.strictEqual(wrongUser.ok, false);

    const wrongDev = verifyCashLeaseToken(lease.token, {
      businessId: 1,
      userId: 1,
      deviceId: 'other-device',
      cashRegisterId: 99,
    });
    assert.strictEqual(wrongDev.ok, false);

    const wrongCash = verifyCashLeaseToken(lease.token, {
      businessId: 1,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 1,
    });
    assert.strictEqual(wrongCash.ok, false);
  });

  await test('unit: lease expirado → LEASE_EXPIRED', async () => {
    const opening = new Date(Date.now() - CASH_LEASE_TTL_MS - 120_000);
    const lease = issueCashLease({
      businessId: 1,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 99,
      openingDate: opening,
    });
    const v = verifyCashLeaseToken(lease.token, {
      businessId: 1,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 99,
    });
    assert.strictEqual(v.ok, false);
    if (!v.ok) assert.strictEqual(v.code, 'LEASE_EXPIRED');
  });

  await test('unit: reloj adelantado del verificador → LEASE_EXPIRED', async () => {
    const opening = new Date();
    const lease = issueCashLease({
      businessId: 1,
      userId: 1,
      deviceId: DEVICE,
      cashRegisterId: 99,
      openingDate: opening,
    });
    const fakeNow = opening.getTime() + CASH_LEASE_TTL_MS + 120_000;
    const v = verifyCashLeaseToken(
      lease.token,
      { businessId: 1, userId: 1, deviceId: DEVICE, cashRegisterId: 99 },
      fakeNow
    );
    assert.strictEqual(v.ok, false);
    if (!v.ok) assert.strictEqual(v.code, 'LEASE_EXPIRED');
  });

  let cashId = 0;
  let leaseToken = '';
  let leaseExpiresAt = '';
  let openingDate = '';

  await test('CASH_OPEN emite lease; GET open no extiende expiresAt', async () => {
    cleanup();
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
              openingAmount: 40,
              deviceId: DEVICE,
              notes: 'p2c1f1',
            },
          },
        ],
      },
    });
    assert.strictEqual(open.body.results[0].status, 'applied', JSON.stringify(open.body.results[0]));
    cashId = open.body.results[0].serverEntityId;
    const srv = open.body.results[0].server;
    assert.ok(srv.cashLeaseToken);
    assert.ok(srv.leaseId);
    assert.ok(srv.leaseExpiresAt);
    leaseToken = srv.cashLeaseToken;
    leaseExpiresAt = srv.leaseExpiresAt;
    openingDate = srv.openingDate;

    const get1 = await api('GET', '/cash-registers/open', { token: tokenA, deviceId: DEVICE });
    assert.strictEqual(get1.code, 200);
    assert.ok(get1.body.open);
    assert.strictEqual(get1.body.open.leaseExpiresAt, leaseExpiresAt);
    assert.strictEqual(get1.body.open.cashLeaseToken, leaseToken);

    // segunda lectura — mismos expiresAt (no renovación)
    const get2 = await api('GET', '/cash-registers/open', { token: tokenA, deviceId: DEVICE });
    assert.strictEqual(get2.body.open.leaseExpiresAt, leaseExpiresAt);
    assert.strictEqual(get2.body.open.leaseIssuedAt, openingDate || get1.body.open.leaseIssuedAt);
  });

  await test('SALE_CREATE con lease válido → applied', async () => {
    const bp = psql(`SELECT custom_price::text||'|'||version FROM business_products WHERE id=1`);
    const [price, version] = bp.split('|');
    const sale = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE,
      body: {
        businessId: 1,
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashId,
              paymentMethod: 'CASH',
              cashLeaseToken: leaseToken,
              lines: [
                {
                  businessProductId: 1,
                  quantity: 1,
                  unitPrice: Number(price),
                  baseVersion: Number(version),
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(sale.body.results[0].status, 'applied', JSON.stringify(sale.body.results[0]));
  });

  await test('SALE_CREATE lease manipulado → rejected', async () => {
    const bp = psql(`SELECT custom_price::text||'|'||version FROM business_products WHERE id=1`);
    const [price, version] = bp.split('|');
    const sale = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE,
      body: {
        businessId: 1,
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashId,
              paymentMethod: 'CASH',
              cashLeaseToken: leaseToken.slice(0, -6) + 'AAAAAA',
              lines: [
                {
                  businessProductId: 1,
                  quantity: 1,
                  unitPrice: Number(price),
                  baseVersion: Number(version),
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(sale.body.results[0].status, 'rejected');
    assert.ok(['LEASE_TAMPERED', 'LEASE_INVALID'].includes(sale.body.results[0].code));
  });

  await test('SALE_CREATE lease de otra empresa → LEASE_SCOPE', async () => {
    // Emitir lease real vía CASH_OPEN en empresa B (misma firma servidor) y usarlo en venta A.
    const openB = await api('POST', '/sync/push', {
      token: tokenB,
      deviceId: `${DEVICE}-b`,
      body: {
        businessId: 2,
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'CASH_OPEN',
            payload: {
              localCashId: randomUUID(),
              openingAmount: 25,
              deviceId: `${DEVICE}-b`,
              notes: 'p2c1f1-foreign',
            },
          },
        ],
      },
    });
    assert.strictEqual(openB.body.results[0].status, 'applied', JSON.stringify(openB.body.results[0]));
    const foreignToken = openB.body.results[0].server.cashLeaseToken as string;
    assert.ok(foreignToken);

    const bp = psql(`SELECT custom_price::text||'|'||version FROM business_products WHERE id=1`);
    const [price, version] = bp.split('|');
    const sale = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE,
      body: {
        businessId: 1,
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashId,
              paymentMethod: 'CASH',
              cashLeaseToken: foreignToken,
              lines: [
                {
                  businessProductId: 1,
                  quantity: 1,
                  unitPrice: Number(price),
                  baseVersion: Number(version),
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(sale.body.results[0].status, 'rejected');
    assert.strictEqual(sale.body.results[0].code, 'LEASE_SCOPE');
  });

  await test('cross-tenant GET open no ve lease ajeno', async () => {
    const res = await api('GET', '/cash-registers/open', { token: tokenB, deviceId: DEVICE });
    assert.strictEqual(res.code, 200);
    assert.strictEqual(res.body.open, null);
  });

  await test('CASH_CLOSE; SALE con lease previo → CASH_CLOSED (caja real manda)', async () => {
    const ver = Number(psql(`SELECT version FROM cash_registers WHERE id=${cashId}`));
    const cur = psql(`SELECT current_amount::text FROM cash_registers WHERE id=${cashId}`);
    const close = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE,
      body: {
        businessId: 1,
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'CASH_CLOSE',
            baseVersion: ver,
            payload: { cashRegisterId: cashId, closingAmount: Number(cur) },
          },
        ],
      },
    });
    assert.ok(
      close.body.results[0].status === 'applied' || close.body.results[0].status === 'duplicate',
      JSON.stringify(close.body.results[0])
    );

    const bp = psql(`SELECT custom_price::text||'|'||version FROM business_products WHERE id=1`);
    const [price, version] = bp.split('|');
    const sale = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE,
      body: {
        businessId: 1,
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashId,
              paymentMethod: 'CASH',
              cashLeaseToken: leaseToken,
              lines: [
                {
                  businessProductId: 1,
                  quantity: 1,
                  unitPrice: Number(price),
                  baseVersion: Number(version),
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(sale.body.results[0].status, 'rejected');
    assert.strictEqual(sale.body.results[0].code, 'CASH_CLOSED');
  });

  cleanup();
  console.log(`\nResultado P2-C1.F1 cash lease HTTP: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
