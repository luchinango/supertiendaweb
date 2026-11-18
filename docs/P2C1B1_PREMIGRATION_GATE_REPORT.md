# P2-C1.B1 — Premigration Gate Report (Docker local)

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** AGENT — auditoría + precheck + respaldo  
**Estado:** **GO condicionado** — **NO se ejecutó `migrate deploy`**  
**Autorización pendiente:** confirmación explícita del usuario para DDL solo en Docker local

---

## 0. Veredicto

| Ítem | Resultado |
|------|-----------|
| Fase 0 seguridad | **PASS** |
| Fase 1 revisión SQL | **PASS** (con riesgos documentados, no bloqueantes en este dataset) |
| Fase 2 precheck lectura | **PASS** |
| Fase 3 respaldo | **PASS** |
| `migrate deploy` | **NO EJECUTADO** — esperar OK explícito |
| Decisión gate | **GO** para aplicar en Docker local tras autorización |

---

## 1. Fase 0 — Seguridad

### 1.1 Contenedores

| Contenedor | Imagen / rol | Estado | Puertos |
|------------|--------------|--------|---------|
| `supertienda-db` | `postgres:16-alpine` | Up (healthy) | `5432/tcp` **sin publicar al host** |
| `supertienda-backend` | `supertienda-dev-backend` | Up (healthy) | `127.0.0.1:5000` |
| `supertienda-frontend` | `supertienda-dev-frontend` | Up | `127.0.0.1:3000` |

Compose: `compose.yaml` (`name: supertienda-dev`), red `supertienda-dev_supertienda_net`.

### 1.2 Conexión PostgreSQL (contenedor backend)

```text
DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev
host=db  port=5432  db=supertienda_dev  isRemoteIP=false
```

Evidencia adicional:

- `POSTGRES_DB=supertienda_dev` en `supertienda-db`
- `current_database() = supertienda_dev`
- PostgreSQL **16.14** (Alpine)
- Puerto DB **no** mapeado al host (`Ports={"5432/tcp":null}`)
- No se usó `backend/.env` del host para estas comprobaciones
- Prisma CLI **no** se ejecutó desde Windows/host
- No se modificaron volúmenes ni filas de prueba

**Conclusión Fase 0:** conexión = Docker local `db:5432/supertienda_dev`. Sin indicios de IP remota de aplicación.

> Nota: existen contenedores Supabase de otro proyecto en el mismo Docker Desktop; **no** se usaron. Target exclusivo: `supertienda-db` / `supertienda-backend`.

---

## 2. Fase 1 — Revisión SQL real

Fuente auditada (íntegra):

`backend/prisma/migrations_proposals/20261116_p2c1b0_pos_cash/`

| Archivo | Revisado |
|---------|----------|
| `migration.sql` | Sí |
| `rollback.sql` | Sí |
| `precheck.sql` | Sí |
| `postcheck.sql` | Sí |
| `schema.prisma.snippet.md` | Sí |
| `README.md` | Sí |

### 2.1 Checklist de diseño B0.1

| Requisito | Evidencia en `migration.sql` | OK |
|-----------|------------------------------|----|
| `commercial_number` separado | `ADD COLUMN commercial_number`; unique parcial | Sí |
| `invoice_number` histórico intacto | Solo `DROP NOT NULL` + replace unique; **sin** UPDATE que copie a commercial | Sí |
| Unique parcial comercial | `sales_business_commercial_number_uq` WHERE NOT NULL | Sí |
| Unique parcial invoice por empresa | Drop `sales_invoice_number_key`; create `sales_business_invoice_number_uq` | Sí |
| CHECKs `document_kind` / `is_fiscal` | `sales_document_flags_chk` + `sales_no_fiscal_commercial_mix_chk` | Sí |
| Backfill no convierte facturas en tickets | UPDATE solo flags LEGACY; `commercial_number` queda NULL | Sí |
| `cart_id` nullable | `ALTER ... cart_id DROP NOT NULL` | Sí |
| `device_id` en caja | ADD + backfill `legacy-unknown` + NOT NULL | Sí |
| Índice parcial OPEN | `cash_registers_open_per_device_uq` WHERE OPEN | Sí |
| Snapshots SaleItem | `product_name`, `sku`, `business_product_id` + FK SET NULL | Sí |
| `cash_movements` | Tabla + enum; backfill OPENING | Sí |
| `business_document_sequences` | Tabla + seed COMMERCIAL_TICKET por empresa | Sí |
| Enum `SALE_CREATE` | `ALTER TYPE ... ADD VALUE IF NOT EXISTS` **fuera** de `BEGIN` | Sí |
| `SALE_COMPLETE` conservado | No se elimina del enum | Sí |
| Sin DELETE de negocios/BP/ventas | Solo DDL + INSERT secuencias/OPENING + UPDATE flags/snapshots | Sí |

### 2.2 Compatibilidad Prisma (`schema.prisma` actual vs SQL)

El SQL **no** está aún en `prisma/migrations/` ni mergeado a `schema.prisma`. Drift esperado **hoy**:

| Prisma actual | Tras SQL propuesto |
|---------------|--------------------|
| `Sale.cartId Int` required + `@unique` | `cart_id` nullable |
| `Sale.invoiceNumber String @unique` | nullable + unique parcial por business |
| Sin `commercialNumber` / flags / device | Columnas nuevas |
| `SyncOperationType` sin `SALE_CREATE` | Enum + valor nuevo |
| Sin models sequence / cash_movements | Tablas nuevas |
| `CashRegister.registerNumber @unique` global | Unique por `(business_id, register_number)` |

**Riesgo operativo (no bloquea DDL en dataset vacío):** tras `migrate deploy`, el runtime Prisma del backend **seguirá desalineado** hasta actualizar `schema.prisma` + `prisma generate` (dentro de Docker) en un paso autorizado posterior o el mismo batch.  
`migrate deploy` aplica SQL; **no** sincroniza el client.

### 2.3 Operaciones “destructivas” justificadas

| Operación | Justificación |
|-----------|---------------|
| `DROP INDEX sales_invoice_number_key` | Sustituido por unique parcial por empresa |
| `DROP INDEX cash_registers_register_number_key` | Sustituido por unique por empresa |
| `DROP TABLE` solo en `rollback.sql` | No forma parte del forward path |

No hay `TRUNCATE` / `DELETE` de datos de negocio en forward.

### 2.4 Hallazgos SQL (no bloqueantes aquí)

1. **Colisión OPEN + `legacy-unknown`:** si un usuario tuviera ≥2 cajas OPEN, el unique parcial fallaría tras backfill. Dataset actual: **0** cajas OPEN → OK.  
2. **`product_name SET NOT NULL`:** fallaría con `sale_items` huérfanos de `products`. Dataset: **0** sale_items → OK.  
3. **Enum `SALE_CREATE`:** irreversible con rollback SQL best-effort → preferir restore del dump.  
4. **`sales_cart_id_key` se mantiene:** en PostgreSQL varios `NULL` en unique son legales.  
5. Relación Prisma `Sale.cart` hoy es obligatoria; el snippet ya propone `cartId Int?` — falta merge autorizado.

---

## 3. Fase 2 — Precheck (solo lectura)

Ejecutado vía `docker exec` → `psql` en `supertienda-db` (sin Prisma CLI host).

### 3.1 Bundle oficial `precheck.sql`

| check | value |
|-------|-------|
| sales_count | **0** |
| sales_with_invoice | **0** |
| sale_items_orphan_product | **0** |
| dup_invoice_global | **0** |
| cash_registers_count | **0** |
| cash_open_same_user_multi | **0** |
| businesses | **2** |
| fiscal_settings_untouched_note | do_not_increment_in_pos |
| enum_sale_complete | **yes** |

### 3.2 Conteos extendidos

| metric | value |
|--------|-------|
| users | 4 |
| products | 16 |
| business_products | 13 (6 active / 7 soft-deleted) |
| sale_items | 0 |
| carts | 0 |
| cash_open / cash_closed | 0 / 0 |
| enum_sale_create_already | **no** (esperado) |

### 3.3 Migraciones ya aplicadas

| migration_name | finished_at |
|----------------|-------------|
| `20261116153000_init_local` | 2026-11-16 15:33:53+00 |
| `20261116184500_hybrid_catalog` | 2026-11-16 18:44:49+00 |
| `20261116191000_sync_foundation` | 2026-11-16 19:05:28+00 |

**Propuesta POS/caja aún ABSENTE** (`business_document_sequences`, `cash_movements`, columnas `commercial_number` / `document_kind` / `device_id` → ABSENT).

### 3.4 Índices actuales relevantes

- `sales_invoice_number_key` UNIQUE global — a reemplazar  
- `sales_cart_id_key` UNIQUE  
- `cash_registers_register_number_key` UNIQUE global — a reemplazar  

### 3.5 FKs huérfanas

Todas **0** (sales/users/carts/cash/sale_items/products).

### 3.6 Integridad BP 1–4

| id | business_id | product_id | soft_deleted | product |
|----|-------------|------------|--------------|---------|
| 1 | 1 | 1 | false | Arroz 1kg (compartido) |
| 2 | 2 | 1 | false | Arroz 1kg (compartido) |
| 3 | 1 | 2 | false | Aceite Empresa A |
| 4 | 2 | 3 | false | Azúcar Empresa B |

### 3.7 Residuos BP 118 / 200 (solo lectura — **no modificados**)

| id | business_id | product_id | deleted_at |
|----|-------------|------------|------------|
| 118 | 1 | 170 | NULL |
| 200 | 1 | 264 | NULL |

### 3.8 Inconsistencias bloqueantes

**Ninguna** en el dataset local actual.

Evidencia guardada:

- `backups/local/supertienda_dev_pre_p2c1b1_20261116_173531.audit.txt`
- Script: `backend/prisma/migrations_proposals/20261116_p2c1b0_pos_cash/_b1_premigration_audit.sql`

---

## 4. Fase 3 — Respaldo

| Campo | Valor |
|-------|-------|
| Archivo | `backups/local/supertienda_dev_pre_p2c1b1_20261116_173531.dump` |
| Formato | `pg_dump -Fc` (custom, gzip) |
| Tamaño | **120 141 bytes** (≠ 0) |
| Origen | `supertienda_dev` @ PostgreSQL 16.14 |
| TOC | 307 entradas — inspeccionado con `pg_restore -l` (OK) |

### Restauración (procedimiento — **no ejecutado**)

Preferido ante fallo de migrate:

```bash
# Copiar dump al contenedor si hace falta, luego:
docker exec -i supertienda-db pg_restore \
  -U supertienda -d supertienda_dev \
  --clean --if-exists --no-owner \
  /tmp/supertienda_dev_pre_p2c1b1_20261116_173531.dump
```

Alternativa más gruesa: recrear volumen `pgdata_dev` **solo** con autorización explícita (más destructivo; no recomendado como primera opción).

**No** se borraron ni reemplazaron volúmenes en esta corrida.

---

## 5. Fase 4 — Punto de aprobación (STOP)

### 5.1 Resumen precheck

Dataset limpio de ventas/caja; 2 empresas; BP 1–4 íntegros; BP 118/200 presentes e intactos; sin duplicados ni huérfanos; propuesta aún no aplicada.

### 5.2 Resumen SQL a aplicar

1. `SALE_CREATE` en enum sync (fuera de tx)  
2. `business_document_sequences` + seed  
3. Sales: `cart_id`/`invoice_number` nullable; `commercial_number` + flags; uniques parciales; CHECKs  
4. SaleItem snapshots  
5. CashRegister `device_id`/`version`/client op + unique OPEN por device  
6. `cash_movements` + backfill OPENING  

### 5.3 Riesgos

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Drift Prisma client vs DB tras DDL | Media (app) | Actualizar schema + generate en Docker **en el mismo batch autorizado** o inmediatamente después |
| Enum `SALE_CREATE` no rollback-friendly | Media | Restore dump |
| Unique OPEN con varios `legacy-unknown` | Alta si hay multi-OPEN | Precheck actual = 0 OPEN |
| Confundir host `.env` / DB remota | Alta | Solo `docker exec` + `db:5432` |
| Aplicar sin copiar a `prisma/migrations/` | Proceso | Paso 1 del comando previsto |

### 5.4 Respaldo disponible

`backups/local/supertienda_dev_pre_p2c1b1_20261116_173531.dump` (120 141 B, TOC OK).

### 5.5 Comando exacto previsto (NO EJECUTADO)

Tras **autorización explícita** del usuario:

```powershell
# A) Registrar migración Prisma (copia de propuesta; no altera DB)
$mig = "20261116220000_p2c1b01_pos_cash"
New-Item -ItemType Directory -Force -Path "c:\Proyectos\supertiendaweb\backend\prisma\migrations\$mig" | Out-Null
Copy-Item `
  "c:\Proyectos\supertiendaweb\backend\prisma\migrations_proposals\20261116_p2c1b0_pos_cash\migration.sql" `
  "c:\Proyectos\supertiendaweb\backend\prisma\migrations\$mig\migration.sql"

# B) migrate deploy SOLO dentro del contenedor backend (DB = db:5432/supertienda_dev)
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev `
  supertienda-backend npx prisma migrate deploy

# C) postcheck lectura
docker cp "c:\Proyectos\supertiendaweb\backend\prisma\migrations_proposals\20261116_p2c1b0_pos_cash\postcheck.sql" `
  supertienda-db:/tmp/postcheck.sql
docker exec -i supertienda-db psql -U supertienda -d supertienda_dev -v ON_ERROR_STOP=1 -f /tmp/postcheck.sql
```

**Prohibido en esa ventana salvo nueva orden:** `db push`, `migrate reset`, Prisma CLI en host, DB remota, borrar BP 118/200, handlers POS, commit/push/deploy app.

### 5.6 Confirmación conexión

`DATABASE_URL` del backend = `postgresql://…@db:5432/supertienda_dev` — Docker local, puerto DB no publicado.

---

## 6. Bloqueos / pendientes

| Ítem | Estado |
|------|--------|
| Autorización explícita `migrate deploy` | **PENDIENTE USUARIO** |
| Merge `schema.prisma` + generate | Pendiente (recomendado mismo batch o inmediato post-DDL) |
| Implementación handlers SALE_CREATE / caja | Fuera de alcance B1 |
| Commit / push / deploy | Prohibidos |

---

## 7. Decisión GO / NO-GO

**GO** para proceder a `migrate deploy` **únicamente** en Docker local (`supertienda-db` / `supertienda-backend`), condicionado a:

1. Confirmación explícita del usuario en el chat.  
2. Uso del comando de la §5.5 (o equivalente inequívoco sobre los mismos contenedores).  
3. Postcheck obligatorio antes de declarar B1 cerrado a nivel DDL.

---

**Fin P2-C1.B1 gate.** Detenido. Esperando autorización explícita para DDL / `migrate deploy`.
