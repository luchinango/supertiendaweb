# P2-C1.G8 — Pre-UAT: cierre de brechas técnicas

**Fecha:** 18/11/2026  
**Entorno:** Docker local `supertienda_dev` + FE **`next start`** `supertienda-fe-prod-local:g8` → `127.0.0.1:3001` + API `:5000`  
**Alcance:** Cerrar/verificar brechas técnicas de G7 antes de UAT humana. **No** piloto comercial. **No** dinero real. **No** FactuBO/SIAT. **No** migrate/restore/reinicio Postgres. **No** commit/push/deploy.  
**Ejecutor:** CTO/QA virtual (lab). Firmas humanas: ninguna.

---

## 0. Veredicto

| Pregunta | Respuesta |
|----------|-----------|
| ¿Brechas G7 técnicas de jornada (UI close / offline→sync / 58–80 mm / cola cajero) cerradas en lab? | **Sí (PASS técnico)** |
| ¿Impresión física aprobada? | **No — PENDIENTE HW** |
| ¿Diálogo de impresión OS verificado? | **PENDIENTE** (botón cableado; stub no observado en harness) |
| ¿Limpieza de cajas OPEN residuales de otros devices? | **No ejecutada** (documentada; requiere autorización) |
| ¿GO para **programar UAT humana supervisada** (sin dinero real)? | **GO condicionado** |
| ¿GO piloto comercial? | **NO-GO** |

---

## 1. Auditoría (G6/G7 + repo)

### Brechas G7 verificadas (no asumidas)

| Brecha G7 | Estado al auditar | Acción G8 |
|-----------|-------------------|-----------|
| B8 cierre caja **desde UI** incompleto | Código `handleCloseCash` ya existía; faltaba evidencia E2E post-offline | Reproducido en sesión única Chromium |
| F2 layout 58 mm no evidenciado | `PosReceipt` ya conmutaba `max-w`; evidencia débil | Anchos medidos 272px→181px + captura |
| F3 diálogo print | `window.print()` presente | Botón validado; diálogo OS **PENDIENTE** |
| F6 reimpresión | «Ver ticket» ya existía | Confirmado sin nueva venta |
| «Revisar cola offline» → `/debug-offline` | **Confirmado** en `OfflineStatusHost.tsx` | Redirigido a Control de jornada |
| Credenciales en guías usuario | Ya limpiadas en G7 | Re-verificado + `.gitignore` interno/evidencias |
| Suites G citadas sin re-ejecutar | Riesgo de PASS stale | Re-ejecutadas hoy (resultados abajo) |

### Cambios de código (mínimos)

| Archivo | Cambio |
|---------|--------|
| `frontend/components/offline/OfflineStatusHost.tsx` | «Revisar cola offline» abre `/ventas#jornada` + evento; debug solo si `development` o `NEXT_PUBLIC_OFFLINE_DEBUG=1` |
| `frontend/components/features/pos/PosDayControlPanel.tsx` | Escucha `#jornada` / evento; sección «Cola offline / provisionales» |
| `frontend/components/features/pos/PosReceipt.tsx` | `data-testid`, anchos 72mm/48mm medibles |
| `frontend/app/productos/page.tsx` | Link `/debug-offline` solo en modo QA |
| `docs/P2C1G6_OPERATOR_GUIDE.md` | Cola → Control de jornada |
| `.gitignore` | `docs/internal/`, `docs/**/p2c1g*-evidence/` |

Pendientes previos G5 (`bumpDayPanel` / `refreshKey`) se mantienen.

### Imagen FE

- Build: `supertienda-fe-prod-local:g8` (`next build` + `next start`).
- Contenedor: `st-fe-prod-g8` en red `supertienda-dev_supertienda_net`, puerto `127.0.0.1:3001`.

---

## 2. Cierre de caja desde UI (sesión única)

Device lab: `p2c1g8-full-session` · Register `R4ed63ff62f9a45c893d`

| Paso | Resultado | Evidencia |
|------|-----------|-----------|
| Abrir caja UI (100) | **PASS técnico** | `S-02-open.png` |
| Venta online | **PASS técnico** | **COM-00000027** · `S-03-online.png` |
| Venta offline | **PASS técnico** | **LOCAL-974618FF** · `S-04-offline.png` |
| Bloqueo cierre con pendiente | **PASS técnico** | `C2` disabled |
| Sync misma sesión | **PASS técnico** | **COM-00000028** (+ COM-27) · `S-06-sync.png` / `matrix-full.json` |
| Cerrar **misma** caja UI | **PASS técnico** | Esperado **133,90** · contado **133,90** · **diff 0,00** · `S-07-close.png` |
| Consultar jornada cerrada | **PASS técnico** | Badge cerrada · 2 SALE_CASH · diff Bs 0,00 · `S-08-day.png` |

DB: register `357` **CLOSED** `opening=100` `current=133.90` `closing=133.90`.

Idempotencia: reimpresión F6 reabrió **COM-00000027** sin crear COM nuevo; totales de caja = 100 + 16,95×2.

### Hallazgo operativo: pendientes offline y sesión de navegador

Un intento intermedio (cerrar Chromium con `LOCAL-…` sin sync) **perdió** el outbox IndexedDB de esa sesión. Mitigación UAT: no cerrar el navegador con pendientes; sync antes de apagar. No se alteró el motor en G8.

### Cajas OPEN residuales (otros devices) — **no cerradas**

Inventario lab (`residual-open-registers.txt`): **16** cajas OPEN en business_id=1 de devices previos (G5/G7/Chromium).

**Procedimiento seguro propuesto (requiere autorización Tech Lead):**

1. Listar `OPEN` por `device_id` / `register_number` / montos (solo SELECT).  
2. Clasificar: device de prueba controlada vs dispositivo “desconocido”.  
3. Cerrar **solo** devices autorizados vía `CASH_CLOSE` del **mismo** `X-Device-Id` + JWT del usuario dueño, con `closingAmount = expected`.  
4. Prohibido: `DELETE` masivo, restore, restart Postgres, cierre cross-device sin auth.  
5. Registrar acta (ids + diff) en evidencia lab.

G8 **no** ejecutó ese cierre residual.

---

## 3. Impresión sin hardware

| ID | Resultado | Evidencia |
|----|-----------|-----------|
| F1 80 mm | **PASS técnico** | `S-F1-80.png` · width **272px** · `data-ticket-width=80` |
| F2 58 mm | **PASS técnico** | `S-F2-58.png` · width **181px** · `48mm` · cambio real vs 80 |
| F3 diálogo print OS | **PENDIENTE** | Botón `Imprimir` presente; stub `window.print` no contabilizó en harness Chromium |
| F4–F5 física | **PENDIENTE HW** | Sin dispositivo |
| F6 reimpresión | **PASS técnico** | `S-F6-reprint.png` · mismo **COM-00000027** |

No se declara impresión física PASS.

---

## 4. Experiencia de cajero («Revisar cola offline»)

**Antes:** el badge flotante navegaba a `/debug-offline` (harness P2-C0.3: crear producto offline, contar IndexedDB, acks técnicos).

**Después (g8):**

- Cajero: botón → `/ventas#jornada` + abre **Control de jornada** (`pos-day-offline-queue`).
- Evidencia: `UX_cola` ok · URL `…/ventas#jornada` · `S-05-cola.png`.
- QA: ruta `/debug-offline` **conservada**; enlace «Debug técnico» solo en `NODE_ENV=development` o `NEXT_PUBLIC_OFFLINE_DEBUG=1`; Catálogo también gateado.

---

## 5. Seguridad documental

| Control | Estado |
|---------|--------|
| Guías G6 operador/UAT sin password DEMO | **OK** (re-grep) |
| Frontend app sin password DEMO hardcodeado | **OK** (solo test offline HTTP con env fallback) |
| Credenciales lab | Solo `docs/internal/` (**gitignored**) |
| Evidencias `p2c1g*-evidence/` | **gitignored**; scripts G8 exigen `SEED_DEV_PASSWORD` sin valor en archivo |
| Informe G8 | **Sin** imprimir secretos |

---

## 6. Regresiones (ejecución real 18/11/2026)

| Suite | Comando | Resultado |
|-------|---------|-----------|
| B2-A | `npm run test:p2c1b2a:http` | **16/16 PASS** |
| B2-B | `npm run test:p2c1b2b:http` | **5/5 PASS** |
| F1 | `npm run test:p2c1f1:http` | **11/11 PASS** |
| Sync | `npm run test:p2c01:http` | **25/25 PASS** |
| Offline FE | `npm run test:offline` | **56/56 PASS** |
| tsc FE | `npm run type-check` | **PASS** |
| tsc BE | `npx tsc --noEmit` | **PASS** |

Logs: `docs/p2c1g8-evidence/G-*.txt` (gitignored).

---

## 7. Matriz resumen pre-UAT

| Ítem | PASS técnico | PASS humano | PENDIENTE | BLOQUEADO | NO-GO |
|------|--------------|-------------|-----------|-----------|-------|
| Jornada UI open→close | ✓ | | | | |
| Offline→sync misma caja | ✓ | | | | |
| Ticket 80/58 ancho real | ✓ | | | | |
| Reimpresión mismo COM | ✓ | | | | |
| Cola cajero → jornada | ✓ | | | | |
| Suites motor | ✓ | | | | |
| Diálogo print OS | | | ✓ | | |
| Impresión física | | | ✓ HW | | |
| UAT cajero/admin presencial | | | ✓ | | |
| Limpieza OPEN residuales | | | ✓ auth | | |
| Piloto comercial | | | | | ✓ |

---

## 8. Brechas que quedan

1. Confirmación humana del diálogo de impresión del SO (F3).  
2. Sesión con impresora térmica real (F4–F5).  
3. UAT presencial firmada (checklist G6).  
4. Autorización para cerrar cajas OPEN residuales de lab.  
5. Capacitación: no cerrar navegador con pendientes sin sync.

---

## 9. GO / NO-GO

| Decisión | Estado |
|----------|--------|
| Programar **UAT humana supervisada** (lab/campo controlado, sin dinero real) | **GO condicionado** — base técnica de G7/G8 lista |
| Declarar UAT humano completo | **NO-GO** |
| Aprobar impresión física | **NO-GO** |
| Iniciar piloto comercial | **NO-GO** |

Condiciones mínimas para la sesión humana: FE g8 `:3001`, cuentas DEMO vía hoja interna, checklist G6 impresa, opcional impresora si se quiere F4/F5.

---

## 10. Cierre

G8 se detiene aquí. Evidencia Chromium en `docs/p2c1g8-evidence/` (no versionar). Imagen `supertienda-fe-prod-local:g8` lista para UAT supervisada. **No** piloto.
