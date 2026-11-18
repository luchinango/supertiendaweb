-- Post-migración P2-C1.B0.1

SELECT 'seq_covers_businesses' AS check, CASE WHEN (
  (SELECT COUNT(*) FROM businesses) =
  (SELECT COUNT(*) FROM business_document_sequences WHERE doc_type = 'COMMERCIAL_TICKET')
) THEN 'yes' ELSE 'no' END AS value
UNION ALL
SELECT 'commercial_uq_partial', CASE WHEN EXISTS (
  SELECT 1 FROM pg_indexes WHERE indexname = 'sales_business_commercial_number_uq'
) THEN 'yes' ELSE 'no' END
UNION ALL
SELECT 'invoice_uq_partial', CASE WHEN EXISTS (
  SELECT 1 FROM pg_indexes WHERE indexname = 'sales_business_invoice_number_uq'
) THEN 'yes' ELSE 'no' END
UNION ALL
SELECT 'invoice_global_uq_gone', CASE WHEN EXISTS (
  SELECT 1 FROM pg_indexes WHERE indexname = 'sales_invoice_number_key'
) THEN 'STILL_EXISTS' ELSE 'gone' END
UNION ALL
SELECT 'historical_invoice_intact', COUNT(*)::text
FROM sales WHERE invoice_number IS NOT NULL
UNION ALL
SELECT 'historical_commercial_null', COUNT(*)::text
FROM sales WHERE document_kind = 'LEGACY_UNSPECIFIED' AND commercial_number IS NULL
UNION ALL
SELECT 'contradictory_flags', COUNT(*)::text FROM sales
WHERE (is_fiscal = TRUE AND document_kind = 'COMMERCIAL_TICKET')
   OR (is_fiscal = FALSE AND document_kind = 'FISCAL_INVOICE')
UNION ALL
SELECT 'sale_items_missing_name', COUNT(*)::text
FROM sale_items WHERE product_name IS NULL OR product_name = ''
UNION ALL
SELECT 'cash_device_null', COUNT(*)::text FROM cash_registers WHERE device_id IS NULL
UNION ALL
SELECT 'cash_open_partial_uq', CASE WHEN EXISTS (
  SELECT 1 FROM pg_indexes WHERE indexname = 'cash_registers_open_per_device_uq'
) THEN 'yes' ELSE 'no' END
UNION ALL
SELECT 'enum_sale_create', CASE WHEN EXISTS (
  SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
  WHERE t.typname = 'SyncOperationType' AND e.enumlabel = 'SALE_CREATE'
) THEN 'yes' ELSE 'no' END
UNION ALL
SELECT 'opening_movements', COUNT(*)::text
FROM cash_movements WHERE movement_type = 'OPENING';
