-- Analytics Debug Test Script
-- Run this to check if analytics data is being written correctly

-- 1. Check if the new columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'activity_log' 
  AND column_name IN ('session_id', 'page_path', 'ip_hash', 'country', 'region', 'city', 'device_type', 'browser', 'session_duration', 'exit_page')
ORDER BY column_name;

-- 2. Check recent analytics events (last 24 hours)
SELECT 
  id,
  user_id,
  action,
  session_id,
  page_path,
  device_type,
  browser,
  session_duration,
  exit_page,
  timestamp,
  created_at
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND (action = 'page_visit' OR action = 'session_start' OR action LIKE 'test_%')
ORDER BY created_at DESC
LIMIT 20;

-- 3. Count analytics events by type
SELECT 
  action,
  COUNT(*) as count,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND (action = 'page_visit' OR action = 'session_start' OR action LIKE 'test_%')
GROUP BY action
ORDER BY count DESC;

-- 4. Check for session tracking
SELECT 
  session_id,
  COUNT(*) as events_in_session,
  MIN(created_at) as session_start,
  MAX(created_at) as session_end,
  STRING_AGG(DISTINCT page_path, ', ' ORDER BY page_path) as pages_visited
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND session_id IS NOT NULL
  AND session_id != ''
GROUP BY session_id
ORDER BY session_start DESC
LIMIT 10;

-- 5. Check for any errors or issues
SELECT 
  id,
  action,
  session_id,
  page_path,
  details,
  created_at
FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
  AND (session_id IS NULL OR page_path IS NULL OR action IS NULL)
ORDER BY created_at DESC;
