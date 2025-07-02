-- schema.sql
-- Table for storing email subscriptions

create table if not exists email_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
); 