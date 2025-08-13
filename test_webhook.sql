-- Test: Insert a sample event to verify the table structure
INSERT INTO email_events (
    event_type,
    email,
    user_id,
    message_id,
    timestamp,
    sendgrid_event_id,
    event_data
) VALUES (
    'delivered',
    'test@savta.ai',
    NULL,
    'test_message_id_123',
    NOW(),
    'test_event_id_456',
    '{"test": "data", "event": "delivered", "email": "test@savta.ai"}'::jsonb
);

-- Verify the test data was inserted
SELECT 
    event_type,
    email,
    user_id,
    message_id,
    timestamp,
    created_at
FROM email_events 
ORDER BY created_at DESC 
LIMIT 5;
