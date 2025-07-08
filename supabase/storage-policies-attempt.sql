-- Attempt to apply storage policies with error handling
-- This script will try to apply storage policies but won't fail if you don't have permission

DO $$
BEGIN
  -- Try to enable RLS on storage.objects
  BEGIN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Successfully enabled RLS on storage.objects';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not enable RLS on storage.objects: %', SQLERRM;
  END;

  -- Try to drop existing policies
  BEGIN
    DROP POLICY IF EXISTS "Users can upload assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view own assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own assets" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can view all assets" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can manage all assets" ON storage.objects;
    RAISE NOTICE 'Successfully dropped existing storage policies';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not drop existing storage policies: %', SQLERRM;
  END;

  -- Try to create new policies
  BEGIN
    CREATE POLICY "Authenticated users can upload assets" ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'assets' AND 
        auth.role() = 'authenticated'
      );
    RAISE NOTICE 'Successfully created upload policy';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not create upload policy: %', SQLERRM;
  END;

  BEGIN
    CREATE POLICY "Authenticated users can view assets" ON storage.objects
      FOR SELECT
      USING (
        bucket_id = 'assets' AND 
        auth.role() = 'authenticated'
      );
    RAISE NOTICE 'Successfully created view policy';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not create view policy: %', SQLERRM;
  END;

  BEGIN
    CREATE POLICY "Authenticated users can update assets" ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'assets' AND 
        auth.role() = 'authenticated'
      );
    RAISE NOTICE 'Successfully created update policy';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not create update policy: %', SQLERRM;
  END;

  BEGIN
    CREATE POLICY "Authenticated users can delete assets" ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'assets' AND 
        auth.role() = 'authenticated'
      );
    RAISE NOTICE 'Successfully created delete policy';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not create delete policy: %', SQLERRM;
  END;

END $$;

-- Check what policies exist
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
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- Instructions for manual setup if SQL fails:
SELECT 'If the above policies failed to create, you need to:' as instruction;
SELECT '1. Go to Supabase Dashboard → Storage → Policies' as step;
SELECT '2. Select the "assets" bucket' as step;
SELECT '3. Add policies manually through the UI' as step;
SELECT '4. Or contact your database owner to run the storage.sql script' as step; 