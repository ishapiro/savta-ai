# Image Crop Adjustment Feature - Implementation Proposal

**Date Created**: October 24, 2025  
**Status**: Design Phase (Ready for Implementation)  
**Priority**: High - Improves UX for memory book editing  
**Scope**: Add crop adjustment dialog to memory detail modal when editing photos

---

## 1. OVERVIEW

The goal is to add an **Image Crop Adjustment dialog** to the keep/replace photos flow when users are editing/revising a memory book in the detail modal. This will allow users to:
- See both the full image and the space it will occupy in the final card/book
- Adjust the position and crop boundaries to select which part of the image to use
- Lock specific crops to photos so they're preserved across regenerations

---

## 2. USER FLOW

```
Memory Detail Modal (Editing)
    ↓
Edit/Revise Button
    ↓
Choose: Keep Same Photos OR Replace Photos
    ↓
IF Replace Photos Selected:
    ↓
PhotoReplacementSelector (current grid with thumbnails)
    ↓
User clicks a photo thumbnail
    ↓
[NEW] Image Crop Adjustment Dialog Opens
    ├─ Shows full image at full resolution
    ├─ Shows preview box for the space it will occupy (based on grid_layout + print_size)
    ├─ User can drag/adjust crop boundaries
    ├─ User can pan/position image within crop area
    ├─ Save crop → stored on photo object
    └─ Close → returns to PhotoReplacementSelector
    ↓
User finishes selection and saves
    ↓
Regenerate book with cropped images locked in place
```

---

## 3. DATABASE SCHEMA ADDITIONS

### Option A: New Junction Table (RECOMMENDED)

Create a **new table** to store custom crop data:

```sql
CREATE TABLE asset_crop_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Composite key: links crop to specific book+asset combination
  book_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Crop parameters (normalized 0-1 coordinates for image-agnostic storage)
  crop_x FLOAT NOT NULL,           -- X position as % of image width (0.0-1.0)
  crop_y FLOAT NOT NULL,           -- Y position as % of image height (0.0-1.0)
  crop_width FLOAT NOT NULL,       -- Crop width as % of image width (0.0-1.0)
  crop_height FLOAT NOT NULL,      -- Crop height as % of image height (0.0-1.0)
  
  -- Preview context
  grid_layout TEXT,                -- e.g., '2x2', '3x3' (stored for reference)
  print_size TEXT,                 -- e.g., '8.5x11' (stored for reference)
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Constraints
  UNIQUE(book_id, asset_id),       -- One crop per photo per book
  CONSTRAINT fk_book FOREIGN KEY (book_id) REFERENCES memory_books(id),
  CONSTRAINT fk_asset FOREIGN KEY (asset_id) REFERENCES assets(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(user_id)
);

-- Index for faster lookups
CREATE INDEX idx_asset_crop_locks_book_asset ON asset_crop_locks(book_id, asset_id);
```

**Advantages:**
- Clean separation of concerns
- Easy to query and manage
- Good for indexing and performance
- Can be soft-deleted independently

### Option B: JSONB Column in memory_books

Add to existing `memory_books` table:

```sql
ALTER TABLE memory_books ADD COLUMN IF NOT EXISTS asset_crop_data JSONB DEFAULT '{}';

-- Structure:
{
  "asset-uuid-1": {
    "crop_x": 0.1,
    "crop_y": 0.2,
    "crop_width": 0.8,
    "crop_height": 0.7,
    "grid_layout": "2x2",
    "print_size": "8.5x11"
  },
  "asset-uuid-2": { ... }
}
```

**Advantages:**
- Everything in one table
- No additional JOINs needed
- Simpler queries for full book data

**Recommendation**: Use **Option A (separate table)** for better queryability, indexing, and architectural clarity.

---

## 4. COMPONENT ARCHITECTURE

### 4a. New Component: `ImageCropAdjuster.vue`

This is the core component for crop adjustment.

**Purpose**: Full-featured image cropping interface with live preview

**Props:**
```javascript
{
  image: String,              // Full image URL
  assetId: String,            // Asset UUID
  gridLayout: String,         // '2x2', '3x3', etc.
  printSize: String,          // '8.5x11', '4x6', etc.
  initialCrop: Object,        // Existing crop data if any
  isRecreateMode: Boolean     // Whether in recreation flow
}
```

**Structure:**
```
Header
├─ "Adjust crop for this photo"
└─ Close button

Main Content Area (two-column on desktop, stacked on mobile)
├─ Left: Full Image Canvas (70% width on desktop)
│  ├─ Display original image at full resolution
│  ├─ Overlay crop rectangle (draggable borders)
│  ├─ Handle resize from corners/edges
│  ├─ Pan functionality (drag entire image inside crop)
│  └─ Visual feedback (hover effects, cursor changes)
│
└─ Right: Preview Panel (30% width on desktop)
   ├─ Aspect ratio preview box
   ├─ Shows what will be used in final output
   ├─ Grid preview (how image fits in grid)
   ├─ Print size indicator
   ├─ Dimensions display
   └─ Real-time preview updates

Controls Section
├─ Reset to Default (smart crop)
├─ Lock Aspect Ratio toggle
├─ Zoom slider (if needed)
└─ Rotation (optional, advanced feature)

Footer
├─ Cancel button
└─ Save Crop button
```

**Emits:**
```javascript
@save="(cropData) => {}"    // { crop_x, crop_y, crop_width, crop_height }
@cancel="() => {}"
```

**Key Features:**
- Click-and-drag to reposition image
- Resize handles on crop box (corners + edges)
- Keyboard shortcuts (arrow keys for fine adjustment)
- Touch support (mobile gestures)
- Real-time preview updates
- Zoom/pan for detailed adjustments

**Technologies:**
- HTML5 Canvas for efficient rendering
- Mouse/Touch event handling
- Vue Composition API reactivity
- requestAnimationFrame for smooth interactions

---

### 4b. Modified Component: `PhotoReplacementSelector.vue`

**Current Flow:**
```
Shows grid of current photos
  ↓
Click photo → mark for replacement (toggle visual state)
  ↓
Return to modal
```

**Enhanced Flow:**
```
Shows grid of current photos with badges
  ↓
Click photo thumbnail (or long-press on mobile)
  ├─ Show action menu
  │  ├─ Replace (open replacement library)
  │  └─ Adjust Crop (open ImageCropAdjuster)
  └─ OR: Two-tap system (first tap = select, second tap = options)
  ↓
If "Adjust Crop" → ImageCropAdjuster opens
  ├─ Load existing crop if available
  ├─ User adjusts
  ├─ Save crop
  └─ Return to PhotoReplacementSelector
  ↓
Return to PhotoReplacementSelector with visual indicator
  (show "⚙️ Custom Crop" badge on photo if locked crop exists)
```

**Visual Indicators:**
- Badge "⚙️ Custom Crop" on photos with locked crops
- Different border color for locked crops
- Tooltip on hover showing crop dimensions

---

## 5. INTERACTION PATTERNS

### 5a. Canvas Interaction Model

```
Initial State:
  - Image fills canvas (or scaled down if very large)
  - Crop rectangle = smart crop area (from API or full image)
  - Resize handles visible at corners + 4 edge midpoints
  - Disabled area outside crop darkened

User Actions:
  1. Drag crop rectangle edge → resize crop
  2. Drag inside crop area → pan image within crop
  3. Drag corner → resize maintaining aspect ratio (if locked)
  4. Scroll/pinch → zoom canvas (optional enhancement)
  5. Keyboard arrows → fine adjust selected handle (1-5 pixels)
  6. Keyboard Shift+arrows → larger adjustment (10 pixels)

Preview Updates:
  - Real-time as user adjusts
  - Show exact pixel dimensions
  - Show percentage of image being used
  - Show grid position preview (which cell it will be in)
  - Account for print_size aspect ratio
  - Show if crop will distort image
```

### 5b. Data Normalization Strategy

Store crops as **normalized coordinates (0-1)** so they:
- Work regardless of image size changes
- Are device/display independent
- Can be applied to different image resolutions
- Survive image re-exports or conversions

**When Saving:**
```javascript
cropData = {
  crop_x: 0.15,           // 15% from left edge
  crop_y: 0.20,           // 20% from top edge
  crop_width: 0.7,        // 70% of image width
  crop_height: 0.6,       // 60% of image height
  grid_layout: '2x2',     // Reference for UI
  print_size: '8.5x11'    // Reference for UI
}
```

**When Displaying in PDF/Output:**
```javascript
// Convert normalized coords back to pixels for full resolution
const fullImage = await loadImage(storageUrl)
const pixelCrop = {
  x: cropData.crop_x * fullImage.width,
  y: cropData.crop_y * fullImage.height,
  width: cropData.crop_width * fullImage.width,
  height: cropData.crop_height * fullImage.height
}

// Use Sharp to crop at full resolution
const croppedBuffer = await sharp(fullImage)
  .extract({
    left: Math.floor(pixelCrop.x),
    top: Math.floor(pixelCrop.y),
    width: Math.floor(pixelCrop.width),
    height: Math.floor(pixelCrop.height)
  })
  .toBuffer()
```

---

## 6. API ENDPOINTS

### 6a. Save Crop Lock

**Endpoint**: `POST /api/assets/crop-lock`

**Purpose**: Save custom crop for an asset in a specific book

```javascript
{
  method: 'POST',
  url: '/api/assets/crop-lock',
  
  headers: {
    'Authorization': 'Bearer {token}',
    'Content-Type': 'application/json'
  },
  
  body: {
    book_id: 'uuid',
    asset_id: 'uuid',
    crop_x: 0.15,
    crop_y: 0.20,
    crop_width: 0.7,
    crop_height: 0.6,
    grid_layout: '2x2',
    print_size: '8.5x11'
  },
  
  response: {
    success: true,
    cropLock: {
      id: 'uuid',
      book_id: 'uuid',
      asset_id: 'uuid',
      crop_x: 0.15,
      crop_y: 0.20,
      crop_width: 0.7,
      crop_height: 0.6,
      created_at: 'timestamp',
      updated_at: 'timestamp'
    }
  }
}
```

**Error Codes:**
- 400: Missing/invalid parameters
- 401: Unauthorized
- 403: Not owner of book
- 404: Book or asset not found
- 500: Server error

---

### 6b. Delete Crop Lock

**Endpoint**: `DELETE /api/assets/crop-lock`

**Purpose**: Remove crop lock (revert to smart crop)

```javascript
{
  method: 'DELETE',
  url: '/api/assets/crop-lock',
  
  headers: {
    'Authorization': 'Bearer {token}',
    'Content-Type': 'application/json'
  },
  
  body: {
    book_id: 'uuid',
    asset_id: 'uuid'
  },
  
  response: {
    success: true,
    message: 'Crop lock removed'
  }
}
```

---

### 6c. Enhanced Endpoint: Get Memory Book

**Endpoint**: `GET /api/memory-books/[id]` (existing, enhanced)

**Enhancement**: Include crop lock data in response

```javascript
// Response should include:
{
  id: 'book-uuid',
  user_id: 'user-uuid',
  created_from_assets: ['asset-1', 'asset-2', ...],
  
  // NEW: Crop data for each asset
  asset_crops: {
    'asset-1-uuid': {
      crop_x: 0.15,
      crop_y: 0.20,
      crop_width: 0.7,
      crop_height: 0.6,
      grid_layout: '2x2',
      print_size: '8.5x11'
    },
    'asset-2-uuid': {
      crop_x: 0.10,
      crop_y: 0.15,
      crop_width: 0.75,
      crop_height: 0.65
    }
  },
  
  grid_layout: '2x2',
  print_size: '8.5x11',
  format: 'card',
  status: 'draft',
  // ... other fields
}
```

---

## 7. COMPOSABLE UPDATES

### 7a. New Composable: `useCropManagement.js`

```javascript
export const useCropManagement = () => {
  // State
  const cropLocks = ref({})                    // { assetId: cropData }
  const selectedAssetForCrop = ref(null)
  const showCropAdjuster = ref(false)
  const isLoadingCrops = ref(false)
  const cropErrors = ref({})
  
  // Methods
  const loadCropsForBook = async (bookId) => {
    // Load existing crops from API
    // Store in cropLocks ref
    // Handle errors gracefully
  }
  
  const saveCrop = async (bookId, assetId, cropData) => {
    // Call POST /api/assets/crop-lock
    // Update local cropLocks state
    // Return success/error
  }
  
  const removeCrop = async (bookId, assetId) => {
    // Call DELETE /api/assets/crop-lock
    // Update local cropLocks state
    // Return success/error
  }
  
  const getCropForAsset = (assetId) => {
    // Return crop data or null if no custom crop
    return cropLocks.value[assetId] || null
  }
  
  const hasCropLock = (assetId) => {
    // Boolean check
    return !!cropLocks.value[assetId]
  }
  
  const resetCropsForBook = (bookId) => {
    // Clear all crops (when changing layout, etc.)
    cropLocks.value = {}
  }
  
  // Return public API
  return {
    // State
    cropLocks,
    selectedAssetForCrop,
    showCropAdjuster,
    isLoadingCrops,
    cropErrors,
    
    // Methods
    loadCropsForBook,
    saveCrop,
    removeCrop,
    getCropForAsset,
    hasCropLock,
    resetCropsForBook
  }
}
```

---

### 7b. Update `usePhotoReplacement.js`

Add methods to handle crops during photo replacement:

```javascript
// New methods to add:

// Check if crop data exists when loading book
const loadCropsForBook = async (bookId) => {
  const crops = await getCropLocks(bookId)
  // Store and manage crop state
}

// When replacing a photo, handle its crop
const handlePhotoReplaced = (oldAssetId, newAssetId) => {
  // Option 1: Remove old crop (default)
  if (cropLocks.value[oldAssetId]) {
    delete cropLocks.value[oldAssetId]
  }
  
  // Option 2: Could prompt user to apply old crop to new photo
  // (more advanced feature)
}

// When keeping same photos, preserve crops
const handleKeepSamePhotos = () => {
  // Crops stay exactly as they are
}

// When resetting photo selection, ask about crops
const handleResetPhotoSelection = async () => {
  const confirmReset = await confirm(
    'Reset photo selection and all custom crops?'
  )
  if (confirmReset) {
    cropLocks.value = {}
  }
}
```

---

## 8. UI/UX CONSIDERATIONS

### 8a. Responsive Design

**Desktop (≥1024px):**
```
┌─────────────────────────────────────┐
│          Header                     │
├────────────────────┬────────────────┤
│                    │                │
│   Image Canvas     │   Preview      │
│   (70% width)      │   Panel        │
│                    │   (30% width)  │
│                    │                │
├────────────────────┴────────────────┤
│          Controls (Reset, Zoom)     │
├────────────────────┬────────────────┤
│    Cancel          │    Save Crop   │
└────────────────────┴────────────────┘
```

**Tablet (640px-1024px):**
```
┌──────────────────────┐
│      Header          │
├──────────────────────┤
│    Image Canvas      │
│   (full width)       │
├──────────────────────┤
│  Preview Panel       │
│  (full width)        │
├──────────────────────┤
│     Controls         │
├──────────────────────┤
│ Cancel    Save Crop  │
└──────────────────────┘
```

**Mobile (<640px):**
```
┌──────────────────┐
│     Header       │
├──────────────────┤
│  Image Canvas    │
│ (full screen)    │
│                  │
│ [Preview overlay │
│  from right >]   │
├──────────────────┤
│ Cancel | Save    │
└──────────────────┘
```

### 8b. Visual Feedback

**Crop Rectangle:**
- Border: 2px solid `brand-flash` (orange)
- Handles: 8x8px squares at corners + edge midpoints
- Handles color: `brand-secondary` (purple)
- Hover state: Handles glow, cursor changes

**Canvas:**
- Area outside crop: `rgba(0,0,0,0.3)` (darkened)
- Hover inside crop: `cursor: grab`
- Dragging: `cursor: grabbing`
- On handles: `cursor: nwse-resize` (or appropriate direction)

**Preview Box:**
- Border: 2px solid `brand-accent` (teal)
- Background: `brand-accent/5` (very light)
- Dimensions display below
- Percentage display (e.g., "Using 70% of image")

**Indicators:**
- Grid position preview (show which cell image will go in)
- Aspect ratio indicator
- Smart crop badge (if using AI recommendation)
- Zoom level percentage

---

### 8c. Help Text & Tooltips

```
Primary Actions:
- "Drag edges to crop"
- "Drag inside to pan image"
- "Use handles to adjust crop area"

Secondary Info:
- "Lock aspect ratio to maintain proportions"
- "Preview shows how it will look in your card"
- "Crop covers X% of the image"
- "Will appear in cell Y of your grid"

Reset:
- "Reset to smart crop (AI recommended)"
- "This will remove your custom adjustments"
```

---

## 9. PDF GENERATION UPDATES

### 9a. Modify PDF Generation Logic

In `server/api/memory-books/generate-pdf/[id].post.js`:

```javascript
// When processing each image for PDF:

async function processImageForPDF(bookId, assetId, position, size) {
  try {
    // 1. Load full-resolution image from storage
    const fullImageUrl = await getAssetStorageUrl(assetId)
    const fullImageBuffer = await loadImageFromStorage(fullImageUrl)
    
    // 2. Check if custom crop exists
    const cropLock = await db.assets.getCropLock(bookId, assetId)
    
    if (cropLock) {
      // 3a. Apply custom crop to full-resolution image
      console.log('🖼️ Applying custom crop for asset:', assetId)
      
      const croppedImage = await sharp(fullImageBuffer)
        .extract({
          left: Math.floor(cropLock.crop_x * fullImageBuffer.metadata.width),
          top: Math.floor(cropLock.crop_y * fullImageBuffer.metadata.height),
          width: Math.floor(cropLock.crop_width * fullImageBuffer.metadata.width),
          height: Math.floor(cropLock.crop_height * fullImageBuffer.metadata.height)
        })
        .toBuffer()
      
      // Scale to final size and place in PDF
      const finalImage = await sharp(croppedImage)
        .resize(size.width, size.height, { fit: 'cover' })
        .toBuffer()
      
      placeImageInPDF(finalImage, position)
    } else {
      // 3b. Use smart crop (existing behavior)
      console.log('🖼️ Using smart crop for asset:', assetId)
      
      const smartCropped = await getSmartCrop(fullImageBuffer)
      const finalImage = await sharp(smartCropped)
        .resize(size.width, size.height, { fit: 'cover' })
        .toBuffer()
      
      placeImageInPDF(finalImage, position)
    }
  } catch (error) {
    console.error('❌ Error processing image:', error)
    throw error
  }
}
```

### 9b. Update API Route Structure

```javascript
// Add helper method to database composable
db.assets.getCropLock = async (bookId, assetId) => {
  const { data, error } = await supabase
    .from('asset_crop_locks')
    .select('*')
    .eq('book_id', bookId)
    .eq('asset_id', assetId)
    .single()
  
  if (error?.code === 'PGRST116') {
    // No crop lock found - that's ok
    return null
  }
  
  if (error) throw error
  return data
}
```

---

## 10. REGENERATION FLOW

### When User Regenerates/Recreates Memory Book:

```
User opens existing book and clicks "Edit/Revise"
  ↓
Choose photo method:
  ├─ Keep Same Photos
  │  ├─ Option A: Keep existing crops (default)
  │  │  └─ Shows preview with crops locked
  │  └─ Option B: Reset all crops (user choice)
  │     └─ Will use smart crop for all
  │
  └─ Replace Selected Photos
     ├─ Select which photos to replace
     ├─ New photos → offer default crop
     ├─ Option to adjust crop before saving
     └─ Old crops removed for replaced photos
  ↓
Save and regenerate
  ↓
PDF generation applies crop locks
```

### Data Handling:

```javascript
// When keeping same photos:
if (photoSelectionMethod === 'keep_same') {
  // Load existing crops from asset_crop_locks
  const cropData = await loadCropsForBook(bookId)
  // They're automatically applied during PDF generation
}

// When replacing photos:
if (photoSelectionMethod === 'replace_selected') {
  // For each replaced photo:
  // 1. Remove old crop lock (if exists)
  await removeCrop(bookId, oldAssetId)
  
  // 2. User can set crop for new asset (optional)
  // 3. Save new crop lock (if provided)
  await saveCrop(bookId, newAssetId, newCropData)
}

// When resetting all (advanced option):
if (resetAllCrops) {
  // Delete all crop locks for this book
  await clearAllCropsForBook(bookId)
}
```

---

## 11. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1) - HIGH PRIORITY

- [ ] Create database migration for `asset_crop_locks` table
- [ ] Create `ImageCropAdjuster.vue` component with full functionality
- [ ] Create `useCropManagement.js` composable
- [ ] Add crop save/load API endpoints (`POST`, `DELETE` /api/assets/crop-lock)
- [ ] Add database query methods to `useDatabase.js`
- [ ] Test crop data persistence

**Deliverable:** Core crop adjustment functionality working

### Phase 2: Integration (Week 2) - HIGH PRIORITY

- [ ] Integrate `ImageCropAdjuster` into `PhotoReplacementSelector.vue`
- [ ] Add crop UI indicators (badges, icons)
- [ ] Update `MemoryBookDialog.vue` to load/manage crops
- [ ] Update `useCropManagement.js` integration with photo replacement flow
- [ ] Test complete flow: open dialog → select photo → adjust crop → save
- [ ] Handle edge cases (empty crops, corrupted data, etc.)

**Deliverable:** Crop adjustment integrated into memory editing UI

### Phase 3: PDF Generation (Week 3) - MEDIUM PRIORITY

- [ ] Update PDF generation to use crop locks
- [ ] Test cropped images at 300 DPI
- [ ] Test various grid layouts with crops
- [ ] Test various print sizes
- [ ] Handle edge cases (very large crops, distorted ratios, etc.)
- [ ] Verify output quality

**Deliverable:** Crops correctly applied to PDF output

### Phase 4: Polish & UX (Week 4) - MEDIUM PRIORITY

- [ ] Mobile optimization (touch events, swipe, pinch)
- [ ] Keyboard shortcuts (arrow keys, delete key to reset)
- [ ] Accessibility improvements (ARIA labels, focus management, screen reader)
- [ ] Error messaging and recovery
- [ ] Performance optimization (canvas rendering, memory usage)
- [ ] User testing feedback

**Deliverable:** Production-ready feature

### Phase 5: Advanced Features (Future) - LOW PRIORITY

- [ ] Image rotation in crop adjuster
- [ ] Batch crop adjustment (apply crop to multiple photos)
- [ ] Crop templates/presets (save common crops)
- [ ] Undo/redo functionality
- [ ] Crop history for each asset

**Deliverable:** Nice-to-have enhancements

---

## 12. ERROR HANDLING & EDGE CASES

```
Scenarios to Handle:

Image Loading:
  ✓ Image fails to load → fallback to smart crop, show error message
  ✓ Network timeout → allow user to retry
  ✓ Image deleted from storage → remove crop lock, warn user

Crop Data Validation:
  ✓ Invalid crop coordinates → reset to default
  ✓ Crop larger than image → clamp to 100%
  ✓ Crop with negative values → reject and show error
  ✓ NaN or undefined values → use defaults

Photo Management:
  ✓ User deletes photo from asset library → cascade delete crop lock
  ✓ User deletes photo from book → remove associated crop lock
  ✓ Replace photo → remove old crop lock
  ✓ Undelete photo → restore crop lock (or create new)

Layout Changes:
  ✓ User changes grid layout → keep crop but show warning if aspect ratio changed
  ✓ User changes print size → keep crop but update preview
  ✓ Aspect ratio mismatch → show warning but allow save

Database:
  ✓ Crop lock already exists → update instead of insert
  ✓ Book not found → 404 error
  ✓ Asset not found → 404 error
  ✓ Permission denied → 403 error

PDF Generation:
  ✓ Crop results in blank image → use smart crop as fallback
  ✓ Out of memory during processing → chunk processing
  ✓ File corruption → retry with smart crop
```

---

## 13. PERFORMANCE CONSIDERATIONS

```
Optimization Areas:

Canvas Rendering:
  ✓ Use requestAnimationFrame for smooth 60fps interactions
  ✓ Debounce preview updates (100ms)
  ✓ Avoid redrawing if nothing changed
  ✓ Use canvas instead of DOM for heavy animations

Image Loading:
  ✓ Lazy load image only when dialog opens
  ✓ Cache loaded images in memory during session
  ✓ Compress display image (don't show full 20MP)
  ✓ Use WebWorkers for image processing if needed

Memory Management:
  ✓ Don't keep full image in memory longer than needed
  ✓ Release image resources when dialog closes
  ✓ Limit history size if implementing undo/redo
  ✓ Monitor for memory leaks in canvas

Database Queries:
  ✓ Index on (book_id, asset_id) for fast lookups
  ✓ Batch load all crops for a book (not per-asset)
  ✓ Use connection pooling for API calls
  ✓ Cache crop locks during session

PDF Generation:
  ✓ Cache processed crops (don't re-crop same image)
  ✓ Process in chunks for very large PDFs
  ✓ Parallelize image processing (if possible)
  ✓ Use streaming for final output

Mobile:
  ✓ Reduce canvas size on smaller screens
  ✓ Optimize touch event handling
  ✓ Lazy load preview updates
  ✓ Use viewport-relative canvas size
```

---

## 14. ACCESSIBILITY REQUIREMENTS

```
Keyboard Navigation:
  ✓ Tab through all interactive elements
  ✓ Arrow keys to adjust selected handle (1px increments)
  ✓ Shift+Arrow keys for larger adjustments (10px)
  ✓ Enter to save, Escape to cancel
  ✓ Delete/Backspace to reset crop

Screen Reader Support:
  ✓ ARIA labels on all buttons
  ✓ Live regions for dimension updates
  ✓ Announce crop changes: "Crop adjusted to 70% width"
  ✓ Describe canvas state clearly
  ✓ Alternative text for visual indicators

Touch Accessibility:
  ✓ Minimum 44x44px touch targets
  ✓ Adequate spacing between controls
  ✓ No time-based interactions
  ✓ Support for gesture alternatives

Color & Contrast:
  ✓ WCAG AA contrast ratios (4.5:1 for text)
  ✓ Don't rely on color alone for meaning
  ✓ Use patterns/icons in addition to colors
  ✓ Support high contrast mode

Focus Management:
  ✓ Visible focus indicators
  ✓ Logical tab order
  ✓ Focus trap within dialog
  ✓ Return focus on close
```

---

## 15. TESTING STRATEGY

### Unit Tests

```javascript
// Test crop normalization
describe('Crop Normalization', () => {
  it('should normalize pixel coords to 0-1 range', () => { })
  it('should denormalize to pixels correctly', () => { })
  it('should handle edge cases (0, 1, negative)', () => { })
})

// Test crop validation
describe('Crop Validation', () => {
  it('should reject invalid coordinates', () => { })
  it('should clamp crops to image bounds', () => { })
  it('should validate aspect ratios', () => { })
})
```

### Integration Tests

```javascript
// Test complete flow
describe('Crop Adjustment Flow', () => {
  it('should load existing crops for book', () => { })
  it('should save new crop to database', () => { })
  it('should update crop in PDF generation', () => { })
  it('should handle photo replacement with crops', () => { })
  it('should preserve crops during regeneration', () => { })
})
```

### E2E Tests

```javascript
// Test user interactions
describe('User Interactions', () => {
  it('should drag crop rectangle to resize', () => { })
  it('should pan image within crop area', () => { })
  it('should reset crop with button click', () => { })
  it('should save crop on mobile', () => { })
  it('should handle keyboard navigation', () => { })
})
```

### Functional Tests

```
Manual Testing Scenarios:

Basic Functionality:
  ✓ Open crop adjuster for any photo
  ✓ Drag edges to resize crop
  ✓ Drag inside to pan image
  ✓ Click reset to restore default
  ✓ Save and verify crop persists

Edge Cases:
  ✓ Very small image (400x300)
  ✓ Very large image (8000x6000)
  ✓ Portrait orientation
  ✓ Landscape orientation
  ✓ Square aspect ratio
  ✓ Extreme aspect ratios (10:1)

Photo Replacement:
  ✓ Keep same photos → crops preserved
  ✓ Replace photos → old crops deleted
  ✓ Delete replaced photo → crop removed
  ✓ Undelete → crop restored

PDF Output:
  ✓ Generated PDF shows correct crops
  ✓ Print quality maintained at 300 DPI
  ✓ Various grid layouts display correctly
  ✓ Various print sizes work
  ✓ Crops don't cause image distortion

Performance:
  ✓ Canvas renders smoothly on desktop
  ✓ Canvas renders smoothly on tablet
  ✓ Canvas renders smoothly on mobile
  ✓ PDF generation doesn't timeout
  ✓ No memory leaks detected
```

---

## 16. MIGRATION STRATEGY

### For Existing Users:

```
1. Add asset_crop_locks table (no data migration needed)
2. Existing books continue using smart crop (backward compatible)
3. When user edits book, they can set custom crops
4. Old crops not affected (none exist yet)
5. No breaking changes

If removing smart crop in future:
1. Add migration to create default crops for all assets
2. Use smart crop algorithm to populate asset_crop_locks
3. Existing books get default crops
4. Users can customize from there
```

---

## 17. TECHNICAL NOTES

### Browser Compatibility

```
Desktop:
  ✓ Chrome/Edge 90+
  ✓ Firefox 88+
  ✓ Safari 14+

Mobile:
  ✓ iOS Safari 14+
  ✓ Android Chrome 90+
  ✓ Samsung Internet 14+

Not Supported:
  ✗ IE 11 (end of support)
  ✗ Safari <14
  ✗ Firefox <88
```

### Dependencies (Already Available)

```
✓ Vue 3 - Composition API already in use
✓ Sharp - Image processing (already installed)
✓ Supabase - Database (already in use)
✓ TailwindCSS - Styling (already in use)
✓ PrimeVue - Dialogs/buttons (already in use)

No new dependencies required!
```

---

## 18. DOCUMENTATION

### Files to Create/Update

```
New:
  ✓ docs/IMAGE_CROP_ADJUSTMENT_PROPOSAL.md (this file)
  ✓ docs/IMAGE_CROP_ADJUSTMENT_GUIDE.md (user guide)

Update:
  ✓ docs/architecture.mermaid (add new components)
  ✓ docs/technical.md (add API endpoints)
  ✓ README.md (feature overview)

Code Comments:
  ✓ ImageCropAdjuster.vue (detailed component docs)
  ✓ useCropManagement.js (composable docs)
  ✓ API route files (endpoint docs)
```

---

## 19. SUCCESS CRITERIA

✅ **Feature is complete when:**

1. **Core Functionality**
   - [ ] Users can open crop adjuster from photo replacement dialog
   - [ ] Crop adjuster shows full image with interactive crop rectangle
   - [ ] Users can drag, resize, and pan to adjust crop
   - [ ] Crops persist to database and are loaded on page refresh

2. **Integration**
   - [ ] Crop data flows correctly through wizard → replacement → regeneration
   - [ ] Existing books continue working (backward compatible)
   - [ ] No breaking changes to API contracts

3. **Quality**
   - [ ] PDF output uses crops correctly
   - [ ] Image quality maintained at 300 DPI
   - [ ] No memory leaks or performance issues
   - [ ] All edge cases handled gracefully

4. **UX**
   - [ ] Mobile interactions work smoothly
   - [ ] Visual feedback is clear (handles, preview, etc.)
   - [ ] Help text guides users through process
   - [ ] Error messages are actionable

5. **Testing**
   - [ ] Unit tests pass (core functions)
   - [ ] Integration tests pass (full flow)
   - [ ] E2E tests pass (user workflows)
   - [ ] Manual testing confirms feature works

6. **Documentation**
   - [ ] Architecture updated
   - [ ] API endpoints documented
   - [ ] Code comments are clear
   - [ ] User guide available

---

## 20. OPEN QUESTIONS & DECISIONS

### Decisions Made:

1. ✅ **Store crops in separate table** (not JSONB in memory_books)
   - Reason: Better for indexing, querying, and separation of concerns

2. ✅ **Use normalized coordinates (0-1)** (not pixel-based)
   - Reason: Image-agnostic, works with any resolution

3. ✅ **Integrate into existing replacement flow** (not separate feature)
   - Reason: Natural UX, doesn't add complexity

4. ✅ **Optional user interaction** (user can choose to crop or use smart crop)
   - Reason: Doesn't break existing workflows, backward compatible

### Open Questions:

1. **Should crops transfer when replacing a photo?**
   - Option A: No (default) - removes old crop, asks for new crop
   - Option B: Yes - applies old crop to new photo (might distort)
   - Recommendation: Option A (safer, less confusion)

2. **Should we show crop adjustment in wizard too?**
   - Option A: No (wizard-created cards use smart crop)
   - Option B: Yes (offer crop adjustment after AI selection)
   - Recommendation: No (Phase 1), add as Phase 5 feature if requested

3. **Should crops be editable after book is saved?**
   - Option A: No (recreate mode only)
   - Option B: Yes (edit crops anytime)
   - Recommendation: Option B (more flexible), implement in Phase 2

4. **Should we auto-apply smart crop if user creates very small crop?**
   - Option A: No (let user decide)
   - Option B: Yes (warn user)
   - Option C: Yes (automatically reset)
   - Recommendation: Option B (warn but allow)

---

## SUMMARY

This proposal provides a comprehensive plan for implementing an image crop adjustment feature that:

✅ **Improves UX** by giving users fine-grained control over how images appear in memory books

✅ **Maintains backward compatibility** with existing smart crop functionality

✅ **Integrates cleanly** with existing architecture and patterns

✅ **Can be implemented incrementally** in manageable phases

✅ **Handles edge cases** gracefully with good error handling

✅ **Performs well** on all devices and browsers

✅ **Follows project conventions** for code style, naming, and structure

The implementation is scoped reasonably and can begin immediately with Phase 1 foundational work.

---

**Next Steps:**
1. Review proposal and approve approach
2. Create database migration for `asset_crop_locks` table
3. Begin Phase 1 implementation
4. Track progress in `tasks/tasks.md`
5. Update `docs/status.md` with completion milestones
