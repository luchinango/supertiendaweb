# P2-C1.G5 — Resiliencia operativa y preparación de campo

**Fecha:** 18 de noviembre de 2026  
**Entorno:** Docker `supertienda_dev` + FE prod `supertienda-fe-prod-local:g5` en `127.0.0.1:3001`  
**Dinero real / FactuBO / SIAT / commit / deploy / migraciones / re-seed / DROP:** **no**

---

## Veredicto

### **GO** para preparación de piloto de campo (supervisado, no fiscal)

El POS recupera ventas provisionales tras cierre de pestaña, recarga offline y pérdida de red; la sincronización es idempotente; lease inválido y caja cerrada remotamente rechazan sin duplicar; el panel de jornada se actualiza tras venta/sync/cierre; SW no cachea API. Impresión física sigue **PENDIENTE**.

---

## 1. Correcciones

| Ítem | Cambio |
|------|--------|
| Auto-refresh Control de jornada | `refreshKey` + `bumpDayPanel()` tras apertura, venta confirmada/provisional, sync pendiente, reconexión y cierre |
| Carreras de reload | Generación `reloadGen` en `PosDayControlPanel` — descarta respuestas obsoletas |
| Separación de datos | Reload carga IndexedDB (pendientes/rechazos) aparte del `GET /cash-registers/session` (solo confirmados) |

Archivos: `frontend/components/features/pos/PosDayControlPanel.tsx`, `frontend/app/ventas/page.tsx`.

---

## 2. Recuperación offline (navegador)

Chromium + `next start` `:3001` (`g5`):

| Escenario | Resultado | Evidencia |
|-----------|-----------|-----------|
| Venta offline + navegación away/reopen sin red | **PASS real** | Pending `LOCAL-115a29e1` persistió |
| Recarga de página offline con pendiente | **PASS real** | `hasPending=true` |
| IndexedDB scope `u/b/d` | **PASS real** | `supertienda_offline__u1__b1__d63fcce2a-…` |
| Cierre bloqueado con provisional | **PASS real** | `Cerrar caja` disabled |

---

## 3. Recuperación de sincronización

| Escenario | Resultado | Evidencia |
|-----------|-----------|-----------|
| Reconexión + sync de pendiente | **PASS real** | `COM-00000016`; panel 2 ventas · Bs 33,90; pending cleared |
| Pérdida de red durante uso offline (fetch fallidos) | **PASS real** | Errores `ERR_INTERNET_DISCONNECTED` esperados; outbox intacto |
| Reinicio controlado `supertienda-backend` | **PASS real** | Health OK; sesión CLOSED legible |
| Timeout cliente luego reintento mismo `clientOperationId` | **PASS real** | `clientTimedOut=true`, retry=`duplicate`, 1 sale + 1 `SALE_CASH` |
| Caja cerrada remotamente antes de sync | **PASS real** | `CASH_CLOSED`; conteo de sales sin incremento |
| Lease inválido | **PASS real** | `LEASE_INVALID` rejected |

**No ejecutado / no autorizado:** reinicio de PostgreSQL, Docker Desktop (salvo arranque previo ya caído del lab), ni contenedores compartidos ajenos a `supertienda-backend`.

---

## 4. Idempotencia

| Check | Resultado |
|-------|-----------|
| Re-push mismo UUID+payload → `duplicate` | **PASS** (API G5 + B2-A) |
| Filas `sales` / `cash_movements` / `inventory_transactions` = 1 | **PASS** |
| Timeout + retry no dobla cobro/stock | **PASS** (1/1/1) |
| Panel no suma provisionales al esperado servidor | **PASS** (browser: esperado solo tras COM) |

---

## 5. Seguridad

| Check | Resultado |
|-------|-----------|
| Dexie DB por `userId` + `businessId` + `deviceId` | **PASS** (nombre verificado en Chromium) |
| SW caches `st-pwa-v2-*` sin `/api`, `:5000`, `/auth`, `/sync`, cash | **PASS** (`hasApi=false`) |
| `isApiRequest` / `shouldBypassCache` en `public/sw.js` | Confirmado en código |
| Datos locales no borrados para forzar PASS | Cumplido |

---

## 6. Control de jornada

| Check | Resultado |
|-------|-----------|
| Tras venta online, panel muestra totales sin pulsar Actualizar | **PASS real** (`Bs 16,95 · 1 venta`, `stillZero=false`) |
| Tras sync, 2 ventas · 33,90 sin doble conteo | **PASS real** |
| Offline: bandeja local; sin inventar totales servidor | **PASS** (diseño + prueba) |

---

## 7. Impresión

### Estado

- Comprobante **no fiscal** visual 80/58 mm en `PosReceipt` (botones + `window.print()`).
- Impresión física térmica: **PENDIENTE** (sin hardware en lab).

### Guía breve de configuración (campo)

1. Conectar impresora térmica ESC/POS USB o red; instalar driver del fabricante (o genérico “Generic / Text Only”).
2. En Windows: **Configuración → Impresoras** → establecer como predeterminada la térmica **o** seleccionarla en el diálogo de impresión del navegador.
3. Ancho de papel: elegir **80 mm** o **58 mm** en el ticket POS antes de **Imprimir** (ajusta CSS `@page` / ancho del comprobante).
4. En el diálogo de impresión del navegador: desactivar encabezados/pies de Chrome; márgenes mínimos; escala 100%.
5. Probar con un ticket DEMO; verificar corte y alineación. Documentar modelo exacto en el acta de campo.
6. No usar este flujo para factura fiscal SIAT/FactuBO.

---

## 8. Regresiones

| Suite | Tipo | Resultado |
|-------|------|-----------|
| B2-A | HTTP | **16/16 PASS** |
| B2-B | HTTP | **5/5 PASS** |
| F1 (incl. lease expirado unit) | HTTP + unit | **11/11 PASS** |
| Sync P2-C0.1 | HTTP | **25/25 PASS** |
| FE `test:offline` (lease vencido UI logic) | Unit/Vitest | **56/56 PASS** |
| `tsc` FE / BE | Typecheck | **PASS** |
| Chromium recovery matrix | Browser | **PASS** (sección 2–3) |
| API resilience G5 | HTTP script | **13/13 PASS** |

---

## 9. Riesgos pendientes

| Riesgo | Severidad | Nota |
|--------|-----------|------|
| Impresora térmica no validada en hardware | Media | Bloquea solo checklist de impresión física |
| Auto-refresh depende de `bumpDayPanel` en rutas conocidas | Baja | Eventos nuevos deben llamar bump |
| RSC prefetch falla ruidoso offline (consola) | Baja | No afecta outbox; shell PWA sigue |
| Lease de larga duración offline vs cierre remoto | Media | Mitigado: `CASH_CLOSED` al sync; capacitar cajero |
| FactuBO / SIAT | Alta si se exige fiscal | Fuera de alcance — NO-GO fiscal |

---

## 10. GO/NO-GO — preparación de piloto de campo

| Criterio | Estado |
|----------|--------|
| Recuperación offline (pestaña/reload) | **PASS** |
| Sync idempotente / sin doble cobro | **PASS** |
| Lease / caja remota | **PASS** |
| Backend restart tolerado | **PASS** |
| Jornada auto-refresh | **PASS** |
| SW sin datos privados | **PASS** |
| Regresiones motor | **PASS** |
| Impresión física | **PENDIENTE** |
| Fiscal | **NO-GO** |

### Veredicto: **GO** para preparación de piloto de campo comercial no fiscal supervisado

Condiciones: lab/piloto con checklist de impresora en sitio; sin FactuBO/SIAT; sin dinero real hasta validación de impresora si el ticket físico es requisito operativo del local.
