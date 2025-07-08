# Database Fix Instructions for Savta AI

## Issues Identified

1. **Profile Creation Issue**: The `handle_new_user()` trigger function wasn't working properly, causing PGRST116 errors when trying to fetch profiles.
2. **Storage Policies**: The storage policies were using folder-based access control that conflicted with the upload approach.
3. **Assets Table RLS**: Conflicting RLS policies for the assets table were causing upload failures.
4. **Missing Profile Handling**: The frontend wasn't handling missing profiles gracefully.

## Fixes Applied

### 1. Database Schema Fixes (`supabase/fix-database.sql`)

- **Improved Profile Creation**: Enhanced the `handle_new_user()` function with better error handling and duplicate prevention.
- **Simplified Storage Policies**: Changed from folder-based to simple authenticated user access.
- **Fixed Assets RLS**: Removed conflicting policies and created a single comprehensive policy.
- **Profile Recovery**: Added logic to create missing profiles for existing users.

### 2. Frontend Fixes (`composables/useDatabase.js`)

- **Profile Recovery**: Added automatic profile creation when a profile is missing.
- **Simplified File Upload**: Changed file naming to work with the new storage policies.

### 3. Storage Policy Updates (`supabase/storage.sql`)

- **Simplified Access**: Changed from user-specific folder access to authenticated user access.
- **Admin Policies**: Maintained admin access to all assets.

## Steps to Apply the Fix

### Step 1: Run the Database Fix

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the `supabase/fix-database.sql` script

### Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name: `assets`
4. Check "Public bucket"
5. Click "Create bucket"

### Step 3: Apply Storage Policies

1. In SQL Editor, run the `supabase/storage.sql` script

### Step 4: Test the Fix

1. Try uploading a file in your application
2. Check the browser console for any remaining errors
3. Verify that profiles are being created properly

## What Each Fix Addresses

### Profile Issues (PGRST116 Error)
- **Root Cause**: Profile creation trigger wasn't working reliably
- **Fix**: Enhanced trigger function with better error handling and duplicate prevention
- **Fallback**: Frontend now creates profiles automatically if missing

### Storage Upload Issues (403 Error)
- **Root Cause**: Storage policies expected folder-based organization
- **Fix**: Simplified to allow any authenticated user to upload to the assets bucket
- **File Naming**: Changed from `${user_id}/${timestamp}-filename` to `${timestamp}-filename`

### Assets Table Issues (42501 Error)
- **Root Cause**: Conflicting RLS policies for INSERT operations
- **Fix**: Single comprehensive policy that handles all operations based on user_id

## Verification

After applying the fixes, you should see:

1. ✅ No more PGRST116 errors when fetching profiles
2. ✅ Successful file uploads to storage
3. ✅ Successful asset record creation in the database
4. ✅ Proper user-based access control maintained

## Troubleshooting

If you still see errors:

1. **Check Storage Bucket**: Ensure the `assets` bucket exists and is public
2. **Verify RLS Policies**: Check that all tables have RLS enabled with proper policies
3. **Test Profile Creation**: Try creating a new user account to test the trigger
4. **Check Console Logs**: Look for any remaining error messages

## Manual Profile Creation (if needed)

If profiles are still missing, you can manually create them:

```sql
INSERT INTO public.profiles (user_id, email)
SELECT 
  au.id as user_id,
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;
```

## Security Notes

- The storage policies now allow any authenticated user to access the assets bucket
- User-specific access control is handled at the database level (assets table)
- Admin users still have full access to all assets
- The system maintains proper user isolation through RLS policies 