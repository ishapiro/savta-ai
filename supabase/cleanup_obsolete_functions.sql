-- Cleanup Obsolete Database Functions
-- Part of AWS Rekognition Collections migration
-- 
-- This migration removes database functions that are no longer used after
-- migrating to AWS Rekognition Collections system.
-- 
-- Removed functions:
-- 1. find_similar_faces() - Replaced by AWS Rekognition SearchFaces API
-- 2. find_unassigned_faces() - Replaced by /api/ai/unassigned-faces endpoint
--
-- Safe to run multiple times (uses IF EXISTS)

-- Drop find_similar_faces function (used local vector comparison)
DROP FUNCTION IF EXISTS find_similar_faces(UUID, DECIMAL, INTEGER);

-- Drop find_unassigned_faces function (replaced by API endpoint)
DROP FUNCTION IF EXISTS find_unassigned_faces(UUID, INTEGER);

-- Verify cleanup
DO $$
BEGIN
    RAISE NOTICE 'Cleanup complete. Obsolete functions removed.';
END $$;

