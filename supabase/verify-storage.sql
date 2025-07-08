-- Verify storage bucket setup
-- This script checks if the 'assets' bucket exists and provides setup instructions

-- Check if bucket exists (this will fail if bucket doesn't exist)
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'assets';

-- If the above query fails, you need to create the bucket manually:
-- 
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "Create a new bucket"
-- 3. Name: assets
-- 4. Check "Public bucket" 
-- 5. Click "Create bucket"
-- 6. Then run the storage.sql script for policies

-- After creating the bucket, run:
-- \i supabase/storage.sql 