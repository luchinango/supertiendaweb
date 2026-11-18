-- Pre-migración P2-C1.B0.1 (solo lectura)

SELECT 'sales_count' AS check, COUNT(*)::text AS value FROM sales
UNION ALL
SELECT 'sales_with_invoice', COUNT(*)::text FROM sales WHERE invoice_number IS NOT NULL
UNION ALL
SELECT 'sale_items_orphan_product', COUNT(*)::text
FROM sale_items si LEFT JOIN products p ON p.id = si.product_id WHERE p.id IS NULL
UNION ALL
SELECT 'dup_invoice_global', COUNT(*)::text FROM (
  SELECT invoice_number FROM sales WHERE invoice_number IS NOT NULL
  GROUP BY invoice_number HAVING COUNT(*) > 1
) d
UNION ALL
SELECT 'cash_registers_count', COUNT(*)::text FROM cash_registers
UNION ALL
SELECT 'cash_open_same_user_multi', COUNT(*)::text FROM (
  SELECT business_id, user_id FROM cash_registers
  WHERE status = 'OPEN' AND deleted_at IS NULL
  GROUP BY 1, 2 HAVING COUNT(*) > 1
) d
UNION ALL
SELECT 'businesses', COUNT(*)::text FROM businesses
UNION ALL
SELECT 'fiscal_settings_untouched_note', 'do_not_increment_in_pos'::text
UNION ALL
SELECT 'enum_sale_complete', CASE WHEN EXISTS (
  SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
  WHERE t.typname = 'SyncOperationType' AND e.enumlabel = 'SALE_COMPLETE'
) THEN 'yes' ELSE 'no' END;
