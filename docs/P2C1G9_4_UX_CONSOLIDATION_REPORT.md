# P2-C1.G9.4 — Consolidación UX/UI y preparación de UAT

**Fecha:** 2026-11-18  
**Entorno:** Docker DEMO · API `:5000` · FE `next start` `st-fe-prod-g94` (`127.0.0.1:3001`) · `supertienda-fe-prod-local:g94`  
**Alcance:** Consolidar G9.1–G9.3, corregir solape badge offline, regresiones UAT-ready. **Sin** rediseño estructural nuevo.  
**Firmas humanas UAT:** ninguna en este gate.

---

## 0. Veredicto

| Pregunta | Respuesta |
|----------|-----------|
| ¿UX G9.1–G9.3 consolidada en lab? | **Sí** |
| ¿Badge offline deja de tapar caja/Cobrar en móvil? | **Sí** (integrado en encabezado POS) |
| ¿Regresiones B2-A/B2-B/F1/offline/typecheck? | **PASS** |
| ¿Impresión física / diálogo OS? | **PENDIENTE HW** (heredado G8) |
| ¿UAT humana aprobada? | **No** — falta sesión firmada |
| **GO programar UAT humana supervisada (DEMO, sin dinero real)** | **GO condicionado** |
| ¿Piloto comercial / producción?** | **NO-GO** |

---

## 1. Auditoría de consolidación (clasificación)

### Bloqueantes para UAT humana (lab)

Ninguno técnico nuevo tras G9.4. Condiciones externas:

| ID | Ítem | Estado |
|----|------|--------|
| U1 | Impresión física / diálogo print OS | **PENDIENTE HW** (G7/G8) |
| U2 | Firmas cajero + admin en matriz | **PENDIENTE humano** |

### Importantes no bloqueantes

| ID | Ítem | Estado G9.4 |
|----|------|-------------|
| I1 | Badge flotante solapaba caja en móvil | **CORREGIDO** → header POS |
| I2 | Cierre caja de sesión de prueba si hay pendientes | WARN en lab (sync manual antes de cerrar) |
| I3 | Toolbar ADMIN densa en 320px (catálogo) | Diferido |
| I4 | Cajas OPEN residuales otros devices | **No tocadas** (política) |

### Mejoras futuras

Atajos teclado POS · empty states ilustrados · config con datos reales · modo cajero fullscreen tablet · menú “Más” en toolbar.

---

## 2. Corrección badge offline

**Antes:** `OfflineStatusHost` fixed bottom-left en `/ventas` → podía intersectar tarjeta de caja (`overlapsCash` G9.3).  
**Después:**

- `OfflineStatusHost` **no renderiza** en `/ventas`.
- Nuevo `PosOfflineHeaderStatus` en encabezado: `SyncStatusBadge` (conexión, sesión, pendientes) + enlace **Jornada / cola**.
- Resto de rutas: host flotante bottom-right (sin cambio de lógica sync).

Verificación Chromium: `offline-in-header` **PASS**; viewports 320–1440 sin host flotante; sin scroll horizontal.

Capturas: `before-ventas-badge-mobile.png` (G9.3) → `02-ventas-mobile-header-offline.png`.

---

## 3. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/components/features/pos/PosOfflineHeaderStatus.tsx` | **Nuevo** — estado offline en header |
| `frontend/components/offline/OfflineStatusHost.tsx` | Skip `/ventas`; host solo otras rutas |
| `frontend/app/ventas/page.tsx` | Monta `PosOfflineHeaderStatus` |
| `docs/P2C1G9_4_UX_CONSOLIDATION_REPORT.md` | Este informe |
| `docs/P2C1G9_4_UAT_READINESS_MATRIX.md` | Matriz UAT |

Evidencias: `docs/p2c1g9_4-evidence/`.

---

## 4. Capturas

| Evidencia | Contenido |
|-----------|-----------|
| `before-ventas-badge-mobile.png` | Badge flotante (pre) |
| `02-ventas-mobile-header-offline.png` | Header integrado + sin flotante |
| `03`–`12` | Desktop POS, caja, venta, ticket, offline, jornada, sheet, catálogo |
| `13-reopen-persist.png` | Reapertura mismo perfil |

---

## 5. Regresiones

| Suite | Resultado |
|-------|-----------|
| BE `type-check` | **PASS** |
| BE B2-A POS/caja HTTP | **16/16 PASS** |
| BE B2-B cash read | **5/5 PASS** |
| BE F1 cash lease | **11/11 PASS** |
| FE `type-check` | **PASS** |
| FE `test:offline` | **56/56 PASS** |

Logs: `docs/p2c1g9_4-evidence/{tsc-be,tsc-fe,B2A,B2B,F1,offline-unit}.txt`

### Chromium sesión persistente (`g94-uat3`, device `p2c1g94-uat-device`)

| Check | Resultado |
|-------|-----------|
| Login form | PASS |
| Nav ADMIN / EMPLOYEE | PASS |
| Multiempresa | PASS |
| Offline en header / sin flotante | PASS |
| Viewports 320/390/768/1024/1440 | PASS |
| Caja OPEN (sesión device) | PASS |
| Venta online + ticket | PASS |
| Venta offline provisional | PASS |
| Sync botón listado | WARN (usar bandeja pendientes / autoflush) |
| Jornada | PASS |
| Cerrar caja esta sesión | WARN (pendientes → no forzado; residuales ajenas no tocadas) |
| IDB presente + reopen mismo perfil | PASS |
| Sheet Escape | PASS |
| Catálogo cards móvil | PASS |

`validate-out.txt` · `reopen-out.txt` — **0 FAIL**.

---

## 6. Defectos bloqueantes

Ninguno de producto para iniciar UAT DEMO supervisada.  
Bloqueos externos: HW impresión, firmas humanas.

---

## 7. Deuda técnica diferida

1. Impresión OS/hardware (F3–F5 G8).  
2. Limpieza cajas OPEN residuales (requiere autorización explícita).  
3. Auto-sync UI más explícito tras offline.  
4. Densidad toolbar catálogo 320px.  
5. Config mock → datos reales (roadmap).

---

## 8. Estado impresión OS/hardware

| Ítem | Estado |
|------|--------|
| Preview ticket 58/80 mm | PASS técnico (G7/G8) |
| `window.print` cableado | Presente |
| Diálogo impresión SO | **PENDIENTE** observación humana |
| Impresora térmica física | **PENDIENTE** sesión HW |

---

## 9. GO / NO-GO

**GO condicionado** para **ejecutar UAT humana supervisada** en lab DEMO (`st-fe-prod-g94` `:3001`), sin dinero real ni SIAT, usando `docs/P2C1G9_4_UAT_READINESS_MATRIX.md`.

**NO-GO** producción, piloto comercial y FactuBO.

Detener aquí. Sin commit/push/deploy. No iniciar otra fase sin aprobación.
