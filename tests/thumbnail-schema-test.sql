-- Thumbnail Schema Test
-- Run this in Supabase SQL Editor to verify Phase 1 implementation
-- 
-- This test verifies:
-- 1. Thumbnail columns exist in assets table
-- 2. Columns have correct data types and defaults
-- 3. Index exists for performance
-- 4. Backward compatibility is maintained

-- ============================================================
-- TEST 1: Check if thumbnail columns exist
-- ============================================================
SELECT 
  '✓ Testing column existence...' as test_section;

SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable,
  character_maximum_length,
  CASE 
    WHEN column_name IN ('thumbnail_url', 'thumbnail_width', 'thumbnail_height') 
    THEN '✅ Column exists'
    ELSE '❌ Column missing'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'assets'
  AND column_name IN ('thumbnail_url', 'thumbnail_width', 'thumbnail_height', 'storage_url')
ORDER BY 
  CASE column_name
    WHEN 'storage_url' THEN 1
    WHEN 'thumbnail_url' THEN 2
    WHEN 'thumbnail_width' THEN 3
    WHEN 'thumbnail_height' THEN 4
  END;

-- Expected Results:
-- - thumbnail_url: text, nullable, max_length 1000
-- - thumbnail_width: integer, default 400
-- - thumbnail_height: integer, nullable
-- - storage_url: text, nullable, max_length 1000 (unchanged)

-- ============================================================
-- TEST 2: Verify column constraints
-- ============================================================
SELECT 
  '✓ Testing column constraints...' as test_section;

SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition,
  CASE 
    WHEN conname LIKE '%thumbnail%' THEN '✅ Thumbnail constraint found'
    ELSE 'ℹ️  Other constraint'
  END as status
FROM pg_constraint 
WHERE conrelid = 'public.assets'::regclass
  AND (conname LIKE '%thumbnail%' OR conname LIKE '%storage_url%')
ORDER BY conname;

-- Expected: CHECK constraints for URL length on both storage_url and thumbnail_url

-- ============================================================
-- TEST 3: Check if index exists
-- ============================================================
SELECT 
  '✓ Testing database index...' as test_section;

SELECT 
  indexname,
  tablename,
  indexdef,
  CASE 
    WHEN indexname = 'idx_assets_thumbnail_url' THEN '✅ Index exists'
    ELSE '❌ Index missing'
  END as status
FROM pg_indexes 
WHERE tablename = 'assets' 
  AND indexname = 'idx_assets_thumbnail_url';

-- Expected: idx_assets_thumbnail_url index with WHERE thumbnail_url IS NOT NULL

-- ============================================================
-- TEST 4: Test backward compatibility (query without thumbnails)
-- ============================================================
SELECT 
  '✓ Testing backward compatibility...' as test_section;

-- This query should work exactly as before (no thumbnail fields)
SELECT 
  id,
  storage_url,
  type,
  approved,
  '✅ Legacy query works' as status
FROM assets 
WHERE deleted = false
LIMIT 1;

-- Expected: Query succeeds without referencing thumbnail fields

-- ============================================================
-- TEST 5: Test querying WITH thumbnail fields
-- ============================================================
SELECT 
  '✓ Testing new thumbnail fields...' as test_section;

-- This query includes new thumbnail fields
SELECT 
  id,
  storage_url,
  thumbnail_url,
  thumbnail_width,
  thumbnail_height,
  CASE 
    WHEN thumbnail_url IS NULL THEN '✅ NULL thumbnail (backward compatible)'
    WHEN thumbnail_url IS NOT NULL THEN '✅ Has thumbnail'
  END as thumbnail_status,
  CASE 
    WHEN thumbnail_width = 400 THEN '✅ Default width applied'
    WHEN thumbnail_width IS NULL THEN '⚠️  Width is NULL'
    ELSE '✅ Custom width: ' || thumbnail_width::text
  END as width_status
FROM assets 
WHERE deleted = false
LIMIT 5;

-- Expected: 
-- - Existing assets have NULL thumbnail_url (backward compatible)
-- - thumbnail_width may be 400 (default) or NULL for old records
-- - Query succeeds without errors

-- ============================================================
-- TEST 6: Test INSERT with thumbnails
-- ============================================================
SELECT 
  '✓ Testing INSERT with thumbnail fields...' as test_section;

-- Note: This is a dry-run test. Uncomment to actually test INSERT
-- (Make sure to replace 'YOUR_USER_ID' with a valid user_id from profiles table)

/*
DO $$
DECLARE
  test_asset_id uuid;
  test_user_id uuid;
BEGIN
  -- Get a valid user_id (first user in profiles)
  SELECT user_id INTO test_user_id FROM profiles LIMIT 1;
  
  -- Test INSERT with thumbnail fields
  INSERT INTO assets (
    user_id,
    type,
    title,
    storage_url,
    thumbnail_url,
    thumbnail_width,
    thumbnail_height,
    approved
  ) VALUES (
    test_user_id,
    'photo',
    'Test Photo with Thumbnail',
    'https://example.com/test-photo.jpg',
    'https://example.com/test-photo-thumb.webp',
    400,
    300,
    true
  ) RETURNING id INTO test_asset_id;
  
  RAISE NOTICE '✅ INSERT with thumbnails succeeded. Asset ID: %', test_asset_id;
  
  -- Verify the data
  IF EXISTS (
    SELECT 1 FROM assets 
    WHERE id = test_asset_id 
      AND thumbnail_url = 'https://example.com/test-photo-thumb.webp'
      AND thumbnail_width = 400
      AND thumbnail_height = 300
  ) THEN
    RAISE NOTICE '✅ Thumbnail fields persisted correctly';
  ELSE
    RAISE NOTICE '❌ Thumbnail fields did not persist correctly';
  END IF;
  
  -- Clean up test data
  DELETE FROM assets WHERE id = test_asset_id;
  RAISE NOTICE '🧹 Cleaned up test data';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;
*/

SELECT '⚠️  INSERT test is commented out. Uncomment the block above to run.' as note;

-- ============================================================
-- TEST 7: Test INSERT without thumbnails (backward compatibility)
-- ============================================================
SELECT 
  '✓ Testing INSERT WITHOUT thumbnails (backward compatibility)...' as test_section;

/*
DO $$
DECLARE
  test_asset_id uuid;
  test_user_id uuid;
BEGIN
  -- Get a valid user_id
  SELECT user_id INTO test_user_id FROM profiles LIMIT 1;
  
  -- Test INSERT WITHOUT thumbnail fields (old behavior)
  INSERT INTO assets (
    user_id,
    type,
    title,
    storage_url,
    approved
  ) VALUES (
    test_user_id,
    'photo',
    'Test Photo without Thumbnail',
    'https://example.com/test-photo-old.jpg',
    true
  ) RETURNING id INTO test_asset_id;
  
  RAISE NOTICE '✅ INSERT without thumbnails succeeded (backward compatible). Asset ID: %', test_asset_id;
  
  -- Verify thumbnail_url is NULL and thumbnail_width has default
  IF EXISTS (
    SELECT 1 FROM assets 
    WHERE id = test_asset_id 
      AND thumbnail_url IS NULL
      AND thumbnail_width = 400
      AND thumbnail_height IS NULL
  ) THEN
    RAISE NOTICE '✅ Backward compatibility confirmed: thumbnail_url NULL, width has default';
  ELSE
    RAISE NOTICE '❌ Backward compatibility issue detected';
  END IF;
  
  -- Clean up test data
  DELETE FROM assets WHERE id = test_asset_id;
  RAISE NOTICE '🧹 Cleaned up test data';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;
*/

SELECT '⚠️  INSERT test is commented out. Uncomment the block above to run.' as note;

-- ============================================================
-- TEST 8: Check column comments (documentation)
-- ============================================================
SELECT 
  '✓ Testing column documentation...' as test_section;

SELECT 
  c.column_name,
  pgd.description as column_comment,
  CASE 
    WHEN pgd.description IS NOT NULL THEN '✅ Documented'
    ELSE '⚠️  No comment'
  END as status
FROM pg_catalog.pg_statio_all_tables as st
INNER JOIN pg_catalog.pg_description pgd on (pgd.objoid = st.relid)
INNER JOIN information_schema.columns c on (
  pgd.objsubid = c.ordinal_position 
  AND c.table_schema = st.schemaname 
  AND c.table_name = st.relname
)
WHERE st.relname = 'assets'
  AND c.column_name IN ('storage_url', 'thumbnail_url', 'thumbnail_width', 'thumbnail_height')
ORDER BY c.column_name;

-- Expected: Comments explaining the purpose of each field

-- ============================================================
-- TEST SUMMARY
-- ============================================================
SELECT 
  '📊 Test Summary' as summary_section;

WITH test_results AS (
  SELECT 
    COUNT(*) FILTER (WHERE column_name = 'thumbnail_url') as has_thumbnail_url,
    COUNT(*) FILTER (WHERE column_name = 'thumbnail_width') as has_thumbnail_width,
    COUNT(*) FILTER (WHERE column_name = 'thumbnail_height') as has_thumbnail_height,
    COUNT(*) FILTER (WHERE column_name = 'storage_url') as has_storage_url
  FROM information_schema.columns 
  WHERE table_schema = 'public' 
    AND table_name = 'assets'
    AND column_name IN ('thumbnail_url', 'thumbnail_width', 'thumbnail_height', 'storage_url')
),
index_check AS (
  SELECT COUNT(*) as index_exists
  FROM pg_indexes 
  WHERE tablename = 'assets' 
    AND indexname = 'idx_assets_thumbnail_url'
)
SELECT 
  CASE 
    WHEN tr.has_thumbnail_url = 1 
      AND tr.has_thumbnail_width = 1 
      AND tr.has_thumbnail_height = 1 
      AND tr.has_storage_url = 1
      AND ic.index_exists = 1
    THEN '✅ ALL TESTS PASSED - Phase 1 Complete!'
    ELSE '❌ SOME TESTS FAILED - Review results above'
  END as overall_status,
  tr.has_thumbnail_url = 1 as thumbnail_url_exists,
  tr.has_thumbnail_width = 1 as thumbnail_width_exists,
  tr.has_thumbnail_height = 1 as thumbnail_height_exists,
  tr.has_storage_url = 1 as storage_url_unchanged,
  ic.index_exists = 1 as index_exists
FROM test_results tr, index_check ic;

-- ============================================================
-- NEXT STEPS
-- ============================================================
SELECT 
  '📋 Next Steps' as next_steps_section;

SELECT 
  'If all tests passed, Phase 1 is complete! ✅' as step_1,
  'Next: Implement Phase 2 (Thumbnail Generation API)' as step_2,
  'See docs/thumbnail-architecture.md for details' as step_3;

