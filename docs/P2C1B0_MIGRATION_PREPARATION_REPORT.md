# P2-C1.B0 — Preparación segura de migraciones POS y caja

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** diseño + artefactos SQL/Prisma en carpeta de **propuesta** — **sin aplicar**  
**Base:** [`P2C1A_POS_CASH_ARCHITECTURE_REPORT.md`](./P2C1A_POS_CASH_ARCHITECTURE_REPORT.md)  
**Estado:** supersedido en numeración por **B0.1** — ver [`P2C1B01_COMMERCIAL_NUMBER_REVIEW.md`](./P2C1B01_COMMERCIAL_NUMBER_REVIEW.md)  
**Nota:** los artefactos SQL en `migrations_proposals/…` ya reflejan B0.1 (`commercial_number` ≠ `invoice_number`).

---

## 0. Decisiones de diseño asumidas (entrada)

| Decisión | Valor |
|----------|--------|
| Op canónica venta | **`SALE_CREATE`** |
| Caja OPEN | **Obligatoria** para ventas (enforcement en handler C1.B, no solo DB) |
| Oversell | **No** |
| Pagos MVP | **Solo CASH** |
| Ticket offline | Provisional; **no** factura fiscal |
| SIAT | **Fuera de alcance** |
| Controllers Express legacy | **No reutilizar** |
| Pagos divididos | **No** en MVP |

---

## 1. Inspección schema / migraciones existentes

| Migración aplicada (histórica) | Contenido relevante |
|--------------------------------|---------------------|
| `20261116153000_init_local` | `sales`, `sale_items`, `cash_registers`, uniques **globales** `invoice_number` / `register_number`; `cart_id` NOT NULL |
| `20261116184500_hybrid_catalog` | Catálogo híbrido |
| `20261116191000_sync_foundation` | `version`, `sync_operations`, enum con `SALE_COMPLETE` / `CASH_*` (aún sin handler) |

**Hallazgos bloqueantes para C1.B sin migración:**

1. Unique global de `sales.invoice_number` y `cash_registers.register_number`.  
2. Sin `deviceId` en caja → Modalidad 2 incompleta.  
3. `SaleItem` sin snapshot de nombre.  
4. Sin libro de movimientos de caja (solo `audit_cash_registers` libre).  
5. Enum sync **sin** `SALE_CREATE` (solo `SALE_COMPLETE`).  
6. `cart_id` NOT NULL — incompatible con venta sync sin Cart legacy.  
7. Usar `FiscalSettings.invoiceCurrentNumber` para POS mezclaría ticket comercial con dosificación fiscal → **prohibido en esta propuesta**.

Seed actual: no crea sales/cash en `seed.ts` (riesgo histórico bajo en Docker limpio).

---

## 2. Matriz M1–M9

| ID | Tema | Veredicto | Justificación |
|----|------|-----------|---------------|
| **M1** | Unique `(businessId, invoiceNumber)` | **Obligatorio** | Multiempresa + tickets comerciales server-side |
| **M2** | `clientOperationId` en Sale | **Obligatorio (nullable + unique parcial)** | Trazabilidad además de `sync_operations`; facilita soporte |
| **M3** | Snapshot SaleItem (`productName`, `sku`, `businessProductId`) | **Obligatorio** | Ticket estable; no oversell de verdad histórica |
| **M4** | `deviceId` + unique register por empresa | **Obligatorio** | Caja individual Modalidad 2 |
| **M5** | `CashRegister.version` + unique OPEN parcial | **Obligatorio** | Evitar doble OPEN / cierre sucio |
| **M6** | Tabla `cash_movements` | **Obligatorio** | Auditoría OPENING / SALE_CASH / IN / OUT |
| **M7** | `sale_payments` | **Diferido** | MVP un solo CASH en `Sale` |
| **M8** | Contador concurrente | **Obligatorio vía `business_document_sequences`** | **No** tocar `fiscal_settings` |
| **M9** | Enum `SALE_CREATE` | **Obligatorio** | Canónico; conservar `SALE_COMPLETE` en enum como legacy muerto |

**Extras incluidos (necesarios):**

| Extra | Veredicto |
|-------|-----------|
| `sales.cart_id` nullable | **Obligatorio** |
| `document_kind` + `is_fiscal` | **Obligatorio** (dejar explícito que MVP no es fiscal) |
| `cash_registers.client_operation_id` | **Obligatorio** (idempotencia CASH_OPEN) |

---

## 3. Numeración comercial (no fiscal)

### Diseño

- Tabla `business_document_sequences` (`business_id`, `doc_type='COMMERCIAL_TICKET'`, `prefix='COM'`, `current_number`).  
- Asignación **solo en servidor** al apply de `SALE_CREATE`:

```sql
UPDATE business_document_sequences
SET current_number = current_number + 1, updated_at = now()
WHERE business_id = $1 AND doc_type = 'COMMERCIAL_TICKET'
RETURNING current_number, prefix;
-- invoice_number := prefix || '-' || lpad(current_number::text, 8, '0')
```

- Unique: `(business_id, invoice_number)`.  
- Campo `is_fiscal = false`, `document_kind = 'COMMERCIAL_TICKET'`.  
- Cliente offline: solo UUID / ticket local provisional — **nunca** escribe `invoice_number` fiscal.

### Qué no se hace

- No incrementar `fiscal_settings.invoice_current_number`.  
- No generar CUF / authorizationCode / controlCode en MVP.  
- No afirmar cumplimiento SIAT.

---

## 4. deviceId y caja individual

| Regla | Implementación propuesta |
|-------|--------------------------|
| `device_id` NOT NULL | Backfill `'legacy-unknown'` en filas viejas |
| Unique register | `(business_id, register_number)` |
| Una OPEN | Partial unique `(business_id, user_id, device_id) WHERE status='OPEN' AND deleted_at IS NULL` |
| `version` | Default 1; close/open usan optimistic lock en handler |
| `client_operation_id` | Unique parcial por business (idempotencia CASH_OPEN) |

**Enforcement app (C1.B):** `SALE_CREATE` exige caja OPEN del mismo `businessId`+`userId`+`deviceId`.

---

## 5. Snapshots SaleItem

Columnas: `product_name` NOT NULL (tras backfill), `sku` nullable, `business_product_id` FK nullable SET NULL.

Backfill: JOIN `products` + BP activo de la empresa de la venta.

Handler futuro: escribir snapshot desde payload; no leer nombre “en vivo” para el ticket.

---

## 6. Movimientos de caja

Tabla `cash_movements` + enum `CashMovementType`:

`OPENING | CASH_IN | CASH_OUT | SALE_CASH | CLOSING_COUNT | ADJUSTMENT`

- Cada `CASH_OPEN` → movimiento OPENING.  
- Cada `SALE_CREATE` CASH → SALE_CASH (+ actualizar `current_amount` en misma tx).  
- IN/OUT manuales → fase UI posterior; schema listo.  
- Idempotencia opcional vía `client_operation_id`.

`AuditCashRegister` se **conserva**; no se elimina.

---

## 7. Generación concurrente de números

| Enfoque | Estado |
|---------|--------|
| `UPDATE … RETURNING` en `business_document_sequences` | **Elegido** |
| `FiscalSettings` | **Prohibido** para POS MVP |
| Secuencias PG globales | Evitar (no multiempresa) |
| UUID como invoice_number | Posible pero peor UX; no elegido |

Row lock de la fila sequence serializa concurrent `SALE_CREATE` por empresa sin bloquear otras empresas.

---

## 8. Compatibilidad y backfill

| Dato | Acción |
|------|--------|
| Empresas existentes | INSERT sequence COMMERCIAL_TICKET |
| `sale_items` históricos | Rellenar `product_name`/`sku` desde `products` |
| `business_product_id` | Best-effort desde BP activo; puede quedar NULL si producto ya no adoptado |
| Cajas existentes | `device_id = 'legacy-unknown'` |
| Movimientos | Backfill OPENING desde `opening_amount` |
| `cart_id` NULL | Permitido solo ventas nuevas sync; históricos intactos |
| Enum `SALE_COMPLETE` | Permanece; código C1.B no lo implementa |

**Riesgo histórico:** si existieran dos businesses con el mismo `invoice_number` string, el unique compuesto es **válido**; el unique global actual ya lo impedía, así que no hay duplicados globales.

**Riesgo OPEN parcial:** dos OPEN legacy mismo user distintos devices con `legacy-unknown` → el unique parcial **fallaría** al crear segunda. Precheck debe listar OPEN duplicados `(business_id, user_id)` antes de apply; en seed vacío → OK. Si hay duplicados: cerrar o reasignar `device_id` manualmente **antes**.

---

## 9. Índices, constraints y riesgos

| Objeto | Riesgo |
|--------|--------|
| Drop `sales_invoice_number_key` | Reversible solo si no hay colisiones al recrear global |
| Partial unique OPEN | Bloquea datos sucios; requiere limpieza previa |
| `product_name` SET NOT NULL | Falla si ítems huérfanos sin product |
| `ALTER TYPE ADD VALUE` | No se revierte limpio en rollback |
| FK `business_product_id` | ON DELETE SET NULL — OK |
| Columna `sales.cashRegisterId` (camelCase legacy) | **No renombrar** en esta migración (evita churn); documentar deuda |

---

## 10. Artefactos (propuesta — fuera de `migrations/`)

```text
backend/prisma/migrations_proposals/20261116_p2c1b0_pos_cash/
  README.md
  migration.sql      ← forward
  rollback.sql       ← best-effort
  precheck.sql
  postcheck.sql
  schema.prisma.snippet.md
```

**Importante:** no copiar a `prisma/migrations/` hasta autorización. Apply previsto (futuro): solo Docker `prisma migrate deploy` con migración formal versionada.

---

## 11. Plan de pruebas pre/post

### Pre (`precheck.sql`)

- Conteos sales/cash.  
- Ítems huérfanos.  
- Duplicados invoice/register.  
- OPEN concurrentes mismo user.  
- Presencia enum `SALE_COMPLETE`.

### Post (`postcheck.sql`)

- Sequences = #businesses.  
- Índices compuestos presentes; globales ausentes.  
- `product_name` sin NULL.  
- `device_id` sin NULL.  
- OPENING movements ≥ cash_registers.  
- Enum `SALE_CREATE` presente.

### Pruebas de aplicación (cuando se autorice migrate — no ahora)

1. Dos empresas emiten `COM-00000001` cada una → OK.  
2. Dos `SALE_CREATE` concurrentes misma empresa → números distintos secuenciales.  
3. Segundo `CASH_OPEN` mismo device OPEN → rechazo unique/handler.  
4. Rollback parcial documentado; DB restore snapshot preferible.

---

## 12. Rollback

1. Preferido: restaurar snapshot Docker volume **antes** del migrate.  
2. `rollback.sql`: dropea `cash_movements`, columns nuevas, sequences; **no** quita valor enum `SALE_CREATE`.  
3. Recrear unique globales solo si datos lo permiten.

---

## 13. Decisiones de negocio pendientes (pueden frenar apply)

Aunque el diseño técnico está cerrado para MVP, **confirmar antes de aplicar**:

1. **¿`invoice_number` reutilizado como número comercial** (`COM-…`) es aceptable, o se exige columna nueva `commercial_number` dejando `invoice_number` solo para fiscal futuro?  
   - Propuesta actual: reutilizar con `is_fiscal=false` + comentario.  
2. **¿Caja OPEN estricta por `deviceId`** incluso para legacy `'legacy-unknown'`?  
3. **¿Permitir `CASH_IN`/`CASH_OUT` en C1.B** o solo schema (propuesta: solo schema + OPENING/SALE_CASH en handler)?  
4. **¿`cart_id` nullable** aceptado frente a modelo mental “toda venta tiene carrito”?  
5. **¿Conservar `SALE_COMPLETE` en enum** indefinidamente o planear drop en migración futura?  
6. Ninguna decisión fiscal Bolivia adicional bloquea **esta** migración comercial, siempre que no se active SIAT.

Si (1) exige columna separada → ajustar SQL antes del apply.

---

## 14. Qué queda fuera (explícito)

- Aplicar migración / db push / migrate reset.  
- Handlers `SALE_CREATE` / `CASH_*`.  
- Remount Express legacy.  
- Cambios frontend POS.  
- `sale_payments`, SIAT, oversell.  
- Commit / push / deploy.

---

## 15. Criterio para autorizar P2-C1.B (implementación)

1. Aprobar matriz §2 y decisión §13.1 (nombre del número comercial).  
2. Ejecutar `precheck.sql` en Docker y adjuntar resultados.  
3. Copiar SQL a `prisma/migrations/<timestamp>_p2c1b0_pos_cash/` **solo entonces**.  
4. `migrate deploy` en contenedor; `postcheck.sql`.  
5. Recién ahí implementar handlers (P2-C1.B).

---

**Fin P2-C1.B0.** Detenido a la espera de autorización para aplicar migraciones.
