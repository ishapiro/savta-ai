# Face Duplicate Issue and Fix

## Problem Description

When running "Search Similar Faces" multiple times on the People Manager page, the system was creating **duplicate face records** for the same photos. This resulted in:

- Photos showing far more faces than actually existed
- One photo had 49 face records when it should have had 2-3
- AWS Rekognition collection bloat with duplicate FaceIds
- Wasted API calls and costs

### Root Causes

1. **No Duplicate Check**: The `index-face-rekognition.post.js` endpoint did NOT check if faces were already indexed for an asset before calling `IndexFaces` again.

2. **No Face Size Filtering**: Very small faces (background people, faces in photos on walls, etc.) were being detected and indexed, creating noise.

## Solution Implemented

### 1. Prevent Re-indexing (Primary Fix)

**File**: `server/api/ai/index-face-rekognition.post.js`

**Change**: Added check at the start of face indexing:

```javascript
// Check if this asset already has faces indexed
const { data: existingFaces } = await supabase
  .from('faces')
  .select('id, rekognition_face_id')
  .eq('asset_id', assetId)
  .eq('deleted', false)

if (existingFaces && existingFaces.length > 0) {
  console.log(`⏭️ Asset ${assetId} already has ${existingFaces.length} face(s) indexed - skipping reindexing`)
  
  return {
    success: true,
    alreadyProcessed: true,
    facesDetected: existingFaces.length,
    autoAssigned: [],
    needsUserInput: []
  }
}
```

**Result**: Photos are indexed exactly once. "Search Similar Faces" now only searches for matches without re-indexing.

### 2. Face Size Threshold Filter

**File**: `server/api/ai/index-face-rekognition.post.js`

**Change**: Added minimum face size filter after `IndexFaces` returns:

```javascript
// Filter faces by minimum size threshold
const MIN_FACE_WIDTH = 0.03  // 3% of image width
const MIN_FACE_HEIGHT = 0.03 // 3% of image height

const filteredFaceRecords = indexResult.FaceRecords.filter(faceRecord => {
  const bbox = faceRecord.Face.BoundingBox
  const width = bbox.Width || 0
  const height = bbox.Height || 0
  
  // Face must meet minimum width OR height threshold
  return width >= MIN_FACE_WIDTH || height >= MIN_FACE_HEIGHT
})
```

**Rationale**:
- BoundingBox dimensions are percentage of image (0.0 to 1.0)
- 3% width = face is 3% of image width
- 3% height = face is 3% of image height
- Filters out tiny background faces, faces in photo frames, etc.
- Keeps meaningful faces that are large enough to identify

**Threshold Selection**:
- **3% (Current)**: Conservative - keeps most human faces, filters tiny ones
- **5%**: More aggressive - might miss some legitimate distant faces
- **2%**: Too permissive - might include too many background faces

### 3. Cleanup Script

**File**: `scripts/cleanup-duplicate-faces.js`

**Purpose**: Remove existing duplicate faces from database and Rekognition collection

**Usage**:
```bash
# Dry run (see what would be deleted)
node scripts/cleanup-duplicate-faces.js --dry-run

# Actually delete duplicates (all users)
node scripts/cleanup-duplicate-faces.js

# Delete duplicates for specific user
node scripts/cleanup-duplicate-faces.js --user-id <uuid>
```

**What it does**:
1. Finds all assets with multiple face records
2. For each asset, keeps the OLDEST face record (first one created)
3. Soft-deletes duplicate faces from database
4. Deletes duplicate FaceIds from Rekognition collection
5. Shows detailed progress and summary

**Safety**:
- 5-second confirmation delay before deletion
- Dry-run mode to preview changes
- Soft-deletes from database (can be recovered)
- Detailed logging of all operations

## How to Fix Your Database

### Step 1: Check for Duplicates

```bash
node scripts/cleanup-duplicate-faces.js --dry-run
```

This will show:
- How many assets have duplicates
- Top 10 worst offenders
- Total duplicate faces to remove

### Step 2: Clean Up Duplicates

```bash
node scripts/cleanup-duplicate-faces.js
```

Wait 5 seconds, then it will:
- Delete duplicate faces from Rekognition
- Soft-delete duplicate faces from database
- Show summary of deleted records

### Step 3: Verify Clean State

Check that all assets now have reasonable face counts:

```sql
SELECT asset_id, COUNT(*) as face_count 
FROM faces 
WHERE deleted = false 
GROUP BY asset_id 
HAVING COUNT(*) > 5 
ORDER BY face_count DESC;
```

Should show NO assets with unreasonably high counts (unless it's a large group photo).

## Testing the Fix

### Test 1: New Photos

1. Upload a new photo with 2-3 faces
2. Go to People Manager
3. Assign one face to a person
4. Click "Search Similar Faces"
5. **Expected**: Photo should show 2-3 faces (not increasing)
6. Click "Search Similar Faces" again
7. **Expected**: Photo STILL shows 2-3 faces (no new duplicates)

### Test 2: Face Size Filter

1. Upload a photo with:
   - 2-3 clear, close-up faces (should be detected)
   - Photos on walls in background (should be filtered out)
   - Distant background people (should be filtered out)
2. Check face count in database
3. **Expected**: Only the 2-3 clear faces are indexed

### Test 3: Existing Photos

1. Photos already indexed should NOT be re-indexed
2. Check terminal logs when running search
3. **Expected**: See "⏭️ Asset ... already has X face(s) indexed - skipping reindexing"

## Monitoring

### Check for Duplicates
```sql
SELECT asset_id, COUNT(*) as face_count 
FROM faces 
WHERE deleted = false 
GROUP BY asset_id 
HAVING COUNT(*) > 1 
ORDER BY face_count DESC 
LIMIT 10;
```

### Check Collection Stats
```sql
SELECT 
  fc.user_id,
  fc.aws_collection_id,
  fc.face_count as collection_face_count,
  COUNT(f.id) as db_face_count
FROM face_collections fc
LEFT JOIN faces f ON f.user_id = fc.user_id AND f.deleted = false
GROUP BY fc.user_id, fc.aws_collection_id, fc.face_count;
```

## Configuration

### Adjusting Face Size Threshold

If you find the 3% threshold is:
- **Too strict** (missing legitimate faces): Lower to 2% or 2.5%
- **Too loose** (too many background faces): Raise to 4% or 5%

Edit `server/api/ai/index-face-rekognition.post.js`:

```javascript
const MIN_FACE_WIDTH = 0.03  // Change this value
const MIN_FACE_HEIGHT = 0.03 // Change this value
```

## Future Improvements

1. **Configuration**: Make face size threshold configurable via environment variable
2. **Admin UI**: Add duplicate detection to Admin Dashboard
3. **Metrics**: Track filtered face counts for threshold tuning
4. **Warnings**: Alert user if photo has NO faces after filtering

## Technical Notes

### Why Keep Oldest Face?

When duplicates exist, we keep the oldest (first created) face because:
1. It was likely indexed when photo was first uploaded
2. May already have person assignments
3. Most stable reference for that face

### Why Soft Delete?

Database uses soft delete (`deleted = true`) instead of hard delete because:
1. Maintains data integrity
2. Allows recovery if needed
3. Preserves audit trail
4. Consistent with rest of application

### Rekognition Collection Sync

The cleanup script deletes from BOTH database and Rekognition to keep them in sync. If they get out of sync:
- Database shows faces that don't exist in Rekognition (broken)
- Rekognition has faces not in database (wasted storage/cost)

## Cost Impact

### Before Fix
- 30 photos with average 10 duplicate faces each = 300 extra face records
- Each "Search Similar Faces" = 300 SearchFaces API calls
- Cost: ~$0.30 per search ($1 per 1000 calls)

### After Fix
- 30 photos with average 2-3 real faces each = 75 face records
- Each "Search Similar Faces" = 0 IndexFaces calls (already indexed)
- Cost: $0 per search (no new indexing)

**Savings**: 75% reduction in face records, ~100% savings on repeated searches

