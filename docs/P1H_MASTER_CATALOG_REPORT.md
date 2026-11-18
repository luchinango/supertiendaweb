# P1-H — Administración segura del catálogo maestro

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Precondiciones:** P1-F (mutaciones tenant bloqueadas), P1-G (PLATFORM_ADMIN + `/platform/health`)  
**Schema:** sin cambios / sin migraciones

---

## 1. Auditoría (Etapa 1)

| Hallazgo | Implicación |
|----------|-------------|
| `Product`/`Category` globales; `BusinessProduct` lleva precio/stock por empresa | Editar nombre/SKU/estado del maestro afecta a todas las empresas vinculadas |
| `SaleItem` / `PurchaseOrderItem` / `InventoryTransaction` → `productId` | DELETE o soft-delete agresivo puede romper históricos |
| `ProductService`/`CategoryService` rechazan mutación (P1-F) | Correcto para tenants; plataforma necesita servicio **separado** |
| Lecturas tenant filtradas por BP | Plataforma debe listar maestro **sin** filtro BP |
| No hay `businessId` en Product/Category | No se inventó ownership privado (híbrido C diferido) |

**Migración Prisma:** no requerida para P1-H.

---

## 2. Rutas implementadas

Todas con `@Security('bearerAuth', ['PLATFORM_ADMIN'])` + `requirePlatformUser` + `PlatformCatalogService.assertPlatform`.

| Método | Ruta |
|--------|------|
| GET | `/platform/health` (previa) |
| GET | `/platform/products` |
| GET | `/platform/products/{id}` |
| POST | `/platform/products` |
| PUT | `/platform/products/{id}` |
| GET | `/platform/categories` |
| POST | `/platform/categories` |
| PUT | `/platform/categories/{id}` |

**No implementado:** DELETE maestro, desactivación masiva, CRUD privado tenant, frontend admin.

Rutas tenant `/products` y `/categories` mutaciones: siguen **403** (P1-F).

TSOA regenerado; paths `:id` coinciden con `@Path() id`.

---

## 3. Permisos aplicados

| Actor | `/platform/*` catálogo | `/products` mutación | BP tenant |
|-------|------------------------|----------------------|-----------|
| PLATFORM_ADMIN | CRUD permitido (sin DELETE) | 403 (P1-F) | 403 |
| ADMIN / EMPLOYEE | 403 | 403 | según reglas |
| Sin token | 401 | 401 | 401 |

---

## 4. Operaciones restringidas / campos de alto impacto

| Restricción | Detalle |
|-------------|---------|
| Sin DELETE | API no expone borrado maestro |
| Sin desactivación masiva | No hay endpoint bulk |
| `status` / `isActive` | **403** si el producto tiene ≥1 `BusinessProduct` |
| Categoría `isActive:false` | **403** si tiene productos |
| BusinessProduct | Nunca se crea/actualiza desde platform catalog |
| Stock / `customPrice` | Intactos |
| Ventas / clientes / inventario tenant | No expuestos |
| Precios maestro `costPrice`/`sellingPrice` | Editables; son referencia de catálogo, **no** sustituyen `customPrice` |

Efecto documentado: cambiar `name`/`sku`/`description` de un producto compartido es visible para todas las empresas que lo tienen en BP (identidad compartida del maestro).

---

## 5. Archivos modificados / nuevos

| Archivo | Rol |
|---------|-----|
| `backend/src/services/PlatformCatalogService.ts` | **Nuevo** — lógica maestro |
| `backend/src/controllers/PlatformController.ts` | Rutas catálogo + health |
| `backend/src/routes/routes.ts` / `swagger.json` | Regenerados |
| `backend/tests/run-p1h-catalog-http.ts` | Suite HTTP |
| `backend/package.json` | `test:p1h:http` |

Product/Category controllers empresariales: sin reapertura de mutaciones.

---

## 6. Pruebas HTTP (`test:p1h:http`)

| Caso | Resultado |
|------|-----------|
| PLATFORM crea producto | PASS 201 |
| PLATFORM lista/consulta | PASS |
| PLATFORM edita campos OK; bloquea `isActive` en vinculado | PASS |
| PLATFORM categorías create/list/update | PASS |
| A/B/empleado 403 | PASS |
| Sin token 401 | PASS |
| Plataforma → BP 403 | PASS |
| Mutaciones `/products`/`/categories` 403 | PASS |
| Stock/precios A/B intactos | PASS |
| Producto compartido seed intacto | PASS |

Limpieza: soft-delete solo filas `P1H-%` / `P1H %` en Docker local.

---

## 7. Regresiones

| Suite | Resultado |
|-------|-----------|
| test:p0 | 14 passed |
| test:p1d / test:p1d:http | 6 / 12 |
| test:p1f:http | 15 |
| test:p1g:http | 10 |
| test:p1h:http | 10 |
| TS backend / frontend | OK |
| Docker health | healthy |

---

## 8. Riesgos pendientes

1. Edición de nombre/SKU compartido sigue siendo impacto multiempresa (mitigado: sin status en vinculados).
2. Sin DELETE: productos de prueba se soft-deleten en suite; no hay política de archivo formal.
3. Precios maestro vs `customPrice` pueden confundir en UI futura.
4. Sin frontend plataforma.
5. Híbrido C (productos privados) aún no existe.

---

## 9. Preparación para catálogo híbrido C

Con P1-H, CODEMEDIIA ya gobierna el maestro. Siguiente (P2, con migración autorizada):

- `Product.businessId` / `visibility`
- Altas privadas por tenant
- Adoptar maestro → crear `BusinessProduct`
- Mantener `/platform/*` solo para `PLATFORM_SHARED`

---

## Veredicto

**P1-H cerrado:** administración maestro solo por `/platform/*`, tenants bloqueados, BP/stock intactos, regresiones verdes. Detenerse.
