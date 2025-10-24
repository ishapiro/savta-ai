# Attribute-Based Photo Selection

## Overview

This document describes the attribute-based photo selection approach that is now the primary (and only) method for intelligent photo selection. This approach is faster, more accurate, and leverages existing AI analysis done during photo upload.

## Problem (Historical Context)

The previous approach (now removed) had several issues:
1. **Slow performance**: Analyzing image URLs with OpenAI Vision API was time-consuming
2. **Redundant analysis**: Photos were already analyzed during upload for captions, tags, people, and locations
3. **Limited context**: Visual analysis couldn't leverage the rich metadata already available
4. **No location/date prioritization**: Couldn't prioritize photos based on specific locations or dates mentioned in prompts

## Current Solution

The attribute-based approach uses database attributes instead of image URLs for photo selection:

### Key Features

1. **`selectPhotosByAttributes()` function** in `server/utils/openai-client.js`
   - Takes asset data with attributes (captions, tags, people, locations, dates)
   - Takes the memory book's `ai_supplemental_prompt`
   - Uses OpenAI to select photos based on text attributes and prompt matching
   - Prioritizes location and date matches from the prompt

2. **`/api/ai/magic-memory` endpoint**
   - Requires `memoryBookId` instead of photo URLs
   - Fetches the memory book's `ai_supplemental_prompt` and validates it's set
   - Fetches asset data from the photo selection pool
   - Uses attribute-based selection
   - Updates the memory book with results automatically

3. **Frontend integration**
   - Frontend creates memory book template first with `ai_supplemental_prompt`
   - Calls AI endpoint with just the memory book ID
   - No need to send photo URLs

### Selection Criteria

The selection algorithm prioritizes:

1. **Location matching**: If prompt mentions a city/state/country, prioritize photos from that location
2. **Date matching**: If prompt mentions a date/time period, prioritize photos with dates close to that time
3. **Content relevance**: Match photos with captions, tags, or people that relate to the prompt
4. **Story coherence**: Choose photos that tell a cohesive story together
5. **People relevance**: Consider people mentioned in the prompt

### Database Attributes Used

- `ai_caption` - AI-generated description
- `user_caption` - User-provided caption
- `tags` - AI-generated tags
- `user_tags` - User-provided tags
- `user_people` - People identified in the photo
- `city`, `state`, `country` - Location data
- `asset_date` - Date the photo was taken
- `title` - Photo title

## API Changes

### Current API Call
```javascript
// Frontend sends memory book ID
const aiRes = await $fetch('/api/ai/magic-memory', {
  method: 'POST',
  body: {
    memoryBookId: bookId,
    userId: user.id,
    photoCount: 3
  }
})
```

## Benefits

1. **Faster performance**: No image analysis required
2. **Better accuracy**: Leverages existing AI analysis and user input
3. **Location-aware**: Can prioritize photos from specific locations
4. **Date-aware**: Can prioritize photos from specific time periods
5. **More context**: Uses rich metadata instead of just visual content
6. **Consistent results**: Based on structured data rather than visual interpretation

## Validation

The approach includes several validation steps:

1. **Memory book validation**: Ensures `ai_supplemental_prompt` is set before processing
2. **Asset validation**: Verifies assets exist and are approved
3. **Selection validation**: Confirms the correct number of photos are selected
4. **Error handling**: Provides clear error messages for missing data

## Testing

Test scripts validate:
- Location-based selection (`tests/test_location_hierarchy.js`)
- Keyword-based selection (`tests/test_attribute_based_selection.js`)
- Correct photo count selection
- Reasoning quality
- Story generation from selected photos (`tests/test_story_generation_attributes.js`)

## Legacy Code Removal (March 2025)

The following legacy functions have been removed from `server/utils/openai-client.js`:
- `selectPhotos()` - Old image URL-based selection
- `generateStory()` - Old image URL-based story generation
- `ai-prompts.js` - Unused prompts file

**Rationale**: The attribute-based approach is superior in every metric (performance, accuracy, context) and has been the primary method for over a year. Removal of dead code improves maintainability.

## Migration Notes

- Existing memory books continue to work
- The retry functionality uses the modern approach
- PDF generation works with the current approach
- No database schema changes required

## Future Enhancements

Potential improvements for the future:
1. **Date range matching**: Better handling of date ranges in prompts
2. **Seasonal matching**: Match photos based on seasons mentioned
3. **Event-based matching**: Recognize specific events or occasions
4. **People relationship matching**: Consider family relationships in selection
5. **Photo quality scoring**: Include photo quality metrics in selection
