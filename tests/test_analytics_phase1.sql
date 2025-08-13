-- Phase 1 Analytics Testing Script
-- Run this after implementing Phase 1 to verify functionality

-- Test 1: Verify new columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'activity_log' 
  AND column_name IN ('session_id', 'page_path', 'ip_hash', 'country', 'region', 'city', 'device_type', 'browser', 'session_duration', 'exit_page')
ORDER BY column_name;

-- Test 2: Verify indexes were created
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'activity_log' 
  AND indexname LIKE 'idx_activity_log_%'
ORDER BY indexname;

-- Test 3: Insert test analytics data
INSERT INTO activity_log (
  user_id, 
  action, 
  session_id, 
  page_path, 
  ip_hash, 
  country, 
  region, 
  city, 
  device_type, 
  browser, 
  session_duration, 
  exit_page, 
  details,
  timestamp
) VALUES 
-- Test page visits
('00000000-0000-0000-0000-000000000001', 'page_visit', 'session_test_1', '/app/dashboard', 'abc123', 'United States', 'California', 'San Francisco', 'desktop', 'Chrome', 120, false, '{"url": "https://savta.ai/app/dashboard"}', NOW() - INTERVAL '1 hour'),
('00000000-0000-0000-0000-000000000001', 'page_visit', 'session_test_1', '/app/upload', 'abc123', 'United States', 'California', 'San Francisco', 'desktop', 'Chrome', 45, false, '{"url": "https://savta.ai/app/upload"}', NOW() - INTERVAL '30 minutes'),
('00000000-0000-0000-0000-000000000001', 'page_visit', 'session_test_1', '/app/review', 'abc123', 'United States', 'California', 'San Francisco', 'desktop', 'Chrome', 180, true, '{"url": "https://savta.ai/app/review"}', NOW() - INTERVAL '15 minutes'),

-- Test session start
('00000000-0000-0000-0000-000000000001', 'session_start', 'session_test_1', '/app/dashboard', 'abc123', 'United States', 'California', 'San Francisco', 'desktop', 'Chrome', 0, false, '{"session_id": "session_test_1"}', NOW() - INTERVAL '2 hours'),

-- Test user actions with analytics data
('00000000-0000-0000-0000-000000000001', 'asset_uploaded', 'session_test_1', '/app/upload', 'abc123', 'United States', 'California', 'San Francisco', 'desktop', 'Chrome', 0, false, '{"assetId": "test-asset-1", "type": "photo"}', NOW() - INTERVAL '25 minutes'),
('00000000-0000-0000-0000-000000000001', 'memory_book_created', 'session_test_1', '/app/review', 'abc123', 'United States', 'California', 'San Francisco', 'desktop', 'Chrome', 0, false, '{"bookId": "test-book-1", "title": "Test Memory Book"}', NOW() - INTERVAL '10 minutes'),

-- Test different user and session
('00000000-0000-0000-0000-000000000002', 'page_visit', 'session_test_2', '/app/dashboard', 'def456', 'Canada', 'Ontario', 'Toronto', 'mobile', 'Safari', 90, false, '{"url": "https://savta.ai/app/dashboard"}', NOW() - INTERVAL '45 minutes'),
('00000000-0000-0000-0000-000000000002', 'session_start', 'session_test_2', '/app/dashboard', 'def456', 'Canada', 'Ontario', 'Toronto', 'mobile', 'Safari', 0, false, '{"session_id": "session_test_2"}', NOW() - INTERVAL '1 hour');

-- Test 4: Query analytics data
SELECT 'Page Visits by User' as test_name;
SELECT 
  user_id,
  COUNT(*) as page_visits,
  COUNT(DISTINCT session_id) as sessions,
  AVG(session_duration) as avg_duration
FROM activity_log 
WHERE action = 'page_visit'
GROUP BY user_id
ORDER BY page_visits DESC;

-- Test 5: Query user flow
SELECT 'User Flow Analysis' as test_name;
SELECT 
  session_id,
  page_path,
  session_duration,
  exit_page,
  timestamp
FROM activity_log 
WHERE action = 'page_visit'
  AND session_id = 'session_test_1'
ORDER BY timestamp;

-- Test 6: Query geographic data
SELECT 'Geographic Distribution' as test_name;
SELECT 
  country,
  region,
  city,
  COUNT(*) as visits,
  COUNT(DISTINCT user_id) as unique_users
FROM activity_log 
WHERE action = 'page_visit'
GROUP BY country, region, city
ORDER BY visits DESC;

-- Test 7: Query device/browser data
SELECT 'Device and Browser Analysis' as test_name;
SELECT 
  device_type,
  browser,
  COUNT(*) as visits,
  COUNT(DISTINCT user_id) as unique_users
FROM activity_log 
WHERE action = 'page_visit'
GROUP BY device_type, browser
ORDER BY visits DESC;

-- Test 8: Query session analysis
SELECT 'Session Analysis' as test_name;
SELECT 
  session_id,
  user_id,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE action = 'page_visit') as page_visits,
  COUNT(*) FILTER (WHERE action = 'asset_uploaded') as uploads,
  COUNT(*) FILTER (WHERE action = 'memory_book_created') as books_created,
  MAX(timestamp) - MIN(timestamp) as session_duration
FROM activity_log 
WHERE session_id LIKE 'session_test_%'
GROUP BY session_id, user_id
ORDER BY session_duration DESC;

-- Test 9: Verify data integrity
SELECT 'Data Integrity Check' as test_name;
SELECT 
  'Total Records' as metric,
  COUNT(*) as count
FROM activity_log 
WHERE session_id LIKE 'session_test_%'

UNION ALL

SELECT 
  'Records with Session ID' as metric,
  COUNT(*) as count
FROM activity_log 
WHERE session_id IS NOT NULL
  AND session_id != ''

UNION ALL

SELECT 
  'Records with Page Path' as metric,
  COUNT(*) as count
FROM activity_log 
WHERE page_path IS NOT NULL
  AND page_path != '';

-- Clean up test data (optional - uncomment to remove test data)
-- DELETE FROM activity_log WHERE session_id LIKE 'session_test_%';
