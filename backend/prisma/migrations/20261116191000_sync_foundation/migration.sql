-- P2-C0.1A Sync foundation (Docker local only when authorized)
-- Additive: version columns, sync_operations, BusinessProduct soft-delete.
-- Preserves PKs and commercial data. Does not alter ProductVisibility / CategoryVisibility.

-- Enums
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

-- Version columns (existing rows → 1 via DEFAULT)
ALTER TABLE "products" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "categories" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "business_products" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- BusinessProduct soft-delete + partial unique (active rows only)
ALTER TABLE "business_products" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);

ALTER TABLE "business_products" DROP CONSTRAINT IF EXISTS "business_products_business_id_product_id_key";
DROP INDEX IF EXISTS "business_products_business_id_product_id_key";

CREATE UNIQUE INDEX "business_products_business_product_active_uq"
  ON "business_products" ("business_id", "product_id")
  WHERE "deleted_at" IS NULL;

CREATE INDEX "business_products_business_deleted_idx"
  ON "business_products" ("business_id", "deleted_at");

CREATE INDEX "business_products_business_updated_idx"
  ON "business_products" ("business_id", "updated_at");

CREATE INDEX "products_business_updated_idx"
  ON "products" ("business_id", "updated_at");

CREATE INDEX "categories_business_updated_idx"
  ON "categories" ("business_id", "updated_at");

-- sync_operations (BigInt / BIGSERIAL)
CREATE TABLE "sync_operations" (
  "id" BIGSERIAL NOT NULL,
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
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sync_operations_pkey" PRIMARY KEY ("id"),
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
