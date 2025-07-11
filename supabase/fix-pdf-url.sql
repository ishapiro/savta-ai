-- Fix the pdf_url column that contains massive data
-- This will clear the oversized pdf_url and set it to a proper format

-- First, let's see what's in the pdf_url column
SELECT 
  id,
  LENGTH(pdf_url) as url_length,
  LEFT(pdf_url, 100) as url_preview
FROM memory_books 
WHERE user_id = '9429abe0-9af6-442a-a1de-b74537badbcf' 
  AND deleted = false;

-- Clear the oversized pdf_url data
UPDATE memory_books 
SET pdf_url = NULL
WHERE user_id = '9429abe0-9af6-442a-a1de-b74537badbcf' 
  AND deleted = false
  AND LENGTH(pdf_url) > 1000; -- Only clear very large URLs

-- Verify the fix
SELECT 
  id,
  LENGTH(pdf_url) as url_length,
  LEFT(pdf_url, 100) as url_preview
FROM memory_books 
WHERE user_id = '9429abe0-9af6-442a-a1de-b74537badbcf' 
  AND deleted = false;

-- Test the query performance after the fix
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM memory_books 
WHERE user_id = '9429abe0-9af6-442a-a1de-b74537badbcf' 
  AND deleted = false; 