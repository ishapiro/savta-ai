-- Final storage policies for Savta AI with authenticated user access
-- This assumes authenticated users have access to the assets bucket
-- User isolation is handled at the database level (assets table RLS)

-- Enable Row Level Security on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow users to view files in their own folder
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow users to update files in their own folder
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow users to delete files in their own folder
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin policy to allow admins to view all files
CREATE POLICY "Admins can view all files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'assets' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admin policy to allow admins to manage all files
CREATE POLICY "Admins can manage all files" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'assets' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  ); 