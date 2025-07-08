-- Reset script to drop all existing tables and functions
-- Run this before running the main schema.sql

-- Drop triggers first (with error handling)
DO $$ 
BEGIN
    -- Drop triggers if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_families_updated_at') THEN
        DROP TRIGGER IF EXISTS update_families_updated_at ON families;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_memory_preferences_updated_at') THEN
        DROP TRIGGER IF EXISTS update_memory_preferences_updated_at ON memory_preferences;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tags_updated_at') THEN
        DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assets_updated_at') THEN
        DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_memory_books_updated_at') THEN
        DROP TRIGGER IF EXISTS update_memory_books_updated_at ON memory_books;
    END IF;
END $$;

-- Drop functions (with error handling)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        DROP FUNCTION IF EXISTS public.handle_new_user();
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_activity') THEN
        DROP FUNCTION IF EXISTS public.log_activity(uuid, text, jsonb);
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP FUNCTION IF EXISTS update_updated_at_column();
    END IF;
END $$;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS memory_books CASCADE;
DROP TABLE IF EXISTS asset_tags CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS memory_preferences CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS email_subscriptions CASCADE;

-- Drop indexes (they should be dropped with tables, but just in case)
DROP INDEX IF EXISTS idx_profiles_user_id;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_families_user_id;
DROP INDEX IF EXISTS idx_memory_preferences_user_id;
DROP INDEX IF EXISTS idx_assets_user_id;
DROP INDEX IF EXISTS idx_assets_type;
DROP INDEX IF EXISTS idx_assets_approved;
DROP INDEX IF EXISTS idx_asset_tags_asset_id;
DROP INDEX IF EXISTS idx_asset_tags_tag_id;
DROP INDEX IF EXISTS idx_memory_books_user_id;
DROP INDEX IF EXISTS idx_memory_books_status;
DROP INDEX IF EXISTS idx_activity_log_user_id;
DROP INDEX IF EXISTS idx_activity_log_action;
DROP INDEX IF EXISTS idx_activity_log_timestamp;

-- Drop policies (they should be dropped with tables, but just in case)
DO $$ 
BEGIN
    -- Drop policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can create own profile') THEN
        DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Users can manage own families') THEN
        DROP POLICY IF EXISTS "Users can manage own families" ON families;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'memory_preferences' AND policyname = 'Users can manage own preferences') THEN
        DROP POLICY IF EXISTS "Users can manage own preferences" ON memory_preferences;
    END IF;
END $$; 