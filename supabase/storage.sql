-- Storage RLS policies for Savta AI
-- Run this after creating the 'assets' bucket via Supabase Dashboard
-- 
-- To create the bucket:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "Create a new bucket"
-- 3. Name: assets, Check "Public bucket"
-- 4. Click "Create bucket"
-- 5. Then run this script

-- Enable Row Level Security on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files to the assets bucket
CREATE POLICY "Authenticated users can upload assets" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated'
  );

-- Policy to allow authenticated users to view assets
CREATE POLICY "Authenticated users can view assets" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated'
  );

-- Policy to allow authenticated users to update assets
CREATE POLICY "Authenticated users can update assets" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated'
  );

-- Policy to allow authenticated users to delete assets
CREATE POLICY "Authenticated users can delete assets" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated'
  );

-- Admin policy to allow admins to view all assets
CREATE POLICY "Admins can view all assets" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'assets' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admin policy to allow admins to manage all assets
CREATE POLICY "Admins can manage all assets" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'assets' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  ); 