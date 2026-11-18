# P2-C.B — Informe API comercial de productos privados

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Ámbito:** Docker local (`supertienda_dev`)  
**Precondiciones:** P2-C.A cerrado  
**Estado:** Completado — sin migraciones, sin frontend/IndexedDB/POS, sin commit/push

---

## 0. Resumen ejecutivo

Se implementaron los endpoints comerciales de catálogo privado reutilizando el mismo núcleo de reglas que `POST /sync/push` vía `CatalogCommercialService` + `SyncService.push` (idempotencia, versión, SKU, soft-delete, tenant).

Suite `test:p2cb:http` **16/16**. Regresiones P0→P2-C.A verdes. `tsc` frontend/backend OK.

---

## 1. Endpoints implementados

| Método | Path | Rol | Idempotency-Key |
|--------|------|-----|-----------------|
| `POST` | `/products/private` | ADMIN | UUID obligatorio |
| `GET` | `/products/private` | ADMIN + EMPLOYEE | — |
| `PUT` | `/products/private/{id}` | ADMIN | UUID obligatorio |
| `POST` | `/categories/private` | ADMIN | UUID obligatorio |
| `PUT` | `/categories/private/{id}` | ADMIN | UUID obligatorio |
| `POST` | `/products/shared/{productId}/adopt` | ADMIN | UUID obligatorio |
| `PUT` | `/business-products/{id}/price` | ADMIN | UUID obligatorio |

Respuestas de mutación incluyen `clientOperationId`, `status` (`applied`|`duplicate`), `version`, `idMappings` cuando aplica, e IDs comerciales (product / BP / category).

Errores estables en body: `code` = `FORBIDDEN_ROLE` | `VERSION_CONFLICT` | `SKU_COLLISION` | `NOT_FOUND` | `IDEMPOTENCY_PAYLOAD_MISMATCH` | `INVALID_IDEMPOTENCY_KEY` | …

---

## 2. Archivos modificados / creados

| Path | Rol |
|------|-----|
| `backend/src/services/CatalogCommercialService.ts` | **Nuevo** — handlers + listado + fachada HTTP |
| `backend/src/services/SyncService.ts` | `dispatch` delega catálogo al núcleo compartido |
| `backend/src/types/catalogCommercialTypes.ts` | **Nuevo** — DTOs TSOA |
| `backend/src/controllers/ProductController.ts` | Rutas `private` / `shared/.../adopt` (antes de `{id}`) |
| `backend/src/controllers/CategoryController.ts` | Rutas `private` |
| `backend/src/controllers/BusinessProductController.ts` | `PUT {id}/price` |
| `backend/src/controllers/privateCatalogHttp.ts` | Helpers Idempotency-Key / device |
| `backend/src/errors/index.ts` | `code` + `details` en `CustomError` |
| `backend/src/middlewares/errorHandler.ts` | Expone `code`/`details` |
| `backend/src/routes/routes.ts` / `swagger.json` | Regenerados TSOA |
| `backend/tests/run-p2cb-private-catalog-http.ts` | **Nuevo** — suite HTTP |
| `backend/tests/run-p2c01-sync-http.ts` / `run-p2ca-pull-concurrency.ts` | `psql` aplana SQL (evita corte cmd.exe) |
| `backend/package.json` | Script `test:p2cb:http` |
| `docs/P2CB_PRIVATE_CATALOG_API_REPORT.md` | Este informe |

**Schema / migraciones:** ninguna.

---

## 3. Reutilización de reglas comerciales

```
HTTP unitario ──► CatalogCommercialService.create*/update*/adopt/price
                         │
                         ▼
                  SyncService.push (1 op)
                         │
                         ▼
                  processOne (lock + hash + sync_operations)
                         │
                         ▼
                  CatalogCommercialService.handle*  ◄── mismo código que sync
```

Una sola implementación de:

- propiedad tenant (`businessId` JWT);
- unicidad SKU/barcode P2-B;
- permisos ADMIN en mutaciones de catálogo;
- optimistic lock `version`;
- idempotencia `(businessId, clientOperationId)` + hash canónico;
- soft-delete BP (no reactivación; create de fila activa nueva);
- precio `customPrice` obligatorio en create/adopt/price.

`STOCK_ADJUST` permanece en `SyncService` (fuera del alcance comercial de esta etapa).

---

## 4. Seguridad multiempresa

| Regla | Cumplimiento |
|-------|--------------|
| `businessId` solo JWT | `requireAuthUser` |
| Sin fallback empresa 1 | Sí |
| ADMIN muta / EMPLOYEE lee | Gate `FORBIDDEN_ROLE` + assert en fachada |
| `PLATFORM_ADMIN` en rutas tenant | 403 |
| Sin mutar maestros | Solo `BUSINESS_PRIVATE` propio; adopt solo `PLATFORM_SHARED` |
| Aislamiento A/B | List/update/price 404 o vacío cruzado |
| P1-F / P1-H | Regresiones verdes |

**Nota de rutas:** los paths estáticos `products/private` se declararon **antes** de `products/{id}` en `ProductController` para que Express/TSOA no interprete `"private"` como id.

---

## 5. Idempotencia

- Header `Idempotency-Key` = `clientOperationId` (UUID).
- Mismo UUID + mismo payload → `200` + `status: duplicate` + mismos IDs (respuesta perdida segura).
- Mismo UUID + payload distinto → `409 IDEMPOTENCY_PAYLOAD_MISMATCH`.
- `X-Device-Id` opcional en HTTP (default `commercial-http`); obligatorio en `/sync/*`.

---

## 6. Pruebas HTTP y regresiones

### `npm run test:p2cb:http` — 16/16

CRUD/roles, aislamiento A/B, adopt + no reactivación, precios independientes, idempotencia, mismatch UUID, conflictos de versión, categoría ajena, Product+BP atómicos, SKU, regresión sync push/pull, P1-F.

### Regresiones

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
| `test:p2cb:http` | 16/16 |
| `tsc` backend / frontend | OK |

Docker local únicamente (`db:5432/supertienda_dev`).

---

## 7. Riesgos pendientes

| Riesgo | Severidad | Nota |
|--------|-----------|------|
| SQL de tests multilínea vía `cmd -c "..."` | Mitigado | Helpers `psql` ahora aplanan whitespace; un UPDATE sin WHERE llegó a soft-delete masivo en una corrida previa y se reparó el seed BP 1–4 |
| Filas BP soft-deleted históricas de corridas de sync | Baja | No afectan unique parcial activo; cleanup por tag en suites |
| `GET /products/private` no pagina por cursor sync | Info | Paginación page/limit online; pull sigue siendo la vía offline |
| Change-log CDC | Opcional | Sin schema; ver P2-C.A |

---

## 8. Preparación para P2-C0.2 IndexedDB / outbox

Criterios P2-C.A §7 punto 4 (**API comercial unitaria**) → **cumplido**.

Listo para P2-C0.2 cuando se autorice:

1. Outbox local con `Idempotency-Key` = UUID de operación.
2. Mapear mutaciones offline a los mismos `operationType` / payloads que sync y HTTP.
3. Aplicar `idMappings` + `version` de respuestas `applied`/`duplicate`.
4. Superficie de errores `code` estable para UI de conciliación.
5. No borrar pendientes en silencio; refresh JWT vencido bloquea mutaciones nuevas.

**P2-C.B cerrado.** Siguiente etapa autorizable: P2-C0.2 IndexedDB/outbox (sin POS/caja/fiscal aún).
