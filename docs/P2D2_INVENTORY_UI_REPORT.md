# P2-D2 — Informe inventario comercial y UX offline

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Ámbito:** `/inventario` comercial + STOCK_ADJUST offline + dependsOn categorías + shell móvil  
**Precondiciones:** P2-D1 cerrado  
**Estado:** Completado — sin POS/caja/ventas/PWA, sin migraciones/schema, sin commit/push

---

## 0. Resumen ejecutivo

`/inventario` pasa a listado comercial IDB-backed (mismo núcleo que catálogo), con `currentStock` / `reservedStock` / `availableStock`, alertas de stock bajo (umbral UI), ajustes `STOCK_ADJUST` optimistas pendientes, resolución segura de categoría privada pending vía `dependsOn` + `idMap`, y sidebar oculto en móvil con drawer accesible.

---

## 1. Auditoría (resultado)

| Área | Hallazgo |
|------|----------|
| `/inventario` legacy | API paginada mock/`useProductsPaginated` + paneles legacy — **reemplazada** (no duplica stock) |
| Contrato `STOCK_ADJUST` | `payload: { businessProductId\|productId, delta }`, `baseVersion` obligatorio; `INSUFFICIENT_STOCK` / `VERSION_CONFLICT`; `InventoryTransaction` solo en servidor |
| Roles | Catálogo ADMIN-only; **STOCK_ADJUST permitido a ADMIN y EMPLOYEE** (no está en `catalogAdminOps`) |
| Pull BP | `customPrice`, stocks — **sin** `minStock` → umbral UI `DEFAULT_LOW_STOCK_THRESHOLD=5` |
| D1 pendiente categoría | Create producto exigía `categoryServerId` → resuelto con `categoryLocalId` + `dependsOn` |

---

## 2. Pantallas / componentes

| Pieza | Rol |
|-------|-----|
| `app/inventario/page.tsx` | Inventario comercial + filtros + alertas + ajustar |
| `components/features/inventory/StockAdjustDialog.tsx` | Entrada/salida, motivo, confirmación, preview |
| `components/layout/AppShell.tsx` | Shell responsive: sidebar desktop / drawer móvil |
| `Sidebar` + `compact` | Navegación reutilizada en drawer |
| Reuso | `useCommercialCatalog`, `SyncStatusChip/Badge`, `OutboxReviewPanel` |

### Capturas

| Archivo | Vista |
|---------|-------|
| `docs/p2d2-screenshots/01-inventory-desktop.png` | Listado + bajo stock + Ajustar |
| `docs/p2d2-screenshots/02-stock-adjust-dialog.png` | Dialog STOCK_ADJUST |
| `docs/p2d2-screenshots/03-inventory-mobile.png` | Cards móvil |
| `docs/p2d2-screenshots/04-mobile-menu.png` | Drawer menú móvil |
| `docs/p2d2-screenshots/05-catalog-mobile-shell.png` | Navegación drawer → catálogo |

---

## 3. Flujo STOCK_ADJUST

```text
UI (ADMIN|EMPLOYEE) → adjustStock()
  → valida delta≠0, motivo, current+delta≥0
  → enqueueMutation STOCK_ADJUST (UUID, baseVersion, businessProductId)
  → proyección BP local pending (current/available); NO InventoryTransaction local
  → sync push→pull; ack actualiza versión/stock server
  → INSUFFICIENT_STOCK / VERSION_CONFLICT → outbox rejected/conflict
```

`reason` se guarda en outbox local y se **strippea** al enviar (servidor usa notes propias).

---

## 4. Categoría pending (dependsOn)

1. `CATEGORY_PRIVATE_CREATE` → outbox UUID_A, categoría local sin `serverId`.  
2. `PRODUCT_PRIVATE_CREATE_WITH_BP` con `categoryLocalId` + `dependsOn: [UUID_A]`.  
3. Push no envía producto hasta UUID_A **acked**.  
4. `resolveOutboundPayload` materializa `categoryServerId` desde `idMap` y **persiste** payload antes del envío (hash estable).  
5. Strip de `categoryLocalId` en el wire.  
6. No se inventan IDs temporales como serverId.

Si no hay map tras deps: op se deja pending (`DEPENDENCY_UNRESOLVED`), sin enviar basura.

---

## 5. Responsive / shell

- Desktop (`md+`): sidebar fijo.  
- Móvil: sidebar oculto; header **Menú**; drawer overlay + Escape/backdrop; click en link cierra drawer.  
- Listados inventario/catálogo: tabla `md+`, cards en móvil.

---

## 6. Seguridad por roles

| Acción | ADMIN | EMPLOYEE |
|--------|-------|----------|
| Ver inventario / sync / outbox | sí | sí |
| Ajustar stock | sí | sí (backend SyncService) |
| Catálogo create/edit/adopt | sí | no (sin cambio D1) |

Frontend **no** amplía autorización: mirror del backend.

---

## 7. Pruebas

| Suite | Resultado |
|-------|-----------|
| frontend `tsc` | 0 |
| `test:p2d2:offline` | 7 passed |
| `test:offline` (full) | 33 passed |
| backend `tsc` | 0 |
| `test:p2c01:http` | 25 passed |

Cobertura nueva: adjust optimistic + bloqueo negativo; dependsOn categoryLocalId; resolve tras idMap.

---

## 8. Problemas / límites

1. `minStock` no está en payload pull BP → umbral UI fijo documentado.  
2. Ajuste deshabilitado si BP aún sin `serverId` (create pending).  
3. `reason` no persiste en `InventoryTransaction.notes` del server (contrato actual).  
4. Legacy paneles inventario (`AddProductPanel`, etc.) ya no se montan en `/inventario`.

---

## 9. Preparación siguiente (fuera de alcance)

- POS / ventas / caja siguen bloqueados.  
- Opcional: incluir `minStock` en pull BP (requeriría cambio de contrato API — pedir autorización).  
- Movimientos/mermas UI pueden reutilizar chips + outbox.

---

**Fin P2-D2.** Sin commit, push ni deploy.
