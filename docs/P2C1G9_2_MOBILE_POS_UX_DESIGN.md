# P2-C1.G9.2 — Diseño POS móvil / tablet (antes de código)

**Estado:** propuesta autorizada para implementación de **solo presentación**  
**Base:** G9 audit C3, design system, roadmap P2, G9.1 GO

---

## 1. Diagnóstico (qué es visual vs lógica)

| Superficie | Visual (OK tocar) | Lógica comercial (NO tocar) |
|------------|-------------------|-----------------------------|
| Header Ventas | Tipografía, pills, orden | `SyncStatusBadge` / probe connectivity |
| Sync / Preparar offline | Layout de botones | `cat.syncNow()`, `warmPwaShellCache` |
| Control de jornada | Compactar / colapsar UI | `fetchCashSession`, listas Dexie, sync pendiente |
| Ventas provisionales / confirmadas | Densidad, orden en viewport | `listPending*`, `syncPendingSale`, tickets |
| Caja del dispositivo | Barra compacta, collapsible | `openCashOnline` / `closeCashOnline` / leases |
| Catálogo + búsqueda | Grid, alturas, sticky search | `useCommercialCatalog`, stock gates |
| Carrito + Cobrar | Sheet a11y, sticky bar, feedback | Totales `commercialTotals`, cobro online/offline |
| OfflineStatusHost | Posición vs sticky bar | Scope / SyncStatusBadge |

---

## 2. Escenarios

### Desktop (≥1024px)
- Mantener flujo validado: header + jornada + caja + grid catálogo | carrito lateral.
- Sin sticky bar ni sheet.

### Tablet (768–1023px)
- Con AppShell (sidebar), el ancho útil no admite dos columnas cómodas: misma composición cajero que móvil (catálogo + Sheet + sticky) hasta `lg`.
- Desde `lg` (≥1024): catálogo + carrito lateral (flujo desktop validado).

### Móvil (<768px)
- **Orden:** header compacto → alertas/pendientes → **catálogo** → jornada/caja colapsables.
- Carrito vía **Sheet** (Radix) + barra fija total/cobro.
- No ocultar pendientes ni estado de caja (chips siempre visibles).

---

## 3. Composición móvil propuesta

```
┌─────────────────────────────┐
│ Ventas · [En línea]  [Sync] │  ← header compacto
│ [Pendientes N] si hay       │  ← crítico, siempre visible
│ Buscar…                     │
│ ┌───┐ ┌───┐                 │
│ │prod│ │prod│  catálogo     │
│ └───┘ └───┘                 │
│ ▸ Jornada · ▸ Caja (chips)  │  ← no bloquean viewport
└─────────────────────────────┘
┌─────────────────────────────┐
│ Total Bs …    │ Carrito (n) │  ← sticky; no cubre badge izq.
└─────────────────────────────┘
```

Sheet carrito: líneas + totales + efectivo + Cobrar (mismos handlers).

---

## 4. Archivos afectados (plan)

| Archivo | Cambio |
|---------|--------|
| `app/ventas/page.tsx` | Layout responsive, Sheet, sticky bar, collapsible caja, orden móvil |
| `components/features/pos/PosDayControlPanel.tsx` | Solo clases compactas / densidades (sin lógica) |
| `components/offline/OfflineStatusHost.tsx` | Offset inferior en `/ventas` móvil vs sticky |
| `components/ui/sheet.tsx` | Solo si hace falta variante bottom sin padding excesivo (mínimo) |

**Fuera de alcance:** `posOnlineService`, `posSaleOfflineService`, `posCashAuth`, Dexie, backend.

---

## 5. Microinteracciones

- Sheet: animación Radix; respetar `prefers-reduced-motion` vía utilidades `motion-safe:`.
- Producto añadido: ring breve en tile (CSS, ~300ms).
- Sin confetti; sin delays en cobro.

---

## 6. A11y

- Sheet con título/descripcion.
- Focus trap Radix.
- Targets ≥44px en sticky / +− qty.
- Errores existentes sin cambio de copy crítico.

---

## 7. Criterios de aceptación G9.2

1. En 390px, catálogo visible sin scrollar paneles de jornada/caja abiertos.
2. Pendientes offline visibles si existen.
3. Cobrar alcanzable desde Sheet; no tapado por badge.
4. Desktop sin regresión de layout operativo.
5. Typecheck + offline unit PASS; Chromium con **sesión persistente** para venta offline.
