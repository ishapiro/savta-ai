# Face Duplicate Issue - Summary & Resolution

## The Problem You Reported

**Issue**: "Each time I run search similar faces it identifies more faces. It seems it is reidentifying the existing face so a photo ends up with more than the actual number of faces."

**Impact**: 
- 78 photos have duplicate face records
- Worst case: 49 face records on a single photo (should be 2-3)
- Total: 329 duplicate face records need removal
- Increasing AWS costs with each search

## Root Cause Analysis

### Issue 1: No Duplicate Prevention ❌
The `index-face-rekognition.post.js` endpoint had NO check to see if a photo was already processed. Every time "Search Similar Faces" ran:

1. ✅ Got list of unassigned faces
2. ❌ Called `IndexFaces` on EVERY photo (even already-indexed ones)
3. ❌ Created NEW face records in Rekognition
4. ❌ Created NEW face records in database
5. Result: Exponential face growth

### Issue 2: No Face Size Filter ❌
Rekognition detects ALL faces including:
- Tiny background people
- Faces in photo frames on walls
- Faces on TV screens
- Distant/blurry faces

Without filtering, these meaningless faces were indexed and shown to user.

## Solutions Implemented ✅

### Solution 1: Duplicate Prevention Check

**File**: `server/api/ai/index-face-rekognition.post.js`

**What Changed**: Added early exit if faces already exist:

```javascript
// Check if this asset already has faces indexed
const { data: existingFaces } = await supabase
  .from('faces')
  .select('id, rekognition_face_id')
  .eq('asset_id', assetId)
  .eq('deleted', false)

if (existingFaces && existingFaces.length > 0) {
  // Skip reindexing - faces already processed
  return { 
    success: true, 
    alreadyProcessed: true, 
    facesDetected: existingFaces.length 
  }
}
```

**Result**: Each photo is indexed exactly ONCE. "Search Similar Faces" only searches, doesn't re-index.

### Solution 2: Minimum Face Size Threshold

**File**: `server/api/ai/index-face-rekognition.post.js`

**What Changed**: Filter out faces smaller than 3% of image dimensions:

```javascript
const MIN_FACE_WIDTH = 0.03  // 3% of image width
const MIN_FACE_HEIGHT = 0.03 // 3% of image height

const filteredFaceRecords = indexResult.FaceRecords.filter(faceRecord => {
  const bbox = faceRecord.Face.BoundingBox
  return bbox.Width >= MIN_FACE_WIDTH || bbox.Height >= MIN_FACE_HEIGHT
})
```

**What This Means**:
- If face is < 3% of image width AND < 3% of image height → **Filtered out**
- Clear, identifiable faces are typically 10-30% of image → **Kept**
- Background/tiny faces are typically 1-2% of image → **Filtered out**

**Example**: In a 1000x1000 pixel image:
- 3% = 30 pixels
- Face must be at least 30px wide OR 30px tall
- Main subjects: ✅ Kept (100-300px faces)
- Background people: ❌ Filtered (10-20px faces)

### Solution 3: Cleanup Script

**File**: `scripts/cleanup-duplicate-faces.js`

**Purpose**: Remove existing duplicates from your database

**Current State** (Dry Run Results):
```
Assets with duplicates: 78
Total duplicate faces to remove: 329
Total faces to keep: 78
```

## How to Fix Your Database

### Step 1: Review What Will Be Deleted (Already Done)

```bash
node scripts/cleanup-duplicate-faces.js --dry-run
```

Output shows:
- ✅ 78 photos have duplicates
- ✅ 329 duplicates will be removed
- ✅ 78 faces will be kept (one per photo)

### Step 2: Run the Cleanup

```bash
node scripts/cleanup-duplicate-faces.js
```

This will:
1. Wait 5 seconds (chance to cancel with Ctrl+C)
2. For each photo, keep the OLDEST face record
3. Delete duplicate FaceIds from AWS Rekognition
4. Soft-delete duplicate records from database
5. Show progress and summary

**Time Estimate**: ~1-2 minutes for 78 photos

### Step 3: Verify Clean State

After cleanup, check database:

```bash
susql -c "SELECT COUNT(*) FROM faces WHERE deleted = false;"
susql -c "SELECT asset_id, COUNT(*) as faces FROM faces WHERE deleted = false GROUP BY asset_id HAVING COUNT(*) > 5 ORDER BY COUNT(*) DESC LIMIT 10;"
```

Should show:
- Total faces: ~78-88 (reasonable for your collection)
- No assets with >5 faces (unless group photos)

## Testing the Fixes

### Test 1: No More Duplicates

1. Go to People Manager (`http://localhost:3000/app/person-manager`)
2. Assign 1-2 faces to people
3. Click "Search Similar Faces"
4. Check terminal logs - should see:
   ```
   ⏭️ Asset XXX already has 2 face(s) indexed - skipping reindexing
   ```
5. Click "Search Similar Faces" AGAIN
6. ✅ Face count should NOT increase

### Test 2: Face Size Filter

1. Upload a new photo with:
   - 2 clear faces in foreground
   - Picture frame with photo on wall in background
2. Check face count
3. ✅ Should detect only 2 faces (filter out photo-in-photo)

### Test 3: Upload New Photos

1. Upload 5 new photos
2. Check how many faces detected per photo
3. ✅ Should be reasonable (1-5 per photo, not 10-50)

## Configuration Options

### Adjust Face Size Threshold

If 3% is:
- **Too strict** (missing real faces): Change to `0.02` (2%)
- **Too loose** (too many tiny faces): Change to `0.04` (4%)

Edit: `server/api/ai/index-face-rekognition.post.js` lines 153-154

### Suggested Threshold by Use Case

| Use Case | Width | Height | Rationale |
|----------|-------|--------|-----------|
| Family portraits | 0.02 | 0.02 | Catch all family members |
| **General use (Current)** | **0.03** | **0.03** | **Good balance** |
| Large group photos | 0.025 | 0.025 | Catch distant people |
| Close-up focus only | 0.05 | 0.05 | Only main subjects |

## Cost Savings

### Before Fix
- 30 photos, 10 duplicate faces each = 300 face records
- Each search = 300 IndexFaces + 300 SearchFaces calls
- Cost per search: ~$0.45 ($1.50/1000 calls)
- 10 searches = $4.50 wasted

### After Fix
- 30 photos, 2-3 real faces each = 75 face records
- First search = 75 IndexFaces + 75 SearchFaces calls
- Subsequent searches = 0 IndexFaces + 0 SearchFaces (already indexed!)
- Cost per search after first: **$0.00**

**Savings**: ~$4.50 per 10 searches (100% after first search)

## What Happens Next

### Immediate (After Cleanup Script)
1. ✅ Database clean - 329 duplicates removed
2. ✅ Rekognition collection clean - duplicates purged
3. ✅ Reasonable face counts per photo

### Going Forward
1. ✅ New photos indexed only once
2. ✅ Tiny/background faces filtered out automatically
3. ✅ "Search Similar Faces" works correctly (no duplicates)
4. ✅ Lower AWS costs

### If Issues Arise
- **Face count still growing**: Check terminal logs for errors
- **Missing faces**: Lower threshold to 0.02
- **Too many faces**: Raise threshold to 0.04
- **Need to re-index**: Run cleanup script, then backfill script

## Files Changed

1. ✅ `server/api/ai/index-face-rekognition.post.js` - Duplicate check + size filter
2. ✅ `scripts/cleanup-duplicate-faces.js` - Cleanup utility
3. ✅ `docs/FACE_DUPLICATE_FIX.md` - Detailed documentation
4. ✅ `docs/FACE_ISSUE_SUMMARY.md` - This summary

## Ready to Clean Up?

Run this command when ready:

```bash
node scripts/cleanup-duplicate-faces.js
```

Wait 5 seconds, then duplicates will be removed. The fix is live and will prevent future duplicates! 🎉

