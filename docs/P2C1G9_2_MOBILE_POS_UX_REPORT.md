# P2-C1.G9.2 — Rediseño UX/UI del POS móvil

**Fecha:** 2026-11-18  
**Entorno:** Docker DEMO · API `:5000` · FE `next start` `st-fe-prod-g92` (`127.0.0.1:3001`) · imagen `supertienda-fe-prod-local:g92`  
**Alcance:** Presentación responsive del POS `/ventas`. Sin backend, API, Dexie/outbox, leases ni cálculos de caja.

Diseño previo: `docs/P2C1G9_2_MOBILE_POS_UX_DESIGN.md`

---

## 1. Diagnóstico inicial

Hallazgo G9 **C3**: en móvil, jornada + caja empujaban el catálogo; cobro detrás de un carrito improvisado.

| Capa | Naturaleza |
|------|------------|
| Header, orden de bloques, Sheet, sticky, Collapsible, skeletons, feedback visual | **Visual** (tocado) |
| `confirmSale`, open/close cash, sync pendiente, totals, Dexie | **Lógica** (intacta) |

Antes (G9): `docs/p2c1g9-evidence/03-ventas-mobile.png` — paneles ops arriba, catálogo abajo, sin sticky de cobro.

---

## 2. Diseño propuesto (resumen)

- **Móvil / tablet (&lt; lg):** header compacto → pendientes → **catálogo** → jornada/caja colapsables → sticky Total+Carrito → Sheet de cobro.
- **Desktop (≥ lg):** flujo validado; carrito lateral; sin sticky.
- Tablet no usa dos columnas con AppShell (ancho útil insuficiente); misma composición cajero hasta `lg`.
- Caja: chip de estado siempre visible; controles en Collapsible (`Gestionar`).
- Jornada: copy corto en móvil; toggle existente.
- Microinteracciones: ring breve al agregar; `motion-safe` / `motion-reduce`; Sheet Radix a11y.

---

## 3. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/app/ventas/page.tsx` | Layout responsive, Sheet, sticky, collapsible caja, orden móvil, feedback tile |
| `frontend/components/features/pos/PosDayControlPanel.tsx` | Copy compacto móvil; touch target toggle |
| `frontend/components/offline/OfflineStatusHost.tsx` | Offset superior a sticky en `/ventas` |
| `frontend/components/ui/sheet.tsx` | Overlay z-index / reduced-motion |
| `docs/P2C1G9_2_MOBILE_POS_UX_DESIGN.md` | Diseño pre-código |
| `docs/P2C1G9_2_MOBILE_POS_UX_REPORT.md` | Este informe |

Evidencias: `docs/p2c1g9_2-evidence/` (gitignored).

---

## 4. Capturas desktop / tablet / móvil

| Vista | Antes | Después |
|-------|-------|---------|
| Móvil | `p2c1g9-evidence/03-ventas-mobile.png` | `p2c1g9_2-evidence/after-ventas-mobile.png` |
| Móvil + carrito | — (overlay ad-hoc) | `after-ventas-mobile-cart-sheet.png` (Sheet blanco opaco, Cobrar visible) |
| Móvil jornada | — | `after-ventas-mobile-jornada.png` |
| Móvil offline | — | `after-ventas-mobile-offline.png` |
| Tablet | `p2c1g9-evidence/03-ventas-tablet.png` | `after-ventas-tablet.png` (sticky + catálogo legible) |
| Desktop | `p2c1g9-evidence/03-ventas-desktop.png` | `after-ventas-desktop.png` / `after-venta-online-desktop.png` |

---

## 5. Mejoras de navegabilidad

1. Catálogo arriba del fold en móvil (medido: catalogY &lt; dayY).
2. Sticky Total + Carrito; Sheet accesible con título/descripcion.
3. Caja colapsada por defecto en &lt; lg; estado OPEN/sin caja siempre legible.
4. Un pill de conexión en header móvil; SyncStatusBadge detallado desde `md+` / host offline.
5. Targets táctiles ~40–48px en qty / sticky / toggles.
6. Pendientes offline siguen visibles encima del catálogo cuando existen.

---

## 6. Pruebas funcionales (Chromium + sesión persistente)

Runner: `browser.mjs --session g92-pos2` · deviceId `p2c1g92-pos-device`  
Log: `docs/p2c1g9_2-evidence/validate-out.txt`

| Prueba | Resultado |
|--------|-----------|
| Desktop sin sticky + carrito lateral | **PASS** |
| Abrir caja (si aplica) / no cierre residual histórico | **PASS** |
| Agregar producto + venta online | **PASS** (`COM` observado en UI) |
| Layout tablet cajero (sticky; aside no visible) | **PASS*** |
| Catálogo antes de jornada (móvil) | **PASS** |
| Caja colapsada móvil | **PASS** |
| Sheet carrito | **PASS** |
| Toggle jornada | **PASS** |
| Venta offline provisional | **PASS** |
| Banner pendientes | **PASS** (`count=1`) |
| Multiempresa `admin_b` businessId=2 | **PASS** |
| IndexedDB sesión persistente | **PASS** (DBs `…dp2c1g92-pos-device`) |

\* Primera corrida marcó FAIL por `count()` de `<aside hidden>`; la UI real usa sticky (ver captura tablet). Criterio corregido a `isVisible()`.

No se cerraron cajas residuales de lab ajenas a este device.

---

## 7. Responsive y accesibilidad

| Check | Estado |
|-------|--------|
| 1440 / 768 / 390 | Capturas OK tras fix Sheet + breakpoint `lg` |
| Sheet focus / Escape / título | Radix Dialog-based Sheet |
| Contraste CTA `#1e1e1e` | Alineado design system |
| `role="alert"` en errores | Conservado |
| `prefers-reduced-motion` | `motion-safe` / `motion-reduce` en animaciones tocadas |
| Badge offline vs sticky | Offset `bottom-24` en ventas |

**Nota residual:** el host offline puede solaparse visualmente con la tarjeta de caja en viewports bajos; no bloquea Cobrar (sticky/Sheet).

---

## 8. Regresiones

| Suite | Resultado |
|-------|-----------|
| `npm run type-check` | **PASS** |
| `npm run test:offline` (56) | **PASS** |
| Contratos API / Dexie / leases | Sin cambios de código |

---

## 9. Riesgos pendientes

1. AppShell + sidebar en tablet: carrito lateral a dos columnas sigue inviable sin modo “cajero fullscreen” (futuro).
2. Solapamiento leve OfflineStatusHost vs caja en móvil.
3. Densidad de “Últimas confirmadas” aún puede empujar scroll tras ops.
4. Atajos teclado POS (roadmap) no implementados.
5. Cajas OPEN de devices de lab previos: intactas.

---

## 10. GO / NO-GO — siguiente módulo UX

| Criterio | |
|----------|--|
| POS móvil usable (catálogo + cobro) | PASS |
| Sin lógica comercial alterada | PASS |
| Offline + IDB persistente (sesión) | PASS |
| Desktop operativo | PASS |

**GO** para el siguiente módulo UX del roadmap (p. ej. tablas→cards en catálogo/inventario admin, o empty states), manteniendo las mismas restricciones comerciales.

---

## Detención

G9.2 cerrado con este informe. Sin commit, push ni deploy.
