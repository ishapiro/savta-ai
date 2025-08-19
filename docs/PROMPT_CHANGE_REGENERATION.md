# Prompt Change Regeneration Feature

## Overview

This feature ensures that when a user changes the `ai_supplemental_prompt` and clicks "Recreate", both the photo selection process and story generation are rerun with the updated prompt. This allows users to completely regenerate their memory books with new themes, locations, or contexts.

## Problem Solved

Previously, when users clicked "Recreate" on a memory book, the system would only regenerate the PDF layout without considering that the prompt might have changed. This meant:
- Photo selection wasn't rerun with the new prompt
- Story generation used the old selected photos
- Location-based photo selection improvements weren't applied to updated prompts

## Solution

The system now detects prompt changes and forces complete regeneration:

1. **Frontend Flow**: When user clicks "Recreate", they can update the description (ai_supplemental_prompt)
2. **Backend Reset**: The reset-for-regeneration endpoint clears photo selection and story data
3. **AI Regeneration**: PDF generation detects missing data and reruns both photo selection and story generation with the new prompt

## Technical Implementation

### 1. Frontend Changes (No Changes Required)

The existing frontend already handles prompt updates correctly:
- Shows dialog to update description when recreating theme-based books
- Updates `ai_supplemental_prompt` in the database
- Calls reset-for-regeneration endpoint
- Triggers PDF generation

### 2. Backend Changes

**File**: `server/api/memory-books/reset-for-regeneration.post.js`

Updated to clear photo selection and story data:

```javascript
// Reset fields for regeneration - clear photo selection and story to force regeneration
const { error: updateError } = await supabase
  .from('memory_books')
  .update({
    status: 'draft',
    background_url: null,
    pdf_url: null,
    created_from_assets: null,        // ← NEW: Clear selected photos
    magic_story: null,                // ← NEW: Clear generated story  
    ai_photo_selection_reasoning: null // ← NEW: Clear selection reasoning
  })
  .eq('id', bookId)
```

### 3. PDF Generation Logic (No Changes Required)

The existing PDF generation logic already detects missing data correctly:

```javascript
// Call magic memory endpoint only if we don't have both selected assets and story
if ((!book.created_from_assets || book.created_from_assets.length === 0) && 
    (!book.magic_story || book.magic_story.trim() === '')) {
  // Will now call magic memory endpoint with updated prompt
}
```

### 4. Magic Memory Endpoint (No Changes Required)

The magic memory endpoint already:
- Fetches the current `ai_supplemental_prompt` from the database
- Uses `selectPhotosByAttributes()` with the prompt for location-based selection
- Generates new story with selected photos
- Saves new `ai_photo_selection_reasoning`

## User Experience Flow

### Before Changes
1. User clicks "Recreate" → Only PDF layout regenerated
2. Same photos, same story, different visual layout
3. Prompt changes had no effect on content

### After Changes
1. User clicks "Recreate" → Dialog to update description
2. User updates prompt (e.g., "Family vacation" → "Chicago vacation")
3. System clears old photo selection and story
4. AI selects new photos based on updated prompt (prioritizing Chicago photos)
5. AI generates new story with newly selected photos
6. User gets completely fresh content matching their new prompt

## Example Scenarios

### Scenario 1: Location Change
- **Original**: "Family vacation" → Generic vacation photos
- **Updated**: "Chicago vacation" → Chicago skyline, Millennium Park, etc.
- **Result**: New photos from Chicago area, new story about Chicago attractions

### Scenario 2: Theme Change  
- **Original**: "Summer activities" → Beach, outdoor photos
- **Updated**: "Winter holidays" → Christmas, indoor family photos
- **Result**: Seasonal photos selected, winter-themed story generated

### Scenario 3: People Focus Change
- **Original**: "Family memories" → Mixed family photos
- **Updated**: "Grandparents with grandchildren" → Focus on specific people
- **Result**: Photos filtered for specific people, story about those relationships

## Benefits

1. **Complete Regeneration**: Users get entirely new content, not just new layouts
2. **Location Awareness**: Updated prompts with locations trigger location-based photo selection
3. **Thematic Consistency**: New photos and stories match the updated theme
4. **User Control**: Users can iteratively refine their memory books by adjusting prompts

## Technical Details

### Database Fields Cleared on Reset
- `created_from_assets`: Array of selected photo IDs → `null`
- `magic_story`: Generated story text → `null` 
- `ai_photo_selection_reasoning`: AI's selection explanation → `null`
- `status`: Changed to `'draft'` to trigger regeneration
- `background_url`: Cleared → `null`
- `pdf_url`: Cleared → `null`

### Detection Logic
The PDF generation uses this condition to detect when regeneration is needed:
```javascript
const needsRegeneration = (!book.created_from_assets || book.created_from_assets.length === 0) && 
                          (!book.magic_story || book.magic_story.trim() === '')
```

### AI Selection Process
1. Fetch updated `ai_supplemental_prompt` from database
2. Extract location/theme information from prompt
3. Use `selectPhotosByAttributes()` with location prioritization
4. Generate story with newly selected photos
5. Save selection reasoning for user transparency

## Backward Compatibility

- Existing memory books continue to work normally
- No database schema changes required
- Frontend dialogs already exist for prompt updates
- No breaking changes to existing APIs

## Testing

A test script is available at `tests/test_prompt_change_regeneration.js` that validates:
- Logic flow correctness
- Field clearing behavior
- Detection mechanisms
- Expected outcomes

Run with: `node tests/test_prompt_change_regeneration.js`
