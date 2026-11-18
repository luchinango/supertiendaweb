# P2-C1.B2-B — Interfaz POS conectada al motor

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** ONLINE-FIRST (sin ventas offline)  
**Estado:** **COMPLETADO**

---

## 1. Pantallas implementadas

| Ruta | Descripción |
|------|-------------|
| `/ventas` | POS reescrito: catálogo + carrito + caja + cobro CASH + comprobante no fiscal |

Protegida con `ProtectedRoute`. ADMIN y EMPLOYEE.

**Desktop:** catálogo y carrito visibles en paralelo (`lg:grid-cols`).  
**Móvil:** carrito en panel inferior dedicado.

---

## 2. Componentes / módulos nuevos

| Path | Rol |
|------|-----|
| `frontend/app/ventas/page.tsx` | UI POS completa |
| `frontend/components/features/pos/PosReceipt.tsx` | Comprobante comercial |
| `frontend/lib/pos/posOnlineService.ts` | Push CASH/SALE + GET caja + pending sale (sessionStorage) |
| `backend/src/controllers/PosCashRegisterController.ts` | `GET /cash-registers/open` |

Legacy Express de ventas/caja **sigue desmontado**. Stub Next `/api/cash-registers/open` ya no se usa desde esta UI.

---

## 3. Integración con sync

Mutaciones exclusivas vía `POST /sync/push`:

- `CASH_OPEN`
- `SALE_CREATE`
- `CASH_CLOSE`

Headers: `Authorization` + `X-Device-Id` (`getOrCreateDeviceId()`).  
`businessId` solo desde sesión/scope — no editable en UI.

Catálogo: `useCommercialCatalog` (precio = `customPrice`, stock local sincronizado).  
Tras venta confirmada → `syncNow()` para refrescar stock.

**No** se encola venta en outbox offline.

---

## 4. Apertura / cierre de caja

- Lectura: `GET /cash-registers/open` (JWT + device, tenant-scoped).
- Abrir: monto inicial → `CASH_OPEN`.
- Cerrar: efectivo contado vs `currentAmount` servidor → `CASH_CLOSE` con `baseVersion`.
- Diferencia mostrada desde respuesta servidor (`expectedAmount` / `difference`).

Sin caja OPEN no se permite agregar productos ni cobrar.

---

## 5. Venta y comprobante

- Carrito con cantidades editables; rechaza qty ≤ 0 y oversell local.
- Cobro CASH con efectivo recibido / cambio (UI); total confirmado por servidor.
- Anti doble clic: `busy` + `chargeLock`.
- `clientOperationId` persistido en `sessionStorage` hasta `applied`/`duplicate`.
- Pérdida de red: mensaje claro, carrito/pending conservados, reintento idempotente.
- Comprobante solo tras confirmación servidor: número `COM-…`, leyenda **COMPROBANTE NO FISCAL**.

Errores mapeados: `PRICE_MISMATCH`, `INSUFFICIENT_STOCK`, `CASH_CLOSED`, `NETWORK`.

---

## 6. Manejo de errores y reintentos

| Caso | Comportamiento |
|------|----------------|
| Offline al cobrar | Bloquea; no confirma |
| Timeout/red tras enviar | Conserva pending UUID; UI “Reintentar” |
| Duplicate en reintento | Trata como confirmada |
| Payload mismatch | Limpia pending |
| Precio/stock | Sync catálogo; limpia pending |

---

## 7. Pruebas y resultados

| Suite | Resultado |
|-------|-----------|
| Frontend `tsc` | PASS |
| Backend `tsc` | PASS |
| `test:p2c1b2b:http` (GET open) | **5/5 PASS** |
| `test:p2c1b2a:http` (motor) | **16/16 PASS** |

Cobertura HTTP lectura caja: 401, sin device, null, open tras CASH_OPEN, aislamiento tenant.

UI verificada por implementación + type-check; flujo motor ya validado en B2-A.

---

## 8. Limitaciones

- Ventas **online-only** (P2-C1.C para offline).
- Sin SIAT / QR / tarjetas / pagos divididos.
- Comprobante no imprime físicamente (vista modal).
- Listado de ventas de sesión no implementado (solo saldo caja vía GET open).
- Catálogo depende de sync IndexedDB; vacío hasta sincronizar.

---

## 9. GO / NO-GO para P2-C1.C

### **GO**

POS online funcional sobre motor B2-A, con caja, cobro idempotente y comprobante no fiscal.

P2-C1.C puede añadir cola offline de ventas sobre el mismo contrato sync, sin cambiar el motor.

---

**Sin commit / push / deploy / migraciones.**
