-- Run this script in your Supabase SQL Editor to fix the database issues

-- First, run the comprehensive fix
\i fix-database.sql

-- Then verify the setup
SELECT 
  'Profiles table structure:' as info,
  COUNT(*) as total_profiles
FROM profiles;

SELECT 
  'Assets table structure:' as info,
  COUNT(*) as total_assets
FROM assets;

-- Check if storage bucket exists (this will show an error if it doesn't exist)
SELECT 
  'Storage bucket check:' as info,
  COUNT(*) as bucket_count
FROM storage.buckets 
WHERE name = 'assets';

-- Instructions for manual steps:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "Create a new bucket"
-- 3. Name: assets
-- 4. Check "Public bucket"
-- 5. Click "Create bucket"
-- 6. Then run the storage.sql script in the SQL Editor

SELECT 'Manual steps required:' as instruction;
SELECT '1. Create assets bucket in Supabase Dashboard' as step;
SELECT '2. Run storage.sql script' as step;
SELECT '3. Test upload functionality' as step; 