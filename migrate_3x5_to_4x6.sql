-- Migration script to change from 3x5 to 4x6 as default
-- This script updates existing data and adds new size options

-- First, update existing memory_books that use 3x5 to use 4x6
UPDATE memory_books 
SET print_size = '4x6' 
WHERE print_size = '3x5';

-- Update existing themes that use 3x5 to use 4x6
UPDATE themes 
SET size = '4x6' 
WHERE size = '3x5';

-- Now we need to update the constraints to allow 4x6 and 6x4
-- First, drop the existing constraints
ALTER TABLE memory_books DROP CONSTRAINT IF EXISTS memory_books_print_size_check;
ALTER TABLE themes DROP CONSTRAINT IF EXISTS themes_size_check;

-- Add the new constraints with 4x6 and 6x4 included
ALTER TABLE memory_books 
ADD CONSTRAINT memory_books_print_size_check 
CHECK (print_size IN ('4x6', '6x4', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12'));

ALTER TABLE themes 
ADD CONSTRAINT themes_size_check 
CHECK (size IN ('4x6', '6x4', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12'));

-- Update the default values
ALTER TABLE memory_books ALTER COLUMN print_size SET DEFAULT '4x6';
ALTER TABLE themes ALTER COLUMN size SET DEFAULT '4x6';

-- Verify the changes
SELECT 'Memory books updated:' as info, COUNT(*) as count FROM memory_books WHERE print_size = '4x6';
SELECT 'Themes updated:' as info, COUNT(*) as count FROM themes WHERE size = '4x6'; 