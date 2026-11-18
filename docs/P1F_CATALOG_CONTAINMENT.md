# P1-F — Contención de seguridad del catálogo global (T1 estricta)

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Decisión:** T1 estricta + preparación híbrida C (sin migraciones)  
**Base:** Docker local `db:5432/supertienda_dev` — **no remota**

---

## 1. Vulnerabilidades corregidas

| ID (P1-E) | Antes | Después |
|-----------|-------|---------|
| C1 | Admin A renombra producto compartido → B lo ve | `PUT /products/{id}` → **403** |
| C2 | Admin A desactiva producto exclusivo de B | `PUT .../deactivate` → **403** |
| C3 | Empleado crea categoría global | `POST /categories` → **403** |
| C4 | `GET /products` lista ítems ajenos | Lista solo productos con `BusinessProduct` de la empresa |
| H1/H2 | ADMIN empresa = poder global | Mutaciones maestro bloqueadas para **todos** los usuarios de empresa (sin `PLATFORM_USER_IDS`, sin excepción ADMIN) |

Bloqueo aplicado en **controller y service** (`rejectCatalogMasterMutation` → `ForbiddenError` 403).

---

## 2. Rutas bloqueadas (403)

### Productos
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `PUT /products/{id}/activate`
- `PUT /products/{id}/deactivate`
- `PUT /products/{id}/discontinue`
- `PUT /products/{id}/out-of-stock`

### Categorías
- `POST /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`
- `PUT /categories/{id}/activate`
- `PUT /categories/{id}/deactivate`

Mensaje: *Mutación del catálogo maestro bloqueada… (contención P1-F)*.

---

## 3. Lecturas permitidas y restringidas

**Política conservadora** (sin inferir ownership por “único BP”):

| Visible | Criterio |
|---------|----------|
| Sí | Existe `BusinessProduct` con `businessId` del JWT |
| Sí (compartido) | Producto con BP de A **y** de B → visible para ambas |
| No | Producto solo vinculado a otra empresa |
| No | Producto huérfano (sin BP) |

Misma lógica en categorías: solo categorías con al menos un producto visible para la empresa (`categoryVisibleToBusinessWhere`).

| Ruta | Comportamiento |
|------|----------------|
| `GET /products` | Filtrado por BP de la empresa |
| `GET /products/{id}` | 200 si vinculado; **404** si ajeno |
| `GET /categories`, tree, stats, search | Filtrado conservador |
| `GET /business-products/*` | Sin cambio (P0.3) |

**Bloqueo documentado:** el schema no distingue maestro vs privado; por eso no se inventó `ownerBusinessId`. La visibilidad se basa únicamente en vínculos BP existentes.

---

## 4. Pruebas HTTP antes / después

| Caso | P1-E (antes) | P1-F (después) |
|------|--------------|----------------|
| A `PUT /products/1` | 200 (muta) | **403** |
| A `PUT /products/3/deactivate` | 200 | **403** |
| employee `POST /categories` | 201 | **403** |
| A `GET /products` incluye id=3 | Sí | **No** |
| A `GET /products/3` | 200 | **404** |
| A/B `GET /products/1` compartido | 200 | **200** |
| BP operaciones + tenancy | OK | **OK** |
| Login/refresh | OK | **OK** |

Automatizado: `npm run test:p1f:http` → **15 passed**.

---

## 5. Impacto sobre frontend

| Área | Impacto |
|------|---------|
| `fetcher` | Propaga `status` / `isForbidden` en el Error |
| `PaginatedService` | `update` usa `PUT`; no trata 403 como éxito |
| `useProducts` add/edit/remove | Ya re-lanza el error y revierte optimistic update |
| Formularios de alta/edición de **productos/categorías globales** | Quedan **temporalmente bloqueados** (403) hasta catálogo híbrido / altas privadas |
| Catálogo vía `business-products` / precios-stock | Sigue operativo |

**No** se implementaron formularios nuevos.

---

## 6. Regresiones verificadas

| Suite | Resultado |
|-------|-----------|
| `test:p1f:http` | 15 passed |
| `test:p0` | 11 passed |
| `test:p1d` | 6 passed |
| `test:p1d:http` | 12 passed |
| TS backend | OK (ajuste mínimo `posService.findById(..., cart.businessId)`) |
| TS frontend | 0 errors |
| Docker health | healthy |
| Precios/stocks demo BP | intactos en prueba |

---

## 7. Riesgos residuales

1. **Sin altas de producto** para tenants hasta híbrido C o endpoint privado.
2. Schema sigue global: no hay ownership formal; lectura depende de BP.
3. SKU/barcode `@unique` globales siguen en DB (contención no los relaja).
4. Soft-deleted categories históricas pueden existir; no se purgaron filas.
5. `PLATFORM_ADMIN` aún no existe.
6. POS no montado (solo tipado alineado).

---

## 8. Propuesta P1-G — permisos de plataforma

1. Rol `PLATFORM_ADMIN` (CODEMEDIIA) sin `employee.businessId` de tenant (o flag explícito).
2. Scopes TSOA: `catalog.master.write` solo plataforma.
3. Rutas `/platform/products|categories` separadas del CRUD tenant.
4. Seed de usuario plataforma **solo en Docker local**.
5. Tests: tenant 403; platform 200 en mutación maestro (cuando se autorice).

---

## 9. Preparación para migración híbrida C

Tras P1-G:

- Añadir `businessId?` + `visibility` en `Product`/`Category` (migración autorizada).
- Migrar datos: multi-BP → `PLATFORM_SHARED`; un solo BP → privado de esa empresa.
- `POST /products` tenant → crea privado + BP.
- UI: “Catálogo CODEMEDIIA (adoptar)” vs “Mis productos”.

**P1-F no modifica schema ni inicia P2.**

---

## Archivos tocados

- `backend/src/helpers/catalogContainment.ts` (nuevo)
- `ProductController` / `CategoryController` / services / repositories / interfaces
- `posService.ts` (firma `findById`)
- `frontend/lib/fetcher.ts`, `api-utils.ts`
- `backend/tests/run-p1f-catalog-http.ts`, script `test:p1f:http`
- TSOA `routes.ts` / `swagger.json` regenerados

---

## Veredicto

**Contención T1 cerrada:** no queda mutación global de catálogo autorizada para usuarios de empresa (HTTP 15/15).  
Detenerse. Esperar aprobación para P1-G o diseño híbrido C.
