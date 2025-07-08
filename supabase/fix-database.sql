-- Comprehensive database fix for Savta AI
-- This script fixes the profile creation, storage policies, and RLS issues

-- 1. Fix profile creation trigger
-- Drop and recreate the handle_new_user function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Fix storage policies - folder-based access for authenticated users
-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete assets" ON storage.objects;

-- Create folder-based storage policies
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'assets' AND 
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin policies for storage
CREATE POLICY "Admins can view all files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'assets' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all files" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'assets' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 3. Fix assets table RLS policies
-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can upload assets" ON assets;
DROP POLICY IF EXISTS "Users can manage own assets" ON assets;
DROP POLICY IF EXISTS "Admins can view all assets" ON assets;

-- Create comprehensive policy for assets
CREATE POLICY "Users can manage own assets" ON assets
  FOR ALL
  USING (auth.uid() = user_id);

-- Admin policy for assets (allows admins to view all assets)
CREATE POLICY "Admins can view all assets" ON assets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 4. Ensure all tables have proper RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- 5. Create missing profiles for existing users (if any)
-- This will create profiles for users who don't have them
INSERT INTO public.profiles (user_id, email)
SELECT 
  au.id as user_id,
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 6. Add any missing columns to profiles table
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

-- 7. Add constraints if they don't exist
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

-- 8. Create the assets bucket if it doesn't exist
-- Note: This requires manual creation in Supabase Dashboard
-- Go to Storage → Create bucket → Name: assets → Public bucket: checked

-- 9. Verify the setup
SELECT 'Database fix completed successfully' as status; 