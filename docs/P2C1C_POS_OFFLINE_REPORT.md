# P2-C1.C — POS offline-first, outbox y reconciliación

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modalidad:** Offline individual por dispositivo (no multicaja LAN)  
**Estado:** **COMPLETADO** (brief truncado en §5; alcance cubierto con §1–4 + arquitectura P2-C1.A / B2-B)

---

## 0. Dependencias y bloqueos identificados (pre-implementación)

| Ítem | Estado |
|------|--------|
| Motor `SALE_CREATE` / `CASH_*` (B2-A) | Listo — autoridad única |
| Outbox Dexie + `runPushCycle` | Listo — catálogo/inventario |
| Stores `sales` / `cashRegisters` | **Faltaban** → añadidos en Dexie v2 |
| CASH_OPEN/CLOSE offline | **Bloqueado a propósito** en esta fase |
| Lease server-side de caja | **No existe** → política TTL cliente (ver §3) |
| sessionStorage pending B2-B | Migración segura a IDB sin duplicar UUID |

**Ajuste backend mínimo no aplicado:** un “cash session lease” firmado o `expiresAt` en `GET /cash-registers/open` mejoraría la vigencia offline. Con el contrato actual se usa TTL local de 8 h desde la última confirmación server.

---

## 1. Pantallas / UX

| Superficie | Cambio |
|------------|--------|
| `/ventas` | Cobro online o **offline provisional**; lista de ventas pendientes; sync idempotente |
| Comprobante | Modo provisional (`LOCAL-…`) vs confirmado (`COM-…`) |
| Caja | Abrir/cerrar **solo online**; offline usa evidencia local OPEN |

---

## 2. Componentes / módulos nuevos

| Path | Rol |
|------|-----|
| `frontend/lib/pos/posCashAuth.ts` | Evidencia local de caja + política offline |
| `frontend/lib/pos/posSaleOfflineService.ts` | Persistencia atómica venta + outbox, migrate, flush |
| `frontend/tests/offline/sales-cash.test.ts` | Pruebas Vitest offline |
| Dexie v2 `sales`, `cashRegisters` | Estado duradero scoped |

Modificados: `db.ts`, `types.ts`, `outboxService.ts`, `syncPushWorker.ts`, `commercialCatalogService.ts` (stock visible), `ventas/page.tsx`, `PosReceipt.tsx`.

---

## 3. Estado duradero e integración sync

- Scope: `userId + businessId + deviceId` (DB name existente).
- Cada venta guarda: `clientOperationId`, usuario/empresa/dispositivo, caja, líneas, precios observados, total provisional, fecha local, `syncStatus`, errores, `commercialNumber` / `serverSaleId` al confirmar.
- Persistencia **atómica**: `LocalSale` + `OutboxOperation` `SALE_CREATE`.
- Stock visible: `availableStock − Σ qty SALE_CREATE pending|sending` (sin inventar número comercial).
- Reconciliación: `flushPosOutbox` → `runPushCycle` → `applyPushResults` actualiza venta a `confirmed` / `rejected` / `conflict`.
- Migración B2-B: `migrateSessionPendingSale` mueve `sessionStorage` → IDB si el UUID no existe; luego limpia session.

Mutaciones canónicas: solo `SALE_CREATE` en outbox offline. `CASH_OPEN` / `CASH_CLOSE` siguen push online directo.

---

## 4. Reglas de caja offline

| Regla | Implementación |
|-------|----------------|
| No CASH_OPEN offline | UI + sin enqueue |
| No CASH_CLOSE offline | UI + sin enqueue |
| Requiere caja OPEN confirmada server | `upsertConfirmedCash` tras GET open / apertura |
| Scope user/business/device | Validado en auth local |
| Vigencia | `OFFLINE_CASH_AUTH_MAX_MS = 8h` desde `serverConfirmedAt` |
| Sesión | `sessionGate` bloquea mutaciones si refresh vencido |

Códigos: `CASH_NOT_CONFIRMED`, `CASH_AUTH_EXPIRED`, `SESSION_BLOCKED`, `SCOPE_MISMATCH`.

---

## 5. Venta offline y comprobante

- Offline: carrito local → `persistSaleCreate` → comprobante **provisional** (no fiscal, id local).
- Online: misma persistencia → flush inmediato → comprobante definitivo solo si `applied`/`duplicate`.
- Anti doble clic: `chargeLock` + idempotencia UUID en outbox.
- Sin SIAT / QR / tarjetas / pagos divididos.

---

## 6. Errores y reintentos

| Caso | Comportamiento |
|------|----------------|
| Red caída post-persist | Venta `pending` en IDB; UI “Sincronizar” |
| Duplicate | Confirmada sin segunda venta |
| `PRICE_MISMATCH` / `INSUFFICIENT_STOCK` / `CASH_CLOSED` | Outbox `rejected`; venta marcada; stock visible se libera |
| Auth caja vencida | Bloquea nuevas ventas offline |

---

## 7. Pruebas y resultados

| Suite | Resultado |
|-------|-----------|
| FE `tsc` | PASS |
| BE `tsc` | PASS |
| `test:p2c1c:offline` | **6/6 PASS** |
| `test:offline` (regresión) | **39/39 PASS** |
| `test:p2c1b2a:http` | **16/16 PASS** |

Cobertura offline: sin caja, TTL vencido, persist atómico, stock visible, ack→confirm, migrate sessionStorage, validación qty/efectivo.

---

## 8. Limitaciones

- Sin lease server de caja; TTL 8 h es conservador pero no detecta cierre remoto hasta sync.
- CASH_OPEN/CLOSE no offline.
- Saldo de caja offline es snapshot; no se presenta como definitivo tras ventas locales.
- Comprobante provisional no debe entregarse como factura.
- Brief del usuario truncado en §5; no se implementó impresión física ni multicaja LAN.

---

## 9. GO / NO-GO

### **GO** para endurecimiento posterior (lease de caja, UX de conflictos, métricas outbox)

Motor B2-A intacto; ventas offline individuales con outbox durable e idempotencia operativa.

### **NO-GO** para producción fiscal / multicaja / CASH offline

---

**Sin commit / push / deploy / migraciones Prisma.**
