-- Migration: Update memory_shape constraint to include 'rounded' and set default to 'rounded'
-- Date: 2024-12-19
-- Description: Updates memory_books table to support 'rounded' memory shape and set it as default

-- 1. Update memory_shape constraint to include 'rounded'
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'memory_books'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%memory_shape%'
  ) THEN
    -- Find the actual constraint name
    DECLARE
      constraint_name text;
    BEGIN
      SELECT conname INTO constraint_name
      FROM pg_constraint
      WHERE conrelid = 'memory_books'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%memory_shape%';
      
      IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE memory_books DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped existing memory_shape constraint: %', constraint_name;
      END IF;
    END;
  END IF;
  
  -- Add new constraint with 'rounded' option
  ALTER TABLE memory_books ADD CONSTRAINT memory_books_memory_shape_check 
    CHECK (memory_shape in ('original', 'magic', 'rounded'));
  
  RAISE NOTICE 'Added new memory_shape constraint with rounded option';
END $$;

-- 2. Update default value to 'rounded'
ALTER TABLE memory_books ALTER COLUMN memory_shape SET DEFAULT 'rounded';

-- 3. Update existing records that have 'original' to 'rounded' (optional)
-- This ensures existing magic memory books get the rounded shape
UPDATE memory_books 
SET memory_shape = 'rounded' 
WHERE memory_shape = 'original' 
AND layout_type = 'magic';

-- 4. Add comment to document the change
COMMENT ON COLUMN memory_books.memory_shape IS 'Shape for memory photos: original, magic, or rounded. Defaults to rounded.';

-- 5. Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'memory_books' 
  AND column_name = 'memory_shape';

-- 6. Show the constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'memory_books'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%memory_shape%';

-- 7. Show updated records
SELECT 
  layout_type,
  memory_shape,
  count(*) as record_count
FROM memory_books 
GROUP BY layout_type, memory_shape
ORDER BY layout_type, memory_shape; 