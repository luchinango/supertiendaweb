# P2-A — Diseño definitivo del catálogo híbrido (alternativa C)

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** diseño y preparación (**sin schema, sin migraciones, sin datos**)  
**Estado actual local (solo lectura):** 4 products, 4 business_products, 3 categories (Docker `supertienda_dev`)

**Precondiciones vigentes:**

- P0.3 — aislamiento `BusinessProduct`
- P1-F — mutaciones tenant de maestro bloqueadas
- P1-G — `PLATFORM_ADMIN` sin empresa
- P1-H — CRUD maestro vía `/platform/products|categories` (sin DELETE)

---

## 0. Resumen ejecutivo

El híbrido C separa:

| Capa | Responsabilidad |
|------|-----------------|
| **Product / Category** | Identidad de catálogo (`PLATFORM_SHARED` o `BUSINESS_PRIVATE`) |
| **BusinessProduct** | Vínculo comercial: `customPrice`, stock, adopción |

**POS / venta:** precio operativo = `BusinessProduct.customPrice` **obligatorio**.  
Sin fallback silencioso a `Product.sellingPrice`.

**Migración de datos:** **no** inferir ownership porque un producto tenga un solo BP. Clasificación explícita + revisión.

**Esta fase no autoriza ejecutar migraciones.** Se solicita aprobación explícita antes de P2-B.

---

## 1. Auditoría del schema actual

### 1.1 Grafo relevante

```text
Category ──< Product
               ├── BusinessProduct (businessId, customPrice, stocks)  @@unique(businessId, productId)
               ├── CartItem.productId
               ├── SaleItem.productId          (Sale.businessId aísla venta)
               ├── PurchaseOrderItem.productId (PurchaseOrder.businessId aísla OC)
               └── InventoryTransaction (businessId + productId)
```

### 1.2 Limitaciones actuales

| Limitación | Efecto |
|------------|--------|
| `Product` / `Category` sin `businessId` / `visibility` | Todo es “global” |
| `sku` / `barcode` `@unique` globales | Dos empresas no pueden reutilizar el mismo código en privados |
| `Category.name` `@unique` global | Colisión de nombres entre tenants |
| Históricos apuntan a `productId` | Renombrar/soft-delete maestro impacta lectura histórica |
| `Product.sellingPrice` vs `BP.customPrice` | Ambigüedad de precio comercial |
| Sin tabla de variantes | Ropa/tallas no modeladas |

### 1.3 Datos demo locales (referencia, no mutados)

| product_id | sku | BP count | businesses |
|------------|-----|----------|------------|
| 1 | SKU-SHARED-001 | 2 | 1,2 → candidato natural `PLATFORM_SHARED` |
| 2 | SKU-A-001 | 1 | 1 → **no** auto-asignar privado; requiere decisión |
| 3 | SKU-B-001 | 1 | 2 → idem |
| (otros) | — | — | soft-deleted / suite |

---

## 2. Modelo Prisma propuesto

```prisma
enum ProductVisibility {
  PLATFORM_SHARED
  BUSINESS_PRIVATE
}

enum CategoryVisibility {
  PLATFORM_SHARED
  BUSINESS_PRIVATE
}

model Category {
  id          Int                 @id @default(autoincrement())
  /// null = categoría de plataforma (PLATFORM_SHARED)
  businessId  Int?                @map("business_id")
  visibility  CategoryVisibility  @default(BUSINESS_PRIVATE)
  name        String              @db.VarChar(100)
  description String?             @db.Text()
  parentId    Int?                @map("parent_id")
  isActive    Boolean             @default(true) @map("is_active")
  sortOrder   Int                 @default(0) @map("sort_order")
  // ... timestamps / audit ...

  business Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)
  parent   Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  childrens Category[] @relation("CategoryHierarchy")
  products Product[]

  /// Nombre único por ámbito (plataforma o empresa)
  @@unique([businessId, name])
  @@index([businessId, visibility])
  @@map("categories")
}

model Product {
  id           Int               @id @default(autoincrement())
  categoryId   Int               @map("category_id")
  /// null solo si visibility = PLATFORM_SHARED
  businessId   Int?              @map("business_id")
  visibility   ProductVisibility @default(BUSINESS_PRIVATE)
  sku          String?           @db.VarChar(50)
  barcode      String?           @db.VarChar(50)
  name         String            @db.VarChar(200)
  // ... campos físicos / tax / minStock referencia ...
  costPrice    Decimal           @default(0) @map("cost_price") @db.Decimal(10, 2)
  sellingPrice Decimal           @default(0) @map("selling_price") @db.Decimal(10, 2) // referencia; NO precio POS
  // ... status, soft-delete, audit ...

  business Business? @relation(fields: [businessId], references: [id], onDelete: Restrict)
  category Category  @relation(fields: [categoryId], references: [id])
  businessProducts BusinessProduct[]
  // SaleItem, PurchaseOrderItem, CartItem, InventoryTransaction sin cambio de FK

  @@index([businessId, visibility])
  @@index([visibility])
  @@map("products")
}

model BusinessProduct {
  id             Int     @id @default(autoincrement())
  businessId     Int     @map("business_id")
  productId      Int     @map("product_id")
  /// Precio comercial POS — obligatorio; sin fallback a Product.sellingPrice
  customPrice    Decimal @map("custom_price") @db.Decimal(10, 2)
  currentStock   Int     @default(0) @map("current_stock")
  reservedStock  Int     @default(0) @map("reserved_stock")
  availableStock Int     @default(0) @map("available_stock")
  // ...

  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  product  Product  @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@unique([businessId, productId])
  @@map("business_products")
}
```

### 2.1 Constraints de integridad (CHECK / aplicación)

Aplicar en migración SQL + validación de servicio:

```sql
-- Product
ALTER TABLE products ADD CONSTRAINT products_visibility_owner_chk CHECK (
  (visibility = 'PLATFORM_SHARED' AND business_id IS NULL)
  OR
  (visibility = 'BUSINESS_PRIVATE' AND business_id IS NOT NULL)
);

-- Category (análogo)
ALTER TABLE categories ADD CONSTRAINT categories_visibility_owner_chk CHECK (
  (visibility = 'PLATFORM_SHARED' AND business_id IS NULL)
  OR
  (visibility = 'BUSINESS_PRIVATE' AND business_id IS NOT NULL)
);
```

Reglas de servicio adicionales:

- Privado: `category.businessId` debe ser null (categoría plataforma adoptada) **o** igual al `product.businessId`.
- Compartido: solo categorías `PLATFORM_SHARED`.
- BP: `product` debe ser `PLATFORM_SHARED` **o** (`BUSINESS_PRIVATE` ∧ `product.businessId = bp.businessId`).

---

## 3. Restricciones e índices (SKU / barcode / NULL)

### 3.1 Problema PostgreSQL

En PostgreSQL, `UNIQUE (a, b)` **permite múltiples filas con `b IS NULL`** (NULL ≠ NULL en unicidad).  
Por tanto un índice parcial o expresión es necesario si se quiere “a lo sumo un NULL por empresa” — normalmente **no** se exige unicidad de NULL; se permite N productos sin SKU.

### 3.2 Estrategia recomendada

1. **Eliminar** `@unique` globales de `sku` y `barcode`.
2. Índices únicos **parciales** por ámbito:

```sql
-- Privados: únicos por empresa cuando el valor no es null
CREATE UNIQUE INDEX products_private_sku_uq
  ON products (business_id, sku)
  WHERE visibility = 'BUSINESS_PRIVATE' AND sku IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX products_private_barcode_uq
  ON products (business_id, barcode)
  WHERE visibility = 'BUSINESS_PRIVATE' AND barcode IS NOT NULL AND deleted_at IS NULL;

-- Compartidos: únicos a nivel plataforma
CREATE UNIQUE INDEX products_shared_sku_uq
  ON products (sku)
  WHERE visibility = 'PLATFORM_SHARED' AND sku IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX products_shared_barcode_uq
  ON products (barcode)
  WHERE visibility = 'PLATFORM_SHARED' AND barcode IS NOT NULL AND deleted_at IS NULL;
```

3. Prisma: documentar índices en SQL de migración; opcionalmente `@@index` no únicos en schema + raw SQL para únicos parciales (Prisma aún limita unique parciales en DSL).

### 3.3 Categorías

- Quitar `name @unique` global.
- `@@unique([businessId, name])` — en PG, varias filas con `business_id NULL` y mismo `name` **sí pueden colisionar mal**.  
  Preferir índice parcial:

```sql
CREATE UNIQUE INDEX categories_platform_name_uq
  ON categories (name)
  WHERE business_id IS NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX categories_private_name_uq
  ON categories (business_id, name)
  WHERE business_id IS NOT NULL AND deleted_at IS NULL;
```

---

## 4. Reglas de ownership y visibilidad

| Visibilidad | `businessId` | Quién crea | Quién edita identidad | Quién crea BP |
|-------------|--------------|------------|----------------------|---------------|
| `PLATFORM_SHARED` | **null** | `PLATFORM_ADMIN` | Solo plataforma | Cualquier empresa (adopción) |
| `BUSINESS_PRIVATE` | **obligatorio** = empresa dueña | `ADMIN` (tenant) | Solo esa empresa | Solo esa empresa (alta conjunta) |

**No existe** “producto compartido con empresa propietaria”.  
**No existe** “privado sin `businessId`”.

Lectura tenant:

```text
visible = 
  (visibility = PLATFORM_SHARED AND exists BP for JWT.businessId)   // adoptado
  OR (visibility = PLATFORM_SHARED AND mode = "browse-master")      // catálogo para adoptar (solo lectura)
  OR (visibility = BUSINESS_PRIVATE AND businessId = JWT.businessId)
```

Escritura tenant:

- Privados propios: sí (ADMIN; EMPLOYEE según permiso).
- Compartidos: **nunca** mutar `Product`; solo BP propio.
- Ajenos privados: invisible (404).

---

## 5. Matriz de permisos

| Capacidad | PLATFORM_ADMIN | ADMIN empresa | EMPLOYEE |
|-----------|----------------|---------------|----------|
| CRUD `/platform/products\|categories` compartidos | Sí | No | No |
| Alta privada `Product` + BP (transacción) | No* | Sí | Opcional permiso |
| Update/delete lógico privado propio | No* | Sí | Limitado |
| Adoptar maestro → crear BP | No* | Sí | Opcional |
| Update BP precio/stock propio | No* | Sí | Según permiso |
| Ver privados de otra empresa | No | No | No |
| Ver/editar stock cross-tenant | No | No | No |
| Mutar `/products` legacy global | 403 (mantener) | 403 | 403 |

\*Plataforma no opera datos comerciales de clientes en MVP (salvo herramientas futuras explícitas).

---

## 6. Alta privada (transacción única)

```text
BEGIN
  INSERT Product (
    visibility = BUSINESS_PRIVATE,
    businessId = JWT.businessId,
    categoryId = cat (plataforma o privada propia),
    ...
  )
  INSERT BusinessProduct (
    businessId = JWT.businessId,
    productId  = new.id,
    customPrice = REQUIRED,   -- sin default silencioso desde sellingPrice
    currentStock / reserved / available = valores iniciales
  )
COMMIT
```

Validaciones:

- `customPrice` presente y ≥ 0.
- SKU/barcode únicos en índices privados de la empresa.
- Categoría accesible (shared o private propia).
- Rollback automático si falla BP.

API sugerida: `POST /business-products/private-products` o `POST /products/private` (nuevo), **no** reabrir `POST /products` inseguro.

---

## 7. Adopción de producto maestro

```text
Precondiciones:
  product.visibility = PLATFORM_SHARED
  product.deletedAt IS NULL
  product.isActive = true
  NO existe BP (JWT.businessId, productId)

BEGIN
  INSERT BusinessProduct (businessId, productId, customPrice REQUIRED, stocks...)
COMMIT
```

- **No** clonar fila `Product`.
- **No** cambiar `visibility` / `businessId` del maestro.
- Precio inicial: obligatorio en body (puede sugerirse UI con `sellingPrice` como *hint*, nunca aplicado en servidor sin envío explícito).

API: `POST /business-products/adopt` `{ productId, customPrice, currentStock? }`.

---

## 8. Estrategia de migración de datos

### 8.1 Principio

**Prohibido** auto-clasificar como privado un producto con un único BP.  
Ese BP puede ser “adopción temprana” de un ítem que debe seguir compartido.

### 8.2 Pasos (P2-B, tras aprobación)

1. **Expand schema** (nullable columns + enums + defaults seguros).
2. **Backfill conservador:**
   - Todos los productos existentes → `visibility = PLATFORM_SHARED`, `businessId = NULL`.
   - Todas las categorías → `PLATFORM_SHARED`, `businessId = NULL`.
3. **Informe de candidatos** (solo lectura / CSV interno):
   - `bp_count = 1` → listar para **decisión humana** (¿promover a privado o dejar shared?).
   - `bp_count = 0` → shared huérfano o archivar.
   - `bp_count ≥ 2` → shared confirmado.
4. **Aplicar reclasificaciones explícitas** solo con lista aprobada (script idempotente).
5. **Índices** SKU/barcode (tras resolver colisiones).
6. **CHECK constraints** visibility/owner.
7. **Validación post:** conteos, FKs, tests HTTP.

### 8.3 Colisiones de SKU al pasar a índices parciales

Antes de crear índices únicos: detectar duplicados globales que serían ilegales bajo shared. Resolver manualmente.

### 8.4 Rollback

- Migración “expand” reversible (drop columns/enums) **antes** de reclasificar privados.
- Tras reclasificar privados: rollback = script inverso que restaura `PLATFORM_SHARED` + `businessId NULL` según snapshot pre-migración.
- No `migrate reset`. Snapshot lógico (tabla `_p2a_product_migration_audit`) recomendada.

---

## 9. Tratamiento de datos históricos

| Artefacto | Política |
|-----------|----------|
| `SaleItem.productId` | Se mantiene. La venta ya tiene `Sale.businessId`. |
| Snapshot de nombre/precio | **Futuro recomendado:** columnas `productNameSnapshot`, `unitPrice` ya en SaleItem cubre precio; nombre puede añadirse en P2-C. |
| `PurchaseOrderItem` | Igual: FK estable; no reescribir IDs. |
| `InventoryTransaction` | Ya tiene `businessId`; coherente. |
| `CartItem` | Validar al checkout que BP exista y precio = `customPrice`. |
| Soft-delete Product | `onDelete: Restrict` en BP; no borrar físicos. Shared soft-deleted: ocultar en adopción; históricos siguen resolviendo FK. |

Reclasificar shared→private **solo** si no hay BP de otras empresas (regla dura).

---

## 10. Política de precios POS

| Campo | Uso |
|-------|-----|
| `BusinessProduct.customPrice` | **Único** precio de venta en POS/carrito/checkout |
| `Product.sellingPrice` | Precio de referencia de catálogo / hint de adopción |
| `Product.costPrice` | Referencia de costo (no sustituye contabilidad por empresa) |

Reglas:

1. Si no hay BP → producto **no vendible** para esa empresa.
2. Si `customPrice` es null → **error de datos** (schema lo hace NOT NULL hoy; mantener).
3. **Prohibido** en código: `price = bp.customPrice ?? product.sellingPrice`.
4. Cambios de `Product.sellingPrice` por plataforma **no** alteran BP existentes.

---

## 11. Servicios sin inventario y variantes

### 11.1 Servicios (mano de obra / paquetes)

Opciones (decidir en aprobación):

| Opción | Descripción |
|--------|-------------|
| **S1 (recomendada MVP)** | `Product` privado + BP con `currentStock` ignorado si `trackInventory=false` |
| S2 | Tabla `ServiceOffering` separada |

Propuesta MVP: flag `trackInventory Boolean @default(true)` en `Product` o en `BusinessProduct`.  
Si false: POS no descuenta stock; BP puede tener stock 0 permanente.

### 11.2 Variantes (ropa / tallas)

**Fuera del MVP P2-A/B.** Diseño diferido:

- `ProductVariant` (`productId`, `sku`, `barcode`, attrs JSON) + BP a nivel variante, **o**
- Productos privados hermanos (SKU por talla) sin modelo de variantes.

Documentar como decisión pendiente §14.

---

## 12. API propuesta

### Plataforma (existente + ajustes)

| Ruta | Cambio |
|------|--------|
| `/platform/products*` | Forzar `visibility=PLATFORM_SHARED`, `businessId=null` |
| `/platform/categories*` | Idem |

### Tenant (nuevas)

| Método | Ruta | Acción |
|--------|------|--------|
| POST | `/products/private` | Alta privada + BP (tx) |
| PUT/PATCH | `/products/private/{id}` | Editar privado propio |
| GET | `/products` | Privados propios + shared adoptados (BP) |
| GET | `/products/master-browse` | Shared activos no adoptados (solo lectura) |
| POST | `/business-products/adopt` | Adoptar shared |
| CRUD | `/business-products/*` | Mantener (precio/stock) |
| POST | `/categories/private` | Categoría privada |
| GET | `/categories` | Shared + privadas propias |

### Legacy

| Ruta | Estado |
|------|--------|
| `POST/PUT/DELETE /products`, status toggles | Permanecen **403** o se deprecan |
| `POST/PUT/DELETE /categories` | Idem |

---

## 13. Impacto frontend

| Área | Cambio |
|------|--------|
| Alta de producto empresa | Nuevo formulario → `/products/private` (precio BP obligatorio) |
| Catálogo CODEMEDIIA | Browse + botón Adoptar |
| Edición | Privados editables; shared solo vía plataforma |
| POS (cuando se monte) | Leer `customPrice` exclusivamente |
| `AuthContext` | Sin cambio de roles; ADMIN usa flujos privados |
| `productsService` | Dejar de llamar mutaciones globales |

Sin UI admin plataforma en P2-A (ya diferida).

---

## 14. Plan de pruebas HTTP (P2-B+)

1. PLATFORM crea shared; tenant no lo muta.
2. ADMIN A crea privado + BP; B no lo ve.
3. A adopta shared; precio BP propio; stock A ≠ B.
4. A intenta adoptar dos veces → 409.
5. A intenta `customPrice` omitido → 400.
6. POS/cart (si existe) rechaza sin BP / sin usar `sellingPrice`.
7. SKU duplicado en A → 409; mismo SKU en B privado → OK.
8. Mismo barcode en shared y privado B → política: **permitir** (índices separados) o **prohibir** globalmente — ver decisión §14.1.
9. Históricos: SaleItem sigue resolviendo productId tras reclasificación.
10. Regresión P0/P1-F/G/H.
11. PLATFORM no lee BP cross-tenant.
12. Migración dry-run: conteos pre/post.

### 14.1 Decisión barcode cross-visibility

**Recomendación:** permitir el mismo barcode en shared y en privado de otra empresa (índices independientes).  
Si fiscalización exige unicidad nacional, añadir índice único global opcional en fase posterior.

---

## 15. Riesgos y decisiones pendientes

| ID | Tema | Pregunta al aprobador |
|----|------|------------------------|
| D1 | Candidatos `bp_count=1` | ¿Lista manual o dejar todos shared en v1 de migración? **Recomendado: todos shared.** |
| D2 | Barcode cross-visibility | ¿Permitir colisión shared/privado? **Recomendado: sí.** |
| D3 | `trackInventory` | ¿En Product o BusinessProduct? **Recomendado: BusinessProduct.** |
| D4 | Variantes | ¿Diferir a P3? **Recomendado: diferir.** |
| D5 | Snapshot nombre en SaleItem | ¿Incluir en misma migración? **Recomendado: P2-C.** |
| D6 | Soft-delete categoría shared con productos | ¿Restringir como P1-H? **Sí.** |
| D7 | EMPLOYEE puede alta privada | ¿Solo ADMIN en MVP? **Recomendado: solo ADMIN.** |
| D8 | Ruta canónica alta privada | `/products/private` vs `/business-products/with-product` |

---

## 16. Secuencia de implementación por etapas

| Etapa | Contenido | ¿Migración? | Puerta |
|-------|-----------|-------------|--------|
| **P2-A** (esta) | Diseño | No | — |
| **P2-B** | Migración expand + backfill shared + índices + CHECKs | **Sí** | Aprobación |
| **P2-C** | API privada + adopt + tests HTTP | No nueva migr. (salvo snapshot) | Tras P2-B verde |
| **P2-D** | Frontend tenant (alta/adopción) | No | — |
| **P2-E** | Ajustes POS precio estricto al montar rutas | No | — |
| **P3** | Variantes / servicios avanzados | Posible | — |

Validaciones previas P2-B:

- Backup volumen Docker / dump lógico.
- Inventario de duplicados SKU/barcode.
- Suite P0–P1H verde.

Validaciones posteriores:

- Constraints OK.
- Conteos products/BP/categories.
- HTTP P2 + regresiones.
- Ningún tenant muta shared.

Rollback: ver §8.4.

---

## 17. Solicitud de aprobación

Se solicita autorización explícita para **P2-B** que incluye:

1. Modificar `schema.prisma` según §2.
2. Crear y aplicar migración en **PostgreSQL Docker local únicamente**.
3. Backfill inicial: **todos** los productos/categorías existentes como `PLATFORM_SHARED` (sin auto-privatizar `bp_count=1`).
4. Índices parciales SKU/barcode y CHECKs.
5. **No** `db push` / **no** `migrate reset` / **no** remoto.

Confirmar también decisiones D1–D8 (o aceptar recomendaciones).

---

**Fin P2-A.** Detenerse aquí — **no migrar hasta aprobación.**
