-- Add face detection caching fields to assets table
-- This migration adds support for caching AWS Rekognition face detection results

-- Add face detection caching columns if they don't exist
DO $$
BEGIN
  -- Add face_detection_data column to store the complete face detection results
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'assets' 
      AND column_name = 'face_detection_data'
  ) THEN
    ALTER TABLE assets ADD COLUMN face_detection_data jsonb DEFAULT NULL;
  END IF;

  -- Add face_detection_provider column to track which service was used
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'assets' 
      AND column_name = 'face_detection_provider'
  ) THEN
    ALTER TABLE assets ADD COLUMN face_detection_provider text DEFAULT NULL;
  END IF;

  -- Add face_detection_processed_at column for cache invalidation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'assets' 
      AND column_name = 'face_detection_processed_at'
  ) THEN
    ALTER TABLE assets ADD COLUMN face_detection_processed_at timestamp with time zone DEFAULT NULL;
  END IF;
END $$;

-- Add index for efficient face detection queries
CREATE INDEX IF NOT EXISTS idx_assets_face_detection 
ON assets(face_detection_processed_at) 
WHERE face_detection_data IS NOT NULL;

-- Add comment to document the face detection caching system
COMMENT ON COLUMN assets.face_detection_data IS 'Cached results from AWS Rekognition or OpenAI face detection';
COMMENT ON COLUMN assets.face_detection_provider IS 'Service used for face detection: aws_rekognition or openai_vision';
COMMENT ON COLUMN assets.face_detection_processed_at IS 'Timestamp when face detection was last processed';
