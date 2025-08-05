-- Update output field constraint from PNG to JPG
-- This script updates the memory_books table to allow JPG instead of PNG

-- Drop the existing check constraint
ALTER TABLE memory_books 
DROP CONSTRAINT IF EXISTS memory_books_output_check;

-- Add the new check constraint for JPG
ALTER TABLE memory_books 
ADD CONSTRAINT memory_books_output_check 
CHECK (output IN ('PDF', 'JPG'));

-- Update any existing PNG values to JPG (if any exist)
UPDATE memory_books 
SET output = 'JPG' 
WHERE output = 'PNG';

-- Update the comment to reflect JPG
COMMENT ON COLUMN memory_books.output IS 'Output format for memory books: PDF or JPG';

-- Verify the change
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'memory_books' AND column_name = 'output'; 