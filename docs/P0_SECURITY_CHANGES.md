# P0 — Seguridad y aislamiento multiempresa

**Versión:** 1.0 — 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Estado:** Implementado en código local (sin commit/push)

---

## Hechos verificados (antes)

- Bypass de auth por query (`bypassAuth=1`), cookie (`bypass_auth`) y `NEXT_PUBLIC_BYPASS_AUTH`.
- Página `/debug-auth` y `GET /api/debug` exponían cookies.
- Tokens divididos: `auth_token` (middleware/axios) vs `token` (varias pantallas).
- `getBusinessId` aceptaba cualquier `businessId` de query y caía a `1`.
- `ProductController` y POS legacy hardcodeaban `businessId = 1`.
- `BusinessController` permitía leer/escribir otras empresas por path.
- Rewrite de Next caía a IP remota `206.183.128.36:5500`.

---

## Decisiones aplicadas

1. Sin bypass públicos de autenticación.
2. Debug solo en `NODE_ENV=development` (API) / bloqueado por middleware (página).
3. Sesión dual-compatible: lectura `auth_token` → fallback `token`; escritura en ambas.
4. `businessId` efectivo **siempre** desde JWT (refrescado desde BD en `verifyToken`).
5. Query/path `businessId` distinto al del token → `403 Forbidden`.
6. Sin fallback a `businessId=1`.
7. API URL: localhost en dev; obligatorio `NEXT_PUBLIC_API_URL` en production build.
8. Schema Prisma **no** modificado; sin migraciones ni datos tocados.

---

## Archivos modificados

### Backend

- `src/helpers/tenantContext.ts` (nuevo)
- `src/controllers/basePaginationController.ts`
- `src/controllers/ProductController.ts`
- `src/controllers/BusinessController.ts`
- `src/middlewares/authMiddleware.ts`
- `src/services/authService.ts`
- `src/services/businessService.ts`
- `src/services/supplierService.ts`
- `src/services/posService.ts`
- `src/controllers/posController.ts`
- `src/repositories/SupplierRepository.ts`
- `src/mappers/userMappers.ts`
- `src/errors/index.ts` (`ForbiddenError` + fix de prototipos)
- `src/routes/routes.ts` / `swagger.json` (regenerados TSOA)
- `tests/run-p0-tenant-tests.ts` (nuevo)
- `package.json` (`test:p0`)

### Frontend

- `middleware.ts`
- `lib/auth-utils.ts`
- `lib/api-client.ts`
- `contexts/AuthContext.tsx`
- `hooks/useAuth.ts`
- `app/(auth)/login/page.tsx`
- `app/debug-auth/page.tsx`
- `app/api/debug/route.ts`
- `next.config.js`
- `app/api/suppliers/route.ts`
- `components/features/cash-register/CashRegisterForm.tsx`
- `app/ordenes-compra/page.tsx`
- `app/proveedores/page.tsx`
- `components/ordenes-compra/NuevaOrdenCompra.tsx`
- `components/features/suppliers/EditSupplierDialog.tsx`

### Docs

- `docs/P0_SECURITY_CHANGES.md` (este archivo)

---

## Vulnerabilidades corregidas

| ID | Vulnerabilidad | Mitigación |
|----|----------------|------------|
| V1 | Bypass auth por query/cookie/env público | Eliminado |
| V2 | Debug de cookies en cualquier entorno | 404 / redirect fuera de development |
| V3 | Spoofing de `businessId` por query | `resolveBusinessId` exige match con JWT |
| V4 | Fallback silencioso a empresa `1` | Eliminado; error 401 si falta contexto |
| V5 | Productos siempre en empresa 1 | `ProductController` usa JWT |
| V6 | Lectura/escritura cross-tenant en `/businesses/:id` | Path id debe coincidir con JWT; listado filtrado |
| V7 | Proxy a servidor remoto por defecto | Solo `127.0.0.1:5000` en dev; obligatorio en prod |
| V8 | Sesión inconsistente token/auth_token | Dual-read/write + migración silenciosa |
| V9 | `userId=1` al abrir caja | Usa `user.id` de sesión |
| V10 | `instanceof` de errores roto | Prototipos corregidos en `CustomError` |

---

## Pruebas ejecutadas y resultados

Comando:

```bash
cd backend
npx ts-node --transpile-only tests/run-p0-tenant-tests.ts
# o: npm run test:p0
```

**Resultado:** `7 passed, 0 failed`

Casos:

1. Rechazo sin usuario  
2. Rechazo sin `businessId`  
3. Normalización de usuario  
4. Resolución desde JWT  
5. Query coincidente aceptada  
6. Query de otra empresa → Forbidden  
7. Sin fallback a `1`

Pruebas E2E manuales pendientes (requieren backend + DB + usuario real): login, acceso a `/suppliers` propio, intento `?businessId=` ajeno → 403.

---

## Problemas pendientes

1. **Enforcement fino de permisos** (`Permission` / `RolePermission` en DB) aún no aplicado en runtime TSOA.
2. **JWT 30d** sigue largo; refresh client interceptor incompleto.
3. **`POST /businesses`** sigue permitiendo crear negocios a cualquier autenticado (sin rol de plataforma).
4. **Productos globales** (`Product` sin `businessId`): el aislamiento fuerte es vía `BusinessProduct`; revisión de fugas por ID de producto global queda para P1/P2.
5. Controllers huérfanos no TSOA (sales/customers/inventory) aún no expuestos; hardcodes residuales fuera del path vivo se corrigieron en POS legacy pero no están en rutas activas.
6. Middleware Next solo verifica **presencia** de cookie, no validez JWT (la API sí valida).
7. No se ejecutaron pruebas de integración HTTP contra DB en esta sesión.

---

## Recomendaciones para iniciar P1

1. Backup de PostgreSQL antes de cualquier migrate.
2. Adoptar Prisma Migrate (baseline) sin cambiar datos de negocio a mano.
3. Restaurar relaciones de `InventoryTransaction`.
4. Seed mínimo reproducible (roles, business, admin con `businessId`).
5. Tras P1, en P2: TSOA para customers/caja/POS/sales con el mismo `resolveBusinessId`.
6. No abrir P1 hasta aprobación explícita de CODEMEDIIA.

---

## Restricciones respetadas

- Sin cambios de schema Prisma  
- Sin migraciones ejecutadas  
- Sin modificación de datos  
- Sin POS/QR/FactuBo de producto  
- Sin producción / deploy / commit / push  
