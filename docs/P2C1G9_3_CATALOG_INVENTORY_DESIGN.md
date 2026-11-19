# P2-C1.G9.3 — Diseño Catálogo e Inventario (pre-código)

**Estado:** propuesta de solo presentación  
**Base:** G9 A4 (tablas difíciles en móvil), roadmap P2 “tablas→cards”, G9.1 skeletons, G9.2 tokens

---

## 1. Diagnóstico

### Real vs mock

| Elemento | Estado |
|----------|--------|
| Listado / búsqueda / filtro visibilidad | Real (`useCommercialCatalog`) |
| CRUD producto, precio, categorías, adoptar | Real (ADMIN) |
| Ajuste de stock | Real (`canAdjustStock` = EMPLOYEE) |
| Sync / outbox / conflictos | Real |
| Umbral stock bajo | UI local (`DEFAULT_LOW_STOCK_THRESHOLD`); no es `minStock` de API |
| Debug `/debug-offline` | Solo DEV / `NEXT_PUBLIC_OFFLINE_DEBUG` |

### Problemas UX

1. Tabla desde `md` se comprime con AppShell en tablet (~768).
2. Toolbar de acciones densa en móvil (muchos botones en wrap).
3. Doble indicador sync (header + OfflineStatusHost).
4. Cards móviles básicas: falta badge de stock unificado y targets táctiles.
5. Select/checkbox sin label accesible explícito.
6. Deuda G9.2: OfflineStatusHost puede tapar caja en `/ventas` móvil.

---

## 2. Diseño responsive

| Viewport | Catálogo / Inventario |
|----------|------------------------|
| ≥ `lg` (1024) | Tabla mejorada (hover, focus, stock badge) |
| &lt; `lg` | Cards compactas (nombre, precio, stock/estado, sync, acción) |
| Móvil | Toolbar: búsqueda sticky; acciones en wrap con h-10; sync badge de página oculto (queda host global) |

Datos críticos (precio, disponible, sync, editar/ajustar según rol) **siempre visibles**.

---

## 3. Componentes / archivos

| Archivo | Cambio |
|---------|--------|
| `components/features/catalog/StockStatusBadge.tsx` | **Nuevo** — badge bajo/ok/agotado (presentación) |
| `app/productos/page.tsx` | Breakpoint `lg`, toolbar, cards, a11y, empty |
| `app/inventario/page.tsx` | Idem + filtro stock bajo a11y |
| `components/offline/OfflineStatusHost.tsx` | Ajuste mínimo ventas móvil (compacto, no tapa caja) |

**No tocar:** hooks comerciales, dialogs CRUD (salvo clases si hiciera falta), Dexie, API.

---

## 4. Tokens (G9)

- Ink CTA `#1e1e1e` · surface white/gray-100 · amber solo warning stock · emerald sync OK  
- Radius `rounded-md` · tabular-nums precios/stock  
- `motion-safe` / `motion-reduce` en hover/transitions menores  

---

## 5. Deuda G9.2 (badge offline)

En `/ventas` &lt; `md`: host más compacto (`px-2 py-1.5`, texto 10px), anclado `bottom-24 left-2`, sin link debug; no cambia lógica de cola.

---

## 6. Criterios de aceptación

1. Sin scroll horizontal en 320/390.
2. Cards &lt; lg; tabla ≥ lg.
3. EMPLOYEE: sin Nuevo/Editar/Adoptar/Categorías; con Ajustar si aplica.
4. Typecheck + offline/catalog tests PASS.
5. Capturas antes/después 1440 / 768 / 390 / 320.
