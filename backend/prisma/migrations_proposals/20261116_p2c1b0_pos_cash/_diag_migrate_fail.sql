-- Diagnostic only. Expect rollback via explicit ROLLBACK if we abort early.
\set ON_ERROR_STOP on

BEGIN;

ALTER TYPE "SyncOperationType" ADD VALUE IF NOT EXISTS 'SALE_CREATE';
SELECT 'step_after_enum' AS checkpoint;

BEGIN;
SELECT 'step_after_nested_begin' AS checkpoint;

CREATE TABLE IF NOT EXISTS "business_document_sequences" (
  "id" SERIAL PRIMARY KEY,
  "business_id" INTEGER NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "doc_type" VARCHAR(40) NOT NULL,
  "prefix" VARCHAR(16) NOT NULL DEFAULT 'COM',
  "current_number" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "business_document_sequences_business_type_uq" UNIQUE ("business_id", "doc_type")
);
SELECT 'step_after_seq_table' AS checkpoint;

INSERT INTO "business_document_sequences" ("business_id", "doc_type", "prefix", "current_number")
SELECT b."id", 'COMMERCIAL_TICKET', 'COM', 0
FROM "businesses" b
ON CONFLICT ("business_id", "doc_type") DO NOTHING;

ALTER TABLE "sales" ALTER COLUMN "cart_id" DROP NOT NULL;
ALTER TABLE "sales" ALTER COLUMN "invoice_number" DROP NOT NULL;
DROP INDEX IF EXISTS "sales_invoice_number_key";
CREATE UNIQUE INDEX "sales_business_invoice_number_uq"
  ON "sales" ("business_id", "invoice_number")
  WHERE "invoice_number" IS NOT NULL;
SELECT 'step_after_sales_invoice_uq' AS checkpoint;

ALTER TABLE "sales"
  ADD COLUMN IF NOT EXISTS "commercial_number" VARCHAR(32),
  ADD COLUMN IF NOT EXISTS "client_operation_id" UUID,
  ADD COLUMN IF NOT EXISTS "device_id" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "document_kind" VARCHAR(24) NOT NULL DEFAULT 'LEGACY_UNSPECIFIED',
  ADD COLUMN IF NOT EXISTS "is_fiscal" BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE "sales"
SET "document_kind" = 'LEGACY_UNSPECIFIED', "is_fiscal" = FALSE
WHERE "commercial_number" IS NULL
  AND "document_kind" IS DISTINCT FROM 'COMMERCIAL_TICKET'
  AND "document_kind" IS DISTINCT FROM 'FISCAL_INVOICE';

CREATE UNIQUE INDEX "sales_business_commercial_number_uq"
  ON "sales" ("business_id", "commercial_number")
  WHERE "commercial_number" IS NOT NULL;

ALTER TABLE "sales" DROP CONSTRAINT IF EXISTS "sales_document_flags_chk";
ALTER TABLE "sales" ADD CONSTRAINT "sales_document_flags_chk" CHECK (
  (
    "document_kind" = 'COMMERCIAL_TICKET'
    AND "is_fiscal" = FALSE
    AND "commercial_number" IS NOT NULL
  )
  OR (
    "document_kind" = 'FISCAL_INVOICE'
    AND "is_fiscal" = TRUE
    AND "invoice_number" IS NOT NULL
  )
  OR (
    "document_kind" = 'LEGACY_UNSPECIFIED'
    AND "is_fiscal" = FALSE
  )
);
SELECT 'step_after_sales_checks' AS checkpoint;

ALTER TABLE "sale_items"
  ADD COLUMN IF NOT EXISTS "product_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "sku" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "business_product_id" INTEGER;

ALTER TABLE "sale_items" ALTER COLUMN "product_name" SET NOT NULL;
SELECT 'step_after_sale_items' AS checkpoint;

ALTER TABLE "cash_registers"
  ADD COLUMN IF NOT EXISTS "device_id" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "client_operation_id" UUID;

UPDATE "cash_registers"
SET "device_id" = COALESCE("device_id", 'legacy-unknown')
WHERE "device_id" IS NULL;

ALTER TABLE "cash_registers" ALTER COLUMN "device_id" SET NOT NULL;
DROP INDEX IF EXISTS "cash_registers_register_number_key";
CREATE UNIQUE INDEX "cash_registers_business_register_number_uq"
  ON "cash_registers" ("business_id", "register_number");
CREATE UNIQUE INDEX "cash_registers_open_per_device_uq"
  ON "cash_registers" ("business_id", "user_id", "device_id")
  WHERE "status" = 'OPEN' AND "deleted_at" IS NULL;
SELECT 'step_after_cash' AS checkpoint;

DO $$ BEGIN
  CREATE TYPE "CashMovementType" AS ENUM (
    'OPENING','CASH_IN','CASH_OUT','SALE_CASH','CLOSING_COUNT','ADJUSTMENT'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "cash_movements" (
  "id" SERIAL PRIMARY KEY,
  "business_id" INTEGER NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "cash_register_id" INTEGER NOT NULL REFERENCES "cash_registers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "movement_type" "CashMovementType" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "balance_after" DECIMAL(12,2),
  "sale_id" INTEGER REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "client_operation_id" UUID,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
SELECT 'step_after_cash_movements' AS checkpoint;

COMMIT;
SELECT 'after_inner_commit' AS checkpoint;
ROLLBACK;
