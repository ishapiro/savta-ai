-- Fix face_vector column to allow NULL values for fallback faces
-- This is needed because fallback faces don't have vectors

-- Drop the NOT NULL constraint on face_vector
ALTER TABLE faces 
ALTER COLUMN face_vector DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON COLUMN faces.face_vector IS 'Vector representation of face (NULL for fallback faces without AWS indexing)';
