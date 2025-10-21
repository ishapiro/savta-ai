-- Thumbnail Generation Test (Phase 2)
-- 
-- This test verifies that the thumbnail generation system is working correctly.
-- Run after uploading a new photo through the UI.
--
-- Usage: susql -f tests/thumbnail-generation-test.sql

-- ============================================================
-- TEST 1: Check for assets WITH thumbnails (new uploads)
-- ============================================================
SELECT 
  '✓ Testing for assets with thumbnails...' as test_section;

SELECT 
  id,
  SUBSTRING(storage_url FROM 50 FOR 50) as storage_preview,
  CASE 
    WHEN thumbnail_url IS NOT NULL THEN '✅ Has thumbnail'
    ELSE '⚠️ No thumbnail'
  END as thumbnail_status,
  thumbnail_width,
  thumbnail_height,
  CASE 
    WHEN thumbnail_width = 400 THEN '✅ Correct width (400px)'
    WHEN thumbnail_width IS NULL THEN '⚠️ Width is NULL'
    ELSE '⚠️ Unexpected width: ' || thumbnail_width::text
  END as width_check,
  created_at
FROM assets 
WHERE deleted = false
  AND type = 'photo'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- TEST 2: Count assets with vs without thumbnails
-- ============================================================
SELECT 
  '✓ Counting thumbnail coverage...' as test_section;

SELECT 
  COUNT(*) as total_photo_assets,
  COUNT(thumbnail_url) FILTER (WHERE thumbnail_url IS NOT NULL) as with_thumbnails,
  COUNT(*) FILTER (WHERE thumbnail_url IS NULL) as without_thumbnails,
  ROUND(
    COUNT(thumbnail_url) FILTER (WHERE thumbnail_url IS NOT NULL)::numeric / 
    NULLIF(COUNT(*)::numeric, 0) * 100, 
    1
  ) || '%' as thumbnail_coverage,
  CASE 
    WHEN COUNT(thumbnail_url) FILTER (WHERE thumbnail_url IS NOT NULL) > 0 
    THEN '✅ Thumbnail generation is working!'
    ELSE '⚠️ No thumbnails generated yet - try uploading a new photo'
  END as status
FROM assets 
WHERE deleted = false 
  AND type = 'photo';

-- ============================================================
-- TEST 3: Verify thumbnail storage paths
-- ============================================================
SELECT 
  '✓ Verifying thumbnail storage structure...' as test_section;

SELECT 
  id,
  CASE 
    WHEN thumbnail_url LIKE '%/thumbnails/%' THEN '✅ Correct path (/thumbnails/)'
    WHEN thumbnail_url IS NULL THEN '⚠️ No thumbnail'
    ELSE '❌ Incorrect path (should contain /thumbnails/)'
  END as path_check,
  CASE 
    WHEN thumbnail_url LIKE '%.webp' OR thumbnail_url IS NULL THEN '✅ WebP format'
    ELSE '⚠️ Not WebP format'
  END as format_check,
  thumbnail_url,
  created_at
FROM assets 
WHERE deleted = false
  AND type = 'photo'
  AND thumbnail_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================
-- TEST 4: Check thumbnail dimensions
-- ============================================================
SELECT 
  '✓ Checking thumbnail dimensions...' as test_section;

SELECT 
  thumbnail_width,
  thumbnail_height,
  COUNT(*) as count,
  CASE 
    WHEN thumbnail_width = 400 THEN '✅ Standard width'
    WHEN thumbnail_width < 400 THEN '⚠️ Smaller than standard (original was small)'
    WHEN thumbnail_width > 400 THEN '❌ Larger than expected'
    ELSE '⚠️ No width data'
  END as width_status,
  ROUND(thumbnail_height::numeric / NULLIF(thumbnail_width::numeric, 0), 2) as aspect_ratio
FROM assets 
WHERE deleted = false
  AND type = 'photo'
  AND thumbnail_url IS NOT NULL
GROUP BY thumbnail_width, thumbnail_height
ORDER BY count DESC;

-- ============================================================
-- TEST 5: Compare storage URLs (full vs thumbnail)
-- ============================================================
SELECT 
  '✓ Comparing storage patterns...' as test_section;

SELECT 
  id,
  -- Extract just the filename from full URL
  SUBSTRING(storage_url FROM '.*/([^/]+)$') as full_res_file,
  -- Extract just the filename from thumbnail URL  
  SUBSTRING(thumbnail_url FROM '.*/([^/]+)$') as thumbnail_file,
  CASE 
    WHEN storage_url IS NOT NULL AND thumbnail_url IS NOT NULL 
    THEN '✅ Both URLs present'
    WHEN storage_url IS NOT NULL AND thumbnail_url IS NULL
    THEN '⚠️ Full res only (legacy or failed generation)'
    ELSE '❌ Missing storage_url'
  END as url_status,
  created_at
FROM assets 
WHERE deleted = false
  AND type = 'photo'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================
-- TEST 6: Performance estimate
-- ============================================================
SELECT 
  '✓ Estimating performance impact...' as test_section;

WITH thumbnail_stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE thumbnail_url IS NOT NULL) as with_thumbnails,
    COUNT(*) as total_photos
  FROM assets 
  WHERE deleted = false AND type = 'photo'
)
SELECT 
  with_thumbnails,
  total_photos - with_thumbnails as without_thumbnails,
  -- Assume 2MB average for full-res, 30KB for thumbnails
  ROUND((total_photos * 2.0)::numeric, 1) || ' MB' as full_res_page_load_12_cards,
  ROUND((with_thumbnails * 0.03 + (total_photos - with_thumbnails) * 2.0)::numeric, 1) || ' MB' as current_page_load_12_cards,
  CASE 
    WHEN with_thumbnails::numeric / NULLIF(total_photos::numeric, 0) > 0.5
    THEN '✅ Good thumbnail coverage (>50%)'
    WHEN with_thumbnails > 0
    THEN '⚠️ Some thumbnails, but coverage low'
    ELSE '❌ No thumbnails yet'
  END as performance_status,
  ROUND(
    (1 - (with_thumbnails * 0.03 + (total_photos - with_thumbnails) * 2.0) / NULLIF((total_photos * 2.0), 0)) * 100,
    1
  ) || '%' as estimated_improvement
FROM thumbnail_stats;

-- ============================================================
-- TEST 7: Recent uploads (last 24 hours)
-- ============================================================
SELECT 
  '✓ Checking recent uploads (last 24 hours)...' as test_section;

SELECT 
  COUNT(*) as uploads_last_24h,
  COUNT(thumbnail_url) FILTER (WHERE thumbnail_url IS NOT NULL) as with_thumbnails,
  COUNT(*) FILTER (WHERE thumbnail_url IS NULL) as without_thumbnails,
  CASE 
    WHEN COUNT(*) = 0 THEN '⚠️ No uploads in last 24 hours'
    WHEN COUNT(thumbnail_url) = COUNT(*) THEN '✅ All recent uploads have thumbnails!'
    WHEN COUNT(thumbnail_url) > 0 THEN '⚠️ Some recent uploads missing thumbnails'
    ELSE '❌ No recent uploads have thumbnails'
  END as recent_status
FROM assets 
WHERE deleted = false
  AND type = 'photo'
  AND created_at >= NOW() - INTERVAL '24 hours';

-- ============================================================
-- SUMMARY
-- ============================================================
SELECT 
  '📊 Phase 2 Test Summary' as summary_section;

WITH summary_stats AS (
  SELECT 
    COUNT(*) as total,
    COUNT(thumbnail_url) FILTER (WHERE thumbnail_url IS NOT NULL) as with_thumb,
    COUNT(*) FILTER (WHERE thumbnail_url LIKE '%/thumbnails/%' AND thumbnail_url LIKE '%.webp') as correct_format
  FROM assets 
  WHERE deleted = false AND type = 'photo'
)
SELECT 
  CASE 
    WHEN with_thumb > 0 AND correct_format = with_thumb
    THEN '✅ PHASE 2 WORKING - Thumbnails being generated correctly!'
    WHEN with_thumb > 0 
    THEN '⚠️ PARTIAL - Some thumbnails but check format/path'
    ELSE '⚠️ NOT WORKING YET - No thumbnails found. Upload a new photo to test.'
  END as overall_status,
  total as total_photos,
  with_thumb as photos_with_thumbnails,
  total - with_thumb as legacy_photos,
  correct_format as properly_formatted_thumbnails
FROM summary_stats;

-- ============================================================
-- NEXT STEPS
-- ============================================================
SELECT 
  '📋 Next Steps' as next_steps_section;

SELECT 
  'Upload a new photo through /app/upload to test thumbnail generation' as step_1,
  'Check that thumbnail_url is populated in the assets table' as step_2,
  'Verify thumbnail is stored in /thumbnails/ subfolder with .webp extension' as step_3,
  'If working, proceed to Phase 3 (UI Integration)' as step_4;

