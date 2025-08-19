# AI Photo Selection Reasoning Feature

## Overview

This feature adds the ability to save and display the AI's reasoning for photo selection in memory books. When the AI selects photos based on attributes, it now provides a detailed explanation of why those specific photos were chosen, and this reasoning is stored and displayed to users.

## Changes Made

### 1. Database Schema Update

**File**: `supabase/schema.sql`

- Added `ai_photo_selection_reasoning text` field to the `memory_books` table
- Added migration script to safely add the field to existing databases

```sql
-- Added to memory_books table
ai_photo_selection_reasoning text,

-- Migration script
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'memory_books' 
      AND column_name = 'ai_photo_selection_reasoning'
  ) THEN
    ALTER TABLE memory_books ADD COLUMN ai_photo_selection_reasoning text;
  END IF;
END $$;
```

### 2. Backend API Updates

**File**: `server/api/ai/magic-memory.post.js`

- Updated the memory book update to save the AI reasoning
- The reasoning comes from the `selectPhotosByAttributes()` function

```javascript
const { error: updateError } = await supabase
  .from('memory_books')
  .update({
    created_from_assets: selectedAssets.map(asset => asset.id),
    magic_story: story,
    ai_photo_selection_reasoning: photoSelectionResult.reasoning, // NEW
    status: 'draft',
    updated_at: new Date().toISOString()
  })
```

### 3. Frontend Display

**File**: `pages/app/memory-books/index.vue`

- Added a new section in the memory book detail dialog to display the reasoning
- Only shows when `selectedBook.ai_photo_selection_reasoning` exists
- Styled consistently with the existing story section

```vue
<!-- AI Photo Selection Reasoning Section -->
<div v-if="selectedBook.ai_photo_selection_reasoning" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 text-xs">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-accent/20 to-brand-highlight/20 rounded-full flex items-center justify-center flex-shrink-0">
      <i class="pi pi-lightbulb text-brand-accent text-sm sm:text-base"></i>
    </div>
    <div class="min-w-0 flex-1">
      <h3 class="text-base sm:text-lg font-bold text-brand-primary">Photo Selection Reasoning</h3>
      <p class="text-xs sm:text-sm text-gray-600">Why these photos were chosen for your memory</p>
    </div>
  </div>
  <div class="overflow-y-auto max-h-48 sm:max-h-64 bg-gradient-to-br from-brand-accent/10 to-brand-highlight/10 rounded-xl p-3 sm:p-4 border border-brand-accent/20 text-brand-primary text-sm" style="word-break: break-word; line-height: 1.5;">
    {{ selectedBook.ai_photo_selection_reasoning }}
  </div>
</div>
```

## How It Works

### 1. Photo Selection Process

When a user creates a magic memory:

1. The `selectPhotosByAttributes()` function analyzes photos based on the memory book's prompt
2. The AI returns both selected photo indices and reasoning for the selection
3. The reasoning explains why specific photos were chosen (location, date, content relevance, etc.)

### 2. Data Storage

The reasoning is saved to the database along with:
- Selected photo IDs (`created_from_assets`)
- Generated story (`magic_story`)
- Other memory book data

### 3. Display

The reasoning is displayed in the memory book detail dialog:
- Only appears when reasoning exists (graceful handling of empty values)
- Styled with a lightbulb icon to indicate AI insight
- Scrollable container for long reasoning text
- Consistent styling with other sections

## Example Reasoning

The AI might provide reasoning like:

> "Given the theme 'Chicago Vacation', I prioritized photos with parks and outdoor activities, which are typical of vacations and could be associated with city experiences like Chicago. Photos 12 and 13 both highlight family outings in Central Park, which suggests an outdoor, city-vacation vibe. Photo 19, showing a fun family group photo indoors, complements these with a sense of togetherness and joy typical of vacation memories. Together, these photos create a cohesive narrative of a family enjoying their time and each other's company."

## Benefits

1. **Transparency**: Users can understand why specific photos were chosen
2. **Trust**: Builds confidence in the AI's selection process
3. **Learning**: Users can see patterns in photo selection for future reference
4. **Debugging**: Helps identify when photo selection might not match expectations

## Backward Compatibility

- **Existing books**: Books created before this feature will have `null` reasoning (gracefully handled)
- **Database migration**: Safe to run multiple times
- **Frontend**: Only displays reasoning when it exists
- **API**: No breaking changes to existing endpoints

## Testing

A test script is available at `tests/test_photo_selection_reasoning.js` that:
- Verifies the database field exists
- Checks for existing books with reasoning
- Validates the field can be queried
- Provides summary statistics

## Future Enhancements

Potential improvements:
1. **Reasoning categories**: Break down reasoning by location, date, people, etc.
2. **User feedback**: Allow users to rate the reasoning quality
3. **Reasoning history**: Track changes in reasoning over time
4. **Export functionality**: Include reasoning in memory book exports
