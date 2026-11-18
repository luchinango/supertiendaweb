# P2-C.A — Informe de readiness de sincronización y API comercial

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Ámbito:** Docker local (`supertienda_dev` → `db:5432`)  
**Precondiciones:** P2-C0.1B cerrado  
**Estado:** Completado — sin migraciones, sin db push/reset, sin frontend/IndexedDB/POS, sin commit/push

---

## 0. Resumen ejecutivo

La API de sync (`POST /sync/push`, `GET /sync/pull`) está **lista para construir la interfaz offline y los endpoints comerciales de productos privados (P2-C.B)**, bajo el modelo de **estado final por snapshot** (no change-log CDC).

Se corrigió un defecto real de pull (paginación por `take` sin keyset por stream) y se endureció el gate de rol ADMIN para operaciones de catálogo. Las 10 pruebas de concurrencia/paginación + suites P0→P2C01 y `tsc` frontend/backend pasan en Docker local.

**No se requiere migración para continuar a P2-C.B.** Un change-log secuencial queda como mejora opcional futura (requiere autorización).

---

## 1. Estado de la sincronización

### 1.1 Modelo vigente

| Pieza | Estado |
|-------|--------|
| Idempotencia `sync_operations` + hash canónico + advisory lock | Operativo |
| Optimistic lock `version` (Product / Category / BusinessProduct) | Operativo |
| Soft-delete BP + unique parcial activo | Operativo |
| Push: catálogo privado + stock | Operativo |
| Pull: watermark `snapshotAt` + keyset `(updatedAt, rank, entityType, id)` | Operativo (**corregido en P2-C.A**) |
| Gate ADMIN para ops de catálogo | Operativo (**añadido en P2-C.A**) |
| `PLATFORM_ADMIN` en rutas tenant | 403 vía `requireAuthUser` |
| `businessId` solo desde JWT | Cumple |

### 1.2 Garantía de pull (sin pérdidas de estado final)

1. Primera página fija `snapshotAt = now()`.
2. Solo filas con `updatedAt <= snapshotAt`.
3. Paginación keyset **por stream** (`category` / `product` / `businessProduct`) con `take: limit+1` **después** del cursor; merge ordenado; `slice(0, limit)`.
4. Mutaciones posteriores al snapshot quedan fuera y aparecen en la **siguiente** sesión (nuevo `snapshotAt`).
5. Reintentos de la misma página (mismo cursor) son idempotentes a nivel de entrega (at-least-once aceptable; cliente upsert por `serverId`).

**No basta con `snapshotAt` solo:** sin keyset por stream, `take:N` devolvía las N filas más antiguas de cada entidad en todas las páginas → **pérdida de páginas**. Ese bug existía tras P2-C0.1B y se corrigió aquí.

### 1.3 Qué no garantiza el modelo actual

- No hay secuencia de cambios ni estados intermedios entre syncs (solo estado final por snapshot).
- Un update mid-paginación cuyo `updatedAt` queda **atrás** del cursor de la sesión puede diferirse al siguiente snapshot (probado; no es pérdida de estado final).
- Entrega at-least-once dentro de una sesión si el cliente reintenta o si un update reaparece con el mismo id.

Para Modalidad 2 (catálogo/stock offline) esto es suficiente. CDC/`sync_events` sería necesario solo si se exigieran eventos ordenados o auditoría de cada mutación intermedia.

---

## 2. Resultados de pruebas concurrentes (Etapa 1)

Suite: `npm run test:p2ca:pull` → `backend/tests/run-p2ca-pull-concurrency.ts`  
**Resultado: 12/12 PASS**

| # | Caso | Resultado | Nota |
|---|------|-----------|------|
| 1 | Producto actualizado entre dos páginas | PASS | Puede diferirse a siguiente sesión si queda detrás del cursor; no se pierde |
| 2 | Actualizado después de fijar snapshotAt | PASS | Cursor viejo no ve el cambio; siguiente snapshot sí |
| 3 | Mismo `updatedAt` (desempate por id) | PASS | |
| 4 | Soft-delete durante paginación | PASS | Tombstone en sesión o siguiente |
| 5 | BP desvinculado (soft-delete) | PASS | Tombstone en stream stock |
| 6 | Visibilidad / vínculo producto compartido | PASS | Vía BP |
| 7 | Reinicio con cursor persistido | PASS | Misma sesión `snapshotAt` |
| 8 | Reanudación tras error de red | PASS | Reintento misma página estable |
| 9 | Dos clientes simultáneos | PASS | Aislamiento + progreso independiente |
| 10 | Cambio entre fin de snapshot y siguiente | PASS | Aparece en siguiente |
| + | EMPLOYEE no administra catálogo vía sync | PASS | `FORBIDDEN_ROLE` |
| + | Keyset: >N productos no se pierden | PASS | Regresión del bug `take` sin keyset |

### Suites de regresión (Docker local)

| Suite | Resultado |
|-------|-----------|
| `test:p0` | 14/14 |
| `test:p1d:http` | 12/12 |
| `test:p1f:http` | 15/15 |
| `test:p1g:http` | 10/10 |
| `test:p1h:http` | 10/10 |
| `test:p2b:integrity` | 9/9 |
| `test:p2c01:http` | 25/25 |
| `test:p2ca:pull` | 12/12 |
| `tsc --noEmit` backend | OK |
| `tsc --noEmit` frontend | OK |

Base de datos usada: `postgresql://…@db:5432/supertienda_dev` (contenedor local). Sin acceso remoto.

---

## 3. Riesgos y defectos encontrados

### 3.1 Defecto corregido (P2-C.A)

| ID | Severidad | Descripción | Fix |
|----|-----------|-------------|-----|
| PULL-KEYSET | Alta | Pull hacía `findMany` con `take: limit(+1)` **sin** filtro “después del cursor” por entidad → páginas posteriores repetían las mismas N filas más antiguas y **omitían el resto del catálogo** | `keysetWhere(decoded, entityType)` por stream + `take: limit+1` post-cursor |
| ROLE-CATALOG | Media | EMPLOYEE podía empujar ops de catálogo privado / precio | Gate `actor.role === 'ADMIN'` → `FORBIDDEN_ROLE` |

### 3.2 Riesgos residuales (aceptados / documentados)

| ID | Riesgos | Mitigación actual | ¿Bloquea IndexedDB? |
|----|---------|-------------------|---------------------|
| R1 | Sin change-log: no hay eventos intermedios | Snapshot = estado final; cliente upsert | No |
| R2 | Update mid-sesión detrás del cursor | Siguiente `snapshotAt` | No |
| R3 | At-least-once en reintentos | Idempotencia cliente por `serverId` / versión | No |
| R4 | `BP_UPSERT` tras soft-delete crea fila nueva (stock 0); no reactiva | Unique parcial `WHERE deleted_at IS NULL`; intencional | No |
| R5 | `STOCK_ADJUST` permitido a EMPLOYEE | Diseño POS; no es admin de catálogo | No |
| R6 | Multi-stream merge en memoria (hasta ~3×limit) | Límite 200; aceptable MVP | No |

### 3.3 Change-log / secuencia (propuesta, **no aplicar**)

Si en el futuro se exige “cero diferimiento mid-paginación” o auditoría ordenada:

1. Tabla `sync_events (id BIGSERIAL, business_id, entity_type, entity_id, op, payload, created_at)`.
2. Triggers o escritura en el mismo TX que muta Product/Category/BP.
3. Pull por `id > cursor` (secuencia monotónica) en lugar de watermark+updatedAt.

**Requiere migración autorizada.** No es necesaria para P2-C.B ni para IndexedDB Modalidad 2.

---

## 4. Correcciones menores realizadas (seguras, sin schema)

| Archivo | Cambio |
|---------|--------|
| `backend/src/services/SyncService.ts` | Keyset por stream en `pull`; gate ADMIN en ops de catálogo |
| `backend/tests/run-p2ca-pull-concurrency.ts` | Suite de 10+2 casos reales |
| `backend/package.json` | Script `test:p2ca:pull` |

Sin cambios a `schema.prisma`. Sin migraciones. Sin `db push` / `migrate reset`.

---

## 5. Cambios de schema necesarios (solo propuesta — **no ejecutados**)

| Prioridad | Cambio | Motivo | Autorización |
|-----------|--------|--------|--------------|
| Opcional | `sync_events` + secuencia | CDC / pull por id monotónico | Pedir antes de migrar |
| Opcional | `publicId UUID` en Product/Category/BP | Mapear offline sin solo `localEntityId` | Pedir antes de migrar |
| No requerido | Otros | — | — |

**P2-C.A no solicita ejecutar ninguno.** Continuar a P2-C.B sin migración.

---

## 6. Diseño definitivo de API P2-C.B

### 6.1 Principio: una sola capa de reglas

Extraer (o exponer) los handlers de `SyncService` como **único** núcleo de escritura comercial:

```
HTTP unitario  ──┐
                 ├──► CatalogCommercialService / SyncService handlers
POST /sync/push ─┘         (mismas validaciones, TX, version, soft-delete)
```

Los endpoints unitarios **no** reimplementan reglas; invocan el mismo código que el push (con `clientOperationId` = header `Idempotency-Key` o UUID generado server-side si online-only).

### 6.2 Contratos previstos

| Endpoint | Op sync equivalente | Auth |
|----------|---------------------|------|
| `POST /products/private` | `PRODUCT_PRIVATE_CREATE_WITH_BP` | JWT tenant · **ADMIN** |
| `GET /products/private` | Lectura (filtro `BUSINESS_PRIVATE` + `businessId` JWT) | JWT tenant · ADMIN/EMPLOYEE lectura |
| `PUT /products/private/{id}` | `PRODUCT_UPDATE` | JWT tenant · **ADMIN** |
| `POST /categories/private` | `CATEGORY_PRIVATE_CREATE` | JWT tenant · **ADMIN** |
| `PUT /categories/private/{id}` | `CATEGORY_UPDATE` | JWT tenant · **ADMIN** |
| `POST /products/shared/{productId}/adopt` | `BP_UPSERT` (precio obligatorio) | JWT tenant · **ADMIN** |
| `PUT /business-products/{id}/price` | `BP_UPSERT` | JWT tenant · **ADMIN** |

Fuera de alcance P2-C.B: ventas, caja, POS remount, IndexedDB UI.

### 6.3 Matriz de seguridad (obligatoria)

| Regla | Cómo se cumple |
|-------|----------------|
| `businessId` solo JWT | `requireAuthUser` + ignorar/403 body ajeno |
| ADMIN crea/edita catálogo | Mismo gate que sync (`FORBIDDEN_ROLE`) |
| EMPLOYEE sin admin de catálogo | 403 en mutaciones; lectura OK |
| `PLATFORM_ADMIN` sin ops tenant | `rejectPlatformOnTenantRoute` |
| `customPrice` obligatorio en BP | Validación handler `BP_UPSERT` / create-with-BP |
| Product + BP atómicos | Una TX (`PRODUCT_PRIVATE_CREATE_WITH_BP`) |
| Sin mutar catálogo maestro | Solo `BUSINESS_PRIVATE` propio; shared solo vía BP |
| Sin reactivar BP soft-deleted | `findFirst deletedAt: null`; create nueva fila activa |
| UUID / idempotencia offline | `Idempotency-Key` = `clientOperationId` (UUID); hash + unique `(businessId, clientOperationId)` |

### 6.4 Lectura `GET /products/private`

- Scope: `visibility = BUSINESS_PRIVATE AND businessId = JWT`.
- Incluir BP activo (`deletedAt IS NULL`) de la empresa.
- No listar privados de otra empresa ni maestros como “propios”.
- Productos `PLATFORM_SHARED` adoptados: endpoint aparte o query `?adopted=1` sobre BP activos → producto shared (no mezclar ownership).

---

## 7. Criterios para habilitar IndexedDB y outbox

Habilitar persistencia local **solo cuando** se cumplan todos:

1. **Pull sin pérdidas de estado final** — suite `test:p2ca:pull` verde (cumplido).
2. **Push idempotente** — `test:p2c01:http` S5/S5b/S6 + concurrencia UUID (cumplido).
3. **Roles** — ADMIN/EMPLOYEE/PLATFORM_ADMIN según matriz (cumplido en sync; replicar en P2-C.B HTTP).
4. **API comercial unitaria** compartiendo handlers (P2-C.B) — pendiente de implementación.
5. **Contrato estable** de `changes[]` / tombstones / `idMappings` documentado y versionado.
6. **Outbox local:** nunca borrar operación pendiente en silencio; reintentar; marcar `rejected`/`conflict` visibles al usuario.
7. **Refresh JWT vencido** bloquea nuevas mutaciones outbox (decisión P2-C0.1).
8. **Sin POS/caja/fiscal offline** hasta etapas autorizadas.

**Veredicto IndexedDB:** cimientos server **listos**. La UI IndexedDB/outbox puede comenzar **después** de P2-C.B (endpoints unitarios + mismos handlers), no antes, para no acoplar el cliente solo a `/sync/push` sin superficie comercial online.

---

## 8. Archivos tocados en P2-C.A

| Path | Rol |
|------|-----|
| `backend/src/services/SyncService.ts` | Fix keyset pull; gate ADMIN catálogo |
| `backend/tests/run-p2ca-pull-concurrency.ts` | Nuevo — 12 pruebas |
| `backend/package.json` | `test:p2ca:pull` |
| `docs/P2CA_SYNC_READINESS_REPORT.md` | Este informe |

---

## 9. Conclusión

- Sync pull: **seguro para estado final** tras fix keyset; 10 escenarios concurrentes demostrados.
- Reutilización hacia API privada: **viable** extrayendo handlers; no duplicar reglas.
- Schema: **sin cambios requeridos** para P2-C.B.
- Siguiente etapa autorizable: **P2-C.B** (endpoints comerciales sobre el mismo núcleo).
- Change-log CDC: opcional; **pedir autorización** si se exige.

**P2-C.A cerrado.**
