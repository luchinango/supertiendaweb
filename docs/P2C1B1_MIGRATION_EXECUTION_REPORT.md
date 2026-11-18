# P2-C1.B1 — Migration Execution Report

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** AGENT — aplicación autorizada en Docker local  
**Estado:** **NO COMPLETADA** — `migrate deploy` **FALLÓ**  
**Veredicto B2:** **NO-GO**

---

## 0. Resumen ejecutivo

1. Seguridad Docker local verificada (`db:5432/supertienda_dev`).  
2. Precheck y respaldo OK.  
3. Migración copiada con SHA-256 idéntico.  
4. `schema.prisma` actualizado conforme B0.1.  
5. `prisma migrate deploy` **falló** por error SQL en `UPDATE sale_items … FROM … JOIN … ON … si.product_id`.  
6. La transacción de Prisma **revirtió** el primer intento (DB limpia tras el fallo).  
7. Un diagnóstico posterior con `BEGIN` anidado + `COMMIT` **dejó DDL parcial aplicado** fuera del registro Prisma.  
8. **No** se ejecutó `migrate resolve`, rollback automático ni restore.  
9. **No** se regeneró client ni se declaró B1 cerrado.

---

## 1. Identidad de la base de datos

| Campo | Valor |
|-------|-------|
| Contenedor DB | `supertienda-db` (`postgres:16-alpine`, healthy) |
| Contenedor backend | `supertienda-backend` (healthy) |
| Host | `db` |
| Puerto | `5432` (no publicado al host: `Ports={"5432/tcp":null}`) |
| Database | `supertienda_dev` |
| User | `supertienda` |
| `DATABASE_URL` (contenedor) | `postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev` |
| `inet_server_addr()` / port | vacío / null (conexión local vía socket en `docker exec`) |

```text
SELECT current_database(), current_user → supertienda_dev, supertienda
```

Sin uso de `backend/.env` del host para el deploy (override explícito `-e DATABASE_URL=…@db:5432/supertienda_dev`).

---

## 2. Precheck previo (inmediato)

Bundle `precheck.sql` reejecutado:

| check | value |
|-------|-------|
| sales_count | 0 |
| sales_with_invoice | 0 |
| sale_items_orphan_product | 0 |
| dup_invoice_global | 0 |
| cash_registers_count | 0 |
| cash_open_same_user_multi | 0 |
| businesses | 2 |
| enum_sale_complete | yes |

BP 1–4 íntegros; BP 118/200 presentes; objetos POS/caja **ausentes** antes del deploy.

Migraciones previas:

- `20261116153000_init_local`
- `20261116184500_hybrid_catalog`
- `20261116191000_sync_foundation`

---

## 3. Respaldo verificado

| Campo | Valor |
|-------|-------|
| Archivo | `backups/local/supertienda_dev_pre_p2c1b1_20261116_173531.dump` |
| Tamaño | 120 141 bytes |
| `pg_restore -l` | OK (TOC 307, PG 16.14, format custom) |
| Dataset | sin cambio material vs gate (0 sales / 0 cajas / 2 businesses) → **no** se generó dump adicional |

---

## 4. Nombre y hash de migración

| Campo | Valor |
|-------|-------|
| Carpeta | `backend/prisma/migrations/20261116220000_p2c1b01_pos_cash/` |
| Origen | `backend/prisma/migrations_proposals/20261116_p2c1b0_pos_cash/migration.sql` |
| SHA-256 (src = dst) | `7025FE7062708EB07D99E11546219BC792DA1F5004445272E2E130F00ADFDB29` |
| Modificación silenciosa del SQL | **No** (copia idéntica) |

---

## 5. Resultado exacto de `migrate deploy`

**Comando:**

```text
docker exec -w /app -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev \
  supertienda-backend npx prisma migrate deploy
```

**Salida (extracto):**

```text
Datasource "db": PostgreSQL database "supertienda_dev", schema "public" at "db:5432"
4 migrations found in prisma/migrations
Applying migration `20261116220000_p2c1b01_pos_cash`
Error: ERROR: current transaction is aborted, commands ignored until end of transaction block
```

**Causa raíz (log PostgreSQL `2026-11-16 21:40:18.411 UTC`):**

```text
ERROR:  invalid reference to FROM-clause entry for table "si"
DETAIL: There is an entry for table "si", but it cannot be referenced from this part of the query.
```

Fragmento culpable en `migration.sql` (backfill `business_product_id`):

```sql
UPDATE "sale_items" si
SET "business_product_id" = bp."id"
FROM "sales" s
JOIN "business_products" bp
  ON bp."business_id" = s."business_id"
 AND bp."product_id" = si."product_id"   -- ← inválido en PG: target alias no usable en JOIN ON del FROM
 AND bp."deleted_at" IS NULL
WHERE si."sale_id" = s."id"
  AND si."business_product_id" IS NULL;
```

**Corrección SQL propuesta (NO aplicada — requiere nueva autorización):**

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

Tras el error, Prisma intentó `UPDATE _prisma_migrations SET logs=…` dentro de la tx abortada → segundo error visible.

Registro Prisma tras el fallo:

| migration_name | finished_at | applied_steps_count |
|----------------|-------------|---------------------|
| `20261116220000_p2c1b01_pos_cash` | **NULL** | **0** |

Inmediatamente después del fallo de Prisma, el DDL **no** permanecía (rollback de la tx de migrate).  
`migrate status`: migration **failed**.

---

## 6. Cambios en `schema.prisma`

Actualizado en disco (autorizado) alineado al diseño B0.1:

- `SyncOperationType.SALE_CREATE` (+ `SALE_COMPLETE` conservado)
- `CashMovementType`
- `Sale`: `commercialNumber`, `invoiceNumber?`, `cartId?` + `cart Cart?`, `documentKind`, `isFiscal`, `clientOperationId`, `deviceId`
- Uniques parciales de sales **no** modelados como `@unique` globales (quedan en SQL)
- `SaleItem`: `productName`, `sku`, `businessProductId` + FK
- `CashRegister`: `deviceId`, `version`, `clientOperationId`; `@@unique([businessId, registerNumber])`
- Models `BusinessDocumentSequence`, `CashMovement`
- Relaciones en `Business`, `User`, `BusinessProduct`

**Nota:** el schema en repo describe el **estado objetivo**; la DB local quedó en estado **parcial** (ver §9).

---

## 7. `prisma validate` / `generate`

**No ejecutados** — condicionados a deploy exitoso. Client **no** regenerado.

---

## 8. TypeScript

**No ejecutado** (misma condición). Suites de regresión **no** corridas.

---

## 9. Estado real de la base tras diagnóstico (importante)

Para aislar el error se ejecutó un script diagnóstico  
(`migrations_proposals/.../_diag_migrate_fail.sql`) que **reprodujo el patrón `BEGIN` anidado + `COMMIT`**.  
Ese `COMMIT` interno **persistió DDL parcial** (efecto colateral del diagnóstico; no fue `migrate deploy` exitoso).

### Presente ahora

- Enum `SALE_CREATE`
- Columnas sales: `commercial_number`, `document_kind`, `is_fiscal`, `client_operation_id`, `device_id`
- `cart_id` / `invoice_number` nullable
- Uniques parciales invoice/comercial; global invoice **gone**
- `sales_document_flags_chk`
- `sale_items.product_name` (NOT NULL), `sku`, `business_product_id` (sin FK aún)
- `cash_registers.device_id`, `version`, `client_operation_id`
- Unique OPEN por device; unique register por business
- Tablas `business_document_sequences` (2 filas) y `cash_movements` (0 filas)
- Enum `CashMovementType`

### Ausente vs SQL aprobado completo

- `sales_no_fiscal_commercial_mix_chk`
- `sales_business_client_operation_uq`
- Índices `sales_business_created_idx`, `sales_cash_register_idx`, `sales_business_commercial_number_idx`
- FK/índice `sale_items_business_product_*`
- Índices/unique/check restantes de `cash_movements` / client_operation caja
- Registro Prisma **finished** para esta migración

### Integridad tenant / históricos

| Check | Resultado |
|-------|-----------|
| sales / cash_registers counts | 0 / 0 |
| BP 1–4 | intactos |
| BP 118 / 200 | intactos (2 filas) |
| sequences seed | 2 (una por empresa) |
| Datos de venta inventados | no |

---

## 10. Postcheck oficial

**No ejecutado como pase** — deploy no completó; postcheck completo no aplica como éxito.

---

## 11. Suites de regresión

| Suite | Estado |
|-------|--------|
| Backend TypeScript | **OMITIDA** |
| P2-B integrity | **OMITIDA** |
| P2-C0.1 sync | **OMITIDA** |
| P2-C.A pull | **OMITIDA** |
| P2-C.B catálogo | **OMITIDA** |
| Frontend TypeScript | **OMITIDA** |
| Offline tests | **OMITIDA** |

Motivo: fallo de migración; instrucción de no declarar éxito con errores bloqueantes.

---

## 12. Errores y riesgos pendientes

| ID | Descripción | Acción requerida (autorización nueva) |
|----|-------------|----------------------------------------|
| E1 | Bug SQL: alias `si` en `JOIN ON` del `UPDATE sale_items` | Corregir `migration.sql` (proposal + copia en `prisma/migrations`) |
| E2 | Fila failed en `_prisma_migrations` | `migrate resolve --rolled-back` **o** `--applied` según plan de reparación — **no** hecho |
| E3 | DDL parcial fuera de Prisma | Completar DDL faltante **o** restore dump + re-apply limpio |
| E4 | Nested `BEGIN`/`COMMIT` dentro de migrate Prisma | Quitar `BEGIN`/`COMMIT` internos del SQL; opcional `prisma:disable-transaction` solo si ADD VALUE lo exige |
| E5 | Schema repo ≠ garantía de client/DB sync | `generate` + validate solo tras estado DDL coherente |

**Prohibiciones respetadas tras el fallo:** sin `migrate resolve` automático, sin rollback automático, sin restore automático, sin `db push`, sin reintento ciego de deploy.

---

## 13. GO / NO-GO para P2-C1.B2

### **NO-GO**

B1 **no** cumple criterio de cierre:

- Migración **no** aplicada correctamente vía `migrate deploy`
- Client Prisma **no** regenerado / no validado contra DB
- Postcheck oficial **no** en verde
- Estado DB **parcial** + migración Prisma **failed**

### Siguiente paso sugerido (esperar instrucciones explícitas)

Opción recomendada (limpia):

1. Autorizar **restore** del dump `supertienda_dev_pre_p2c1b1_20261116_173531.dump`.  
2. Autorizar corrección del `UPDATE sale_items` (+ quitar `BEGIN`/`COMMIT` internos).  
3. Autorizar `migrate resolve --rolled-back "20261116220000_p2c1b01_pos_cash"` tras restore (o borrar fila failed si restore la elimina).  
4. Re-ejecutar `migrate deploy` + postcheck + generate + tsc + regresiones.

Opción alternativa (hot-fix sobre parcial): completar DDL faltante a mano + `resolve --applied` — **más frágil**; solo con autorización explícita.

---

## 14. Artefactos tocados en esta corrida

| Path | Acción |
|------|--------|
| `backend/prisma/migrations/20261116220000_p2c1b01_pos_cash/migration.sql` | Creado (hash idéntico a proposal) |
| `backend/prisma/schema.prisma` | Actualizado a diseño B0.1 |
| `backend/prisma/migrations_proposals/.../_diag_migrate_fail.sql` | Diagnóstico (efecto colateral DDL parcial) |
| DB `supertienda_dev` | Deploy fallido; luego DDL parcial por diagnóstico |
| Prisma client / handlers / frontend | **Sin** generate / sin implementación POS |

---

**Fin P2-C1.B1 execution.** Detenido. Esperando nuevas instrucciones (reparación / restore / B1-fix).
