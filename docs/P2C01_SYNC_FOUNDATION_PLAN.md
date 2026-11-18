# P2-C0.1 — Plan de cimientos de sincronización

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** auditoría y preparación (**sin aplicar schema, migraciones ni datos**)  
**Documento obligatorio:** [`P2C0_OFFLINE_FIRST_ARCHITECTURE.md`](./P2C0_OFFLINE_FIRST_ARCHITECTURE.md)  
**Precondiciones:** P2-B cerrado · P2-C0 diseñado  
**Estado:** propuesto — **requiere aprobación explícita** antes de tocar `schema.prisma` o migrar.

---

## 0. Resumen ejecutivo

P2-C0.1 prepara **idempotencia durable** (`sync_operations`) y **versionado** (`version` en Product / Category / BusinessProduct) para que P2-C (API privada) y el POS offline nacan seguros.

Esta ejecución **no aplica** la migración. Entrega el diseño exacto, SQL previsto, contratos API, matriz de seguridad, pruebas HTTP, riesgos y secuencia de implementación.

### Decisiones de producto cerradas (esta fase)

| # | Decisión |
|---|----------|
| 1 | PWA primero |
| 2 | Offline individual por dispositivo (sin sync LAN entre cajas en MVP) |
| 3 | Operaciones pendientes **nunca** se eliminan en silencio |
| 4 | Stock insuficiente → **conciliación** (no oversell automático) |
| 5 | Refresh JWT vencido → **bloquea nuevas mutaciones** |
| 6 | UUID local + mapeo a ID servidor |
| 7 | Operaciones idempotentes |
| 8 | Ventas QR / pasarela → **requieren conexión** |
| 9 | No emitir numeración fiscal definitiva offline sin integración fiscal definida |

---

## 1. Auditoría del schema actual (relevante)

### 1.1 Modelos catalogados

| Modelo | PK | Tenant | Soft-delete | Versionado | Notas sync |
|--------|-----|--------|-------------|------------|------------|
| `Product` | `Int` AI | `businessId?` + `visibility` | `deletedAt` | **No** | Índices parciales SKU/barcode (P2-B) |
| `Category` | `Int` AI | `businessId?` + `visibility` | `deletedAt` | **No** | Índices parciales name |
| `BusinessProduct` | `Int` AI | `businessId` NOT NULL | **No** (hard delete) | **No** | `@@unique(businessId, productId)`; precio POS = `customPrice` |
| `Sale` | `Int` AI | `businessId` | `deletedAt` | **No** | `invoiceNumber` **unique global** — bloqueante para fiscal offline |
| `InventoryTransaction` | `Int` AI | `businessId` | No | N/A | Append-only; sin `updatedAt` |
| `Business` | `Int` AI | — | `deletedAt` | — | Relación ya incluye `products` / `categories` |

### 1.2 Gaps que cierra P2-C0.1

| Gap | Cierre propuesto |
|-----|------------------|
| Sin tabla de idempotencia | `sync_operations` |
| Sin `version` / optimistic lock | Columna `version` en Product, Category, BusinessProduct |
| Sin tombstones BP | Soft-delete lógico en pull vía `sync_operations` o campo `deletedAt` en BP (**decisión §11**) |
| Sin `/sync/*` | Contrato definido aquí; implementación en etapa autorizada |
| Product+BP no atómicos en API privada | Diseño de op `PRODUCT_PRIVATE_CREATE_WITH_BP` en una transacción Prisma |

### 1.3 Fuera de esta migración (explícito)

- Numeración fiscal por empresa (`Sale.invoiceNumber`) — requiere decisión fiscal previa.  
- Remount de rutas POS/sale/caja.  
- Frontend / PWA / IndexedDB.  
- Sync LAN multicaja.  
- `publicId` UUID como PK server (mapa local es suficiente).

---

## 2. Schema propuesto

### 2.1 Enums nuevos

```prisma
enum SyncOperationStatus {
  APPLIED
  DUPLICATE   /// mismo clientOperationId + mismo requestHash → reentrega
  CONFLICT
  REJECTED
}

enum SyncOperationType {
  PRODUCT_PRIVATE_CREATE_WITH_BP
  PRODUCT_UPDATE
  CATEGORY_PRIVATE_CREATE
  CATEGORY_UPDATE
  BP_UPSERT
  STOCK_ADJUST
  /// Reservados (no handlers en C0.1; columnas listas):
  SALE_COMPLETE
  SALE_CANCEL
  CUSTOMER_CREATE
  CASH_OPEN
  CASH_CLOSE
}
```

### 2.2 Modelo `SyncOperation`

```prisma
model SyncOperation {
  id                 Int                 @id @default(autoincrement())
  businessId         Int                 @map("business_id")
  clientOperationId  String              @map("client_operation_id") @db.Uuid
  deviceId           String              @map("device_id") @db.VarChar(64)
  userId             Int                 @map("user_id")
  operationType      SyncOperationType   @map("operation_type")
  /// SHA-256 hex del body canónico (JSON estable)
  requestHash        String              @map("request_hash") @db.VarChar(64)
  status             SyncOperationStatus
  /// Respuesta reentregable al cliente (applied/duplicate/conflict/rejected)
  responseJson       Json                @map("response_json")
  /// Entidad principal afectada (opcional, para auditoría / pull hints)
  entityType         String?             @map("entity_type") @db.VarChar(40)
  entityServerId     Int?                @map("entity_server_id")
  errorCode          String?             @map("error_code") @db.VarChar(64)
  createdAt          DateTime            @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt          DateTime            @default(now()) @map("updated_at") @db.Timestamptz(6)

  business Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@unique([businessId, clientOperationId], name: "sync_operations_business_client_op_uq")
  @@index([businessId, createdAt])
  @@index([businessId, deviceId, createdAt])
  @@index([businessId, operationType, createdAt])
  @@map("sync_operations")
}
```

**Restricción única:** `(businessId, clientOperationId)` — idempotencia por empresa.

### 2.3 Versionado en entidades

Añadir a **Product**, **Category**, **BusinessProduct**:

```prisma
/// Contador monotónico de mutaciones server-side (optimistic concurrency)
version Int @default(1)
```

Reglas:

| Evento | Efecto |
|--------|--------|
| CREATE | `version = 1` |
| UPDATE exitoso | `version = version + 1` en la misma fila |
| Soft-delete Product/Category | `version++` + `deletedAt` |
| Hard-delete BP (hoy) | ver §2.4 |

Incremento **solo** en mutaciones de negocio; no en lecturas.

### 2.4 Soft-delete BusinessProduct (recomendación)

Hoy BP es hard-delete → pull no puede emitir tombstone fiable.

**Propuesta incluida en la misma migración autorizada de C0.1:**

```prisma
model BusinessProduct {
  // ... campos existentes ...
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz(6)
  // unique parcial SQL: (business_id, product_id) WHERE deleted_at IS NULL
}
```

Pasos SQL: drop `business_products_business_id_product_id_key` → unique parcial activo → add `deleted_at`.

Si se prefiere **diferir** soft-delete BP: pull de BP borrados no será completo hasta esa decisión; documentar como riesgo.

### 2.5 Relación en `Business` / `User`

```prisma
// Business
syncOperations SyncOperation[]

// User
syncOperations SyncOperation[]
```

### 2.6 Índice auxiliar para pull

```prisma
// Product / Category / BusinessProduct
@@index([businessId, updatedAt])
@@index([updatedAt]) // shared: businessId null
```

Para shared platform products en pull tenant: filtrar por visibilidad vía BP del tenant (no exponer todo el catálogo plataforma sin vínculo).

---

## 3. SQL de migración previsto

> **No ejecutar en esta fase.** Nombre tentativo: `YYYYMMDDHHMMSS_sync_foundation`

```sql
-- P2-C0.1 Sync foundation (Docker local only when authorized)
-- Additive + backfill version=1. Preserve PKs and historical FKs.

CREATE TYPE "SyncOperationStatus" AS ENUM ('APPLIED', 'DUPLICATE', 'CONFLICT', 'REJECTED');

CREATE TYPE "SyncOperationType" AS ENUM (
  'PRODUCT_PRIVATE_CREATE_WITH_BP',
  'PRODUCT_UPDATE',
  'CATEGORY_PRIVATE_CREATE',
  'CATEGORY_UPDATE',
  'BP_UPSERT',
  'STOCK_ADJUST',
  'SALE_COMPLETE',
  'SALE_CANCEL',
  'CUSTOMER_CREATE',
  'CASH_OPEN',
  'CASH_CLOSE'
);

-- Version columns
ALTER TABLE "products" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "categories" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "business_products" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- Optional BP soft-delete (recommended)
ALTER TABLE "business_products" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
ALTER TABLE "business_products" DROP CONSTRAINT IF EXISTS "business_products_business_id_product_id_key";
CREATE UNIQUE INDEX "business_products_business_product_active_uq"
  ON "business_products" ("business_id", "product_id")
  WHERE "deleted_at" IS NULL;

-- sync_operations
CREATE TABLE "sync_operations" (
  "id" BIGSERIAL PRIMARY KEY,
  "business_id" INTEGER NOT NULL,
  "client_operation_id" UUID NOT NULL,
  "device_id" VARCHAR(64) NOT NULL,
  "user_id" INTEGER NOT NULL,
  "operation_type" "SyncOperationType" NOT NULL,
  "request_hash" VARCHAR(64) NOT NULL,
  "status" "SyncOperationStatus" NOT NULL,
  "response_json" JSONB NOT NULL,
  "entity_type" VARCHAR(40),
  "entity_server_id" INTEGER,
  "error_code" VARCHAR(64),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  CONSTRAINT "sync_operations_business_id_fkey"
    FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sync_operations_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "sync_operations_business_client_op_uq"
  ON "sync_operations" ("business_id", "client_operation_id");

CREATE INDEX "sync_operations_business_created_idx"
  ON "sync_operations" ("business_id", "created_at");

CREATE INDEX "sync_operations_business_device_created_idx"
  ON "sync_operations" ("business_id", "device_id", "created_at");

CREATE INDEX "sync_operations_business_type_created_idx"
  ON "sync_operations" ("business_id", "operation_type", "created_at");

-- Pull helpers
CREATE INDEX "products_business_updated_idx" ON "products" ("business_id", "updated_at");
CREATE INDEX "categories_business_updated_idx" ON "categories" ("business_id", "updated_at");
CREATE INDEX "business_products_business_updated_idx" ON "business_products" ("business_id", "updated_at");
```

### 3.1 Backfill

- Filas existentes: `version = 1` vía DEFAULT.  
- No reclasificar visibility (P2-B intacto).  
- No tocar stock/precios.

### 3.2 Estrategia de rollback (solo Docker local autorizado)

1. Backup `pg_dump` **antes** de `migrate deploy`.  
2. Rollback preferido: restaurar dump.  
3. Rollback SQL manual (destructivo de cimientos, no de datos de negocio):

```sql
DROP TABLE IF EXISTS "sync_operations";
DROP TYPE IF EXISTS "SyncOperationType";
DROP TYPE IF EXISTS "SyncOperationStatus";
ALTER TABLE "products" DROP COLUMN IF EXISTS "version";
ALTER TABLE "categories" DROP COLUMN IF EXISTS "version";
ALTER TABLE "business_products" DROP COLUMN IF EXISTS "version";
-- Si se aplicó soft-delete BP: restaurar unique global y drop deleted_at
-- (requiere que no existan dos filas activas+borradas del mismo par)
```

**Prohibido:** `migrate reset` en remoto, borrar volúmenes, `db push`.

---

## 4. Contratos API

### 4.1 Autorización común

| Regla | Detalle |
|-------|---------|
| Auth | Bearer JWT tenant (`requireAuthUser`) |
| `PLATFORM_ADMIN` | **403** en `/sync/*` (igual P1-G tenant) |
| `businessId` | Solo el del JWT; body/query ajeno → **403** (P0.3) |
| Header | `X-Device-Id: <uuid|string≤64>` obligatorio |
| Sesión | Access inválido/expirado → **401**; cliente con refresh vencido **no** debe encolar mutaciones nuevas (regla producto; enforce client + 401 en push) |

Scopes TSOA: `bearerAuth` sin `PLATFORM_ADMIN`.

### 4.2 `POST /sync/push`

```http
POST /sync/push
Authorization: Bearer <access>
X-Device-Id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

```json
{
  "operations": [
    {
      "clientOperationId": "018f3c2e-7b1a-7d3e-9c4b-1234567890ab",
      "operationType": "PRODUCT_PRIVATE_CREATE_WITH_BP",
      "baseVersion": null,
      "dependsOn": [],
      "payload": {
        "localEntityId": "018f3c2e-aaaa-7d3e-9c4b-1234567890ab",
        "name": "Aceite 1L",
        "sku": "ACE-1L",
        "categoryServerId": 1,
        "costPrice": 10,
        "sellingPrice": 12,
        "customPrice": 15.5,
        "initialStock": 10
      },
      "clientCreatedAt": "2026-11-16T20:00:00.000Z"
    }
  ]
}
```

**Límites:** máx. 50 ops / request; payload total ≤ 512 KiB (ajustable).

**Procesamiento:**

1. Resolver `businessId` desde JWT.  
2. Por cada op, en orden:  
   a. Buscar `(businessId, clientOperationId)`.  
   b. Si existe y `requestHash` igual → devolver `status: duplicate` + `responseJson` guardado (**no** reejecutar).  
   c. Si existe y `requestHash` distinto → **409** ítem `IDEMPOTENCY_PAYLOAD_MISMATCH` (no silenciar).  
   d. Si no existe → ejecutar handler en **transacción**; persistir fila `sync_operations` con resultado; devolver `applied|conflict|rejected`.  
3. `dependsOn` no resuelto → ítem `rejected` `DEPENDENCY_PENDING` (`retryable: true`) sin fila dead.

**Respuesta:**

```json
{
  "serverTime": "2026-11-16T20:01:00.000Z",
  "results": [
    {
      "clientOperationId": "…",
      "status": "applied",
      "operationType": "PRODUCT_PRIVATE_CREATE_WITH_BP",
      "serverEntityId": 42,
      "version": 1,
      "idMappings": [
        { "entityType": "product", "localEntityId": "…", "serverId": 42 },
        { "entityType": "businessProduct", "localEntityId": "…", "serverId": 7 }
      ]
    },
    {
      "clientOperationId": "…",
      "status": "duplicate",
      "serverEntityId": 42,
      "version": 1,
      "idMappings": [ … ]
    },
    {
      "clientOperationId": "…",
      "status": "conflict",
      "code": "VERSION_CONFLICT",
      "server": { "serverEntityId": 7, "version": 5, "payload": { } },
      "retryable": false
    },
    {
      "clientOperationId": "…",
      "status": "rejected",
      "code": "INSUFFICIENT_STOCK",
      "message": "Stock insuficiente. Disponible: 2",
      "retryable": false,
      "server": { "currentStock": 2, "version": 9 }
    },
    {
      "clientOperationId": "…",
      "status": "rejected",
      "code": "IDEMPOTENCY_PAYLOAD_MISMATCH",
      "message": "clientOperationId reutilizado con payload distinto",
      "retryable": false
    }
  ]
}
```

Códigos HTTP:

| Situación | HTTP |
|-----------|------|
| Batch procesado (aunque ítems rejected) | **200** |
| Auth | 401 / 403 |
| Body inválido / sin device | **400** |
| Payload mismatch puede ser 200 ítem o 409 batch — **recomendación:** 200 con ítem `rejected` para no abortar el resto del batch |

### 4.3 `GET /sync/pull`

```http
GET /sync/pull?cursor=&limit=100&streams=catalog,stock
Authorization: Bearer <access>
X-Device-Id: …
```

| Param | Default | Notas |
|-------|---------|-------|
| `cursor` | vacío = inicio | Opaque (recomendado: `updatedAt + id` encode) |
| `limit` | 100 | Máx. 200 |
| `streams` | `catalog,stock` | `catalog` = Product privado del tenant + Category visible; `stock` = BusinessProduct del tenant |

**Respuesta:**

```json
{
  "serverTime": "…",
  "cursor": "<next-opaque>",
  "hasMore": true,
  "changes": [
    {
      "stream": "catalog",
      "entityType": "product",
      "serverId": 42,
      "version": 3,
      "updatedAt": "…",
      "deleted": false,
      "payload": { "name": "…", "sku": "…", "visibility": "BUSINESS_PRIVATE", "businessId": 1 }
    },
    {
      "stream": "catalog",
      "entityType": "product",
      "serverId": 9,
      "version": 4,
      "updatedAt": "…",
      "deleted": true,
      "deletedAt": "…"
    },
    {
      "stream": "stock",
      "entityType": "businessProduct",
      "serverId": 7,
      "version": 12,
      "updatedAt": "…",
      "deleted": false,
      "payload": {
        "productId": 42,
        "customPrice": "15.50",
        "currentStock": 8,
        "reservedStock": 0,
        "availableStock": 8
      }
    }
  ]
}
```

**Tombstones:**

- Product/Category: `deletedAt IS NOT NULL` incluidos si `updatedAt` > cursor.  
- BusinessProduct: si se adopta soft-delete; si no, hard-delete no genera tombstone (riesgo).  
- Shared products: aparecen en pull tenant **solo** si existe BP no borrado del `businessId` JWT (o tombstone del BP).

**Paginación:** orden estable `(updatedAt ASC, id ASC)`; cursor exclusivo del último ítem.

### 4.4 Handlers mínimos en C0.1 (alcance implementación futura)

| Op | Comportamiento |
|----|----------------|
| `PRODUCT_PRIVATE_CREATE_WITH_BP` | Tx: create Product `BUSINESS_PRIVATE` + BP; CHECKs P2-B; uniques parciales |
| `PRODUCT_UPDATE` | Solo si `visibility=BUSINESS_PRIVATE` ∧ `businessId=JWT`; `baseVersion` match |
| `CATEGORY_PRIVATE_CREATE` / `UPDATE` | Análogo |
| `BP_UPSERT` | Precio; no stock delta masivo |
| `STOCK_ADJUST` | Delta; si `currentStock + delta < 0` → `INSUFFICIENT_STOCK` (conciliación) |
| `SALE_*` / `CASH_*` | Enum reservado; handler → `rejected` `NOT_IMPLEMENTED` hasta etapa ventas |

### 4.5 Transacción Product + BusinessProduct

```text
BEGIN
  INSERT product (visibility=BUSINESS_PRIVATE, business_id=:bid, version=1, …)
  INSERT business_product (business_id, product_id, custom_price, stocks, version=1)
  INSERT sync_operations (APPLIED, response_json con mappings)
COMMIT
```

Fallos unique SKU → rollback completo → `rejected` `SKU_COLLISION`.  
Nunca dejar Product sin BP para este opType.

Optimistic lock update:

```sql
UPDATE business_products
SET custom_price = $1, version = version + 1, updated_at = NOW()
WHERE id = $2 AND business_id = $3 AND version = $base AND deleted_at IS NULL
-- rowCount=0 → VERSION_CONFLICT o NOT_FOUND
```

Stock:

```sql
UPDATE business_products
SET current_stock = current_stock + $delta,
    available_stock = available_stock + $delta,
    version = version + 1,
    updated_at = NOW()
WHERE id = $id AND business_id = $bid
  AND version = $base
  AND deleted_at IS NULL
  AND current_stock + $delta >= 0
-- si version ok pero stock falla → INSUFFICIENT_STOCK (leer stock actual)
```

---

## 5. Duplicados y mismatch de payload

| Caso | Detección | Resultado | Persistencia |
|------|-----------|-----------|--------------|
| Mismo UUID, mismo hash | Row existe | `duplicate` + `responseJson` original | Sin nueva fila |
| Mismo UUID, hash distinto | Row existe, hash ≠ | `rejected` `IDEMPOTENCY_PAYLOAD_MISMATCH` | **No** sobrescribir respuesta original; opcional log audit |
| UUID nuevo | Insert | ejecutar + `applied\|conflict\|rejected` | Nueva fila siempre (también rejected) |
| Retry tras red caída | Mismo UUID/hash | `duplicate` | Caso E P2-C0 |

**Hash canónico:** JSON con claves ordenadas, sin campos volátiles (`clientCreatedAt` excluido del hash o incluido de forma documentada — **recomendación:** hashear `{ operationType, payload }` normalizado; excluir `clientCreatedAt`).

**Principio producto:** `rejected`/`conflict` quedan en `sync_operations` y en outbox cliente; **nunca** auto-purge silencioso.

---

## 6. Matriz de seguridad

| Amenaza / requisito | Control |
|---------------------|---------|
| Cross-tenant push/pull | `resolveBusinessId` + unique scoped a `businessId` |
| PLATFORM_ADMIN en sync tenant | `requireAuthUser` → 403 |
| Device spoofing | `deviceId` audit-only en MVP (no confianza de autorización) |
| Replay ataque | Idempotencia: replay = duplicate benigno |
| Payload mutation con mismo UUID | Mismatch → rejected visible |
| Escalada a mutar Product shared | Handlers rechazan si no `BUSINESS_PRIVATE` del tenant |
| Mutaciones maestro tenant legacy | Siguen 403 P1-F; sync no las rehabilita |
| Stock oversell | Prohibido; `INSUFFICIENT_STOCK` |
| QR offline | No hay opType de pasarela; ventas QR fuera de push offline |
| Fiscal offline | No asignar `invoiceNumber` definitivo en C0.1 |
| Sesión vencida | 401 en API; cliente bloquea nuevas mutaciones si refresh expiró |
| Borrado silencioso ops | Prohibido en server y cliente |

Compatibilidad con endurecimientos previos:

| Fase | Compatibilidad |
|------|----------------|
| **P0.3** | Sync usa JWT `businessId`; sin fallback `1` |
| **P1-D** | Access/refresh; push exige access válido |
| **P1-F** | `/products` mutaciones siguen 403; privados solo vía sync/P2-C |
| **P1-G** | Platform no usa `/sync` tenant |
| **P1-H** | Platform catalog online; no escribe `sync_operations` tenant |
| **P2-B** | CHECKs visibility↔businessId; uniques parciales; version aditiva |

---

## 7. Pruebas HTTP diseñadas

Suite propuesta: `backend/tests/run-p2c01-sync-http.ts` + `npm run test:p2c01:http` (**implementar solo tras autorización**).

| ID | Caso | Expect |
|----|------|--------|
| S1 | Push sin token | 401 |
| S2 | Push PLATFORM_ADMIN | 403 |
| S3 | Push `businessId` ajeno en payload (si se envía) | 403 |
| S4 | Create privado+BP aplicado | 200 `applied` + mappings + version=1 |
| S5 | Reintento mismo UUID+hash | 200 `duplicate` + mismos ids |
| S6 | Mismo UUID, payload distinto | ítem `IDEMPOTENCY_PAYLOAD_MISMATCH` |
| S7 | Update con `baseVersion` correcta | `applied` version++ |
| S8 | Update con `baseVersion` vieja | `conflict` `VERSION_CONFLICT` |
| S9 | SKU duplicado privado misma empresa | `rejected` `SKU_COLLISION` |
| S10 | STOCK_ADJUST que deja stock &lt; 0 | `rejected` `INSUFFICIENT_STOCK` (sin cambiar stock) |
| S11 | Empresa A no ve ops/pull de B | aislamiento |
| S12 | Pull paginado `hasMore` + cursor estable | |
| S13 | Pull incluye tombstone Product soft-deleted | `deleted: true` |
| S14 | Access expirado | 401; fila negocio no duplicada en retry posterior válido |
| S15 | Batch: op1 ok, op2 fail → op1 persisted, op2 rejected; orden preservado | |
| S16 | Regresión: P0 BP cross-tenant sigue 403 | |
| S17 | Regresión: tenant PUT `/products/1` sigue 403 | |
| S18 | Regresión: platform `/platform/products` sigue OK | |
| S19 | Conteos Product/Category/BP seed intactos tras suite (cleanup) | |
| S20 | Sin `X-Device-Id` | 400 |

Datos de prueba: transacciones revertidas o prefijo `P2C01-*` con cleanup explícito.

---

## 8. Riesgos

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Hard-delete BP sin tombstone | Alta | Incluir `deleted_at` en misma migración |
| `invoiceNumber` global | Alta para POS | Fuera de C0.1; bloquear SALE handlers |
| Hash canónico inestable | Media | Spec formal + tests golden JSON |
| Tabla `sync_operations` crecimiento | Media | Retención/archivo fase posterior; no borrar pending cliente |
| Enum ops reservadas sin handler | Baja | `NOT_IMPLEMENTED` explícito |
| Contención con P1-H creates | Baja | Platform no usa sync_operations; version default 1 OK |
| Migración parcial indexes BP | Media | Solo `migrate deploy` local; backup previo |
| Cliente ignora bloqueo refresh vencido | Media | 401 + tests E2E en C0.2 |
| Pull shared catalog demasiado grande | Media | Filtrar por BP del tenant; paginar |

---

## 9. Secuencia exacta de implementación (tras aprobación)

> Cada paso requiere autorización si toca DB. Orden fijo:

1. **Backup** lógico verificable de `supertienda_dev`.  
2. Conteos baseline Product / Category / BusinessProduct / BP snapshot precios-stock.  
3. Editar `schema.prisma` (enums, `SyncOperation`, `version`, opcional BP `deletedAt`, relaciones, índices).  
4. Crear migración versionada SQL (contenido §3).  
5. `prisma migrate deploy` **solo** contenedor local + `prisma generate`.  
6. Verificar: columnas `version=1`, tabla vacía `sync_operations`, uniques/CHEP P2-B intactos, BP stocks iguales.  
7. Implementar `SyncService` (hash, idempotencia, handlers create/update/stock).  
8. Implementar `SyncController` TSOA `POST /sync/push`, `GET /sync/pull`.  
9. Regenerar routes/swagger.  
10. Tests HTTP S1–S20 + regresiones P0, P1-D, P1-F, P1-G, P1-H.  
11. Informe `docs/P2C01_SYNC_FOUNDATION_REPORT.md`.  
12. **Stop** — no frontend, no POS, no P2-C API privada hasta nueva orden.

**No** en esta secuencia: commit/push/deploy remoto.

---

## 10. Alcance / no-alcance de la próxima ejecución autorizada

| Incluye (tras OK) | No incluye |
|-------------------|------------|
| Migración local sync + version | Frontend / PWA / Dexie |
| API `/sync/push` + `/sync/pull` | Ventas / caja / QR |
| Handlers catálogo privado + stock adjust | Numeración fiscal |
| Tests HTTP cimientos | Sync LAN |
| Soft-delete BP (si se aprueba §11) | Adopción masiva de productos |

---

## 11. Decisiones pendientes para aprobar antes de migrar

1. **¿Incluir `business_products.deleted_at` + unique parcial en la misma migración C0.1?** (recomendado: **sí**)  
2. **¿`sync_operations.id` como `Int` o `BigInt`?** (SQL arriba usa BIGSERIAL; Prisma puede mapear `BigInt` o `Int` si se prefiere alinear al resto del schema — recomendación: **Int** AI suficiente en MVP, o BigInt si se espera alto volumen)  
3. **¿Persistir también los `rejected` por mismatch en tabla o solo responder?** (recomendación: **sí persistir** con status REJECTED y sin pisar la fila APPLIED original — implica que mismatch **no** inserta segunda fila por el unique; solo responde. Audit log opcional aparte.)  
4. **Cursor pull:** ¿opaque based on `(updatedAt, id)` por stream compuesto o cursores independientes por stream?** (recomendación: **un cursor compuesto multi-stream** ordenado globalmente por `updatedAt, entityRank, id`)  

---

## 12. Criterio de cierre de este plan (P2-C0.1 prep)

- [x] Auditoría schema  
- [x] Diseño `sync_operations`  
- [x] Diseño versionado  
- [x] Contratos push/pull  
- [x] Duplicados / mismatch  
- [x] Tx Product+BP  
- [x] Pruebas HTTP  
- [x] Compatibilidad P0–P2-B  
- [x] SQL + rollback previstos  
- [ ] **Aprobación sponsor** (decisiones §11 + luz verde para implementar)

**Detenerse aquí.** Sin aprobación no se modifica `schema.prisma` ni se ejecutan migraciones.
