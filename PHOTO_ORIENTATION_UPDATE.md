# Photo Orientation Update

This update adds photo orientation detection to optimize photo selection for different Magic Memory layouts.

## Changes Made

### 1. Database Schema Update
- Added `width`, `height`, and `orientation` fields to the `assets` table
- Added indexes for efficient queries
- Created migration file: `supabase/migration_add_photo_orientation.sql`

### 2. Upload Enhancement
- Modified `server/api/upload-asset.post.js` to detect photo dimensions and orientation during upload
- Uses Sharp library to analyze image metadata
- Automatically populates `width`, `height`, and `orientation` fields

### 3. AI Photo Selection Improvement
- Updated `server/api/ai/magic-memory.post.js` to include orientation data in AI prompts
- Enhanced photo selection logic to prioritize portrait photos for single-photo layouts
- AI now receives explicit orientation information for better decision making

### 4. PDF Layout Optimization
- Updated `server/api/memory-books/generate-pdf/[id].post.js` to handle different photo counts:
  - **1 photo**: Fills 50% of card area (left half)
  - **2 photos**: 2x1 grid layout
  - **4 photos**: 2x2 grid layout  
  - **6 photos**: 3x2 grid layout
- Single photos are optimized for portrait orientation

### 5. Migration Script
- Created `scripts/update-photo-orientations.js` to update existing assets
- Processes all existing photos to add orientation data

## Installation Steps

### 1. Apply Database Migration
```sql
-- Run the migration in your Supabase SQL editor
-- File: supabase/migration_add_photo_orientation.sql
```

### 2. Update Existing Assets (Optional)
```bash
# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the update script
node scripts/update-photo-orientations.js
```

### 3. Restart Development Server
```bash
npm run dev
```

## Benefits

1. **Better Photo Selection**: AI can now make informed decisions based on actual photo orientation
2. **Optimized Layouts**: Single photos get the full 50% of card area for maximum impact
3. **Flexible Grids**: Different photo counts get appropriate grid layouts (2x1, 2x2, 3x2)
4. **Performance**: Orientation data is stored in database, avoiding repeated analysis
5. **Future-Proof**: New uploads automatically include orientation data

## Technical Details

### Orientation Detection
- **Portrait**: height > width
- **Landscape**: width > height  
- **Square**: width = height

### Grid Layouts
- **1 photo**: Single photo fills left half (50% of card)
- **2 photos**: 2x1 grid (2 columns, 1 row)
- **4 photos**: 2x2 grid (2 columns, 2 rows)
- **6 photos**: 3x2 grid (3 columns, 2 rows)

### Database Fields
```sql
width integer        -- Photo width in pixels
height integer       -- Photo height in pixels  
orientation text     -- 'portrait', 'landscape', or 'square'
```

## Testing

1. Upload new photos and verify orientation data is populated
2. Create Magic Memory with 1 photo - should select portrait photos when available
3. Test different photo counts (1, 2, 4, 6) to verify grid layouts
4. Check PDF generation for proper photo sizing and positioning 