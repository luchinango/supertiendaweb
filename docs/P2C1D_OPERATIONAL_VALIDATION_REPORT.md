# P2-C1.D — Validación operativa POS online/offline

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Entorno:** Docker local (`supertienda-db` / `supertienda-backend` / `supertienda-frontend`)  
**Estado:** **COMPLETADO** — listo para simulación comercial controlada (no producción)

---

## 1. Estado real del POS

| Capacidad | Estado |
|-----------|--------|
| Login ADMIN/EMPLOYEE | Operativo |
| Sync catálogo IndexedDB | Operativo |
| CASH_OPEN / CASH_CLOSE online | Operativo |
| Venta online vía outbox + `/sync/push` | Operativo |
| Venta offline provisional durable | Operativo |
| Persistencia tras reload | Operativo |
| Sync → `COM-…` definitivo | Operativo |
| Stock −1 una sola vez | Operativo (navegador + motor) |
| Movimiento caja una sola vez | Operativo |
| Cierre bloqueado con pendientes | **Corregido en D** |
| TTL caja 8 h sin renovar en cada GET | **Corregido en D** |
| Total c/IVA en UI vs servidor | **Alineado en D** (estimación 13%) |
| SIAT / QR / multicaja LAN | No implementado (fuera de alcance) |

Motor transaccional: P2-C1.B2-A (única autoridad). Offline: Modalidad 2 (dispositivo individual).

---

## 2. Pruebas de navegador ejecutadas

Automatización: Cursor IDE Browser MCP sobre `http://127.0.0.1:3000` + API `:5000`.

| # | Paso | Resultado |
|---|------|-----------|
| 1 | Login `admin_a` / `DevPass123!` | PASS → `/dashboard` |
| 2 | `/ventas` + Sync catálogo | PASS |
| 3 | Abrir caja (100) | PASS · OPEN · v1 |
| 4 | Agregar Arroz al carrito | PASS |
| 5 | Venta online | PASS · `COM-00000001` |
| 6 | Comprobante + stock 100→99 · caja 100→109,61 | PASS |
| 7 | Offline (CDP `Network.emulateNetworkConditions` + event) | PASS · badge / botón offline |
| 8 | Venta provisional Aceite | PASS · `LOCAL-3B4BB7A1` · stock 25→24 |
| 9–10 | Reload online · pendiente persiste | PASS |
| 11–13 | Sincronizar → `COM-00000002` | PASS |
| 14–15 | Stock sin doble descuento · caja 109,61→126,56 | PASS |
| 16 | Cerrar caja online | PASS · sin OPEN |

**No se declara PASS de navegador solo por unitarias:** el flujo anterior se ejecutó en UI real.

Nota: navegación full-reload con red CDP offline falla (Next shell); la venta offline se validó sin recargar el documento, y la persistencia se validó con reload **online**.

---

## 3. Pruebas offline y reconciliación

| Suite | Resultado |
|-------|-----------|
| `test:p2c1c:offline` | **8/8 PASS** (incluye TTL no renovado + reject libera stock) |
| `test:offline` regresión | **41/41 PASS** |
| `test:p2c1b2a:http` | **16/16 PASS** |
| `test:p2c1b2b:http` | **5/5 PASS** |
| FE/BE `tsc` | PASS |

Reconciliación observada: outbox `SALE_CREATE` → `acked` · venta `confirmed` · `pendingSaleQtyByBp` deja de reservar · pull muestra stock servidor.

---

## 4. Conflictos detectados

| ID | Hallazgo | Severidad |
|----|----------|-----------|
| D-1 | Cerrar caja con ventas provisionales sin aviso | Alta → **fixado** |
| D-2 | `serverConfirmedAt` se renovaba en cada GET open (TTL infinito online) | Media → **fixado** |
| D-3 | Comprobante: total servidor c/IVA vs cambio calculado sin IVA | Media → **fixado** (estimación UI + total servidor en receipt) |
| D-4 | Contaminación secuencia `COMMERCIAL_TICKET` + cleanup B2-A que reseteaba a 0 → falsos `CASH_ALREADY_OPEN` | Media (test hygiene) → **fixado** |
| D-5 | Server no conoce ventas offline pendientes al `CASH_CLOSE` | Alta residual → documentado (lease / check cliente) |
| D-6 | Dos pestañas: `chargeLock` solo por pestaña | Baja · UUID distintos = dos ventas legítimas |

---

## 5. Correcciones aplicadas

1. **UI:** bloqueo de “Cerrar caja” si `listPendingLocalSales().length > 0` + mensaje.
2. **`upsertConfirmedCash`:** conserva `serverConfirmedAt` si la misma caja sigue OPEN; `touchCashServerConfirmation` tras `CASH_OPEN`.
3. **POS totals:** `estimateTaxInclusiveTotal` (IVA 13% default) para cobro/cambio; receipt usa `server.totalAmount` al confirmar.
4. **Tests B2-A cleanup:** no reinicia secuencia a 0 si ya hay `COM-…` en DB; aserción de numeración aislada sin exigir `COM-00000001`.
5. **Tests C1.C:** TTL estable + reject `INSUFFICIENT_STOCK` libera stock visible.

Sin cambios de schema Prisma. Sin migraciones.

---

## 6. Riesgos pendientes de caja

| Riesgo | Mitigación actual | Mejora recomendada (requiere autorización) |
|--------|-------------------|--------------------------------------------|
| Cierre remoto de caja mientras hay ventas offline | Sync → `CASH_CLOSED` reject; stock local se libera | **Cash lease** firmado en `GET /cash-registers/open` / `CASH_OPEN` con `expiresAt` |
| TTL 8 h solo cliente | Conservador; no se renueva en GET | Lease server + reloj server |
| Server `CASH_CLOSE` no ve outbox cliente | Bloqueo UI obligatorio | Opcional: endpoint “pending sales count” por device |
| Impuesto definitivo vs estimación UI | Estimación 13%; servidor manda | Incluir `taxRate` en catálogo sync pull para estimación exacta |

### Diseño mínimo de lease (no implementado)

```text
CASH_OPEN / GET open → { cashRegisterId, version, leaseExpiresAt, leaseId }
Cliente: offline sales solo si now < leaseExpiresAt && leaseId coincide
Server SALE_CREATE: rechazar si lease vencido o caja CLOSED
Sin migración de tablas nuevas si leaseExpiresAt va en respuesta + validación por openedAt+TTL server-side
```

---

## 7. Resultado seed DEMO

**Ejecutado** en contenedor:

```bash
docker exec -w /app -e SEED_CONFIRM_LOCAL=1 -e SEED_DEV_PASSWORD=DevPass123! \
  -e DATABASE_URL=postgresql://supertienda:supertienda_dev@db:5432/supertienda_dev?schema=public \
  -e NODE_ENV=development supertienda-backend npm run db:seed:demo
```

| Ítem | Valor |
|------|--------|
| Script | `backend/prisma/seed.demo.ts` · `npm run db:seed:demo` |
| Empresas | Demo Norte/Sur/Centro · NIT `9100001001/2002/3003` · ids 3–5 |
| Usuarios | `demo_admin_1..3`, `demo_emp_1..3` |
| Productos | 150 (90 shared + 20 privados × 3) |
| BP | ~330 con precios distintos / stock 0 / bajo / normal |
| Ventas/cajas seed | **Ninguna** |
| Empresas técnicas | Intactas (`9000001016/2016`) |

Plan detallado: [`docs/P2C1D_SEVEN_DAY_COMMERCIAL_PLAN.md`](./P2C1D_SEVEN_DAY_COMMERCIAL_PLAN.md).

---

## 8. Plan de siete días

Documento separado (preparación ≠ ejecución). Días 1–7 cubren online, inventario, offline, conflictos, dual-user, aislamiento y conciliación. **Simulación completa no ejecutada** en esta fase.

---

## 9. Regresiones

| Área | Resultado |
|------|-----------|
| Offline Vitest | 41/41 |
| POS HTTP B2-A | 16/16 (tras fix cleanup) |
| Cash read B2-B | 5/5 |
| TypeScript FE/BE | PASS |
| Contaminación comercial numbers por demo UI | Mitigada en cleanup de tests |

---

## 10. GO / NO-GO para simulación comercial

### **GO condicionado** para simulación de 7 días en Docker local

Justificación:

- Navegador E2E online + offline + sync sin duplicar stock/caja.
- Outbox durable e idempotencia verificadas.
- Cierre con pendientes bloqueado en UI.
- Seed DEMO idempotente listo.
- No se observó pérdida silenciosa de operaciones ni doble cobro en el flujo validado.

### Condiciones

1. Solo `supertienda_dev` Docker — **no producción**.
2. Usar usuarios/dispositivos DEMO documentados.
3. No cerrar caja con provisionales (UI ahora lo impide).
4. Tratar lease server como deuda antes de producción.
5. No declarar GO de producción fiscal / SIAT.

### **NO-GO producción**

---

**Sin commit / push / deploy / migraciones / db push / restore.**
