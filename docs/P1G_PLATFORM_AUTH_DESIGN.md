# P1-G — Diseño de autorización de plataforma CODEMEDIIA

**Fecha:** 16 de noviembre de 2026  
**Estado:** Etapa A completa — **Etapa B bloqueada** a la espera de aprobación  
**Motivo del bloqueo:** cambios de contrato de autenticación (JWT / login sin empresa). **No** se requiere migración Prisma de schema, pero sí cambios incompatibles de auth + seed local.

---

## 1. Estado actual (auditoría)

### 1.1 Modelo Prisma relevante

| Entidad | Hallazgo |
|---------|----------|
| `User` | Tiene `roleId`. `employee` es **opcional** (`Employee?`). |
| `Employee` | Obliga `businessId` + `userId` único. Es el ancla multiempresa actual. |
| `Role` | `code` único (`ADMIN`, `EMPLOYEE` en seed). Extensible sin migración. |
| `Permission` / `RolePermission` | Existen; seed crea `products.read/write`, etc. **No se enforcean** en runtime. |
| `Business` | Tenant. No hay flag “plataforma”. |

**No hace falta alterar `schema.prisma` para introducir el rol `PLATFORM_ADMIN`.**  
Sí hace falta cambiar el **flujo de login/JWT**, hoy acoplado a empleado+empresa.

### 1.2 Autenticación actual

| Pieza | Comportamiento |
|-------|----------------|
| Login | Exige `employee.businessId` (`assertBusinessScopedUser`). |
| Access/refresh JWT | Claims: `userId`, `username`, `role`, `businessId` (**requerido**), `tokenType`. |
| `verifyToken` | Rehidrata `role` y `businessId` desde BD; rechaza sin empresa. |
| `expressAuthentication` | Rechaza si `businessId == null`. Scopes TSOA opcionales: si hay scopes, exige `decoded.role` ∈ scopes. |
| `requireAuthUser` / `resolveBusinessId` | Exigen `businessId` numérico; nunca fallback a `1`. |
| TSOA `@Security` | Casi todo usa solo `bearerAuth` **sin scopes**. Permisos de tabla ignorados. |

### 1.3 Roles seed actuales

| code | Significado real | ¿Plataforma? |
|------|------------------|--------------|
| `ADMIN` | Administrador **de empresa** | No |
| `EMPLOYEE` | Empleado de empresa | No |

**Hoy `ADMIN` ≠ plataforma.** Tras P1-F, tampoco puede mutar catálogo maestro.

### 1.4 Rutas “administrativas” actuales

No existe namespace `/platform/*`.

| Área | Rutas | Quién llega hoy |
|------|-------|-----------------|
| Catálogo maestro | `/products`, `/categories` mutaciones | Cualquier JWT → **403 P1-F** |
| Catálogo maestro | GET filtrado por BP | Tenant |
| Tenant comercial | `/business-products`, suppliers, purchase-orders | Tenant + aislamiento |
| Negocios | `BusinessController` | JWT (revisar tenancy en P1-G+ si hace falta) |
| Empleados | `/api/employees` legacy | `resolveBusinessId` |
| Auth | `/auth/login|refresh|verify|change-password` | Público / JWT |

Ninguna ruta está reservada a CODEMEDIIA.

---

## 2. Representar `PLATFORM_ADMIN` sin `businessId=1`

### Principio

Un usuario de plataforma:

1. Tiene `Role.code = 'PLATFORM_ADMIN'`.
2. **No** tiene fila `Employee` (o se ignora si existiera por error).
3. El JWT **no** lleva `businessId` de tenant (omitido o `null`).
4. Nunca se asocia a Empresa A/B ni a un “negocio fantasma”.

### Por qué no usar `businessId=1`

- Confunde plataforma con tenant.
- Rompe el invariante “todo `businessId` es empresa cliente”.
- Facilita fugas de datos si algún helper asume “admin global = biz 1”.

### Cambios de auth necesarios (requieren aprobación)

| Cambio | Detalle |
|--------|---------|
| Login | Si `role.code === 'PLATFORM_ADMIN'` y usuario ACTIVE → emitir tokens **sin** exigir employee. |
| `TokenPayload.businessId` | Pasar a `number \| null` (o ausente). |
| `verifyToken` | Rama plataforma: validar rol en BD; **no** exigir employee; forzar `businessId: null` en payload efectivo. |
| Refresh | Misma rama; no inventar empresa. |
| `expressAuthentication` | Si scope plataforma → exigir `PLATFORM_ADMIN` y permitir `businessId` null. Si ruta tenant → seguir exigiendo empresa y **rechazar** `PLATFORM_ADMIN` por defecto (salvo impersonación futura explícita). |
| `requireAuthUser` | Solo rutas tenant. Nuevo `requirePlatformUser`. |
| Seed local | Rol + usuario `platform_admin` **sin** employee (Docker only). |

**Migración Prisma:** no requerida para este diseño mínimo.  
**Seed / datos locales:** sí (rol + usuario), tras aprobación.

---

## 3. Matriz de permisos propuesta

Códigos de rol canónicos:

| Rol código | Alias documental | Ámbito |
|------------|------------------|--------|
| `PLATFORM_ADMIN` | Administrador CODEMEDIIA | Plataforma |
| `ADMIN` | BUSINESS_ADMIN (compat seed) | Una empresa |
| `EMPLOYEE` | BUSINESS_EMPLOYEE | Una empresa |

> Mantener `ADMIN`/`EMPLOYEE` en BD evita romper tokens/seed. Documentar alias BUSINESS_*.

### Matriz (MVP P1-G → P2)

| Capacidad | PLATFORM_ADMIN | ADMIN (empresa) | EMPLOYEE |
|-----------|----------------|-----------------|----------|
| Login / refresh propios | Sí | Sí | Sí |
| Mutar catálogo **maestro** (`/platform/...`) | Sí (tras abrir P1-G impl.) | No (403) | No |
| Adoptar / configurar `BusinessProduct` propio | No* | Sí | Según permiso granular |
| Ver stock/precios de **otras** empresas | No por defecto | No | No |
| Ver ventas/clientes de otras empresas | No por defecto | No | No |
| CRUD empleados de su empresa | No* | Sí | No |
| CRUD suppliers/OC de su empresa | No* | Sí | Lectura limitada |
| Gestión tenants (alta negocio, suspender) | Sí (futuro) | No | No |
| Impersonación / “actuar como empresa X” | Solo con feature flag + auditoría (futuro; **off** en MVP) | — | — |

\*Plataforma no opera datos comerciales de clientes en MVP salvo herramientas explícitas posteriores.

### Permisos granulares sugeridos (tabla `permissions`)

```text
platform.catalog.read
platform.catalog.write
platform.tenants.read
platform.tenants.write          # futuro
business.catalog.read           # productos visibles vía BP
business.product_link.write     # BusinessProduct
business.employees.write
business.suppliers.write
business.purchase_orders.write
```

MVP de enforcement: **scopes por rol** en TSOA + guards de servicio.  
Carga de `RolePermission` en JWT o lookup en verify: fase 2 (opcional).

---

## 4. Rutas exclusivas de plataforma (propuestas)

Prefijo: `/platform`

| Método | Ruta | Scope | Notas |
|--------|------|-------|-------|
| GET | `/platform/health` | `PLATFORM_ADMIN` | Smoke de auth plataforma |
| GET/POST/PUT/DELETE | `/platform/products`… | `PLATFORM_ADMIN` | Sustituye mutación global de `/products` |
| GET/POST/PUT/DELETE | `/platform/categories`… | `PLATFORM_ADMIN` | Idem categorías |
| GET | `/platform/businesses` | `PLATFORM_ADMIN` | Listado tenants (sin stock/ventas) |

**No abrir** en MVP:

- `/platform/sales`, `/platform/customers`, `/platform/inventory` cross-tenant.

Mientras P1-F siga activo, `/products` mutaciones permanecen 403 para **todos** (incl. plataforma) hasta que existan rutas `/platform/*` **y** tests verdes. Alternativa controlada: `rejectCatalogMasterMutation` permite solo si `requirePlatformUser` — **solo tras aprobación e implementación**.

---

## 5. Protección en servicios (no solo controladores)

| Capa | Mecanismo |
|------|-----------|
| TSOA | `@Security('bearerAuth', ['PLATFORM_ADMIN'])` |
| Middleware | Scopes ya parcialmente soportados; endurecer distinción tenant vs platform |
| Helpers | `requirePlatformUser(req)`, `assertNotPlatformOnTenantRoute(req)` |
| Servicios catálogo | `assertPlatformCatalogWrite(actor)` antes de create/update/delete maestro |
| Contención P1-F | Mantener rechazo por defecto; excepción **solo** vía helper plataforma verificado |

Evitar confiar en `body.role`, `query.businessId` o claims sin rehidratación BD.

---

## 6. Impacto en JWT, login y refresh

| Aspecto | Tenant | Plataforma |
|---------|--------|------------|
| Login | Sin cambio de contrato | Nuevo camino sin employee |
| Access claims | `role=ADMIN\|EMPLOYEE`, `businessId=N`, `tokenType=access` | `role=PLATFORM_ADMIN`, **sin** businessId, `tokenType=access` |
| Refresh | Rehidrata empresa desde employee | Revalida rol plataforma; no asigna empresa |
| Frontend | AuthContext asume `businessId` | Deberá tolerar `businessId` null + UI plataforma (fase posterior) |

**Riesgo de incompatibilidad:** clientes que asumen `businessId` siempre number. Requiere coordinación FE y tests P1-D ampliados.

---

## 7. Migraciones y compatibilidad

| Ítem | ¿Necesario? |
|------|-------------|
| Migración schema Prisma | **No** para MVP rol+auth |
| Seed rol `PLATFORM_ADMIN` + usuario sin employee | **Sí** (datos locales) |
| Renombrar rol `ADMIN` → `BUSINESS_ADMIN` | No recomendado ahora (rompe compat) |
| Columna `users.is_platform` | Opcional; redundante si el rol basta |
| Sesiones persistentes | No (P1-D); independiente |

Usuarios actuales (`admin_a`, `admin_b`, `employee_a`) **no** se convierten en plataforma.

---

## 8. Pruebas HTTP propuestas (post-aprobación)

1. `admin_a` → `GET/POST /platform/*` → **403**
2. `admin_b` → idem **403**
3. `employee_a` → idem **403**; no puede escalar cambiando body/role
4. Access token con claim `role` falsificado → verify usa BD → **401/403**
5. Login/refresh tenant siguen OK (regresión P1-D)
6. BP aislamiento sigue OK (P0 / P1-F)
7. Mutaciones `/products` siguen **403** para tenants (P1-F)
8. Con usuario plataforma (tras seed): `/platform/health` **200**; tenant routes **403** sin impersonación
9. Plataforma **no** lista stock de A/B por rutas tenant

Scripts sugeridos: `test:p1g:http` además de p0/p1d/p1f.

---

## 9. Plan de implementación condicionado (Etapa B)

### Puerta de aprobación

Etapa B **no** se ejecuta hasta aprobar explícitamente:

1. Login/JWT con `businessId` opcional para `PLATFORM_ADMIN`.
2. Seed de usuario plataforma en Docker local.
3. (Opcional en la misma oleada) apertura de mutaciones maestro **solo** vía `/platform/*`.

### Orden sugerido tras aprobación

1. Helpers `platformAuth.ts` + scopes.
2. AuthService ramas plataforma.
3. Seed rol+usuario.
4. `PlatformController` mínimo (`/platform/health`).
5. Tests HTTP privilegios.
6. Decidir apertura `platform.catalog.write` (puede ser P1-G.1).

### Fuera de alcance P1-G

- Catálogo híbrido C / migraciones Product.businessId.
- POS.
- Impersonación.
- Commit/push/deploy.

---

## 10. Decisiones pendientes para el aprobador

1. ¿Aprobar cambio de contrato JWT (`businessId` opcional)?
2. ¿Username seed plataforma (`platform_admin`)?
3. ¿En la misma fase abrir CRUD maestro en `/platform/products|categories` o solo health + guards?
4. ¿Frontend plataforma en P1-G o diferir?
5. ¿Enforcement vía scopes de rol o también tabla `permissions` desde el día 1?

---

**Fin Etapa A.** Esperar aprobación antes de cualquier implementación de Etapa B.
