# P2-C0.1B — Informe API segura de sincronización

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Ámbito:** Docker local `supertienda_dev`  
**Precondiciones:** P2-C0.1A (`20261116191000_sync_foundation`)  
**Estado:** Completado — sin migraciones nuevas, sin frontend/POS, sin commit/push

---

## 0. Resumen ejecutivo

Se implementaron `POST /sync/push` y `GET /sync/pull` con aislamiento multiempresa, idempotencia durable (`sync_operations`), optimistic locking (`version`), handlers de catálogo privado + stock, y pull con **watermark de snapshot** para no perder estado final bajo escrituras concurrentes.

Se corrigieron gaps de escritura en Product/Category (`version++` + `updatedAt` en update/delete) imprescindibles para tombstones en pull — **sin cambiar schema.prisma**.

---

## 1. Archivos modificados

| Path | Rol |
|------|-----|
| `backend/src/services/SyncService.ts` | **Nuevo** — push/pull, handlers, hash, advisory lock, savepoints |
| `backend/src/controllers/SyncController.ts` | **Nuevo** — TSOA `/sync/push`, `/sync/pull` |
| `backend/src/types/syncTypes.ts` | **Nuevo** — contratos DTO |
| `backend/src/routes/routes.ts` / `swagger.json` | Regenerados (TSOA) |
| `backend/src/repositories/ProductRepository.ts` | `version`/`updatedAt` en update/delete; BP activo en search |
| `backend/src/repositories/CategoryRepository.ts` | `version`/`updatedAt` en update/delete |
| `backend/src/services/PlatformCatalogService.ts` | `version++` en update product/category |
| `backend/tests/run-p2c01-sync-http.ts` | **Nuevo** — suite S1–S20+ |
| `backend/tests/run-p2b-integrity.ts` | Snapshot BP acotado a ids 1–4 |
| `backend/package.json` | Script `test:p2c01:http` |

**Schema:** sin cambios. **Migraciones:** ninguna adicional.

---

## 2. Contratos API implementados

### Auth común

- JWT tenant vía `requireAuthUser` (`PLATFORM_ADMIN` → 403)
- `businessId` solo desde JWT; body ajeno → 403
- `X-Device-Id` obligatorio (auditoría; no autoriza)
- Límites push: 50 ops / 512 KiB

### `POST /sync/push`

Body: `{ businessId?, operations: [{ clientOperationId, operationType, baseVersion?, dependsOn?, payload }] }`

Respuesta por ítem: `applied | duplicate | conflict | rejected` + mappings / códigos.

### `GET /sync/pull?cursor=&limit=&streams=catalog,stock`

Respuesta: `{ serverTime, snapshotAt, cursor, hasMore, changes[] }` con tombstones (`deleted: true`).

### Handlers

| Op | Comportamiento |
|----|----------------|
| `PRODUCT_PRIVATE_CREATE_WITH_BP` | Tx Product privado + BP; inventory init si stock≠0; SKU/barcode P2-B |
| `PRODUCT_UPDATE` | Solo privado propio; `baseVersion` |
| `CATEGORY_PRIVATE_CREATE/UPDATE` | Solo privada propia |
| `BP_UPSERT` | Precio; no reactiva soft-deleted; no toca stock |
| `STOCK_ADJUST` | Delta + `baseVersion`; `INSUFFICIENT_STOCK` sin movimiento; `InventoryTransaction` ADJUSTMENT |
| `SALE_*` / `CASH_*` / `CUSTOMER_CREATE` | `NOT_IMPLEMENTED` (persistido REJECTED, sin efecto comercial) |

---

## 3. Garantías de idempotencia

1. Hash canónico SHA-256 de `{ operationType, payload }` (JSON estable).  
2. Unique `(businessId, clientOperationId)`.  
3. `pg_advisory_xact_lock` por empresa+UUID → serializa concurrencia.  
4. Mismo hash → `duplicate` + `responseJson` original (**no** reejecuta).  
5. Hash distinto → `IDEMPOTENCY_PAYLOAD_MISMATCH` (**no** sobrescribe fila).  
6. `SAVEPOINT` alrededor del trabajo: unique violation → rollback subxact → persist `REJECTED` sin abortar el lote.  
7. Errores transitorios (fuera de rechazo de negocio) **no** escriben REJECTED — reintento posible.

---

## 4. Estrategia de pull y prueba de no pérdida

### Enfoque: snapshot watermark (sin change-log)

Cursor opaco: `{ snapshotAt, updatedAt, rank, entityType, id }` (base64url).

1. Primera página (sin cursor): fija `snapshotAt = now()`.  
2. Solo filas con `updatedAt <= snapshotAt`.  
3. Paginación estable por `(updatedAt, entityRank, id)`.  
4. Escrituras concurrentes **después** del snapshot quedan fuera y aparecen en la **siguiente** sesión de pull (nuevo `snapshotAt`).

### Por qué no solo `updatedAt + id` sin watermark

Sin watermark, páginas largas “persiguen” updates infinitos y pueden saltar filas bajo reordenamiento. El watermark congela el conjunto.

### Fase 1 — gaps corregidos (código, no schema)

| Gap | Fix |
|-----|-----|
| Product/Category update sin `version++` | Corregido en repos + PlatformCatalogService |
| Soft-delete sin `updatedAt` | Corregido → tombstones visibles en pull |

### Demostración en tests

- S12: paginación con mismo `snapshotAt` entre páginas  
- S13: tombstone product tras soft-delete  
- Soft-delete BP → tombstone en stream `stock`  
- Aislamiento A/B (S11)

### Limitación explícita (no bloqueante para estado final)

No hay **change-log secuencial**: no se garantizan estados intermedios entre syncs, solo el **estado final** dentro de cada snapshot. Suficiente para Modalidad 2 (catálogo/stock). CDC/`sync_events` queda como mejora opcional (requeriría migración — no pedida).

**No se fingió CDC.** Watermark + bumps de `updatedAt`/`version` bastan para no perder el estado final bajo concurrencia y paginación.

---

## 5. Integridad de stock y movimientos

| Regla | Cumplimiento |
|-------|--------------|
| No stock negativo | `INSUFFICIENT_STOCK` sin update |
| Concurrente | `updateMany` con `version` + stock previos |
| `InventoryTransaction` | Misma tx que el ajuste (`ADJUSTMENT`, quantity=delta) |
| No duplicar movimiento | Idempotencia de la op; duplicate no reejecuta |
| `availableStock` | `max(0, current - reserved)` en adjust |
| BP soft-deleted | No ajustable |

---

## 6. Pruebas HTTP y regresiones

### `npm run test:p2c01:http` — 25 passed

Incluye S1–S18, S20, concurrent UUID, stock+inventory, soft-delete BP, NOT_IMPLEMENTED, seed BP 1–4.

### Regresiones

| Suite | Resultado |
|-------|-----------|
| P0 | 14 passed |
| P1-D | 12 passed |
| P1-F | 15 passed |
| P1-G | 10 passed |
| P1-H | 10 passed |
| P2-B integrity | 9 passed |
| `tsc` backend / frontend | OK |
| Docker db/backend | healthy |
| TSOA routes | regeneradas en contenedor |

---

## 7. Limitaciones y bloqueos

| Ítem | Severidad | Notas |
|------|-----------|-------|
| Sin change-log CDC | Media | Watermark cubre estado final; no historial denso |
| Shared categories en pull | Baja | Se listan shared; filtro BP para productos shared |
| `reservedStock` poco usado en POS legacy | Baja | Adjust respeta fórmula available |
| SALE/CASH no implementados | Esperado | `NOT_IMPLEMENTED` |
| Numeración fiscal | Fuera de alcance | — |
| Frontend / IndexedDB / PWA | Fuera de alcance | — |

**No hubo bloqueo que exigiera nueva migración.** Los gaps de `version`/`updatedAt` se resolvieron en código.

---

## 8. Preparación para P2-C y frontend offline

P2-C (`POST /products/private`) puede reutilizar la lógica de `PRODUCT_PRIVATE_CREATE_WITH_BP` o delegar en SyncService.

Frontend offline (P2-C0.2+) debe:

1. Generar UUID + outbox local  
2. Llamar `/sync/push` con `X-Device-Id`  
3. Mapear `idMappings`  
4. Pull con cursor persistido + respetar `snapshotAt`  
5. UI de `rejected`/`conflict` (nunca purge silencioso)  
6. Bloquear mutaciones si refresh JWT venció  

---

## 9. Criterio de cierre

| Criterio | Estado |
|----------|--------|
| Push + pull seguros multiempresa | Cumple |
| Idempotencia + mismatch | Cumple |
| Handlers autorizados | Cumple |
| Pull sin pérdida de estado final (watermark) | Cumple |
| Stock + InventoryTransaction | Cumple |
| Tests + regresiones | Cumple |
| Sin schema/migración nueva | Cumple |
| Sin frontend/POS/commit | Cumple |

**P2-C0.1B cerrado.** Detenerse.
