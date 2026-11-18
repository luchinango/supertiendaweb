# Validación final P0 + preparación P1

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Alcance:** verificación de seguridad P0 + plan técnico P1  
**Estado:** validación local completada — **sin migraciones, sin mutación de datos, sin commit/push/deploy**

---

## 1. Estado de P0

| Aspecto | Resultado |
|---------|-----------|
| Informe `docs/P0_SECURITY_CHANGES.md` | Coincide con el código local revisado |
| Cambios en Git | **Sin commit** en `master`; diff local amplio (~33 archivos modificados + untracked) |
| Bypass auth | Confirmado eliminado en `frontend/middleware.ts` |
| Debug | Página/API restringidos a development |
| `businessId` desde JWT | `tenantContext.resolveBusinessId` + `verifyToken` refresca desde BD |
| Fallback `businessId=1` en runtime | Eliminado en helpers/controllers P0 tocados |
| Sesión dual `auth_token`/`token` | Presente en `auth-utils` |
| Proxy Next a IP remota por defecto | Bloqueado en build de producción; **ojo:** `.env` local del frontend aún apunta a host remoto |
| Schema Prisma | **No** modificado por P0 (correcto) |

**Veredicto P0:** mitigaciones unitarias de tenancy **reproducibles**. **No** hay evidencia E2E contra API+DB en esta sesión. Quedan huecos de autorización en rutas no cubiertas por P0.

---

## 2. Pruebas ejecutadas

| Prueba | Comando | Resultado |
|--------|---------|-----------|
| P0 tenant (7 casos) | `cd backend && npm run test:p0` | **7 passed, 0 failed** |
| Backend TypeScript | `npm run type-check` | **OK** |
| Frontend TypeScript | `npx tsc --noEmit` | **2 errores** (ver riesgos) |
| E2E login/logout/sesión | — | **No ejecutado** (requiere API+DB+usuarios reales; DB configurada es remota) |
| Aislamiento HTTP multiempresa | — | **No ejecutado** (evitar golpear DB remota sin sandbox) |
| Migraciones / db push / seed | — | **No ejecutado** (restricción) |

Casos P0 unitarios: rechazo sin usuario; sin `businessId`; normalización; resolución JWT; query coincidente; query cruzada → Forbidden; sin fallback a `1`.

---

## 3. Vulnerabilidades / déficits pendientes

No corregidos en esta sesión (fuera de alcance automático):

| ID | Riesgo | Evidencia | Propuesta |
|----|--------|-----------|-----------|
| R1 | **Órdenes de compra sin tenancy JWT** | `PurchaseOrderController` acepta `businessId` de query/path y `findById` sin `resolveBusinessId` | Aplicar el mismo patrón P0 en P1/P2 inmediato antes de piloto |
| R2 | `POST /businesses` sin rol de plataforma | Cualquier autenticado puede crear negocios | Restringir a rol `PLATFORM`/`SUPERADMIN` o flujo de onboarding controlado |
| R3 | JWT access **y** refresh firman `30d` | `authService.generateToken` / `generateRefreshToken` | Access corto (p. ej. 15m–1h) + refresh rotativo; alinear comentarios/env |
| R4 | Refresh access token frágil | `refreshAccessToken` llama `generateToken(user)` sin `employee.businessId` en el select | Incluir `employee` en el select o reusar payload ya verificado |
| R5 | Interceptor refresh incompleto en frontend | `api-client.ts` solo adjunta Bearer | Interceptor 401 → `/auth/refresh` → reintento |
| R6 | Middleware Next solo presencia de cookie | No valida firma JWT | Aceptable a corto plazo si la API valida; endurecer en P2 |
| R7 | Permisos DB (`Permission`/`RolePermission`) no enforced en TSOA | Solo scopes de rol opcionales | Enforcement gradual post-P1 |
| R8 | Productos globales + categorías | Aislamiento fuerte vía `BusinessProduct`; Category sin `businessId` | Decidir catálogo global vs por empresa |
| R9 | Defaults schema `@default(1)` en `businessId` | Employee, Supplier, Customer, PurchaseOrder | Quitar en migración P1 tras backup |
| R10 | Frontend `.env` apunta API a host remoto | Misma familia IP que el antiguo proxy | Forzar localhost en dev local; secrets fuera del repo |

Errores TS frontend detectados (no bloquean backend P0):

- `app/api/debug/route.ts` — `k` possibly undefined  
- `ProductDetailPanel.tsx` — `product.category` possibly undefined  

---

## 4. Estado PostgreSQL y Prisma

### Clasificación del entorno configurado

- `DATABASE_URL` (backend): host **remoto** (no localhost). Clasificado como **remoto/cloud / posible staging o prod compartida**.  
- `NEXT_PUBLIC_API_URL` (frontend): host **remoto** puerto API.  
- **Credenciales no documentadas aquí.**  
- **No se abrió sesión SQL ni se introspectó la DB remota en esta validación.**

### Prisma

| Ítem | Estado |
|------|--------|
| `schema.prisma` | Presente; PostgreSQL + extensiones `pg_trgm`, `btree_gin` |
| `prisma/migrations/` | **Ausente** |
| Flujo actual | `db:push` en scripts npm |
| `prisma/seed.ts` | **Ausente** |
| `backend/seeders/` | `seedAll.ts` vacío; `seedAll.js` stub |
| Relaciones `InventoryTransaction` | **Comentadas** (sin FK Prisma a Business/Product/User) |
| Stock | En `BusinessProduct`, no en `Product` global |

### Riesgos de inventario / integridad

- Movimientos de stock sin FKs Prisma → huérfanos posibles.  
- Defaults `businessId=1` pueden silenciar bugs de creación.  
- Sin historial migrate → drift schema ↔ DB real desconocido hasta baseline.

---

## 5. Riesgos detectados (resumen)

1. **Tratar la DB remota actual como sandbox es peligroso** — puede ser datos reales.  
2. P0 unitario ≠ aislamiento E2E completo (`purchase-orders` sigue abierto).  
3. Baseline migrate sobre DB no vacía sin backup = riesgo alto.  
4. Refresh JWT probablemente roto en runtime (R4).  
5. Sesión frontend cookie 1 día vs JWT 30d → desalineación UX/seguridad.

---

## 6. Plan P1 paso a paso (sin ejecutar)

Enfoque comercial: SuperTienda independiente; núcleo POS + inventario; multi-rubro; desktop/móvil; CoBros/FactuBo/AliciA fuera de alcance.

### Paso 0 — Aprobaciones
- Confirmar que la DB remota configurada **no** se usará para ensayos.  
- Aprobar creación de **PostgreSQL local o staging aislado**.  
- Aprobar alcance de migración (solo baseline + FKs InventoryTransaction + quitar defaults `1`).

### Paso 1 — Backup completo
Sobre la DB fuente autorizada (idealmente staging, no prod a ciegas):

```bash
# Propuesto — NO EJECUTAR sin autorización
pg_dump --format=custom --no-owner --no-acl \
  --file="backups/supertienda_$(date +%Y%m%d_%H%M%S).dump" \
  "$DATABASE_URL"
```

### Paso 2 — Verificar backup

```bash
pg_restore --list "backups/supertienda_YYYYMMDD_HHMMSS.dump" | head
# Restaurar SOLO en DB aislada nueva:
createdb supertienda_p1_sandbox
pg_restore --no-owner --dbname=supertienda_p1_sandbox "backups/....dump"
```

Criterio: restore exitoso + conteo tablas clave (businesses, users, business_products, inventory_transactions).

### Paso 3 — Prisma Migrate baseline (en sandbox)

```bash
cd backend
# Apuntar DATABASE_URL a sandbox local
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > /tmp/baseline.sql
# Revisar SQL; luego baseline versionado (método a elegir tras aprobación):
# Opción A: prisma migrate diff + migrate resolve --applied
# Opción B: introspect + baseline marking
# NUNCA: prisma migrate reset / db push en DB con datos valorados
```

### Paso 4 — Relaciones `InventoryTransaction`
1. Descomentar relaciones a `Business`, `Product`, `User` en schema.  
2. Generar migración en sandbox.  
3. Validar filas huérfanas **antes** de aplicar FK:

```sql
-- Solo lectura / diagnóstico en sandbox
SELECT COUNT(*) FROM inventory_transactions t
LEFT JOIN businesses b ON b.id = t.business_id WHERE b.id IS NULL;
-- repetir para product_id / user_id
```

4. Limpiar o mapear huérfanos; luego aplicar FKs.

### Paso 5 — Quitar `@default(1)` de `businessId`
En Employee, Supplier, Customer, PurchaseOrder — migración que exige valor explícito; verificar inserts de aplicación.

### Paso 6 — Seed mínimo (sandbox)

```bash
# Tras crear prisma/seed.ts
npm run db:seed
```

Contenido mínimo: roles, permisos base, 1 business demo, 1 admin con Employee.businessId, categorías/productos muestra, 1 BusinessProduct con stock.

### Paso 7 — Pruebas en base aislada
- Reejecutar `npm run test:p0`.  
- Smoke login → `/auth/me` → listado suppliers/products filtrado.  
- Intento `?businessId=` ajeno → 403.  
- Ensayo migrate deploy en DB vacía y en copia restaurada.

### Paso 8 — Rollback

```bash
# Si migrate falla en sandbox: dropear sandbox y re-restore desde dump
dropdb supertienda_p1_sandbox
createdb supertienda_p1_sandbox
pg_restore --no-owner --dbname=supertienda_p1_sandbox "backups/....dump"
```

Producción: **no aplicar** hasta ensayo verde + aprobación explícita + ventana de mantenimiento.

### Criterios de aceptación P1
- [ ] Dump verificado y restore en sandbox OK  
- [ ] `prisma/migrations` versionado existe; `db push` fuera del flujo de equipo  
- [ ] FKs `InventoryTransaction` activas sin huérfanos  
- [ ] Sin `@default(1)` en `businessId` de entidades tenant  
- [ ] Seed mínimo reproducible  
- [ ] `test:p0` verde + smoke tenancy HTTP en sandbox  
- [ ] Documentado qué DB es local/staging/prod  

---

## 7. Comandos propuestos (no ejecutados)

```bash
# Validación (ya corridos en esta sesión)
cd backend && npm run test:p0
cd backend && npm run type-check

# P1 — solo tras autorización
pg_dump --format=custom --file=backups/supertienda.dump "$DATABASE_URL"
createdb supertienda_p1_sandbox
pg_restore --dbname=supertienda_p1_sandbox backups/supertienda.dump
cd backend
# set DATABASE_URL=postgresql://...@localhost:.../supertienda_p1_sandbox
npx prisma migrate status
npx prisma validate
# luego migrate dev / deploy SOLO en sandbox
```

**Prohibido aún:** `prisma migrate reset`, `prisma db push` en DB remota, DROP/TRUNCATE, deploy, commit/push.

---

## 8. Decisiones que requieren aprobación

1. **¿La DB en `206.183…` es staging o producción?** ¿Se puede tocar siquiera en lectura?  
2. **¿Crear PostgreSQL 100% local** para P1 y cortar el frontend/backend local del host remoto?  
3. **¿Baseline por introspect de DB existente o por schema.prisma como fuente de verdad?**  
4. **¿Incluir remediación R1 (purchase-orders tenancy) dentro de P1 o hotfix previo?** Recomendación: **hotfix previo o día 1 de P1**.  
5. **¿Política JWT** (duraciones access/refresh) y rotación de refresh.  
6. **¿Quién puede `POST /businesses`?**  
7. **Catálogo Product/Category:** global compartido vs por empresa.  
8. Autorización explícita para **empezar P1** (backup + sandbox) tras responder 1–7.

---

## Restricciones respetadas en esta sesión

- Sin modificar producción  
- Sin migraciones / db push / reset  
- Sin borrar ni alterar datos  
- Sin otros repos  
- Sin deploy / commit / push  
- Sin iniciar implementación P2/P3  
- Sin cambios de arquitectura
