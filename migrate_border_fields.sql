-- Migration script to add border fields to themes table
-- Run this against your Supabase database

-- Add photo_border column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'photo_border'
  ) THEN
    ALTER TABLE themes ADD COLUMN photo_border integer DEFAULT 0;
  END IF;
END $$;

-- Add page_border column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'page_border'
  ) THEN
    ALTER TABLE themes ADD COLUMN page_border integer DEFAULT 0;
  END IF;
END $$;

-- Add page_border_offset column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'page_border_offset'
  ) THEN
    ALTER TABLE themes ADD COLUMN page_border_offset integer DEFAULT 5;
  END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'themes' 
  AND column_name IN ('photo_border', 'page_border', 'page_border_offset'); 