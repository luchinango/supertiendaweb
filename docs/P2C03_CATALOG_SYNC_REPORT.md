# P2-C0.3 — Informe sincronización completa del catálogo offline

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Ámbito:** Frontend IndexedDB + Docker local (`127.0.0.1:5000`)  
**Precondiciones:** P2-C0.2 cerrado  
**Estado:** Completado — sin migraciones, sin POS/caja/PWA, sin commit/push, sin borrar BP 118

---

## 0. Resumen ejecutivo

Se cerró el ciclo **outbox → POST /sync/push → GET /sync/pull → proyección IndexedDB** para el catálogo, con orquestador **push→pull**, exclusión multipestaña vía **Web Locks API** (fallback memoria), UI mínima de conflictos y harness `/debug-offline`.

Contrato `changes[]` validado contra el backend real (`SyncPullChange`: `stream`, `entityType`, `serverId`, `version`, `updatedAt`, `deleted`, `deletedAt`, `payload`).

---

## 1. Arquitectura pull/push

```text
runCatalogSyncCycle(scope)
  acquireSyncLock (Web Locks / fallback)
  1) recover orphan sending
  2) POST /sync/push  (UUID estable, ≤50, deps)
  3) GET /sync/pull   (páginas hasta hasMore=false)
       applyPullChanges → products|categories|businessProducts
       syncState.cursor / snapshotAt / PULL_IN_PROGRESS
  release lock + BroadcastChannel notify
```

### Orden push → pull (justificado)

1. **Push primero** materializa IDs/version y surface `VERSION_CONFLICT` / `SKU_COLLISION` contra el servidor actual.  
2. **Pull después** descarga el snapshot de estado final; **no** marca outbox como acked (solo `applyPushResults` tras respuesta persistida).  
3. Entidades locales `pending` / `conflict` **no se sobrescriben** en pull.  
4. Pull→push sería peor: retrasaría conflictos y aumentaría riesgo de pisar proyecciones locales.

### Contrato pull (real)

Respuesta: `{ serverTime, snapshotAt, cursor, hasMore, changes[] }`.

Payloads no inventados:

| entityType | payload (activo) | tombstone |
|------------|------------------|-----------|
| category | name, description, parentId, visibility, businessId, isActive, sortOrder | `payload: null`, `deleted: true` |
| product | name, sku, barcode, categoryId, visibility, businessId, costPrice, sellingPrice, isActive, status, unit, brand | idem |
| businessProduct | productId, customPrice, currentStock, reservedStock, availableStock | `{ productId }` + deleted |

Aislamiento: el servidor solo emite privados del JWT y shared **adoptados** (BP de la empresa).

---

## 2. Stores y mapeos

| Store | Clave local | Mapeo server |
|-------|-------------|--------------|
| products / categories / businessProducts | UUID outbox **o** `srv:{type}:{serverId}` | `idMap` + `serverId` index |
| outbox | `clientOperationId` | — |
| syncState `catalog` | cursor, snapshotAt, lastError=`PULL_IN_PROGRESS` mid-pager | |

Upsert: por `serverId`; misma `version` → no-op; tombstone → `syncStatus=tombstone`.

---

## 3. Coordinación multipestaña

| Mecanismo | Rol |
|-----------|-----|
| **Web Locks API** (`navigator.locks`) | Mutex exclusivo por scope — **autoridad** |
| Fallback `memoryHeld` | Misma pestaña si no hay Locks API |
| **BroadcastChannel** | Solo notificación `sync-done` / `outbox-changed` — **no** mutex |
| Idempotencia server | Última protección ante doble push |

Evita dos ciclos simultáneos, corrupción de cursor y doble aplicación local del mismo scope.

---

## 4. Conflictos y UI

- Panel `OutboxReviewPanel`: pending / sending / acked / conflict / rejected / dead.  
- Muestra `lastErrorCode`, operación y entidad.  
- Reintento recuperable = **mismo UUID**, sin reescribir payload.  
- `SKU_COLLISION` / `VERSION_CONFLICT` exigen acción explícita (nuevo UUID o baseVersion).  
- Harness: `/debug-offline` (crear offline + sync + conteos).  
- Badge → link “Revisar cola offline”.

---

## 5. Archivos principales

| Path | Rol |
|------|-----|
| `lib/offline/syncPullClient.ts` | Cliente tipado GET /sync/pull |
| `lib/offline/pullApplier.ts` | applyPullChanges + protección pending |
| `lib/offline/syncLock.ts` | Web Locks + BroadcastChannel |
| `lib/offline/syncOrchestrator.ts` | Ciclo push/pull |
| `components/offline/OutboxReviewPanel.tsx` | UI conflictos |
| `app/debug-offline/page.tsx` | Harness |
| `tests/offline/catalog-sync*.test.ts` | Unit + HTTP Docker |

---

## 6. Pruebas ejecutadas

| Suite | Resultado |
|-------|-----------|
| `test:offline` | 26/26 |
| `test:p2c03:offline` (unit+HTTP) | 15/15 |
| `test:p2c02:audit` | seed 1–4 OK (residuos 118/200 documentados, no borrados) |
| P0 → P2-C.B | verdes |
| `tsc` frontend/backend | OK |
| Docker `/health` | healthy |

Cobertura alineada a los 20 escenarios (unit + HTTP real donde aplica: primera descarga, create offline+reload+sync, retry UUID, dos empresas, shared/BP, tombstone, conflictos, cursor mid-pager, sesión, IDB fail, no delete silencioso).

---

## 7. Limitaciones

- Sin POS/caja/facturación / PWA.  
- Mutex Web Locks depende del navegador; fallback no es cross-tab.  
- Residuos BP test (118, 200, …) no eliminados (autorización requerida).  
- Pull no incluye privados de otras empresas (garantía server).

---

## 8. Siguiente etapa sugerida

UI comercial de catálogo privado sobre esta sync; opcionalmente Background Sync / PWA cuando se autorice.

**P2-C0.3 cerrado.**
