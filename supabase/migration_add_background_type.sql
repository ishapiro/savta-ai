-- Migration to add background_type field to memory_books table
-- This migration is safe to run multiple times

-- Add background_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'background_type'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN background_type text DEFAULT 'white' CHECK (background_type in ('white', 'magical'));
    RAISE NOTICE 'Added background_type column to memory_books table';
  ELSE
    RAISE NOTICE 'background_type column already exists in memory_books table';
  END IF;
END $$;

-- Update existing magic memory books to have 'magical' background type
UPDATE memory_books 
SET background_type = 'magical' 
WHERE layout_type = 'magic' AND background_type = 'white';

-- Update existing non-magic books to have 'white' background type (default)
UPDATE memory_books 
SET background_type = 'white' 
WHERE layout_type != 'magic' AND background_type IS NULL;

-- Log the migration
INSERT INTO activity_log (action, details) 
VALUES ('migration', jsonb_build_object('migration', 'add_background_type', 'timestamp', now()::text)); 