# P2-C1.B1 — Recovery B Execution Report

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** AGENT — recreación autorizada de `supertienda_dev`  
**Estado:** **COMPLETADA**  
**Veredicto B2:** **GO** (con deuda TypeScript legacy documentada)

---

## 0. Resumen

| Paso | Resultado |
|------|-----------|
| DROP/CREATE `supertienda_dev` | OK |
| `pg_restore` dump pre-fallo | OK (exit 0) |
| Leftovers B1 ausentes | OK |
| `migrate deploy` SQL corregido | OK |
| Prisma validate/generate/status | OK (4 migraciones) |
| postcheck.sql | OK |
| Regresiones sync/catálogo/offline | PASS |
| Backend TS (`tsc`) | FAIL — deuda legacy (deviceId / productName) |
| Frontend TS + offline | PASS |
| App local 3000/5000 | Operativa |

---

## 1. Identidad del contenedor y base

| Campo | Valor |
|-------|-------|
| Proyecto | `C:\Proyectos\supertiendaweb` |
| Contenedor DB | `supertienda-db` (healthy) |
| Contenedor backend | `supertienda-backend` |
| Contenedor frontend | `supertienda-frontend` |
| Admin session | `psql` → database `postgres`, user `supertienda` |
| Base afectada | **solo** `supertienda_dev` |
| Puerto PG al host | no publicado |
| `DATABASE_URL` | `postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev` |

Volumen Docker: **no** borrado ni recreado.

---

## 2. Verificación previa del dump

| Check | Resultado |
|-------|-----------|
| Path | `backups/local/supertienda_dev_pre_p2c1b1_20261116_173531.dump` |
| Tamaño | **120141** bytes |
| Formato | custom / gzip / TOC 307 |
| `dbname` | `supertienda_dev` |
| `_prisma_migrations` en TOC | sí |
| Migración B1 en dump | no |

---

## 3. Hash SQL corregido

| Archivo | SHA-256 |
|---------|---------|
| `prisma/migrations/20261116220000_p2c1b01_pos_cash/migration.sql` | `82C0D32100F82F9057C2C536C79F4A1B44819012E3648814BBE3667400419EB1` |
| `migrations_proposals/.../migration.sql` | idéntico |
| Visible en contenedor | `82c0d321…0419eb1` |
| UPDATE `sale_items` (product_id en WHERE) | sí |
| BEGIN/COMMIT internos | no |

---

## 4. Resultado DROP DATABASE

```text
DROP DATABASE supertienda_dev;  -- vía psql -d postgres
DROP_EXIT=0
SELECT datname … WHERE datname='supertienda_dev' → 0 filas
```

Sesiones a `supertienda_dev` terminadas antes (0 activas).  
No se usó `FORCE`. No se tocó `postgres` / `template0` / `template1`.

---

## 5. Resultado CREATE DATABASE

```text
CREATE DATABASE supertienda_dev OWNER supertienda;
CREATE_EXIT=0
owner=supertienda
user_tables (public)=0
```

---

## 6. Resultado pg_restore

```text
pg_restore -U supertienda -d supertienda_dev \
  --exit-on-error --single-transaction --no-owner --no-acl \
  /tmp/supertienda_dev_pre_p2c1b1.dump
RESTORE_EXIT=0
```

Log: `backups/local/pg_restore_recovery_b_20261116_180633.log` (sin errores).

---

## 7. Historial Prisma restaurado (pre-migrate)

| migration_name | finished |
|----------------|----------|
| `20261116153000_init_local` | true |
| `20261116184500_hybrid_catalog` | true |
| `20261116191000_sync_foundation` | true |

Sin fila failed B1.

---

## 8. Ausencia de leftovers B1 (post-restore, pre-migrate)

Todos **ABSENT**: `cash_movements`, `business_document_sequences`, `CashMovementType`, `SALE_CREATE`, columnas `commercial_number` / `document_kind` / `is_fiscal` / `device_id`, CHECKs/índices B1.

Estado pre-B1: `cart_id`/`invoice_number` NOT NULL; `sales_invoice_number_key` PRESENT.

Datos restaurados: 2 businesses, 4 users, 16 products, 13 BP, 0 sales, 0 cajas.

---

## 9. Resultado migrate deploy

```text
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev \
  supertienda-backend npx prisma migrate deploy
```

```text
Applying migration `20261116220000_p2c1b01_pos_cash`
All migrations have been successfully applied.
DEPLOY_EXIT=0
```

---

## 10. Prisma validate / generate / status

| Comando | Exit | Nota |
|---------|------|------|
| `prisma validate` | 0 | schema valid |
| `prisma generate` | 0 | Client → `./generated` |
| `prisma migrate status` | 0 | “Database schema is up to date!” |

Historial final (4 finished):

| migration_name | finished | steps |
|----------------|----------|-------|
| init_local | true | 1 |
| hybrid_catalog | true | 1 |
| sync_foundation | true | 1 |
| **p2c1b01_pos_cash** | **true** | **1** |

---

## 11. Resultado postcheck

| check | value |
|-------|-------|
| seq_covers_businesses | yes |
| commercial_uq_partial | yes |
| invoice_uq_partial | yes |
| invoice_global_uq_gone | gone |
| historical_invoice_intact | 0 |
| historical_commercial_null | 0 |
| contradictory_flags | 0 |
| sale_items_missing_name | 0 |
| cash_device_null | 0 |
| cash_open_partial_uq | yes |
| enum_sale_create | yes |
| opening_movements | 0 |

Extras: `SALE_COMPLETE` conservado; `SALE_CREATE` al final del enum; sequences=2; sales/cash/cash_movements=0; BP 1–4 y 118/200 presentes; `fiscal_settings` count=0 (sin filas en dump — intacto/vacío).

---

## 12. Pruebas de regresión

| Suite | Cómo | Resultado |
|-------|------|-----------|
| Backend `tsc --noEmit` | Docker | **FAIL** (ver §14) |
| Frontend `tsc --noEmit` | Host | **PASS** |
| `test:p2b:integrity` | Host (usa docker exec) | **PASS** 9/9 |
| `test:p2c01:http` | Host | **PASS** 25/25 |
| `test:p2ca:pull` | Host | **PASS** 12/12 |
| `test:p2cb:http` | Host | **PASS** 16/16 |
| `test:offline` (frontend) | Host | **PASS** 33/33 |
| Seed DEMO | — | **SKIP** (prohibido en esta fase) |

Nota: suites sync/integrity deben correrse desde el **host** (invocan `docker exec`); dentro del contenedor backend falla `docker: not found` (SKIP/FAIL ambiental, no de datos).

---

## 13. Estado frontend / backend

| Servicio | Estado |
|----------|--------|
| `supertienda-db` | Up healthy, puerto no publicado |
| `supertienda-backend` | healthy; `GET http://127.0.0.1:5000/health` → 200 |
| `supertienda-frontend` | Up; `http://127.0.0.1:3000` → 200 |
| `DATABASE_URL` | `…@db:5432/supertienda_dev` (sin IP remota) |

---

## 14. Errores pendientes (no bloquean schema)

`npm run type-check` (backend) falla por Prisma Client regenerado con campos nuevos **requeridos**:

| Origen | Causa |
|--------|-------|
| `cashRegisterController.ts` / `cashRegisterService.ts` | `CashRegister.deviceId` NOT NULL; unique ya no es solo `registerNumber` → exige `businessId_registerNumber` / `deviceId` en create |
| `saleItemService.ts` / `saleService.ts` | `SaleItem.productName` NOT NULL en create |

**No** se implementaron handlers `SALE_CREATE` / `CASH_OPEN` / `CASH_CLOSE` en esta recovery.  
Reparación de compiles legacy → alcance **P2-C1.B2** (o hotfix mínimo autorizado aparte).

Runtime actual: backend arranca (dev usa transpile); suites HTTP sync pasan.

---

## 15. Veredicto GO / NO-GO para P2-C1.B2

### **GO**

Criterios críticos de recovery cumplidos:

- Base local recreada correctamente  
- Respaldo restaurado sin errores  
- Migración B1 aplicada  
- Prisma sincronizado (4 migraciones, client generado)  
- Postcheck aprobado  
- Sin leftovers / inconsistencias de schema  
- Aplicación local operativa (3000/5000)

**Pendiente no bloqueante para iniciar B2:** alinear servicios legacy de venta/caja con el nuevo schema (o reemplazarlos por handlers sync).

---

## 16. Prohibiciones respetadas

Sin producción, sin otras DBs, sin volume wipe, sin `migrate reset` / `db push` / `migrate resolve`, sin seed DEMO, sin commit/push/deploy, sin implementación POS/caja nueva.

---

**Fin Recovery B.** Detenido. Revisar este informe antes de P2-C1.B2.
