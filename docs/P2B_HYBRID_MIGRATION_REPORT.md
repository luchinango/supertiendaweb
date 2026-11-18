# P2-B — Informe de migración al catálogo híbrido

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Ámbito:** PostgreSQL Docker local `supertienda_dev` únicamente  
**Documento base:** `docs/P2A_HYBRID_CATALOG_DESIGN.md`  
**Estado:** Completado (sin API privada, sin frontend, sin commit/push)

---

## 0. Resumen ejecutivo

Se aplicó la migración versionada `20261116184500_hybrid_catalog` sobre Docker local. Todos los productos y categorías existentes quedaron `PLATFORM_SHARED` con `business_id NULL` (D1). No se alteraron PKs, FKs históricas, ni stock/precios de `BusinessProduct`. Las suites P0 → P1-H y las pruebas de integridad P2-B pasaron.

---

## 1. Autorización y límites respetados

| Permitido | Ejecutado |
|-----------|-----------|
| Modificar `schema.prisma` | Sí |
| Migración Prisma versionada | Sí (`20261116184500_hybrid_catalog`) |
| Aplicar solo a Docker `supertienda_dev` | Sí (`db:5432`) |
| Backup lógico local | Sí |

| Prohibido | Estado |
|-----------|--------|
| Bases remotas / producción | No tocadas |
| `db push` / `migrate reset` / borrar volúmenes | No ejecutados |
| API privada / adopción / frontend / POS | No implementados |
| Commit / push / deploy | No realizados |

**Decisiones aplicadas:** D1–D8 según autorización.

---

## 2. Etapa 1 — Preparación

### 2.1 Target DB

Dentro del contenedor `supertienda-backend`:

```text
DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev
```

`prisma migrate status` reportó datasource en `db:5432` / `supertienda_dev`. Sin conexión remota.

### 2.2 Baseline pre-migración

Ejecutados y verdes antes de migrar:

| Suite | Resultado |
|-------|-----------|
| P0 tenancy | PASS |
| P1-D auth HTTP | PASS |
| P1-F catalog HTTP | PASS |
| P1-G platform HTTP | PASS |
| P1-H platform catalog HTTP | PASS |

Se limpiaron residuos de suite `P1H-*` (soft-deleted / filas de prueba) para dejar solo seed demo antes del schema change.

### 2.3 Backup lógico

| Archivo | Bytes | Verificación |
|---------|------:|--------------|
| `docs/backups/p2b_pre_migration_20261116_144335.sql` | 78527 | `pg_dump` PostgreSQL 16.14 |
| `docs/backups/p2b_pre_migration_20261116_144403.sql` | 78528 | Header `PostgreSQL database dump`; contiene `CREATE TABLE` / `COPY` de `products`, `categories`, `business_products` |
| `docs/backups/p2b_pre_counts_20261116_144403.json` | 488 | Snapshot de conteos |

**SHA-256** (`p2b_pre_migration_20261116_144403.sql`):

`AE3760F1DC2A7E5509AACF6BFAF4B13D44092B73278EE0B11145A42FBE8714C8`

Snapshot de conteos del JSON (antes de la limpieza final P1H soft-deleted):

```json
{"products":4,"products_active":3,"categories":3,"categories_active":1,"bp":4,"product_ids":[1,2,3,5],"category_ids":[1,2,5]}
```

**Baseline efectivo al aplicar la migración** (post-limpieza P1H, pre-deploy):

| Entidad | Count | IDs |
|---------|------:|-----|
| Product | 3 | 1, 2, 3 |
| Category | 2 | 1, 2 |
| BusinessProduct | 4 | 1–4 |

BP snapshot (inalterable):

| id | business_id | product_id | custom_price | current_stock |
|---:|------------:|-----------:|-------------:|--------------:|
| 1 | 1 | 1 | 8.50 | 100 |
| 2 | 2 | 1 | 9.00 | 40 |
| 3 | 1 | 2 | 15.00 | 25 |
| 4 | 2 | 3 | 7.00 | 60 |

### 2.4 Colisiones pre-migración

| Chequeo | Resultado |
|---------|-----------|
| SKU duplicados | Ninguno |
| Barcode duplicados | Ninguno |
| Nombres de categoría duplicados (activos) | Ninguno |
| Discrepancias de esquema vs Prisma | Resueltas vía migración versionada |

Sin colisiones bloqueantes → se continuó.

---

## 3. Etapa 2 — Migración aplicada

### 3.1 Artefactos

| Artefacto | Ruta |
|-----------|------|
| Schema Prisma | `backend/prisma/schema.prisma` |
| SQL versionado | `backend/prisma/migrations/20261116184500_hybrid_catalog/migration.sql` |
| Baseline local previa | `backend/prisma/migrations/20261116153000_init_local/migration.sql` |

Comando (solo contenedor local):

```bash
docker exec -i "supertienda-backend" sh -c 'cd /app && npx prisma migrate deploy'
npx prisma generate
```

`prisma migrate status` → **Database schema is up to date!** (2 migraciones).

### 3.2 Cambios Prisma

- Enums `ProductVisibility` / `CategoryVisibility`: `PLATFORM_SHARED` | `BUSINESS_PRIVATE`
- `Product.businessId Int?`, `Product.visibility` default **`PLATFORM_SHARED`**
- `Category.businessId Int?`, `Category.visibility` default **`PLATFORM_SHARED`**
- Relaciones `Business.products` / `Business.categories`
- Índices `@@index([businessId, visibility])` y `@@index([visibility])`
- Eliminados `@unique` globales de `sku`, `barcode` y `Category.name` (reemplazados por índices parciales en SQL)

> Nota vs P2-A: el diseño proponía default `BUSINESS_PRIVATE`; la autorización D1 y el backfill usan default/shared `PLATFORM_SHARED` para no reclasificar datos existentes.

### 3.3 SQL (resumen)

1. Crear enums  
2. Drop uniques globales (`products_sku_key`, `products_barcode_key`, `categories_name_key`)  
3. Add columns `business_id`, `visibility`  
4. Backfill explícito: todo → `PLATFORM_SHARED` + `business_id NULL`  
5. FKs a `businesses`  
6. Índices de visibilidad  
7. Índices únicos parciales por ámbito  
8. CHECK `*_visibility_owner_chk`

**No** se reescribieron FKs históricas ni se tocó `business_products`.

### 3.4 Índices únicos parciales

| Índice | Definición |
|--------|------------|
| `categories_platform_name_uq` | `(name) WHERE business_id IS NULL AND deleted_at IS NULL` |
| `categories_private_name_uq` | `(business_id, name) WHERE business_id IS NOT NULL AND deleted_at IS NULL` |
| `products_shared_sku_uq` | `(sku) WHERE visibility = PLATFORM_SHARED AND sku IS NOT NULL AND deleted_at IS NULL` |
| `products_shared_barcode_uq` | `(barcode) WHERE visibility = PLATFORM_SHARED AND barcode IS NOT NULL AND deleted_at IS NULL` |
| `products_private_sku_uq` | `(business_id, sku) WHERE visibility = BUSINESS_PRIVATE AND sku IS NOT NULL AND deleted_at IS NULL` |
| `products_private_barcode_uq` | `(business_id, barcode) WHERE visibility = BUSINESS_PRIVATE AND barcode IS NOT NULL AND deleted_at IS NULL` |

### 3.5 CHECK constraints

```sql
products_visibility_owner_chk
categories_visibility_owner_chk
-- (PLATFORM_SHARED ∧ business_id IS NULL) ∨ (BUSINESS_PRIVATE ∧ business_id IS NOT NULL)
```

---

## 4. Etapa 3 — Integridad post-migración

| Verificación | Resultado |
|--------------|-----------|
| Conteos Product / Category / BP | 3 / 2 / 4 (idénticos al baseline efectivo) |
| IDs Product | `[1, 2, 3]` preservados |
| IDs Category | `[1, 2]` preservados |
| BP price/stock | Snapshot idéntico (`1:8.50:100,…,4:7.00:60`) |
| Ownership inconsistente | 0 filas |
| Visibilidad backfill | 100% `PLATFORM_SHARED` / `business_id NULL` |
| Orphan FKs (sale/purchase/inventory/BP→product) | 0 (tablas históricas vacías en demo; BP intacto) |
| CHECKs presentes | 2 |
| Índices parciales presentes | 6 (+ 4 de visibilidad) |
| `prisma migrate status` | up to date |

### 4.1 Compatibilidad de consultas

Tras quitar uniques globales, se ajustó código de compatibilidad (sin API privada):

| Cambio | Motivo |
|--------|--------|
| `ProductRepository.findBySku/Barcode` → `findFirst` + filtro BP | `sku`/`barcode` ya no son `WhereUnique` |
| `CategoryRepository` mapea `businessId`/`visibility` | `CategoryResponse extends Category` |
| `PlatformCatalogService` unicidad acotada a `PLATFORM_SHARED` | Respeta D2 (mismo código entre ámbitos) |
| Creates plataforma fijan `visibility=PLATFORM_SHARED`, `businessId=null` | Coherencia CHECK |

`npx tsc --noEmit` → OK.

---

## 5. Etapa 4 — Pruebas

### 5.1 Nuevas: `npm run test:p2b:integrity`

Archivo: `backend/tests/run-p2b-integrity.ts`

| Caso | Resultado |
|------|-----------|
| Shared con `businessId` no nulo → rechazado (CHECK) | PASS |
| Private sin `businessId` → rechazado (CHECK) | PASS |
| SKU duplicado misma empresa privada → rechazado | PASS |
| SKU igual entre dos empresas privadas → permitido | PASS |
| Categoría shared duplicada → rechazada | PASS |
| BusinessProduct aislamiento A/B | PASS |
| Mutaciones tenant maestro → 403 | PASS |
| PLATFORM_ADMIN opera en `/platform/*` | PASS |
| BP precios/stocks seed intactos | PASS |

**9 passed, 0 failed.** Datos temporales limpiados al final.

### 5.2 Regresiones

| Suite | Resultado |
|-------|-----------|
| `test:p0` | 14 passed |
| `test:p1d:http` | 12 passed |
| `test:p1f:http` | 15 passed |
| `test:p1g:http` | 10 passed |
| `test:p1h:http` | 10 passed |

Reejecutadas tras los ajustes de compatibilidad → verdes.

---

## 6. Riesgos residuales

1. **Ambigüedad barcode/SKU (D2):** búsquedas futuras deben detectar colisiones shared↔private; `findByBarcode` hoy filtra por BP del tenant (seguro para POS actual).  
2. **Índices parciales no modelados en Prisma:** viven solo en SQL; un `db push` los perdería — no usar `db push`.  
3. **Default Prisma `PLATFORM_SHARED`:** distinto del boceto P2-A (`BUSINESS_PRIVATE`); correcto para D1, documentar en P2-C.  
4. **Categorías soft-deleted históricas** (p.ej. residuos P1-E) pueden permanecer; no afectan uniques activos (`deleted_at IS NULL`).  
5. **Sin API privada:** empresas aún no pueden crear `BUSINESS_PRIVATE` (D7/D8 pendientes en P2-C).  
6. **Suites P1-H** crean filas temporales `P1H-*`; conviene limpiarlas tras regresiones en entornos demos.

---

## 7. Plan de rollback (solo Docker local)

**Opción A — Restaurar dump (preferida):**

```bash
# Detener writers; restaurar en el contenedor db local
docker exec -i "supertienda-db" psql -U "supertienda" -d "supertienda_dev" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
Get-Content docs/backups/p2b_pre_migration_20261116_144403.sql | docker exec -i "supertienda-db" psql -U "supertienda" -d "supertienda_dev"
# Revertir schema.prisma al commit previo y regenerar client
```

**Opción B — Migración down manual:** no hay down automático. Requeriría drop de CHECKs/índices/columnas/enums en orden inverso y restaurar uniques globales — riesgoso si ya existen filas privadas.

**Prohibido en rollback:** `migrate reset` sobre volúmenes productivos, bases remotas, force-push.

---

## 8. Preparación para P2-C

P2-C puede asumir schema híbrido listo. Pendiente de autorización:

1. `POST /products/private` (D8) — solo `ADMIN` empresarial (D7)  
2. Validar categoría: shared o private del mismo `businessId`  
3. Crear `BusinessProduct` al crear privado (precio/stock explícitos)  
4. Detección de ambigüedad barcode en búsqueda  
5. Protección adicional categorías shared vinculadas (D6) en mutaciones plataforma  
6. No adoptar productos todavía salvo autorización explícita  
7. Mantener mutaciones tenant legacy `/products` en 403 hasta cutover controlado

---

## 9. Entregables tocados

| Path | Rol |
|------|-----|
| `backend/prisma/schema.prisma` | Modelo híbrido |
| `backend/prisma/migrations/20261116184500_hybrid_catalog/migration.sql` | DDL + backfill |
| `backend/src/repositories/ProductRepository.ts` | Compatibilidad findBySku/Barcode |
| `backend/src/repositories/CategoryRepository.ts` | Mapeo visibility |
| `backend/src/services/PlatformCatalogService.ts` | Unicidad por ámbito shared |
| `backend/tests/run-p2b-integrity.ts` | Pruebas constraint/integridad |
| `backend/package.json` | Script `test:p2b:integrity` |
| `docs/backups/p2b_pre_migration_*.sql` | Backup pre-migración |
| `docs/P2B_HYBRID_MIGRATION_REPORT.md` | Este informe |

---

## 10. Criterio de cierre P2-B

| Criterio | Estado |
|----------|--------|
| Backup verificado | Cumple |
| Migración aplicada solo local | Cumple |
| Backfill D1 | Cumple |
| Integridad counts/IDs/BP | Cumple |
| Constraints + índices | Cumple |
| Regresiones + integrity tests | Cumple |
| Sin API privada / frontend / commit | Cumple |

**P2-B cerrado.** Listo para solicitar autorización de P2-C.
