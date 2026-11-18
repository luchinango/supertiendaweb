-- =============================================================================
-- P2-C1.B0.1 / B1-RECOVERY — POS / caja + commercial_number ≠ invoice_number
-- Solo Docker local (supertienda_dev). Preserves PKs. No SIAT. No FiscalSettings.
-- NOTA: sin BEGIN/COMMIT internos — Prisma migrate deploy gestiona la transacción.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Enum sync: SALE_CREATE canónico; SALE_COMPLETE se conserva (legacy).
-- -----------------------------------------------------------------------------
ALTER TYPE "SyncOperationType" ADD VALUE IF NOT EXISTS 'SALE_CREATE';

-- -----------------------------------------------------------------------------
-- 1) Secuencia comercial por empresa (independiente de fiscal_settings)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "business_document_sequences" (
  "id" SERIAL PRIMARY KEY,
  "business_id" INTEGER NOT NULL REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "doc_type" VARCHAR(40) NOT NULL,
  "prefix" VARCHAR(16) NOT NULL DEFAULT 'COM',
  "current_number" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "business_document_sequences_business_type_uq" UNIQUE ("business_id", "doc_type")
);

COMMENT ON TABLE "business_document_sequences" IS
  'Contadores de tickets comerciales (COM-*). Independiente de fiscal_settings / SIAT.';

INSERT INTO "business_document_sequences" ("business_id", "doc_type", "prefix", "current_number")
SELECT b."id", 'COMMERCIAL_TICKET', 'COM', 0
FROM "businesses" b
ON CONFLICT ("business_id", "doc_type") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2) Sales: cart nullable + commercial_number + flags; invoice_number = fiscal futuro
-- -----------------------------------------------------------------------------
ALTER TABLE "sales" ALTER COLUMN "cart_id" DROP NOT NULL;

-- invoice_number: histórico intacto; nuevas ventas comerciales pueden dejarlo NULL
ALTER TABLE "sales" ALTER COLUMN "invoice_number" DROP NOT NULL;

-- Unique global → unique por empresa solo cuando invoice_number no es NULL (fiscal futuro)
DROP INDEX IF EXISTS "sales_invoice_number_key";

CREATE UNIQUE INDEX "sales_business_invoice_number_uq"
  ON "sales" ("business_id", "invoice_number")
  WHERE "invoice_number" IS NOT NULL;

ALTER TABLE "sales"
  ADD COLUMN IF NOT EXISTS "commercial_number" VARCHAR(32),
  ADD COLUMN IF NOT EXISTS "client_operation_id" UUID,
  ADD COLUMN IF NOT EXISTS "device_id" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "document_kind" VARCHAR(24) NOT NULL DEFAULT 'LEGACY_UNSPECIFIED',
  ADD COLUMN IF NOT EXISTS "is_fiscal" BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN "sales"."invoice_number" IS
  'Reservado para facturación fiscal futura (SIAT). Históricos se conservan; MVP POS no asigna este campo.';
COMMENT ON COLUMN "sales"."commercial_number" IS
  'Ticket comercial definitivo asignado SOLO en servidor (COM-########). NULL en legacy/offline provisional.';
COMMENT ON COLUMN "sales"."document_kind" IS
  'LEGACY_UNSPECIFIED | COMMERCIAL_TICKET | FISCAL_INVOICE';
COMMENT ON COLUMN "sales"."is_fiscal" IS
  'true solo con documento fiscal autorizado; MVP POS siempre false en filas nuevas COMMERCIAL_TICKET';

-- Histórico: NO convertir invoice_number → commercial_number (no inventar tickets)
UPDATE "sales"
SET
  "document_kind" = 'LEGACY_UNSPECIFIED',
  "is_fiscal" = FALSE
WHERE "commercial_number" IS NULL
  AND "document_kind" IS DISTINCT FROM 'COMMERCIAL_TICKET'
  AND "document_kind" IS DISTINCT FROM 'FISCAL_INVOICE';

-- Unicidad comercial: NULL permitido N veces (partial unique)
CREATE UNIQUE INDEX "sales_business_commercial_number_uq"
  ON "sales" ("business_id", "commercial_number")
  WHERE "commercial_number" IS NOT NULL;

-- Coherencia document_kind / is_fiscal / números
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

-- Prohibir estados contradictorios adicionales
ALTER TABLE "sales" DROP CONSTRAINT IF EXISTS "sales_no_fiscal_commercial_mix_chk";
ALTER TABLE "sales" ADD CONSTRAINT "sales_no_fiscal_commercial_mix_chk" CHECK (
  NOT ("is_fiscal" = TRUE AND "document_kind" = 'COMMERCIAL_TICKET')
  AND NOT ("is_fiscal" = FALSE AND "document_kind" = 'FISCAL_INVOICE')
);

CREATE UNIQUE INDEX IF NOT EXISTS "sales_business_client_operation_uq"
  ON "sales" ("business_id", "client_operation_id")
  WHERE "client_operation_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "sales_business_created_idx"
  ON "sales" ("business_id", "created_at");

CREATE INDEX IF NOT EXISTS "sales_cash_register_idx"
  ON "sales" ("cashRegisterId");

CREATE INDEX IF NOT EXISTS "sales_business_commercial_number_idx"
  ON "sales" ("business_id", "commercial_number");

-- -----------------------------------------------------------------------------
-- 3) SaleItem snapshots
-- -----------------------------------------------------------------------------
ALTER TABLE "sale_items"
  ADD COLUMN IF NOT EXISTS "product_name" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "sku" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "business_product_id" INTEGER;

UPDATE "sale_items" si
SET
  "product_name" = COALESCE(si."product_name", LEFT(p."name", 200)),
  "sku" = COALESCE(si."sku", p."sku")
FROM "products" p
WHERE p."id" = si."product_id"
  AND (si."product_name" IS NULL OR si."sku" IS NULL);

-- PG: el alias del target (si) no puede usarse en JOIN ON del FROM; condición en WHERE
UPDATE "sale_items" si
SET "business_product_id" = bp."id"
FROM "sales" s
JOIN "business_products" bp
  ON bp."business_id" = s."business_id"
 AND bp."deleted_at" IS NULL
WHERE si."sale_id" = s."id"
  AND bp."product_id" = si."product_id"
  AND si."business_product_id" IS NULL;

ALTER TABLE "sale_items" ALTER COLUMN "product_name" SET NOT NULL;

ALTER TABLE "sale_items" DROP CONSTRAINT IF EXISTS "sale_items_business_product_id_fkey";
ALTER TABLE "sale_items"
  ADD CONSTRAINT "sale_items_business_product_id_fkey"
  FOREIGN KEY ("business_product_id") REFERENCES "business_products"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "sale_items_business_product_idx"
  ON "sale_items" ("business_product_id");

-- -----------------------------------------------------------------------------
-- 4) CashRegister: deviceId, version, unique por empresa, una OPEN por device
-- -----------------------------------------------------------------------------
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

CREATE UNIQUE INDEX IF NOT EXISTS "cash_registers_business_client_operation_uq"
  ON "cash_registers" ("business_id", "client_operation_id")
  WHERE "client_operation_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "cash_registers_business_status_idx"
  ON "cash_registers" ("business_id", "status");

-- -----------------------------------------------------------------------------
-- 5) cash_movements (OPENING + SALE_CASH en C1.B; CASH_IN/OUT diferidos en UI)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "CashMovementType" AS ENUM (
    'OPENING',
    'CASH_IN',
    'CASH_OUT',
    'SALE_CASH',
    'CLOSING_COUNT',
    'ADJUSTMENT'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
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
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cash_movements_sale_cash_amount_chk" CHECK (
    ("movement_type" <> 'SALE_CASH') OR ("amount" >= 0)
  )
);

CREATE INDEX IF NOT EXISTS "cash_movements_register_created_idx"
  ON "cash_movements" ("cash_register_id", "created_at");

CREATE INDEX IF NOT EXISTS "cash_movements_business_created_idx"
  ON "cash_movements" ("business_id", "created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "cash_movements_business_client_operation_uq"
  ON "cash_movements" ("business_id", "client_operation_id")
  WHERE "client_operation_id" IS NOT NULL;

INSERT INTO "cash_movements" (
  "business_id", "cash_register_id", "user_id", "movement_type", "amount", "balance_after", "notes"
)
SELECT
  cr."business_id",
  cr."id",
  cr."user_id",
  'OPENING'::"CashMovementType",
  cr."opening_amount",
  cr."opening_amount",
  'Backfill P2-C1.B0.1 from cash_registers.opening_amount'
FROM "cash_registers" cr
WHERE NOT EXISTS (
  SELECT 1 FROM "cash_movements" cm
  WHERE cm."cash_register_id" = cr."id" AND cm."movement_type" = 'OPENING'
);

-- =============================================================================
-- Handler (C1.B) — asignación concurrente de commercial_number:
--   UPDATE business_document_sequences
--   SET current_number = current_number + 1, updated_at = now()
--   WHERE business_id = $1 AND doc_type = 'COMMERCIAL_TICKET'
--   RETURNING current_number, prefix;
--   → commercial_number = prefix || '-' || lpad(n::text, 8, '0')
--   → document_kind = 'COMMERCIAL_TICKET', is_fiscal = false, invoice_number = NULL
-- Offline: ticket provisional local; commercial_number solo tras ack servidor.
-- No usar fiscal_settings.invoice_current_number.
-- =============================================================================
