# P1-G Etapa B — Implementación de autorización de plataforma

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Alcance aprobado:** rol `PLATFORM_ADMIN`, JWT sin empresa, seed local, `GET /platform/health`, pruebas HTTP  
**Fuera de alcance:** CRUD maestro, migraciones Prisma, POS, catálogo híbrido C

---

## 1. Archivos modificados / nuevos

| Archivo | Cambio |
|---------|--------|
| `backend/src/helpers/platformAuth.ts` | **Nuevo** — `PLATFORM_ADMIN_ROLE`, `requirePlatformUser`, `rejectPlatformOnTenantRoute` |
| `backend/src/helpers/tenantContext.ts` | Rechaza plataforma en rutas tenant |
| `backend/src/types/authTypes.ts` | `businessId: number \| null` |
| `backend/src/services/authService.ts` | Login/refresh/verify con rama plataforma (rol desde BD) |
| `backend/src/middlewares/authMiddleware.ts` | Scopes plataforma vs tenant; `ForbiddenError` 403 |
| `backend/src/controllers/PlatformController.ts` | **Nuevo** — `GET /platform/health` |
| `backend/src/routes/routes.ts` / `swagger.json` | Regenerados (scope `PLATFORM_ADMIN`) |
| `backend/prisma/seed.ts` | Rol + usuario `platform_admin` sin Employee |
| `backend/tests/run-p0-tenant-tests.ts` | 3 asserts plataforma |
| `backend/tests/run-p1g-platform-http.ts` | **Nuevo** |
| `backend/package.json` | `test:p1g:http` |
| `frontend/contexts/AuthContext.tsx` | Permite login `PLATFORM_ADMIN` sin `businessId` |

---

## 2. Cambios en autenticación

| Aspecto | Comportamiento |
|---------|----------------|
| Login tenant | Sin cambio: exige `Employee.businessId` |
| Login plataforma | `role.code === PLATFORM_ADMIN` y **sin** employee → JWT con `businessId: null` |
| Refresh | Misma rehidratación desde BD |
| `tokenType` | access / refresh intactos |
| Claims cliente | **Ignorados** para rol/empresa; BD manda |
| Tenant en `/platform/*` | **403** |
| Plataforma en rutas tenant | **403** |
| Fallback `businessId=1` | No existe |

---

## 3. Modelo de permisos implementado

| Rol | Empresa | `/platform/health` | Rutas tenant | Mutación `/products` |
|-----|---------|--------------------|--------------|----------------------|
| `PLATFORM_ADMIN` | ninguna | 200 | 403 | 403 (P1-F) |
| `ADMIN` | sí | 403 | según reglas | 403 (P1-F) |
| `EMPLOYEE` | sí | 403 | según reglas | 403 (P1-F) |

- TSOA: `@Security('bearerAuth', ['PLATFORM_ADMIN'])` en health.
- Servicio/helper: `requirePlatformUser` además del middleware.
- Contención P1-F **intacta**; no hay CRUD maestro.

---

## 4. Seed local

- Rol `PLATFORM_ADMIN`.
- Usuario configurable: `SEED_PLATFORM_USERNAME` (default `platform_admin`).
- Password: `SEED_DEV_PASSWORD` (mismo pool de desarrollo; **no** se imprime).
- Sin `Employee`.
- Guardas anti-remoto del seed existentes (`SEED_CONFIRM_LOCAL`, host local).
- Usuarios A/B/`employee_a` no alterados en identidad.

Ejecutado en contenedor: `SEED_CONFIRM_LOCAL=1` → OK.

---

## 5. Evidencia HTTP (`npm run test:p1g:http`)

| Caso | Resultado |
|------|-----------|
| Login `platform_admin` | PASS |
| Refresh plataforma | PASS |
| Sin `businessId` en JWT | PASS |
| `GET /platform/health` → 200 | PASS |
| Plataforma → tenant BP/products → 403 | PASS |
| A / B / employee → platform health → 403 | PASS |
| Claims manipulados / sin token / token basura | PASS (401/403) |
| Login/refresh empresa | PASS |
| Aislamiento BusinessProduct | PASS |
| Mutaciones globales bloqueadas (+ plataforma en `/products`) | PASS |

---

## 6. Regresiones

| Suite | Resultado |
|-------|-----------|
| `test:p0` | **14** passed |
| `test:p1d` | 6 passed |
| `test:p1d:http` | 12 passed |
| `test:p1f:http` | 15 passed |
| `test:p1g:http` | 10 passed (casos 6–8 agrupados) |
| TS backend / frontend | OK |
| Docker health | healthy |
| TSOA | `GET /platform/health` + scope `PLATFORM_ADMIN` |

---

## 7. Compatibilidad frontend

- `AuthContext` acepta `PLATFORM_ADMIN` sin empresa.
- Tenants siguen exigiendo `businessId`.
- No hay UI de consola plataforma todavía (solo auth compatible).
- `/auth/verify` para plataforma devuelve user sin employee.

---

## 8. Riesgos pendientes

1. Sin sesión server-side / logout revocable (P1-D).
2. Tabla `permissions` aún ornamental salvo seed.
3. Sin CRUD maestro: CODEMEDIIA no edita catálogo vía API hasta P1-H.
4. UI no distingue aún consola plataforma vs tenant.
5. Usuario plataforma comparte password env de demo (aceptable solo Docker).

---

## 9. Preparación para P1-H y catálogo híbrido

**P1-H (sugerido):** abrir mutaciones maestro **solo** en `/platform/products|categories` con `requirePlatformUser` + tests; mantener P1-F en `/products` para tenants.

**Híbrido C (P2):** migraciones `Product.businessId` / visibility; altas privadas tenant; adopción desde maestro.

---

## Veredicto

**Etapa B cerrada:** plataforma autenticable, aislada de tenants, health verificado, regresiones verdes.  
CRUD maestro y migraciones **no** implementados. Detenerse.
