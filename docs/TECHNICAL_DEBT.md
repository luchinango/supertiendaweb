# TECHNICAL_DEBT — Deuda técnica y riesgos

**Versión:** 1.1 — 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Alineación:** P0–P3 de [`PHASE_1_IMPLEMENTATION_PLAN.md`](./PHASE_1_IMPLEMENTATION_PLAN.md)

---

## Hechos verificados

### P0 — Seguridad y aislamiento (alto impacto)

| Ítem | Evidencia |
|------|-----------|
| Bypass de autenticación en middleware | `frontend/middleware.ts`: `NEXT_PUBLIC_BYPASS_AUTH`, query/cookie bypass |
| Página y API de debug | `frontend/app/debug-auth/page.tsx`, `frontend/app/api/debug/route.ts` |
| Tokens inconsistentes | `auth_token` (axios/middleware) vs `token` (varios módulos/login) |
| `businessId` hardcodeado a `1` | Controllers/services POS/productos y defaults Prisma |
| `userId` hardcodeado al abrir caja | Formularios frontend de cash register |
| JWT longevo | `expiresIn: '30d'` en auth service; comentarios desalineados |
| Refresh token sin flujo cliente completo | Endpoint existe; sin interceptor de refresh robusto |
| Middleware solo verifica presencia de cookie | No valida JWT en el edge de Next |
| Fallback API a IP remota | `frontend/next.config.js` default `http://206.183.128.36:5500` |
| Permisos DB sin enforcement | Modelos Role/Permission sin chequeo runtime en TSOA |

### P1 — Drift API / funcional

| Ítem | Evidencia |
|------|-----------|
| Controllers huérfanos | POS, sales, cart, customers, inventory, employees, caja, audits no en `routes.ts` |
| Mounts legacy comentados | `backend/src/app.ts` |
| Checkout stub | `PaymentPanel.completeTransaction` |
| Carrito solo memoria | `CartContext` |
| Stubs Next | `app/api/cash-registers/open`, `app/api/reports` |
| FE llama endpoints no registrados | p.ej. `/customers`, `/employees`, `/cash-registers` |
| Registro de usuario stub | Frontend authService “no implementado” |
| DI incompleto | `DIContainer` no alinea todos los services/repos |
| Mezcla repository vs Prisma directo | Inconsistencia de capas |

### P2 — Datos y calidad

| Ítem | Evidencia |
|------|-----------|
| Sin migraciones versionadas | Solo `db push` |
| Seed roto/ausente | `prisma/seed.ts` missing; `seeders/` vacío/gitignored |
| Relations comentadas | `InventoryTransaction` |
| Mocks en UI | movimientos, partes de productos/clientes/proveedores/config |
| README desactualizado | `frontend/README.md` describe layout distinto |
| `.gitignore` ignoraba `*.md` | Documentación no versionable (mitigado para `docs/`) |

### P3 — Tooling y operación

| Ítem | Evidencia |
|------|-----------|
| Sin CI | No hay workflows GitHub |
| Sin Docker | No compose/Dockerfile |
| Scripts gitignored | `backend/scripts`, `build:prod` referenciado |
| Jest declarado sin config visible | `package.json` test script |
| Webpack backend paralelo no usado en scripts principales | `webpack.config.js` |
| Claves RSA en `backend/keys` gitignored | Generación local; cuidado en multi-instancia |
| CORS env naming inconsistente | `cors_origin` vs `CORS_ORIGIN` |

### Riesgos de producto derivados

1. **Demo engañosa:** UI sugiere POS completo sin backend conectado.
2. **Fuga multi-tenant:** datos de varias empresas mezclables por hardcode `businessId=1`.
3. **Offline futuro caro:** sin idempotencia ni versiones, la Fase 3 será más dolorosa.
4. **Integraciones frágiles:** sin estados separados venta/pago/factura en la práctica de UI.

---

## Decisiones aprobadas

Aislamiento por empresa, concurrencia, idempotencia, auditoría, sesiones seguras, versionado, conflictos, backups. No adoptar stack nuevo sin análisis. **No** meter SDKs de proveedores de pago (Red Enlace) ni FactuBo/Alicia dentro de este repo.

Orden de pago de deuda alineado al plan consolidado:

1. **P0** seguridad/tenancy  
2. **P1** Prisma Migrate + integridad DB  
3. **P2** cableado TSOA dominios existentes  
4. **P3** frontend POS real  
5. Tooling CI/Docker tras POS E2E o al crecer el equipo  

---

## Recomendaciones técnicas

### Reglas para no aumentar deuda

- No pantallas mock nuevas sin etiqueta.
- Solo controllers TSOA (no legacy Express nuevos).
- No offline sin `clientOperationId`.
- No SDK Red Enlace en SuperTienda; solo refs/contratos hacia CODEMEDIIA Payments.
- No borrar código huérfano hasta migrarlo a TSOA o marcar deprecated.

### Métricas simples de progreso

- % dominios con ruta TSOA + test smoke
- Cero `businessId = 1` en código de aplicación
- Cero bypass auth en branch de release
- Migraciones Prisma presentes y aplicables en limpio

---

## Decisiones pendientes

1. ¿Se permite bypass auth solo con `NODE_ENV=development` local, o se elimina por completo?
2. ¿Rotación/compartición de claves JWT RS256 entre entornos?
3. ¿Se versiona `backend/docs/openapi.yaml` o solo `swagger.json` generado?
4. ¿Plan de borrado de mocks: fecha o hito “POS E2E”?
5. ¿Se recupera y audita el contenido de `backups/public.sql` o se archiva fuera del flujo?
