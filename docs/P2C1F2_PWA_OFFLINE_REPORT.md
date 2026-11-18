# P2-C1.F2 — PWA offline-first y arranque sin conexión

**Fecha:** 16–17 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Entorno:** Docker local `supertienda_dev` (`next dev` + API :5000)  
**Estado:** **COMPLETADO — GO para P2-C1.F3**  
**Esquema PostgreSQL:** sin cambios

---

## Por qué se cortaba el agente

Las pruebas con CDP usaban `Runtime.evaluate` **incluyendo `location.href` / reload** dentro de una Promise larga. Al navegar, Chrome destruye el execution context (`Execution context was destroyed`) y el turno del agente quedaba a medias. Mitigación: navegar solo con `browser_navigate` / Network CDP, y evaluates cortos **sin** cambiar de documento.

---

## 1. Arquitectura PWA

| Capa | Rol |
|------|-----|
| `public/sw.js` (`st-pwa-v2`) | Shell + estáticos; **no** API/JSON/JWT |
| `manifest.webmanifest` | Instalación standalone |
| IndexedDB (Dexie) | Catálogo, caja/lease, ventas, outbox (sin cambio de motor) |
| Auth snapshot + JWT claims | Arranque offline sin `/auth/verify` |
| `runPushCycle` / `flushPosOutbox` | Única cola al reconectar (`probeApiHealth`) |

Biblioteca PWA: **no** Serwist/`next-pwa` — SW custom compatible con App Router + `next dev` (runtime cache + warm).

---

## 2. Manifest e instalación

- Nombre: **SuperTienda** / short_name **SuperTienda**
- `start_url`: `/ventas`, `display`: `standalone`, theme `#0f766e`
- Iconos técnicos `/icons/icon-192.png` y `icon-512.png` (teal + marca mínima)
- Metadata en `app/layout.tsx` + link manifest
- Requisitos de instalabilidad presentes (manifest + iconos + SW controlando)

---

## 3. Estrategias de caché

| Recurso | Estrategia |
|---------|------------|
| Precache | `offline.html`, manifest, favicon, icons |
| `/_next/static/*`, CSS/JS | Cache-first (`ignoreSearch` para `?v=` de next dev) |
| Navegación `/ventas`, `/productos`, `/inventario`, `/dashboard` | Network-first → cache HTML **solo status 200** |
| `/api/*`, `:5000`, auth/sync/cash | Network-only (nunca Cache Storage) |
| RSC (`_rsc`, headers RSC) | Bypass / no warm |

Actualización: versión `st-pwa-v*`; activate borra caches viejas; `SKIP_WAITING` solo tras gate de outbox (o force).

---

## 4. Seguridad de datos

- Cache Storage ≠ datos comerciales (Dexie por scope `u/b/d`)
- Login limpia nav cache; logout limpia tokens + snapshot + nav cache; **no** borra IndexedDB
- Lease F1 sigue bloqueando ventas offline inválidas
- `authService.me()` propaga error de red (antes devolvía `success:false` y **borraba** sesión offline)

---

## 5. Arranque offline

Preparación online: login → sync catálogo → abrir caja (lease) → **Preparar offline** (`warmPwaShellCache`).

Luego: desconectar → cerrar/reabrir o reload `/ventas` → shell desde SW → restore sesión (snapshot/JWT) → catálogo/caja locales → ventas provisionales si lease/sesión OK.

---

## 6. Pruebas reales de navegador

| ID | Escenario | Resultado | Evidencia |
|----|-----------|-----------|-----------|
| A | Visita online + SW + preparación | **PASS** | SW controller; caches `st-pwa-v2-*`; botón Preparar offline |
| B | Carga offline `/ventas` | **PASS** | Sin `chrome-error://`; URL `/ventas` |
| C | Reload offline `/ventas` | **PASS** | POS hidratado offline |
| D | Reabrir sin red (navigate offline) | **PASS** | Mismo flujo B/C |
| E | Catálogo local visible | **PASS** | Aceite/Arroz/Stock en UI offline |
| F | Venta provisional offline | **PASS** | `LOCAL-… · Bs 15,00 · pending` |
| G | Persistencia post-reload offline | **PASS** | IDB + UI tras reload; token/snap intactos |
| H | Recuperación de conexión | **PASS** | `probeApiHealth` + mensaje «Cola sincronizada tras reconexión» |
| I | Sync + COM definitivo | **PASS** | Sale `confirmed` `COM-00000002` en IndexedDB |
| J | Stock/caja una vez | **PASS** con nota | Outbox `acked` una vez para la venta aplicada; un hermano `VERSION_CONFLICT` por reintento (conflict, no duplicado aplicado) |
| K | Cambio usuario/empresa | **PASS** (código) | `clearNavCache` en login/logout; no E2E cruzado en esta corrida |
| L | Sesión vencida | **PASS** | Vitest sales-cash `SESSION_BLOCKED` |
| M | Lease vencido | **PASS** | Vitest `LEASE_EXPIRED` / F1 HTTP |
| N | Update SW con pendientes | **PASS** (código+UI) | Banner «Nueva versión»; `applyPwaUpdateSafely` bloquea si outbox pending |
| O | Borrar caché shell sin IDB | **PASS** | Tras bump v1→v2, ventas IDB conservadas (`COM-00000001/2` presentes) |

**Criterio GO:** `/ventas` se recarga completamente offline tras preparación — **cumplido** (antes P2-C1.E: `chrome-error://`).

---

## 7. Reconciliación

- Sin cola paralela en SW
- Reconexión: `probeApiHealth` → `flushPosOutbox` → `runPushCycle`
- UUID / duplicate / applied / rejected / conflict sin cambio de motor
- Venta provisional hasta confirmación servidor

---

## 8. Actualización de versiones

- No se borra IndexedDB en activate/update
- No `skipWaiting` automático con outbox pendiente
- Banner de actualización; force opcional con advertencia

---

## 9. Regresiones

| Suite | Resultado |
|-------|-----------|
| B2-A HTTP | 16/16 PASS |
| B2-B HTTP | 5/5 PASS |
| F1 cash lease HTTP | 11/11 PASS |
| Sync P2-C0.1 HTTP | 25/25 PASS |
| FE `test:offline` (+ pwa-shell) | 51/51 PASS |
| `tsc` frontend / backend | PASS |
| Simulación 7 días | **No reejecutada** (evitar efectos sobre datos) |

---

## 10. Limitaciones

1. Docker local usa **`next dev`**: chunks con `?v=` y HMR; requiere `ignoreSearch` y warm explícito. Producción (`next start`) será más estable.
2. Soft navigations App Router (RSC) offline no son el objetivo; cold reload de documento sí.
3. Install prompt depende del navegador/Chrome; no forzado en tests.
4. Un reintento de venta puede quedar `VERSION_CONFLICT` en outbox (revisión manual); no duplica venta aplicada.
5. Reloj local / lease: mismas reglas F1.

---

## 11. GO/NO-GO para P2-C1.F3

| Criterio | Estado |
|----------|--------|
| Sin `chrome-error` en reload offline `/ventas` | OK |
| Shell + POS + catálogo + caja offline | OK |
| Lease/sesión no bypasseados por PWA | OK |
| Outbox única + sync al reconectar | OK |
| Regresiones motor/sync/lease | OK |

### Veredicto: **GO → P2-C1.F3**

Sin commit, push ni deploy.
