-- Add output field to memory_books table
-- This script adds an 'output' field to the memory_books table with default 'PDF' and constraint for 'PDF' or 'JPG' values

-- Add the output column to the memory_books table
ALTER TABLE memory_books 
ADD COLUMN IF NOT EXISTS output text DEFAULT 'PDF' CHECK (output IN ('PDF', 'JPG'));

-- Update existing records to have the default value
UPDATE memory_books 
SET output = 'PDF' 
WHERE output IS NULL;

-- Add a comment to document the field
COMMENT ON COLUMN memory_books.output IS 'Output format for memory books: PDF or JPG';

-- Verify the change by checking the table structure
-- You can run this query to verify the column was added:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'memory_books' AND column_name = 'output';