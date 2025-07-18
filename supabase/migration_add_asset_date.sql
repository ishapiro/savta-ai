-- Migration: Add asset_date field to assets table
-- This field will store the date when the photo was taken (from EXIF data)

-- Add asset_date column to assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS asset_date timestamp with time zone;

-- Add index for better query performance on asset_date
CREATE INDEX IF NOT EXISTS idx_assets_asset_date ON assets(asset_date);

-- Add comment to document the field
COMMENT ON COLUMN assets.asset_date IS 'Date when the photo was taken (extracted from EXIF data)'; 