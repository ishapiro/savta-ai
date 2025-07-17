-- Migration: Add photo orientation fields to assets table
-- This will help optimize photo selection for different layouts

-- Add orientation fields to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS width integer,
ADD COLUMN IF NOT EXISTS height integer,
ADD COLUMN IF NOT EXISTS orientation text CHECK (orientation IN ('portrait', 'landscape', 'square'));

-- Create index for orientation queries
CREATE INDEX IF NOT EXISTS idx_assets_orientation ON assets(orientation);

-- Create index for width/height queries
CREATE INDEX IF NOT EXISTS idx_assets_dimensions ON assets(width, height);

-- Add comment explaining the fields
COMMENT ON COLUMN assets.width IS 'Width of the photo in pixels';
COMMENT ON COLUMN assets.height IS 'Height of the photo in pixels';
COMMENT ON COLUMN assets.orientation IS 'Photo orientation: portrait (height > width), landscape (width > height), or square (width = height)'; 