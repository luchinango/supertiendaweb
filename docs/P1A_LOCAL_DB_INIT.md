# P1-A — Inicialización segura de PostgreSQL local

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Alcance:** schema versionado + migrate deploy **solo** en Docker `db`  
**Restricciones:** sin DB remota, sin `migrate reset`, sin seed (pendiente), sin commit/push/deploy

> La solicitud del usuario llegó truncada en Fase 2 (`SaleItem.`). Se completó la inicialización local alineada al objetivo P1-A y a `P0_VALIDATION_AND_P1_PREP.md` / Oleada A (P1.1–P1.5). Seed (P1.6) queda pendiente de autorización explícita.

---

## Fase 1 — Verificación (OK)

| Check | Resultado |
|-------|-----------|
| Git | `master` con cambios locales sin commit |
| Compose | `supertienda-db`, `supertienda-backend`, `supertienda-frontend` Up |
| Contenedor PG | `supertienda-db` (`postgres:16-alpine`) |
| `DATABASE_URL` proceso | `…@db:5432/supertienda_dev` → **local** |
| Remoto | No usado (`HAS_REMOTE false`) |
| Tablas antes | **0** |
| Historial migrate | Ausente → se creó en esta fase |

---

## Fase 2 — Revisión de esquema (cambios aplicados)

### Hallazgos previos
- Sin `prisma/migrations`
- `InventoryTransaction` sin FKs Prisma (relaciones comentadas)
- `businessId @default(1)` en Employee, Supplier, Customer, PurchaseOrder
- Stock multiempresa vía `BusinessProduct`
- `Product` / `Category` globales (sin `businessId`)

### Ajustes en `schema.prisma` (seguros porque la DB estaba vacía)
1. Restaurar relaciones `InventoryTransaction` → Business, Product, User + índices.
2. Eliminar `@default(1)` de `businessId` en Employee, Supplier, Customer, PurchaseOrder.
3. Ajuste mínimo en `employeeService.create` para exigir `businessId` explícito (rompe TS tras regenerar cliente).

### Modelos revisados
User, Role/Permission, Business, Product, BusinessProduct, InventoryTransaction, PurchaseOrder(+items), Sale(+SaleItem), Cart, CashRegister, Supplier, Customer — coherentes con tenancy por `businessId` donde aplica.

---

## Migración aplicada

| Ítem | Valor |
|------|-------|
| Migración | `backend/prisma/migrations/20261116153000_init_local` |
| Lock | `migrations/migration_lock.toml` (postgresql) |
| Comando | `npx prisma migrate deploy` **dentro del contenedor backend** |
| Datasource reportado por Prisma | `supertienda_dev` at **`db:5432`** |

### Post-deploy
- 24 tablas de negocio + `_prisma_migrations`
- FKs `inventory_transactions_*_fkey` presentes
- `employees.business_id` **sin** default
- `prisma migrate status` → up to date
- `test:p0` → **11 passed**
- `tsc` backend → **OK**

### Scripts npm
- `db:push` ahora falla a propósito (desaconsejado)
- Añadidos `db:migrate:status` / `db:migrate:deploy`

---

## Pendiente (requiere autorización)

1. **Seed mínimo** (`prisma/seed.ts`): roles, business demo, admin+employee, productos muestra.
2. Smoke E2E login / tenancy HTTP contra DB local con datos.
3. Endurecer `employeeController` legacy (aún no TSOA) para forzar `businessId` desde JWT.
4. Decisión: catálogo Product/Category global vs por empresa.
5. Reenviar el resto del prompt P1-A si había fases 3+ truncadas.

---

## No hecho

- Ninguna operación contra PostgreSQL remoto
- Sin `migrate reset` / `db push`
- Sin commit / push / deploy
- Sin seed
