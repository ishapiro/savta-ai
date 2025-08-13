-- Test queries for memory_books table
-- Run these in your Supabase SQL editor or database client

-- 1. Check if memory_shape column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'memory_books' 
    AND column_name = 'memory_shape';

-- 2. Check current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'memory_books'
ORDER BY ordinal_position;

-- 3. Check if there are any memory_books records
SELECT 
    id,
    title,
    status,
    created_at,
    user_id
FROM memory_books 
LIMIT 5;

-- 4. Check for any records that might have memory_shape issues
SELECT 
    id,
    title,
    status,
    created_at,
    user_id,
    -- Try to select memory_shape (will fail if column doesn't exist)
    memory_shape
FROM memory_books 
LIMIT 3;

-- 5. If memory_shape column doesn't exist, add it manually:
-- ALTER TABLE memory_books 
-- ADD COLUMN memory_shape text default 'original' check (memory_shape in ('round', 'oval', 'original'));

-- 6. Update existing records (run after adding column):
-- UPDATE memory_books 
-- SET memory_shape = 'original' 
-- WHERE memory_shape IS NULL; 