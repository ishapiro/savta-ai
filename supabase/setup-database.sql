-- Complete database setup for Savta AI
-- This script creates all tables and sets up RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS asset_tags CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS memory_books CASCADE;
DROP TABLE IF EXISTS memory_preferences CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS email_subscriptions CASCADE;

-- Email subscriptions table
CREATE TABLE email_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  address text,
  subscription_type text DEFAULT 'regular' CHECK (subscription_type in ('regular', 'premium')),
  role text DEFAULT 'user' CHECK (role in ('user', 'editor', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  deleted boolean DEFAULT false,
  UNIQUE(user_id)
);

-- Tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  deleted boolean DEFAULT false
);

-- Families table
CREATE TABLE families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  contact_info jsonb,
  delivery_method text DEFAULT 'email' CHECK (delivery_method in ('email', 'print', 'whatsapp')),
  frequency text DEFAULT 'monthly' CHECK (frequency in ('weekly', 'monthly', 'quarterly')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  deleted boolean DEFAULT false
);

-- Memory preferences table
CREATE TABLE memory_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  layout_type text DEFAULT 'standard' CHECK (layout_type in ('standard', 'modern', 'vintage', 'minimal')),
  page_count integer DEFAULT 20 CHECK (page_count between 10 and 100),
  print_size text DEFAULT 'a4' CHECK (print_size in ('a4', 'a5', 'letter', 'square')),
  quality text DEFAULT 'standard' CHECK (quality in ('standard', 'premium', 'ultra')),
  medium text DEFAULT 'digital' CHECK (medium in ('digital', 'print', 'both')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  deleted boolean DEFAULT false,
  UNIQUE(user_id)
);

-- Assets table
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type in ('photo', 'text')),
  storage_url text,
  user_caption text,
  ai_caption text,
  tags text[] DEFAULT array[]::text[],
  people_detected jsonb DEFAULT '[]'::jsonb,
  ai_processed boolean DEFAULT false,
  approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  deleted boolean DEFAULT false
);

-- Asset tags junction table (many-to-many)
CREATE TABLE asset_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(asset_id, tag_id)
);

-- Memory books table
CREATE TABLE memory_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text DEFAULT 'draft' CHECK (status in ('draft', 'ready', 'approved', 'distributed')),
  pdf_url text,
  review_notes text,
  created_from_assets uuid[] DEFAULT array[]::uuid[],
  generated_at timestamp with time zone,
  approved_at timestamp with time zone,
  distributed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  deleted boolean DEFAULT false
);

-- Activity log table
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_families_user_id ON families(user_id);
CREATE INDEX idx_memory_preferences_user_id ON memory_preferences(user_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_approved ON assets(approved);
CREATE INDEX idx_asset_tags_asset_id ON asset_tags(asset_id);
CREATE INDEX idx_asset_tags_tag_id ON asset_tags(tag_id);
CREATE INDEX idx_memory_books_user_id ON memory_books(user_id);
CREATE INDEX idx_memory_books_status ON memory_books(status);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memory_preferences_updated_at BEFORE UPDATE ON memory_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memory_books_updated_at BEFORE UPDATE ON memory_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
CREATE POLICY "Users can create own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Families policies
DROP POLICY IF EXISTS "Users can manage own families" ON families;
CREATE POLICY "Users can manage own families" ON families FOR ALL USING (auth.uid() = user_id);

-- Memory preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON memory_preferences;
CREATE POLICY "Users can manage own preferences" ON memory_preferences FOR ALL USING (auth.uid() = user_id);

-- Assets policies
DROP POLICY IF EXISTS "Users can manage own assets" ON assets;
CREATE POLICY "Users can manage own assets" ON assets FOR ALL USING (auth.uid() = user_id);

-- Memory books policies
DROP POLICY IF EXISTS "Users can manage own memory books" ON memory_books;
CREATE POLICY "Users can manage own memory books" ON memory_books FOR ALL USING (auth.uid() = user_id);

-- Activity log policies
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
CREATE POLICY "Users can view own activity" ON activity_log FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity" ON activity_log;
CREATE POLICY "Users can insert own activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
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