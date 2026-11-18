-- P2-C1.B1 premigration audit (READ ONLY) — Docker local only
\echo '=== SERVER / DB ==='
SELECT current_database() AS db, current_user AS usr,
       inet_server_addr()::text AS server_addr,
       inet_client_addr()::text AS client_addr,
       version() AS version;

\echo '=== MIGRATIONS APPLIED ==='
SELECT migration_name, finished_at::text, applied_steps_count
FROM _prisma_migrations
ORDER BY finished_at NULLS LAST, migration_name;

\echo '=== PRECHECK BUNDLE ==='
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
SELECT 'enum_sale_complete', CASE WHEN EXISTS (
  SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
  WHERE t.typname = 'SyncOperationType' AND e.enumlabel = 'SALE_COMPLETE'
) THEN 'yes' ELSE 'no' END
UNION ALL
SELECT 'enum_sale_create_already', CASE WHEN EXISTS (
  SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
  WHERE t.typname = 'SyncOperationType' AND e.enumlabel = 'SALE_CREATE'
) THEN 'yes' ELSE 'no' END;

\echo '=== EXTENDED COUNTS ==='
SELECT 'users' AS metric, COUNT(*)::text AS value FROM users
UNION ALL SELECT 'products', COUNT(*)::text FROM products
UNION ALL SELECT 'business_products', COUNT(*)::text FROM business_products
UNION ALL SELECT 'sale_items', COUNT(*)::text FROM sale_items
UNION ALL SELECT 'carts', COUNT(*)::text FROM carts
UNION ALL SELECT 'cash_open', COUNT(*)::text FROM cash_registers WHERE status='OPEN' AND deleted_at IS NULL
UNION ALL SELECT 'cash_closed', COUNT(*)::text FROM cash_registers WHERE status='CLOSED'
UNION ALL SELECT 'sales_null_invoice', COUNT(*)::text FROM sales WHERE invoice_number IS NULL
UNION ALL SELECT 'sales_null_cart', COUNT(*)::text FROM sales WHERE cart_id IS NULL
UNION ALL SELECT 'bp_active', COUNT(*)::text FROM business_products WHERE deleted_at IS NULL
UNION ALL SELECT 'bp_deleted', COUNT(*)::text FROM business_products WHERE deleted_at IS NOT NULL;

\echo '=== DUP INVOICE DETAIL ==='
SELECT invoice_number, COUNT(*) AS cnt
FROM sales WHERE invoice_number IS NOT NULL
GROUP BY invoice_number HAVING COUNT(*) > 1
ORDER BY cnt DESC LIMIT 20;

\echo '=== DUP REGISTER_NUMBER GLOBAL ==='
SELECT register_number, COUNT(*) AS cnt
FROM cash_registers
GROUP BY register_number HAVING COUNT(*) > 1
ORDER BY cnt DESC LIMIT 20;

\echo '=== DUP REGISTER_NUMBER PER BUSINESS ==='
SELECT business_id, register_number, COUNT(*) AS cnt
FROM cash_registers
GROUP BY business_id, register_number HAVING COUNT(*) > 1;

\echo '=== OPEN CASH DETAIL ==='
SELECT id, business_id, user_id, register_number, status, deleted_at, opening_date
FROM cash_registers
WHERE status = 'OPEN' AND deleted_at IS NULL
ORDER BY business_id, user_id, id;

\echo '=== OPEN COLLISION RISK (legacy-unknown backfill) ==='
SELECT business_id, user_id, COUNT(*) AS open_cnt, array_agg(id ORDER BY id) AS register_ids
FROM cash_registers
WHERE status = 'OPEN' AND deleted_at IS NULL
GROUP BY business_id, user_id
HAVING COUNT(*) > 1;

\echo '=== ORPHAN FKs ==='
SELECT 'sales_orphan_business' AS k, COUNT(*)::text AS value FROM sales s LEFT JOIN businesses b ON b.id=s.business_id WHERE b.id IS NULL
UNION ALL SELECT 'sales_orphan_user', COUNT(*)::text FROM sales s LEFT JOIN users u ON u.id=s.user_id WHERE u.id IS NULL
UNION ALL SELECT 'sales_orphan_cart', COUNT(*)::text FROM sales s LEFT JOIN carts c ON c.id=s.cart_id WHERE s.cart_id IS NOT NULL AND c.id IS NULL
UNION ALL SELECT 'sales_orphan_cash', COUNT(*)::text FROM sales s LEFT JOIN cash_registers cr ON cr.id=s."cashRegisterId" WHERE s."cashRegisterId" IS NOT NULL AND cr.id IS NULL
UNION ALL SELECT 'si_orphan_sale', COUNT(*)::text FROM sale_items si LEFT JOIN sales s ON s.id=si.sale_id WHERE s.id IS NULL
UNION ALL SELECT 'si_orphan_product', COUNT(*)::text FROM sale_items si LEFT JOIN products p ON p.id=si.product_id WHERE p.id IS NULL
UNION ALL SELECT 'cr_orphan_business', COUNT(*)::text FROM cash_registers cr LEFT JOIN businesses b ON b.id=cr.business_id WHERE b.id IS NULL
UNION ALL SELECT 'cr_orphan_user', COUNT(*)::text FROM cash_registers cr LEFT JOIN users u ON u.id=cr.user_id WHERE u.id IS NULL
UNION ALL SELECT 'si_missing_bp_join', COUNT(*)::text
FROM sale_items si
JOIN sales s ON s.id = si.sale_id
LEFT JOIN business_products bp ON bp.business_id = s.business_id AND bp.product_id = si.product_id AND bp.deleted_at IS NULL
WHERE bp.id IS NULL;

\echo '=== CURRENT INDEXES sales/cash/sale_items ==='
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname='public' AND tablename IN ('sales','sale_items','cash_registers')
ORDER BY tablename, indexname;

\echo '=== COLUMN NULLABILITY KEY COLS ==='
SELECT table_name, column_name, is_nullable, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_schema='public' AND table_name IN ('sales','sale_items','cash_registers')
  AND column_name IN ('cart_id','invoice_number','commercial_number','document_kind','is_fiscal','client_operation_id','device_id','product_name','sku','business_product_id','version','register_number')
ORDER BY table_name, column_name;

\echo '=== BP 1-4 INTEGRITY ==='
SELECT bp.id, bp.business_id, bp.product_id, bp.deleted_at IS NOT NULL AS soft_deleted,
       p.id AS product_exists, p.name
FROM business_products bp
LEFT JOIN products p ON p.id = bp.product_id
WHERE bp.id BETWEEN 1 AND 4
ORDER BY bp.id;

\echo '=== BP 118/200 RESIDUE (read-only, do not modify) ==='
SELECT id, business_id, product_id, deleted_at
FROM business_products
WHERE id IN (118, 200)
ORDER BY id;

\echo '=== PROPOSAL OBJECTS ALREADY PRESENT? ==='
SELECT 'business_document_sequences' AS obj, COALESCE(to_regclass('public.business_document_sequences')::text, 'ABSENT') AS present
UNION ALL SELECT 'cash_movements', COALESCE(to_regclass('public.cash_movements')::text, 'ABSENT')
UNION ALL SELECT 'CashMovementType', COALESCE((SELECT typname FROM pg_type WHERE typname='CashMovementType'), 'ABSENT')
UNION ALL SELECT 'col_commercial_number', COALESCE((
  SELECT column_name FROM information_schema.columns
  WHERE table_name='sales' AND column_name='commercial_number' LIMIT 1
), 'ABSENT')
UNION ALL SELECT 'col_document_kind', COALESCE((
  SELECT column_name FROM information_schema.columns
  WHERE table_name='sales' AND column_name='document_kind' LIMIT 1
), 'ABSENT')
UNION ALL SELECT 'col_cash_device_id', COALESCE((
  SELECT column_name FROM information_schema.columns
  WHERE table_name='cash_registers' AND column_name='device_id' LIMIT 1
), 'ABSENT');

\echo '=== SYNC ENUM LABELS ==='
SELECT e.enumlabel
FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
WHERE t.typname = 'SyncOperationType'
ORDER BY e.enumsortorder;

\echo '=== SAMPLE HISTORICAL INVOICE (top 10) ==='
SELECT id, business_id, invoice_number, cart_id, "cashRegisterId", created_at
FROM sales
ORDER BY id
LIMIT 10;
