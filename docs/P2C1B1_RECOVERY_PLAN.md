# P2-C1.B1 — Recovery Plan (desbloqueo desarrollo)

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** AGENT — corrección SQL + plan; **restore/migrate NO ejecutados**  
**Estado:** **ESPERANDO AUTORIZACIÓN EXPLÍCITA** para recuperación destructiva de `supertienda_dev`

---

## 0. Veredicto de esta corrida

| Ítem | Estado |
|------|--------|
| Fase 1 seguridad | **PASS** |
| Fase 2 corrección SQL | **HECHA** (archivos en disco) |
| Validación UPDATE (ROLLBACK) | **PASS** |
| Restore / migrate deploy | **NO EJECUTADO** — requiere OK explícito |
| Seed DEMO | **Diseñado** — no insertado |
| P2-C1.B2 | **Bloqueado** hasta recovery exitoso |

---

## 1. Fase 1 — Seguridad (evidencia)

| Check | Resultado |
|-------|-----------|
| Proyecto | `C:\Proyectos\supertiendaweb` |
| Contenedor DB | `supertienda-db` healthy |
| Contenedor backend | `supertienda-backend` healthy |
| `DATABASE_URL` | `postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev` |
| Puerto PG al host | **no publicado** (`5432/tcp` → null) |
| `current_database()` | `supertienda_dev` |
| Prisma CLI host | no usado |

---

## 2. Fase 2 — Corrección SQL

### 2.1 Causa del fallo (recordatorio)

```text
ERROR: invalid reference to FROM-clause entry for table "si"
```

El alias del **target** de `UPDATE` no puede aparecer en el `JOIN ON` del `FROM` en PostgreSQL.

### 2.2 Cambios aplicados en `migration.sql`

Archivos sincronizados (mismo SHA-256):

- `backend/prisma/migrations/20261116220000_p2c1b01_pos_cash/migration.sql`
- `backend/prisma/migrations_proposals/20261116_p2c1b0_pos_cash/migration.sql`

**SHA-256:** `82C0D32100F82F9057C2C536C79F4A1B44819012E3648814BBE3667400419EB1`

| Cambio | Detalle |
|--------|---------|
| Fix `UPDATE sale_items` | `bp."product_id" = si."product_id"` movido al `WHERE` |
| Sin `BEGIN`/`COMMIT` internos | Evita commit parcial bajo `migrate deploy` de Prisma |
| Conservado | `commercial_number` ≠ `invoice_number`, CHECKs, uniques parciales, sequences, `SALE_CREATE`, sin FiscalSettings |

Fragmento corregido:

```sql
UPDATE "sale_items" si
SET "business_product_id" = bp."id"
FROM "sales" s
JOIN "business_products" bp
  ON bp."business_id" = s."business_id"
 AND bp."deleted_at" IS NULL
WHERE si."sale_id" = s."id"
  AND bp."product_id" = si."product_id"
  AND si."business_product_id" IS NULL;
```

### 2.3 Validación previa (sin persistir)

Script: `migrations_proposals/.../_validate_update_rollback.sql`

```text
BEGIN → UPDATE corregido → check passed → ROLLBACK
```

Resultado: `update_sale_items_bp_ok | passed`. Sin COMMIT de trabajo.

**No** se reejecutó diagnóstico con COMMIT (lección B1).

### 2.4 Contingencia `ALTER TYPE`

En PG 16, `ADD VALUE` dentro de la tx de Prisma suele funcionar. Si el deploy fallara solo por el enum:

- Opción A: añadir `-- prisma:disable-transaction` al inicio del SQL (**nueva autorización**).  
- Opción B: migración enum separada (**nueva autorización**).

No anticipar ese cambio ahora.

---

## 3. Estado actual de la base (pre-recovery)

| Objeto | Estado |
|--------|--------|
| DDL parcial POS/caja | **Presente** (colateral del diagnóstico B1) |
| `_prisma_migrations` fila `20261116220000_p2c1b01_pos_cash` | **failed** (`finished_at` NULL, steps 0) |
| Migraciones 1–3 | finished OK |
| sales / cash_registers | 0 / 0 |
| BP 118/200 | presentes (ejemplos descartables) |

Este estado es **inconsistente** (DDL parcial ≠ registro Prisma). Recovery preferida = restore del dump pre-fallo.

---

## 4. Fase 3 — Plan de restauración (NO EJECUTADO)

### 4.1 Dump verificado

| Campo | Valor |
|-------|-------|
| Path | `backups/local/supertienda_dev_pre_p2c1b1_20261116_173531.dump` |
| Tamaño | 120 141 bytes |
| `dbname` en TOC | `supertienda_dev` |
| Origen | PG 16.14, format custom, TOC 307 |
| Contenido esperado | 3 migraciones Prisma OK; **sin** POS/caja B1; datos demo previos |

### 4.2 Qué reemplaza el restore

`pg_restore --clean --if-exists` sobre `supertienda_dev`:

- **Elimina/recrea** objetos del dump (schemas de app, datos de ejemplo, `_prisma_migrations` del dump).  
- **Descarta** DDL parcial actual (`cash_movements`, columnas nuevas, etc.).  
- **Descarta** fila failed de la migración B1.  
- **No** borra el volumen Docker `pgdata_dev` entero.  
- **No** es `migrate reset`.

Datos comerciales ficticios actuales: **descartables** por decisión de negocio (ya autorizada a nivel de intención).  
La **ejecución** del restore sigue requiriendo confirmación explícita (ver §7).

### 4.3 Procedimiento exacto (a ejecutar solo tras OK)

```powershell
# 0) Precondiciones
# - Contenedores: supertienda-db, dump verificado, SQL corregido en prisma/migrations/

# 1) Cortar conexiones de app (evita locks)
docker stop supertienda-frontend supertienda-backend

# 2) Terminar sesiones abiertas a la DB (excepto la propia)
docker exec -i supertienda-db psql -U supertienda -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'supertienda_dev' AND pid <> pg_backend_pid();
"

# 3) Copiar dump al contenedor
docker cp "c:\Proyectos\supertiendaweb\backups\local\supertienda_dev_pre_p2c1b1_20261116_173531.dump" `
  "supertienda-db:/tmp/supertienda_dev_pre_p2c1b1.dump"

# 4) Restore destructivo de contenidos (NO drop database / NO wipe volume)
docker exec -i supertienda-db pg_restore `
  -U supertienda -d supertienda_dev `
  --clean --if-exists --no-owner --no-acl `
  /tmp/supertienda_dev_pre_p2c1b1.dump

# 5) Verificar historial Prisma = solo 3 migraciones finished
docker exec -i supertienda-db psql -U supertienda -d supertienda_dev -c "
SELECT migration_name, finished_at IS NOT NULL AS finished, applied_steps_count
FROM _prisma_migrations ORDER BY started_at;
SELECT to_regclass('public.cash_movements') AS cash_movements,
       to_regclass('public.business_document_sequences') AS sequences;
"

# Esperado: 3 filas finished; cash_movements/sequences NULL
```

### 4.4 Uso de `migrate resolve`

**No previsto** si el restore elimina la fila failed (dump anterior al fallo).

Solo si tras restore quedara basura en `_prisma_migrations`: justificar y pedir autorización para `migrate resolve --rolled-back` **dentro de Docker**. Por defecto: **evitar**.

### 4.5 Prohibido en recovery

- `docker volume rm` / recrear `pgdata_dev`
- `prisma migrate reset`
- `db push`
- Prisma CLI en host
- Restore a otra DB / IP remota
- Commit / push / deploy app

---

## 5. Fase 4 — Migración post-restore (NO EJECUTADA)

Secuencia prevista **después** de restore verificado:

```powershell
# A) Arrancar backend (frontend opcional después)
docker start supertienda-backend
# esperar healthy

# B) Confirmar SQL corregido visible + hash
docker exec -w /app supertienda-backend sha256sum prisma/migrations/20261116220000_p2c1b01_pos_cash/migration.sql

# C) migrate deploy SOLO Docker
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev `
  supertienda-backend npx prisma migrate deploy

# D) validate + generate
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev `
  supertienda-backend npx prisma validate
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev `
  supertienda-backend npx prisma generate

# E) postcheck
docker cp "c:\Proyectos\supertiendaweb\backend\prisma\migrations_proposals\20261116_p2c1b0_pos_cash\postcheck.sql" `
  supertienda-db:/tmp/postcheck.sql
docker exec -i supertienda-db psql -U supertienda -d supertienda_dev -v ON_ERROR_STOP=1 -f /tmp/postcheck.sql

# F) TypeScript backend
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev `
  supertienda-backend npm run type-check

# G) Regresiones (Docker)
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev `
  -e SEED_CONFIRM_LOCAL=0 `
  particular 2>$null
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev `
  supertienda-backend npm run test:p2b:integrity
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev `
  -e JWT_SECRET=dev-only-change-me-not-for-production `
  -e JWT_EXPIRES_IN=1d `
  -e NODE_ENV=development `
  -e PORT=5000 `
  -e HOST=0.0.0.0 `
  -e CORS_ORIGIN=http://127.0.0.1:3000 `
  -e LOG_LEVEL=info `
  -e SEED_CONFIRM_LOCAL=1 `
  -e SEED_DEV_PASSWORD=DevPass123! `
  particular 2>$null
# Ejecutar suites sync/catalog según scripts package.json (p2c01, p2ca, p2cb) cuando el backend esté up
```

`schema.prisma` ya contiene el modelo B0.1; tras generate, si `type-check` falla por `SaleItem.productName` requerido en creates legacy, aplicar **fix mínimo de compilación** (no handlers SALE_CREATE) solo con autorización si aparece.

Ante cualquier error: **detenerse**, conservar logs, no resolve/restore automático.

---

## 6. Fase 5 — Diseño seed DEMO (no ejecutado)

Separar del seed técnico actual (`backend/prisma/seed.ts` P1-B, pequeño/idempotente).

### 6.1 Artefacto propuesto

| Archivo | Rol |
|---------|-----|
| `backend/prisma/seed.ts` | Técnico / mínimo (roles, permisos, smoke) — conservar |
| `backend/prisma/seed.demo.ts` (**nuevo**) | Catálogo DEMO grande — solo Docker local |
| npm script | `db:seed:demo` → `ts-node --transpile-only prisma/seed.demo.ts` |

### 6.2 Guardrails (igual espíritu que seed técnico)

- `SEED_CONFIRM_LOCAL=1`
- `DATABASE_URL` debe contener `supertienda_dev` + host `db` / localhost
- Abortar si `NODE_ENV=production` o IP remota
- Idempotente por NIT / username / SKU estables (`DEMO-*`)
- **No** insertar `sales`, `sale_items`, `cash_registers`, `cash_movements` hasta handlers C1.B2 validados

### 6.3 Escenario de datos

| Entidad | Cantidad / regla |
|----------|------------------|
| Empresas | 3 (`DEMO-NIT-001..003`) |
| Categorías | ~8–12 comerciales (Abarrotes, Bebidas, Limpieza, …) por empresa o compartidas según visibility |
| Productos | 150 (`DEMO-SKU-001..150`) — mix shared + private |
| BusinessProduct | Precio distinto por empresa (`customPrice`); stock inicial > 0 |
| Usuarios | Por empresa: 1 `ADMIN` + 1–2 `EMPLOYEE` (`demo.admin.N` / `demo.emp.N`) |
| Devices | Constantes string `demo-device-N-a`, `demo-device-N-b` documentadas para tests caja |
| Cajas / ventas / movimientos | **Omitidos** en v1 del seed DEMO |

### 6.4 Orden de ejecución post-recovery

1. Recovery + migrate + generate + postcheck OK.  
2. (Opcional) `seed.ts` técnico si el dump no trae roles.  
3. `seed.demo.ts` con confirmación local.  
4. Luego P2-C1.B2 (handlers), **después** seed de cajas/ventas si aplica.

---

## 7. Operaciones que requieren autorización explícita

| # | Operación | Estado |
|---|-----------|--------|
| 1 | `docker stop` frontend/backend + `pg_restore --clean` del dump | **PENDIENTE OK usuario** |
| 2 | `prisma migrate deploy` de SQL corregido | Tras #1 verificado |
| 3 | `prisma generate` + postcheck + tsc + regresiones | Tras #2 OK |
| 4 | Crear/ejecutar `seed.demo.ts` | Tras #3 OK (pedido aparte o mismo batch) |
| 5 | `migrate resolve` | Solo si restore deja inconsistencia — pedir OK puntual |
| 6 | `-- prisma:disable-transaction` | Solo si ADD VALUE falla |

**Esta corrida NO ejecuta #1–#6.**

---

## 8. Pruebas previstas post-recovery

| Prueba | Criterio |
|--------|----------|
| Historial Prisma | 4 migraciones finished (incl. `20261116220000_p2c1b01_pos_cash`) |
| `postcheck.sql` | sequences=2→N empresas; uniques parciales; enum SALE_CREATE; flags OK |
| `prisma validate` / `generate` | OK |
| `npm run type-check` | OK (o fixes mínimos autorizados) |
| `test:p2b:integrity` | PASS |
| Sync P2-C0.1 / C.A / C.B | PASS o documentar skip justificado |
| Frontend tsc | PASS o documentar |
| Sin ventas/cajas fantasma | counts = 0 hasta seed/handlers |

---

## 9. Próximo paso P2-C1.B2

Solo cuando B1 recovery + migrate + postcheck + client estén verdes:

- Handlers canónicos `SALE_CREATE`, `CASH_OPEN`, `CASH_CLOSE`
- Asignación concurrente `commercial_number` vía `business_document_sequences`
- Enforcement caja OPEN por `(business, user, deviceId)`
- MVP CASH; sin oversell; sin SIAT

---

## 10. Mensaje de autorización solicitado

Para continuar, responder de forma explícita, por ejemplo:

> **Autorizo restore con `pg_restore --clean --if-exists` del dump `supertienda_dev_pre_p2c1b1_20261116_173531.dump` sobre Docker local `supertienda_dev`, descartando datos de ejemplo y DDL parcial, y autorizo a continuación `migrate deploy` + generate + postcheck + type-check en contenedores SuperTienda.**

Sin ese OK: **no** se toca la base.

---

**Fin recovery plan.** Detenido en gate de autorización.
