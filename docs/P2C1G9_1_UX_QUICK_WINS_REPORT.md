# P2-C1.G9.1 — UX/UI documentación y quick wins controlados

**Fecha:** 2026-11-18  
**Entorno:** Docker DEMO local · API `:5000` · FE `next start` `st-fe-prod-g91` (`127.0.0.1:3001`) · imagen `supertienda-fe-prod-local:g91`  
**Alcance:** Solo UI/UX P0–P1. Sin backend, sin contratos API, sin Dexie/outbox/leases, sin cálculos de caja, sin migraciones, sin commit/push/deploy.

---

## 1. Resumen ejecutivo

Documentación G9 formalizada y quick wins P0/P1 aplicados en FE. Validación Chromium **12/12 PASS** (0 FAIL). Unitarios offline **56/56 PASS**. Typecheck FE **PASS**.

**Veredicto: GO** para continuar con el rediseño de **POS móvil** (roadmap P2), condicionado a mantener el aislamiento comercial (sin tocar sync/caja/outbox).

---

## 2. Fase A — Documentación

| Documento | Estado |
|-----------|--------|
| `docs/P2C1G9_UX_UI_AUDIT.md` | Creado (diagnóstico + evidencias G9) |
| `docs/P2C1G9_DESIGN_SYSTEM_PROPOSAL.md` | Creado |
| `docs/P2C1G9_UX_ROADMAP.md` | Creado |

Evidencias de auditoría (antes): `docs/p2c1g9-evidence/*.png` (capturas G9 read-only).

---

## 3. Fase B — Plan de cambios (pre-código)

| # | Cambio | Archivos previstos | Riesgo comercial | Decisión |
|---|--------|--------------------|------------------|----------|
| 1 | Auth sin AppShell | `AppShellGate.tsx`, `app/layout.tsx`, `(auth)/layout.tsx` | Ninguno | Implementar |
| 2 | Dashboard ES + CTA Ventas | `app/dashboard/page.tsx` | Ninguno (solo presentación; KPIs = `getReports`) | Implementar |
| 3 | Sidebar grupos + filtro EMPLOYEE | `components/layout/Sidebar.tsx` | Bajo: solo visibilidad nav; permisos server intactos | Implementar |
| 4 | Botones primary consistentes | login/register + CTA dashboard | Ninguno | Implementar |
| 5 | Skeletons | `ui/skeleton.tsx`, ventas/productos/inventario | Ninguno | Implementar |
| 6 | Badge offline | `OfflineStatusHost.tsx` | Ninguno (posición CSS) | Implementar |

**No autorizado / no tocado:** backend, Prisma, Dexie, leases, sync, totales de caja, FactuBO/SIAT, cierre de cajas residuales.

---

## 4. Fase C — Cambios implementados

### 4.1 Auth layout
- Nuevo `frontend/components/layout/AppShellGate.tsx`: omite `AppShell` en `/login` y `/register`.
- Root `layout.tsx` envuelve children con `AppShellGate`.
- `(auth)/layout.tsx`: solo children (sin shell).
- Login/register: fondo slate + CTA primary `#1e1e1e`.

### 4.2 Dashboard
- Español (`Inicio`, indicadores).
- CTA **Ir a Ventas**; eliminados caja/logout duplicados del panel.
- Indicadores: solo `totalCredits`, `totalDebts`, `salesThisMonth` de `getReports` (sin KPIs inventados).
- Skeleton de carga en indicadores.

### 4.3 Navegación
- Grupos: Inicio / Caja / Stock / Personas / Gestión.
- `adminOnly` oculta ítems de gestión para `EMPLOYEE` (UI only).
- Estilos Tailwind + `aria-current` en ítem activo.

### 4.4 Componentes visuales / loading
- `Skeleton`, `CatalogGridSkeleton`, `TableRowsSkeleton` en `components/ui/skeleton.tsx`.
- POS ventas, productos e inventario usan skeletons en carga.

### 4.5 Badge offline
- Oculto en rutas auth.
- En `/ventas`: anclado **abajo-izquierda** para no tapar carrito/Cobrar.
- Resto de rutas: abajo-derecha (comportamiento previo).

---

## 5. Archivos modificados / creados

**Creados**
- `frontend/components/layout/AppShellGate.tsx`
- `docs/P2C1G9_UX_UI_AUDIT.md`
- `docs/P2C1G9_DESIGN_SYSTEM_PROPOSAL.md`
- `docs/P2C1G9_UX_ROADMAP.md`
- `docs/P2C1G9_1_UX_QUICK_WINS_REPORT.md` (este informe)
- Evidencias: `docs/p2c1g9_1-evidence/` (gitignored vía `p2c1g*-evidence/`)

**Modificados**
- `frontend/app/layout.tsx`
- `frontend/app/(auth)/layout.tsx`
- `frontend/app/(auth)/login/page.tsx`
- `frontend/app/(auth)/register/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/components/layout/Sidebar.tsx`
- `frontend/components/offline/OfflineStatusHost.tsx`
- `frontend/components/ui/skeleton.tsx`
- `frontend/app/ventas/page.tsx`
- `frontend/app/productos/page.tsx`
- `frontend/app/inventario/page.tsx`

**Backend / contratos / Dexie:** sin cambios.

---

## 6. Capturas antes / después

| Superficie | Antes (G9) | Después (G9.1) |
|------------|------------|----------------|
| Login desktop | `p2c1g9-evidence/01-login-desktop.png` (AppShell visible) | `p2c1g9_1-evidence/after-01-login-desktop.png` (sin sidebar) |
| Login mobile | `p2c1g9-evidence/01-login-mobile.png` | `p2c1g9_1-evidence/after-01-login-mobile.png` |
| Dashboard | `p2c1g9-evidence/02-dashboard-desktop.png` (EN + Abrir caja + Cerrar sesión) | `p2c1g9_1-evidence/after-02-dashboard-desktop.png` (ES + Ir a Ventas) |
| Ventas desktop | `p2c1g9-evidence/03-ventas-desktop.png` | `p2c1g9_1-evidence/after-03-ventas-desktop.png` (nav agrupada) |
| Ventas tablet/móvil | `03-ventas-tablet/mobile*.png` | `after-03-ventas-tablet/mobile*.png` |
| Offline en Ventas | badge derecha (G9) | `after-04-ventas-offline.png` (host activo; posición izq. validada) |
| Nav EMPLOYEE | — | `after-05-employee-nav.png` (sin Gestión admin) |

---

## 7. Pruebas ejecutadas

### 7.1 Typecheck
```
frontend> npm run type-check  → PASS (tsc --noEmit)
```
Log: `docs/p2c1g9_1-evidence/tsc-fe.txt`

### 7.2 FE producción
- Build `supertienda-fe-prod-local:g91` **PASS**
- Contenedor `st-fe-prod-g91` en `supertienda-dev_supertienda_net` · `:3001` · `/login` HTTP 200

### 7.3 Chromium (script `validate-g91.mjs`)

| ID | Resultado |
|----|-----------|
| auth-no-appshell | **PASS** |
| login-redirect | **PASS** → `/dashboard` |
| dashboard-es-cta | **PASS** |
| nav-admin-groups | **PASS** |
| offline-badge-left-ventas | **PASS** |
| jornada-panel-visible | **PASS** |
| offline-host-when-offline | **PASS** |
| nav-employee-filter | **PASS** (links: Dashboard, Ventas, Catálogo, Inventario, Clientes) |
| multiempresa-admin-b | **PASS** (`businessId=2`) |
| logout | **PASS** → `/login` |
| caja-controls-present | **PASS** (`open=1`, sin forzar cierre residual) |
| a11y-cta-focus | **PASS** |

Log completo: `docs/p2c1g9_1-evidence/validate-out.txt`  
Errores de red durante `setOffline(true)` esperados (`ERR_INTERNET_DISCONNECTED` / `_rsc`).

### 7.4 Regresiones unitarias offline / sync / caja (FE)
```
npm run test:offline → 7 files, 56 tests PASS
```
Log: `docs/p2c1g9_1-evidence/offline-unit.txt`

### 7.5 Controles de caja / jornada
- Panel de jornada visible en Ventas.
- Controles de apertura presentes; **no** se cerraron cajas residuales históricas.
- Sin ventas de dinero real; sin sync destructivo forzado.

---

## 8. Regresiones observadas

Ninguna en lógica comercial ni permisos server.  
Filtro EMPLOYEE es **solo menú**; rutas admin siguen protegidas por `ProtectedRoute`/API como antes.

---

## 9. Problemas pendientes (fuera de G9.1)

1. **POS móvil P2:** densidad de paneles superiores (Sync / jornada / caja) sigue alta en viewport estrecho — candidato a rediseño controlado.
2. **Configuraciones** con datos mock (roadmap P2).
3. **Tablas → cards** en `<md` (roadmap P2).
4. Cajas OPEN residuales de lab histórico: **no tocadas** (política P2-C1).
5. Contraste fino del CTA login en algunos renders (texto sobre `#1e1e1e`) — polish visual menor, no bloqueante.

---

## 10. GO / NO-GO — continuar con POS móvil

| Criterio | Estado |
|----------|--------|
| Auth limpio sin AppShell | PASS |
| Dashboard usable en ES | PASS |
| Nav por rol (UI) | PASS |
| Badge no obstruye cobro (izq. en Ventas) | PASS |
| Sin cambios API/Dexie/caja | PASS |
| Offline unitario | PASS |

**GO** para iniciar trabajo de **POS móvil** según `P2C1G9_UX_ROADMAP.md` (P2), con las mismas restricciones: sin lógica comercial, sin outbox/leases, sin producción.

---

## 11. Detención

G9.1 cerrado con este informe. Sin commit, push ni deploy.
