-- Migration: Rename theme field to theme_id and update "classic" values to null
-- Description: Changes the theme field name to better represent its purpose as a foreign key reference

-- First, update existing "classic" values to null since we're changing the logic
UPDATE memory_books 
SET theme = NULL 
WHERE theme = 'classic' OR theme = '';

-- Rename the column from theme to theme_id
ALTER TABLE memory_books 
RENAME COLUMN theme TO theme_id;

-- Add a comment to clarify the purpose
COMMENT ON COLUMN memory_books.theme_id IS 'Foreign key reference to themes table. NULL means no theme selected (default behavior).';

-- Update the index to reflect the new column name
DROP INDEX IF EXISTS idx_memory_books_theme;
CREATE INDEX IF NOT EXISTS idx_memory_books_theme_id ON memory_books(theme_id);

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Renamed theme column to theme_id and updated "classic" values to NULL';
END $$; 