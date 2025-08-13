-- Email events table for tracking SendGrid webhook events
create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- 'delivered', 'bounced', 'opened', 'clicked', etc.
  email text not null,
  user_id uuid, -- nullable, will be null for non-authenticated emails
  message_id text, -- SendGrid message ID
  timestamp timestamp with time zone default timezone('utc'::text, now()),
  sendgrid_event_id text, -- SendGrid's event ID
  event_data jsonb, -- full event data from SendGrid
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for efficient queries
create index if not exists idx_email_events_email on email_events(email);
create index if not exists idx_email_events_user_id on email_events(user_id);
create index if not exists idx_email_events_timestamp on email_events(timestamp);
create index if not exists idx_email_events_event_type on email_events(event_type);

-- Add comment
comment on table email_events is 'Tracks SendGrid webhook events for email delivery, opens, clicks, bounces, etc.';
