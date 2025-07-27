-- Migration: Add fingerprint field to assets table for AI duplicate detection
-- This allows the AI to ensure the same asset is not repeated twice in a card

-- Add fingerprint column to assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS fingerprint text;

-- Create index on fingerprint for efficient lookups
CREATE INDEX IF NOT EXISTS idx_assets_fingerprint ON assets(fingerprint);

-- Add comment explaining the fingerprint field
COMMENT ON COLUMN assets.fingerprint IS 'Unique identifier for AI to detect duplicate assets in memory cards'; 