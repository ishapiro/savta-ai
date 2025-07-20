-- Migration: Add background_opacity column to memory_books table
-- This adds a background_opacity column with a default value of 30 (30%)

-- Add background_opacity column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'memory_books' 
    AND column_name = 'background_opacity'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN background_opacity integer DEFAULT 30 CHECK (background_opacity >= 0 AND background_opacity <= 100);
  END IF;
END $$;

-- Update existing records to have the default opacity
UPDATE memory_books 
SET background_opacity = 30 
WHERE background_opacity IS NULL; 