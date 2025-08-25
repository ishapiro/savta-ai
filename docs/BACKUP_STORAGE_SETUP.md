# Backup Storage Setup Instructions

## Overview
The backup system requires a dedicated storage bucket with proper policies to ensure only admins can access backup files.

## Step 1: Create Backup Storage Bucket

1. Go to **Supabase Dashboard** > **Storage**
2. Click **"Create a new bucket"**
3. Set the following:
   - **Name**: `backups`
   - **Public bucket**: ❌ **Uncheck** (keep private for security)
4. Click **"Create bucket"**

## Step 2: Set Up Storage Policies

In **Supabase Dashboard** > **Storage** > **Policies**, add the following policies for the `backups` bucket:

### Upload Policy
- **Policy Name**: `Admins can upload backup files`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'backups' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid()
  AND role = 'admin'
))
```

### View Policy
- **Policy Name**: `Admins can view backup files`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'backups' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid()
  AND role = 'admin'
))
```

### Update Policy
- **Policy Name**: `Admins can update backup files`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'backups' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid()
  AND role = 'admin'
))
```

### Delete Policy
- **Policy Name**: `Admins can delete backup files`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'backups' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid()
  AND role = 'admin'
))
```

## Step 3: Verify Setup

After setting up the policies, the backup system will:
1. ✅ Copy user files to backup storage
2. ✅ Maintain original folder structure
3. ✅ Allow admin-only access to backup files
4. ✅ Enable complete backup deletion

## Troubleshooting

### "Backup bucket not accessible" warning
- Check that the `backups` bucket exists
- Verify storage policies are correctly set
- Ensure the service role key has proper permissions

### "0 files copied" in backup logs
- This is normal for users with no assets
- Check if the user actually has files in the `assets` bucket
- Verify the backup bucket policies allow uploads

### Foreign key relationship errors
- The backup system now uses manual profile lookups
- No foreign key constraints are required for the backup functionality
