-- Query 1: Check if the email_events table exists and has data
SELECT 
    COUNT(*) as total_events,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(created_at) as earliest_event,
    MAX(created_at) as latest_event
FROM email_events;

-- Query 2: Show recent events with details
SELECT 
    event_type,
    email,
    user_id,
    message_id,
    timestamp,
    created_at
FROM email_events 
ORDER BY created_at DESC 
LIMIT 10;

-- Query 3: Group events by type to see what's being tracked
SELECT 
    event_type,
    COUNT(*) as count,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen
FROM email_events 
GROUP BY event_type 
ORDER BY count DESC;

-- Query 4: Check events for a specific email (replace with your test email)
SELECT 
    event_type,
    email,
    user_id,
    message_id,
    timestamp,
    created_at,
    event_data
FROM email_events 
WHERE email = 'your-test-email@example.com'  -- Replace with your actual test email
ORDER BY created_at DESC;

-- Query 5: Check if events are being linked to users properly
SELECT 
    e.event_type,
    e.email,
    e.user_id,
    p.first_name,
    p.last_name,
    e.created_at
FROM email_events e
LEFT JOIN profiles p ON e.user_id = p.user_id
ORDER BY e.created_at DESC 
LIMIT 10;

-- Query 6: Summary of today's events
SELECT 
    event_type,
    COUNT(*) as today_count
FROM email_events 
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY event_type 
ORDER BY today_count DESC;
