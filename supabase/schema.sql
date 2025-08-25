-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Email subscriptions table
create table if not exists email_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

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

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  address text,
  subscription_type text default 'regular' check (subscription_type in ('regular', 'premium')),
  role text default 'user' check (role in ('user', 'editor', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  unique(user_id)
);

-- Tags table (no foreign keys, create early)
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false
);

-- Families table
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  relationship text not null,
  contact_info jsonb,
  delivery_method text default 'email' check (delivery_method in ('email', 'print', 'whatsapp')),
  frequency text default 'monthly' check (frequency in ('weekly', 'monthly', 'quarterly')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false
);

-- Assets table
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('photo', 'text')),
  title text,
  storage_url text check (storage_url is null or length(storage_url) <= 1000),
  user_caption text,
  ai_caption text,
  ai_description text,
  tags text[] default array[]::text[],
  user_tags text[] default array[]::text[],
  people_detected jsonb default '[]'::jsonb,
  user_people jsonb default '[]'::jsonb,
  width integer,
  height integer,
  orientation text check (orientation in ('portrait', 'landscape', 'square')),
  location text,
  city text,
  state text,
  country text,
  zip_code text,
  asset_date timestamp with time zone,
  ai_processed boolean default false,
  approved boolean default false,
  rejected boolean default false,
  fingerprint text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false
);

-- Asset tags junction table (many-to-many)
create table if not exists asset_tags (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null,
  tag_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(asset_id, tag_id)
);

-- Memory books table
create table if not exists memory_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ai_supplemental_prompt text,
  magic_story text,
  ai_photo_selection_reasoning text,
  layout_type text,
  ui text default 'form' check (ui in ('wizard', 'form')),
  format text default 'book' check (format in ('card', 'book')),
  page_count integer,
  grid_layout text default '2x2' check (grid_layout in ('1x1', '2x1', '2x2', '3x2', '3x3', '3x4', '4x4')),
  memory_shape text default 'original' check (memory_shape in ('original', 'magic', 'rounded')),
  print_size text default '8.5x11' check (print_size in ('4x6', '6x4', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12')),
  quality text,
  medium text,
  theme_id text,
  status text default 'draft' check (status in ('draft', 'ready', 'background_ready', 'approved', 'distributed')),
  pdf_url text check (pdf_url is null or length(pdf_url) <= 1000),
  background_url text check (background_url is null or length(background_url) <= 1000),
  review_notes text,
  created_from_assets uuid[] default array[]::uuid[],
  photo_selection_pool uuid[] default array[]::uuid[],
  generated_at timestamp with time zone,
  approved_at timestamp with time zone,
  distributed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  deleted_at timestamp with time zone,
  include_captions boolean default true,
  include_tags boolean default true,
  ai_background boolean default true,
  auto_enhance boolean default false,
  memory_event text,
  output text default 'PDF' check (output in ('PDF', 'JPG'))
);

-- Add foreign key from memory_books.user_id to profiles.user_id (safe for rerun)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_memory_books_user_id'
      AND table_name = 'memory_books'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE memory_books
      ADD CONSTRAINT fk_memory_books_user_id
      FOREIGN KEY (user_id) REFERENCES profiles(user_id);
  END IF;
END $$;

-- Themes table
create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  preview_image_url text,
  is_active boolean default true,
  background_color text,
  background_opacity integer,
  header_font text,
  body_font text,
  signature_font text,
  header_font_color text,
  body_font_color text,
  signature_font_color text,
  layout_config jsonb,
  rounded boolean default false,
  size text default '7x5' check (size in ('4x6', '6x4', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12')),
  card_default boolean default false,
  card_wizard boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false
);

-- PDF status tracking table
create table if not exists pdf_status (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null,
  user_id uuid not null,
  status text not null,
  progress integer default 0 check (progress between 0 and 100),
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(book_id, user_id)
);

-- Activity log table
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()),
  details jsonb default '{}'::jsonb,
  session_id text,
  page_path text,
  ip_hash text,
  country text,
  region text,
  city text,
  device_type text,
  browser text,
  session_duration integer,
  exit_page boolean DEFAULT false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create indexes for better performance
create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_profiles_email on profiles(email);
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_families_user_id on families(user_id);
create index if not exists idx_assets_user_id on assets(user_id);
create index if not exists idx_assets_type on assets(type);
create index if not exists idx_assets_approved on assets(approved);
create index if not exists idx_assets_orientation on assets(orientation);
create index if not exists idx_assets_dimensions on assets(width, height);
create index if not exists idx_assets_fingerprint on assets(fingerprint);
create index if not exists idx_assets_ai_description on assets(ai_description) where ai_description is not null;
create index if not exists idx_asset_tags_asset_id on asset_tags(asset_id);
create index if not exists idx_asset_tags_tag_id on asset_tags(tag_id);
create index if not exists idx_memory_books_user_id on memory_books(user_id);
create index if not exists idx_memory_books_status on memory_books(status);
create index if not exists idx_memory_books_print_size on memory_books(print_size);
create index if not exists idx_memory_books_ui on memory_books(ui);
create index if not exists idx_memory_books_format on memory_books(format);
create index if not exists idx_pdf_status_book_id on pdf_status(book_id);
create index if not exists idx_pdf_status_user_id on pdf_status(user_id);
create index if not exists idx_activity_log_user_id on activity_log(user_id);
create index if not exists idx_activity_log_action on activity_log(action);
create index if not exists idx_activity_log_timestamp on activity_log(timestamp);
create index if not exists idx_activity_log_session_time on activity_log(session_id, timestamp DESC);
create index if not exists idx_activity_log_page_time on activity_log(page_path, timestamp DESC);
create index if not exists idx_activity_log_geo_time on activity_log(country, region, timestamp DESC);
create index if not exists idx_activity_log_page_visits on activity_log(page_path, timestamp DESC) WHERE action = 'page_visit';
create index if not exists idx_activity_log_user_sessions on activity_log(user_id, session_id, timestamp DESC);
create index if not exists idx_themes_name on themes(name);
create index if not exists idx_themes_is_active on themes(is_active);
create index if not exists idx_themes_rounded on themes(rounded);
create index if not exists idx_themes_size on themes(size);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at before update on profiles for each row execute function update_updated_at_column();

drop trigger if exists update_families_updated_at on families;
create trigger update_families_updated_at before update on families for each row execute function update_updated_at_column();

drop trigger if exists update_tags_updated_at on tags;
create trigger update_tags_updated_at before update on tags for each row execute function update_updated_at_column();

drop trigger if exists update_assets_updated_at on assets;
create trigger update_assets_updated_at before update on assets for each row execute function update_updated_at_column();

drop trigger if exists update_memory_books_updated_at on memory_books;
create trigger update_memory_books_updated_at before update on memory_books for each row execute function update_updated_at_column();

drop trigger if exists update_pdf_status_updated_at on pdf_status;
create trigger update_pdf_status_updated_at before update on pdf_status for each row execute function update_updated_at_column();

drop trigger if exists update_themes_updated_at on themes;
create trigger update_themes_updated_at before update on themes for each row execute function update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Optionally, if you enrich JWTs with the user's role, you can enable this:
-- DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
-- CREATE POLICY "Admins can view all profiles" ON profiles
--   FOR SELECT
--   USING (auth.jwt() ->> 'role' = 'admin');

-- Families policies
DROP POLICY IF EXISTS "Users can manage own families" ON families;
CREATE POLICY "Users can manage own families" ON families FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Assets policies
DROP POLICY IF EXISTS "Users can manage own assets" ON assets;
CREATE POLICY "Users can manage own assets" ON assets FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Admin policy for assets (allows admins to view all assets)
DROP POLICY IF EXISTS "Admins can view all assets" ON assets;
CREATE POLICY "Admins can view all assets" ON assets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Editor policy for assets (allows editors to view all assets)
DROP POLICY IF EXISTS "Editors can view all assets" ON assets;
CREATE POLICY "Editors can view all assets" ON assets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (SELECT auth.uid())
      AND role = 'editor'
    )
  );

-- Memory books policies
DROP POLICY IF EXISTS "Users can manage own memory books" ON memory_books;
CREATE POLICY "Users can manage own memory books" ON memory_books FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Admin policy for memory books (allows admins to view all memory books)
DROP POLICY IF EXISTS "Admins can view all memory books" ON memory_books;
CREATE POLICY "Admins can view all memory books" ON memory_books 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Editor policy for memory books (allows editors to view all memory books)
DROP POLICY IF EXISTS "Editors can view all memory books" ON memory_books;
CREATE POLICY "Editors can view all memory books" ON memory_books 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (SELECT auth.uid())
      AND role = 'editor'
    )
  );

-- PDF status policies
DROP POLICY IF EXISTS "Users can manage own pdf status" ON pdf_status;
CREATE POLICY "Users can manage own pdf status" ON pdf_status FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Activity log policies
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
CREATE POLICY "Users can view own activity" ON activity_log FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own activity" ON activity_log;
CREATE POLICY "Users can insert own activity" ON activity_log FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- Function to create profile on user signup (with improved error handling)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if profile already exists to avoid duplicates
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the trigger
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id uuid,
  p_action text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.activity_log (user_id, action, details)
  VALUES (p_user_id, p_action, p_details);
END;
$$ language plpgsql security definer;

-- Create missing profiles for existing users (safe to rerun)
INSERT INTO public.profiles (user_id, email)
SELECT 
  au.id as user_id,
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Add any missing columns to profiles table (safe to rerun)
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'subscription_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_type text DEFAULT 'regular';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'deleted'
  ) THEN
    ALTER TABLE profiles ADD COLUMN deleted boolean DEFAULT false;
  END IF;
END $$;

-- Add constraints if they don't exist (safe to rerun)
DO $$
BEGIN
  -- Add unique constraint on user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
  
  -- Add check constraint for subscription_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_subscription_type_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_type_check 
      CHECK (subscription_type in ('regular', 'premium'));
  END IF;
  
  -- Add check constraint for role if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
      CHECK (role in ('user', 'editor', 'admin'));
  END IF;
END $$; 

-- Add new columns to themes table (safe to rerun)
DO $$
BEGIN
  -- Add card_default column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'card_default'
  ) THEN
    ALTER TABLE themes ADD COLUMN card_default boolean DEFAULT false;
  END IF;
  
  -- Add card_wizard column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'card_wizard'
  ) THEN
    ALTER TABLE themes ADD COLUMN card_wizard boolean DEFAULT false;
  END IF;
END $$; 

-- Add new columns to themes table (safe to rerun)
DO $$
BEGIN
  -- Add card_default column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'card_default'
  ) THEN
    ALTER TABLE themes ADD COLUMN card_default boolean DEFAULT false;
  END IF;
  
  -- Add card_wizard column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'card_wizard'
  ) THEN
    ALTER TABLE themes ADD COLUMN card_wizard boolean DEFAULT false;
  END IF;
END $$;

-- Add new columns for AI data (safe to rerun)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS ai_objects jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS ai_raw jsonb;

-- Add missing columns to memory_books table (safe to rerun)
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'ai_supplemental_prompt'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN ai_supplemental_prompt text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'magic_story'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN magic_story text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'layout_type'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN layout_type text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'page_count'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN page_count integer;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'print_size'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN print_size text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'quality'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN quality text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'medium'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN medium text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'theme'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN theme text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'background_url'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN background_url text CHECK (background_url IS NULL OR length(background_url) <= 1000);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'include_captions'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN include_captions boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'previously_used_assets'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN previously_used_assets uuid[] DEFAULT array[]::uuid[];
  END IF;
END $$; 

-- Add border fields to themes table (safe to rerun)
DO $$
BEGIN
  -- Add photo_border column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'photo_border'
  ) THEN
    ALTER TABLE themes ADD COLUMN photo_border integer DEFAULT 0;
  END IF;
  
  -- Add page_border column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'page_border'
  ) THEN
    ALTER TABLE themes ADD COLUMN page_border integer DEFAULT 0;
  END IF;
  
  -- Add page_border_offset column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'themes' 
      AND column_name = 'page_border_offset'
  ) THEN
    ALTER TABLE themes ADD COLUMN page_border_offset integer DEFAULT 5;
  END IF;
END $$; 

-- Add missing fields and make fields optional for draft/template status (safe to rerun)
DO $$
BEGIN
  -- Add photo_selection_method column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'photo_selection_method'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN photo_selection_method text;
  END IF;
  
  -- Update status check constraint to include 'template' status
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'memory_books_status_check' 
    AND table_name = 'memory_books'
    AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE memory_books DROP CONSTRAINT memory_books_status_check;
  END IF;
  
  ALTER TABLE memory_books ADD CONSTRAINT memory_books_status_check 
    CHECK (status in ('draft', 'template', 'ready', 'background_ready', 'approved', 'distributed'));
    
  -- Create a function to validate optional fields based on status
  CREATE OR REPLACE FUNCTION validate_memory_book_fields()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Skip validation if we're just marking as deleted
    IF NEW.deleted = true AND (OLD.deleted = false OR OLD.deleted IS NULL) THEN
      RETURN NEW;
    END IF;
    
    -- For draft and template status, allow empty/null values for certain fields
    IF NEW.status IN ('draft', 'template') THEN
      -- Allow empty magic_story for draft/template status
      IF NEW.magic_story IS NOT NULL AND NEW.magic_story = '' THEN
        NEW.magic_story := NULL;
      END IF;
      
      -- Allow empty created_from_assets for draft/template status
      IF NEW.created_from_assets IS NOT NULL AND array_length(NEW.created_from_assets, 1) = 0 THEN
        NEW.created_from_assets := NULL;
      END IF;
      
      -- Allow empty photo_selection_pool for draft/template status
      IF NEW.photo_selection_pool IS NOT NULL AND array_length(NEW.photo_selection_pool, 1) = 0 THEN
        NEW.photo_selection_pool := NULL;
      END IF;
      
      RETURN NEW;
    END IF;
    
    -- For other statuses, ensure required fields are present
    IF NEW.status NOT IN ('draft', 'template') THEN
      -- Require created_from_assets for non-draft statuses
      IF NEW.created_from_assets IS NULL OR array_length(NEW.created_from_assets, 1) = 0 THEN
        RAISE EXCEPTION 'Created from assets is required when status is not draft/template';
      END IF;
    END IF;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  -- Create trigger to validate fields based on status
  DROP TRIGGER IF EXISTS validate_memory_book_fields_trigger ON memory_books;
  CREATE TRIGGER validate_memory_book_fields_trigger
    BEFORE INSERT OR UPDATE ON memory_books
    FOR EACH ROW
    EXECUTE FUNCTION validate_memory_book_fields();
    
END $$; 


-- Add ai_photo_selection_reasoning column if it doesn't exist (safe to rerun)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'ai_photo_selection_reasoning'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN ai_photo_selection_reasoning text;
  END IF;
END $$; 


-- User backups table for storing complete user data backups
create table if not exists user_backups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  backup_data jsonb not null,
  created_by uuid not null,
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false
);

-- Index for efficient queries
create index if not exists idx_user_backups_user_id on user_backups(user_id);
create index if not exists idx_user_backups_created_by on user_backups(created_by);
create index if not exists idx_user_backups_created_at on user_backups(created_at);
create index if not exists idx_user_backups_status on user_backups(status);

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_user_backups_user_id'
      AND table_name = 'user_backups'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE user_backups
      ADD CONSTRAINT fk_user_backups_user_id
      FOREIGN KEY (user_id) REFERENCES profiles(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_user_backups_created_by'
      AND table_name = 'user_backups'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE user_backups
      ADD CONSTRAINT fk_user_backups_created_by
      FOREIGN KEY (created_by) REFERENCES profiles(user_id);
  END IF;
END $$;

-- Create trigger for updated_at
drop trigger if exists update_user_backups_updated_at on user_backups;
create trigger update_user_backups_updated_at before update on user_backups for each row execute function update_updated_at_column();

-- Enable RLS
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_backups (admin only)
DROP POLICY IF EXISTS "Admins can manage user backups" ON user_backups;
CREATE POLICY "Admins can manage user backups" ON user_backups 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  ); 

