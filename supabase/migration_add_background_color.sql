-- Migration: Add background_color field and update background_type constraint
-- Date: 2024-12-19
-- Description: Adds support for solid color backgrounds in memory books

-- 1. Update background_type constraint to include 'solid'
DO $$
BEGIN
  -- Drop existing constraint if it exists
  DECLARE
    constraint_name text;
  BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'memory_books'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%background_type%';
    
    IF constraint_name IS NOT NULL THEN
      EXECUTE 'ALTER TABLE memory_books DROP CONSTRAINT ' || constraint_name;
      RAISE NOTICE 'Dropped existing background_type constraint: %', constraint_name;
    END IF;
  END;
  
  -- Add new constraint with 'solid' option
  ALTER TABLE memory_books ADD CONSTRAINT memory_books_background_type_check 
    CHECK (background_type in ('white', 'magical', 'solid'));
  
  RAISE NOTICE 'Added new background_type constraint with solid option';
END $$;

-- 2. Add background_color column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'background_color'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN background_color text;
    RAISE NOTICE 'Added background_color column to memory_books table';
  ELSE
    RAISE NOTICE 'background_color column already exists in memory_books table';
  END IF;
END $$;

-- 3. Add comment to document the new field
COMMENT ON COLUMN memory_books.background_color IS 'Hex color code for solid background type (e.g., #ff0000 for red)';

-- 4. Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'memory_books' 
  AND column_name IN ('background_type', 'background_color');

-- 5. Show the constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'memory_books'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%background_type%'; 