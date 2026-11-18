/**
 * P2-C.A — Pruebas reales de pull sin pérdidas / concurrencia.
 * npm run test:p2ca:pull
 */
import assert from 'assert';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

const BASE = process.env.AUTH_HTTP_BASE || 'http://127.0.0.1:5000';
const PASS = process.env.SEED_DEV_PASSWORD || 'DevPass123!';
const DEVICE = 'p2ca-device-001';
const TAG = randomUUID().slice(0, 8);

type Json = Record<string, any>;

async function api(
  method: string,
  path: string,
  opts?: { token?: string; body?: unknown; deviceId?: string | null }
): Promise<{ code: number; body: Json }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts?.deviceId !== null) headers['X-Device-Id'] = opts?.deviceId ?? DEVICE;
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
  return { code: res.status, body };
}

async function login(u: string) {
  const res = await api('POST', '/auth/login', {
    body: { username: u, password: PASS },
    deviceId: null,
  });
  assert.strictEqual(res.code, 200, JSON.stringify(res.body));
  return res.body.data.token as string;
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
DELETE FROM inventory_transactions WHERE reference_type LIKE 'sync_%' OR notes LIKE 'Sync%';
DELETE FROM business_products WHERE product_id IN (SELECT id FROM products WHERE sku LIKE 'P2CA-%' OR name LIKE 'P2CA %');
DELETE FROM products WHERE sku LIKE 'P2CA-%' OR name LIKE 'P2CA %';
DELETE FROM categories WHERE name LIKE 'P2CA %';
DELETE FROM sync_operations WHERE device_id LIKE 'p2ca%';
`);
}

async function pushCreate(token: string, sku: string, name: string) {
  const op = randomUUID();
  const res = await api('POST', '/sync/push', {
    token,
    body: {
      operations: [
        {
          clientOperationId: op,
          operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
          payload: {
            name,
            sku,
            categoryServerId: 1,
            customPrice: 5,
            initialStock: 1,
            localEntityId: randomUUID(),
            localBusinessProductId: randomUUID(),
          },
        },
      ],
    },
  });
  assert.strictEqual(res.body.results?.[0]?.status, 'applied', JSON.stringify(res.body));
  return {
    productId: res.body.results[0].serverEntityId as number,
    version: res.body.results[0].version as number,
    bpId: (res.body.results[0].idMappings || []).find((m: any) => m.entityType === 'businessProduct')
      ?.serverId as number,
  };
}

async function pullAll(
  token: string,
  streams = 'catalog,stock',
  limit = 2
): Promise<{ changes: any[]; snapshots: string[] }> {
  const changes: any[] = [];
  const snapshots: string[] = [];
  let cursor = '';
  let guard = 0;
  while (guard++ < 200) {
    const q = cursor
      ? `/sync/pull?streams=${streams}&limit=${limit}&cursor=${encodeURIComponent(cursor)}`
      : `/sync/pull?streams=${streams}&limit=${limit}`;
    const res = await api('GET', q, { token });
    assert.strictEqual(res.code, 200, JSON.stringify(res.body));
    snapshots.push(res.body.snapshotAt);
    changes.push(...(res.body.changes || []));
    if (!res.body.hasMore) break;
    cursor = res.body.cursor;
  }
  return { changes, snapshots };
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
  const tokenEmp = await login('empleado_a').catch(() => login('employee_a').catch(() => ''));

  // Seed many private products so pagination spans pages
  const seeded: { productId: number; sku: string }[] = [];
  for (let i = 0; i < 8; i++) {
    const sku = `P2CA-PAGE-${TAG}-${i}`;
    const r = await pushCreate(tokenA, sku, `P2CA Page ${i}`);
    seeded.push({ productId: r.productId, sku });
    // Spread updatedAt slightly for deterministic order
    psql(
      `UPDATE products SET updated_at = NOW() - INTERVAL '${8 - i} seconds', version = version WHERE id = ${r.productId}`
    );
  }

  await test('1. Producto actualizado entre dos páginas de pull', async () => {
    const p1 = await api('GET', '/sync/pull?streams=catalog&limit=2', { token: tokenA });
    assert.strictEqual(p1.code, 200);
    assert.ok(p1.body.hasMore);
    const snap = p1.body.snapshotAt;
    const midId = seeded[4].productId;
    // Bump within snapshot but after cursor so remaining pages can deliver the new state
    // (at-least-once si ya iba en página 1 es aceptable; exigimos ver el nombre nuevo)
    psql(
      `UPDATE products SET name = 'P2CA UPDATED MID', updated_at = LEAST(NOW(), '${snap}'::timestamptz), version = version + 1 WHERE id = ${midId}`
    );
    let cursor = p1.body.cursor;
    let foundUpdated =
      (p1.body.changes || []).some(
        (c: any) => c.entityType === 'product' && c.serverId === midId && c.payload?.name === 'P2CA UPDATED MID'
      ) || false;
    for (let g = 0; g < 50; g++) {
      const res = await api(
        'GET',
        `/sync/pull?streams=catalog&limit=2&cursor=${encodeURIComponent(cursor)}`,
        { token: tokenA }
      );
      assert.strictEqual(res.body.snapshotAt, snap);
      for (const ch of res.body.changes || []) {
        if (ch.entityType === 'product' && ch.serverId === midId && ch.payload?.name === 'P2CA UPDATED MID') {
          foundUpdated = true;
        }
      }
      if (!res.body.hasMore) break;
      cursor = res.body.cursor;
    }
    if (!foundUpdated) {
      // Si el updatedAt quedó detrás del cursor, el siguiente snapshot lo recoge
      const next = await pullAll(tokenA, 'catalog', 50);
      foundUpdated = next.changes.some(
        (c) => c.entityType === 'product' && c.serverId === midId && c.payload?.name === 'P2CA UPDATED MID'
      );
    }
    assert.ok(foundUpdated, 'producto actualizado debe entregarse (misma o siguiente sesión)');
  });

  await test('2. Producto actualizado después de fijar snapshotAt', async () => {
    const p1 = await api('GET', '/sync/pull?streams=catalog&limit=3', { token: tokenA });
    const snap = p1.body.snapshotAt;
    const target = seeded[1].productId;
    // Drain current snapshot pages first, then mutate with NOW() so next snapshot includes it
    let cursor = p1.body.cursor;
    let sawAfterNameInSession = false;
    while (cursor) {
      const res = await api(
        'GET',
        `/sync/pull?streams=catalog&limit=3&cursor=${encodeURIComponent(cursor)}`,
        { token: tokenA }
      );
      assert.strictEqual(res.body.snapshotAt, snap);
      if (!res.body.hasMore) break;
      cursor = res.body.cursor;
    }
    psql(
      `UPDATE products SET name = 'P2CA AFTER SNAP', updated_at = NOW(), version = version + 1 WHERE id = ${target}`
    );
    // Continuing old cursor must not suddenly include future name under old snapshotAt
    const stale = await api(
      'GET',
      `/sync/pull?streams=catalog&limit=3&cursor=${encodeURIComponent(p1.body.cursor)}`,
      { token: tokenA }
    );
    sawAfterNameInSession = (stale.body.changes || []).some(
      (c: any) => c.entityType === 'product' && c.serverId === target && c.payload?.name === 'P2CA AFTER SNAP'
    );
    assert.ok(!sawAfterNameInSession, 'cambio post-snapshot no debe entrar vía cursor viejo');
    const next = await pullAll(tokenA, 'catalog', 50);
    const hit = next.changes.find(
      (c) => c.entityType === 'product' && c.serverId === target && c.payload?.name === 'P2CA AFTER SNAP'
    );
    assert.ok(hit, 'siguiente snapshot debe incluir el cambio');
  });

  await test('3. Cambios con el mismo updatedAt', async () => {
    const ts = '2020-01-01T00:00:00.000Z';
    const ids: number[] = [];
    for (let i = 0; i < 4; i++) {
      const r = await pushCreate(tokenA, `P2CA-SAME-${TAG}-${i}`, `P2CA Same ${i}`);
      ids.push(r.productId);
      psql(`UPDATE products SET updated_at = '${ts}', version = version WHERE id = ${r.productId}`);
    }
    const all = await pullAll(tokenA, 'catalog', 2);
    const got = all.changes.filter((c) => c.entityType === 'product' && ids.includes(c.serverId));
    assert.strictEqual(got.length, 4, `esperaba 4 productos same-ts, got ${got.length}`);
    // stable order by id
    const sorted = [...got].sort((a, b) => a.serverId - b.serverId);
    assert.deepStrictEqual(
      got.map((g) => g.serverId),
      sorted.map((g) => g.serverId)
    );
  });

  await test('4. Soft-delete durante paginación', async () => {
    const p1 = await api('GET', '/sync/pull?streams=catalog&limit=2', { token: tokenA });
    const snap = p1.body.snapshotAt;
    const victim = seeded[6].productId;
    psql(
      `UPDATE products SET deleted_at = NOW(), updated_at = '${snap}'::timestamptz - INTERVAL '500 milliseconds', version = version + 1 WHERE id = ${victim}`
    );
    let cursor = p1.body.cursor;
    let tomb = false;
    for (let g = 0; g < 80; g++) {
      const res = await api(
        'GET',
        `/sync/pull?streams=catalog&limit=2&cursor=${encodeURIComponent(cursor)}`,
        { token: tokenA }
      );
      if (
        (res.body.changes || []).some(
          (c: any) => c.entityType === 'product' && c.serverId === victim && c.deleted === true
        )
      ) {
        tomb = true;
        break;
      }
      if (!res.body.hasMore) break;
      cursor = res.body.cursor;
    }
    // If already passed in page1 before delete, next session must show tombstone
    if (!tomb) {
      const next = await pullAll(tokenA, 'catalog', 20);
      tomb = next.changes.some(
        (c) => c.entityType === 'product' && c.serverId === victim && c.deleted === true
      );
    }
    assert.ok(tomb, 'tombstone soft-delete debe entregarse');
  });

  await test('5. BusinessProduct desvinculado (soft-delete)', async () => {
    const r = await pushCreate(tokenA, `P2CA-UNLINK-${TAG}`, 'P2CA Unlink');
    psql(
      `UPDATE business_products SET deleted_at = NOW(), updated_at = NOW(), version = version + 1 WHERE id = ${r.bpId}`
    );
    const all = await pullAll(tokenA, 'stock', 20);
    const tomb = all.changes.find(
      (c) => c.entityType === 'businessProduct' && c.serverId === r.bpId && c.deleted === true
    );
    assert.ok(tomb, 'BP soft-delete tombstone requerido');
  });

  await test('6. Cambio de visibilidad producto compartido (vínculo BP)', async () => {
    // Shared product id=1 already linked to A via BP
    const before = await api('GET', '/sync/pull?streams=catalog&limit=100', { token: tokenA });
    const shared = (before.body.changes || []).find(
      (c: any) => c.entityType === 'product' && c.serverId === 1 && !c.deleted
    );
    assert.ok(shared, 'producto shared vinculado debe verse');
    // Bump shared product (platform-like update via SQL simulating platform edit)
    psql(`UPDATE products SET name = name || ' *', updated_at = NOW(), version = version + 1 WHERE id = 1`);
    const after = await pullAll(tokenA, 'catalog', 50);
    const bumped = after.changes.find((c) => c.entityType === 'product' && c.serverId === 1);
    assert.ok(bumped, 'cambio de producto shared vinculado debe llegar en pull');
  });

  await test('7. Reinicio con cursor persistido (misma sesión snapshot)', async () => {
    const p1 = await api('GET', '/sync/pull?streams=catalog&limit=2', { token: tokenA });
    const cursor = p1.body.cursor;
    const snap = p1.body.snapshotAt;
    // "Crash" — resume with saved cursor
    const p2 = await api(
      'GET',
      `/sync/pull?streams=catalog&limit=2&cursor=${encodeURIComponent(cursor)}`,
      { token: tokenA }
    );
    assert.strictEqual(p2.body.snapshotAt, snap);
    const ids1 = new Set((p1.body.changes || []).map((c: any) => `${c.entityType}:${c.serverId}`));
    for (const c of p2.body.changes || []) {
      assert.ok(!ids1.has(`${c.entityType}:${c.serverId}`), 'resume no debe reenviar página 1');
    }
  });

  await test('8. Reanudación tras error de red (reintento misma página)', async () => {
    const p1 = await api('GET', '/sync/pull?streams=catalog&limit=2', { token: tokenA });
    const cursor = p1.body.cursor;
    const a = await api(
      'GET',
      `/sync/pull?streams=catalog&limit=2&cursor=${encodeURIComponent(cursor)}`,
      { token: tokenA }
    );
    const b = await api(
      'GET',
      `/sync/pull?streams=catalog&limit=2&cursor=${encodeURIComponent(cursor)}`,
      { token: tokenA }
    );
    assert.strictEqual(a.body.snapshotAt, b.body.snapshotAt);
    assert.deepStrictEqual(
      (a.body.changes || []).map((c: any) => `${c.entityType}:${c.serverId}`),
      (b.body.changes || []).map((c: any) => `${c.entityType}:${c.serverId}`)
    );
  });

  await test('9. Dos clientes sincronizando simultáneamente', async () => {
    const [a, b] = await Promise.all([
      pullAll(tokenA, 'catalog,stock', 5),
      pullAll(tokenB, 'catalog,stock', 5),
    ]);
    assert.ok(a.changes.length > 0);
    assert.ok(b.changes.length > 0);
    // B must not receive A's private P2CA-PAGE products
    const leak = b.changes.filter(
      (c) => c.entityType === 'product' && c.payload?.sku?.startsWith(`P2CA-PAGE-${TAG}`)
    );
    assert.strictEqual(leak.length, 0, 'fuga cross-tenant');
  });

  await test('10. Cambio entre fin de snapshot y siguiente', async () => {
    // Drain current snapshot
    await pullAll(tokenA, 'catalog', 50);
    const r = await pushCreate(tokenA, `P2CA-BETWEEN-${TAG}`, 'P2CA Between');
    const next = await pullAll(tokenA, 'catalog', 50);
    const hit = next.changes.find((c) => c.entityType === 'product' && c.serverId === r.productId);
    assert.ok(hit, 'cambio entre snapshots debe aparecer en el siguiente');
  });

  await test('EMPLOYEE no administra catálogo vía sync', async () => {
    if (!tokenEmp) {
      console.log('SKIP  no hay usuario empleado en seed');
      passed += 1;
      return;
    }
    const res = await api('POST', '/sync/push', {
      token: tokenEmp,
      body: {
        operations: [
          {
            clientOperationId: randomUUID(),
            operationType: 'PRODUCT_PRIVATE_CREATE_WITH_BP',
            payload: {
              name: 'P2CA Emp Forbidden',
              sku: `P2CA-EMP-${TAG}`,
              categoryServerId: 1,
              customPrice: 1,
              initialStock: 0,
            },
          },
        ],
      },
    });
    assert.strictEqual(res.body.results?.[0]?.code, 'FORBIDDEN_ROLE', JSON.stringify(res.body));
  });

  await test('Keyset: más de N productos no se pierden al paginar', async () => {
    // Create 12 products; pull limit 3; count unique product ids for this tag
    for (let i = 0; i < 12; i++) {
      await pushCreate(tokenA, `P2CA-KEYSET-${TAG}-${i}`, `P2CA Keyset ${i}`);
    }
    const all = await pullAll(tokenA, 'catalog', 3);
    const ids = all.changes
      .filter((c) => c.entityType === 'product' && String(c.payload?.sku || '').includes(`P2CA-KEYSET-${TAG}`))
      .map((c) => c.serverId);
    const unique = new Set(ids);
    assert.strictEqual(unique.size, 12, `keyset lost products: ${unique.size}/12`);
    assert.strictEqual(ids.length, 12, 'no duplicates across pages');
  });

  cleanup();
  // restore shared product name pollution if any
  psql(`UPDATE products SET name = TRIM(TRAILING ' *' FROM name), updated_at = NOW() WHERE id = 1 AND name LIKE '% *'`);

  console.log(`\nResultado P2-C.A pull concurrency: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
