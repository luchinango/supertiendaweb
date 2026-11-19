# P2-C1.G9.3 — UX/UI Catálogo e Inventario

**Fecha:** 2026-11-18  
**Entorno:** Docker DEMO · FE `next start` `st-fe-prod-g93` (`127.0.0.1:3001`) · `supertienda-fe-prod-local:g93`  
**Alcance:** Presentación / navegación en `/productos` e `/inventario` + ajuste mínimo OfflineStatusHost (deuda G9.2).  
**Diseño previo:** `docs/P2C1G9_3_CATALOG_INVENTORY_DESIGN.md`

---

## 1. Diagnóstico

| Hallazgo | Notas |
|----------|--------|
| Datos reales | Catálogo/inventario vía `useCommercialCatalog` (no mock de listado) |
| ADMIN | Crear/editar/adoptar/categorías/precio |
| EMPLOYEE | Lectura + **Ajustar** stock (`canAdjustStock`) |
| Umbral “stock bajo” | Solo UI (`DEFAULT_LOW_STOCK_THRESHOLD`) |
| Tablet `md` | Tabla ancha + AppShell → compresión (mismo patrón G9.2) |
| Deuda G9.2 | Badge offline podía tapar zona baja del POS |

Antes (estado pre-cambio G9.3): `docs/p2c1g9_3-evidence/before-*.png` (+ G9 `04-catalogo` / `05-inventario`).

---

## 2. Diseño propuesto (implementado)

- **≥ lg:** tablas con badge de stock, hover/focus, columna Estado.
- **&lt; lg:** cards (nombre, precio, stock, sync, acción).
- Toolbar: búsqueda sticky en móvil, labels a11y, CTAs h-10, link **POS**.
- `StockStatusBadge` compartido (OK / Bajo / Agotado).
- Empty states con CTA sync / catálogo.
- Badge offline ventas: más compacto, z-20, “Cola offline”, debug oculto en móvil.

Sin cambios de CRUD, permisos server, precios, Dexie ni API.

---

## 3. Archivos modificados

| Archivo | |
|---------|--|
| `frontend/components/features/catalog/StockStatusBadge.tsx` | **Nuevo** |
| `frontend/app/productos/page.tsx` | UX responsive |
| `frontend/app/inventario/page.tsx` | UX responsive |
| `frontend/components/offline/OfflineStatusHost.tsx` | Ajuste visual G9.2 |
| `docs/P2C1G9_3_CATALOG_INVENTORY_DESIGN.md` | Diseño |
| `docs/P2C1G9_3_CATALOG_INVENTORY_UX_REPORT.md` | Este informe |

Evidencias: `docs/p2c1g9_3-evidence/` (gitignored).

---

## 4. Capturas comparativas

| Vista | Antes | Después |
|-------|-------|---------|
| Catálogo 1440 | `before-catalog-desktop.png` | `after-catalog-desktop.png` |
| Catálogo 768 | `before-catalog-tablet.png` | `after-catalog-tablet.png` |
| Catálogo 390 | `before-catalog-mobile.png` | `after-catalog-mobile.png` |
| Catálogo 320 | `before-catalog-narrow.png` | `after-catalog-narrow.png` |
| Inventario 1440–320 | `before-inventory-*` | `after-inventory-*` |
| EMPLOYEE móvil | — | `after-catalog-employee-mobile.png` |
| Badge ventas móvil | `before-ventas-badge-*` | `after-ventas-badge-mobile.png` |

---

## 5. Mejoras responsive

1. Sin scroll horizontal en 1440 / 768 / 390 / 320 (medido).
2. Cards en tablet/móvil; tabla solo desktop `lg+`.
3. Stock y sync visibles en card; acciones Editar/Ajustar según rol.
4. Acceso POS desde ambas pantallas.

---

## 6. Accesibilidad

- `aria-label` en búsqueda y filtros; checkbox “Solo stock bajo” etiquetado.
- `role="alert"` / `role="status"` en error/flash/alerta stock.
- Focus outline ink en selects; targets ~40px en acciones móviles.
- `sr-only` en columnas Acciones; `motion-safe` / `motion-reduce` en hover/spin.

---

## 7. Pruebas y regresiones

### Chromium (`validate-g93.mjs`) — 0 FAIL

| Check | Resultado |
|-------|-----------|
| Catálogo table desktop / cards móvil | PASS |
| Búsqueda | PASS |
| Inventario cards + stock badges | PASS |
| Filtro stock bajo | PASS |
| Link POS | PASS |
| EMPLOYEE sin Nuevo/Editar | PASS |
| EMPLOYEE Ajustar visible | PASS (`adjust=4`) |
| Multiempresa admin_b | PASS (`businessId=2`) |
| Badge no solapa sticky Cobrar | PASS (`overlapsSticky=false`) |

Log: `docs/p2c1g9_3-evidence/validate-out.txt`

### Suites

| Suite | Resultado |
|-------|-----------|
| `npm run type-check` | PASS |
| `npm run test:offline` (56) | PASS |

No se alteró IndexedDB histórico ni cajas residuales ajenas.

---

## 8. Riesgos residuales

1. Badge offline aún puede **intersectar** el panel de caja si ambos quedan en viewport (`overlapsCash=true` en medición); **no** bloquea sticky Cobrar.
2. Toolbar ADMIN en 320px sigue densa (wrap de 6 botones) — aceptable; futuro: menú “Más”.
3. Umbral stock bajo sigue siendo UI-only (documentado en alerta).
4. `canAdjustStock` sigue la regla existente (empleados de empresa); no se reabrió modelo de permisos.

---

## 9. GO / NO-GO

| Criterio | |
|----------|--|
| Cards/tablas usables sin lógica tocada | PASS |
| Roles ADMIN/EMPLOYEE UI | PASS |
| Regresiones offline/catálogo | PASS |
| Deuda badge vs Cobrar | Mitigada (PASS sticky) |

**GO** para el siguiente módulo UX (p. ej. empty states ampliados, config con datos reales, o atajos POS), con las mismas restricciones comerciales.

---

## Detención

G9.3 cerrado. Sin commit, push ni deploy.
