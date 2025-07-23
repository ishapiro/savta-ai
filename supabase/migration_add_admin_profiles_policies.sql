-- Migration: Add admin policies for profiles table
-- This allows admins to view and update all user profiles

-- Admin policy for profiles (allows admins to view all profiles)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admin policy for profiles (allows admins to update all profiles)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  ); 