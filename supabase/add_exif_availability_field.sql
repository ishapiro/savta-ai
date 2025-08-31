-- Add EXIF availability field to assets table
-- This field indicates if EXIF data (including GPS coordinates) was available for the asset

-- Add has_exif_data column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'assets' 
      AND column_name = 'has_exif_data'
  ) THEN
    ALTER TABLE assets ADD COLUMN has_exif_data boolean DEFAULT false;
  END IF;
END $$;

-- Add index for efficient EXIF data queries
CREATE INDEX IF NOT EXISTS idx_assets_has_exif_data ON assets(has_exif_data);

-- Add comment to document the EXIF availability field
COMMENT ON COLUMN assets.has_exif_data IS 'Indicates if EXIF metadata (including GPS coordinates) was available in the original photo';
