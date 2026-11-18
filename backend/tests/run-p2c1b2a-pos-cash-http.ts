/**
 * P2-C1.B2-A — Sync CASH_OPEN / SALE_CREATE / CASH_CLOSE (Docker local).
 * npm run test:p2c1b2a:http
 */
import assert from 'assert';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
const DEVICE_A = 'p2c1b2a-device-a';
const DEVICE_B = 'p2c1b2a-device-b';

type Json = Record<string, any>;

async function api(
  method: string,
  path: string,
  opts?: { token?: string; body?: unknown; deviceId?: string | null }
): Promise<{ code: number; body: Json; raw: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts?.deviceId !== null) {
    headers['X-Device-Id'] = opts?.deviceId === undefined ? DEVICE_A : opts.deviceId;
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
DELETE FROM cash_movements WHERE cash_register_id IN (SELECT id FROM cash_registers WHERE device_id LIKE 'p2c1b2a-%') OR sale_id IN (SELECT id FROM sales WHERE device_id LIKE 'p2c1b2a-%');
DELETE FROM audit_cash_registers WHERE cash_register_id IN (SELECT id FROM cash_registers WHERE device_id LIKE 'p2c1b2a-%');
DELETE FROM inventory_transactions WHERE (notes LIKE 'SALE_CREATE COM-%') OR (reference_type = 'sale' AND reference_id IN (SELECT id FROM sales WHERE device_id LIKE 'p2c1b2a-%'));
DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE device_id LIKE 'p2c1b2a-%');
DELETE FROM sales WHERE device_id LIKE 'p2c1b2a-%';
DELETE FROM cash_registers WHERE device_id LIKE 'p2c1b2a-%';
DELETE FROM sync_operations WHERE device_id LIKE 'p2c1b2a-%';
UPDATE business_products SET current_stock = 100, available_stock = 100, version = 1, updated_at = NOW() WHERE id = 1;
UPDATE business_products SET current_stock = 40, available_stock = 40, version = 1, updated_at = NOW() WHERE id = 2;
UPDATE business_products SET current_stock = 25, available_stock = 25, version = 1, updated_at = NOW() WHERE id = 3;
UPDATE business_products SET current_stock = 60, available_stock = 60, version = 1, updated_at = NOW() WHERE id = 4;
UPDATE business_document_sequences bds
SET current_number = GREATEST(
  0,
  COALESCE((
    SELECT MAX(NULLIF(regexp_replace(s.commercial_number, '[^0-9]', '', 'g'), '')::bigint)
    FROM sales s
    WHERE s.business_id = bds.business_id
      AND s.commercial_number IS NOT NULL
      AND s.deleted_at IS NULL
  ), 0)
),
updated_at = NOW()
WHERE doc_type = 'COMMERCIAL_TICKET';
`);
}

function bpSnap(id: number) {
  const row = psql(
    `SELECT custom_price::text || '|' || current_stock::text || '|' || version::text FROM business_products WHERE id = ${id}`
  );
  const [price, stock, version] = row.split('|');
  return { price, stock: Number(stock), version: Number(version) };
}

async function push(
  token: string,
  operations: unknown[],
  deviceId: string = DEVICE_A
) {
  return api('POST', '/sync/push', {
    token,
    deviceId,
    body: { businessId: deviceId === DEVICE_B ? undefined : undefined, operations },
  });
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

async function openCash(
  token: string,
  deviceId: string,
  openingAmount = 100,
  clientOperationId?: string
) {
  const opId = clientOperationId || randomUUID();
  const localCashId = randomUUID();
  const res = await api('POST', '/sync/push', {
    token,
    deviceId,
    body: {
      operations: [
        {
          clientOperationId: opId,
          operationType: 'CASH_OPEN',
          payload: {
            localCashId,
            openingAmount,
            deviceId,
            notes: 'p2c1b2a open',
          },
        },
      ],
    },
  });
  return { res, opId, localCashId };
}

async function main() {
  assert.strictEqual((await api('GET', '/health', { deviceId: null })).code, 200);
  cleanup();

  const tokenA = await login('admin_a');
  const tokenB = await login('admin_b');
  const empA = await login('employee_a').catch(() => null);

  await test('Apertura correcta CASH_OPEN', async () => {
    const { res, localCashId } = await openCash(tokenA, DEVICE_A, 150);
    assert.strictEqual(res.code, 200, res.raw);
    assert.strictEqual(res.body.results[0].status, 'applied', JSON.stringify(res.body.results[0]));
    assert.ok(res.body.results[0].serverEntityId);
    assert.strictEqual(res.body.results[0].idMappings[0].localEntityId, localCashId);
    const mov = psql(
      `SELECT count(*) FROM cash_movements WHERE cash_register_id = ${res.body.results[0].serverEntityId} AND movement_type = 'OPENING'`
    );
    assert.strictEqual(mov, '1');
  });

  await test('Apertura duplicada mismo device → CASH_ALREADY_OPEN', async () => {
    const { res } = await openCash(tokenA, DEVICE_A, 10);
    assert.strictEqual(res.body.results[0].status, 'rejected');
    assert.strictEqual(res.body.results[0].code, 'CASH_ALREADY_OPEN');
  });

  await test('Aperturas concurrentes mismo device → una applied', async () => {
    cleanup();
    const id1 = randomUUID();
    const id2 = randomUUID();
    const local1 = randomUUID();
    const local2 = randomUUID();
    const body1 = {
      operations: [
        {
          clientOperationId: id1,
          operationType: 'CASH_OPEN',
          payload: { localCashId: local1, openingAmount: 50, deviceId: DEVICE_A, notes: 'p2c1b2a' },
        },
      ],
    };
    const body2 = {
      operations: [
        {
          clientOperationId: id2,
          operationType: 'CASH_OPEN',
          payload: { localCashId: local2, openingAmount: 60, deviceId: DEVICE_A, notes: 'p2c1b2a' },
        },
      ],
    };
    const [r1, r2] = await Promise.all([
      api('POST', '/sync/push', { token: tokenA, deviceId: DEVICE_A, body: body1 }),
      api('POST', '/sync/push', { token: tokenA, deviceId: DEVICE_A, body: body2 }),
    ]);
    // Autoridad: a lo sumo una caja OPEN (índice parcial). HTTP puede ser applied/rejected/5xx de carrera.
    const openCnt = psql(
      `SELECT count(*) FROM cash_registers WHERE device_id = '${DEVICE_A}' AND status = 'OPEN' AND deleted_at IS NULL`
    );
    assert.strictEqual(openCnt, '1', `openCnt=${openCnt} r1=${r1.raw} r2=${r2.raw}`);
    const statuses = [r1.body?.results?.[0]?.status, r2.body?.results?.[0]?.status].filter(Boolean);
    const appliedHttp = statuses.filter((s) => s === 'applied').length;
    assert.ok(appliedHttp <= 1, `applied HTTP > 1: ${JSON.stringify(statuses)}`);
  });

  await test('Venta válida SALE_CREATE', async () => {
    cleanup();
    const open = await openCash(tokenA, DEVICE_A, 100);
    const cashId = open.res.body.results[0].serverEntityId as number;
    const bp = bpSnap(1);
    const saleOp = randomUUID();
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: {
        operations: [
          {
            clientOperationId: saleOp,
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashId,
              paymentMethod: 'CASH',
              discountAmount: 0,
              notes: 'p2c1b2a sale',
              lines: [
                {
                  businessProductId: 1,
                  quantity: 2,
                  unitPrice: Number(bp.price),
                  baseVersion: bp.version,
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].status, 'applied', JSON.stringify(res.body.results[0]));
    assert.ok(String(res.body.results[0].server.commercialNumber).startsWith('COM-'));
    assert.strictEqual(res.body.results[0].server.invoiceNumber, null);
    const stock = Number(psql(`SELECT current_stock FROM business_products WHERE id = 1`));
    assert.strictEqual(stock, bp.stock - 2);
    const sales = psql(`SELECT count(*) FROM sales WHERE commercial_number IS NOT NULL AND is_fiscal = false`);
    assert.ok(Number(sales) >= 1);
    const cm = psql(
      `SELECT count(*) FROM cash_movements WHERE sale_id = ${res.body.results[0].serverEntityId} AND movement_type = 'SALE_CASH'`
    );
    assert.strictEqual(cm, '1');
  });

  await test('Venta sin caja abierta → CASH_CLOSED/NOT_FOUND', async () => {
    cleanup();
    const bp = bpSnap(1);
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: 999999,
              paymentMethod: 'CASH',
              lines: [
                {
                  businessProductId: 1,
                  quantity: 1,
                  unitPrice: Number(bp.price),
                  baseVersion: bp.version,
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].status, 'rejected');
    assert.ok(['NOT_FOUND', 'CASH_CLOSED', 'FORBIDDEN'].includes(res.body.results[0].code));
  });

  await test('Stock insuficiente → INSUFFICIENT_STOCK', async () => {
    cleanup();
    const open = await openCash(tokenA, DEVICE_A, 100);
    const cashId = open.res.body.results[0].serverEntityId as number;
    const bp = bpSnap(1);
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashId,
              paymentMethod: 'CASH',
              lines: [
                {
                  businessProductId: 1,
                  quantity: bp.stock + 50,
                  unitPrice: Number(bp.price),
                  baseVersion: bp.version,
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].status, 'rejected');
    assert.strictEqual(res.body.results[0].code, 'INSUFFICIENT_STOCK');
    assert.strictEqual(Number(psql(`SELECT current_stock FROM business_products WHERE id = 1`)), bp.stock);
  });

  await test('Venta cross-tenant caja ajena → FORBIDDEN/NOT_FOUND', async () => {
    cleanup();
    const openA = await openCash(tokenA, DEVICE_A, 100);
    const cashA = openA.res.body.results[0].serverEntityId as number;
    const bpB = bpSnap(2); // business 2
    const res = await api('POST', '/sync/push', {
      token: tokenB,
      deviceId: DEVICE_B,
      body: {
        businessId: 2,
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashA,
              paymentMethod: 'CASH',
              lines: [
                {
                  businessProductId: 2,
                  quantity: 1,
                  unitPrice: Number(bpB.price),
                  baseVersion: bpB.version,
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].status, 'rejected');
    assert.ok(['NOT_FOUND', 'FORBIDDEN'].includes(res.body.results[0].code), res.body.results[0].code);
  });

  await test('Precio alterado por cliente → PRICE_MISMATCH', async () => {
    cleanup();
    const open = await openCash(tokenA, DEVICE_A, 100);
    const cashId = open.res.body.results[0].serverEntityId as number;
    const bp = bpSnap(1);
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashId,
              paymentMethod: 'CASH',
              lines: [
                {
                  businessProductId: 1,
                  quantity: 1,
                  unitPrice: Number(bp.price) + 5,
                  baseVersion: bp.version,
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results[0].status, 'rejected');
    assert.strictEqual(res.body.results[0].code, 'PRICE_MISMATCH');
  });

  await test('Reintento idempotente → duplicate sin segundo descuento', async () => {
    cleanup();
    const open = await openCash(tokenA, DEVICE_A, 100);
    const cashId = open.res.body.results[0].serverEntityId as number;
    const bp = bpSnap(1);
    const opId = randomUUID();
    const payload = {
      localSaleId: randomUUID(),
      cashRegisterId: cashId,
      paymentMethod: 'CASH',
      lines: [
        {
          businessProductId: 1,
          quantity: 3,
          unitPrice: Number(bp.price),
          baseVersion: bp.version,
        },
      ],
    };
    const r1 = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: { operations: [{ clientOperationId: opId, operationType: 'SALE_CREATE', payload }] },
    });
    assert.strictEqual(r1.body.results[0].status, 'applied');
    const stockAfter = Number(psql(`SELECT current_stock FROM business_products WHERE id = 1`));
    const r2 = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: { operations: [{ clientOperationId: opId, operationType: 'SALE_CREATE', payload }] },
    });
    assert.strictEqual(r2.body.results[0].status, 'duplicate');
    assert.strictEqual(Number(psql(`SELECT current_stock FROM business_products WHERE id = 1`)), stockAfter);
    assert.strictEqual(
      psql(`SELECT count(*) FROM sales WHERE client_operation_id = '${opId}'`),
      '1'
    );
  });

  await test('Mismo ID payload distinto → IDEMPOTENCY_PAYLOAD_MISMATCH', async () => {
    cleanup();
    const open = await openCash(tokenA, DEVICE_A, 100);
    const cashId = open.res.body.results[0].serverEntityId as number;
    const bp = bpSnap(1);
    const opId = randomUUID();
    const basePayload = {
      localSaleId: randomUUID(),
      cashRegisterId: cashId,
      paymentMethod: 'CASH',
      lines: [
        {
          businessProductId: 1,
          quantity: 1,
          unitPrice: Number(bp.price),
          baseVersion: bp.version,
        },
      ],
    };
    const r1 = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: { operations: [{ clientOperationId: opId, operationType: 'SALE_CREATE', payload: basePayload }] },
    });
    assert.strictEqual(r1.body.results[0].status, 'applied');
    const bp2 = bpSnap(1);
    const r2 = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: {
        operations: [
          {
            clientOperationId: opId,
            operationType: 'SALE_CREATE',
            payload: {
              ...basePayload,
              lines: [
                {
                  businessProductId: 1,
                  quantity: 2,
                  unitPrice: Number(bp2.price),
                  baseVersion: bp2.version,
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(r2.body.results[0].status, 'rejected');
    assert.strictEqual(r2.body.results[0].code, 'IDEMPOTENCY_PAYLOAD_MISMATCH');
  });

  await test('Ventas concurrentes stock limitado → sin oversell', async () => {
    cleanup();
    psql(`UPDATE business_products SET current_stock = 5, available_stock = 5, version = 10 WHERE id = 1`);
    const open = await openCash(tokenA, DEVICE_A, 100);
    const cashId = open.res.body.results[0].serverEntityId as number;
    const price = Number(psql(`SELECT custom_price::text FROM business_products WHERE id = 1`));
    const mk = (qty: number) => {
      const opId = randomUUID();
      return api('POST', '/sync/push', {
        token: tokenA,
        deviceId: DEVICE_A,
        body: {
          operations: [
            {
              clientOperationId: opId,
              operationType: 'SALE_CREATE',
              payload: {
                localSaleId: randomUUID(),
                cashRegisterId: cashId,
                paymentMethod: 'CASH',
                lines: [
                  {
                    businessProductId: 1,
                    quantity: qty,
                    unitPrice: price,
                    baseVersion: 10,
                  },
                ],
              },
            },
          ],
        },
      });
    };
    const results = await Promise.all([mk(3), mk(3), mk(3)]);
    const applied = results.filter((r) => r.body.results[0].status === 'applied');
    const rejected = results.filter((r) => r.body.results[0].status !== 'applied');
    assert.ok(applied.length >= 1 && applied.length <= 1, `applied=${applied.length}`);
    assert.ok(rejected.length >= 2);
    const stock = Number(psql(`SELECT current_stock FROM business_products WHERE id = 1`));
    assert.ok(stock >= 0 && stock <= 5);
    assert.ok(stock === 5 - applied.length * 3 || stock === 2);
  });

  await test('Numeración comercial por empresa aislada', async () => {
    cleanup();
    const openA = await openCash(tokenA, DEVICE_A, 100);
    const openB = await openCash(tokenB, DEVICE_B, 100);
    const cashA = openA.res.body.results[0].serverEntityId as number;
    const cashB = openB.res.body.results[0].serverEntityId as number;
    const bpA = bpSnap(1);
    const bpB = bpSnap(2);
    const rA = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashA,
              paymentMethod: 'CASH',
              lines: [
                {
                  businessProductId: 1,
                  quantity: 1,
                  unitPrice: Number(bpA.price),
                  baseVersion: bpA.version,
                },
              ],
            },
          },
        ],
      },
    });
    const rB = await api('POST', '/sync/push', {
      token: tokenB,
      deviceId: DEVICE_B,
      body: {
        businessId: 2,
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashB,
              paymentMethod: 'CASH',
              lines: [
                {
                  businessProductId: 2,
                  quantity: 1,
                  unitPrice: Number(bpB.price),
                  baseVersion: bpB.version,
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(rA.body.results[0].status, 'applied', JSON.stringify(rA.body.results[0]));
    assert.strictEqual(rB.body.results[0].status, 'applied', JSON.stringify(rB.body.results[0]));
    const nA = String(rA.body.results[0].server.commercialNumber || '');
    const nB = String(rB.body.results[0].server.commercialNumber || '');
    assert.ok(/^COM-\d{8}$/.test(nA), `commercial A inválido: ${nA}`);
    assert.ok(/^COM-\d{8}$/.test(nB), `commercial B inválido: ${nB}`);
    // Aislamiento: cada empresa avanza su propia secuencia (valores pueden coincidir).
    const seqA = Number(
      psql(`SELECT current_number FROM business_document_sequences WHERE business_id = 1 AND doc_type = 'COMMERCIAL_TICKET'`)
    );
    const seqB = Number(
      psql(`SELECT current_number FROM business_document_sequences WHERE business_id = 2 AND doc_type = 'COMMERCIAL_TICKET'`)
    );
    assert.ok(seqA >= 1 && seqB >= 1);
  });

  await test('Movimiento SALE_CASH y CASH_CLOSE', async () => {
    cleanup();
    const open = await openCash(tokenA, DEVICE_A, 200);
    const cashId = open.res.body.results[0].serverEntityId as number;
    const bp = bpSnap(1);
    const sale = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashId,
              paymentMethod: 'CASH',
              lines: [
                {
                  businessProductId: 1,
                  quantity: 1,
                  unitPrice: Number(bp.price),
                  baseVersion: bp.version,
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(sale.body.results[0].status, 'applied');
    const expected = Number(sale.body.results[0].server.currentAmount);
    const closeOp = randomUUID();
    const close = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: {
        operations: [
          {
            clientOperationId: closeOp,
            operationType: 'CASH_CLOSE',
            baseVersion: sale.body.results[0].server.cashVersion,
            payload: {
              cashRegisterId: cashId,
              closingAmount: expected,
              notes: 'p2c1b2a close',
            },
          },
        ],
      },
    });
    assert.strictEqual(close.body.results[0].status, 'applied', JSON.stringify(close.body.results[0]));
    assert.strictEqual(close.body.results[0].server.difference, '0.00');
    const st = psql(`SELECT status FROM cash_registers WHERE id = ${cashId}`);
    assert.strictEqual(st, 'CLOSED');
    // venta sobre caja cerrada
    const bp2 = bpSnap(1);
    const sale2 = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: randomUUID(),
              cashRegisterId: cashId,
              paymentMethod: 'CASH',
              lines: [
                {
                  businessProductId: 1,
                  quantity: 1,
                  unitPrice: Number(bp2.price),
                  baseVersion: bp2.version,
                },
              ],
            },
          },
        ],
      },
    });
    assert.strictEqual(sale2.body.results[0].status, 'rejected');
    assert.strictEqual(sale2.body.results[0].code, 'CASH_CLOSED');
  });

  await test('CASH_OPEN idempotente duplicate', async () => {
    cleanup();
    const opId = randomUUID();
    const localCashId = randomUUID();
    const payload = {
      localCashId,
      openingAmount: 80,
      deviceId: DEVICE_A,
      notes: 'p2c1b2a',
    };
    const r1 = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: { operations: [{ clientOperationId: opId, operationType: 'CASH_OPEN', payload }] },
    });
    assert.strictEqual(r1.body.results[0].status, 'applied');
    const r2 = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
      body: { operations: [{ clientOperationId: opId, operationType: 'CASH_OPEN', payload }] },
    });
    assert.strictEqual(r2.body.results[0].status, 'duplicate');
    assert.strictEqual(
      psql(`SELECT count(*) FROM cash_registers WHERE device_id = '${DEVICE_A}' AND status = 'OPEN'`),
      '1'
    );
  });

  await test('SALE_COMPLETE sigue NOT_IMPLEMENTED', async () => {
    const res = await api('POST', '/sync/push', {
      token: tokenA,
      deviceId: DEVICE_A,
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
  });

  if (empA) {
    await test('EMPLOYEE puede abrir caja y vender', async () => {
      cleanup();
      const open = await openCash(empA, DEVICE_A, 50);
      assert.strictEqual(open.res.body.results[0].status, 'applied', JSON.stringify(open.res.body.results[0]));
      const cashId = open.res.body.results[0].serverEntityId as number;
      const bp = bpSnap(1);
      const sale = await api('POST', '/sync/push', {
        token: empA,
        deviceId: DEVICE_A,
        body: {
          operations: [
            {
              clientOperationId: randomUUID(),
              operationType: 'SALE_CREATE',
              payload: {
                localSaleId: randomUUID(),
                cashRegisterId: cashId,
                paymentMethod: 'CASH',
                lines: [
                  {
                    businessProductId: 1,
                    quantity: 1,
                    unitPrice: Number(bp.price),
                    baseVersion: bp.version,
                  },
                ],
              },
            },
          ],
        },
      });
      assert.strictEqual(sale.body.results[0].status, 'applied', JSON.stringify(sale.body.results[0]));
    });
  }

  cleanup();
  console.log(`\nResultado P2-C1.B2-A POS/caja HTTP: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
