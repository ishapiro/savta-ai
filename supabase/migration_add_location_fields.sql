-- Migration: Add location fields to assets table
-- This will store GPS coordinates and city names from photo metadata

-- Add location fields to assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS zip_code text;

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_assets_city ON assets(city);
CREATE INDEX IF NOT EXISTS idx_assets_state ON assets(state);
CREATE INDEX IF NOT EXISTS idx_assets_country ON assets(country);
CREATE INDEX IF NOT EXISTS idx_assets_location ON assets(location);

-- Add comment explaining the fields
COMMENT ON COLUMN assets.location IS 'GPS coordinates in format "latitude,longitude"';
COMMENT ON COLUMN assets.city IS 'City name extracted from GPS coordinates via geocoding';
COMMENT ON COLUMN assets.state IS 'State/province name extracted from GPS coordinates';
COMMENT ON COLUMN assets.country IS 'Country name extracted from GPS coordinates';
COMMENT ON COLUMN assets.zip_code IS 'Postal/ZIP code extracted from GPS coordinates'; 