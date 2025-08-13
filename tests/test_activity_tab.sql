-- Test script to add sample activity data for testing the Activity tab
-- Run with: cat tests/test_activity_tab.sql | susql

-- Add sample activity log entries
INSERT INTO activity_log (user_id, action, details, created_at) VALUES
-- Sample user activities (replace with actual user IDs from your database)
('00000000-0000-0000-0000-000000000001', 'asset_uploaded', '{"assetId": "test-asset-1", "type": "photo", "title": "Sample Photo"}', NOW() - INTERVAL '1 hour'),
('00000000-0000-0000-0000-000000000001', 'asset_approved', '{"assetId": "test-asset-1", "approved": true}', NOW() - INTERVAL '30 minutes'),
('00000000-0000-0000-0000-000000000002', 'memory_book_created', '{"bookId": "test-book-1", "assetCount": 3}', NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000002', 'user_registered', '{"email": "test@example.com"}', NOW() - INTERVAL '3 hours'),
(NULL, 'system_maintenance', '{"maintenance": "database backup completed"}', NOW() - INTERVAL '4 hours');

-- Add sample email events
INSERT INTO email_events (event_type, email, user_id, message_id, timestamp, sendgrid_event_id, event_data, created_at) VALUES
('delivered', 'user1@example.com', '00000000-0000-0000-0000-000000000001', 'msg_123', EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour'), 'evt_456', '{"event": "delivered", "email": "user1@example.com"}', NOW() - INTERVAL '1 hour'),
('opened', 'user1@example.com', '00000000-0000-0000-0000-000000000001', 'msg_123', EXTRACT(EPOCH FROM NOW() - INTERVAL '30 minutes'), 'evt_457', '{"event": "opened", "email": "user1@example.com"}', NOW() - INTERVAL '30 minutes'),
('clicked', 'user2@example.com', '00000000-0000-0000-0000-000000000002', 'msg_124', EXTRACT(EPOCH FROM NOW() - INTERVAL '2 hours'), 'evt_458', '{"event": "clicked", "email": "user2@example.com"}', NOW() - INTERVAL '2 hours'),
('bounced', 'invalid@example.com', NULL, 'msg_125', EXTRACT(EPOCH FROM NOW() - INTERVAL '3 hours'), 'evt_459', '{"event": "bounced", "email": "invalid@example.com"}', NOW() - INTERVAL '3 hours'),
('delivered', 'admin@savta.ai', NULL, 'msg_126', EXTRACT(EPOCH FROM NOW() - INTERVAL '4 hours'), 'evt_460', '{"event": "delivered", "email": "admin@savta.ai"}', NOW() - INTERVAL '4 hours');

-- Verify the data was inserted
SELECT 'Activity Log Count:' as info, COUNT(*) as count FROM activity_log
UNION ALL
SELECT 'Email Events Count:', COUNT(*) FROM email_events;

-- Show recent activity log entries
SELECT 
    'Activity Log' as source,
    action,
    user_id,
    created_at,
    details
FROM activity_log 
ORDER BY created_at DESC 
LIMIT 5;

-- Show recent email events
SELECT 
    'Email Events' as source,
    event_type,
    email,
    user_id,
    created_at,
    message_id
FROM email_events 
ORDER BY created_at DESC 
LIMIT 5;
