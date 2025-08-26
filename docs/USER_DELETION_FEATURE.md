# User Deletion Feature

## Overview

The user deletion feature provides administrators with the ability to completely remove users from the system, including all their data, files, and authentication accounts. This feature includes comprehensive safety measures to prevent data loss.

## Safety Measures

### 1. Automatic Backup Creation
- **Before any deletion occurs**, a complete backup is automatically created
- The backup includes all user data:
  - User profile and settings
  - All uploaded assets (photos, text)
  - Memory books and PDFs
  - Family information
  - Activity logs and email events
  - Storage files (with download URLs)
- Backup is stored in the `user_backups` table with status 'completed'
- Backup ID is returned in the deletion response for future reference

### 2. Comprehensive Data Removal
The deletion process removes data in the following order to respect foreign key constraints:

1. **PDF Status Records** - Memory book generation status
2. **Memory Books** - All user's memory books and PDFs
3. **Asset Tags** - Tags associated with user assets
4. **Assets** - All uploaded photos and text content
5. **Families** - Family member information
6. **Email Events** - Email tracking and delivery records
7. **Activity Logs** - User activity history
8. **User Profile** - Main user profile record
9. **Storage Files** - All files in user's storage folder
10. **Supabase Auth User** - Authentication account

### 3. Prevention Safeguards
- **Admin-only access**: Only users with 'admin' role can delete users
- **Self-deletion prevention**: Admins cannot delete their own accounts
- **Confirmation dialog**: Requires explicit confirmation before deletion
- **Detailed warnings**: Clear explanation of what will be deleted
- **Activity logging**: All deletion actions are logged for audit purposes

## Usage

### Admin Interface
1. Navigate to the Admin Dashboard
2. Go to the "👥 Users" tab
3. Find the user you want to delete
4. Click the red trash icon (🗑️) next to the user
5. Review the confirmation dialog carefully
6. Click "Delete User" to proceed

### API Endpoint
```
POST /api/users/delete/{user_id}
```

**Headers:**
- `Authorization: Bearer {admin_token}`
- `Content-Type: application/json`

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "backup_id": "uuid-of-created-backup",
  "deletion_summary": {
    "user_email": "user@example.com",
    "backup_created": true,
    "database_deletions": {
      "pdf_status": { "success": true, "count": 2 },
      "memory_books": { "success": true, "count": 5 },
      "assets": { "success": true, "count": 25 },
      // ... other tables
    },
    "storage_deletion": {
      "success": true,
      "filesDeleted": 30,
      "errors": []
    },
    "auth_deletion": {
      "success": true,
      "error": null
    }
  }
}
```

## Restoring Deleted Users

If a user needs to be restored:

1. **From Backup**: Use the backup created during deletion
   - Go to Admin Dashboard → Users tab
   - Click "View Backups" button
   - Find the backup for the deleted user
   - Click the restore button (↩️)
   - Choose whether to overwrite existing user or create new

2. **Backup Details**: Each backup contains:
   - Complete user profile data
   - All database records
   - File metadata and download URLs
   - Timestamp and admin who performed deletion

## Error Handling

The deletion process is designed to be robust:

- **Partial failures**: If some operations fail, others continue
- **Detailed reporting**: Each step reports success/failure status
- **Graceful degradation**: System remains stable even if deletion fails
- **Error logging**: All errors are logged for debugging

## Security Considerations

- **Admin authentication**: Requires valid admin session
- **Audit trail**: All deletions are logged with admin details
- **Data privacy**: Complete removal of user data for GDPR compliance
- **Backup retention**: Backups are kept for potential restoration needs

## Monitoring

Monitor deletion operations through:

1. **Activity Logs**: Check `activity_log` table for `user_deleted` actions
2. **Backup Records**: Review `user_backups` table for deletion backups
3. **System Logs**: Server logs contain detailed deletion progress
4. **Admin Dashboard**: Success/error messages in the UI

## Best Practices

1. **Always review** the user's data before deletion
2. **Communicate** with users before deleting their accounts
3. **Keep backups** for a reasonable retention period
4. **Monitor** deletion operations for any issues
5. **Document** reasons for user deletions
6. **Test** the restore process periodically

## Troubleshooting

### Common Issues

1. **Deletion fails**: Check if user has active processes (PDF generation, etc.)
2. **Storage errors**: Verify storage bucket permissions
3. **Auth deletion fails**: Check if user is currently logged in
4. **Backup creation fails**: Ensure backup storage is accessible

### Recovery Steps

1. Check server logs for specific error messages
2. Verify admin permissions and authentication
3. Ensure all required services are running
4. Contact system administrator if issues persist

## Database Schema

The deletion process works with these tables:

- `profiles` - User profiles
- `families` - Family information
- `assets` - Uploaded content
- `memory_books` - Generated books
- `pdf_status` - Generation status
- `email_events` - Email tracking
- `activity_log` - User activity
- `user_backups` - Backup storage
- `auth.users` - Supabase authentication

## API Rate Limits

- Deletion operations are resource-intensive
- Consider implementing rate limiting for production use
- Monitor system performance during bulk deletions
