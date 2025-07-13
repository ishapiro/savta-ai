-- Migration to update memory_shape constraint
-- Change from ('round', 'oval', 'original') to ('original', 'magic')

-- First, let's see what constraints exist
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'memory_books'::regclass 
AND contype = 'c';

-- Update any existing 'round' or 'oval' values to 'magic'
UPDATE memory_books 
SET memory_shape = 'magic' 
WHERE memory_shape IN ('round', 'oval');

-- Drop ALL possible constraint names that might exist
ALTER TABLE memory_books 
DROP CONSTRAINT IF EXISTS memory_books_memory_shape_check;

ALTER TABLE memory_books 
DROP CONSTRAINT IF EXISTS memory_shape_check;

-- Also try to drop any constraint that checks memory_shape
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop any constraint that checks memory_shape
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'memory_books'::regclass 
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%memory_shape%'
    LOOP
        EXECUTE 'ALTER TABLE memory_books DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- Add the new constraint
ALTER TABLE memory_books 
ADD CONSTRAINT memory_books_memory_shape_check 
CHECK (memory_shape IN ('original', 'magic'));

-- Update the default value to ensure it's 'original'
ALTER TABLE memory_books 
ALTER COLUMN memory_shape SET DEFAULT 'original';

-- Verify the changes
SELECT DISTINCT memory_shape FROM memory_books;

-- Show the final constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'memory_books'::regclass 
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%memory_shape%'; 