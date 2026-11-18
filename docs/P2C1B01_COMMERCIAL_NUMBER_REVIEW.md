# P2-C1.B0.1 — Revisión: numeración comercial vs fiscal

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** ajuste de artefactos en `migrations_proposals` — **sin aplicar**  
**Supersede parcial:** decisión §13.1 de [`P2C1B0_MIGRATION_PREPARATION_REPORT.md`](./P2C1B0_MIGRATION_PREPARATION_REPORT.md)  
**Estado:** diseño actualizado — **esperar autorización explícita** para migrate solo en Docker local

---

## 0. Decisiones aprobadas (incorporadas)

| # | Decisión |
|---|----------|
| 1 | Columna `sales.commercial_number` para tickets comerciales |
| 2 | `sales.invoice_number` reservado a facturación fiscal **futura** (+ históricos intactos) |
| 3 | Unique `(business_id, commercial_number)` con **NULL múltiples** (índice parcial) |
| 4 | Secuencia `business_document_sequences` independiente de `FiscalSettings` |
| 5 | Offline: ticket provisional; `commercial_number` solo en servidor tras ack |
| 6 | Caja OPEN obligatoria por `(business, user, deviceId)` |
| 7–8 | MVP CASH; no oversell |
| 9–10 | `cash_movements`: OPENING + SALE_CASH en C1.B; CASH_IN/OUT diferidos |
| 11 | `cart_id` nullable |
| 12 | `SALE_CREATE` canónico; `SALE_COMPLETE` conservado en enum |
| 13 | SIAT y pagos divididos fuera de alcance |

---

## 1. Separación comercial / fiscal

| Campo | Rol MVP | Quién escribe |
|-------|---------|---------------|
| `commercial_number` | Ticket comercial definitivo `COM-########` | Solo servidor en `SALE_CREATE` applied |
| `invoice_number` | Fiscal futuro / **valores históricos** | MVP POS: **no asigna**; históricos sin tocar |
| `document_kind` | `LEGACY_UNSPECIFIED` \| `COMMERCIAL_TICKET` \| `FISCAL_INVOICE` | App + backfill |
| `is_fiscal` | `false` en tickets comerciales y legacy | App |

### Backfill (explícito)

- **No** copiar `invoice_number` → `commercial_number`.  
- Filas existentes: `commercial_number = NULL`, `document_kind = LEGACY_UNSPECIFIED`, `is_fiscal = false`.  
- Así no se “convierten” facturas/números históricos en tickets comerciales.

### Unicidad

```text
UNIQUE (business_id, commercial_number) WHERE commercial_number IS NOT NULL
UNIQUE (business_id, invoice_number)    WHERE invoice_number IS NOT NULL
```

PostgreSQL: varios `NULL` en `commercial_number` son legales (ventas legacy / aún no acked en proyección server).

`invoice_number` pasa a **nullable** para ventas comerciales nuevas (`NULL` + `commercial_number` seteado).

---

## 2. Coherencia `document_kind` / `is_fiscal`

CHECK `sales_document_flags_chk`:

| document_kind | is_fiscal | commercial_number | invoice_number |
|---------------|-----------|-------------------|----------------|
| `COMMERCIAL_TICKET` | debe `false` | **NOT NULL** | normalmente NULL en MVP |
| `FISCAL_INVOICE` | debe `true` | — | **NOT NULL** |
| `LEGACY_UNSPECIFIED` | debe `false` | NULL | puede tener valor histórico |

CHECK adicional `sales_no_fiscal_commercial_mix_chk`:

- Prohíbe `is_fiscal=true` + `COMMERCIAL_TICKET`  
- Prohíbe `is_fiscal=false` + `FISCAL_INVOICE`

No hay estado “fiscal comercial” ambiguo en MVP.

---

## 3. Asignación concurrente de `commercial_number`

Misma fila sequence por empresa:

```sql
UPDATE business_document_sequences
SET current_number = current_number + 1, updated_at = now()
WHERE business_id = $1 AND doc_type = 'COMMERCIAL_TICKET'
RETURNING current_number, prefix;
-- commercial_number := prefix || '-' || lpad(n::text, 8, '0')
-- document_kind := 'COMMERCIAL_TICKET'; is_fiscal := false; invoice_number := NULL
```

- Lock de fila serializa ventas concurrentes **por empresa**.  
- Idempotencia: `client_operation_id` / `sync_operations` evita segundo número en retry.  
- **Prohibido** usar `fiscal_settings.invoice_current_number`.

Offline: UI muestra provisional; tras ack, UI muestra `commercial_number` del mapping.

---

## 4. Artefactos actualizados

Todos bajo:

`backend/prisma/migrations_proposals/20261116_p2c1b0_pos_cash/`

| Archivo | Cambio B0.1 |
|---------|-------------|
| `migration.sql` | `commercial_number`, invoice nullable + unique parcial, CHECKs, sin backfill comercial desde invoice |
| `rollback.sql` | Drop `commercial_number` / CHECKs; no borra invoice históricos |
| `precheck.sql` | Conteos invoice / OPEN multi |
| `postcheck.sql` | commercial NULL en legacy; flags contradictorios = 0 |
| `schema.prisma.snippet.md` | Campos separados |
| `README.md` | Apunta a este informe |

**Siguen fuera de** `prisma/migrations/` → no apply automático.

---

## 5. Riesgos rollback y datos históricos

| Riesgo | Mitigación |
|--------|------------|
| Rollback no quita enum `SALE_CREATE` | Snapshot Docker preferible |
| Recrear unique global `invoice_number` falla si hubo NULL comerciales | No recrear a ciegas; restore snapshot |
| OPEN parcial + varios `legacy-unknown` | `precheck` de OPEN multi-user; limpiar antes |
| Alguien asigne `commercial_number` desde invoice en script ad-hoc | Prohibido en diseño; postcheck cuenta legacy con commercial NULL |
| Confundir ticket COM con factura | `is_fiscal=false` + UI “comprobante comercial” |

---

## 6. Matriz M1–M9 (actualizada B0.1)

| ID | Veredicto B0.1 |
|----|----------------|
| M1 | **Reformulado:** unique parcial `invoice` por business; **nuevo** unique parcial `commercial_number` |
| M2 | Obligatorio (`client_operation_id`) |
| M3–M6 | Obligatorio (sin cambio de intención) |
| M7 | Diferido |
| M8 | Sequence → **`commercial_number`** (no invoice) |
| M9 | `SALE_CREATE` + conservar `SALE_COMPLETE` |

---

## 7. Decisiones pendientes

Ninguna bloquea el diseño SQL actual.

Opcional a confirmar en C1.B (no bloquea migrate):

- ¿Permitir en el futuro una venta con **ambos** `commercial_number` y `invoice_number` (ticket + factura)? Hoy CHECKs lo permiten solo vía `FISCAL_INVOICE` + invoice; commercial quedaría NULL en esa rama. Si se necesita dual, abrir migración futura.

---

## 8. Autorización siguiente

1. Aprobar este informe B0.1.  
2. `precheck.sql` en Docker.  
3. Copiar a `prisma/migrations/<ts>_p2c1b01_pos_cash/` **solo con OK explícito**.  
4. `migrate deploy` **solo Docker local**.  
5. `postcheck.sql`.  
6. Luego P2-C1.B handlers.

**No ejecutado nada en esta etapa.** Sin commit/push/deploy.

---

**Fin P2-C1.B0.1.** Esperando autorización explícita para aplicar en Docker local.
