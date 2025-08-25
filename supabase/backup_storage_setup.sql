-- Create backup storage bucket
-- Note: This needs to be run in Supabase Dashboard > Storage > Create Bucket
-- Bucket name: backups
-- Public bucket: false (private for security)

-- Storage policies for the backups bucket
-- These policies ensure only admins can access backup files

-- Upload Policy (Admin only)
CREATE POLICY "Admins can upload backup files" ON storage.objects
FOR INSERT TO authenticated
USING (
  bucket_id = 'backups' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- View Policy (Admin only)
CREATE POLICY "Admins can view backup files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'backups' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Update Policy (Admin only)
CREATE POLICY "Admins can update backup files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'backups' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Delete Policy (Admin only)
CREATE POLICY "Admins can delete backup files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'backups' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
