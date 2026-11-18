# P1-D — Seguridad de sesiones JWT

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Precondición:** P0.3 cerrado (aislamiento BusinessProduct HTTP en verde)  
**Restricciones:** solo Docker local; sin migraciones; sin commit/push/deploy; sin POS; sin P2

---

## 1. Causa raíz del refresh 401

Tras un login válido, `POST /auth/refresh` devolvía **401** `Token de actualización inválido` por **dos defectos combinados**:

| # | Defecto | Efecto |
|---|---------|--------|
| 1 | `refreshAccessToken` cargaba el usuario **sin** `employee.businessId` y llamaba a `generateToken(user)` | `user.employee` era `undefined` → excepción al firmar → capturada y convertida en 401 genérico |
| 2 | Access y refresh eran **JWT idénticos** (mismo payload, misma expiración `30d`, sin `tokenType`) | No había forma de distinguir roles de token; access podía usarse como refresh y viceversa |

Evidencia previa al fix (login `admin_a`):

- `access_len === refresh_len` y `same=True`
- Payload sin `tokenType`: `{ userId, username, role, businessId, iat, exp }`
- Refresh → HTTP **401**

No había tablas de sesión ni refresh persistidos en Prisma; el diseño era JWT RS256 stateless.

---

## 2. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/services/authService.ts` | Claim `tokenType`; expiraciones access/refresh; `verifyToken(token, expectedType)`; refresh carga empresa desde BD; rotación de refresh; menos ruido en logs (sin tokens) |
| `backend/src/types/authTypes.ts` | `JwtTokenType` + `tokenType` en `TokenPayload` |
| `backend/src/controllers/AuthController.ts` | Refresh documentado; respuesta tipada `{ token, refreshToken }` |
| `backend/src/routes/routes.ts` / `swagger.json` | Regenerados con TSOA |
| `frontend/services/authService.ts` | Logout aclara que es solo local |
| `backend/tests/run-p1d-auth-session-tests.ts` | **Nuevo** — contrato JWT (6 casos) |
| `backend/tests/run-p1d-auth-http.ts` | **Nuevo** — batería HTTP (12 casos) |
| `backend/package.json` | Scripts `test:p1d` y `test:p1d:http` |

**No se crearon migraciones ni tablas de sesión.**

---

## 3. Estrategia JWT utilizada

| Aspecto | Valor |
|---------|--------|
| Algoritmo | RS256 (par en volumen Docker `backend_keys`) |
| Access | `tokenType: "access"`, expira `JWT_ACCESS_EXPIRES_IN` \|\| `JWT_EXPIRES_IN` \|\| **`1h`** |
| Refresh | `tokenType: "refresh"`, expira `JWT_REFRESH_EXPIRES_IN` \|\| **`7d`** |
| Claims | `userId`, `username`, `role`, `businessId`, `tokenType` |
| Autoridad de empresa | En verify/refresh, **`businessId` se rehidrata desde BD** (employee actual); no se confía en claims manipulados |
| Middleware / TSOA | Solo acepta **access** (`verifyToken` default) |
| Refresh endpoint | Solo acepta **refresh**; emite access nuevo + **rota** refresh |
| Persistencia | **Ninguna** (stateless). Rotación soft: el refresh anterior sigue siendo válido hasta su `exp` |
| Revocación | **No disponible** sin store de sesiones |

---

## 4. Resultado de pruebas HTTP

Comando: `npm run test:p1d:http` (base `http://127.0.0.1:5000`).

| # | Caso | Resultado |
|---|------|-----------|
| 1 | Login válido | **PASS** 200; access ≠ refresh; `tokenType` correcto |
| 2 | Refresh válido | **PASS** 200; nuevo access + refresh |
| 3 | Refresh inválido | **PASS** 401 |
| 4 | Refresh expirado (firma real contenedor) | **PASS** 401 (`Token expirado`) |
| 5 | Access como refresh | **PASS** 401 |
| 6 | Refresh como access | **PASS** 401 |
| 7 | Empresa A conserva `businessId=1` | **PASS** |
| 8 | Empresa B conserva `businessId=2` | **PASS** |
| 9 | Refresh/access no habilita BP cruzado | **PASS** 403 |
| 10 | Logout server-side | **PASS** — `/auth/logout` **404**; token sigue válido |
| 11 | Sin token | **PASS** 401 |
| 12 | Regresión BusinessProduct tenancy | **PASS** |

Unitarias de contrato: `npm run test:p1d` → **6 passed**.

---

## 5. Comportamiento real de logout

| Capa | Comportamiento |
|------|----------------|
| Frontend `AuthContext.logout` | Llama `authService.logout()` y luego `removeAuthToken()` (borra `auth_token`, `token`, `refresh_token`, `businessId`, cookie) |
| Frontend `authService.logout` | **No** llama al backend; mensaje: sesión cerrada localmente |
| Backend | **No existe** `POST /auth/logout` |
| Efecto de seguridad | El access/refresh emitidos **siguen válidos** hasta expirar; solo se pierde el almacenamiento del cliente |

**Decisión P1-D:** no se añadió un endpoint de logout que prometa revocación, porque no hay infraestructura de denylist/sesiones.

### Propuesta de logout seguro (para fase posterior; requiere autorización + migración)

1. Tabla `auth_sessions` / `refresh_tokens` (`id`, `userId`, `tokenHash`, `expiresAt`, `revokedAt`, `businessId`).
2. Login/refresh registran hash del refresh; refresh valida hash activo.
3. `POST /auth/logout` (bearer) marca sesión revocada; opcional logout-all.
4. Access corto + refresh rotado con invalidación del refresh previo (rotación hard).
5. Tests HTTP: logout → refresh 401; access aún válido hasta exp (o access jti denylist si se exige corte inmediato).

---

## 6. Vulnerabilidades pendientes

1. **Sin revocación server-side** — robo de refresh válido hasta `exp` (7d).
2. **Rotación soft** — refresh anterior no se invalida al rotar.
3. **Frontend no consume `/auth/refresh`** automáticamente ante 401 (api-client sin interceptor de renovación).
4. Tokens en `localStorage` + cookie `auth_token` (XSS risk clásico; fuera de alcance P1-D).
5. Catálogo global `ProductController` sin modelo de admin de plataforma (P0.3).
6. POS/caja no montados.

---

## 7. Recomendación sobre persistencia de sesiones

Para producción multiempresa se recomienda **persistir refresh (hash) + revocación**, no solo JWT opacos:

- Cortar sesiones al cambiar password / desactivar usuario / logout.
- Rotación hard anti-replay.
- Auditoría por empresa (`businessId` en sesión).

**P1-D no implementó esto** para evitar migraciones no autorizadas. El arreglo actual es el mínimo compatible: refresh funcional + separación access/refresh + businessId desde BD.

---

## 8. Estado de preparación para P1-E

| Criterio | Estado |
|----------|--------|
| Login | OK |
| Refresh HTTP | **OK (antes 401)** |
| Access ≠ refresh | OK |
| Tenancy BP tras refresh | OK (regresión verde) |
| Logout server-side | **No** — documentado |
| test:p0 | 11 passed |
| test:p1d / test:p1d:http | 6 / 12 passed |
| TS FE/BE | OK |
| Docker health | healthy |
| migrate status (contenedor) | up to date |
| Persistencia sesiones | Pendiente (propuesta §7) |

**Veredicto P1-D:** ciclo login → refresh → access usable queda **corregido y verificado con HTTP real**.  
Listo para **P1-E** en el sentido de auth usable; logout seguro y store de sesiones quedan como mejora explícita con migración.

**P2 / POS / catálogo global:** no iniciados.

---

## Apéndice — Validaciones

```text
npm run test:p0            → 11 passed
npm run test:p1d           → 6 passed
npm run test:p1d:http      → 12 passed
npm run type-check (BE)    → OK
npx tsc --noEmit (FE)      → 0 errors
prisma migrate status      → up to date (db:5432 / supertienda_dev via container)
GET /health                → 200
npx tsoa spec && tsoa routes → OK (contenedor)
```
