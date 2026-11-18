# P0.3 — Corrección crítica de aislamiento multiempresa

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Origen:** fallos HTTP documentados en `docs/P1C_E2E_VALIDATION.md`  
**Restricciones:** solo Docker local; sin migraciones; sin commit/push/deploy; sin P2

---

## 1. Causa raíz de cada vulnerabilidad

| ID | Endpoint / caso | Causa raíz |
|----|-----------------|------------|
| V1 | `GET /business-products?businessId=2` | El controller llamaba `getBusinessId`, pero el runtime no aplicaba el rechazo de forma fiable hasta regenerar TSOA + reiniciar; además el listado dependía solo del controller. Tras el fix: rechazo **403** con mensaje de empresa ajena. |
| V2 | `GET /business-products/business/{id}` | `routes.ts` generado **sin** parámetro `request` pese a `@Request()` en el controller → `request` llegaba `undefined` y la validación no se ejecutaba; el path `businessId` se usaba directo en el servicio. |
| V3 | `GET /business-products/{id}` | `getBusinessProductById` **no** recibía JWT ni verificaba `businessId` del registro; `findById` global. |
| V4 | `POST /business-products` | `createBusinessProduct` aceptaba `body.businessId` sin validar JWT; servicio solo validaba “> 0”. |
| V5 | `PUT .../business/{id}/product/{pid}` | Misma causa que V2: TSOA sin inyección de `request` → update por path ajeno. |
| V6 | `PUT/DELETE /business-products/{id}` | Update/delete/adjust/restock por ID global sin pertenencia a empresa. |
| V7 | `GET .../product/{productId}` (negocios por producto) | Devolvía BP de **todas** las empresas. |

**Causa sistémica:** desfase entre firmas TSOA (`@Request`) y `backend/src/routes/routes.ts` generado; controles solo en controller incompletos; servicio sin enforcement de tenancy en operaciones por ID.

---

## 2. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/controllers/BusinessProductController.ts` | JWT en create/get/update/delete/adjust/restock; scope de `getBusinessesByProduct` |
| `backend/src/services/BusinessProductService.ts` | `findByIdForBusiness`, `update/delete/adjust/restockForBusiness`, `findMany` exige `businessId`, `ForbiddenError` |
| `backend/src/interfaces/services/IBusinessProductService.ts` | Firmas nuevas de aislamiento |
| `backend/src/routes/routes.ts` | **Regenerado** con `npx tsoa spec && npx tsoa routes` (en contenedor) |
| `backend/src/swagger.json` | Regenerado junto con TSOA spec |

---

## 3. Rutas TSOA regeneradas

Comando oficial del proyecto (vía contenedor local):

```bash
docker exec -i supertienda-backend sh -c 'cd /app && npx tsoa spec && npx tsoa routes'
docker compose --env-file .env.docker restart backend
```

Verificado en `routes.ts` que ahora incluyen `"in":"request"`:

- `getProductsByBusiness`
- `getBusinessProductById`
- `createBusinessProduct`
- `updateBusinessProduct` / `updateBusinessProductByBusinessAndProduct`
- `deleteBusinessProduct` / `deleteBusinessProductByBusinessAndProduct`
- `getBusinessProductCatalog` (+ variantes path)

Backend reiniciado; health **200**.

---

## 4. Tabla de pruebas HTTP antes / después

| Caso | Antes (P1-C) | Después (P0.3) |
|------|--------------|----------------|
| A `?businessId=2` | FAIL 200 (datos B) | **PASS 403** |
| A `/business/2` | FAIL 200 | **PASS 403** |
| A `GET /{id}` de B | FAIL 200 | **PASS 403** |
| A `POST` con `businessId=2` | FAIL 201 | **PASS 403** |
| A `PUT` path B | FAIL 200 | **PASS 403** |
| A `DELETE /{id}` B | (no cubierto / expuesto) | **PASS 403** |
| A `PUT /{id}` B | (expuesto) | **PASS 403** |
| Sin JWT | PASS 401 | **PASS 401** |
| JWT inválido | PASS 401 | **PASS 401** |
| Listado A / B propios | PASS | **PASS 200** (sin mezcla) |
| GET id propio A/B | — | **PASS 200** |
| Path propio A | — | **PASS 200** |

Credenciales demo no documentadas aquí. DB demo de precios/stocks **intacta** tras rechazos (4 filas seed).

---

## 5. Evidencia de escrituras cruzadas rechazadas

Respuestas HTTP reales (curl) con token Empresa A:

- `POST /business-products` body `businessId=2` → **403** `No autorizado para acceder a datos de otra empresa`
- `PUT /business-products/business/2/product/3` `{customPrice:99}` → **403**
- `PUT /business-products/4` → **403**
- `DELETE /business-products/4` → **403**

Estado final `business_products`:

| id | business_id | product_id | custom_price |
|----|-------------|------------|--------------|
| 1 | 1 | 1 | 8.50 |
| 2 | 2 | 1 | 9.00 |
| 3 | 1 | 2 | 15.00 |
| 4 | 2 | 3 | 7.00 |

Sin filas nuevas persistidas de intentos cruzados.

---

## 6. Resultado de pruebas legítimas

| Operación | Resultado |
|-----------|-----------|
| Login `admin_a` / `admin_b` | 200 |
| Listado BP empresa A | 200, solo `businessId=1` |
| Listado BP empresa B | 200, solo `businessId=2` |
| GET BP id=3 (A) con token A | 200 |
| GET BP id=4 (B) con token B | 200 |
| Path `/business/1` con token A | 200 |

Producto compartido (SKU-SHARED-001) sigue con precios/stocks **separados por empresa**.

---

## 7. Resultado de auditoría de otros controladores

| Área | Estado |
|------|--------|
| `PurchaseOrderController` | Ya endurecido en P0.2; tests P0 + HTTP previos 403 en path ajeno |
| `SupplierController` | Usa `getBusinessId` + servicio por empresa (incl. getById) |
| `employeeController` (legacy `/api/employees`) | Usa `resolveBusinessId` en list/get/create/update/delete |
| `ProductController` (catálogo **global**) | Varias mutaciones por `id` **sin** scope de empresa (modelo de producto compartido). **No rediseñado** en P0.3 — documentado como pendiente de política (quién puede editar el catálogo global) |
| POS / caja | Siguen sin montar (`app.ts`) — fuera de alcance P0.3 |

No se aplicaron cambios estructurales de permisos de plataforma/admin global.

---

## 8. Vulnerabilidades pendientes

1. **Refresh JWT** sigue fallando (P1-C / R4) — no tocado en P0.3.  
2. **Logout** server-side ausente.  
3. **ProductController** mutaciones globales sin modelo de autorización de plataforma.  
4. **POS/caja** no expuestos → E2E comercial incompleto.  
5. Host `backend/.env` remoto: riesgo operativo si se corre Prisma en host (Compose/local OK).

---

## 9. Preparación para refresh JWT y continuar P1

| Criterio | Estado |
|----------|--------|
| IDOR business-products HTTP | **Resuelto y verificado** |
| TSOA `request` alineado | **Sí** (regenerado + restart) |
| test:p0 | **11 passed** |
| TS backend / frontend | **OK** |
| migrate status (en contenedor) | **up to date** |
| Docker health | **healthy** |
| Refresh JWT | **Pendiente** (siguiente foco recomendado) |
| P2 | **No iniciado** — aún falta refresh + decisión catálogo global + POS |

**Veredicto P0.3:** la vulnerabilidad crítica de aislamiento en **business-products** queda **cerrada con pruebas HTTP reales en verde**.  
Siguiente paso natural de P1: reparar **refresh token**, luego re-correr batería P1-C ampliada.

---

## Apéndice — Validaciones ejecutadas

```text
npm run test:p0                          → 11 passed
npm run type-check (backend)             → OK
npx tsc --noEmit (frontend)              → 0 errors
docker exec … npx prisma migrate status  → up to date (db:5432/supertienda_dev)
GET /health                              → 200
curl isolation battery                   → 14/14 PASS (casos listados arriba)
```
