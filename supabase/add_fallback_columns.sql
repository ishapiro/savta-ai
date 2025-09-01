-- Add fallback columns to face recognition tables
-- This allows the system to work even when AWS Rekognition permissions are limited

-- Add is_fallback column to face_collections table
ALTER TABLE face_collections 
ADD COLUMN IF NOT EXISTS is_fallback BOOLEAN DEFAULT FALSE;

-- Add is_fallback column to faces table
ALTER TABLE faces 
ADD COLUMN IF NOT EXISTS is_fallback BOOLEAN DEFAULT FALSE;

-- Add comment to explain the fallback functionality
COMMENT ON COLUMN face_collections.is_fallback IS 'Indicates if this collection uses fallback mode (no AWS Rekognition indexing)';
COMMENT ON COLUMN faces.is_fallback IS 'Indicates if this face was stored using fallback mode (no AWS Rekognition indexing)';

-- Update RLS policies to include the new columns
DROP POLICY IF EXISTS "Users can view their own face collections" ON face_collections;
CREATE POLICY "Users can view their own face collections" ON face_collections
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own face collections" ON face_collections;
CREATE POLICY "Users can insert their own face collections" ON face_collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own face collections" ON face_collections;
CREATE POLICY "Users can update their own face collections" ON face_collections
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own faces" ON faces;
CREATE POLICY "Users can view their own faces" ON faces
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own faces" ON faces;
CREATE POLICY "Users can insert their own faces" ON faces
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own faces" ON faces;
CREATE POLICY "Users can update their own faces" ON faces
    FOR UPDATE USING (auth.uid() = user_id);
