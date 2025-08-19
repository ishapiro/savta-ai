# Attribute-Based Photo Selection

## Overview

This document describes the new attribute-based photo selection approach that replaces the previous image URL analysis method. The new approach is faster, more accurate, and leverages existing AI analysis done during photo upload.

## Problem

The previous approach had several issues:
1. **Slow performance**: Analyzing image URLs with OpenAI Vision API was time-consuming
2. **Redundant analysis**: Photos were already analyzed during upload for captions, tags, people, and locations
3. **Limited context**: Visual analysis couldn't leverage the rich metadata already available
4. **No location/date prioritization**: Couldn't prioritize photos based on specific locations or dates mentioned in prompts

## Solution

The new approach uses database attributes instead of image URLs for photo selection:

### Key Changes

1. **New `selectPhotosByAttributes()` function** in `server/utils/openai-client.js`
   - Takes asset data with attributes (captions, tags, people, locations, dates)
   - Takes the memory book's `ai_supplemental_prompt`
   - Uses OpenAI to select photos based on text attributes and prompt matching
   - Prioritizes location and date matches from the prompt

2. **Updated `/api/ai/magic-memory` endpoint**
   - Now requires `memoryBookId` instead of photo URLs
   - Fetches the memory book's `ai_supplemental_prompt` and validates it's set
   - Fetches asset data from the photo selection pool
   - Uses attribute-based selection instead of image analysis
   - Updates the memory book with results automatically

3. **Enhanced frontend integration**
   - Frontend creates memory book template first with `ai_supplemental_prompt`
   - Calls AI endpoint with just the memory book ID
   - Simplified API calls (no need to send photo URLs)

### Selection Criteria

The new selection algorithm prioritizes:

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

### Old API Call
```javascript
// Frontend sent photo URLs
const aiRes = await $fetch('/api/ai/magic-memory', {
  method: 'POST',
  body: {
    photos: photoUrls,
    userId: user.id,
    photo_count: 3
  }
})
```

### New API Call
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

The new approach includes several validation steps:

1. **Memory book validation**: Ensures `ai_supplemental_prompt` is set before processing
2. **Asset validation**: Verifies assets exist and are approved
3. **Selection validation**: Confirms the correct number of photos are selected
4. **Error handling**: Provides clear error messages for missing data

## Testing

A test script is available at `tests/test_attribute_based_selection.js` that validates:
- Location-based selection
- Keyword-based selection
- Correct photo count selection
- Reasoning quality

## Migration Notes

- Existing memory books will continue to work
- The retry functionality has been updated to use the new approach
- PDF generation still works with the old approach for backward compatibility
- No database schema changes required

## Future Enhancements

Potential improvements for the future:
1. **Date range matching**: Better handling of date ranges in prompts
2. **Seasonal matching**: Match photos based on seasons mentioned
3. **Event-based matching**: Recognize specific events or occasions
4. **People relationship matching**: Consider family relationships in selection
5. **Photo quality scoring**: Include photo quality metrics in selection
