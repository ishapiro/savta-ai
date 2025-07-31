-- Update output field constraint from JPG to PNG
-- This script updates the memory_books table to allow PNG instead of JPG

-- Drop the existing check constraint
ALTER TABLE memory_books 
DROP CONSTRAINT IF EXISTS memory_books_output_check;

-- Add the new check constraint for PNG
ALTER TABLE memory_books 
ADD CONSTRAINT memory_books_output_check 
CHECK (output IN ('PDF', 'PNG'));

-- Update any existing JPG values to PNG (if any exist)
UPDATE memory_books 
SET output = 'PNG' 
WHERE output = 'JPG';

-- Update the comment to reflect PNG
COMMENT ON COLUMN memory_books.output IS 'Output format for memory books: PDF or PNG';

-- Verify the change
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'memory_books' AND column_name = 'output'; 