# Updated Database Setup for Authenticated User Storage Access

## Current Setup

You have configured Supabase storage to allow authenticated users access to the `assets` bucket. This setup requires:

1. **Storage Level**: Any authenticated user can access the assets bucket
2. **Database Level**: User isolation is enforced through RLS policies on the `assets` table
3. **File Organization**: Files are organized in user-specific folders (`${user_id}/filename`)

## Security Model

### Storage Access
- ✅ Any authenticated user can upload to the `assets` bucket
- ✅ Users can only access files in their own folder (`${user_id}/`)
- ✅ Admins can access all files
- ✅ File paths are: `{user_id}/{timestamp}-{filename}`

### Database Access
- ✅ Users can only see their own assets in the `assets` table
- ✅ Users can only create/update/delete their own assets
- ✅ Admins can view all assets
- ✅ RLS policies enforce user isolation

## Updated Code Changes

### 1. Upload Function (`composables/useDatabase.js`)
- Uses user-specific folder structure: `${user_id}/${timestamp}-filename`
- Proper error handling for storage operations
- Creates asset records with user_id for database isolation

### 2. Storage Policies (`supabase/storage-policies-final.sql`)
- Folder-based access control using `storage.foldername(name)[1]`
- Users can only access files in their own folder
- Admin policies for full access

### 3. Database Policies (`supabase/schema.sql`)
- User-based RLS on `assets` table
- Admin policies for viewing all assets
- Proper user isolation at database level

## How It Works

### File Upload Flow
1. User uploads file → `uploadAsset()` function
2. File saved to: `assets/{user_id}/{timestamp}-filename`
3. Asset record created with `user_id` and `storage_url`
4. RLS ensures user can only see their own assets

### Security Layers
1. **Storage**: Folder-based access (user can only access their folder)
2. **Database**: RLS policies (user can only see their assets)
3. **Application**: User authentication required

## Testing the Setup

### 1. Test File Upload
```javascript
// This should work
const asset = await db.assets.uploadAsset({
  type: 'photo',
  user_caption: 'Test photo'
}, file)
```

### 2. Test Asset Retrieval
```javascript
// This should only return user's own assets
const assets = await db.assets.getAssets()
```

### 3. Test Cross-User Access
- User A should not be able to see User B's assets
- User A should not be able to access User B's files in storage

## Troubleshooting

### If uploads fail:
1. Check that the `assets` bucket exists and is public
2. Verify storage policies are applied correctly
3. Check browser console for specific error messages

### If assets aren't showing:
1. Verify RLS policies on the `assets` table
2. Check that user profiles exist
3. Ensure user authentication is working

### If cross-user access is possible:
1. Verify storage folder policies are working
2. Check database RLS policies
3. Test with different user accounts

## Manual Storage Policy Setup

If you need to set up storage policies manually in the Dashboard:

### For the `assets` bucket, add these policies:

**Insert Policy:**
- Name: `Users can upload to own folder`
- Target roles: `authenticated`
- Using expression: `bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]`

**Select Policy:**
- Name: `Users can view own files`
- Target roles: `authenticated`
- Using expression: `bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]`

**Update Policy:**
- Name: `Users can update own files`
- Target roles: `authenticated`
- Using expression: `bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]`

**Delete Policy:**
- Name: `Users can delete own files`
- Target roles: `authenticated`
- Using expression: `bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]`

## Benefits of This Setup

1. **Simple Storage Access**: Any authenticated user can upload
2. **Proper User Isolation**: Users can only access their own files
3. **Admin Access**: Admins can view all assets and files
4. **Scalable**: Works with any number of users
5. **Secure**: Multiple layers of access control

## Next Steps

1. Run `supabase/fix-database.sql` to apply all policies
2. Test file upload functionality
3. Verify user isolation works correctly
4. Test admin access if you have admin users 