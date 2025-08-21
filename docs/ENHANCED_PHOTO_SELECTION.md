# Enhanced Photo Selection Logic

## Overview

The photo selection system has been enhanced to ensure that the AI always returns at least the number of photos requested by the theme, even when the initial AI selection doesn't find enough suitable photos or when excluding previously used photos would leave insufficient photos in the pool.

## Key Requirements

1. **Minimum Photo Count**: The AI must always return at least the number of photos specified by the theme
2. **Breathing Room**: The photo selection pool available to the AI should be at least 3x the number of photos needed by the theme
3. **Previously Used Photos**: If excluding previously used photos would leave insufficient photos (less than 3x the needed amount), then previously used photos should NOT be excluded
4. **Additional Photo Selection**: If the AI doesn't find enough photos initially, additional photos should be selected based on dates and locations of the already selected photos

## Implementation Details

### 1. Minimum Pool Size Calculation

```javascript
const minimumRequiredPoolSize = targetCount * 3;
```

The system calculates the minimum required pool size as 3x the target photo count to ensure sufficient variety and breathing room for selection.

### 2. Conditional Exclusion of Previously Used Photos

```javascript
if (previouslyUsedAssetIds && previouslyUsedAssetIds.length > 0) {
  const assetsAfterExclusion = assets.filter(asset => !previouslyUsedAssetIds.includes(asset.id));
  
  // Only exclude previously used photos if we have enough remaining photos
  if (assetsAfterExclusion.length >= minimumRequiredPoolSize) {
    availableAssets = assetsAfterExclusion;
    excludedPreviouslyUsed = true;
  } else {
    // Use all photos including previously used ones
    console.log(`⚠️ Not excluding previously used photos - would leave only ${assetsAfterExclusion.length} photos, need at least ${minimumRequiredPoolSize} for breathing room.`);
  }
}
```

Previously used photos are only excluded if doing so would leave at least 3x the target count of photos available.

### 3. Additional Photo Selection

If the AI doesn't select enough photos initially, the system fills in additional photos based on date and location similarity:

```javascript
if (finalSelectedIndices.length < targetCount) {
  console.log(`⚠️ AI only selected ${finalSelectedIndices.length} photos, need ${targetCount}. Filling in additional photos based on dates and locations...`);
  
  const selectedPhotos = finalSelectedIndices.map(index => availableAssets[index]).filter(Boolean);
  const additionalPhotos = findAdditionalPhotosByDateAndLocation(availableAssets, selectedPhotos, targetCount - finalSelectedIndices.length, finalSelectedIndices);
  
  finalSelectedIndices = [...finalSelectedIndices, ...additionalPhotos];
}
```

### 4. Date and Location Scoring

The `findAdditionalPhotosByDateAndLocation` function scores remaining photos based on:

- **Date Similarity**: Photos within 30 days get 10 points, within 1 year get 5 points, within 3 years get 2 points
- **Location Similarity**: Photos from the same city, state, or country get 8 points

```javascript
// Date similarity scoring
if (asset.asset_date && selectedDates.length > 0) {
  const assetDate = new Date(asset.asset_date);
  const minDateDiff = Math.min(...selectedDates.map(date => Math.abs(assetDate - date)));
  const daysDiff = minDateDiff / (1000 * 60 * 60 * 24);
  
  if (daysDiff <= 30) score += 10;
  else if (daysDiff <= 365) score += 5;
  else if (daysDiff <= 1095) score += 2; // Within 3 years
}

// Location similarity scoring
if (locationMatch) score += 8;
```

## Status Messages

The system provides clear status messages to users about the photo selection process:

- When excluding previously used photos: `"Analyzing X available photos (excluding Y previously used) to find Z best matches..."`
- When including previously used photos: `"Analyzing X available photos to find Z best matches (including previously used photos to ensure variety)..."`

## Error Handling

The system includes robust error handling:

1. **Insufficient Photos**: If the total photo pool is smaller than the target count, it uses all available photos
2. **Invalid AI Response**: Validates that the AI returns valid photo indices
3. **Minimum Count Validation**: Ensures at least the requested number of photos is returned

## Testing

The enhanced logic is tested with various scenarios:

1. **Sufficient photos - AI selects exact count**: Normal operation
2. **Sufficient photos - AI selects fewer than needed**: Tests additional photo selection
3. **Insufficient photos after excluding previously used**: Tests fallback to include all photos
4. **Very limited photos**: Tests using all available photos when pool is smaller than target

## Benefits

1. **Reliability**: Users always get the expected number of photos for their theme
2. **Variety**: The 3x breathing room ensures sufficient variety in selection
3. **Smart Fallbacks**: When ideal conditions aren't met, the system makes intelligent compromises
4. **Transparency**: Clear status messages explain what the system is doing
5. **Consistency**: The same logic applies whether creating new memories or regenerating existing ones

## Usage

This enhanced logic is automatically applied when:

- Creating a new memory card with AI photo selection
- Regenerating an existing memory card
- Using theme-based layouts that require specific photo counts

The user doesn't need to take any additional actions - the system automatically ensures they get the right number of photos for their chosen theme.
