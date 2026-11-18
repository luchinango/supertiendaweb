# P1-G — Informe: autorización de plataforma

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Diseño detallado:** `docs/P1G_PLATFORM_AUTH_DESIGN.md`

---

## 1. Resumen ejecutivo

| Etapa | Resultado |
|-------|-----------|
| **A — Auditoría y diseño** | Completada |
| **B — Implementación** | **Bloqueada** — requiere aprobación |

No se modificó código de producción en P1-G.  
No se ejecutaron migraciones.  
No se abrieron mutaciones de catálogo maestro.  
P1-F y el aislamiento BusinessProduct permanecen vigentes.

---

## 2. Hallazgos de auditoría

1. `ADMIN` es **admin de empresa**, no de plataforma.
2. Login/JWT/middleware **exigen** `employee.businessId`.
3. `Permission`/`RolePermission` existen pero **no se aplican** en runtime.
4. TSOA usa `bearerAuth` casi siempre **sin scopes**.
5. No hay rutas `/platform/*`.
6. Schema **ya permite** `User` sin `Employee`; el bloqueo es de **lógica de auth**, no de Prisma.
7. Asociar plataforma a `businessId=1` está **descartado**.

---

## 3. Diseño acordado (dirección)

- Rol nuevo `PLATFORM_ADMIN` (sin employee / sin `businessId` en JWT).
- Roles tenant: `ADMIN` (alias BUSINESS_ADMIN), `EMPLOYEE` (alias BUSINESS_EMPLOYEE).
- Rutas exclusivas bajo `/platform/*` con scope `PLATFORM_ADMIN`.
- Guards en middleware **y** servicios.
- Plataforma **sin** acceso cross-tenant a stock/ventas/clientes por defecto.
- Mutaciones de catálogo maestro solo tras plataforma verificada (idealmente `/platform/...`, no reabrir `/products` a tenants).

Detalle completo: diseño §2–§8.

---

## 4. Por qué se bloquea la Etapa B

La implementación mínima viable exige **cambios incompatibles de autenticación**:

| Cambio | Impacto |
|--------|---------|
| Login sin empresa para `PLATFORM_ADMIN` | Nuevo camino en `AuthService` |
| `businessId` opcional en JWT | Contrato TokenPayload / FE / refresh |
| `expressAuthentication` y `requireAuthUser` | Distinguir tenant vs plataforma |
| Seed usuario plataforma sin employee | Datos locales Docker |

**No** se requiere `schema.prisma` ni `migrate`, pero la puerta del brief exige aprobación previa a esos cambios de auth.

Cualquier implementación parcial (helpers muertos o rutas 403 para todos) **no** cumpliría “autorización de plataforma verificada” y se omitió a propósito.

---

## 5. Cambios aplicados

Ninguno (código / schema / seed / TSOA).

## 6. Cambios bloqueados (pendientes de aprobación)

1. AuthService: rama `PLATFORM_ADMIN`.
2. Middleware/helpers plataforma.
3. Seed `PLATFORM_ADMIN` + usuario local.
4. `PlatformController` (`/platform/health` como mínimo).
5. (Opcional misma oleada) CRUD maestro solo plataforma.
6. Tests `test:p1g:http`.

---

## 7. Pruebas

| Suite | En esta fase |
|-------|----------------|
| Diseño de casos HTTP privilegios | Documentado en diseño §8 |
| Implementación `test:p1g:http` | No (Etapa B bloqueada) |
| Baseline local | `test:p0` y `test:p1f:http` re-ejecutados → **verdes** |
| `DATABASE_URL` contenedor | `…@db:5432/supertienda_dev` (local) |
| Health | healthy |

No se declaró cerrada la autorización de plataforma (no hay usuario ni rutas plataforma).

---

## 8. Riesgos residuales

1. Sin plataforma, el catálogo maestro sigue **solo lectura + 403 en mutación** (P1-F): CODEMEDIIA tampoco puede corregir maestros vía API hasta P1-G Etapa B.
2. Confusión semántica `ADMIN` vs plataforma si no se documenta en onboarding.
3. Frontend asume `businessId` siempre presente.
4. Permisos en BD siguen ornamentales hasta enforcement.

---

## 9. Decisiones pendientes (aprobador)

1. ¿Autorizar cambio de contrato JWT/login para `PLATFORM_ADMIN`?
2. ¿Seed `platform_admin` en Docker?
3. ¿MVP solo `/platform/health` + guards, o también CRUD catálogo maestro?
4. ¿Enforcement por scopes de rol ahora y `permissions` después?

---

## 10. Preparación hacia híbrido C

P1-G (tras aprobación) desbloquea **quién** puede escribir el maestro.  
El modelo híbrido C (productos privados + maestro) sigue en P2 con migración schema — **no iniciado**.

---

## Veredicto

**P1-G Etapa A entregada. Etapa B no implementada — se solicita aprobación explícita de los cambios de autenticación listados.**  
Detenerse aquí.
