-- Storage Bucket Setup for Savta AI
-- Run this in your Supabase SQL Editor after creating the buckets manually

-- Note: You must create the buckets manually in the Supabase Dashboard first:
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Create bucket: "assets" (Public bucket)
-- 3. Create bucket: "memory-books" (Public bucket)

-- Storage policies for assets bucket
DROP POLICY IF EXISTS "Users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own assets" ON storage.objects;

-- Allow authenticated users to upload to assets bucket
CREATE POLICY "Users can upload assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to view files in their own folder
CREATE POLICY "Users can view own assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update files in their own folder
CREATE POLICY "Users can update own assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete files in their own folder
CREATE POLICY "Users can delete own assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for memory-books bucket
DROP POLICY IF EXISTS "Users can upload memory books" ON storage.objects;
DROP POLICY IF EXISTS "Users can view memory books" ON storage.objects;
DROP POLICY IF EXISTS "Users can update memory books" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete memory books" ON storage.objects;

-- Allow authenticated users to upload to memory-books bucket
CREATE POLICY "Users can upload memory books" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memory-books' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to view memory book files
CREATE POLICY "Users can view memory books" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'memory-books' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update memory book files
CREATE POLICY "Users can update memory books" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'memory-books' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to delete memory book files
CREATE POLICY "Users can delete memory books" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'memory-books' AND 
    auth.role() = 'authenticated'
  );

-- Verify bucket existence
SELECT 
  name as bucket_name,
  public as is_public,
  created_at
FROM storage.buckets 
WHERE name IN ('assets', 'memory-books')
ORDER BY name; 