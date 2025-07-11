-- Comprehensive fix for storage and URL issues
-- This script ensures all URL fields contain only URLs, not large data

-- 1. Fix the pdf_url column that contains massive data
UPDATE memory_books 
SET pdf_url = NULL
WHERE LENGTH(pdf_url) > 1000; -- Clear any oversized URLs

-- 2. Check for other oversized URL fields
SELECT 
  'pdf_url' as field_name,
  COUNT(*) as oversized_count,
  MAX(LENGTH(pdf_url)) as max_length
FROM memory_books 
WHERE LENGTH(pdf_url) > 1000
UNION ALL
SELECT 
  'background_url' as field_name,
  COUNT(*) as oversized_count,
  MAX(LENGTH(background_url)) as max_length
FROM memory_books 
WHERE LENGTH(background_url) > 1000
UNION ALL
SELECT 
  'storage_url' as field_name,
  COUNT(*) as oversized_count,
  MAX(LENGTH(storage_url)) as max_length
FROM assets 
WHERE LENGTH(storage_url) > 1000;

-- 3. Clear any oversized background_url data
UPDATE memory_books 
SET background_url = NULL
WHERE LENGTH(background_url) > 1000;

-- 4. Clear any oversized storage_url data in assets
UPDATE assets 
SET storage_url = NULL
WHERE LENGTH(storage_url) > 1000;

-- 5. Add constraints to prevent future oversized URLs
-- (These will be added to the schema.sql file)

-- 6. Verify the fixes
SELECT 
  'memory_books' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN LENGTH(pdf_url) > 1000 THEN 1 END) as oversized_pdf_url,
  COUNT(CASE WHEN LENGTH(background_url) > 1000 THEN 1 END) as oversized_background_url
FROM memory_books
UNION ALL
SELECT 
  'assets' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN LENGTH(storage_url) > 1000 THEN 1 END) as oversized_storage_url,
  0 as oversized_background_url
FROM assets;

-- 7. Test query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM memory_books 
WHERE user_id = '9429abe0-9af6-442a-a1de-b74537badbcf' 
  AND deleted = false; 