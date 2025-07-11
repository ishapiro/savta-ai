-- Comprehensive fix for storage and URL issues (corrected version)
-- This script ensures all URL fields contain only URLs, not large data

-- 1. Fix the pdf_url column that contains massive data
UPDATE memory_books 
SET pdf_url = NULL
WHERE LENGTH(pdf_url) > 1000; -- Clear any oversized URLs

-- 2. Check for oversized URL fields (only check columns that exist)
SELECT 
  'pdf_url' as field_name,
  COUNT(*) as oversized_count,
  MAX(LENGTH(pdf_url)) as max_length
FROM memory_books 
WHERE LENGTH(pdf_url) > 1000;

-- 3. Check if background_url column exists and clear oversized data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'background_url'
  ) THEN
    -- Clear any oversized background_url data
    EXECUTE 'UPDATE memory_books SET background_url = NULL WHERE LENGTH(background_url) > 1000';
    
    -- Report on background_url
    EXECUTE 'SELECT ''background_url'' as field_name, COUNT(*) as oversized_count, MAX(LENGTH(background_url)) as max_length FROM memory_books WHERE LENGTH(background_url) > 1000';
  ELSE
    RAISE NOTICE 'background_url column does not exist in memory_books table';
  END IF;
END $$;

-- 4. Clear any oversized storage_url data in assets
UPDATE assets 
SET storage_url = NULL
WHERE LENGTH(storage_url) > 1000;

-- 5. Verify the fixes
SELECT 
  'memory_books' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN LENGTH(pdf_url) > 1000 THEN 1 END) as oversized_pdf_url
FROM memory_books
UNION ALL
SELECT 
  'assets' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN LENGTH(storage_url) > 1000 THEN 1 END) as oversized_storage_url
FROM assets;

-- 6. Test query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM memory_books 
WHERE user_id = '9429abe0-9af6-442a-a1de-b74537badbcf' 
  AND deleted = false; 