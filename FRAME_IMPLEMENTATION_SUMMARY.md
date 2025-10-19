# Frame Support - 4-Layer Implementation

## Date: October 19, 2025

## Overview
Implemented a new 4-layer rendering approach for PDF generation to properly support frames, borders, and images without requiring transparent centers in frames.

## Key Concept
The new approach renders each element as a separate layer in the correct order:
1. **Layer 1: Background** - Page background (already drawn)
2. **Layer 2: Border** - Photo border if specified (drawn as extended image)
3. **Layer 3: Frame** - Frame image at full placeholder size (no transparent center)
4. **Layer 4: Image** - Photo reduced in size to fit inside frame padding

## Changes Made

### 1. Frame Processing Function Refactor
**File**: `server/api/memory-books/generate-pdf/[id].post.js`

- **Renamed**: `processFrameOverlay()` → `processFrame()`
- **Removed**: Transparent center logic (mask/punch-out operations)
- **Simplified**: Frame is now simply resized to full placeholder size
- **Cache**: Renamed `frameOverlayCache` → `frameCache`

**Key Change**: Frames are no longer rendered with transparent centers. Instead, they're drawn at full size and the image is drawn separately at a reduced size on top.

### 2. Variable Naming Updates
**Old naming** (confusing and inconsistent):
- `photoX`, `photoY`, `photoWidth`, `photoHeight`
- `outerWidthPt`, `outerHeightPt`

**New naming** (clear and descriptive):
- `placeholderX`, `placeholderY`, `placeholderWidth`, `placeholderHeight` - Full size allocated in layout
- `imageX`, `imageY`, `imageWidth`, `imageHeight` - Reduced size for image inside frame

### 3. Image Sizing Logic
**Before**: Image was full placeholder size, frame had transparent center
**After**: Image is reduced by frame padding amounts:
```javascript
// Calculate inner image dimensions (image is reduced by frame padding)
const imageWidth = placeholderWidth - paddingLeftPt - paddingRightPt
const imageHeight = placeholderHeight - paddingTopPt - paddingBottomPt

// Image position (offset by frame padding to fit inside frame)
let imageX = placeholderX + paddingLeftPt
let imageY = placeholderY + paddingBottomPt
```

### 4. Drawing Order
The rendering now follows a strict layer order:

```javascript
// LAYER 1: Background (page background - already drawn)

// LAYER 2: Border (if photoBorder > 0)
if (photoBorder > 0) {
  // Apply border to image using Sharp
  finalImageBuffer = await sharp(finalImageBuffer).extend({...})
}

// LAYER 3: Frame (if frame exists)
if (photoConfig.frame && photoConfig.frame.imageUrl) {
  const framePng = await processFrame(
    photoConfig.frame.imageUrl,
    placeholderWidth,   // Full placeholder size
    placeholderHeight
  )
  page.drawImage(pdfFrame, {
    x: placeholderX,
    y: placeholderY,
    width: placeholderWidth,
    height: placeholderHeight
  })
}

// LAYER 4: Image (drawn on top at reduced size)
page.drawImage(pdfImage, {
  x: imageDrawX,        // Offset by padding
  y: imageDrawY,
  width: imageDrawWidth,   // Reduced by padding
  height: imageDrawHeight
})
```

### 5. Comment Updates
All comments throughout the code have been updated to reflect:
- The 4-layer approach
- New variable naming conventions
- Simplified frame handling logic
- Clear explanations of sizing calculations

## Benefits

1. **Simplicity**: No complex mask/transparency operations needed
2. **Reliability**: Layers are independent and clearly ordered
3. **Flexibility**: Easy to add more layers or adjust sizes
4. **Consistency**: Frames always cover the full placeholder area
5. **Maintainability**: Clear, documented code with descriptive variable names
6. **Performance**: Simpler operations may be faster

## Testing Checklist

- [ ] Test cards with frames (e.g., Polaroid frames)
- [ ] Test cards without frames
- [ ] Test with photo borders
- [ ] Test with rounded corners
- [ ] Test with both borders and frames
- [ ] Test with rotation
- [ ] Test different frame sizes and padding amounts
- [ ] Verify frame cache is working properly
- [ ] Check that images fit properly inside frames

## Technical Details

### Frame Padding Behavior
Frame padding now defines how much the image should be **reduced** rather than defining a transparent area:
- `paddingTop`: Reduces image height from top
- `paddingRight`: Reduces image width from right  
- `paddingBottom`: Reduces image height from bottom
- `paddingLeft`: Reduces image width from left

### Rotation Handling
Both the frame and image are rotated together using the same rotation angle, maintaining their relative positions.

### Border Handling
When a photo border is applied, the image is extended by the border amount, and the drawing position is adjusted to account for the extra size.

## Files Modified

1. `server/api/memory-books/generate-pdf/[id].post.js`
   - Lines 170-249: Frame processing function
   - Lines 2516-2825: Theme layout rendering logic

## Migration Notes

- Existing frame SVG files require no changes
- Frame padding values in theme configs work the same way
- The visual result should be identical or better
- Frame cache is automatically cleared with the new cache key format

