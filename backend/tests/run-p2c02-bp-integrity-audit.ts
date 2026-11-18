/**
 * P2-C0.2 Fase 0 — auditoría de integridad BusinessProduct (solo lectura).
 * No restaura ni elimina datos. npm run test:p2c02:audit
 */
import assert from 'assert';
import { execSync } from 'child_process';

const BASELINES = [
  { id: 1, businessId: 1, productId: 1, price: '8.50', stock: 100 },
  { id: 2, businessId: 2, productId: 1, price: '9.00', stock: 40 },
  { id: 3, businessId: 1, productId: 2, price: '15.00', stock: 25 },
  { id: 4, businessId: 2, productId: 3, price: '7.00', stock: 60 },
] as const;

function psql(sql: string): string {
  const flat = sql.replace(/\s+/g, ' ').trim();
  if (/\bUPDATE\b/i.test(flat) && !/\bWHERE\b/i.test(flat)) {
    throw new Error('UPDATE sin WHERE bloqueado');
  }
  if (/\bDELETE\s+FROM\b/i.test(flat) && !/\bWHERE\b/i.test(flat)) {
    throw new Error('DELETE sin WHERE bloqueado');
  }
  const escaped = flat.replace(/"/g, '\\"');
  return execSync(
    `docker exec -i "supertienda-db" psql -U "supertienda" -d "supertienda_dev" -v ON_ERROR_STOP=1 -t -A -c "${escaped}"`,
    { encoding: 'utf8' }
  ).trim();
}

function main() {
  console.log('=== P2-C0.2 Fase 0 — auditoría BP (solo lectura) ===');
  console.log('Incidente P2-C.B: UPDATE multilínea truncado por cmd.exe → soft-delete masivo.');
  console.log('Mitigación: aplanar SQL + bloquear UPDATE/DELETE sin WHERE en helpers de test.\n');

  let seedOk = true;
  for (const b of BASELINES) {
    const row = psql(
      `SELECT business_id::text || '|' || product_id::text || '|' || trim(trailing '0' from trim(trailing '.' from custom_price::text)) || '|' || current_stock::text || '|' || available_stock::text || '|' || CASE WHEN deleted_at IS NULL THEN 'active' ELSE 'soft' END FROM business_products WHERE id = ${b.id}`
    );
    const [bid, pid, priceRaw, stock, avail, softFlag] = row.split('|');
    const priceNorm = Number(priceRaw).toFixed(2);
    const softDeleted = softFlag === 'soft';
    const ok =
      Number(bid) === b.businessId &&
      Number(pid) === b.productId &&
      priceNorm === b.price &&
      Number(stock) === b.stock &&
      Number(avail) === b.stock &&
      !softDeleted;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  seed BP id=${b.id} → business=${bid} product=${pid} price=${priceNorm} stock=${stock}/${avail} softDeleted=${softDeleted}`
    );
    if (!ok) seedOk = false;
  }

  const extras = psql(
    `SELECT string_agg(id::text || ':p' || product_id::text, ', ' ORDER BY id) FROM business_products WHERE deleted_at IS NULL AND id > 4`
  );
  console.log(`INFO  BP activos no-seed (id>4): ${extras || '(ninguno)'}`);

  const softCounts = psql(
    `SELECT business_id || '=' || COUNT(*) FROM business_products WHERE deleted_at IS NOT NULL GROUP BY business_id ORDER BY business_id`
  );
  console.log(`INFO  soft-deleted por empresa: ${softCounts || '(ninguno)'}`);

  assert.ok(seedOk, 'Baselines seed BP 1–4 no coinciden — DETENERSE sin restaurar automático');
  console.log('\nFase 0: baselines seed OK. Residuos de tests (si hay) documentados arriba; no se eliminan automáticamente.');
}

main();
