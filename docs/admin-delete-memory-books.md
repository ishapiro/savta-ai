# Admin Delete Memory Books Feature

## Overview
Added the ability for admins to delete (soft delete) memory books on the admin page at `/app/admin`.

## Implementation Details

### 1. UI Changes (`pages/app/admin.vue`)

#### Added Delete Button
- **Location**: Actions column in Memory Books DataTable (line 319-324)
- **Icon**: `pi-trash` (trash icon)
- **Styling**: Red delete button (`bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover`)
- **Action**: Opens confirmation dialog when clicked

#### Added Confirmation Dialog
- **Location**: Template section (lines 3019-3050)
- **Header**: "Trash Memory Book"
- **Message**: Shows supplemental prompt and confirms deletion
- **Buttons**: 
  - Cancel: Closes dialog
  - Trash: Confirms deletion (with loading state)

### 2. State Variables (lines 3227-3230)
```javascript
const showDeleteBookConfirmDialog = ref(false)
const bookToDelete = ref(null)
const deletingBook = ref(false)
```

### 3. Functions (lines 5548-5611)

#### `confirmDeleteBook(book)`
- Sets the book to delete
- Opens confirmation dialog

#### `cancelDeleteBook()`
- Closes dialog
- Resets state

#### `deleteBookConfirmed()`
- Performs soft delete using Supabase service role key
- Updates `deleted: true` and `deleted_at: timestamp`
- Shows success/error toast notification
- Reloads books for selected user
- Handles errors gracefully

## Technical Approach

### Admin Permission Handling
- Uses **service role key** directly (not the regular delete API endpoint)
- Bypasses the `user_id` ownership check (admins can delete any user's books)
- Follows the pattern used by other admin operations on this page

### Soft Delete Pattern
- Sets `deleted = true` and `deleted_at = timestamp`
- Books remain in database but filtered from views
- Consistent with project's soft delete architecture

### Data Refresh
- Automatically reloads books after deletion
- API endpoint filters `deleted = false` by default
- Deleted books immediately disappear from the list

## Files Modified
- `/home/irvshapiro/drvax_code/savta-ai/pages/app/admin.vue`

## Testing Checklist
- [x] Delete button appears in Actions column
- [x] Confirmation dialog shows book title
- [x] Soft delete updates database correctly
- [x] Toast notification shows success message
- [x] Books list refreshes after deletion
- [x] Deleted books are filtered from display
- [x] No linter errors

## User Experience
1. Admin selects a user from dropdown
2. Memory books for that user are displayed (with supplemental prompts)
3. Admin clicks trash icon on any book
4. Confirmation dialog appears with supplemental prompt
5. Admin confirms by clicking "Trash"
6. Success message appears with supplemental prompt
7. Book disappears from list (soft deleted)

## Display Updates
- **Column Header**: Changed from "Title" to "Supplemental Prompt"
- **Field Displayed**: Shows `ai_supplemental_prompt` instead of `title`
- **Empty State**: Shows "No prompt" when `ai_supplemental_prompt` is empty
- **Sortable**: Column remains sortable by supplemental prompt

