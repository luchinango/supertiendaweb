# P2-C1.G1 — Aceptación producción local (`next start`)

**Fecha:** 17 de noviembre de 2026  
**Entorno:** Docker `supertienda_dev` + imagen FE `supertienda-fe-prod-local:g1` en `127.0.0.1:3001`  
**Frontend dev:** permanece en `:3000` (sin mezclar `.next`)  
**Dinero real / Facto / SIAT / commit / deploy:** **no**

---

## Veredicto

### **GO condicionado** para piloto DEMO supervisado

Criterio bloqueante de PWA cumplido: **`/ventas` recarga offline en `next start`** (sin `chrome-error://`), con catálogo/caja y venta provisional persistida. Sync posterior generó **`COM-00000004`** una sola vez para ese `deviceId` (caja 100,00 → 116,95).

Condiciones operativas del lab:

1. Build FE con `INTERNAL_API_URL=http://supertienda-backend:5000` (rewrites `/api` congelados en build).
2. Backend con `CORS_ORIGIN` que incluya `http://127.0.0.1:3001` si el FE prod usa puerto 3001.
3. Impresión física: **pendiente** (sin impresora).
4. Sin Facto/SIAT.

---

## 1. Build y configuración

| Ítem | Resultado | Notas |
|------|-----------|-------|
| Dockerfile `npm ci` + `NODE_ENV=production` post-install | **PASS real** | Heredado G0 + `ARG INTERNAL_API_URL` |
| `postcss` unificado `@tailwindcss/postcss` | **PASS** | `.js` / `.ts` alineados |
| `docker build --target production` → `g1` | **PASS real** | Compile OK; sin volumen `next dev` |
| Smoke HTTP `:3001` `/login` `/ventas` manifest `sw.js` | **PASS real** | 200 |
| Rewrite `/api` → backend Docker DNS | **PASS real** tras rebuild | `routes-manifest`: `http://supertienda-backend:5000/:path*` |
| Proxy login `/api/auth/login` | **PASS real** | `success=true` `admin_a` |
| CORS FE `:3001` → API `:5000` | **PASS real** tras recreate backend | Sin esto: `Failed to fetch` / preflight |

**Hallazgo:** Next congela rewrites en build. `INTERNAL_API_URL` solo en runtime **no** basta.  
**Hallazgo:** `CORS_ORIGIN` por defecto solo contempla `:3000`; el puerto de aceptación `:3001` debe autorizarse explícitamente.

---

## 2. Pruebas de navegador (Chromium / Playwright host)

Usuario DEMO: `admin_a` / `DevPass123!`.

| Escenario | Resultado | Evidencia |
|-----------|-----------|-----------|
| Login + POS `:3001` | **PASS real** | UI Ada AdminA; tokens en `localStorage` |
| Sync catálogo | **PASS real** | 4 productos con precio Bs |
| Abrir caja + lease | **PASS real** | `OPEN · R… · saldo ref. Bs 100,00 · v1` |
| Preparar offline | **PASS real** | SW controller; caches `st-pwa-v2-{precache,static,nav}` |
| Offline + venta provisional | **PASS real** | `LOCAL-ED0CC739 · Bs 16,95 · pending` |
| Cache Storage sin API privada | **PASS real** | `privateHits=[]` |
| Navegador IDE Cursor → `:5000` directo | **FAIL entorno** | Aislamiento; no representa Chrome host |

---

## 3. Arranque y recarga offline

| Escenario | Resultado | Evidencia |
|-----------|-----------|-----------|
| `context.setOffline(true)` + `goto /ventas` | **PASS real** | URL `/ventas`; `posHydrated=true`; `Sin conexión` |
| Catálogo + caja tras reload | **PASS real** | `OPEN ·` + productos; lease ~7h |
| Persistencia venta provisional | **PASS real** | `Ventas provisionales (1)` + `LOCAL-ED0CC739` tras reload |
| Soft RSC prefetch offline | Ruido esperado | Fallos `_rsc` / nav laterales; cold document OK |

---

## 4. Ventas y sincronización

| Escenario | Resultado | Evidencia |
|-----------|-----------|-----------|
| Venta offline provisional | **PASS real** | LOCAL pending |
| Reconexión + aplicación | **PASS real** | Caja UI `Bs 116,95 · v2` (= 100 + 16,95) |
| Número COM único | **PASS real** (DB) | `COM-00000004` / total `16.95` / `device_id=8b91ca30-…` |
| COM visible en lista POS post-sync | **Pendiente UI** | No listado en body tras sync; confirmado en Postgres |
| Stock una vez | **PASS real** (indicio) | Aceite stock 23 post-venta; sin doble cobro observado |

---

## 5. Seguridad multiempresa

| Escenario | Resultado | Tipo |
|-----------|-----------|------|
| IDB scope `u/b/d` | **PASS real** | `supertienda_offline__u1__b1__d8b91ca30-…` |
| Cache ≠ datos comerciales | **PASS real** | Solo shell `st-pwa-v2-*` |
| Sesión / lease vencidos | **PASS unitario** | Vitest sales-cash |
| Cross-tenant sync/caja | **PASS unitario/HTTP** | Sync S11; B2-A; F1 scope |
| Logout / cambio usuario E2E cruzado en `:3001` | **Pendiente browser** | Cubierto en código F2 + HTTP |
| Update SW con pendientes | **PASS código** (F2) | Gate outbox; no re-probado E2E G1 |

---

## 6. Impresión

| Ítem | Resultado |
|------|-----------|
| CSS `@media print` 80 mm / 58 mm | **PASS real** (CSSOM en prod) |
| Leyenda `COMPROBANTE NO FISCAL` | **PASS código** (`PosReceipt.tsx`) |
| Preview ticket LOCAL / COM en UI G1 | **Pendiente** (no se abrió modal en corrida) |
| Impresora térmica física | **Pendiente** — **no** verificada |

---

## 7. Conflictos

| Escenario | Resultado | Tipo |
|-----------|-----------|------|
| Duplicate `clientOperationId` sin doble cobro | **PASS HTTP** | B2-A idempotencia |
| `VERSION_CONFLICT` ≠ duplicate | **PASS unitario/HTTP** | Sync S8; F3/outbox |
| Rechazo visible para revisión | **PASS unitario** | Outbox status |
| Cierre caja bloqueado con provisionales | **PASS código/unitario** | Política C1.C / F2 |

No se alteraron operaciones rechazadas ni se generaron ventas automáticas fuera del flujo de prueba.

---

## 8. Regresiones

| Suite | Resultado |
|-------|-----------|
| `tsc` frontend (contenedor) | **PASS** |
| `tsc` backend (contenedor) | **PASS** |
| B2-A POS/caja HTTP | **16/16 PASS** |
| B2-B cash read HTTP | **5/5 PASS** |
| F1 cash lease HTTP | **11/11 PASS** |
| Sync P2-C0.1 HTTP | **25/25 PASS** |
| FE `test:offline` (F2+motor) | **56/56 PASS** |
| FE `test:p2c1f3:offline` | **17/17 PASS** |
| FE `test:p2c1c:offline` | **12/12 PASS** |
| Simulación 7 días | **No ejecutada** (evitar efectos DEMO) |

---

## 9. Riesgos pendientes

| ID | Riesgo | Severidad | Mitigación |
|----|--------|-----------|------------|
| R1 | CORS olvidado al usar FE prod en puerto ≠3000 | Alta lab | Documentar `CORS_ORIGIN` / allowlist |
| R2 | Rewrite `/api` mal bakeado sin `INTERNAL_API_URL` en build | Alta | Build-args obligatorios en runbook |
| R3 | Redirect post-login a veces no navega (tokens sí) | Media | Abrir `/ventas` manual si hace falta |
| R4 | Impresión hardware no probada | Media | Probar 80 mm antes del piloto físico |
| R5 | Prefetch RSC offline genera ruido en consola | Baja | Ignorar; cold reload es el contrato |
| R6 | Disco host casi lleno (~10 GB libres en corrida) | Media | `docker builder prune` antes de rebuilds |

---

## 10. GO/NO-GO piloto DEMO supervisado

| Criterio G1 | Estado |
|-------------|--------|
| Build aislado `next start` OK | **PASS real** |
| PWA recarga `/ventas` offline | **PASS real** |
| Venta provisional + persistencia | **PASS real** |
| Sync sin doble cobro (COM + caja) | **PASS real** |
| Aislamiento datos (HTTP + IDB scope) | **PASS** |
| Errores críticos de duplicación/stock/aislamiento | **No observados** |
| Facto/SIAT | Fuera de alcance |

### Veredicto final: **GO condicionado**

Piloto DEMO local supervisado autorizado con checklist G0 + CORS/`INTERNAL_API_URL` del §1.  
Impresión física y E2E logout cruzado quedan como tareas de campo, no bloquean este GO.

Sin commit, push ni deploy en esta fase.
