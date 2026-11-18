# P1-E — Auditoría del catálogo y permisos multiempresa

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** auditoría y propuesta (**sin cambios estructurales**)  
**Precondiciones:** P0.3 (BusinessProduct aislado), P1-D (login/refresh OK)

---

## 1. Arquitectura actual

### 1.1 Modelo de datos (Prisma)

```text
Category (global, name UNIQUE)
    └── Product (global; sku/barcode UNIQUE globales)
            ├── BusinessProduct (por empresa: customPrice, stocks)
            ├── SaleItem → productId (venta apunta al maestro)
            ├── PurchaseOrderItem → productId
            ├── InventoryTransaction (businessId + productId)
            └── CartItem → productId
```

| Entidad | Scope | Observación |
|---------|-------|-------------|
| `Category` | **Global** | Sin `businessId`. Nombre único en toda la plataforma. |
| `Product` | **Global** | Sin `businessId`. Precios maestro (`costPrice`/`sellingPrice`), stock mínimo, estado, IVA. SKU/barcode únicos mundiales. |
| `BusinessProduct` | **Por empresa** | Precio comercial y stock operativo. `@@unique([businessId, productId])`. |
| `SaleItem` / `PurchaseOrderItem` | Línea → `productId` global | El aislamiento real depende de `Sale`/`PurchaseOrder.businessId`, no del producto. |
| `InventoryTransaction` | `businessId` + `productId` | Correcto para movimientos; el maestro sigue siendo compartido. |

**Hecho clave:** el diseño ya intenta un **catálogo maestro + overlay comercial** (alternativa B), pero el maestro es mutable por cualquier usuario autenticado de cualquier empresa.

### 1.2 Capas API

| Recurso | Auth | Tenancy | Roles/permisos |
|---------|------|---------|----------------|
| `/business-products/*` | JWT | **Sí** (P0.3) | Solo `bearerAuth` (sin scopes) |
| `/products/*` | JWT | **Parcial / inconsistente** | Solo `bearerAuth` |
| `/categories/*` | JWT | **No** | Solo `bearerAuth` |

- Lecturas de productos “de empresa” (`search`, `low-stock`, stats) filtran vía `businessProducts.some.businessId`.
- `GET /products` y `GET /products/{id}` listan/leen el **maestro global completo**.
- `PUT/DELETE/activate/deactivate/discontinue/out-of-stock` sobre `/products/{id}` **no reciben JWT businessId** y mutan el maestro.
- `POST /products` recibe `businessId` del JWT pero `ProductRepository.create` **solo inserta en `products`**; no crea `BusinessProduct` ni marca ownership.
- Categorías: CRUD global sin empresa ni rol de plataforma.
- Seed define permisos `products.read` / `products.write` y roles `ADMIN` / `EMPLOYEE`, pero **los controladores no los consultan**. No existe rol `PLATFORM` / CODEMEDIIA.

### 1.3 Frontend

- `frontend/services/productsService.ts` y `categoriesService.ts` apuntan a `/products` y `/categories` (maestro).
- `catalogService.ts` usa `/business-products/catalog` (capa empresarial).
- La UI puede operar el maestro global con el mismo token de admin de empresa.

---

## 2. Vulnerabilidades detectadas

### 2.1 Críticas (confirmadas HTTP local)

| ID | Hallazgo | Evidencia (Docker local, 16-nov-2026) |
|----|----------|--------------------------------------|
| **C1** | Admin Empresa A modifica nombre del producto compartido → Empresa B lo ve | `PUT /products/1` con token A → **200**; `GET /products/1` con token B muestra `"Arroz MUTADO por Empresa A"`. Restaurado a nombre original. |
| **C2** | Admin Empresa A desactiva producto “solo B” (`SKU-B-001`, id=3) | `PUT /products/3/deactivate` con token A → **200**; B ve `isActive:false` / `INACTIVE`. Reactivado. |
| **C3** | Empleado Empresa A crea categoría global | `POST /categories` con `employee_a` → **201** (`Cat P1E Temp Emp`). Soft-deleted tras la prueba. |
| **C4** | Lectura global filtra datos ajenos | `GET /products` con token A lista también **Azúcar Empresa B** (id=3). |

### 2.2 Altas / estructurales

| ID | Hallazgo |
|----|----------|
| **H1** | No hay rol de plataforma; `ADMIN` de empresa ≡ poder de mutación global de catálogo. |
| **H2** | Permisos seed (`products.write`) no enforced en TSOA/`expressAuthentication` (sin scopes). |
| **H3** | SKU/barcode `@unique` globales: Empresa A puede bloquear códigos que Empresa B necesite. |
| **H4** | `ProductService.update` usa `businessId=1` hardcodeado en validación SKU/barcode (`TODO`). |
| **H5** | Soft-delete de `Product`/`Category` afecta a todas las empresas que referencian el maestro (ventas/OC históricas y catálogo vivo). |
| **H6** | Precios maestro (`sellingPrice`/`costPrice`) coexisten con `BusinessProduct.customPrice` sin política clara de cuál manda en POS. |

### 2.3 Lo que ya está bien

- `BusinessProduct` precio/stock aislados (P0.3 HTTP verde).
- Varias lecturas de inventario por empresa usan join a `businessProducts`.
- Suppliers / purchase-orders con aislamiento previo.

---

## 3. ¿Puede un admin de A afectar a B?

**Sí.** Hoy un `ADMIN` (e incluso un `EMPLOYEE`) de Empresa A puede:

1. Renombrar, repriciar (maestro), desactivar o soft-borrar productos usados por B.
2. Crear/editar/borrar categorías compartidas.
3. Ver el catálogo maestro completo de otras empresas.
4. Consumir el namespace global de SKU/barcode.

El aislamiento de **stock y precio comercial** en `BusinessProduct` **no** protege identidad, estado ni taxonomía del producto.

---

## 4. Comparativa de alternativas

### A — Catálogo 100% independiente por empresa

Cada empresa tiene sus `Product`/`Category` con `businessId` obligatorio. Sin maestro compartido.

| Dimensión | Impacto |
|-----------|---------|
| Seguridad | Excelente aislamiento. |
| Inventario / precios | Naturalmente por empresa. |
| Compras / ventas | FK siempre al producto propio. |
| Categorías | Árboles por empresa. |
| Importación | Fácil por tenant; sin choques de SKU global. |
| Escalabilidad SaaS | Mucha duplicación (arroz × N negocios). |
| Datos actuales | Migración fuerte: clonar productos compartidos por BP; reescribir FKs de SaleItem/OC. |

### B — Catálogo maestro compartido + datos comerciales por empresa *(diseño actual incompleto)*

`Product`/`Category` globales; `BusinessProduct` para precio/stock.

| Dimensión | Impacto |
|-----------|---------|
| Seguridad | **Requiere** gobernanza fuerte del maestro (solo plataforma o solo lectura). Hoy **falla**. |
| Inventario / precios | Bien vía BP. |
| Compras / ventas | Comparten `productId`; reportes cross-tenant posibles a nivel maestro. |
| Categorías | Unificadas (útil y peligroso). |
| Importación | Catálogo GS1/barcode compartido atractivo; conflictos de ownership. |
| Escalabilidad | Buena para SKUs masivos. |
| Datos actuales | Compatible si se **congela** mutación del maestro por tenants. |

### C — Híbrido: maestro opcional + productos privados

- Maestro de plataforma (solo lectura para tenants; escritura CODEMEDIIA o partners).
- Productos/categorías **privados** por `businessId` (o `ownerBusinessId` + `visibility`).
- `BusinessProduct` vincula empresa ↔ producto (maestro o privado) con precio/stock.
- Adopción: “usar del maestro” vs “crear privado”.

| Dimensión | Impacto |
|-----------|---------|
| Seguridad | Alta si maestro es inmutable para tenants y privados scoped. |
| Inventario / precios | BP sigue siendo la fuente comercial. |
| Compras / ventas | Igual patrón FK a `productId`. |
| Categorías | Maestro + categorías privadas (o mapping). |
| Importación | Maestro para barcodes comunes; privados para marcas propias/repuestos. |
| Escalabilidad SaaS | Mejor equilibrio para minimarkets → ferreterías → ropa → servicios. |
| Datos actuales | Evolución natural: marcar productos existentes como `SHARED` o asignar `ownerBusinessId` según BP exclusivos; compartidos → maestro. |

---

## 5. Recomendación técnica

**Recomendar alternativa C (híbrido)**, alineada al producto SuperTienda multi-rubro:

| Rubro | Uso típico del híbrido |
|-------|------------------------|
| Minimarkets | Maestro de abarrotes/barcodes + privados locales |
| Ferreterías | Maestro de tornillería común + SKUs de proveedor propios |
| Ropa | Casi todo privado (tallas/variantes); poco maestro |
| Repuestos | Maestro por OEM/código + privados de taller |
| Servicios | “Productos” privados (mano de obra/paquetes); categorías propias |

**Por qué no A puro ahora:** costo de migración y pérdida de beneficio de barcodes compartidos.  
**Por qué no B puro:** sin plataforma CODEMEDIIA operativa y con admins de empresa mutando el maestro, B es inseguro; además muchos negocios necesitan ítems no compartibles.

**Puente inmediato (sin schema):** tratar el maestro actual como *de facto* compartido y **bloquear mutaciones** a tenants (contención §9) hasta implementar C.

---

## 6. Modelo de permisos propuesto

| Rol | Alcance | Catálogo |
|-----|---------|----------|
| **PLATFORM_ADMIN** (CODEMEDIIA) | Toda la plataforma | CRUD maestro `Product`/`Category` compartidos; soporte; no opera stock de clientes salvo tool explícita |
| **BUSINESS_ADMIN** | Su `businessId` | CRUD productos/categorías **privados**; configurar `BusinessProduct` (precio/stock); adoptar productos maestro (crear BP); **no** mutar maestro |
| **BUSINESS_EMPLOYEE** | Su `businessId` | Lectura catálogo visible; ajustar stock/precio según permisos granulares; **no** CRUD maestro ni categorías globales |

Permisos sugeridos (evolución del seed):

```text
catalog.master.read
catalog.master.write          → solo PLATFORM
catalog.private.read
catalog.private.write         → ADMIN empresa (+ empleados autorizados)
business_product.read
business_product.write
business_product.stock.adjust
categories.private.write
```

JWT actual ya lleva `role` + `businessId`; falta:

1. Rol `PLATFORM_ADMIN` (usuario **sin** employee de tenant, o con flag `isPlatform`).
2. Enforcement real en middleware/TSOA scopes (hoy no se usa).

---

## 7. Cambios necesarios en Prisma *(propuesta; no aplicar aún)*

Sin ejecutar migraciones en esta fase. Boceto orientativo:

```prisma
enum ProductVisibility { PLATFORM_SHARED | BUSINESS_PRIVATE }

model Category {
  // + businessId Int?  // null = categoría de plataforma
  // + @@unique([businessId, name])  // reemplaza name @unique global
}

model Product {
  // + businessId Int?              // null = maestro plataforma
  // + visibility ProductVisibility @default(BUSINESS_PRIVATE)
  // + @@unique([businessId, sku])  // SKU por tenant; maestro con businessId null
  // relajar sku/barcode @unique globales
}
```

Reglas:

- `businessId IS NULL` + `PLATFORM_SHARED` → solo plataforma edita.
- `businessId = N` → solo empresa N edita.
- `BusinessProduct` sigue siendo el vínculo comercial/stock.
- Migración de datos: productos con un solo BP → privados de esa empresa; con ≥2 BP → marcar compartidos de plataforma.

**Decisiones pendientes antes de migrar:** unicidad de barcode global vs por tenant; variantes (talla/color); servicios sin stock.

---

## 8. Impacto en API y frontend

### API

| Área | Cambio esperado |
|------|-----------------|
| `GET /products` | Filtrar: maestro compartido + privados del JWT `businessId` |
| `POST /products` | Crear **privado** del tenant (+ opcional BP inicial) |
| `PUT/DELETE /products/{id}` | Solo si `ownerBusinessId` coincide; maestro → 403 para tenants |
| `/categories` | Análogo |
| Nuevas rutas plataforma | `/platform/products`, `/platform/categories` con scope `PLATFORM_ADMIN` |
| `/business-products` | Se mantiene; adopción desde maestro = `POST` BP |

### Frontend

- Separar UI “Mi catálogo” vs “Catálogo CODEMEDIIA (solo lectura + Adoptar)”.
- Formularios de alta dejan de asumir mutación global.
- POS/caja deben vender desde BP (precio `customPrice`), no `Product.sellingPrice` a ciegas.

---

## 9. Contención inmediata *(propuesta; requiere aprobación — no implementada)*

**No se modificó el contrato en esta fase.** Rutas peligrosas siguen abiertas.

### Evidencia de exposición actual

```text
PUT  /products/{id}              → cualquier JWT (admin o employee)
PUT  /products/{id}/activate|deactivate|discontinue|out-of-stock
DELETE /products/{id}
POST /products                   → crea maestro global
POST|PUT|DELETE /categories/**  → global
GET  /products                  → filtra catálogo ajeno
```

### Opciones de contención (elegir en aprobación)

| Opción | Descripción | Invasividad |
|--------|-------------|-------------|
| **T1 Soft-forbid** | Mutaciones `/products` y `/categories` → **403** para todos excepto allowlist temporal de usuarios plataforma (env `PLATFORM_USER_IDS`) | Baja; rompe UI de alta de productos hasta tener flujo privado |
| **T2 Owner-only** | Permitir update/delete solo si el producto tiene BP **exclusivo** de la empresa del JWT; compartidos y ajenos → 403 | Media; permite alta local si create también crea BP + marca ownership en memoria/convención |
| **T3 Read-only maestro** | Solo `GET` en productos/categorías globales; altas solo vía `/business-products` + endpoint nuevo privado (ya sería implementación parcial de C) | Alta |

**Recomendación de contención:** **T1** inmediato tras aprobación (horas), mientras se diseña T2/C en P1-F/P2. Comunicar a frontend que el CRUD de productos globales queda bloqueado.

Alternativa mínima aún más estrecha: T1 solo sobre `PUT/DELETE/activate/...` y dejar `POST` si se acompaña de create BP — sigue siendo cambio de comportamiento y necesita aprobación.

---

## 10. Plan de implementación por etapas *(futuro)*

| Etapa | Contenido | Migración |
|-------|-----------|-----------|
| **P1-E** (esta) | Auditoría + propuesta | No |
| **P1-F (contención)** | Aplicar T1 o T2 acordado; tests HTTP; no schema | No |
| **P1-G (permisos)** | `PLATFORM_ADMIN`, scopes TSOA, enforcement | Seed/roles (posible sin schema de productos) |
| **P2-A (schema híbrido)** | `businessId`/`visibility` en Product/Category; migrar datos demo | **Sí** (autorizada) |
| **P2-B (API)** | Rutas privadas + platform; adopt-from-master | — |
| **P2-C (frontend)** | UX catálogo dual | — |
| **P2-D** | POS sobre BP; política de precios | — |

---

## 11. Riesgos y decisiones pendientes

1. **¿Barcode debe ser único global?** (fiscalización / pistola) vs único por empresa.
2. **¿Quién opera el maestro CODEMEDIIA** en MVP? ¿Solo staff interno?
3. **Política de precio:** ¿POS usa solo `BusinessProduct.customPrice`?
4. **Productos de servicio** (sin stock): ¿mismo modelo Product + BP con stock 0?
5. **Variantes** (ropa): ¿tabla `ProductVariant` o productos privados separados?
6. **Históricos:** SaleItem con `productId` de maestro renombrado — ¿snapshot de nombre en línea de venta?
7. **Contención T1** rompe flujos actuales de alta en UI — ¿aceptable hasta P2-A?
8. Soft-delete de categoría de prueba `id=2` quedó con `deleted_at` (no se purgó fila; seed no afectado en productos).

---

## 12. Estado y siguiente paso

| Ítem | Estado |
|------|--------|
| Arquitectura documentada | Hecho |
| Vulnerabilidades con evidencia HTTP | Hecho (C1–C4) |
| Comparativa A/B/C | Hecho |
| Recomendación | **C — híbrido** |
| Contención | **Propuesta; no aplicada** |
| Schema / migraciones / P2 | **No iniciados** |

**Detenerse aquí.** Esperar aprobación explícita para:

1. Activar contención (T1/T2/T3), y/o  
2. Diseñar P1-F/P1-G, y/o  
3. Autorizar migraciones del modelo híbrido en P2.
