-- Migration: Transition to AWS Rekognition Collections API
-- Date: 2025-10-22
-- Description: Remove local vector storage and use full Rekognition Collections with IndexFaces/SearchFaces

-- Step 1: Backup existing data
CREATE TABLE IF NOT EXISTS faces_backup AS SELECT * FROM faces WHERE deleted = false;

-- Step 2: Drop pgvector extension and related indexes
DROP INDEX IF EXISTS idx_faces_face_vector;
DROP EXTENSION IF EXISTS vector CASCADE;

-- Step 3: Alter faces table - remove obsolete columns
ALTER TABLE faces DROP COLUMN IF EXISTS face_vector;
ALTER TABLE faces DROP COLUMN IF EXISTS is_fallback;
ALTER TABLE faces DROP COLUMN IF EXISTS age_range;
ALTER TABLE faces DROP COLUMN IF EXISTS gender;
ALTER TABLE faces DROP COLUMN IF EXISTS emotions;
ALTER TABLE faces DROP COLUMN IF EXISTS pose;
ALTER TABLE faces DROP COLUMN IF EXISTS quality;
ALTER TABLE faces DROP COLUMN IF EXISTS landmarks;

-- Step 4: Rename and add new columns to faces table
ALTER TABLE faces RENAME COLUMN aws_face_id TO rekognition_face_id;
ALTER TABLE faces ADD COLUMN IF NOT EXISTS rekognition_image_id TEXT;
ALTER TABLE faces ADD COLUMN IF NOT EXISTS needs_assignment BOOLEAN DEFAULT true;
ALTER TABLE faces ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT false;

-- Step 5: Alter face_collections table
ALTER TABLE face_collections DROP COLUMN IF EXISTS is_fallback;
ALTER TABLE face_collections ADD COLUMN IF NOT EXISTS rekognition_arn TEXT;
ALTER TABLE face_collections ADD COLUMN IF NOT EXISTS face_count INTEGER DEFAULT 0;
ALTER TABLE face_collections ADD COLUMN IF NOT EXISTS last_indexed_at TIMESTAMP WITH TIME ZONE;

-- Step 6: Drop face_similarities table (no longer needed)
DROP TABLE IF EXISTS face_similarities CASCADE;

-- Step 7: Clear existing faces (will be re-indexed via Rekognition Collections)
DELETE FROM face_person_links WHERE deleted = false;
DELETE FROM faces;

-- Step 8: Add comments for new columns
COMMENT ON COLUMN faces.rekognition_face_id IS 'FaceId returned by AWS Rekognition IndexFaces';
COMMENT ON COLUMN faces.rekognition_image_id IS 'External image ID used in IndexFaces (typically asset_id)';
COMMENT ON COLUMN faces.needs_assignment IS 'Face detected but not yet assigned to a person by user';
COMMENT ON COLUMN faces.auto_assigned IS 'Face was automatically assigned based on high similarity match';
COMMENT ON COLUMN face_collections.rekognition_arn IS 'Full ARN of the AWS Rekognition collection';
COMMENT ON COLUMN face_collections.face_count IS 'Number of faces currently indexed in the collection';
COMMENT ON COLUMN face_collections.last_indexed_at IS 'Timestamp of most recent IndexFaces operation';

SELECT 'Migration to Rekognition Collections completed successfully' AS status;

