# DATABASE_AUDIT — Auditoría de base de datos

**Versión:** 1.1 — 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Fuente principal:** `backend/prisma/schema.prisma`  
**Fase:** 0 documentada; alineación plan maestro consolidado

---

## Hechos verificados

### Motor y ORM

- PostgreSQL vía Prisma (`provider = "postgresql"`).
- Cliente generado en `backend/prisma/generated` (gitignored).
- Extensiones declaradas: `pg_trgm`, `btree_gin`.
- Generador adicional: `prisma-json-schema-generator` → `./schemas`.
- Scripts npm usan `prisma db push` (`db:push`). **No existe** directorio `prisma/migrations`.
- Seed: `npm run db:seed` apunta a `prisma/seed.ts`, archivo **ausente**. `seeders/` vacío / gitignored.

### Enums (orientación Bolivia + retail)

| Enum | Valores relevantes |
|------|--------------------|
| `PaymentMethod` | CASH, tarjetas, transferencia, MOBILE_PAYMENT, QR_PAYMENT, ELECTRONIC_WALLET, etc. |
| `PaymentStatus` | PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED |
| `SaleStatus` / `CartStatus` / `CashRegisterStatus` | Flujo POS |
| `InventoryTransactionType` | PURCHASE, SALE, ADJUSTMENT, TRANSFER, RETURN, DAMAGED, EXPIRED, THEFT, LOSS |
| `DocumentType` | NIT, CI, PASSPORT, FOREIGN_ID |
| `InvoiceType` | FACTURA, EXENTA, NC/ND, guía, alquiler, nota simple |
| `TaxType` | IVA_13, IVA_0, EXENTO, ICE, IT, IUE |
| `BusinessType` / `Department` / `Currency` | Contexto Bolivia (BOB/USD/EUR) |

### Modelos y rol de negocio

| Modelo | Tabla | Rol |
|--------|-------|-----|
| `User` | `users` | Credenciales, `roleId`, status |
| `Role` | `roles` | Código/nombre de rol |
| `Permission` | `permissions` | Permiso por módulo |
| `RolePermission` | `role_permissions` | N:M rol-permiso |
| `Business` | `businesses` | Empresa (NIT, tipo, depto, moneda, tax default) |
| `FiscalSettings` | `fiscal_settings` | SIAT auth/series/token/url, ambiente TEST/PROD |
| `Employee` | `employees` | Usuario↔empresa, CI, cargo |
| `Category` | `categories` | Árbol (`parentId`) |
| `Product` | `products` | Catálogo global (SKU, barcode, precios, tax, min/max stock) |
| `BusinessProduct` | `business_products` | Precio/stock por empresa (`currentStock`, `reservedStock`, `availableStock`) |
| `Supplier` / `Customer` | — | Actores comerciales por `businessId` |
| `PurchaseOrder` + items | — | Compras a proveedor |
| `SupplierDebt` / `CustomerDebt` | — | Cuentas por pagar/cobrar |
| `Cart` + `CartItem` | — | Carrito POS/venta |
| `Sale` + `SaleItem` | — | Venta + método/estado de pago + campos factura |
| `CashRegister` | `cash_registers` | Apertura/cierre de caja |
| `InventoryTransaction` | `inventory_transactions` | Movimientos de stock |
| `AuditLog` / `AuditCashRegister` | — | Auditoría |

### Multi-empresa (tenancy)

- Frontera de aislamiento: **`Business` / `businessId`**.
- Presente en: Employee, BusinessProduct, Supplier, Customer, PurchaseOrder, Cart, Sale, CashRegister, InventoryTransaction; opcional en AuditLog.
- Varios modelos defaultan `businessId` a **`1`** (Employee, Supplier, Customer, PurchaseOrder).
- **No existe** modelo de sucursal, branch, store location ni terminal/caja física separada del turno `CashRegister`.

### Observaciones de integridad / diseño

- `InventoryTransaction`: relaciones Prisma a Business/Product/User aparecen **comentadas** en el schema.
- Stock vive en `BusinessProduct`, no en `Product` global (diseño multi-tenant coherente).
- No hay tablas para: variantes/atributos de producto, promociones/descuentos estructurados, cola offline/outbox, idempotency keys, dispositivos vinculados, eventos realtime, pedidos e-commerce distintos de `Sale`/`Cart`.
- Numeración fiscal: `saleService` puede leer/actualizar `FiscalSettings` (lógica en código, no solo schema).

### Artefactos externos

- `backups/public.sql` y diagramas existen en disco pero están gitignored; no se validó paridad 1:1 con el schema Prisma en esta fase.

---

## Decisiones aprobadas

1. Catálogo con categorías, variantes, atributos, precios, descuentos, promociones, fotos (evaluación/planificación antes de nuevas pantallas).
2. Inventario, clientes, proveedores, pedidos, POS, cajas.
3. Modelo de ventas: pago inmediato, pendiente, parcial, multi-método, crédito; referencias externas de cobro.
4. Separar conceptualmente: **pedido, venta, solicitud de cobro, referencia de transacción, asignación de pagos, factura**.
5. No asumir 1 venta = 1 pago = 1 factura.
6. Conciliación avanzada = CODEMEDIIA Payments (otro repo); SuperTienda solo guarda referencias de vínculo.
7. Offline: IDs únicos, cola, versionado/conflictos; multiempresa; sucursales futuras.
8. Prisma Migrate versionado entra en **P1** de Fase 1 (ver [`PHASE_1_IMPLEMENTATION_PLAN.md`](./PHASE_1_IMPLEMENTATION_PLAN.md)).

---

## Recomendaciones técnicas

1. Adoptar **Prisma Migrate**; limitar `db push` a sandboxes desechables.
2. `schema.prisma` como contrato canónico; reconciliar o archivar `backups/public.sql`.
3. Corregir defaults `businessId = 1`; exigir contexto JWT.
4. Restaurar relaciones de `InventoryTransaction`.
5. Extensiones futuras en SuperTienda (no SDKs de pago):
   - `ProductVariant`, `Promotion`/`DiscountRule`, FX rates / moneda
   - `Branch`, `Device`/`TerminalPairing`
   - `PaymentRequestRef` / refs externas (sin lógica de proveedor)
   - `SyncOutbox`, `IdempotencyRecord`, `RecordVersion`
6. Seed mínimo reproducible + plan de backup antes del piloto.
7. **No** modelar tablas de conciliación Red Enlace dentro de este repo.

---

## Funcionalidades futuras

- Schema completo de Payments/FactuBo en sus propios repositorios.
- Sucursales y multicaja cuando el plan Empresarial lo exija.

---

## Decisiones pendientes

1. ¿Catálogo global vs por empresa?
2. ¿Sucursales en MVP online o solo Empresarial?
3. ¿Variantes como producto hijo o modelo dedicado?
4. ¿Pedido online = `Sale` con canal o entidad `Order` separada?
5. Numeración fiscal autoritativa: FactuBo (default aprobado conceptualmente).
6. Baseline migrate: introspect DB existente vs reset controlado.
