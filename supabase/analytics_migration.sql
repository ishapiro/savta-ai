-- Phase 1 Analytics Migration
-- Extend activity_log table with analytics tracking fields

-- Add analytics fields to existing activity_log table
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS page_path text;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS ip_hash text;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS session_duration integer;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS exit_page boolean DEFAULT false;

-- Add indexes for performance (using CONCURRENTLY to avoid locking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_session_time ON activity_log(session_id, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_page_time ON activity_log(page_path, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_geo_time ON activity_log(country, region, timestamp DESC);

-- Add partial indexes for common analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_page_visits ON activity_log(page_path, timestamp DESC) WHERE action = 'page_visit';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_log_user_sessions ON activity_log(user_id, session_id, timestamp DESC);

-- Update existing activity_log entries to have default values for new fields
UPDATE activity_log SET 
  session_id = COALESCE(session_id, 'legacy-' || id::text),
  page_path = COALESCE(page_path, 'unknown'),
  ip_hash = COALESCE(ip_hash, 'unknown'),
  country = COALESCE(country, 'unknown'),
  region = COALESCE(region, 'unknown'),
  city = COALESCE(city, 'unknown'),
  device_type = COALESCE(device_type, 'unknown'),
  browser = COALESCE(browser, 'unknown'),
  session_duration = COALESCE(session_duration, 0),
  exit_page = COALESCE(exit_page, false)
WHERE session_id IS NULL;

-- Add comment to document the analytics fields
COMMENT ON COLUMN activity_log.session_id IS 'Anonymous session identifier for tracking user journeys';
COMMENT ON COLUMN activity_log.page_path IS 'Page path that was visited';
COMMENT ON COLUMN activity_log.ip_hash IS 'Hashed IP address for privacy-compliant geolocation';
COMMENT ON COLUMN activity_log.country IS 'Country from IP geolocation';
COMMENT ON COLUMN activity_log.region IS 'Region/state from IP geolocation';
COMMENT ON COLUMN activity_log.city IS 'City from IP geolocation';
COMMENT ON COLUMN activity_log.device_type IS 'Device type: mobile, desktop, tablet';
COMMENT ON COLUMN activity_log.browser IS 'Browser information';
COMMENT ON COLUMN activity_log.session_duration IS 'Session duration in seconds';
COMMENT ON COLUMN activity_log.exit_page IS 'Whether this was the exit page for the session';
