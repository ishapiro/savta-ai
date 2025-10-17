# PDF Rotation and Positioning System

## Overview

This document explains how rotated images are positioned in the PDF generator to match the Layout Editor preview. The system ensures that rotated images appear in the same position in both the theme editor and the generated PDF.

## Key Components

### 1. Layout Editor (LayoutEditor.vue)
- **Coordinate System**: Top-origin (Y=0 at top)
- **Units**: Millimeters (mm) converted to screen pixels for display
- **Rotation**: CSS `transform: rotate()` with `transform-origin: center center`
- **Positioning**: Images are positioned at their unrotated top-left corner

### 2. PDF Generator (generate-pdf/[id].post.js)
- **Coordinate System**: Bottom-origin (Y=0 at bottom)
- **Units**: Millimeters (mm) converted to PDF points (72 points = 1 inch)
- **Rotation**: pdf-lib `rotate` parameter
- **Positioning**: Must compensate for rotation origin difference

## The Rotation Challenge

### CSS Rotation (Layout Editor)
```
transform: rotate(θ)
transform-origin: center center
```
- Rotates the image around its **center point**
- Position remains at the unrotated top-left corner
- Browser handles the visual rotation around the center

### pdf-lib Rotation (PDF Generator)
```javascript
export var drawImage = function (name, options) {
    return [
        translate(options.x, options.y),      // Step 1: Move to position
        rotateRadians(toRadians(options.rotate)),  // Step 2: Rotate around that point
        scale(options.width, options.height), // Step 3: Scale
        drawObject(name),                     // Step 4: Draw at origin
    ]
}
```
- Rotates the image around the **bottom-left corner** at position (x, y)
- This is fundamentally different from CSS center rotation

## The Solution: Position Compensation

To make pdf-lib's bottom-left rotation appear like CSS's center rotation, we calculate where the bottom-left corner should be positioned so that after rotation, the center ends up in the correct location.

### Mathematical Compensation

```javascript
// 1. Calculate where we want the center to be (target position)
const centerX = photoX + outerWidthPt / 2
const centerY = photoY + outerHeightPt / 2

// 2. Convert rotation to radians (NOTE: negated to match degrees(-rotationDegrees))
const angleRad = (-rotationDegrees * Math.PI) / 180

// 3. Calculate where the center will be after bottom-left rotation
// When rotating around bottom-left by angle θ, the center moves to:
// newCenterX = bottomLeftX + (width/2 * cos(θ) - height/2 * sin(θ))
// newCenterY = bottomLeftY + (width/2 * sin(θ) + height/2 * cos(θ))

// 4. Solve for bottomLeft position that makes newCenter equal our target
const offsetX = (outerWidthPt / 2) * Math.cos(angleRad) - (outerHeightPt / 2) * Math.sin(angleRad)
const offsetY = (outerWidthPt / 2) * Math.sin(angleRad) + (outerHeightPt / 2) * Math.cos(angleRad)

// 5. Adjust position
photoX = centerX - offsetX
photoY = centerY - offsetY
```

### Why We Negate the Rotation

In the code, we pass `degrees(-rotationDegrees)` to pdf-lib. This is because:
- Layout Editor uses **positive rotation** = clockwise
- PDF coordinate system (bottom-origin) requires **negative rotation** for clockwise
- The compensation calculation must use the same negated angle for consistency

## Coordinate System Conversions

### Y-Axis Conversion (Top-Origin to Bottom-Origin)

```javascript
// Theme Editor: Y=0 at top, increases downward
themeY = photoConfig.position.y  // in mm

// PDF: Y=0 at bottom, increases upward
pdfY = cardY + (cardHeightPoints - themeY - outerHeightPt)
```

### Unit Conversion (Millimeters to PDF Points)

```javascript
const mmToPoints = 72 / 25.4  // 72 points per inch, 25.4 mm per inch

// Convert position from mm to points
const themeX = photoConfig.position.x * mmToPoints
const themeY = photoConfig.position.y * mmToPoints

// Convert size from mm to points
const photoWidth = photoConfig.size.width * mmToPoints
const photoHeight = photoConfig.size.height * mmToPoints
```

## Code Locations

### Rotation Compensation Logic
**File**: `server/api/memory-books/generate-pdf/[id].post.js`
**Lines**: ~2469-2509

This section handles:
- Calculating target center position
- Computing rotation offsets
- Adjusting photoX and photoY for proper placement

### Drawing Rotated Images
**File**: `server/api/memory-books/generate-pdf/[id].post.js`
**Lines**: Multiple locations (~2647, 2657, 2696, 2723)

```javascript
const drawOptions = { 
  x: photoX,  // Already compensated for rotation
  y: photoY,  // Already compensated for rotation
  width: outerWidthPt, 
  height: outerHeightPt 
}
if (rotationDegrees !== 0) {
  drawOptions.rotate = degrees(-rotationDegrees)
}
page.drawImage(pdfImage, drawOptions)
```

## Testing and Verification

To verify correct rotation and positioning:

1. **Theme Editor**: Create a layout with a rotated image
2. **Note Position**: Observe the image position and rotation angle
3. **Generate PDF**: Create the PDF card
4. **Compare**: Verify the rotated image appears in the same position

### Common Issues

❌ **Image appears shifted after rotation**
- Check that compensation uses the same angle sign as `degrees(-rotationDegrees)`
- Verify offsetX and offsetY calculations use correct trigonometry

❌ **Rotation direction is backwards**
- Ensure angle is negated: `degrees(-rotationDegrees)`
- Check that compensation uses `-rotationDegrees` in radian conversion

✅ **Correct Result**
- Rotated image center matches theme editor position
- Rotation angle and direction match theme editor
- Non-rotated images still position correctly

## Related Documentation

- **Layout Editor**: `components/LayoutEditor.vue`
- **PDF Generation**: `server/api/memory-books/generate-pdf/[id].post.js`
- **pdf-lib Library**: Version 1.17.1 (see `package.json`)

## Summary

The rotation positioning system ensures visual consistency between the theme editor and generated PDFs by:

1. Understanding that CSS rotates around **center**, pdf-lib rotates around **bottom-left**
2. Calculating the offset needed to compensate for this difference
3. Using consistent angle signs throughout the calculation chain
4. Converting between coordinate systems (top-origin vs bottom-origin)
5. Converting between units (millimeters vs PDF points)

This precise mathematical approach eliminates guesswork and ensures pixel-perfect alignment.

