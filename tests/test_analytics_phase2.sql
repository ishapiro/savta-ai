-- Phase 2 Analytics Test Script
-- Tests enhanced analytics features including geolocation and engagement metrics

-- 1. Verify Phase 2 columns exist in activity_log
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'activity_log' 
  AND column_name IN ('country', 'region', 'city')
ORDER BY column_name;

-- 2. Insert test Phase 2 analytics data with geolocation
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
  timestamp,
  created_at
) VALUES 
-- Test data with geolocation
('00000000-0000-0000-0000-000000000001', 'page_visit', 'session_phase2_1', '/app/dashboard', 'abc123', 'United States', 'California', 'San Francisco', 'desktop', 'Chrome', 180, false, '{"time_on_page": 120, "scroll_depth": 75, "interaction_count": 8, "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "brand", "screen_resolution": "1920x1080", "viewport_size": "1920x937", "connection_type": "4g", "language": "en-US", "timezone": "America/Los_Angeles"}', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

('00000000-0000-0000-0000-000000000001', 'page_visit', 'session_phase2_1', '/app/upload', 'abc123', 'United States', 'California', 'San Francisco', 'desktop', 'Chrome', 240, false, '{"time_on_page": 180, "scroll_depth": 90, "interaction_count": 12, "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "brand", "screen_resolution": "1920x1080", "viewport_size": "1920x937", "connection_type": "4g", "language": "en-US", "timezone": "America/Los_Angeles"}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

('00000000-0000-0000-0000-000000000002', 'page_visit', 'session_phase2_2', '/app/dashboard', 'def456', 'Canada', 'Ontario', 'Toronto', 'mobile', 'Safari', 120, false, '{"time_on_page": 90, "scroll_depth": 60, "interaction_count": 5, "utm_source": "facebook", "utm_medium": "social", "utm_campaign": "awareness", "screen_resolution": "375x812", "viewport_size": "375x812", "connection_type": "wifi", "language": "en-CA", "timezone": "America/Toronto"}', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),

('00000000-0000-0000-0000-000000000003', 'page_visit', 'session_phase2_3', '/app/memory-books', 'ghi789', 'United Kingdom', 'England', 'London', 'tablet', 'Chrome', 300, true, '{"time_on_page": 240, "scroll_depth": 85, "interaction_count": 15, "utm_source": "direct", "utm_medium": null, "utm_campaign": null, "screen_resolution": "1024x1366", "viewport_size": "1024x1366", "connection_type": "wifi", "language": "en-GB", "timezone": "Europe/London"}', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),

-- Session start events
('00000000-0000-0000-0000-000000000001', 'session_start', 'session_phase2_1', '/app/dashboard', 'abc123', 'United States', 'California', 'San Francisco', 'desktop', 'Chrome', 0, false, '{"time_on_page": 0, "scroll_depth": 0, "interaction_count": 0, "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "brand", "screen_resolution": "1920x1080", "viewport_size": "1920x937", "connection_type": "4g", "language": "en-US", "timezone": "America/Los_Angeles"}', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),

('00000000-0000-0000-0000-000000000002', 'session_start', 'session_phase2_2', '/app/dashboard', 'def456', 'Canada', 'Ontario', 'Toronto', 'mobile', 'Safari', 0, false, '{"time_on_page": 0, "scroll_depth": 0, "interaction_count": 0, "utm_source": "facebook", "utm_medium": "social", "utm_campaign": "awareness", "screen_resolution": "375x812", "viewport_size": "375x812", "connection_type": "wifi", "language": "en-CA", "timezone": "America/Toronto"}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

('00000000-0000-0000-0000-000000000003', 'session_start', 'session_phase2_3', '/app/memory-books', 'ghi789', 'United Kingdom', 'England', 'London', 'tablet', 'Chrome', 0, false, '{"time_on_page": 0, "scroll_depth": 0, "interaction_count": 0, "utm_source": "direct", "utm_medium": null, "utm_campaign": null, "screen_resolution": "1024x1366", "viewport_size": "1024x1366", "connection_type": "wifi", "language": "en-GB", "timezone": "Europe/London"}', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes');

-- 3. Test Phase 2 analytics queries
-- Check geolocation data
SELECT 
  country,
  region,
  city,
  COUNT(*) as visits,
  AVG(CAST(details->>'time_on_page' AS INTEGER)) as avg_time_on_page,
  AVG(CAST(details->>'scroll_depth' AS INTEGER)) as avg_scroll_depth,
  AVG(CAST(details->>'interaction_count' AS INTEGER)) as avg_interactions
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND country IS NOT NULL
GROUP BY country, region, city
ORDER BY visits DESC;

-- 4. Test UTM parameter tracking
SELECT 
  details->>'utm_source' as utm_source,
  details->>'utm_medium' as utm_medium,
  details->>'utm_campaign' as utm_campaign,
  COUNT(*) as visits
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND details->>'utm_source' IS NOT NULL
GROUP BY details->>'utm_source', details->>'utm_medium', details->>'utm_campaign'
ORDER BY visits DESC;

-- 5. Test technical analytics
SELECT 
  device_type,
  browser,
  details->>'screen_resolution' as screen_resolution,
  details->>'connection_type' as connection_type,
  details->>'language' as language,
  details->>'timezone' as timezone,
  COUNT(*) as users
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY device_type, browser, details->>'screen_resolution', details->>'connection_type', details->>'language', details->>'timezone'
ORDER BY users DESC;

-- 6. Test engagement metrics
SELECT 
  page_path,
  COUNT(*) as total_views,
  AVG(CAST(details->>'time_on_page' AS INTEGER)) as avg_time_on_page,
  AVG(CAST(details->>'scroll_depth' AS INTEGER)) as avg_scroll_depth,
  AVG(CAST(details->>'interaction_count' AS INTEGER)) as avg_interactions,
  SUM(CASE WHEN exit_page THEN 1 ELSE 0 END) as exits,
  CAST(
    (AVG(CAST(details->>'time_on_page' AS INTEGER)) / 60.0 * 20) +
    (AVG(CAST(details->>'scroll_depth' AS INTEGER)) / 100.0 * 30) +
    (AVG(CAST(details->>'interaction_count' AS INTEGER)) / 10.0 * 30) +
    ((1.0 - (SUM(CASE WHEN exit_page THEN 1 ELSE 0 END)::float / COUNT(*))) * 100 * 20)
  AS INTEGER) as engagement_score
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND action = 'page_visit'
GROUP BY page_path
ORDER BY engagement_score DESC;

-- 7. Test session analytics
SELECT 
  session_id,
  COUNT(*) as events_in_session,
  MIN(created_at) as session_start,
  MAX(created_at) as session_end,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as session_duration_seconds,
  STRING_AGG(DISTINCT page_path, ', ' ORDER BY page_path) as pages_visited,
  STRING_AGG(DISTINCT country, ', ') as countries
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND session_id LIKE 'session_phase2_%'
GROUP BY session_id
ORDER BY session_start DESC;

-- 8. Test referrer tracking
SELECT 
  details->>'referrer_domain' as referrer_domain,
  COUNT(*) as visits
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND details->>'referrer_domain' IS NOT NULL
GROUP BY details->>'referrer_domain'
ORDER BY visits DESC;

-- 9. Verify data integrity
SELECT 
  'Total Phase 2 Records' as metric,
  COUNT(*) as value
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND session_id LIKE 'session_phase2_%'

UNION ALL

SELECT 
  'Records with Geolocation' as metric,
  COUNT(*) as value
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND session_id LIKE 'session_phase2_%'
  AND country IS NOT NULL

UNION ALL

SELECT 
  'Records with UTM Data' as metric,
  COUNT(*) as value
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND session_id LIKE 'session_phase2_%'
  AND details->>'utm_source' IS NOT NULL

UNION ALL

SELECT 
  'Records with Engagement Data' as metric,
  COUNT(*) as value
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND session_id LIKE 'session_phase2_%'
  AND details->>'time_on_page' IS NOT NULL;

-- 10. Performance test - check query execution time
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
  country,
  COUNT(*) as visits,
  AVG(CAST(details->>'time_on_page' AS INTEGER)) as avg_time
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND country IS NOT NULL
GROUP BY country
ORDER BY visits DESC;
