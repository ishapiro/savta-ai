-- Simple migration to update memory_shape constraint
-- Run this in your Supabase SQL editor

-- Step 1: Update existing data
UPDATE memory_books 
SET memory_shape = 'magic' 
WHERE memory_shape IN ('round', 'oval');

-- Step 2: Drop the old constraint (this will show the actual constraint name)
-- First, let's see what the constraint is actually called:
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'memory_books'::regclass 
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%memory_shape%';

-- Step 3: After you see the constraint name above, run this with the actual name:
-- ALTER TABLE memory_books DROP CONSTRAINT [CONSTRAINT_NAME_FROM_STEP_2];

-- Step 4: Add the new constraint
ALTER TABLE memory_books 
ADD CONSTRAINT memory_books_memory_shape_check 
CHECK (memory_shape IN ('original', 'magic'));

-- Step 5: Verify the changes
SELECT DISTINCT memory_shape FROM memory_books; 