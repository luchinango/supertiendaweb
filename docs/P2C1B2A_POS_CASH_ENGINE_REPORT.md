# P2-C1.B2-A — Motor transaccional ventas y caja

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Entorno:** Docker local `supertienda_dev`  
**Estado:** **COMPLETADO**

---

## 1. Alcance

Implementados vía **sync push** (sin remount de Express legacy):

| Op | Estado |
|----|--------|
| `CASH_OPEN` | applied / idempotent / concurrent-safe |
| `SALE_CREATE` | atómico: stock CAS + commercial_number + SALE_CASH |
| `CASH_CLOSE` | expected/counted/diff + version |
| `SALE_COMPLETE` | sigue `NOT_IMPLEMENTED` (compat) |

Sin cambios DDL. Sin UI POS / IndexedDB. Sin SIAT / pagos no-CASH.

---

## 2. Deuda TypeScript

Corregida sin inventar datos:

- `CashRegister.deviceId` exigido en service/controller legacy (rutas **siguen desmontadas**).
- Unique `businessId_registerNumber` en `findUnique`.
- `SaleItem.productName` desde `Product.name` real en creates legacy.

`npm run type-check` (backend) → **PASS**.

---

## 3. Implementación

**Archivo nuevo:** `backend/src/services/PosCashSyncService.ts`  
**Cableado:** `SyncService` (`IMPLEMENTED` + `dispatch` con `deviceId`).

### CASH_OPEN
- JWT `businessId`/`userId` + `X-Device-Id`
- Una OPEN por `(business, user, device)` (índice parcial + chequeo)
- `CashMovement` OPENING + audit
- Idempotencia SyncOperation

### SALE_CREATE
- Exige caja OPEN del mismo user+device
- Precio solo `BusinessProduct.customPrice` → `PRICE_MISMATCH` si el cliente altera
- Stock CAS por línea (`version` + `currentStock`) → sin oversell
- Snapshots `productName`/`sku`/`businessProductId`
- `commercial_number` vía `UPDATE business_document_sequences … RETURNING`
- `invoice_number = NULL`, `document_kind=COMMERCIAL_TICKET`, `is_fiscal=false`
- `InventoryTransaction` SALE + `CashMovement` SALE_CASH + update `currentAmount`

### CASH_CLOSE
- Valida tenant/user/device + OPEN
- Optimistic `version`
- `CLOSING_COUNT` + diff; ventas posteriores → `CASH_CLOSED`

---

## 4. Pruebas

```bash
npm run test:p2c1b2a:http
```

**16/16 PASS**, incluyendo:

apertura, duplicada, concurrente, venta válida, sin caja, stock insuficiente, cross-tenant, PRICE_MISMATCH, idempotencia, payload mismatch, oversell concurrente, numeración por empresa, SALE_CASH+CLOSE, SALE_COMPLETE NOT_IMPLEMENTED, EMPLOYEE.

Regresión `test:p2c01:http`: **25/25 PASS** (SALE_COMPLETE sigue NOT_IMPLEMENTED; BP seed 1–4 intactos).

---

## 5. Legacy

Rutas Express `cashRegister` / `sale` / `pos` **permanecen comentadas** en `app.ts`.  
Código legacy compilable pero no expuesto.

---

## 6. GO siguiente

Listo para P2-C1.B2-B / C1.C (UI POS offline) tras revisión.

**No** ejecutado: seed DEMO, commit, push, deploy.
