-- Migration script to update memory_books default print_size to 8.5x11

-- Update memory_books default to 8.5x11
ALTER TABLE memory_books ALTER COLUMN print_size SET DEFAULT '8.5x11';

-- Verify the changes
SELECT 'Memory books default size:' as info, column_default as default_value 
FROM information_schema.columns 
WHERE table_name = 'memory_books' AND column_name = 'print_size'; 