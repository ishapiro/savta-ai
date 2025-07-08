-- Fix profiles table structure
-- This script adds missing columns and constraints to the profiles table

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_id uuid;
    RAISE NOTICE 'Added user_id column to profiles table';
  ELSE
    RAISE NOTICE 'user_id column already exists';
  END IF;
END $$;

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
    RAISE NOTICE 'Added email column to profiles table';
  ELSE
    RAISE NOTICE 'email column already exists';
  END IF;
END $$;

-- Add other missing columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name text;
    RAISE NOTICE 'Added first_name column to profiles table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_name text;
    RAISE NOTICE 'Added last_name column to profiles table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
    RAISE NOTICE 'Added phone column to profiles table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
    RAISE NOTICE 'Added address column to profiles table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'subscription_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_type text DEFAULT 'regular';
    RAISE NOTICE 'Added subscription_type column to profiles table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
    RAISE NOTICE 'Added role column to profiles table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'deleted'
  ) THEN
    ALTER TABLE profiles ADD COLUMN deleted boolean DEFAULT false;
    RAISE NOTICE 'Added deleted column to profiles table';
  END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
  -- Add unique constraint on user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
    RAISE NOTICE 'Added unique constraint on user_id';
  END IF;
  
  -- Add check constraint for subscription_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_subscription_type_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_type_check 
      CHECK (subscription_type in ('regular', 'premium'));
    RAISE NOTICE 'Added check constraint for subscription_type';
  END IF;
  
  -- Add check constraint for role if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
      CHECK (role in ('user', 'editor', 'admin'));
    RAISE NOTICE 'Added check constraint for role';
  END IF;
END $$; 