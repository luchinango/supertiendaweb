# P2-C1.A — Auditoría y diseño seguro de POS, ventas y caja

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** solo lectura y diseño — **sin implementación, sin schema, sin migraciones, sin ventas reales**  
**Precondiciones:** P2-D2 cerrado (catálogo + inventario offline); sync push→pull operativo para catálogo/stock  
**Estado:** propuesto — **requiere autorización explícita** antes de P2-C1.B / P2-C1.C

**Documentos leídos:** `P2C0_OFFLINE_FIRST_ARCHITECTURE.md`, `P2C01_SYNC_FOUNDATION_PLAN.md`, `P2C01B_SYNC_API_REPORT.md`, `P2CA_SYNC_READINESS_REPORT.md`, `P2CB_PRIVATE_CATALOG_API_REPORT.md`, `P2C03_CATALOG_SYNC_REPORT.md`, `P2D2_INVENTORY_UI_REPORT.md`

---

## 0. Resumen ejecutivo

El POS y la caja **no están listos para producción ni para offline**.

| Capa | Realidad verificada |
|------|---------------------|
| UI `/ventas` | Pantalla operativa visual; **checkout = `console.log`** (`PaymentPanel` / `SalesForm`) |
| Caja frontend | Abre vía `POST /api/cash-registers/open` — ruta **legacy no montada** en el app actual → falla en runtime real |
| Backend sale/pos/cart/caja | Controllers Express **sin TSOA**; imports **comentados** en `app.ts`. Solo `RegisterRoutes` (TSOA) + `employeeRoutes` |
| Sync | `SALE_COMPLETE`, `SALE_CANCEL`, `CASH_OPEN`, `CASH_CLOSE` → **`NOT_IMPLEMENTED`** (REJECTED, sin efecto) |
| Stock en venta legacy | `updateInventory` hace `decrement` **sin** validar negativo ni `version` condicionada |
| Pagos | **No hay modelo `Payment`**; un solo `paymentMethod` / `paymentStatus` en `Sale` |
| Numeración | `Sale.invoiceNumber` y `CashRegister.registerNumber` son **`@unique` globales** |

Catálogo/inventario offline (P2-C0.2–D2) **sí** aportan: UUID outbox, `sync_operations`, `BusinessProduct.version`, `customPrice`, `STOCK_ADJUST` atómico. El POS debe **montar** encima de ese núcleo, no reutilizar el checkout mock.

---

## 1. Estado real del POS y caja

### 1.1 Modelos Prisma relevantes

| Modelo | Observación crítica |
|--------|---------------------|
| `Sale` | Tenant `businessId`; `cartId` unique; `invoiceNumber` **unique global**; campos SIAT (`authorizationCode`, `controlCode`); `paymentMethod`/`paymentStatus` embebidos; `cashRegisterId` opcional; **sin `version`**, sin UUID cliente |
| `SaleItem` | `productId`, `unitPrice`, tax/discount/total — **sin snapshot de nombre/SKU**; FK a `Product` vivo |
| `Cart` / `CartItem` | Carrito online; `unitPrice` desde BP; unique carrito ACTIVE por `(businessId, userId, status)` |
| `CashRegister` | Una caja OPEN por `(businessId, userId)` en lógica de servicio; `registerNumber` **unique global**; **sin `deviceId`**; sin tabla de movimientos in/out |
| `AuditCashRegister` | Log OPEN/CLOSE (y acciones similares); no es libro de caja completo |
| `InventoryTransaction` | Append-only; tipos `SALE` / `ADJUSTMENT` / …; usado por `STOCK_ADJUST` sync y por `saleService.updateInventory` |
| `BusinessProduct` | Fuente de `customPrice` + stock + `version` (P2-C0.1) |
| `FiscalSettings` | Contador `invoiceCurrentNumber` por empresa (race condition si no se usa UPDATE atómico condicional) |
| `SyncOperation` | Idempotencia durable ya en producción local para ops de catálogo/stock |
| `Payment` | **No existe** como entidad |

### 1.2 Backend montado vs legacy

```text
app.ts (real)
  CORS → json → RegisterRoutes(app)  // TSOA: auth, sync, products, BP, catalog privado, …
  app.use('/api', employeeRoutes)
  // saleRoutes, posRoutes, cartRoutes, cashRegisterRoutes → COMENTADOS
```

| Componente | Tipo | Montado |
|------------|------|---------|
| `SyncService` / `/sync/push|pull` | TSOA | **Sí** |
| Catalog comercial / BP | TSOA | **Sí** |
| `saleController` / `saleService` | Express legacy | **No** |
| `posController` / `posService` | Express legacy | **No** |
| `cashRegisterController` / service | Express legacy | **No** |
| `saleItemController` | Express legacy | **No** |

**Consecuencia:** una UI que “vende” o “abre caja” **no implica** persistencia real en el stack actual.

### 1.3 Frontend

| Ruta / pieza | Comportamiento |
|--------------|----------------|
| `/ventas` | Catálogo vía `useCatalog` (API online); carrito `CartContext` en memoria |
| `PaymentPanel.completeTransaction` | `console.log({...})` — **sin API** |
| `SalesForm` | `console.log` al guardar |
| `CashRegisterManager` | Llama servicio → `/cash-registers/open` (404/error si no hay proxy a legacy montado) |
| `/productos`, `/inventario` | Comercial offline-first (P2-D1/D2) — **no** checkout |

### 1.4 Precio en código legacy (cuando se montaba)

- `cartService.addItem`: precio = `businessProduct.customPrice`; valida `currentStock >= quantity` al **añadir** al carrito (no al completar).
- `posService` quick products: `price: Number(bp.customPrice)`.
- `saleService.create`: copia precios del carrito a `SaleItem`; **no** revalida `customPrice` al commit.
- `saleService.updateInventory`: decrementa BP **sin** chequear stock final ≥ 0 ni `WHERE version = ?`.

### 1.5 Sync hoy (relevante POS)

Ops reconocidas pero **rechazadas**:

- `SALE_COMPLETE`, `SALE_CANCEL`
- `CASH_OPEN`, `CASH_CLOSE`
- `CUSTOMER_CREATE`

Ops útiles ya implementadas: `STOCK_ADJUST`, `BP_UPSERT`, catálogo privado.

---

## 2. Riesgos de seguridad e integridad

| # | Riesgo | Severidad | Evidencia |
|---|--------|-----------|-----------|
| R1 | UI de venta falsa sensación de cobro | **Crítica** | `console.log` checkout |
| R2 | Stock negativo en venta legacy | **Alta** | `decrement` sin guard |
| R3 | Doble venta / doble pago sin idempotencia HTTP en sale/pos | **Alta** | Sin `clientOperationId` en controllers legacy |
| R4 | `invoiceNumber` unique global + contador fiscal no atómico | **Alta** | Schema + `generateInvoiceNumber` race |
| R5 | `registerNumber` unique global | **Media** | Colisiones multi-empresa |
| R6 | Sin snapshot nombre/SKU en `SaleItem` | **Media** | Renombrar producto altera historial |
| R7 | Un solo método de pago; sin split / sin trazabilidad de intentos | **Media** | Schema `Sale` |
| R8 | Caja sin deviceId → misma sesión lógica en dos dispositivos | **Alta** para Modalidad 2 | Modelo + servicio |
| R9 | Completar venta sin caja abierta (solo `cashRegisterId` null) | **Media** | `openCashRegister?.id \|\| null` |
| R10 | Tenant: `getAll` sales sin filtro business en legacy | **Alta** si se remonta sin reescribir | `saleService.getAll` |
| R11 | Pagos electrónicos offline | **Crítica** si se permite | Decisión P2-C0.1 #8: **requieren red** |
| R12 | Confundir ticket local con factura SIAT | **Alta** legal/comercial | Campos SIAT en `Sale` + numeración offline |

---

## 3. Diseño transaccional propuesto

### 3.1 Respuestas a integridad comercial

| # | Pregunta | Diseño propuesto |
|---|----------|------------------|
| 1 | Precio final desde `customPrice` | Al armar línea: leer BP activo del JWT `businessId`. **Prohibido** `Product.sellingPrice` como fallback comercial (alineado P2-D1/D2). |
| 2 | Snapshot precio/nombre | Persistencia en ítem: `productName`, `sku` (opc.), `unitPrice` (= customPrice al momento), `productId`, `businessProductId`. No depender del Product vivo para ticket. |
| 3 | Validar stock | En commit: `availableStock` (o política `currentStock - reserved`) ≥ qty **dentro de la misma tx**, con `WHERE version = baseVersion`. |
| 4 | Descontar stock una vez | Un solo `updateMany` condicional por línea + `InventoryTransaction` `SALE` en la **misma** tx Prisma que crea `Sale`. Idempotencia `sync_operations` evita reejecutar. |
| 5 | `InventoryTransaction` | Solo en servidor al apply; cliente **nunca** finge movimiento confirmado (igual que P2-D2 STOCK_ADJUST). |
| 6 | No duplicar venta | `clientOperationId` UUID = clave de idempotencia (`sync_operations` o header en API online). Mismo UUID+hash → `duplicate` + mismo `responseJson`. |
| 7 | No duplicar pagos | MVP: pago embebido en `SALE_CREATE` (un cobro). Split payments → tabla `SalePayment` con UUID propio **dependsOn** venta; fuera de MVP salvo aprobación. |
| 8 | Descuentos | Snapshot en venta: `discountAmount` cabecera + opcional por línea; totales recalculados en servidor (cliente envía intent; servidor es autoridad). |
| 9 | Concurrencia | Optimistic lock BP `version`; advisory lock ya usado en sync por `(businessId, clientOperationId)`. |
| 10 | Stock insuficiente al sync | **`rejected` `INSUFFICIENT_STOCK`** (decisión P2-C0.1 #4: conciliación, **no** oversell). UI: venta local `rejected`, no “cobrada en servidor”. |

### 3.2 Transacción atómica servidor (`SALE_CREATE` / complete)

Orden dentro de `prisma.$transaction`:

1. Validar actor (`ADMIN`/`EMPLOYEE`), `businessId`, caja OPEN (si política exige caja).  
2. Idempotencia: si `clientOperationId` existe → devolver resultado previo.  
3. Por cada línea: cargar BP; verificar stock; `updateMany` stock+version; crear `InventoryTransaction`.  
4. Crear `Sale` + `SaleItem[]` (snapshots).  
5. Actualizar `CashRegister.currentAmount` si pago `CASH` (regla de producto).  
6. Persistir `sync_operations` APPLIED + `idMappings`.  
7. Asignar **numeración definitiva** server-side (ver §5).

Si cualquier paso falla → rollback completo; sin venta huérfana ni stock a medias.

### 3.3 Online (sin outbox)

Mismo handler que sync apply, expuesto como:

- `POST /sales` o `POST /pos/sales` con `Idempotency-Key` = UUID  
o  
- únicamente vía `POST /sync/push` con una op (recomendado para un solo camino de verdad).

**Recomendación:** un solo camino de apply (`SyncService.handleSaleCreate`) invocado por push **y** por endpoint online fino que encola/ejecuta la misma función — evita divergencia.

---

## 4. Diseño offline e idempotencia

### 4.1 Operaciones UUID (Modalidad 2 — caja individual)

| operationType | Payload esencial | baseVersion | dependsOn |
|---------------|------------------|-------------|-----------|
| `CASH_OPEN` | `openingAmount`, `localCashId`, `deviceId`, notes | — | — |
| `SALE_CREATE` | líneas (productId/BP id, qty, unitPrice snapshot, name), totals, `paymentMethod`, `localSaleId`, `localCashId` / `cashRegisterServerId`, `discountAmount` | por cada BP tocado **o** lista `stockBases[]` | `[CASH_OPEN]` si caja aún pending |
| `SALE_CANCEL` | `saleServerId` o `localSaleId`, reason | versión venta si se añade | venta acked |
| `CASH_CLOSE` | `closingAmount`, `localCashId`/`serverId`, summary | versión caja si se modela | ventas pending de esa caja **acked o rejected** (política) |
| `SALE_PAYMENT` (fase 2) | montos split | — | `SALE_CREATE` |

Alias: el código sync hoy nombra `SALE_COMPLETE`; se recomienda unificar a **`SALE_CREATE`** (creación atómica) o implementar `SALE_COMPLETE` con la semántica de create+pay. **Decisión de naming → aprobación.**

### 4.2 Estados de venta local (UI obligatorio)

| Estado UI | Significado | Puede mostrarse como “cobrada servidor” |
|-----------|-------------|----------------------------------------|
| `pending` | En outbox / enviando | **No** — ticket **provisional** |
| `acked` | Servidor applied/duplicate | **Sí** — numeración definitiva si vino en mapping |
| `rejected` | INSUFFICIENT_STOCK, VALIDATION, FORBIDDEN, caja cerrada, … | **No** — acción de corrección |
| `conflict` | VERSION_CONFLICT stock/precio | **No** — revisión explícita |

Proyección de stock local (como P2-C0):  
`displayStock = serverSnapshot + Σ STOCK_ADJUST pending − Σ SALE_CREATE pending`  
sin inventar `InventoryTransaction` local.

### 4.3 Orden de sync

```text
1) CASH_OPEN (si pending)
2) SALE_CREATE… (deps caja + categorías/productos ya acked)
3) SALE_CANCEL…
4) CASH_CLOSE (solo si no quedan ventas pending de esa caja, o política “cerrar con pendientes” rechazada)
```

Push existente: deps solo contra ops **acked** (no same-batch). Mantener.

### 4.4 Pagos electrónicos

- `CASH`, crédito interno tienda: permitidos offline con estados claros.  
- `QR_PAYMENT`, `CREDIT_CARD`, pasarelas: **online-only**; si no hay red → bloquear cobro (P2-C0.1 #8).  
- No generar “pago aprobado” local sin respuesta del proveedor.

### 4.5 Reinicio / cambio usuario / sesión

| Evento | Regla |
|--------|-------|
| Reinicio navegador | Outbox Dexie por scope `(userId, businessId, deviceId)` sobrevive |
| Cambio de usuario | Nuevo scope DB; **no** mezclar outbox; ventas pending del usuario A no las empuja B |
| Refresh vencido | Bloquear **nuevas** mutaciones (ya en sessionGate); push de pending: política actual pausa si refresh vencido — mantener y documentar en UI |
| Caja cerrada en server | `SALE_CREATE` → `rejected` `CASH_CLOSED` |

---

## 5. Modelo de numeración y documentos

### 5.1 Situación actual

- `Sale.invoiceNumber` `@unique` **global**.  
- Generación: `FiscalSettings.invoiceSeries + pad(invoiceCurrentNumber)` luego `+1` — **race** entre requests.  
- `CashRegister.registerNumber` `@unique` **global**.  
- Campos SIAT en `Sale` sugieren factura fiscal, pero **no hay integración SIAT verificada** en el flujo montado.

### 5.2 Propuesta (requiere migración + aprobación)

| Concepto | Definición |
|----------|------------|
| `localTicketNumber` | UUID o contador por dispositivo; **solo comprobante interno provisional** |
| `invoiceNumber` definitivo | Asignado **solo en servidor** al apply; unique **`(businessId, invoiceNumber)`** |
| Ticket vs factura | UI: “Comprobante interno (pendiente de sync)” ≠ “Factura autorizada” |
| Caja | `registerNumber` unique **`(businessId, registerNumber)`** o derivado `deviceId + seq` |
| Fiscal Bolivia | **No declarar cumplimiento**; cualquier emisión SIAT es fase separada con validación contable/normativa |

### 5.3 Decisiones que requieren validación normativa/contable (Bolivia)

1. ¿El comprobante offline puede mostrarse al cliente antes del CUF/autorización SIAT?  
2. ¿La serie/numeración debe alinearse a dosificación vigente por sucursal?  
3. ¿IVA 13% embebido en precio o desglose obligatorio en ticket?  
4. ¿Quién es el emisor (NIT empresa) en multicaja un dispositivo?  
5. Conservación de PDFs/XML y plazos legales — fuera de MVP técnico.

**Este documento no inventa numeración fiscal ni afirma cumplimiento tributario.**

---

## 6. Migraciones propuestas (solo diseño — no aplicar)

> Ninguna se ejecuta en P2-C1.A. Listado para autorización en P2-C1.B.

| ID | Cambio | Motivo |
|----|--------|--------|
| M1 | `Sale.invoiceNumber`: unique global → **`(businessId, invoiceNumber)`** | Multi-tenant + sync |
| M2 | `Sale.clientOperationId` UUID unique `(businessId, …)` o confiar solo en `sync_operations` | Trazabilidad |
| M3 | `SaleItem.productName` (+ `sku` opcional), `businessProductId` | Snapshot |
| M4 | `CashRegister.registerNumber` → unique por empresa; `deviceId` NOT NULL | Modalidad 2 |
| M5 | `CashRegister.version` (opc.) / estado CLOSE atómico | Cierres duplicados |
| M6 | Tabla `cash_movements` (IN/OUT/SALE_CASH) **o** ampliar `AuditCashRegister` | Ingresos/egresos |
| M7 | Opcional `sale_payments` | Split / no duplicar cobros |
| M8 | Contador fiscal: `UPDATE … SET current = current+1 WHERE current = $expected RETURNING` | Race |
| M9 | Enum sync: confirmar `SALE_CREATE` vs renombrar `SALE_COMPLETE` | Contrato |

**Sin M1–M4, offline + multi-empresa es frágil.** Remount de legacy sin migrar **no** es aceptable.

---

## 7. Contratos API propuestos

### 7.1 Sync push (ampliación)

```json
{
  "clientOperationId": "uuid",
  "operationType": "SALE_CREATE",
  "dependsOn": ["cash-open-uuid"],
  "payload": {
    "localSaleId": "uuid",
    "cashRegisterId": 123,
    "localCashId": "uuid",
    "customerId": null,
    "paymentMethod": "CASH",
    "discountAmount": 0,
    "notes": null,
    "lines": [
      {
        "productId": 10,
        "businessProductId": 100,
        "productName": "Arroz 1kg",
        "sku": "SKU-SHARED-001",
        "quantity": 2,
        "unitPrice": 8.5,
        "taxRate": 13,
        "discountAmount": 0,
        "baseVersion": 4
      }
    ]
  }
}
```

Resultados: `applied | duplicate | conflict | rejected` + `idMappings` (`sale`, `saleItem`) + `server.invoiceNumber` + stocks/versions.

Códigos: `INSUFFICIENT_STOCK`, `VERSION_CONFLICT`, `CASH_CLOSED`, `CASH_REQUIRED`, `FORBIDDEN_ROLE`, `VALIDATION`, `PRICE_MISMATCH` (si se exige tolerancia 0 entre snapshot y customPrice actual — **política**).

### 7.2 Caja

```json
// CASH_OPEN
{ "localCashId": "uuid", "openingAmount": 100, "deviceId": "…", "notes": "…" }

// CASH_CLOSE
{ "cashRegisterId": 1, "localCashId": "uuid", "closingAmount": 250, "notes": "…" }
```

Reglas: una OPEN por `(businessId, userId, deviceId)`; segundo `CASH_OPEN` → reject o duplicate según idempotencia.

### 7.3 Online (opcional en C1.B)

- `POST /pos/sales` → Idempotency-Key → mismo apply.  
- `GET /pos/sales/:id` tenant-scoped.  
- `POST /cash-registers/open|close` tenant + device headers (`X-Device-Id`).

Legacy Express **no** se remonta tal cual; se reescribe bajo TSOA + auth JWT igual que sync.

### 7.4 Pull

Streams futuros `sales` / `cash` (o embeber en `stock` solo efectos). MVP C1.B puede: apply push + pull stock (BP) sin pull de ventas históricas; listado ventas = proyección local + pull opcional fase 2.

---

## 8. Plan P2-C1.B — backend transaccional

### Objetivo

Implementar apply atómico de venta y caja en `SyncService` (+ endpoints TSOA mínimos), con tests HTTP Docker local.

### Archivos previstos

| Área | Archivos |
|------|----------|
| Sync | `backend/src/services/SyncService.ts`, posiblemente `SaleSyncService.ts` / `CashSyncService.ts` |
| TSOA | nuevos controllers o extensión Sync; `routes.ts` / swagger regenerados **en Docker** |
| Authz | mirror ADMIN/EMPLOYEE; caja por usuario+device |
| Schema | migración M1–M6 según aprobación |
| Tests | `backend/tests/run-p2c1b-sales-http.ts` (nuevo) |

### Endpoints

- Extender `POST /sync/push` (ops nuevas).  
- Opcional: `POST /pos/sales`, `POST /cash-registers/open|close`.  
- **No** remount ciego de `saleRoutes` legacy.

### Migraciones

Condicionadas a §6 y §9. Sin aprobación de M1/M4 → **detener** implementación offline de numeración.

### Riesgos C1.B

- Race fiscal; oversell si se ignora version; montar legacy inseguro; SIAT accidental.

### Pruebas C1.B (mínimo)

Ver §10 escenarios 1–7, 11–14 vía HTTP.

### Criterios de aceptación C1.B

1. `SALE_CREATE` applied descuenta stock una vez + 1 `InventoryTransaction` SALE.  
2. Reintento mismo UUID → duplicate, sin segundo movimiento.  
3. Stock insuficiente → rejected, sin Sale.  
4. Dos empresas aisladas.  
5. `CASH_OPEN`/`CLOSE` idempotentes; segunda OPEN concurrente controlada.  
6. Tenant 403/404 cross-business.  
7. Legacy UI no es requisito; sync harness suficiente.

---

## 9. Plan P2-C1.C — interfaz POS y ventas offline

### Objetivo

Reemplazar checkout mock de `/ventas` por flujo offline-first (como catálogo/inventario), caja individual, estados pending/acked/rejected visibles.

### Archivos previstos

| Área | Archivos |
|------|----------|
| Página | `frontend/app/ventas/page.tsx` (reescritura) |
| Offline | `lib/sales/*`, `lib/cash/*`, extensión Dexie stores (`sales`, `cashRegisters`, outbox types) |
| UI | carrito local, cobro CASH, tickets provisionales, OutboxReviewPanel |
| Hooks | `usePosCart`, `useCashSession` |
| Tests | `tests/offline/sales-cash.test.ts` |

### Riesgos C1.C

- Mostrar venta pending como facturada; cobro QR offline; mezclar scopes de usuario; ignorar caja cerrada.

### Criterios de aceptación C1.C

1. Cobro CASH encola `SALE_CREATE`; UI dice **provisional** hasta ack.  
2. Offline → reopen browser → outbox intacta → sync sin duplicar.  
3. EMPLOYEE puede vender si backend lo permite; mismos gates.  
4. Rechazo stock visible + no “éxito servidor”.  
5. Responsive (shell P2-D2).  
6. Sin PWA/service worker (restricción vigente).

---

## 10. Escenarios de prueba de diseño (obligatorios)

| # | Escenario | Expectativa de diseño |
|---|-----------|------------------------|
| 1 | Venta online | Apply atómico; invoice server; stock−; IT×1 |
| 2 | Venta offline + sync | pending → acked; ticket provisional → definitivo |
| 3 | Pérdida de respuesta post-commit | Reintento mismo UUID → duplicate; UI acked |
| 4 | Reintento mismo UUID | Sin segunda Sale ni segundo IT |
| 5 | Dos ventas concurrentes stock insuficiente | Una applied, otra INSUFFICIENT_STOCK |
| 6 | Dos empresas | Aislamiento total sales/caja/stock |
| 7 | Caja cerrada | SALE rejected CASH_CLOSED |
| 8 | Reinicio navegador | Outbox/sales locales persisten |
| 9 | Cambio de usuario | Scope distinto; no push cruzado |
| 10 | Sesión vencida | Sin nuevas mutaciones; UI clara |
| 11 | Duplicación de pago | Un pago por SALE_CREATE MVP; duplicate no dobla |
| 12 | Rechazo venta pending | Estado rejected; stock local reconciliado tras pull |
| 13 | Conflicto de precio/versión | conflict; no silent overwrite |
| 14 | Numeración provisional vs definitiva | Nunca mostrar serie fiscal local como autorizada |

---

## 11. Decisiones que requieren aprobación

Antes de P2-C1.B, autorizar explícitamente:

1. **Nombre de op:** `SALE_CREATE` vs implementar `SALE_COMPLETE` existente.  
2. **Migraciones M1–M8** (especialmente unique invoice/caja y deviceId).  
3. **¿Venta exige caja OPEN?** (recomendado: sí en Modalidad 2).  
4. **Política PRICE_MISMATCH:** ¿servidor impone customPrice actual o respeta snapshot cliente dentro de tolerancia? (recomendado MVP: snapshot cliente + baseVersion stock; precio no reclacula en silencio).  
5. **Oversell:** confirmado **no** (solo rejected) — reconfirmar.  
6. **Split payments / créditos cliente** en MVP o fase 2.  
7. **Pull stream de ventas** en C1.B o diferir.  
8. **Alcance fiscal SIAT:** fuera de C1.B/C salvo spike documentado.  
9. **Remount legacy Express:** **prohibido** sin reescritura TSOA.  
10. **Ingresos/egresos de caja** (tabla nueva vs audit only).

---

## 12. Qué no hacer todavía

- No migraciones / db push / Prisma CLI host.  
- No implementar handlers SALE/CASH.  
- No modificar POS UI más allá de este diseño.  
- No ventas reales ni borrar datos de prueba.  
- No commit / push / deploy.

---

**Fin P2-C1.A.** Esperar autorización para P2-C1.B (backend) y/o P2-C1.C (UI).
