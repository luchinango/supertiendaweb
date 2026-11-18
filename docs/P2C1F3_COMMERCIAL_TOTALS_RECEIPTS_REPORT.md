# P2-C1.F3 — Cálculos comerciales, impuestos y tickets no fiscales

**Fecha:** 17 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Entorno:** Docker local `supertienda_dev`  
**Estado:** **COMPLETADO — GO para la siguiente fase**  
**SIAT / facturación electrónica:** no implementada (explícito)

---

## 1. Diagnóstico de cálculos anteriores

| Capa | Comportamiento previo | Problema |
|------|----------------------|----------|
| **Backend `SALE_CREATE`** | `unitPrice` = `customPrice` **neto**; IVA **aditivo** por línea `lineSub × (taxRate/100)` con `Product.taxRate ?? 13`; `total = Σsub + Σtax − discount` | Correcto como autoridad |
| **POS UI** | `estimateTaxInclusiveTotal = subtotal × 1.13` fijo | Ignoraba `taxRate` por producto; podía diferir del servidor |
| **`posSaleOfflineService`** | `provisionalTotal = subtotal − discount` **sin IVA** | Efectivo/cambio y ticket provisional **subestimaban** el total |
| **`PosReceipt`** | Líneas pre-IVA; provisional con doble descuento posible (`provisionalTotal` ya neto + discount otra vez) | Totales inconsistentes |
| **Pull catálogo** | Payload producto **sin** `taxRate` | FE no podía espejar la fórmula |
| **`FiscalSettings` / SIAT** | Existen en esquema; **no** usados en POS | Correcto no inventar fiscalidad |

---

## 2. Contrato comercial definitivo

Interpretación única (espejo de `PosCashSyncService.handleSaleCreate`):

| Campo | Definición |
|-------|------------|
| Precio unitario | `BusinessProduct.customPrice` (**neto**, no incluye IVA) |
| Cantidad | Entero &gt; 0 |
| Subtotal línea | `unitPrice × quantity` |
| IVA línea | `subtotalLínea × (taxRate / 100)`; `taxRate` de `Product` (default **13**) |
| Total línea | `subtotalLínea + IVA − descuentoLínea` |
| Subtotal venta | Σ subtotales línea |
| Impuestos | Σ IVA línea |
| Descuento cabecera | `discountAmount` (si se envía) |
| **Total final** | `subtotal + impuestos − descuentoCabecera` |
| Efectivo / cambio | Cliente; cambio = `max(0, efectivo − total)` |
| Autoridad | **Servidor** en confirmación; provisional = misma fórmula con datos locales |

**Limitación documentada:** no hay configuración fiscal por empresa en el motor POS (`FiscalSettings` no aplica). El IVA es el del `Product.taxRate`. Cambio mínimo futuro (con autorización): usar `Business.defaultTaxRate` si el producto no define tasa — **sin** SIAT.

---

## 3. Cambios backend

| Archivo | Cambio |
|---------|--------|
| `SyncService.ts` | Pull de producto incluye `taxRate` |
| `PosCashSyncService.ts` | Respuesta `SALE_CREATE` ampliada: `subtotal`, `taxAmount`, `discountAmount`, `lines[]` (desglose); `totalAmount` intacto |

Sin migración de esquema.

---

## 4. Cambios frontend

| Archivo | Cambio |
|---------|--------|
| `lib/pos/commercialTotals.ts` | **Nuevo** — fórmula compartida + redondeo + cambio |
| `commercialTypes` / `commercialCatalogService` | `taxRate` en catálogo local |
| `offline/types` (`LocalSale` / líneas) | Totales provisionales + `confirmedTotal*` + `totalsAdjusted` |
| `posSaleOfflineService` | Persistencia con total c/IVA; valida efectivo contra ese total |
| `outboxService` | Al confirmar: guarda totales servidor; **no** reescribe `provisionalTotal`; ajusta `change`; marca `totalsAdjusted` si difiere |
| `ventas/page.tsx` | Eliminado `×1.13`; UI Subtotal / IVA / Total; aviso explícito si difiere |
| `PosReceipt` | Ticket no fiscal enriquecido + impresión |

---

## 5. Comprobante no fiscal

- Leyenda fija: **COMPROBANTE NO FISCAL**
- Provisional: **PENDIENTE DE SINCRONIZACIÓN**
- Confirmado: “Confirmado por servidor”
- Nombre comercial, fecha/hora, LOCAL-/COM-, líneas con qty × precio e IVA %, subtotal, impuestos, descuento, total, efectivo, cambio
- Si `totalsAdjusted`: aviso de diferencia provisional vs definitivo (**sin** mutar el provisional cobrado)
- Disclaimer: no factura fiscal / no SIAT

---

## 6. Impresión

- Botón **Imprimir** → `window.print()`
- `@media print` en `globals.css`: oculta nav/dashboard/botones; ticket ~**80 mm**; variante **58 mm** vía `@page`/`max-width`
- Sin drivers de hardware específicos

---

## 7. Pruebas online/offline

| Caso | Resultado |
|------|-----------|
| Unit fórmula (15→16.95; default 13; dto; redondeo; cambio) | PASS (5) |
| Offline sales-cash con total c/IVA | PASS (12) |
| PWA shell F2 | PASS |
| Offline suite completa | **56/56 PASS** |
| B2-A / B2-B / F1 / Sync HTTP | 16+5+11+25 PASS |
| `tsc` FE/BE | PASS |

---

## 8. VERSION_CONFLICT (investigación F2)

**Hallazgo en IDB F2:** coexistían ventas `confirmed` (`COM-00000001/2`) y un `conflict` con `VERSION_CONFLICT` — **clientOperationId distintos**.

| Código | Significado |
|--------|------------|
| `duplicate` | Mismo `clientOperationId` + mismo hash → **ya aplicada**; no segundo descuento |
| `VERSION_CONFLICT` | `baseVersion` / CAS de stock **obsoleto** en un intento **nuevo** (o reintento con payload/version vieja) — **no** es “venta ya aplicada” |
| `INSUFFICIENT_STOCK` | Rechazo definitivo de stock |

**Acción F3:** mensaje UI explícito en sync: conflicto de versión ≠ duplicado idempotente; pedir sync de catálogo y reintento con `baseVersion` fresca. No se marca automáticamente como exitosa una operación distinta.

---

## 9. Regresiones

| Suite | Resultado |
|-------|-----------|
| B2-A | 16/16 |
| B2-B | 5/5 |
| C1.C / F3 offline | 17/17 (totals+sales-cash) |
| F1 lease | 11/11 |
| F2 pwa-shell | 6/6 |
| Sync | 25/25 |
| Offline total | 56/56 |
| TypeScript FE/BE | PASS |

Cash lease, outbox, PWA, multiempresa e idempotencia: **conservados**.

---

## 10. Riesgos pendientes

1. Productos sin `taxRate` en IDB antigua hasta próximo pull → FE usa default 13 (igual BE).
2. Redondeo línea a línea vs agregados Decimal del servidor: diferencia &lt; 0.01 posible → `totalsAdjusted` + aviso.
3. Impresión depende del diálogo del navegador / impresora térmica del SO.
4. Descuentos por línea en payload aún no se envían desde UI (campo soportado en motor).
5. `FiscalSettings` sigue fuera del alcance POS (correcto hasta fase SIAT autorizada).

---

## 11. GO/NO-GO

| Criterio | Estado |
|----------|--------|
| Misma fórmula FE/BE (neto + IVA aditivo) | OK |
| POS no usa `×1.13` ciego | OK |
| Total/cambio alineados al cobro provisional | OK |
| Diferencia servidor **advertida**, provisional no reescrito | OK |
| Ticket no fiscal + print 80/58 | OK |
| VERSION_CONFLICT distinguido de duplicate | OK |
| Regresiones motor/sync/lease/PWA | OK |

### Veredicto: **GO → siguiente fase**

Sin commit, push ni deploy. Sin SIAT.
