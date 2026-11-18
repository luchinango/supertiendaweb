# P2-C1.B1 — Recovery Execution Report

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** AGENT — ejecución autorizada de restore  
**Estado:** **FALLIDA / INCOMPLETA**  
**Veredicto B2:** **NO-GO**

---

## 0. Resumen

Se intentó `pg_restore --clean --if-exists` del dump pre-fallo sobre `supertienda_dev`.  
**Falló** porque el DDL parcial post-dump (`cash_movements`, `business_document_sequences`, …) impide `DROP` de tablas/constraints del dump (`users`, `sales`, `businesses`, `cash_registers`, …).

Conforme a la autorización:

- **No** se ejecutó `migrate deploy`.  
- **No** se hizo limpieza DDL manual adicional.  
- **No** se usó `migrate resolve`, `migrate reset`, ni wipe de volumen.  
- Frontend/backend quedaron **detenidos** tras el intento.

---

## 1. Base de datos intervenida

| Campo | Valor |
|-------|-------|
| Proyecto | `C:\Proyectos\supertiendaweb` |
| Contenedor | `supertienda-db` |
| Database | `supertienda_dev` |
| User | `supertienda` |
| Host lógico | `db:5432` |
| Puerto al host | **no publicado** |
| `DATABASE_URL` backend | `postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev` |

Seguridad pre-op: **PASS**.

---

## 2. Respaldo utilizado

| Campo | Valor |
|-------|-------|
| Archivo | `backups/local/supertienda_dev_pre_p2c1b1_20261116_173531.dump` |
| Tamaño | 120 141 bytes |
| Formato | PostgreSQL custom (gzip), TOC 307 |
| `dbname` TOC | `supertienda_dev` |
| Origen | PG 16.14 @ 2026-11-16 21:35:32 UTC |
| `_prisma_migrations` en dump | presente (`TABLE DATA public _prisma_migrations`) |

---

## 3. Hash SQL corregido (pre-restore)

| Archivo | SHA-256 |
|---------|---------|
| `prisma/migrations/20261116220000_p2c1b01_pos_cash/migration.sql` | `82C0D32100F82F9057C2C536C79F4A1B44819012E3648814BBE3667400419EB1` |
| `migrations_proposals/.../migration.sql` | **idéntico** |
| BEGIN/COMMIT internos | **ausentes** |
| Fix `sale_items` (`product_id` en WHERE) | **presente** |

---

## 4. Resultado de `pg_restore`

**Preparación:**

```text
docker stop supertienda-frontend supertienda-backend
pg_terminate_backend on datname=supertienda_dev → 0 sessions
docker cp … → /tmp/supertienda_dev_pre_p2c1b1.dump
```

**Comando:**

```text
pg_restore -U supertienda -d supertienda_dev --clean --if-exists --no-owner --no-acl \
  /tmp/supertienda_dev_pre_p2c1b1.dump
```

| Campo | Valor |
|-------|-------|
| Exit code | **1** |
| Warnings | `errors ignored on restore: 38` |
| Log | `backups/local/pg_restore_p2c1b1_recovery_20261116_174920.log` |

**Errores representativos:**

```text
cannot drop constraint users_pkey … cash_movements_user_id_fkey depends on it
cannot drop … sales_pkey … cash_movements_sale_id_fkey
cannot drop … cash_registers_pkey … cash_movements_cash_register_id_fkey
cannot drop … businesses_pkey … business_document_sequences_… / cash_movements_…
DROP TABLE users/sales/cash_registers/businesses blocked by same FKs
→ CREATE TYPE / CREATE TABLE already exists
→ COPY duplicate key / multiple primary keys
```

Causa: `pg_restore --clean` **no** elimina objetos creados **después** del dump; esos objetos bloquean el DROP de dependencias del dump.

---

## 5. Verificación de eliminación de DDL parcial

**Criterio de éxito:** todos los objetos POS/caja parciales **ABSENT**.

| Objeto / check | Resultado post-restore | Esperado |
|----------------|------------------------|----------|
| `cash_movements` | **PRESENT** | ABSENT |
| `business_document_sequences` | **PRESENT** | ABSENT |
| `CashMovementType` | **PRESENT** | ABSENT |
| `sales.commercial_number` | **PRESENT** | ABSENT |
| `sales.document_kind` | **PRESENT** | ABSENT |
| `sales.is_fiscal` | **PRESENT** | ABSENT |
| `sales.device_id` | **PRESENT** | ABSENT |
| `cash_registers.device_id` | **PRESENT** | ABSENT |
| `sales_document_flags_chk` | **PRESENT** | ABSENT |
| `sales_business_commercial_number_uq` | **PRESENT** | ABSENT |
| `cash_registers_open_per_device_uq` | **PRESENT** | ABSENT |
| `cart_id` / `invoice_number` nullable | YES / YES | NO / NO (estado pre-B1) |
| `SALE_CREATE` enum | ABSENT | ABSENT ✓ |
| Migraciones Prisma finished | **3** (sin fila failed) | 3 ✓ (parcial) |

**Conclusión §5:** restauración **NO completa**. Gate de “desaparecieron todos los objetos parciales” → **FAIL**.

Por instrucción explícita: **no** `migrate deploy` sobre restore incompleto; **no** limpieza DDL manual sin nueva autorización.

---

## 6. `migrate deploy`

**NO EJECUTADO.**

---

## 7. Historial Prisma (estado actual)

| migration_name | finished | steps |
|----------------|----------|-------|
| `20261116153000_init_local` | true | 1 |
| `20261116184500_hybrid_catalog` | true | 1 |
| `20261116191000_sync_foundation` | true | 1 |

Sin fila failed B1 (el restore de `_prisma_migrations` parece haber aplicado esa parte).  
**Pero** el DDL no coincide con “solo 3 migraciones”: hay objetos de B1 parciales huérfanos respecto a Prisma.

---

## 8. validate / generate

**NO EJECUTADOS** (condicionados a restore + migrate OK).

---

## 9. postcheck

**NO EJECUTADO** como pase de éxito.

---

## 10. Pruebas

| Suite | Estado | Motivo |
|-------|--------|--------|
| Backend TypeScript | **SKIP** | Recovery incompleta |
| Frontend TypeScript | **SKIP** | Idem |
| P2-B / P2-C sync suites | **SKIP** | Idem |
| Offline tests | **SKIP** | Idem |

---

## 11. Estado frontend / backend

| Contenedor | Estado |
|------------|--------|
| `supertienda-db` | Up (healthy) |
| `supertienda-backend` | **Exited (137)** — detenido para restore; **no** rearrancado |
| `supertienda-frontend` | **Exited (1)** — detenido; **no** rearrancado |

`127.0.0.1:3000` / `:5000`: **no** verificados como healthy post-recovery (servicios caídos a propósito).

---

## 12. Errores pendientes / bloqueos

| ID | Descripción |
|----|-------------|
| R1 | `pg_restore --clean` insuficiente ante objetos post-dump |
| R2 | DDL parcial (`cash_movements`, sequences, columnas sales/caja, CHECKs/índices) **sigue presente** |
| R3 | Schema físico ≠ “3 migraciones only”; Prisma history ≠ realidad DDL |
| R4 | Sin autorización para DROP manual de leftovers ni `DROP DATABASE` |

### Opciones para nueva autorización (elegir una)

**Opción A — Pre-limpieza mínima + re-restore (recomendada, local only)**  
Autorizar DROP explícito solo de leftovers post-dump, luego repetir `pg_restore --clean`:

```sql
DROP TABLE IF EXISTS public.cash_movements CASCADE;
DROP TABLE IF EXISTS public.business_document_sequences CASCADE;
DROP TYPE IF EXISTS public."CashMovementType";
-- + DROP COLUMN / índices / CHECKs B1 en sales, sale_items, cash_registers
-- (script cerrado a listar en el próximo prompt)
```

Luego restore dump → verificar limpio → migrate deploy SQL corregido.

**Opción B — Recrear database (sin borrar volumen Docker)**  
Autorizar:

```text
DROP DATABASE supertienda_dev;
CREATE DATABASE supertienda_dev OWNER supertienda;
pg_restore … (sin depender de --clean sobre leftovers)
```

Más limpio; más destructivo a nivel DB name; **no** es `volume rm`.

**Opción C — Hotfix** completar DDL faltante + `migrate resolve --applied`  
Desaconsejada (estado ya divergente).

---

## 13. Veredicto GO / NO-GO para P2-C1.B2

### **NO-GO**

Criterios de éxito **no** cumplidos:

- Restore correcto → **NO**  
- Estado previo al fallo recuperado → **NO**  
- Migración corregida aplicada → **NO**  
- Prisma sincronizado con DDL → **NO**  
- Postchecks → **NO**  
- Sin errores bloqueantes → **NO** (R1–R4)

---

## 14. Acciones NO realizadas (cumplimiento)

- migrate deploy / resolve / reset / db push  
- DDL manual de limpieza  
- Segundo restore  
- Seed DEMO  
- Handlers POS/caja  
- Commit / push / deploy  
- Prisma CLI en host  
- Touch de otras bases / producción  

---

**Fin recovery execution.** Detenido. Esperar autorización de Opción A, B u otra reparación explícita antes de continuar.
