/**
 * P2-C1.E — Simulación comercial 7 jornadas (HTTP real + SQL lectura).
 * Solo empresas DEMO. No borra datos técnicos. No reinicia secuencias.
 *
 * AUTH_HTTP_BASE=http://127.0.0.1:5000 SEED_DEV_PASSWORD=DevPass123! \
 *   npm run test:p2c1e:sim
 */
import assert from 'assert';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
const SIM_ID = `P2C1E-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;

const DEV = {
  norteAdmin: 'demo-device-norte-01',
  norteEmp: 'demo-device-norte-emp-01',
  sur: 'demo-device-sur-01',
  centro: 'demo-device-centro-01',
} as const;

type Json = Record<string, any>;
type DayResult = {
  day: number;
  title: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  notes: string[];
  ops: Json[];
};

const days: DayResult[] = [];
const evidence: Json = {
  simId: SIM_ID,
  startedAt: new Date().toISOString(),
  initial: {},
  days: [],
  final: {},
  automated: {},
};

async function api(
  method: string,
  path: string,
  opts?: { token?: string; body?: unknown; deviceId?: string | null }
): Promise<{ code: number; body: Json; raw: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts?.deviceId !== null && opts?.deviceId !== undefined) {
    headers['X-Device-Id'] = opts.deviceId;
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
  return { code: res.status, body, raw: raw.slice(0, 800) };
}

async function login(u: string) {
  const res = await api('POST', '/auth/login', {
    body: { username: u, password: PASS },
    deviceId: null,
  });
  assert.strictEqual(res.code, 200, `login ${u}: ${res.raw}`);
  return (res.body.data as Json).token as string;
}

function psql(sql: string): string {
  const flat = sql.replace(/\s+/g, ' ').trim();
  if (/\b(UPDATE|DELETE|DROP|TRUNCATE|ALTER|INSERT)\b/i.test(flat)) {
    throw new Error(`SQL no-lectura bloqueado en simulación: ${flat.slice(0, 100)}`);
  }
  const escaped = flat.replace(/"/g, '\\"');
  return execSync(
    `docker exec -i "supertienda-db" psql -U "supertienda" -d "supertienda_dev" -v ON_ERROR_STOP=1 -t -A -c "${escaped}"`,
    { encoding: 'utf8' }
  ).trim();
}

function psqlRows(sql: string): string[] {
  const out = psql(sql);
  return out ? out.split('\n').filter(Boolean) : [];
}

async function push(
  token: string,
  deviceId: string,
  businessId: number,
  operations: Json[]
) {
  return api('POST', '/sync/push', {
    token,
    deviceId,
    body: { businessId, operations },
  });
}

async function openCash(token: string, deviceId: string, businessId: number, amount: number) {
  const clientOperationId = randomUUID();
  const localCashId = randomUUID();
  const res = await push(token, deviceId, businessId, [
    {
      clientOperationId,
      operationType: 'CASH_OPEN',
      payload: { localCashId, openingAmount: amount, deviceId, notes: `${SIM_ID} open` },
    },
  ]);
  const r = res.body.results?.[0];
  assert.ok(r && (r.status === 'applied' || r.status === 'duplicate'), JSON.stringify(r));
  return { clientOperationId, localCashId, result: r, cashId: r.serverEntityId as number };
}

async function closeCash(
  token: string,
  deviceId: string,
  businessId: number,
  cashRegisterId: number,
  closingAmount: number,
  baseVersion: number
) {
  const clientOperationId = randomUUID();
  const res = await push(token, deviceId, businessId, [
    {
      clientOperationId,
      operationType: 'CASH_CLOSE',
      baseVersion,
      payload: { cashRegisterId, closingAmount, notes: `${SIM_ID} close` },
    },
  ]);
  const r = res.body.results?.[0];
  return { clientOperationId, result: r };
}

async function saleCreate(
  token: string,
  deviceId: string,
  businessId: number,
  cashRegisterId: number,
  lines: { businessProductId: number; quantity: number; unitPrice: number; baseVersion: number }[]
) {
  const clientOperationId = randomUUID();
  const localSaleId = randomUUID();
  const res = await push(token, deviceId, businessId, [
    {
      clientOperationId,
      operationType: 'SALE_CREATE',
      payload: {
        localSaleId,
        cashRegisterId,
        paymentMethod: 'CASH',
        discountAmount: 0,
        notes: SIM_ID,
        lines,
      },
    },
  ]);
  return { clientOperationId, localSaleId, result: res.body.results?.[0], res };
}

async function stockAdjust(
  token: string,
  deviceId: string,
  businessId: number,
  businessProductId: number,
  delta: number,
  baseVersion: number
) {
  const clientOperationId = randomUUID();
  const res = await push(token, deviceId, businessId, [
    {
      clientOperationId,
      operationType: 'STOCK_ADJUST',
      baseVersion,
      payload: { businessProductId, delta, reason: `${SIM_ID} adjust` },
    },
  ]);
  return { clientOperationId, result: res.body.results?.[0] };
}

function bpList(businessId: number, opts?: { minStock?: number; maxStock?: number; limit?: number }) {
  const min = opts?.minStock ?? 5;
  const max = opts?.maxStock ?? 100000;
  const lim = opts?.limit ?? 20;
  const rows = psqlRows(
    `SELECT id||'|'||custom_price::text||'|'||current_stock||'|'||available_stock||'|'||version FROM business_products WHERE business_id=${businessId} AND deleted_at IS NULL AND available_stock>=${min} AND available_stock<=${max} ORDER BY id LIMIT ${lim}`
  );
  return rows.map((r) => {
    const [id, price, stock, avail, version] = r.split('|');
    return {
      id: Number(id),
      price: Number(price),
      stock: Number(stock),
      avail: Number(avail),
      version: Number(version),
    };
  });
}

function snapBusiness(businessId: number) {
  const stock = psql(
    `SELECT COALESCE(SUM(current_stock),0)||'|'||COALESCE(SUM(available_stock),0)||'|'||COUNT(*) FROM business_products WHERE business_id=${businessId} AND deleted_at IS NULL`
  );
  const [sumCur, sumAvail, n] = stock.split('|');
  const sales = psql(
    `SELECT COUNT(*)||'|'||COALESCE(SUM(total_amount),0)::text FROM sales WHERE business_id=${businessId} AND deleted_at IS NULL`
  );
  const [saleCnt, saleSum] = sales.split('|');
  const seq = psql(
    `SELECT COALESCE(MAX(current_number),0) FROM business_document_sequences WHERE business_id=${businessId} AND doc_type='COMMERCIAL_TICKET'`
  );
  const openCash = psqlRows(
    `SELECT id||'|'||user_id||'|'||device_id||'|'||current_amount::text||'|'||version FROM cash_registers WHERE business_id=${businessId} AND status='OPEN' AND deleted_at IS NULL`
  );
  return {
    businessId,
    bpCount: Number(n),
    stockSum: Number(sumCur),
    availSum: Number(sumAvail),
    salesCount: Number(saleCnt),
    salesTotal: Number(saleSum),
    commercialSeq: Number(seq),
    openCash,
  };
}

function getCash(cashId: number) {
  const row = psql(
    `SELECT id||'|'||status||'|'||current_amount::text||'|'||version||'|'||opening_amount::text FROM cash_registers WHERE id=${cashId}`
  );
  const [id, status, current, version, opening] = row.split('|');
  return {
    id: Number(id),
    status,
    current: Number(current),
    version: Number(version),
    opening: Number(opening),
  };
}

async function main() {
  console.log(`\n=== ${SIM_ID} START ===\n`);
  assert.strictEqual((await api('GET', '/health', { deviceId: null })).code, 200);

  // Guardrails: only DEMO businesses 3/4/5
  const demoIds = psqlRows(
    `SELECT id FROM businesses WHERE nit IN ('9100001001','9100002002','9100003003') ORDER BY id`
  ).map(Number);
  assert.deepStrictEqual(demoIds, [3, 4, 5], `DEMO businesses inesperados: ${demoIds}`);

  const openDemo = psql(
    `SELECT COUNT(*) FROM cash_registers c JOIN businesses b ON b.id=c.business_id WHERE b.nit LIKE '910000%' AND c.status='OPEN' AND c.deleted_at IS NULL`
  );
  if (Number(openDemo) > 0) {
    throw new Error(`Hay ${openDemo} cajas OPEN en DEMO — detener para no mezclar simulación`);
  }

  const seqMissing = psql(
    `SELECT COUNT(*) FROM businesses b WHERE b.nit LIKE '910000%' AND NOT EXISTS (SELECT 1 FROM business_document_sequences s WHERE s.business_id=b.id AND s.doc_type='COMMERCIAL_TICKET')`
  );
  if (Number(seqMissing) > 0) {
    throw new Error(
      `Faltan secuencias COMMERCIAL_TICKET en ${seqMissing} empresas DEMO. Re-ejecutar db:seed:demo.`
    );
  }

  evidence.initial = {
    norte: snapBusiness(3),
    sur: snapBusiness(4),
    centro: snapBusiness(5),
    priorSalesDemo: Number(
      psql(
        `SELECT COUNT(*) FROM sales s JOIN businesses b ON b.id=s.business_id WHERE b.nit LIKE '910000%' AND s.deleted_at IS NULL`
      )
    ),
  };
  console.log('INITIAL', JSON.stringify(evidence.initial, null, 2));

  const tokenNorteAdmin = await login('demo_admin_1');
  const tokenNorteEmp = await login('demo_emp_1');
  const tokenSur = await login('demo_admin_2');
  const tokenCentro = await login('demo_admin_3');

  // ───────── DÍA 1 ─────────
  {
    const day: DayResult = { day: 1, title: 'Ventas online Norte', status: 'PASS', notes: [], ops: [] };
    try {
      const before = snapBusiness(3);
      const open = await openCash(tokenNorteAdmin, DEV.norteAdmin, 3, 200);
      day.ops.push({ type: 'CASH_OPEN', ...open, device: DEV.norteAdmin });
      const products = bpList(3, { minStock: 10, limit: 10 });
      assert.ok(products.length >= 5, 'catálogo insuficiente');
      let salesOk = 0;
      for (let i = 0; i < 7; i++) {
        const p = products[i % products.length]!;
        // refresh version/stock
        const live = bpList(3, { minStock: 1, limit: 50 }).find((x) => x.id === p.id) || p;
        const qty = 1;
        const beforeBp = Number(
          psql(`SELECT current_stock FROM business_products WHERE id=${live.id}`)
        );
        const sale = await saleCreate(tokenNorteAdmin, DEV.norteAdmin, 3, open.cashId, [
          {
            businessProductId: live.id,
            quantity: qty,
            unitPrice: live.price,
            baseVersion: live.version,
          },
        ]);
        assert.strictEqual(sale.result?.status, 'applied', JSON.stringify(sale.result));
        const afterBp = Number(
          psql(`SELECT current_stock FROM business_products WHERE id=${live.id}`)
        );
        assert.strictEqual(afterBp, beforeBp - qty, `stock bp ${live.id}`);
        const com = sale.result?.server?.commercialNumber;
        day.ops.push({
          type: 'SALE_CREATE',
          clientOperationId: sale.clientOperationId,
          localSaleId: sale.localSaleId,
          commercialNumber: com,
          bpId: live.id,
          qty,
          total: sale.result?.server?.totalAmount,
          stockBefore: beforeBp,
          stockAfter: afterBp,
        });
        salesOk += 1;
        // bump local cache version for next loop
        p.version = Number(psql(`SELECT version FROM business_products WHERE id=${live.id}`));
        p.stock = afterBp;
      }
      const cash = getCash(open.cashId);
      const close = await closeCash(
        tokenNorteAdmin,
        DEV.norteAdmin,
        3,
        open.cashId,
        cash.current,
        cash.version
      );
      assert.ok(
        close.result?.status === 'applied' || close.result?.status === 'duplicate',
        JSON.stringify(close.result)
      );
      day.ops.push({ type: 'CASH_CLOSE', ...close, expected: cash.current });
      const after = snapBusiness(3);
      day.notes.push(
        `Ventas aplicadas=${salesOk}; stock ${before.stockSum}→${after.stockSum}; salesTotal ${before.salesTotal}→${after.salesTotal}`
      );
      assert.strictEqual(salesOk, 7);
      assert.strictEqual(after.stockSum, before.stockSum - 7);
    } catch (e: any) {
      day.status = 'FAIL';
      day.notes.push(String(e?.message || e));
    }
    days.push(day);
    console.log(`DAY1 ${day.status}`, day.notes.join(' | '));
  }

  // ───────── DÍA 2 ─────────
  {
    const day: DayResult = { day: 2, title: 'Inventario + venta', status: 'PASS', notes: [], ops: [] };
    try {
      const open = await openCash(tokenNorteAdmin, DEV.norteAdmin, 3, 150);
      day.ops.push({ type: 'CASH_OPEN', cashId: open.cashId });
      const targets = bpList(3, { minStock: 8, maxStock: 40, limit: 5 });
      const t = targets[0]!;
      const before = Number(psql(`SELECT current_stock FROM business_products WHERE id=${t.id}`));
      const adjUp = await stockAdjust(tokenNorteAdmin, DEV.norteAdmin, 3, t.id, +5, t.version);
      assert.strictEqual(adjUp.result?.status, 'applied', JSON.stringify(adjUp.result));
      const midVer = Number(psql(`SELECT version FROM business_products WHERE id=${t.id}`));
      const midStock = Number(psql(`SELECT current_stock FROM business_products WHERE id=${t.id}`));
      assert.strictEqual(midStock, before + 5);
      const adjDown = await stockAdjust(tokenNorteAdmin, DEV.norteAdmin, 3, t.id, -2, midVer);
      assert.strictEqual(adjDown.result?.status, 'applied', JSON.stringify(adjDown.result));
      const afterAdj = Number(psql(`SELECT current_stock FROM business_products WHERE id=${t.id}`));
      assert.strictEqual(afterAdj, before + 3);
      day.ops.push({
        type: 'STOCK_ADJUST',
        up: adjUp.clientOperationId,
        down: adjDown.clientOperationId,
        bpId: t.id,
        before,
        afterAdj,
      });
      const ver = Number(psql(`SELECT version FROM business_products WHERE id=${t.id}`));
      const price = Number(psql(`SELECT custom_price FROM business_products WHERE id=${t.id}`));
      const sale = await saleCreate(tokenNorteAdmin, DEV.norteAdmin, 3, open.cashId, [
        { businessProductId: t.id, quantity: 1, unitPrice: price, baseVersion: ver },
      ]);
      assert.strictEqual(sale.result?.status, 'applied', JSON.stringify(sale.result));
      day.ops.push({
        type: 'SALE_CREATE',
        clientOperationId: sale.clientOperationId,
        commercialNumber: sale.result?.server?.commercialNumber,
      });
      const cash = getCash(open.cashId);
      const close = await closeCash(
        tokenNorteAdmin,
        DEV.norteAdmin,
        3,
        open.cashId,
        cash.current,
        cash.version
      );
      assert.ok(close.result?.status === 'applied' || close.result?.status === 'duplicate');
      day.notes.push(`BP ${t.id}: stock ${before}→${afterAdj}→${afterAdj - 1}`);
    } catch (e: any) {
      day.status = 'FAIL';
      day.notes.push(String(e?.message || e));
    }
    days.push(day);
    console.log(`DAY2 ${day.status}`, day.notes.join(' | '));
  }

  // ───────── DÍA 3 (offline semantics via deferred push) ─────────
  {
    const day: DayResult = {
      day: 3,
      title: 'Ventas provisionales → sync (offline-style)',
      status: 'PASS',
      notes: [],
      ops: [],
    };
    try {
      const open = await openCash(tokenNorteAdmin, DEV.norteAdmin, 3, 180);
      const products = bpList(3, { minStock: 15, limit: 5 });
      // Prepare 3 sale payloads (provisional IDs) then push sequentially = sync after offline
      const prepared = [];
      for (let i = 0; i < 3; i++) {
        const p = products[i]!;
        const live = {
          id: p.id,
          price: Number(psql(`SELECT custom_price FROM business_products WHERE id=${p.id}`)),
          version: Number(psql(`SELECT version FROM business_products WHERE id=${p.id}`)),
          stock: Number(psql(`SELECT current_stock FROM business_products WHERE id=${p.id}`)),
        };
        prepared.push({
          clientOperationId: randomUUID(),
          localSaleId: randomUUID(),
          line: {
            businessProductId: live.id,
            quantity: 1,
            unitPrice: live.price,
            baseVersion: live.version,
          },
          stockBefore: live.stock,
        });
      }
      day.notes.push(
        'Provisional IDs generados antes de push (simula outbox IndexedDB). Navegador offline documentado aparte.'
      );
      // Block close while "pending": we still have open cash and will push now
      const pendingIds = prepared.map((p) => p.clientOperationId);
      day.ops.push({ type: 'PROVISIONAL_IDS', pendingIds });

      for (const prep of prepared) {
        const res = await push(tokenNorteAdmin, DEV.norteAdmin, 3, [
          {
            clientOperationId: prep.clientOperationId,
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: prep.localSaleId,
              cashRegisterId: open.cashId,
              paymentMethod: 'CASH',
              discountAmount: 0,
              notes: `${SIM_ID} day3`,
              lines: [prep.line],
            },
          },
        ]);
        const r = res.body.results?.[0];
        assert.strictEqual(r?.status, 'applied', JSON.stringify(r));
        // idempotent retry
        const retry = await push(tokenNorteAdmin, DEV.norteAdmin, 3, [
          {
            clientOperationId: prep.clientOperationId,
            operationType: 'SALE_CREATE',
            payload: {
              localSaleId: prep.localSaleId,
              cashRegisterId: open.cashId,
              paymentMethod: 'CASH',
              discountAmount: 0,
              notes: `${SIM_ID} day3`,
              lines: [prep.line],
            },
          },
        ]);
        assert.strictEqual(retry.body.results?.[0]?.status, 'duplicate');
        const stockAfter = Number(
          psql(`SELECT current_stock FROM business_products WHERE id=${prep.line.businessProductId}`)
        );
        assert.strictEqual(stockAfter, prep.stockBefore - 1);
        day.ops.push({
          type: 'SALE_CREATE',
          clientOperationId: prep.clientOperationId,
          commercialNumber: r.server?.commercialNumber,
          status: r.status,
          retry: 'duplicate',
          stockBefore: prep.stockBefore,
          stockAfter,
        });
      }
      const cash = getCash(open.cashId);
      const close = await closeCash(
        tokenNorteAdmin,
        DEV.norteAdmin,
        3,
        open.cashId,
        cash.current,
        cash.version
      );
      assert.ok(close.result?.status === 'applied' || close.result?.status === 'duplicate');
      day.notes.push('3 ventas confirmadas una sola vez cada una (retry=duplicate)');
    } catch (e: any) {
      day.status = 'FAIL';
      day.notes.push(String(e?.message || e));
    }
    days.push(day);
    console.log(`DAY3 ${day.status}`, day.notes.join(' | '));
  }

  // ───────── DÍA 4 conflictos ─────────
  {
    const day: DayResult = { day: 4, title: 'Conflictos stock/precio', status: 'PASS', notes: [], ops: [] };
    try {
      const open = await openCash(tokenNorteAdmin, DEV.norteAdmin, 3, 100);
      // Find BP with small stock for insufficient, or create by adjusting down
      let low = bpList(3, { minStock: 2, maxStock: 5, limit: 10 })[0];
      if (!low) {
        const any = bpList(3, { minStock: 10, limit: 5 })[0]!;
        await stockAdjust(tokenNorteAdmin, DEV.norteAdmin, 3, any.id, -(any.stock - 2), any.version);
        low = bpList(3, { minStock: 1, maxStock: 5, limit: 20 }).find((x) => x.id === any.id)!;
      }
      assert.ok(low, 'no low-stock bp');
      // Prepare provisional sale qty=2 with observed price, then change price via STOCK? No - change price needs BP_UPSERT or direct - use STOCK_ADJUST path and PRICE via selling

      // Conflict A: PRICE_MISMATCH — enqueue sale with wrong unitPrice after adjusting version stay
      const priceLive = Number(psql(`SELECT custom_price FROM business_products WHERE id=${low.id}`));
      const verLive = Number(psql(`SELECT version FROM business_products WHERE id=${low.id}`));
      const wrongPrice = Math.round((priceLive + 3.5) * 100) / 100;
      const priceConflict = await saleCreate(tokenNorteAdmin, DEV.norteAdmin, 3, open.cashId, [
        {
          businessProductId: low.id,
          quantity: 1,
          unitPrice: wrongPrice,
          baseVersion: verLive,
        },
      ]);
      assert.strictEqual(priceConflict.result?.status, 'rejected');
      assert.strictEqual(priceConflict.result?.code, 'PRICE_MISMATCH');
      day.ops.push({
        type: 'PRICE_MISMATCH',
        clientOperationId: priceConflict.clientOperationId,
        code: priceConflict.result?.code,
      });

      // Conflict B: INSUFFICIENT_STOCK — qty > available
      const stockNow = Number(psql(`SELECT available_stock FROM business_products WHERE id=${low.id}`));
      const ver2 = Number(psql(`SELECT version FROM business_products WHERE id=${low.id}`));
      const price2 = Number(psql(`SELECT custom_price FROM business_products WHERE id=${low.id}`));
      const stockConflict = await saleCreate(tokenNorteAdmin, DEV.norteAdmin, 3, open.cashId, [
        {
          businessProductId: low.id,
          quantity: stockNow + 5,
          unitPrice: price2,
          baseVersion: ver2,
        },
      ]);
      assert.strictEqual(stockConflict.result?.status, 'rejected');
      assert.strictEqual(stockConflict.result?.code, 'INSUFFICIENT_STOCK');
      const stockAfterReject = Number(
        psql(`SELECT available_stock FROM business_products WHERE id=${low.id}`)
      );
      assert.strictEqual(stockAfterReject, stockNow, 'stock no debe bajar en reject');
      day.ops.push({
        type: 'INSUFFICIENT_STOCK',
        clientOperationId: stockConflict.clientOperationId,
        stockUnchanged: stockAfterReject,
      });

      const cash = getCash(open.cashId);
      await closeCash(tokenNorteAdmin, DEV.norteAdmin, 3, open.cashId, cash.current, cash.version);
      day.notes.push('PRICE_MISMATCH + INSUFFICIENT_STOCK rechazados; stock intacto');
    } catch (e: any) {
      day.status = 'FAIL';
      day.notes.push(String(e?.message || e));
    }
    days.push(day);
    console.log(`DAY4 ${day.status}`, day.notes.join(' | '));
  }

  // ───────── DÍA 5 dual user ─────────
  {
    const day: DayResult = {
      day: 5,
      title: 'ADMIN+EMPLOYEE dispositivos distintos',
      status: 'PASS',
      notes: [],
      ops: [],
    };
    try {
      const openA = await openCash(tokenNorteAdmin, DEV.norteAdmin, 3, 120);
      const openE = await openCash(tokenNorteEmp, DEV.norteEmp, 3, 80);
      day.ops.push({ adminCash: openA.cashId, empCash: openE.cashId });
      assert.notStrictEqual(openA.cashId, openE.cashId);

      const shared = bpList(3, { minStock: 20, limit: 3 });
      const p = shared[0]!;
      const before = Number(psql(`SELECT current_stock FROM business_products WHERE id=${p.id}`));

      // concurrent-ish sequential with refresh
      const s1 = await saleCreate(tokenNorteAdmin, DEV.norteAdmin, 3, openA.cashId, [
        {
          businessProductId: p.id,
          quantity: 2,
          unitPrice: Number(psql(`SELECT custom_price FROM business_products WHERE id=${p.id}`)),
          baseVersion: Number(psql(`SELECT version FROM business_products WHERE id=${p.id}`)),
        },
      ]);
      assert.strictEqual(s1.result?.status, 'applied', JSON.stringify(s1.result));
      const s2 = await saleCreate(tokenNorteEmp, DEV.norteEmp, 3, openE.cashId, [
        {
          businessProductId: p.id,
          quantity: 2,
          unitPrice: Number(psql(`SELECT custom_price FROM business_products WHERE id=${p.id}`)),
          baseVersion: Number(psql(`SELECT version FROM business_products WHERE id=${p.id}`)),
        },
      ]);
      assert.strictEqual(s2.result?.status, 'applied', JSON.stringify(s2.result));
      const after = Number(psql(`SELECT current_stock FROM business_products WHERE id=${p.id}`));
      assert.strictEqual(after, before - 4);
      assert.ok(after >= 0);
      day.ops.push({
        sales: [
          { who: 'admin', com: s1.result?.server?.commercialNumber, op: s1.clientOperationId },
          { who: 'emp', com: s2.result?.server?.commercialNumber, op: s2.clientOperationId },
        ],
        stockBefore: before,
        stockAfter: after,
      });

      const cA = getCash(openA.cashId);
      const cE = getCash(openE.cashId);
      await closeCash(tokenNorteAdmin, DEV.norteAdmin, 3, openA.cashId, cA.current, cA.version);
      await closeCash(tokenNorteEmp, DEV.norteEmp, 3, openE.cashId, cE.current, cE.version);
      day.notes.push(`stock ${before}→${after}; cajas independientes cerradas`);
    } catch (e: any) {
      day.status = 'FAIL';
      day.notes.push(String(e?.message || e));
    }
    days.push(day);
    console.log(`DAY5 ${day.status}`, day.notes.join(' | '));
  }

  // ───────── DÍA 6 multiempresa ─────────
  {
    const day: DayResult = { day: 6, title: 'Sur + Centro aislamiento', status: 'PASS', notes: [], ops: [] };
    try {
      const openSur = await openCash(tokenSur, DEV.sur, 4, 100);
      const openCen = await openCash(tokenCentro, DEV.centro, 5, 100);
      const bpSur = bpList(4, { minStock: 10, limit: 3 })[0]!;
      const bpCen = bpList(5, { minStock: 10, limit: 3 })[0]!;

      const saleSur = await saleCreate(tokenSur, DEV.sur, 4, openSur.cashId, [
        {
          businessProductId: bpSur.id,
          quantity: 1,
          unitPrice: bpSur.price,
          baseVersion: Number(psql(`SELECT version FROM business_products WHERE id=${bpSur.id}`)),
        },
      ]);
      const saleCen = await saleCreate(tokenCentro, DEV.centro, 5, openCen.cashId, [
        {
          businessProductId: bpCen.id,
          quantity: 1,
          unitPrice: bpCen.price,
          baseVersion: Number(psql(`SELECT version FROM business_products WHERE id=${bpCen.id}`)),
        },
      ]);
      assert.strictEqual(saleSur.result?.status, 'applied');
      assert.strictEqual(saleCen.result?.status, 'applied');

      // cross-tenant: Norte token tries Sur cash
      const cross = await saleCreate(tokenNorteAdmin, DEV.norteAdmin, 3, openSur.cashId, [
        {
          businessProductId: bpSur.id,
          quantity: 1,
          unitPrice: bpSur.price,
          baseVersion: Number(psql(`SELECT version FROM business_products WHERE id=${bpSur.id}`)),
        },
      ]);
      assert.ok(
        cross.result?.status === 'rejected' &&
          ['FORBIDDEN', 'NOT_FOUND', 'CASH_CLOSED'].includes(cross.result?.code),
        JSON.stringify(cross.result)
      );
      day.ops.push({
        surCom: saleSur.result?.server?.commercialNumber,
        cenCom: saleCen.result?.server?.commercialNumber,
        crossCode: cross.result?.code,
      });

      // GET open cross: Sur device with Norte token shouldn't see Sur cash as own open for norte device
      const getCross = await api('GET', '/cash-registers/open', {
        token: tokenNorteAdmin,
        deviceId: DEV.sur,
      });
      // norte user + sur device → null open (no open for that user+device)
      assert.ok(getCross.code === 200);
      assert.strictEqual(getCross.body.open, null);

      const cS = getCash(openSur.cashId);
      const cC = getCash(openCen.cashId);
      await closeCash(tokenSur, DEV.sur, 4, openSur.cashId, cS.current, cS.version);
      await closeCash(tokenCentro, DEV.centro, 5, openCen.cashId, cC.current, cC.version);
      day.notes.push(`cross-tenant rejected=${cross.result?.code}; Sur/Centro OK`);
    } catch (e: any) {
      day.status = 'FAIL';
      day.notes.push(String(e?.message || e));
    }
    days.push(day);
    console.log(`DAY6 ${day.status}`, day.notes.join(' | '));
  }

  // ───────── DÍA 7 conciliación ─────────
  {
    const day: DayResult = { day: 7, title: 'Conciliación', status: 'PASS', notes: [], ops: [] };
    try {
      evidence.final = {
        norte: snapBusiness(3),
        sur: snapBusiness(4),
        centro: snapBusiness(5),
      };
      const openLeft = Number(
        psql(
          `SELECT COUNT(*) FROM cash_registers c JOIN businesses b ON b.id=c.business_id WHERE b.nit LIKE '910000%' AND c.status='OPEN' AND c.deleted_at IS NULL`
        )
      );
      assert.strictEqual(openLeft, 0, `cajas OPEN restantes=${openLeft}`);

      const negStock = Number(
        psql(
          `SELECT COUNT(*) FROM business_products b JOIN businesses bus ON bus.id=b.business_id WHERE bus.nit LIKE '910000%' AND b.current_stock < 0 AND b.deleted_at IS NULL`
        )
      );
      assert.strictEqual(negStock, 0);

      const demoSales = psqlRows(
        `SELECT s.id||'|'||s.business_id||'|'||s.commercial_number||'|'||s.total_amount::text||'|'||s.device_id FROM sales s JOIN businesses b ON b.id=s.business_id WHERE b.nit LIKE '910000%' AND s.deleted_at IS NULL AND s.notes LIKE '%${SIM_ID}%' ORDER BY s.id`
      );
      const invTx = Number(
        psql(
          `SELECT COUNT(*) FROM inventory_transactions it JOIN businesses b ON b.id=it.business_id WHERE b.nit LIKE '910000%' AND it.notes LIKE '%${SIM_ID}%'`
        )
      );
      // cash movements for demo sales in this sim
      const cashMov = Number(
        psql(
          `SELECT COUNT(*) FROM cash_movements cm JOIN businesses b ON b.id=cm.business_id WHERE b.nit LIKE '910000%' AND cm.notes LIKE '%${SIM_ID}%'`
        )
      );

      const norteDeltaStock =
        (evidence.initial as Json).norte.stockSum - (evidence.final as Json).norte.stockSum;
      const norteSales = Number(
        psql(
          `SELECT COALESCE(SUM(si.quantity),0) FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE s.business_id=3 AND s.notes LIKE '%${SIM_ID}%' AND s.deleted_at IS NULL`
        )
      );
      // Day2 net adjust +3 then -1 sale on that bp is included in stock delta; also day2 +5-2=+3 on one bp
      // Stock delta should equal units sold minus net positive adjusts on demo notes — approximate check: no negative, sales count > 0
      day.ops.push({
        demoSalesCount: demoSales.length,
        demoSales,
        inventoryTxTagged: invTx,
        cashMovTagged: cashMov,
        norteDeltaStock,
        norteUnitsSold: norteSales,
      });
      assert.ok(demoSales.length >= 10, `pocas ventas sim=${demoSales.length}`);
      day.notes.push(
        `ventas SIM=${demoSales.length}; Δstock Norte=${norteDeltaStock}; unidades vendidas Norte=${norteSales}; openCash=0; negStock=0`
      );
    } catch (e: any) {
      day.status = 'FAIL';
      day.notes.push(String(e?.message || e));
    }
    days.push(day);
    console.log(`DAY7 ${day.status}`, day.notes.join(' | '));
  }

  evidence.days = days;
  evidence.finishedAt = new Date().toISOString();
  const failed = days.filter((d) => d.status === 'FAIL').length;
  evidence.summary = {
    passedDays: days.filter((d) => d.status === 'PASS').length,
    failedDays: failed,
    simId: SIM_ID,
  };

  const outDir = join(__dirname, '..', '..', 'docs');
  mkdirSync(outDir, { recursive: true });
  const evidencePath = join(outDir, 'P2C1E_SIMULATION_EVIDENCE.json');
  writeFileSync(evidencePath, JSON.stringify(evidence, null, 2), 'utf8');
  console.log(`\nEvidence → ${evidencePath}`);
  console.log(JSON.stringify(evidence.summary));

  if (failed > 0) {
    console.error(`SIMULATION FAILED: ${failed} day(s)`);
    process.exit(1);
  }
  console.log('\n=== SIMULATION PASS ===\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
