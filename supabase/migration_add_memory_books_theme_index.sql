-- Migration to add index for theme field in memory_books table
-- This migration adds an index for the theme field to improve query performance

-- Add index for theme field
CREATE INDEX IF NOT EXISTS idx_memory_books_theme ON memory_books(theme);

-- Add foreign key constraint from memory_books.theme to themes.id (optional, for referential integrity)
-- Note: This is commented out as it might cause issues if there are existing records
-- ALTER TABLE memory_books ADD CONSTRAINT fk_memory_books_theme 
--   FOREIGN KEY (theme) REFERENCES themes(id);

-- Log the migration
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed: Added index for theme field in memory_books table';
END $$; 