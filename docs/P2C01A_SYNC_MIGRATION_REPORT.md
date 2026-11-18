# P2-C0.1A — Informe de migración de cimientos offline

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Ámbito:** PostgreSQL Docker local `supertienda_dev` únicamente  
**Plan:** [`P2C01_SYNC_FOUNDATION_PLAN.md`](./P2C01_SYNC_FOUNDATION_PLAN.md)  
**Estado:** Completado — **sin** endpoints `/sync/*`, sin frontend/POS, sin commit/push

---

## 0. Resumen ejecutivo

Se aplicó la migración versionada `20261116191000_sync_foundation` solo en Docker local. Se añadieron `version` (default 1) a Product/Category/BusinessProduct, soft-delete `BusinessProduct.deletedAt` con índice único parcial activo, y tabla vacía `sync_operations` (`id` BIGSERIAL / Prisma `BigInt`). Precios y stocks intactos. Suites P0–P2-B verdes. TypeScript backend/frontend OK.

---

## 1. Fase 1 — Seguridad

| Chequeo | Resultado |
|---------|-----------|
| `DATABASE_URL` en contenedor | `postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev` |
| Prisma CLI desde host para migrate | **No** — solo `docker exec … prisma migrate deploy` |
| Destino remoto | No |

### Backup

| Archivo | Bytes | SHA-256 |
|---------|------:|---------|
| `docs/backups/p2c01a_pre_migration_20261116_150227.sql` | 82216 | `083138552C3B348BC13681F31889AB05C3A54B1D4ECDCBFF2A4F0634DAC97D03` |
| `docs/backups/p2c01a_pre_counts_20261116_150227.json` | — | Conteos pre |

Backup verificado: header `PostgreSQL database dump` + `COPY` de `products` / `categories` / `business_products`.

### Baseline pre-migración (efectivo)

| Entidad | Count | IDs |
|---------|------:|-----|
| Product | 3 | 1, 2, 3 |
| Category | 2 | 1, 2 |
| BusinessProduct | 4 | 1–4 |

BP: `(1,8.50,100)`, `(2,9.00,40)`, `(3,15.00,25)`, `(4,7.00,60)`.

### Suites pre-migración

P0, P1-D, P1-F, P1-G, P1-H, P2-B integrity → **todas PASS**.

---

## 2. Migración aplicada

| Artefacto | Path |
|-----------|------|
| Schema | `backend/prisma/schema.prisma` |
| SQL | `backend/prisma/migrations/20261116191000_sync_foundation/migration.sql` |

Comando:

```bash
docker exec -i "supertienda-backend" sh -c 'cd /app && npx prisma migrate deploy && npx prisma generate'
```

`prisma migrate status` → **Database schema is up to date!** (3 migraciones). Datasource: `db:5432` / `supertienda_dev`.

### Cambios de schema (resumen)

- Enums `SyncOperationStatus`, `SyncOperationType`
- Modelo `SyncOperation` con `id BigInt @default(autoincrement())`, `@@unique([businessId, clientOperationId])`
- Relaciones `Business.syncOperations`, `User.syncOperations`
- `version Int @default(1)` en Product, Category, BusinessProduct
- `BusinessProduct.deletedAt DateTime?`
- Eliminado `@@unique([businessId, productId])` de Prisma (reemplazado por índice parcial SQL)
- Índices `(businessId, updatedAt)` para pull futuro

### SQL clave

- `ALTER … ADD version DEFAULT 1`
- Drop unique global BP → `CREATE UNIQUE INDEX … WHERE deleted_at IS NULL`
- `CREATE TABLE sync_operations` + BIGSERIAL + FKs + unique `(business_id, client_operation_id)`

**No** se modificaron `ProductVisibility` / `CategoryVisibility` ni datos comerciales.

---

## 3. Integridad antes / después

| Métrica | Antes | Después |
|---------|------:|--------:|
| products | 3 | 3 |
| categories | 2 | 2 |
| business_products | 4 | 4 (todos `deleted_at` null) |
| product_ids | [1,2,3] | [1,2,3] |
| category_ids | [1,2] | [1,2] |
| BP precios/stocks | snapshot seed | idéntico |
| version existentes | — | todos `1` |
| sync_operations | — | **0 filas** |
| CHECKs P2-B | presentes | presentes |
| Índices parciales P2-B SKU/name | presentes | presentes |
| `business_products_business_product_active_uq` | — | presente |
| `sync_operations.id` tipo | — | `bigint` |

Prueba controlada (transacción revertida): soft-delete BP + recreate mismo `(business_id, product_id)` → OK; rollback restaura fila original.

Prueba API: soft-delete temporal BP id=4 → listado B sin BP4 / productId 3; `GET /products/3` → **404**; restore → stocks/precios originales.

---

## 4. Compatibilidad de servicios

Al quitar el unique Prisma compuesto, `findUnique({ businessId_productId })` y `upsert` dejan de compilar. Se actualizó el código mínimo:

| Archivo | Cambio |
|---------|--------|
| `BusinessProductRepository.ts` | `findFirst` + `deletedAt: null`; delete → soft-delete; create no reactiva |
| `BusinessProductCatalogService.ts` | Filtros activos; bulk-configure no revive |
| `businessService.ts` | upsert → findFirst/update/create; remove soft-delete |
| `inventoryService.ts` | Igual patrón; lecturas activas |
| `saleService.ts` | `updateMany` con `deletedAt: null` + `version++` |
| `cartService.ts` / `posService.ts` | Include/where activos |
| `catalogContainment.ts` | `activeBusinessProductWhere`; visibility via BP activo |
| `ProductRepository.ts` / `CategoryRepository.ts` | `businessProducts.some` con `deletedAt: null`; map `version` |
| `PlatformCatalogService.ts` | map `version` en categorías |
| `prisma/seed.ts` | findFirst activo |

**Políticas respetadas:**

- Lecturas comerciales excluyen BP eliminados  
- Eliminación = soft-delete (no hard-delete)  
- No reactivación automática (`deletedAt` no se limpia en update/upsert)  
- Duplicado activo mismo par → rechazado (app + unique parcial)  
- Precios/stocks no tocados por la migración  

---

## 5. Pruebas

| Suite | Resultado |
|-------|-----------|
| `test:p0` | 14 passed |
| `test:p1d:http` | 12 passed |
| `test:p1f:http` | 15 passed |
| `test:p1g:http` | 10 passed |
| `test:p1h:http` | 10 passed |
| `test:p2b:integrity` | 9 passed |
| Soft-delete oculto en API comercial | PASS |
| `tsc --noEmit` backend | OK |
| `tsc --noEmit` frontend | OK |
| Docker `supertienda-db` / `backend` | healthy |

**No** se implementaron ni probaron `/sync/push` ni `/sync/pull` (fuera de alcance).

---

## 6. Archivos modificados

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20261116191000_sync_foundation/migration.sql` (**nuevo**)
- `backend/prisma/seed.ts`
- `backend/src/helpers/catalogContainment.ts`
- `backend/src/repositories/BusinessProductRepository.ts`
- `backend/src/repositories/ProductRepository.ts`
- `backend/src/repositories/CategoryRepository.ts`
- `backend/src/services/BusinessProductCatalogService.ts`
- `backend/src/services/businessService.ts`
- `backend/src/services/inventoryService.ts`
- `backend/src/services/saleService.ts`
- `backend/src/services/cartService.ts`
- `backend/src/services/posService.ts`
- `backend/src/services/PlatformCatalogService.ts`
- `docs/backups/p2c01a_pre_migration_*.sql`
- `docs/P2C01A_SYNC_MIGRATION_REPORT.md` (este)

---

## 7. Riesgos residuales

1. **Índice parcial BP solo en SQL** — no usar `db push`; Prisma no modela el WHERE.  
2. **Histórico soft-deleted + nueva fila activa** — dos filas posibles; consultas deben filtrar `deletedAt: null`.  
3. **Endpoints sync aún ausentes** — tabla lista pero sin escritura de aplicación.  
4. **Cursor pull compuesto** — diseñado en plan; no implementado.  
5. **Numeración fiscal / ventas offline** — sin cambio; sigue bloqueante para POS offline.  
6. **`version` en respuestas Product** — no todos los mappers de Product exponen `version` aún (Category sí); ampliar en 0.1B si el cliente sync lo necesita.

---

## 8. Rollback (solo Docker local)

1. Preferido: restaurar `docs/backups/p2c01a_pre_migration_20261116_150227.sql`.  
2. Alternativa SQL: drop `sync_operations` + enums; drop columnas `version` / `deleted_at`; recrear unique global BP (solo si no hay pares soft-deleted duplicados).  
3. Revertir `schema.prisma` al estado P2-B y regenerar client.

**Prohibido:** reset remoto, borrar volúmenes productivos.

---

## 9. Preparación para P2-C0.1B

Listo para autorizar implementación de:

1. `POST /sync/push` + `GET /sync/pull` (TSOA, tenant-only)  
2. Hash canónico + idempotencia contra `sync_operations`  
3. Handlers: `PRODUCT_PRIVATE_CREATE_WITH_BP`, updates con `baseVersion`, `STOCK_ADJUST` sin oversell  
4. Pull paginado multi-stream + tombstones  
5. Tests HTTP S1–S20 del plan  
6. Exponer `version` en DTOs de sync  

**No** incluido en 0.1B sin nueva orden: frontend, PWA, POS, numeración fiscal.

---

## 10. Criterio de cierre P2-C0.1A

| Criterio | Estado |
|----------|--------|
| Backup válido | Cumple |
| Migración solo Docker local | Cumple |
| Conteos/IDs/precios/stocks | Cumple |
| version=1 / sync vacía | Cumple |
| Constraints P2-B + unique parcial BP | Cumple |
| BP eliminado oculto comercialmente | Cumple |
| Suites + tsc + Docker healthy | Cumple |
| Sin `/sync` / frontend / commit | Cumple |

**P2-C0.1A cerrado.** Detenerse para autorización de P2-C0.1B.
