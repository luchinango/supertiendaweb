-- P2-B Hybrid catalog: visibility + optional business ownership
-- Local Docker only. Preserves PKs and historical FKs.
-- Backfill: ALL existing rows → PLATFORM_SHARED / business_id NULL (D1).

-- Enums
CREATE TYPE "ProductVisibility" AS ENUM ('PLATFORM_SHARED', 'BUSINESS_PRIVATE');
CREATE TYPE "CategoryVisibility" AS ENUM ('PLATFORM_SHARED', 'BUSINESS_PRIVATE');

-- Categories: drop global unique name, add ownership columns
DROP INDEX IF EXISTS "categories_name_key";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_key";

ALTER TABLE "categories"
  ADD COLUMN "business_id" INTEGER,
  ADD COLUMN "visibility" "CategoryVisibility" NOT NULL DEFAULT 'PLATFORM_SHARED';

-- Products: drop global unique sku/barcode, add ownership columns
DROP INDEX IF EXISTS "products_sku_key";
DROP INDEX IF EXISTS "products_barcode_key";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_sku_key";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_barcode_key";

ALTER TABLE "products"
  ADD COLUMN "business_id" INTEGER,
  ADD COLUMN "visibility" "ProductVisibility" NOT NULL DEFAULT 'PLATFORM_SHARED';

-- Backfill (explicit; defaults already PLATFORM_SHARED / NULL)
UPDATE "products"
SET "visibility" = 'PLATFORM_SHARED',
    "business_id" = NULL
WHERE TRUE;

UPDATE "categories"
SET "visibility" = 'PLATFORM_SHARED',
    "business_id" = NULL
WHERE TRUE;

-- Foreign keys
ALTER TABLE "categories"
  ADD CONSTRAINT "categories_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "products"
  ADD CONSTRAINT "products_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES "businesses"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Visibility indexes
CREATE INDEX "categories_business_id_visibility_idx" ON "categories"("business_id", "visibility");
CREATE INDEX "categories_visibility_idx" ON "categories"("visibility");
CREATE INDEX "products_business_id_visibility_idx" ON "products"("business_id", "visibility");
CREATE INDEX "products_visibility_idx" ON "products"("visibility");

-- Partial unique indexes (SKU/barcode/name by scope). NULLs excluded from uniqueness.
CREATE UNIQUE INDEX "categories_platform_name_uq"
  ON "categories" ("name")
  WHERE "business_id" IS NULL AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX "categories_private_name_uq"
  ON "categories" ("business_id", "name")
  WHERE "business_id" IS NOT NULL AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX "products_shared_sku_uq"
  ON "products" ("sku")
  WHERE "visibility" = 'PLATFORM_SHARED' AND "sku" IS NOT NULL AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX "products_shared_barcode_uq"
  ON "products" ("barcode")
  WHERE "visibility" = 'PLATFORM_SHARED' AND "barcode" IS NOT NULL AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX "products_private_sku_uq"
  ON "products" ("business_id", "sku")
  WHERE "visibility" = 'BUSINESS_PRIVATE' AND "sku" IS NOT NULL AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX "products_private_barcode_uq"
  ON "products" ("business_id", "barcode")
  WHERE "visibility" = 'BUSINESS_PRIVATE' AND "barcode" IS NOT NULL AND "deleted_at" IS NULL;

-- CHECK: visibility ↔ business_id coherence
ALTER TABLE "products"
  ADD CONSTRAINT "products_visibility_owner_chk" CHECK (
    ("visibility" = 'PLATFORM_SHARED' AND "business_id" IS NULL)
    OR
    ("visibility" = 'BUSINESS_PRIVATE' AND "business_id" IS NOT NULL)
  );

ALTER TABLE "categories"
  ADD CONSTRAINT "categories_visibility_owner_chk" CHECK (
    ("visibility" = 'PLATFORM_SHARED' AND "business_id" IS NULL)
    OR
    ("visibility" = 'BUSINESS_PRIVATE' AND "business_id" IS NOT NULL)
  );
