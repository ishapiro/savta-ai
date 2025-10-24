# Function and API Audit

## Overview

This document provides an audit of all exported functions from the OpenAI client and tracks their usage status across the codebase.

**Last Updated**: March 2025  
**Purpose**: Maintain code quality by identifying and removing unused functions

## Legacy Code Cleanup (March 2025)

### Removed Functions

The following legacy functions have been removed from `server/utils/openai-client.js`:

#### 1. `selectPhotos()` (lines 334-431)
- **Status**: ❌ **REMOVED**
- **Reason**: Replaced by `selectPhotosByAttributes` which is superior in every metric
- **Why Legacy?**: Used image URLs with OpenAI Vision API for analysis
- **Replacement**: Use `selectPhotosByAttributes()` which analyzes metadata attributes instead
- **Performance Impact**: New approach eliminates unnecessary image URL validation and vision API calls

#### 2. `generateStory()` (lines 551-630)
- **Status**: ❌ **REMOVED**
- **Reason**: Replaced by `generateStoryFromAttributes` which is more efficient
- **Why Legacy?**: Processed image URLs instead of photo metadata
- **Replacement**: Use `generateStoryFromAttributes()` which generates stories from photo attributes
- **Performance Impact**: Faster processing without image analysis overhead

#### 3. `ai-prompts.js`
- **Status**: ❌ **DELETED**
- **Reason**: File was never imported or used anywhere in the codebase
- **Purpose**: Was intended to centralize AI prompts but approach was abandoned
- **Impact**: No functional impact - file contained only comments and unused definitions

### Cleanup Statistics

**File Size Reduction**:
- `openai-client.js`: 1691 lines → 1499 lines (-192 lines, -11.3%)

**Functions Removed**: 2 legacy functions

**Files Deleted**: 1 (ai-prompts.js)

**Dead Code Eliminated**: ~300 lines total (including helper functions)

## Current Exported Functions (8 Total)

### Active Production Functions (6)

#### 1. `selectPhotosByAttributes(assets, aiSupplementalPrompt, targetCount, previouslyUsedAssetIds)`
- **Status**: ✅ **ACTIVE & PRIMARY**
- **Used By**: `/api/ai/magic-memory.post.js`
- **Purpose**: Intelligent photo selection using database attributes
- **Performance**: High - no image URL analysis required
- **Lines**: 1003-1417 (415 lines)

#### 2. `generateStoryFromAttributes(selectedAssets, aiSupplementalPrompt, photoSelectionReasoning)`
- **Status**: ✅ **ACTIVE & PRIMARY**
- **Used By**: `/api/ai/generate-story.post.js`
- **Purpose**: Generate captions from photo metadata and AI supplemental prompt
- **Performance**: High - efficient attribute-based analysis
- **Lines**: 440-544 (104 lines)

#### 3. `analyzeImage(imageUrl)`
- **Status**: ✅ **ACTIVE & PRIMARY**
- **Used By**: `/api/ai/process-asset.post.js`
- **Purpose**: Comprehensive photo analysis (captions, tags, people, location, EXIF)
- **Performance**: Medium - requires image URL fetching but only during upload
- **Lines**: 735-943 (209 lines)

#### 4. `analyzeText(text)`
- **Status**: ✅ **ACTIVE & PRIMARY**
- **Used By**: `/api/ai/process-asset.post.js`
- **Purpose**: Text analysis for captions and tags
- **Performance**: High - simple text processing
- **Lines**: 950-992 (43 lines)

#### 5. `aiCropRecommendation(imageUrl, targetWidth, targetHeight)`
- **Status**: ✅ **ACTIVE**
- **Used By**: `/api/ai/crop-recommendation.post.js`, test files
- **Purpose**: AI-powered crop recommendations with face preservation
- **Performance**: Medium - image analysis for optimal cropping
- **Lines**: 158-266 (109 lines)

#### 6. `analyzePhotoShape(imageUrl)`
- **Status**: ✅ **ACTIVE**
- **Used By**: `/api/ai/shape-analysis.post.js`, test files
- **Purpose**: Analyze photos for optimal shape formats (square, round, oval)
- **Performance**: Medium - image analysis for shape optimization
- **Lines**: 637-728 (92 lines)

### Internal Helper Functions (2)

#### 7. `makeOpenAIRequest(payload, attempt)`
- **Status**: ✅ **INTERNAL HELPER**
- **Used By**: All OpenAI API functions (internal calls)
- **Purpose**: Central OpenAI API request handler with retry logic
- **Features**: 5-minute timeout, connection retry on timeout
- **Lines**: 20-92 (73 lines)

#### 8. `parseOpenAIResponse(openaiData)`
- **Status**: ✅ **INTERNAL HELPER**
- **Used By**: All functions requiring OpenAI response parsing
- **Purpose**: Extract JSON from OpenAI Responses API format
- **Robustness**: Multiple fallback paths for response extraction
- **Lines**: 99-149 (51 lines)

## Helper Functions (Not Exported)

### Private Functions Supporting Photo Selection

1. **`findPhotosByLocationHierarchy()`** (lines 1601-1677)
   - Finds photos based on location matching hierarchy
   - Used by: `selectPhotosByAttributes`

2. **`getZipCodesWithinRadius()`** (lines 1423-1477)
   - Fetches zip codes within radius using ZipCodeAPI
   - Includes caching for 24 hours
   - Used by: `findPhotosByLocationHierarchy`

3. **`findAdditionalPhotosByDateAndLocation()`** (lines 1529-1599)
   - Scores photos based on date/location similarity
   - Used by: `selectPhotosByAttributes`

4. **`validateImageUrl()`** (lines 273-327)
   - Validates image URL accessibility and type
   - Checks file size (max 20MB)
   - Used by: Image analysis functions

## Prompt Management & Maintenance

### AI_PROMPTS Object (Lines 14-186)

**Purpose**: Centralized, maintainable storage of all AI prompts used throughout the system.

**Structure**: Each prompt has an `instruction` and `userPrompt`:
```javascript
const AI_PROMPTS = {
  FUNCTION_NAME: {
    instruction: 'System role/instruction for AI',
    userPrompt: 'User message or function that builds user message'
  }
}
```

### Prompts Defined

#### 1. **CROP_RECOMMENDATION**
- **Instruction**: Expert image cropping specialist persona
- **UserPrompt**: Function that accepts (targetWidth, targetHeight)
- **Used by**: `aiCropRecommendation()`
- **Purpose**: Recommend optimal crop areas while preserving faces and subjects

#### 2. **PHOTO_SHAPE_ANALYSIS**
- **Instruction**: Precise image analysis tool persona
- **UserPrompt**: Static string (no parameters needed)
- **Used by**: `analyzePhotoShape()`
- **Purpose**: Analyze photos for optimal shape formats

#### 3. **IMAGE_ANALYSIS**
- **Instruction**: Hip grandmother with precise analysis skills
- **UserPrompt**: Function that accepts (exifDataString)
- **Used by**: `analyzeImage()`
- **Purpose**: Comprehensive photo analysis (captions, tags, people, location)

#### 4. **TEXT_ANALYSIS**
- **Instruction**: Precise text analysis tool persona
- **UserPrompt**: Function that accepts (text)
- **Used by**: `analyzeText()`
- **Purpose**: Analyze text for captions and tags

#### 5. **STORY_GENERATION**
- **Instruction**: Warm caring grandmother persona
- **UserPrompt**: Function that accepts (selectedAssetsCount, aiSupplementalPrompt, photoSelectionReasoning, assetData)
- **Used by**: `generateStoryFromAttributes()`
- **Purpose**: Generate captions from photo metadata

#### 6. **PHOTO_SELECTION**
- **Instruction**: Warm caring grandmother selecting family photos
- **UserPrompt**: Function that accepts (availableAssetsCount, targetCount, aiSupplementalPrompt, assetData)
- **Used by**: `selectPhotosByAttributes()`
- **Purpose**: Intelligent photo selection with priority rules

### Maintenance Benefits

✅ **Centralized**: All prompts in one place at the top of the file
✅ **Easy to Update**: Change prompt logic without modifying function code
✅ **Version Control**: Easy to track prompt changes in git history
✅ **Consistency**: All functions use same prompt structure
✅ **No AI Impact**: Using template functions doesn't change how AI interprets prompts
✅ **Readability**: Clear separation between prompt logic and AI API code
✅ **Reusability**: Prompts can be exported to other modules if needed

### How Prompts Are Used

**Simple prompts (static strings)**:
```javascript
const payload = {
  instructions: AI_PROMPTS.PHOTO_SHAPE_ANALYSIS.instruction,
  text: {
    input: [{
      content: [{
        type: 'input_text',
        text: AI_PROMPTS.PHOTO_SHAPE_ANALYSIS.userPrompt  // No function call needed
      }]
    }]
  }
}
```

**Dynamic prompts (functions)**:
```javascript
const payload = {
  instructions: AI_PROMPTS.CROP_RECOMMENDATION.instruction,
  text: {
    input: [{
      content: [{
        type: 'input_text',
        text: AI_PROMPTS.CROP_RECOMMENDATION.userPrompt(targetWidth, targetHeight)  // Function call with parameters
      }]
    }]
  }
}
```

### Adding New Prompts

To add a new AI prompt:

```javascript
const AI_PROMPTS = {
  // ... existing prompts ...
  
  MY_NEW_PROMPT: {
    instruction: 'System instruction for the AI model',
    userPrompt: 'Static string' // or (param1, param2) => `Template string with ${param1}`
  }
};
```

Then use it in your function:
```javascript
const payload = {
  instructions: AI_PROMPTS.MY_NEW_PROMPT.instruction,
  text: {
    format: { /* schema */ },
    input: [{
      role: 'user',
      content: [{
        type: 'input_text',
        text: AI_PROMPTS.MY_NEW_PROMPT.userPrompt(params) // or just .userPrompt
      }]
    }]
  }
};
```

## Documentation Updated

The following documentation files have been updated to reflect changes:

1. **`docs/ATTRIBUTE_BASED_PHOTO_SELECTION.md`**
   - Added "Legacy Code Removal" section
   - Clarified current state vs historical problems
   - Removed references to old API calls

2. **`docs/LOCATION_AWARE_STORY_GENERATION.md`**
   - Removed references to `generateStory()` function
   - Simplified to focus on active `generateStoryFromAttributes()`
   - Added performance improvement notes

## Test Coverage

### Active Test Files Using Current Functions

1. **`tests/test_attribute_based_selection.js`** ✅
   - Tests `selectPhotosByAttributes()`
   - Tests location-based selection
   - Tests keyword matching

2. **`tests/test_story_generation_attributes.js`** ✅
   - Tests `generateStoryFromAttributes()`
   - Tests with and without photo selection reasoning

3. **`tests/test_ai_crop.js`** ✅
   - Tests `aiCropRecommendation()`
   - Tests face detection and crop positioning

4. **`tests/test_location_hierarchy.js`** ✅
   - Tests location matching logic
   - Tests zip code radius calculations

## Migration Guide for Developers

### If You Were Using `selectPhotos()`

**Old Code (REMOVED)**:
```javascript
import { selectPhotos } from '~/server/utils/openai-client.js'
const result = await selectPhotos(photoUrls, photoCount)
```

**New Code (RECOMMENDED)**:
```javascript
import { selectPhotosByAttributes } from '~/server/utils/openai-client.js'
// Get your assets from database and call with metadata
const result = await selectPhotosByAttributes(assets, prompt, photoCount)
```

### If You Were Using `generateStory()`

**Old Code (REMOVED)**:
```javascript
import { generateStory } from '~/server/utils/openai-client.js'
const result = await generateStory(selectedPhotoUrls)
```

**New Code (RECOMMENDED)**:
```javascript
import { generateStoryFromAttributes } from '~/server/utils/openai-client.js'
// Pass photo assets with their metadata
const result = await generateStoryFromAttributes(selectedAssets, prompt)
```

## Benefits of Cleanup

1. **Reduced Complexity**: Fewer functions means easier codebase navigation
2. **Improved Performance**: Removed functions had significant overhead
3. **Better Maintainability**: No dead code to maintain or document
4. **Clearer Intent**: Active functions are the primary implementations
5. **Reduced Cognitive Load**: Less confusion about which functions to use

## API Endpoint Mapping

```
POST /api/ai/magic-memory
├─ Uses: selectPhotosByAttributes()
└─ Helper: findPhotosByLocationHierarchy()

POST /api/ai/generate-story
├─ Uses: generateStoryFromAttributes()

POST /api/ai/process-asset
├─ Uses: analyzeImage() or analyzeText()
├─ Helper: validateImageUrl()
└─ Helper: EXIF data extraction

POST /api/ai/crop-recommendation
└─ Uses: aiCropRecommendation()

POST /api/ai/analyze-shape
└─ Uses: analyzePhotoShape()
```

## Performance Metrics

### Before Cleanup
- Total exported functions: 10
- Legacy/unused functions: 2
- File size: 1691 lines

### After Cleanup
- Total exported functions: 8
- Legacy/unused functions: 0
- File size: 1499 lines
- Code reduction: 192 lines (11.3%)

## Future Improvements

1. **Consolidate Image Validation**: `analyzePhotoShape()` and `aiCropRecommendation()` both validate images
2. **Extract Location Logic**: Location hierarchy functions could be moved to separate module
3. **Caching Layer**: Implement caching for repeated photo selections
4. **Error Metrics**: Track API failures and retry patterns

## Related Documentation

- `docs/ATTRIBUTE_BASED_PHOTO_SELECTION.md` - Photo selection details
- `docs/LOCATION_AWARE_STORY_GENERATION.md` - Story generation rules
- `docs/architecture.mermaid` - System architecture diagram
- `docs/technical.md` - Technical specifications

