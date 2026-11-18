-- Validación SOLO LECTURA/ROLLBACK del UPDATE corregido (no persiste DDL).
-- No usar para apply. No contiene COMMIT de trabajo.
BEGIN;

-- Smoke: el statement parsea y ejecuta (0 filas típico)
UPDATE "sale_items" si
SET "business_product_id" = bp."id"
FROM "sales" s
JOIN "business_products" bp
  ON bp."business_id" = s."business_id"
 AND bp."deleted_at" IS NULL
WHERE si."sale_id" = s."id"
  AND bp."product_id" = si."product_id"
  AND si."business_product_id" IS NULL;

SELECT 'update_sale_items_bp_ok' AS check, 'passed' AS value;

ROLLBACK;
