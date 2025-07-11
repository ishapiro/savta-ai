-- Test script to check pdf_status table
-- Run this in your Supabase SQL Editor

-- Check if pdf_status table exists
SELECT 
  'pdf_status' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pdf_status') as exists;

-- If it exists, check its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'pdf_status'
ORDER BY ordinal_position;

-- Check if there are any records
SELECT COUNT(*) as record_count FROM pdf_status;

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'pdf_status'; 