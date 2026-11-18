-- =============================================================================
-- P2-C1.B0.1 ROLLBACK (best-effort) — NO EJECUTAR sin autorización
-- Preferir restore de snapshot Docker. ENUM SALE_CREATE no se elimina.
-- invoice_number históricos NO se borran; solo se revierten columnas nuevas.
-- =============================================================================

BEGIN;

DROP TABLE IF EXISTS "cash_movements";
DROP TYPE IF EXISTS "CashMovementType";

DROP INDEX IF EXISTS "cash_registers_business_client_operation_uq";
DROP INDEX IF EXISTS "cash_registers_business_status_idx";
DROP INDEX IF EXISTS "cash_registers_open_per_device_uq";
DROP INDEX IF EXISTS "cash_registers_business_register_number_uq";

ALTER TABLE "cash_registers" DROP COLUMN IF EXISTS "client_operation_id";
ALTER TABLE "cash_registers" DROP COLUMN IF EXISTS "version";
-- device_id: opcional conservar; para rollback duro descomentar:
-- ALTER TABLE "cash_registers" DROP COLUMN IF EXISTS "device_id";

ALTER TABLE "sale_items" DROP CONSTRAINT IF EXISTS "sale_items_business_product_id_fkey";
DROP INDEX IF EXISTS "sale_items_business_product_idx";
ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "business_product_id";
ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "sku";
-- product_name: rollback duro opcional (pierde snapshot):
-- ALTER TABLE "sale_items" ALTER COLUMN "product_name" DROP NOT NULL;
-- ALTER TABLE "sale_items" DROP COLUMN IF EXISTS "product_name";

DROP INDEX IF EXISTS "sales_business_commercial_number_idx";
DROP INDEX IF EXISTS "sales_cash_register_idx";
DROP INDEX IF EXISTS "sales_business_created_idx";
DROP INDEX IF EXISTS "sales_business_client_operation_uq";
DROP INDEX IF EXISTS "sales_business_commercial_number_uq";
DROP INDEX IF EXISTS "sales_business_invoice_number_uq";

ALTER TABLE "sales" DROP CONSTRAINT IF EXISTS "sales_no_fiscal_commercial_mix_chk";
ALTER TABLE "sales" DROP CONSTRAINT IF EXISTS "sales_document_flags_chk";

ALTER TABLE "sales" DROP COLUMN IF EXISTS "is_fiscal";
ALTER TABLE "sales" DROP COLUMN IF EXISTS "document_kind";
ALTER TABLE "sales" DROP COLUMN IF EXISTS "device_id";
ALTER TABLE "sales" DROP COLUMN IF EXISTS "client_operation_id";
ALTER TABLE "sales" DROP COLUMN IF EXISTS "commercial_number";

-- Restaurar NOT NULL invoice_number solo si no hay NULLs (ventas comerciales nuevas)
-- ALTER TABLE "sales" ALTER COLUMN "invoice_number" SET NOT NULL;
-- CREATE UNIQUE INDEX "sales_invoice_number_key" ON "sales"("invoice_number");

-- ALTER TABLE "sales" ALTER COLUMN "cart_id" SET NOT NULL;

DROP TABLE IF EXISTS "business_document_sequences";

COMMIT;
