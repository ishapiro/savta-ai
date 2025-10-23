# AI Complementary Photo Selection

## Overview

When deduplication removes duplicate photos and results in fewer photos than needed for the memory card layout, the system now intelligently asks the AI to select **complementary photos** that enhance the existing selection.

This ensures:
- ✅ **No duplicates** - All photos remain unique
- ✅ **Correct count** - Layout always has the required number of photos
- ✅ **Story coherence** - Complementary photos work well with existing selection
- ✅ **Intelligent selection** - AI considers themes, locations, and dates

## How It Works

### Trigger Condition

AI complementary selection is triggered when:

```javascript
finalSelectedIndices.length < targetCount  // After deduplication
```

Example:
- AI originally selected: `[0, 1, 2, 1]` (contains duplicate index 1)
- After deduplication: `[0, 1, 2]` (only 3 photos)
- Target required: `4` photos
- **Difference**: 1 photo short → AI complementary selection triggered

### Selection Process

1. **Identify Available Photos**
   - Find all photos not already selected
   - These become the "candidate pool"

2. **Build AI Prompt**
   - Describe the already-selected photos (by caption/title)
   - Ask AI to find complementary photos from candidates
   - Provide photo metadata: tags, locations, dates, descriptions

3. **AI Selection**
   - AI analyzes the existing selection
   - Considers themes, time periods, locations
   - Selects photos that enhance the story
   - Returns selected photo numbers and reasoning

4. **Validate and Apply**
   - Verify AI returned correct number
   - Add selected photos to final result
   - Update reasoning to explain the complementary selection

5. **Fallback Mechanism**
   - If AI call fails or returns invalid result
   - System falls back to sequential selection
   - Still ensures correct count of unique photos

## Code Implementation

### Location
**File**: `server/utils/openai-client.js`  
**Function**: `selectPhotosByAttributes()` (reused recursively)  
**Lines**: ~50 lines (simplified from ~120)

### Key Approach: Reusing Existing Logic

**The Smart Choice**: Rather than creating a new AI call and payload, the complementary selection **reuses the existing `selectPhotosByAttributes` function**:

```javascript
// Reuse the existing selectPhotosByAttributes function with unselected photos
const complementaryResult = await selectPhotosByAttributes(
  unselectedAssets,        // Use only unselected photos as candidates
  complementaryPrompt,     // Provide context about already-selected photos
  needed,                  // Number of additional photos needed
  []                       // Don't exclude previously used assets for this call
);
```

### Why This Is Better

1. **Consistency** - Uses exact same sophisticated photo selection logic
2. **Location Hierarchy** - Gets all the location matching rules automatically
3. **Maintains Priorities** - Respects the CRITICAL SELECTION PRIORITY from the original
4. **Less Code Duplication** - No duplicate payload building
5. **Easier Maintenance** - Changes to photo selection logic automatically benefit complementary selection
6. **Better Results** - Inherits all prompt engineering and context rules

### The Complementary Prompt

```javascript
const complementaryPrompt = `I already selected these ${count} photos: ${selectedCaptions}. 
        
From the remaining photos, please select ${needed} more that would complement 
and enhance this selection to tell a more complete story. Prioritize photos with:
1. Similar themes, time periods, or locations as the already-selected photos
2. Different perspectives that add depth to the narrative
3. Natural narrative flow that works well together`;
```

This prompt provides critical context:
- **What's already selected** - AI knows what it needs to complement
- **The goal** - Enhance the existing narrative
- **Selection criteria** - Balance consistency with diversity
- **Story flow** - Ensure photos work together naturally

### Index Translation

Important: AI returns indices based on the **unselected photos list**, not the original pool:

```javascript
// AI returns: selected_photo_numbers = [1, 3]
// These are 1-based indices in unselectedAssetData

// We convert back to original indices:
const complementaryIndices = result.selected_photo_numbers.map(num => 
  unselectedIndices[num - 1]  // Convert 1-based to 0-based, then map to original
)
```

## Console Logging

### When Complementary Selection is Triggered

```
⚠️ DUPLICATE INDICES DETECTED: 4 -> 3 (1 duplicates removed)
⚠️ Original indices: [0, 1, 2, 1]
⚠️ Unique indices: [0, 1, 2]
🎯 Deduplication left us short: have 3, need 4 (need 1 more)
🎯 15 unselected photos available to choose from
🎯 Asking AI to select 1 complementary photo(s) from 15 available...
🎯 Making AI request for complementary photos...
🎯 AI selected 1 complementary photos
🎯 Complementary reasoning: This photo complements by showing the landscape...
```

### Normal Flow (No Complementary Selection Needed)

```
✅ Selected photos: 0, 1, 2, 3
```

### Fallback Used

```
🎯 Deduplication left us short: have 3, need 4 (need 1 more)
🎯 Making AI request for complementary photos...
⚠️ AI complementary selection failed, using sequential fallback
🔄 Adding 1 additional photos to reach target count of 4
```

## Error Handling

### Scenario 1: AI Call Fails
```javascript
try {
  // Make AI request
  const complementaryResponse = await makeOpenAIRequest(complementaryPayload)
} catch (aiError) {
  // Fall back to sequential approach
  const additionalIndices = unselectedIndices.slice(0, needed)
  finalSelectedIndices.push(...additionalIndices)
}
```

### Scenario 2: Invalid AI Response
```javascript
if (!complementaryResult || !complementaryResult.selected_photo_numbers) {
  // Fall back to sequential
  const additionalIndices = unselectedIndices.slice(0, needed)
  finalSelectedIndices.push(...additionalIndices)
}
```

### Scenario 3: Insufficient Unselected Photos
```javascript
if (unselectedIndices.length === 0) {
  console.warn(`⚠️ Deduplication left us with too few photos and no additional photos available`)
  // Return what we have (fewer than target)
}
```

## AI Prompt Design

### Prompt Structure

```
I already selected these {count} photos: {captions of selected photos}

From the remaining photos, please select {needed} more that would complement 
and enhance this selection to tell a more complete story. The photos should 
have similar themes, locations, or time periods when possible.

[List all unselected photos with metadata]

Select exactly {needed} photos that best complement and enhance the story.
```

### Why This Works

1. **Context Awareness** - AI knows what's already selected
2. **Goal Clarity** - "Complement" focuses on coherence, not just matching
3. **Constraints** - "Similar themes/locations/periods" guides selection
4. **Metadata Rich** - Full photo information helps AI decide
5. **Explicit Count** - "Exactly N photos" prevents confusion

## Performance Considerations

### Time Impact
- **Small overhead** - Only triggered when duplicates occur + need more photos
- **Typical case** - First AI call handles all selections, no complementary call needed
- **Rare case** - 1-2 complementary calls in deduplication scenarios

### API Usage
- **Normal path**: 1 API call (initial selection)
- **With deduplication**: Up to 2 API calls (initial + complementary)
- **Acceptable** - Still less than creating multiple cards manually

### Fallback Efficiency
- If AI call fails, falls back immediately to sequential selection
- No retry loops that could waste tokens
- Graceful degradation maintains card quality

## Testing Scenarios

### Test: Complementary Selection Success
```
Setup: Create card with 4-photo layout
1. Manual setup: AI returns duplicate indices [0,1,2,1]
2. Deduplication: Reduces to [0,1,2]
3. Complementary: AI adds photo 5 to make [0,1,2,5]
4. Result: 4 unique photos, layout correct ✅
```

### Test: Complementary Fallback
```
Setup: Mock AI failure
1. Deduplication reduces to 3 photos, need 4
2. AI call fails
3. Fallback: Adds sequential photo to make 4
4. Result: 4 photos, warning logged ✅
```

### Test: No Complementary Needed
```
Setup: Normal case
1. AI returns unique indices [0,1,2,3]
2. No deduplication needed
3. No complementary call made
4. Result: 4 photos immediately ✅
```

## Database Representation

The complementary selection is tracked in the `ai_photo_selection_reasoning` field:

```
"AI selected 3 photos based on...
Deduplication reduced selection to 3. 
AI then selected 1 complementary photo(s) to reach required 4: 
This photo complements by providing landscape context..."
```

Users can see:
- What AI initially selected
- What duplicates existed
- What complementary photos were added
- Why they were chosen

## Future Enhancements

1. **Multi-tier Complementary Selection**
   - If first complementary call still falls short, ask again
   - Currently does one pass, then falls back

2. **User Control**
   - Let users approve/reject complementary selections
   - Manual override to choose their own complements

3. **Caching**
   - Cache complementary selections to reduce API calls
   - Reuse for similar deduplication scenarios

4. **Metrics**
   - Track how often complementary selection is needed
   - Monitor success rate vs fallback rate
   - Identify patterns in deduplication

## Related Systems

- **Photo Deduplication**: `docs/DUPLICATE_PHOTO_ISSUE_ANALYSIS.md`
- **Testing Guide**: `docs/PHOTO_DUPLICATION_FIX_TESTING.md` (Test 5)
- **Architecture**: `docs/architecture.mermaid`
- **AI Client**: `server/utils/openai-client.js`
