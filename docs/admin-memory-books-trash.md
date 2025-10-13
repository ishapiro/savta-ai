# Admin Memory Books Trash Feature

## Overview
Added a comprehensive trash management system for memory books on the admin page at `/app/admin`, allowing admins to view, manage, and permanently delete trashed memory books for specific users.

## Features

### 1. Trash Button
- **Location**: Memory Books tab, in the controls section (next to search and filters)
- **Icon**: Trash icon (`pi-trash`)
- **Functionality**: Opens trash dialog showing deleted memory books for the selected user
- **Visibility**: Only shown when a user is selected

### 2. Trash Dialog
- **Header**: "Memory Books Trash"
- **User Context**: Shows the selected user's email and count of trashed books
- **Content**: DataTable displaying all deleted memory books for that user
- **Columns**:
  - Supplemental Prompt (sortable)
  - Status (with tags)
  - Deleted (timestamp, sortable)
  - Actions (View, Permanent Delete)

### 3. Individual Permanent Delete
- **Button**: "Delete" button with trash icon on each row
- **Confirmation Dialog**: 
  - Shows warning about permanent deletion
  - Displays supplemental prompt of the book
  - Cancel and "Permanently Delete" buttons
- **Security**: 
  - Verifies book is marked `deleted=true`
  - Verifies book belongs to selected user
  - Uses triple-condition WHERE clause: `id`, `user_id`, `deleted=true`

### 4. Empty Trash
- **Button**: "Empty Trash" in dialog footer (only shown if trash has items)
- **Confirmation Dialog**:
  - Shows count of books to be deleted
  - Shows user email
  - Warning about permanent deletion
  - Cancel and "Empty Trash" buttons
- **Security**:
  - Only deletes books for selected user
  - Only deletes books where `deleted=true`
  - Uses double-condition WHERE clause: `user_id`, `deleted=true`

## Implementation Details

### State Variables (lines 3430-3438)
```javascript
const showMemoryBooksTrashDialog = ref(false)
const deletedMemoryBooks = ref([])
const loadingDeletedBooks = ref(false)
const showPermanentDeleteBookConfirmDialog = ref(false)
const bookToPermanentDelete = ref(null)
const deletingBookPermanently = ref(false)
const showEmptyTrashConfirmDialog = ref(false)
const emptyingTrash = ref(false)
```

### Functions

#### `openMemoryBooksTrash()` (line 5806)
- Opens trash dialog
- Loads deleted memory books for selected user

#### `loadDeletedMemoryBooks(userId)` (line 5813)
- Queries memory books with `deleted=true` for specific user
- Orders by `deleted_at` descending
- Handles loading states and errors

#### `confirmPermanentDeleteBook(book)` (line 5854)
- Sets book to delete
- Opens confirmation dialog

#### `permanentDeleteBookConfirmed()` (line 5864)
- **Security Check**: Verifies book exists, is deleted, and belongs to user
- Permanently deletes from database
- Reloads trash after deletion
- Toast notification on success/failure

#### `confirmEmptyTrash()` (line 5933)
- Opens empty trash confirmation dialog

#### `emptyTrashConfirmed()` (line 5941)
- Permanently deletes ALL books where `user_id` matches AND `deleted=true`
- Shows count of deleted books in toast
- Reloads trash (should be empty)
- Toast notification on success/failure

### UI Components

#### Trash Dialog (lines 3059-3168)
- Large width dialog (90vw, max 1200px)
- User context banner
- Loading state with spinner
- DataTable with pagination (10 rows default)
- Empty state when no trashed books
- Footer with Empty Trash, Refresh, and Close buttons

#### Permanent Delete Confirmation (lines 3170-3208)
- Red warning banner
- Shows supplemental prompt
- Loading state on delete button

#### Empty Trash Confirmation (lines 3210-3248)
- Red warning banner
- Shows count and user email
- Loading state on empty trash button

## Security Measures

### User-Specific Operations
All delete operations include `user_id` in WHERE clause to ensure:
- Admins can only delete books for the selected user
- No cross-user data deletion possible

### Soft Delete Verification
Permanent delete operations verify `deleted=true`:
```javascript
.eq('user_id', userId)
.eq('deleted', true)
```

This prevents accidental permanent deletion of active books.

### Triple Verification for Single Delete
Individual permanent delete includes extra verification step:
1. Query to verify book exists
2. Check user_id matches
3. Check deleted=true
4. Only then proceed with DELETE

### Service Role Key
Uses admin service role key for all database operations:
```javascript
const supabase = createClient(
  config.public.supabaseUrl,
  config.supabaseServiceRoleKey || config.public.supabaseKey
)
```

## User Experience Flow

### Viewing Trash
1. Admin selects a user from dropdown
2. User's memory books are displayed
3. Admin clicks "Trash" button
4. Trash dialog opens showing deleted books for that user
5. Empty state if no trashed books

### Permanent Delete Single Book
1. In trash dialog, admin clicks "Delete" on a book
2. Confirmation dialog shows with warning
3. Admin confirms deletion
4. Book is permanently removed from database
5. Success toast appears
6. Trash list refreshes

### Empty Trash
1. In trash dialog, admin clicks "Empty Trash"
2. Confirmation dialog shows count and user
3. Admin confirms emptying trash
4. ALL trashed books for user are permanently deleted
5. Success toast shows count deleted
6. Trash list refreshes (empty)

### Refresh
1. Admin can click "Refresh" to reload trash
2. Useful after external changes

## Files Modified
- `/home/irvshapiro/drvax_code/savta-ai/pages/app/admin.vue`

## Testing Checklist
- [x] Trash button appears when user is selected
- [x] Trash dialog loads only selected user's deleted books
- [x] Individual delete verifies user ownership
- [x] Individual delete only works on deleted=true books
- [x] Empty trash only deletes selected user's books
- [x] Empty trash only deletes deleted=true books
- [x] Toast notifications show appropriate messages
- [x] Trash refreshes after deletions
- [x] No linter errors

## Database Queries

### Load Deleted Books
```sql
SELECT * FROM memory_books 
WHERE user_id = $1 
AND deleted = true 
ORDER BY deleted_at DESC
```

### Permanent Delete Single
```sql
DELETE FROM memory_books 
WHERE id = $1 
AND user_id = $2 
AND deleted = true
```

### Empty Trash
```sql
DELETE FROM memory_books 
WHERE user_id = $1 
AND deleted = true
```

## Notes
- All deletions are permanent (cannot be undone)
- Multiple warning dialogs protect against accidental deletion
- User context is always displayed to prevent confusion
- All operations are scoped to selected user for safety

