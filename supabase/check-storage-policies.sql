-- Check all storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- Alternative: Check policies with more details
SELECT 
  p.policyname,
  p.cmd as operation,
  p.roles,
  p.qual as using_expression,
  p.with_check as with_check_expression,
  CASE 
    WHEN p.qual IS NOT NULL THEN 'Using: ' || p.qual
    ELSE 'No using expression'
  END as policy_details
FROM pg_policies p
WHERE p.schemaname = 'storage' 
  AND p.tablename = 'objects'
ORDER BY p.policyname;

-- Check if RLS is enabled on storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'; 