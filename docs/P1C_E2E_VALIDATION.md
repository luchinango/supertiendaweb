# P1-C — Validación E2E local (HTTP)

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Alcance:** validación contra PostgreSQL Docker local únicamente  
**Restricciones:** sin migraciones, sin remoto, sin commit/push/deploy, sin P2

---

## 1. Servicios y versiones

| Componente | Valor |
|------------|--------|
| Docker Engine | 28.5.1 |
| Compose | v2.40.x (Desktop) |
| Contenedores | `supertienda-frontend`, `supertienda-backend` (healthy), `supertienda-db` (healthy) |
| Frontend URL | `http://127.0.0.1:3000` |
| Backend URL | `http://127.0.0.1:5000` |
| Node (FE/BE containers) | v20.20.2 |
| PostgreSQL | `postgres:16-alpine` — `db:5432` / `supertienda_dev` |
| Migración | `20261116153000_init_local` — **up to date** (verificado **dentro** del contenedor) |
| `DATABASE_URL` (backend container) | `…@db:5432/supertienda_dev` (**local**) |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:5000` (**local**) |
| `INTERNAL_API_URL` | `http://backend:5000` (**local**) |

**Nota crítica:** `npx prisma migrate status` ejecutado en el **host** usa `backend/.env` y apunta a host remoto `206.183…` (falla P1001). El stack Compose **sí** está aislado. No se abrió ni mutó la DB remota.

Git: rama `master` con cambios locales no commiteados (esperado).

---

## 2. Usuarios demo (sin credenciales)

| Usuario | Rol | Empresa | businessId |
|---------|-----|---------|------------|
| `admin_a` | ADMIN | Empresa A Dev | 1 |
| `admin_b` | ADMIN | Empresa B Dev | 2 |
| `employee_a` | EMPLOYEE | Empresa A Dev | 1 |

**Origen de contraseñas:** `backend/prisma/seed.ts` usa `process.env.SEED_DEV_PASSWORD` o un default de desarrollo documentado en el seed (`passwordEnv: SEED_DEV_PASSWORD`). No hay `SEED_DEV_PASSWORD` en `.env.docker`; se usó el default del seed. **Valor no reproducido en este informe.**

Datos demo de inventario (tras limpieza de residuos de prueba):

| business_id | product | stock | custom_price |
|-------------|---------|-------|--------------|
| 1 | Arroz compartido | 100 | 8.50 |
| 1 | Aceite Empresa A | 25 | 15.00 |
| 2 | Arroz compartido | 40 | 9.00 |
| 2 | Azúcar Empresa B | 60 | 7.00 |

---

## 3. Endpoints probados

### Auth (montados vía TSOA)
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/verify`
- `POST /auth/logout` → **no existe**

### Negocio / inventario (TSOA)
- `GET /business-products`
- `GET /business-products?businessId=`
- `GET /business-products/business/{businessId}`
- `GET /business-products/catalog/{businessId}`
- `GET /business-products/{id}`
- `POST /business-products`
- `PUT /business-products/business/{businessId}/product/{productId}`
- `GET /products`, `GET /products/{id}`, `POST /products`
- `GET /suppliers`, `GET /suppliers?businessId=`
- `GET /purchase-orders`, `GET /purchase-orders/business/{businessId}`

### Empleados
- `GET /api/employees` (router legacy montado)

### POS / caja (inspección)
- `GET/POST /api/pos/*`, `/pos/*`, `/api/cash-registers`, `/api/sales`, `/sales` → **no montados** (`posRoutes` / `cashRegisterRoutes` comentados en `app.ts`)

---

## 4. Tabla de pruebas PASS / FAIL / BLOCKED

### Autenticación

| ID | Prueba | Resultado | HTTP |
|----|--------|-----------|------|
| A-admin_a | Login admin_a | **PASS** | 200 |
| A-admin_b | Login admin_b | **PASS** | 200 |
| A-employee_a | Login employee_a | **PASS** | 200 |
| A-badpass | Password incorrecta | **PASS** | 401 |
| A-nouser | Usuario inexistente | **PASS** | 401 |
| A-notoken | Recurso protegido sin token | **PASS** | 401 |
| A-badtoken | Token inválido | **PASS** | 401 |
| A-verify | Verify con token válido | **PASS** | 200 |
| A-refresh | Refresh token | **FAIL** | 401 (`Token de actualización inválido`) |
| A-logout | Logout | **BLOCKED** | 404 (ruta inexistente) |

### Aislamiento multiempresa

| ID | Prueba | Resultado | HTTP | Notas |
|----|--------|-----------|------|-------|
| T-lista-A | Listado BP empresa A | **PASS** | 200 | solo `businessId=1` |
| T-lista-B | Listado BP empresa B | **PASS** | 200 | solo `businessId=2` |
| T-query-cross | `?businessId=2` con token A | **FAIL** | 200 | **filtró y devolvió datos de B** |
| T-path-catalog | `/catalog/2` con token A | **PASS** | 403 | |
| T-path-biz | `/business/2` con token A | **FAIL** | 200 | devolvió productos de B |
| T-get-by-id-cross | `GET /business-products/4` (B) con token A | **FAIL** | 200 | ID sin chequeo de empresa |
| T-sup-A | Listado suppliers A | **PASS** | 200 | |
| T-sup-cross | suppliers `businessId` ajeno | **PASS** | 403 | |
| T-po-A | Listado purchase-orders A | **PASS** | 200 | |
| T-po-path | PO `/business/2` con token A | **PASS** | 403 | |
| T-emp | Listado employees | **PASS** | 200 | |
| T-create-cross | `POST` BP con `businessId=2` token A | **FAIL** | 201 | **creó registro en empresa B** |
| T-put-cross | `PUT .../business/2/product/3` token A | **FAIL** | 200 | **modificó precio de B** |

### Productos / inventario

| ID | Prueba | Resultado | HTTP |
|----|--------|-----------|------|
| P-list | Listado products | **PASS** | 200 |
| P-get | Get product 1 | **PASS** | 200 |
| P-create | Create product temporal | **BLOCKED** | 500 |
| P-price-iso | Precio/stock distintos por empresa (producto compartido) | **PASS** | 200 |

Residuos de escritura de prueba (BP cruzado id=5 y precio alterado) fueron **revertidos** a estado demo. No quedaron registros E2E temporales.

### POS / caja

| ID | Prueba | Resultado | HTTP |
|----|--------|-----------|------|
| POS-* | Rutas pos/caja/sales | **BLOCKED** | 404 | No montadas en `app.ts` |

### Frontend

| ID | Prueba | Resultado | HTTP |
|----|--------|-----------|------|
| F-login | `GET /login` | **PASS** | 200 |
| F-remote | Sin IP remota en HTML login | **PASS** | 200 |

**UI visual / redirección post-login / sesión en navegador:** no automatizada en esta corrida. Validación frontend = HTTP estático + env de contenedor. **Interfaz visual no validada de punta a punta.**

### Suite / calidad

| Prueba | Resultado |
|--------|-----------|
| `npm run test:p0` | **11 passed** |
| Backend `type-check` | **OK** |
| Frontend `tsc --noEmit` | **OK** |
| `prisma migrate status` (en contenedor) | **Database schema is up to date** |
| Health backend | **200** `healthy` |

**Resumen corrida HTTP:** PASS=21 · FAIL=6 · BLOCKED=9

---

## 5. Evidencia de login exitoso

- `POST /auth/login` con `admin_a` / `admin_b` / `employee_a` → **200**, cuerpo `success` con `token`, `refreshToken`, `user.employee.businessId` coherente (1 / 2 / 1).
- JWT de `admin_a` decodificado (solo claims): `userId=1`, `role=ADMIN`, `businessId=1`.
- Password incorrecta y usuario inexistente → **401** (no se confunde con éxito).

---

## 6. Evidencia de aislamiento multiempresa

### Lo que funciona
- Listados default de `business-products` **no mezclan** empresas.
- `purchase-orders` y `suppliers` rechazan `businessId`/path ajenos con **403** (patrón P0).
- Catálogo `/business-products/catalog/{id}` ajeno → **403**.

### Lo que falla (crítico)
Con token de Empresa A (`businessId=1`):

1. `GET /business-products?businessId=2` → **200** con filas de Empresa B.  
2. `GET /business-products/business/2` → **200** con filas de Empresa B.  
3. `GET /business-products/4` → **200** (recurso de B por ID global).  
4. `POST /business-products` body `{ businessId: 2, ... }` → **201** crea en B.  
5. `PUT /business-products/business/2/product/3` → **200** escribe en B.

**Hallazgo técnico (para corrección futura, no aplicada aquí):**
- Varias rutas en `backend/src/routes/routes.ts` (generado TSOA) **no inyectan** el parámetro `request` aunque el controller declare `@Request()` (p. ej. `getProductsByBusiness`, `updateBusinessProductByBusinessAndProduct`).
- `createBusinessProduct` / `getBusinessProductById` / update-delete por `{id}` **no llaman** `getBusinessId`.
- Unit tests P0 pasan porque prueban el helper, no estos endpoints HTTP.

---

## 7. Estado de productos e inventario

- Catálogo global: 3 products; stock/precio por empresa vía `business_products` (4 filas demo).
- Aislamiento de **lectura default** OK; aislamiento de **lectura/escritura dirigida** en BusinessProduct **roto**.
- Create de product global devolvió 500 (bloqueado); no se profundizó (fuera de smoke).
- Consistencia Prisma demo: producto compartido (id=1) con precios/stocks distintos por empresa — verificado por API.

---

## 8. Estado de ventas y caja

**BLOCKED.** Controllers/services POS existen en código, pero:

```text
// app.ts
// app.use('/api/pos', posRoutes);
// app.use('/api', cashRegisterRoutes);
```

No hay superficie HTTP activa para apertura de caja, venta o cierre en el proceso en ejecución. No se ejecutaron ventas ni se modificó inventario por POS.

---

## 9. Estado del frontend

- Login page sirve en `127.0.0.1:3000/login` (200).
- Contenedor FE apunta solo a API local.
- HTML de login sin host remoto `206.183…`.
- No se validó flujo visual login→dashboard ni cookies de sesión en navegador.

---

## 10. Vulnerabilidades encontradas

| Pri | ID | Severidad | Descripción |
|-----|----|-----------|-------------|
| 1 | V1 | **Crítica** | IDOR / broken tenancy en `business-products` (query, path, GET by id, POST create, PUT path) permite leer y escribir datos de otra empresa con token válido. |
| 2 | V2 | Alta | `routes.ts` TSOA desfasado: métodos con `@Request()` sin `request` en args generados → controles de tenancy no efectivos en runtime. |
| 3 | V3 | Alta | Refresh token: `POST /auth/refresh` responde 401 “Token de actualización inválido” tras login exitoso (alineado con riesgo R4 previo). |
| 4 | V4 | Media | No hay `POST /auth/logout` server-side; sesión solo invalidable client-side. |
| 5 | V5 | Media | POS/caja no expuestos; flujo comercial E2E incompleto. |
| 6 | V6 | Baja/Ops | `backend/.env` del host sigue apuntando a DB remota; riesgo de que un comando Prisma en host toque remoto. Compose está bien. |

---

## 11. Correcciones recomendadas (prioridad)

1. **P0 — Cerrar tenancy BusinessProduct (HTTP real)**  
   - Forzar `businessId` solo desde JWT en create/update/delete/getById.  
   - Regenerar TSOA (`routes.ts`) y reiniciar backend.  
   - Añadir tests HTTP (no solo unit) que fallen si A lee/escribe B.

2. **P0 — Auditoría rápida** de otros controllers con path/query `businessId` + `@Request` ausente en `routes.ts`.

3. **P1 — Reparar refresh token** (`refreshAccessToken` / payload employee.businessId).

4. **P1 — Montar o documentar POS/caja** antes de E2E comercial; no afirmar POS operativo.

5. **P1 — Logout** (deny-list / rotación refresh) si se requiere cierre de sesión real.

6. **Ops —** Aislar Prisma CLI del host (`.env` local vs remoto) o usar siempre `docker exec` para migrate/status.

---

## 12. Evaluación de preparación para P2

| Criterio | Estado |
|----------|--------|
| Docker local saludable | Sí |
| Auth login básico | Sí |
| Migración local aplicada + seed | Sí |
| Aislamiento multiempresa E2E | **No** (fallos críticos en business-products) |
| POS/caja E2E | **No** (no montado) |
| Refresh/logout | Débil / ausente |
| test:p0 unitario | Verde (insuficiente frente a HTTP) |

**Veredicto:** **NO listo para P2.**  
P1-C demuestra que el entorno local sirve para pruebas reales y que el login funciona, pero el **aislamiento multiempresa en productos de negocio está roto en HTTP** y el **POS no está expuesto**. Corregir V1/V2 y re-correr esta batería antes de P2.

---

## Apéndice — Comandos usados (sin secretos)

```bash
docker compose --env-file .env.docker ps
curl http://127.0.0.1:5000/health
docker exec -i supertienda-backend sh -c 'cd /app && npx prisma migrate status'
# Login / isolation vía POST /auth/login y GET/PUT /business-products* con Bearer
cd backend && npm run test:p0 && npm run type-check
cd frontend && npx tsc --noEmit
```
