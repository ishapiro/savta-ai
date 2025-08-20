# Memory Book Recreation - Different Photos Feature

## Overview

This feature ensures that when a user recreates a memory book, the AI selects different photos from the previous version, providing a fresh perspective while maintaining the same theme and story quality.

## Problem Solved

Previously, when users clicked "Recreate" on a memory book, the system would:
- Regenerate the story and layout
- But potentially use the same photos as the previous version
- This limited the variety and freshness of the recreation

## Solution

The system now:
1. **Stores previously used photos** when resetting for regeneration
2. **Excludes previously used photos** from the selection pool during recreation
3. **Provides clear feedback** about using different photos
4. **Handles edge cases** gracefully when no unused photos are available

## Technical Implementation

### 1. Database Changes

**New Column**: `previously_used_assets` in `memory_books` table
- Type: `uuid[]` (array of asset IDs)
- Default: `array[]::uuid[]`
- Purpose: Stores the asset IDs that were used in the previous version

### 2. Reset for Regeneration Endpoint

**File**: `server/api/memory-books/reset-for-regeneration.post.js`

Updated to store previously used photos before clearing them:

```javascript
// Store previously used photos before clearing them
const previouslyUsedPhotos = book.created_from_assets || []

// Reset fields for regeneration
const { error: updateError } = await supabase
  .from('memory_books')
  .update({
    status: 'draft',
    background_url: null,
    pdf_url: null,
    created_from_assets: null,
    magic_story: null,
    ai_photo_selection_reasoning: null,
    previously_used_assets: previouslyUsedPhotos // ← NEW: Store previously used photos
  })
  .eq('id', bookId)
```

### 3. Photo Selection Logic

**File**: `server/utils/openai-client.js`

Updated `selectPhotosByAttributes()` function to exclude previously used photos:

```javascript
async function selectPhotosByAttributes(assets, aiSupplementalPrompt, targetCount = 3, previouslyUsedAssetIds = []) {
  // Filter out previously used photos if provided
  let availableAssets = assets;
  if (previouslyUsedAssetIds && previouslyUsedAssetIds.length > 0) {
    availableAssets = assets.filter(asset => !previouslyUsedAssetIds.includes(asset.id));
    console.log(`🎯 Excluding ${previouslyUsedAssetIds.length} previously used photos. ${availableAssets.length} photos available for selection.`);
  }

  if (availableAssets.length === 0) {
    throw new Error('No photos available for selection after excluding previously used photos. Please add more photos to your collection.');
  }

  if (availableAssets.length < targetCount) {
    console.warn(`⚠️ Only ${availableAssets.length} photos available, but ${targetCount} requested. Using all available photos.`);
    targetCount = availableAssets.length;
  }
  
  // ... rest of selection logic using availableAssets
}
```

### 4. Magic Memory Endpoint

**File**: `server/api/ai/magic-memory.post.js`

Updated to pass previously used photos to selection function:

```javascript
// Get previously used photos to exclude them from selection
const previouslyUsedAssetIds = memoryBook.previously_used_assets || []

photoSelectionResult = await selectPhotosByAttributes(
  assets, 
  memoryBook.ai_supplemental_prompt, 
  photoCount, 
  previouslyUsedAssetIds
)
```

### 5. Enhanced User Feedback

The system now provides clear feedback about using different photos:

```javascript
// Add note about using different photos if this is a recreation
let finalReasoning = photoSelectionResult.reasoning
if (memoryBook.previously_used_assets && memoryBook.previously_used_assets.length > 0) {
  finalReasoning += ` (Using different photos from the previous version to give you a fresh perspective)`
}
```

## User Experience Flow

### Before Changes
1. User clicks "Recreate" → Same photos, new story/layout
2. Limited variety in recreations
3. Users might see the same photos repeatedly

### After Changes
1. User clicks "Recreate" → System stores current photos as "previously used"
2. AI selects from remaining unused photos in the pool
3. User gets fresh photos with new story/layout
4. Clear feedback that different photos were used

## Example Scenarios

### Scenario 1: Normal Recreation
- **Photo Pool**: 10 photos total
- **First Version**: Uses photos [1, 3, 5]
- **Recreation**: Selects from photos [2, 4, 6, 7, 8, 9, 10]
- **Result**: Completely different photos, fresh perspective

### Scenario 2: Limited Photo Pool
- **Photo Pool**: 3 photos total
- **First Version**: Uses photos [1, 2]
- **Recreation**: Uses remaining photo [3]
- **Result**: Different photo, but limited variety

### Scenario 3: Exhausted Photo Pool
- **Photo Pool**: 2 photos total
- **First Version**: Uses photos [1, 2]
- **Recreation**: No unused photos available
- **Result**: Clear error message asking user to add more photos

## Benefits

1. **Fresh Perspectives**: Each recreation provides genuinely different content
2. **Better User Experience**: Users see variety in their recreations
3. **Clear Feedback**: Users understand that different photos are being used
4. **Graceful Degradation**: System handles cases where no unused photos are available
5. **Preserved Quality**: AI still selects the best available photos for the theme

## Error Handling

### No Unused Photos Available
When all photos in the pool have been used previously:
- System throws clear error message
- Suggests user add more photos to collection
- Prevents infinite recreation loops

### Insufficient Photos
When fewer unused photos are available than requested:
- System uses all available unused photos
- Logs warning about reduced selection
- Continues with generation

## Testing

A comprehensive test suite is available at `tests/test_recreation_different_photos.js` that validates:
- Different photos are selected on recreation
- Previously used photos are properly excluded
- Error handling for exhausted photo pools
- Edge cases with limited photo collections

## Backward Compatibility

- Existing memory books continue to work normally
- No breaking changes to existing functionality
- New feature is opt-in (only affects recreations)
- Graceful fallback if `previously_used_assets` column doesn't exist

## Future Enhancements

Potential improvements for future versions:
1. **Photo Rotation**: Cycle through all available photos before reusing
2. **Smart Exclusion**: Exclude photos based on similarity, not just exact matches
3. **User Preferences**: Allow users to specify which photos to exclude/include
4. **Photo Scoring**: Weight photos based on how recently they were used
