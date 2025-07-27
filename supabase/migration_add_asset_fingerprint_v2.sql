-- Migration: Add fingerprint field to assets table for AI duplicate detection
-- This allows the AI to ensure the same asset is not repeated twice in a card
-- Version 2: Comprehensive migration with proper error handling

-- Check if the fingerprint column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assets' 
    AND column_name = 'fingerprint'
  ) THEN
    -- Add fingerprint column to assets table
    ALTER TABLE assets ADD COLUMN fingerprint text;
    RAISE NOTICE 'Added fingerprint column to assets table';
  ELSE
    RAISE NOTICE 'Fingerprint column already exists in assets table';
  END IF;
END $$;

-- Create index on fingerprint for efficient lookups (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_assets_fingerprint'
  ) THEN
    CREATE INDEX idx_assets_fingerprint ON assets(fingerprint);
    RAISE NOTICE 'Created fingerprint index on assets table';
  ELSE
    RAISE NOTICE 'Fingerprint index already exists on assets table';
  END IF;
END $$;

-- Add comment explaining the fingerprint field
COMMENT ON COLUMN assets.fingerprint IS 'Unique identifier for AI to detect duplicate assets in memory cards';

-- Verify the migration
SELECT 
  'Migration completed successfully' as status,
  (SELECT COUNT(*) FROM assets WHERE fingerprint IS NULL) as assets_without_fingerprints,
  (SELECT COUNT(*) FROM assets WHERE fingerprint IS NOT NULL) as assets_with_fingerprints,
  (SELECT COUNT(*) FROM assets) as total_assets; 