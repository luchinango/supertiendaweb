# FEATURE_INVENTORY — Inventario de funcionalidades

**Versión:** 1.1 — 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Fase:** 0 documentada; alineación P0–P5

Leyenda de estado:

| Estado | Significado |
|--------|-------------|
| **Completo** | Schema + API registrada + UI conectada de punta a punta (con posibles mejoras) |
| **Parcial** | Hay piezas reales pero falta cableado, cobertura o enforcement |
| **Mock** | UI o handler con datos estáticos / in-memory / stub |
| **Ausente** | No hay implementación significativa |

---

## Hechos verificados

### Matriz por dominio

| Dominio | Schema | Backend API | Frontend | Estado |
|---------|--------|-------------|----------|--------|
| Login / JWT verify | Sí | TSOA `/auth` | Login + AuthContext | **Parcial** (tokens inconsistentes, bypass) |
| Registro de usuarios | User | No implementado (stub FE) | Página register | **Mock/Ausente** |
| Usuarios | User | TSOA `/users` | Empleados consume `/employees` | **Parcial** |
| Roles / permisos | Role, Permission | Controllers sin TSOA; sin enforcement runtime | — | **Parcial** (solo modelo) |
| Empresas (Business) | Business | TSOA `/businesses` | Configuraciones con datos hardcodeados en partes | **Parcial** |
| Categorías | Category | TSOA `/categories` | Inventario/productos | **Parcial** |
| Productos / catálogo | Product, BusinessProduct | TSOA products + business-products | `productos`, hooks SWR | **Parcial** (hay mocks auxiliares) |
| Variantes / atributos | No | No | No | **Ausente** |
| Fotos de producto | Campos/uso limitado | No auditado como media service completo | UI de edición | **Parcial/Ausente** |
| Descuentos / promociones | No modelo dedicado | No | UI pago puede aplicar lógica local | **Ausente** |
| Importación CSV/Excel | No | No | No | **Ausente** |
| Inventario / stock | BusinessProduct, InventoryTransaction | Service + controller **no TSOA** | `inventario` | **Parcial** |
| Mermas / alertas | Tipos DAMAGED/LOSS etc. | No dedicado | `mermas`, `alertas` | **Mock/Parcial** |
| Proveedores | Supplier | TSOA `/suppliers` | `proveedores` | **Parcial** |
| Órdenes de compra | PurchaseOrder | TSOA `/purchase-orders` | `ordenes-compra` | **Parcial** |
| Clientes | Customer | Service + controller **no TSOA** | `clientes` + service FE | **Parcial** (API probablemente 404) |
| Carrito / ventas POS | Cart, Sale | `posService`/`saleService` **no TSOA** | `ventas` + CartContext in-memory | **Mock** en checkout |
| Caja (cash register) | CashRegister | Service + controller **no TSOA** | UI caja; FE llama open; stub Next posible | **Parcial/Mock** |
| Medios de pago | Enum | Sin gateway | PaymentPanel stub | **Parcial** (solo UI/enum) |
| QR / CODEMEDIIA Payments | Enum `QR_PAYMENT` | No (correcto: otro repo) | Menciones UI | **Ausente / fuera de repo** |
| Pedidos online (e-commerce) | Reusa Cart/Sale | No canal online dedicado | No storefront público | **Ausente** |
| Empleados | Employee | Controller **no TSOA** | `empleados` | **Parcial** |
| Créditos / deudas | CustomerDebt, SupplierDebt | Parcial / no TSOA | `creditos` | **Parcial/Mock** |
| Movimientos | InventoryTransaction / caja | No cableado completo | `movimientos` con mocks | **Mock** |
| Reportes / estadísticas | — | Stub FE `app/api/reports` | `estadisticas`, dashboard | **Mock** |
| Configuración fiscal | FiscalSettings | Lógica parcial en saleService | `configuraciones` | **Parcial** |
| FactuBo / SIAT envío | Campos SIAT | Sin cliente (otro repo) | Toggle/copy UI | **Ausente / fuera de repo** |
| Offline / PWA | No | No | No SW/manifest/IndexedDB | **Ausente** (P5) |
| Multidevice QR auxiliar | No | No realtime | No | **Ausente** (post-Payments) |
| WordPress / Alicia / Analytics | No | No | No | **Ausente / fuera de repo** |
| Variantes / import CSV / multi-moneda | No | No | No | **Ausente** (P4) |
| Auditoría | AuditLog, AuditCashRegister | Controllers no TSOA | — | **Parcial** (modelo) |

### API TSOA registrada (hechos)

Prefijos vivos: `/auth`, `/users`, `/businesses`, `/products`, `/business-products`, `/categories`, `/suppliers`, `/purchase-orders`.

### Controllers presentes sin registro TSOA (hechos)

Incluyen entre otros: `posController`, `saleController`, `cartController`, `cashRegisterController`, `customerController`, `inventoryController`, `employeeController`, `roleController`, `permissionController`, audits, debts, sale/cart items.

### Páginas frontend observadas

`dashboard`, `productos`, `inventario`, `ventas`, `clientes`, `proveedores`, `ordenes-compra`, `empleados`, `movimientos`, `creditos`, `mermas`, `alertas`, `estadisticas`, `configuraciones`, `(auth)/login`, `(auth)/register`, `debug-auth`.

### Evidencias de mock / stub

- `PaymentPanel.completeTransaction`: log + clear cart, sin API.
- `CartContext`: estado local.
- `frontend/app/api/cash-registers/open/route.ts`: stub.
- `frontend/app/api/reports/route.ts`: JSON hardcodeado.
- `movimientos/page.tsx`: arrays estáticos.
- Partes de `productos`, `clientes`, `proveedores`, `configuraciones` con datos ficticios o hardcode.

---

## Decisiones aprobadas

- SuperTienda: catálogo, inventario, clientes/proveedores, POS, cajas, ventas, pedidos, offline individual, multiempresa, reportes comerciales.
- P0–P5 definen el orden de cableado en este repo ([`MVP_ROADMAP.md`](./MVP_ROADMAP.md)).
- QR/Red Enlace, FactuBo, Alicia, WordPress, Analytics, menús digitales = **productos/repos independientes** (solo contratos aquí).
- Evaluar variantes, import CSV, monedas, fotos, impuestos, sucursales antes de nuevas pantallas (P4+).

---

## Recomendaciones técnicas

1. Cablear primero dominios **Parcial** con services existentes (P2–P3): POS, caja, customers, inventory.
2. Etiquetar pantallas **Mock** en demos.
3. No CSV/offline hasta POS E2E real.
4. Separar capacidad schema / API / UX.
5. Smoke tests: auth → catálogo → caja → venta.

---

## Funcionalidades futuras

- Integración real Payments/FactuBo; auxiliar QR con confirmación verificable; plugin WordPress; Alicia.

---

## Decisiones pendientes

1. ¿Qué mocks se mantienen en demo mientras se cablea?
2. ¿Pedidos online en primer MVP o solo POS?
3. ¿Importación masiva en piloto?
4. ¿Créditos a clientes en MVP o plan superior?
