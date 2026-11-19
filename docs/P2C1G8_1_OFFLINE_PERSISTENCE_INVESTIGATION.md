# P2-C1.G8.1 — Investigación: pérdida de outbox offline

**Fecha:** 18/11/2026  
**Entorno:** Docker local + FE `next start` `st-fe-prod-g8` `:3001`  
**Alcance:** Causa de la “pérdida” de venta offline al cerrar Chromium reportada en G8.  
**No** piloto · **No** dinero real · **No** FactuBO/SIAT · **No** migrate/restore · **No** cierre de cajas residuales ajenas · **No** commit/push.

---

## 0. Veredicto

| Pregunta | Respuesta |
|----------|-----------|
| ¿Hubo defecto de producto que borra IndexedDB al cerrar el navegador? | **No demostrado.** Con perfil persistente los datos **sobreviven**. |
| ¿Causa raíz de lo observado en G8? | **Harness de pruebas efímero** (Chromium one-shot sin `user-data-dir` estable). |
| ¿Corrección de producto requerida? | **No.** Corrección de **procedimiento QA/UAT**. |
| GO recuperación offline (producto) | **GO** (alineado con G5) |
| GO UAT humana | **GO condicionado** (mismo navegador/perfil hasta sync; no incógnito desechable) |

---

## 1. Causa raíz demostrada

### Qué pasó en G8

1. Script one-shot `browser.mjs` (sin `--session`) creó `LOCAL-…` en IndexedDB de un **perfil temporal**.
2. Al terminar el proceso, Chromium se cierra y el perfil temporal se **descarta**.
3. Un segundo one-shot (p. ej. `run-g8-ui-finish.mjs`) abrió un **perfil nuevo**, reinyectó el mismo `deviceId` en `localStorage`, pero IndexedDB estaba vacío → aparentó “pérdida de outbox”.

Documentación del harness (`browser-automation` skill):

- One-shot: “Cookies, logins and page state do **not** survive”.
- Cada run obtiene “its own temporary profile”.
- `--session <id>` usa `--user-data-dir=…/ab-sessions/<id>-profile` y **sí** persiste.

`localStorage.clear()` en scripts G8 **no** es la causa primaria: IndexedDB no se borra con clear; el perfil entero sí desaparece en one-shot.

### Evidencia contrastada

| Experimento | Perfil | Mismo `deviceId` | Tras 2.º proceso |
|------------|--------|------------------|-----------------|
| A — efímero pass1→pass2 | Temporal (one-shot) | Sí (`p2c1g81-ephemeral-device`) | `databases: []`, `lostAcrossEphemeralRuns: true` |
| B — persistente close→reopen | `--session g81-outbox` + user-data-dir | Sí (`p2c1g81-persist-device`) | Misma DB; venta `4479b310` presente → sync **COM-00000029** |

Archivos: `docs/p2c1g8_1-evidence/00-ephemeral-pass*.json`, `01-before-close.json`, `02-after-reopen.json`, `analysis-persist.json`.

### Hipótesis descartadas (con evidencia)

| Hipótesis | Resultado |
|-----------|-----------|
| Dexie no escribe outbox | **Descartada** — pass1 escribió `sales`+`outbox` pending |
| Cambio de origin | **Descartada** — siempre `http://127.0.0.1:3001` |
| Cambio de user/business/device en producto | **Descartada** en perfil persistente (`u1/b1/d…` estable) |
| Race que borra outbox al cerrar pestaña | **Descartada** — reload/nav offline mantienen `LOCAL-D6AE786E` |
| Pérdida real al cerrar navegador con perfil real | **Descartada** — datos sobreviven al `--close` + reopen del mismo profile |

---

## 2. Pasos exactos de reproducción

### 2.A Reproducir la “pérdida” (harness) — como G8

```text
1. One-shot browser.mjs + script: login, abrir caja, offline, venta LOCAL
2. Verificar IndexedDB pending=1
3. Terminar proceso (perfil temporal destruido)
4. Nuevo one-shot con el mismo deviceId en localStorage
5. Observar: databases=[] o sales=[]  → falsa pérdida
```

### 2.B Demostrar persistencia real (perfil estable)

```text
1. browser.mjs --session g81-outbox …/01-create-offline.mjs
2. Verificar escritura IDB (pending sales+outbox)
3. browser.mjs --session g81-outbox --close   # mata Chrome; NO borra user-data-dir
4. browser.mjs --session g81-outbox …/02-reopen-after-close.mjs
5. Observar: misma DB; venta presente (pending o ya confirmada si hubo nav online)
```

### 2.C Pestaña / reload offline

```text
1. Con sesión persistente y red off: crear LOCAL
2. page.reload() sin red → mismo LOCAL y sameDb
3. Ir a /dashboard y volver a /ventas sin red → pending intacto
```

Evidencia: `03-reload-nav.json`, capturas `03-after-*.png`.

---

## 3. Evidencias antes / después

### Identidad (sin tokens)

| Campo | Valor lab |
|-------|-----------|
| origin | `http://127.0.0.1:3001` |
| userId / businessId | `1` / `1` |
| deviceId persistente | `p2c1g81-persist-device` |
| DB Dexie | `supertienda_offline__u1__b1__dp2c1g81-persist-device` |

### Persistente — antes de cerrar Chromium

- UI: `LOCAL-4479B310`
- IDB: 1 sale `pending`, 1 outbox `SALE_CREATE` `pending`

### Persistente — después de close + reopen

- Misma DB / mismo deviceId
- Sale `4479b310` → `confirmed` + **COM-00000029** (auto-sync al navegar online al reabrir)
- Outbox `acked`
- DB servidor: 1 sale + 1 `cash_movements` para ese COM (sin duplicar)

### Reload offline

- `LOCAL-D6AE786E` antes y después de F5; `sameDb: true`
- Tras navegar dashboard→ventas offline: `pendingSales: 1`

### Nota secundaria (no es pérdida de outbox)

Tras sync de COM-29, una segunda venta offline (`d6ae786e`) quedó en IndexedDB como **`conflict`** (no borrada). No generó segundo COM. Comportamiento de rechazo/conflicto; la fila permanece para revisión en Control de jornada. Fuera del alcance de “pérdida al cerrar Chromium”.

---

## 4. Correcciones realizadas

### Producto

**Ninguna.** Dexie/outbox/scope `u+b+d` se comportan correctamente cuando el perfil del navegador es estable.

### Procedimiento / documentación

| Cambio | Detalle |
|--------|---------|
| `P2C1G6_OPERATOR_GUIDE.md` | Regla de oro #6: outbox ligado al perfil; no incógnito/datos borrados antes de sync |
| `.gitignore` | Evidencias `p2c1g8_*-evidence/` |
| Procedimiento QA | Tests de persistencia **deben** usar `--session` + user-data-dir; one-shot solo para UI puntual |

Scripts de evidencia: `docs/p2c1g8_1-evidence/` (gitignored).

---

## 5. Pruebas y regresiones

| Prueba | Resultado |
|--------|-----------|
| Escritura IDB tras venta offline | **PASS** |
| One-shot 2.º proceso “pierde” datos | **PASS** (reproduce falso negativo G8) |
| Persistencia tras cierre completo Chromium (perfil estable) | **PASS** |
| Persistencia tras reload offline | **PASS** |
| Persistencia tras navegar away/back offline | **PASS** |
| Sync idempotente COM-29 (1 sale, 1 movimiento) | **PASS** |
| FE `npm run test:offline` | **56/56 PASS** |
| Multiempresa | No regresión de scope en esta corrida (DB nombre incluye `b{businessId}`) |

---

## 6. Cajas residuales OPEN (separado)

Inventario G8: **16** OPEN ajenas — **sin modificar** en G8.1.

Durante esta investigación se abrieron cajas de devices `p2c1g81-*` (conteo OPEN business_id=1 observado ~18). **No se cerraron** cajas residuales históricas ni se propone hacerlo aquí.

Cualquier limpieza sigue el procedimiento de G8 §2 (autorización Tech Lead, `CASH_CLOSE` same-device, sin DELETE/restore).

---

## 7. Riesgos residuales

| Riesgo | Nivel | Mitigación |
|--------|-------|------------|
| QA one-shot interpreta falso “bug de outbox” | Medio | Usar `--session` / perfil fijo en UAT técnica |
| Cajero borra datos del sitio o usa incógnito | Alto | Guía operador regla #6; briefing UAT |
| Nav online al reabrir sync automática | Bajo | Esperado; idempotente |
| Ventas en `conflict` sin COM | Medio | Visible en Control de jornada; no auto-retry ciego |

---

## 8. GO / NO-GO

| Decisión | Estado |
|----------|--------|
| Recuperación offline del **producto** (cerrar/reabrir mismo perfil) | **GO** |
| Confiar en one-shot Chromium para validar persistencia | **NO-GO** (método inválido) |
| Programar UAT humana | **GO condicionado** — briefing: mismo navegador/perfil hasta sync; no borrar datos del sitio |
| Piloto comercial | **NO-GO** (fuera de alcance) |

---

## 9. Recomendación UAT humana

1. Usar Chromium/Chrome **normal** (no incógnito) en el puesto de caja.  
2. Tras venta offline: verificar `LOCAL-…` en Control de jornada **antes** de cerrar el navegador.  
3. Preferir sync antes de apagar el equipo.  
4. Si se cierra el navegador con pendientes: al reabrir el **mismo** perfil, la cola debe reaparecer; luego sync.  
5. Tech QA: cualquier automatización de persistencia con `browser.mjs --session <id>` (o perfil `--user-data-dir` explícito), nunca one-shot entre pasos.

---

## 10. Cierre

G8.1 concluye: la pérdida reportada en G8 fue un **artefacto del harness efímero**, no borrado de Dexie/outbox en el producto. Detener aquí.
