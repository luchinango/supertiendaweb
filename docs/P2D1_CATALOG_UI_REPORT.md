# P2-D1 — Informe interfaz comercial de catálogo

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Ámbito:** Frontend comercial `/productos` + IndexedDB/outbox existentes (P2-C0.2 / P2-C0.3)  
**Precondiciones:** P2-C0.3 cerrado  
**Estado:** Completado — sin POS/caja/ventas/PWA, sin migraciones/schema, sin commit/push, sin borrar BP 118/200

---

## 0. Resumen ejecutivo

Se reemplazó el listado mock de `/productos` por un **catálogo comercial** respaldado por IndexedDB + outbox, con precios **solo** desde `BusinessProduct.customPrice`, acciones ADMIN, lectura EMPLOYEE, paneles de sync/conflictos y formularios create/edit/adopt/categoría offline-first.

---

## 1. Pantallas implementadas

| Ruta | Rol | Contenido |
|------|-----|-----------|
| `/productos` | ADMIN / EMPLOYEE | Catálogo comercial (privados + compartidos adoptados) |
| Diálogos en página | ADMIN | Nuevo producto, editar, adoptar shared, categorías privadas |
| Panel embebido | ambos | `OutboxReviewPanel` (Cola / conflictos) |
| Sidebar | todos | Enlace **Catálogo** → `ROUTES.PRODUCTS` |

**No** se añadieron pantallas de POS, ventas ni caja. `/inventario` y `/debug-offline` se conservan.

### Capturas

| Archivo | Vista |
|---------|-------|
| `docs/p2d1-screenshots/01-login.png` | Login (tras fix Dexie en contenedor) |
| `docs/p2d1-screenshots/02-catalog-desktop.png` | Listado desktop ADMIN + sync OK |
| `docs/p2d1-screenshots/03-catalog-tablet.png` | Tablet |
| `docs/p2d1-screenshots/04-catalog-mobile.png` | Móvil (cards) |
| `docs/p2d1-screenshots/05-create-dialog-mobile.png` | Dialog crear producto privado |
| `docs/p2d1-screenshots/06-outbox-panel.png` | Cola offline / conflictos |
| `docs/p2d1-screenshots/07-catalog-employee.png` | EMPLOYEE solo lectura (sin Nuevo/Adoptar/Categorías) |

---

## 2. Componentes reutilizados

| Pieza | Origen | Uso |
|-------|--------|-----|
| `Button`, `Input`, `Label` | `components/ui/*` | Formularios / acciones |
| `ProtectedRoute` | `components/auth` | Gate de sesión |
| `SyncStatusBadge` | `components/offline` | Conexión + sesión + pendientes |
| `OutboxReviewPanel` | `components/offline` | pending / conflict / rejected + retry UUID |
| `Sidebar` + `ROUTES.PRODUCTS` | layout / routes | Navegación Catálogo |
| Offline stack | `lib/offline/*` | Dexie, enqueue, sync cycle |
| Tokens UI `#1e1e1e` | existente | Botones primarios / tipografía |

### Nuevos

| Path | Rol |
|------|-----|
| `lib/catalog/commercialTypes.ts` | Tipos comerciales |
| `lib/catalog/commercialCatalogService.ts` | Listado/filtros + mutaciones atómicas IDB/outbox |
| `hooks/useCommercialCatalog.ts` | Estado UI + sync |
| `components/features/catalog/SyncStatusChip.tsx` | Chip synced/pending/conflict |
| `components/features/catalog/CatalogProductDialogs.tsx` | Dialogs create/edit/adopt/categoría |
| `app/productos/page.tsx` | Página comercial (reescritura) |
| `tests/offline/commercial-catalog.test.ts` | Pruebas de servicio comercial |

---

## 3. Flujo online / offline

```text
UI (ADMIN) → commercialCatalogService
  → enqueueMutation (UUID estable + proyección local pending)
  → producto visible de inmediato en listCommercialCatalog
  → si online: runCatalogSyncCycle (push→pull)
  → OutboxReviewPanel refleja pending | conflict | rejected | acked
```

Reglas respetadas:

- Precio comercial **solo** `customPrice` (nunca `Product.sellingPrice` como fallback).
- Shared sin BP **no** aparece en el listado comercial; sí en “Adoptar”.
- Crear offline: `PRODUCT_PRIVATE_CREATE_WITH_BP` + BP local pending.
- Editar privado con `serverId`: `PRODUCT_UPDATE` (+ `BP_UPSERT` si cambia precio).
- Editar creación aún pending: `revisePendingPrivateProduct` (mismo UUID de outbox).
- Adoptar: `BP_UPSERT` con precio propio.
- Categoría privada: `CATEGORY_PRIVATE_CREATE` / `CATEGORY_UPDATE`.
- Flash UI: “guardado localmente / pending” — **no** éxito de servidor antes de ack.
- Pull no pisa entidades locales pending/conflict (infra P2-C0.3).

---

## 4. Seguridad por roles

| Acción | ADMIN | EMPLOYEE |
|--------|-------|----------|
| Ver catálogo + sync + outbox | sí | sí |
| Crear/editar producto privado | sí | no (UI + hook) |
| Cambiar customPrice / adoptar | sí | no |
| Categorías privadas | sí | no |
| Editar maestros PLATFORM_SHARED | bloqueado en servicio | — |

Normalización de rol: `/auth/verify` entrega `role: { code }` mientras login entrega string. `AuthContext.mapAuthUser` unifica a string (`ADMIN` / `EMPLOYEE`) para que el catálogo y el resto de gates funcionen tras F5.

---

## 5. Pruebas

### Automatizadas

| Suite | Resultado |
|-------|-----------|
| `frontend` `tsc --noEmit` | 0 errores |
| `frontend` `test:p2d1:offline` (commercial + catalog-sync) | 14 passed |
| `frontend` `test:offline` (outbox + catalog + commercial) | 30 passed |
| `backend` `tsc --noEmit` | 0 errores |
| `backend` `test:p2cb:http` | 16 passed |
| `backend` `test:p2c01:http` | 25 passed |
| `backend` `test:p2b:integrity` | 9 passed |

Cobertura unitaria comercial: listado customPrice-only, create pending visible, revise mismo UUID, bloqueo edición shared, categoría privada.

### Checklist manual / browser (local Docker)

| # | Caso | Evidencia |
|---|------|-----------|
| 1 | Crear producto online | Dialog + sync cycle (infra); UI “Crear offline” + sync |
| 2 | Crear producto offline | Servicio + outbox UUID; dialog “Crear offline” |
| 3 | Editar offline / pending | `revisePendingPrivateProduct` + edit dialog |
| 4 | Cerrar/reabrir navegador | IDB por scope (P2-C0.2/C0.3) |
| 5 | Sync sin duplicados | Suites sync + idempotencia server |
| 6 | Precio independiente | Listado usa solo customPrice; test sellingPrice≠comercial |
| 7 | SKU duplicado | Outbox `SKU_COLLISION` / panel rejected (P2-C0.3) |
| 8 | Categoría privada | Dialog categorías |
| 9 | Adoptar shared | Dialog Adoptar |
| 10 | Roles ADMIN/EMPLOYEE | Capturas 02 vs 07 |
| 11 | pending/conflict | Panel outbox + chips |
| 12 | Responsive | Capturas 02–05 (tabla md+ / cards móvil) |
| 13 | Sin regresiones sync | p2c01 + catalog-sync + p2cb |

---

## 6. Problemas detectados

1. **CORS mal montado:** `cors()` en `server.ts` se añadía *después* de registrar rutas en `app.ts`, por lo que el browser no recibía `Access-Control-Allow-Origin` en `/sync/*`. Corregido montando CORS al inicio de `app.ts` (orígenes `127.0.0.1:3000` y `localhost:3000`).
2. **Rol verify vs login:** `role` objeto vs string rompía `canRead` tras reload — normalizado en `AuthContext`.
3. **Dexie ausente en volumen Docker `node_modules`:** el contenedor frontend no tenía `dexie` hasta `npm install` in-container (host sí lo tenía).
4. **Layout móvil:** el sidebar desktop sigue visible en viewports estrechos (limitación del shell existente); el listado sí cambia a cards (`md:hidden`).
5. **Categorías sin `serverId`:** create de producto requiere categoría ya sincronizada (select solo opciones con `serverId`).
6. **Host `localhost:3000` en esta máquina** responde otra app (redirect `/es/login`); SuperTienda Docker escucha en `127.0.0.1:3000`.

---

## 7. Preparación para P2-D2 inventario

- Stock comercial ya se muestra desde BP (`currentStock` / `availableStock`) en el listado.
- Mutaciones de stock (ajustes) **no** se implementaron en UI (fuera de alcance D1).
- Reutilizar: `useCommercialCatalog` / filas BP, `OutboxReviewPanel`, chips de sync, scope offline.
- Próximo natural: pantalla inventario con `STOCK_ADJUST` vía outbox, sin POS, reutilizando el mismo ciclo push→pull.
- No hace falta schema nuevo para mostrar stock; movimientos detallados / mermas siguen en rutas legacy.

---

## 8. Archivos tocados (principal)

- `frontend/app/productos/page.tsx`
- `frontend/components/layout/Sidebar.tsx`
- `frontend/components/features/catalog/*`
- `frontend/lib/catalog/*`
- `frontend/hooks/useCommercialCatalog.ts`
- `frontend/contexts/AuthContext.tsx`
- `frontend/tests/offline/commercial-catalog.test.ts`
- `frontend/package.json` (scripts `test:p2d1:offline`)
- `backend/src/app.ts` / `backend/src/server.ts` (CORS orden)
- `docs/P2D1_CATALOG_UI_REPORT.md`
- `docs/p2d1-screenshots/*`

---

**Fin P2-D1.** Sin commit, push ni deploy.
