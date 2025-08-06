-- Migration script to update default sizes
-- Themes: 7x5 landscape as default for theme-based books
-- Memory books: 8.5x11 as default for dialog-created books

-- Update themes default to 7x5
ALTER TABLE themes ALTER COLUMN size SET DEFAULT '7x5';

-- Update memory_books default to 8.5x11 for dialog-created books
-- Note: We keep the existing default for backward compatibility
-- The MemoryBookDialog component will set 8.5x11 as default for new books

-- Verify the changes
SELECT 'Themes default size:' as info, column_default as default_value 
FROM information_schema.columns 
WHERE table_name = 'themes' AND column_name = 'size';

SELECT 'Memory books default size:' as info, column_default as default_value 
FROM information_schema.columns 
WHERE table_name = 'memory_books' AND column_name = 'print_size'; 