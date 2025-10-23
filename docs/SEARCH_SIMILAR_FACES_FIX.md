# Search Similar Faces Fix

## Problem Identified

**User Report**: "Search Similar Faces does not seem to be working. It seems if any face is assigned in a photo it skips the photo and does not look for the rest of the photos."

## Root Cause Analysis

The "Search Similar Faces" workflow was fundamentally broken due to a conceptual error:

### The Wrong Flow (Before Fix)

1. User clicks "Search Similar Faces"
2. System gets list of **unassigned faces** (faces already detected, with `rekognition_face_id`)
3. For each unassigned face, system called `/api/ai/index-face-rekognition`
4. That endpoint checked: "Does this ASSET already have faces?"
5. If YES → **Skipped the photo entirely**
6. Result: Photos with mixed assigned/unassigned faces were NEVER searched

### Example Scenario

Photo A has 3 faces:
- Face 1: Assigned to "Grandma" ✅
- Face 2: Unassigned ❓
- Face 3: Unassigned ❓

**What should happen**: Search for matches for Face 2 and Face 3

**What was happening**:
1. Search tries Face 2
2. Endpoint sees "Photo A already has faces" (Face 1 exists)
3. Returns `alreadyProcessed: true`
4. Face 2 is SKIPPED ❌
5. Same for Face 3 ❌

## The Correct Flow (After Fix)

### Key Insight

**Unassigned faces are ALREADY indexed in Rekognition** - they just aren't assigned to a person yet. We should NOT re-index the photo. We should just search for matches using the existing `rekognition_face_id`.

### New Architecture

Created a new endpoint: `/api/ai/search-face-matches`

**Purpose**: Search for matches for a face that's already indexed in Rekognition

**Input**:
```javascript
{
  faceId: "uuid",                    // Database face ID
  rekognitionFaceId: "aws-face-id"   // AWS Rekognition Face ID
}
```

**Process**:
1. Get user's Rekognition collection
2. Call `SearchFaces` with the existing `rekognitionFaceId`
3. For each match, check if that face is assigned to a person
4. Aggregate matches by person
5. Auto-assign if high confidence (≥95% similarity + 2 matches OR ≥97% single match)
6. Otherwise, return suggestions for user confirmation

**Output**:
```javascript
{
  success: true,
  action: "auto_assigned" | "needs_user_input" | "no_match",
  autoAssigned: [...],      // Faces that were auto-assigned
  needsUserInput: [...]     // Faces needing user confirmation
}
```

## Files Changed

### Created
- ✅ `server/api/ai/search-face-matches.post.js` - New endpoint for searching already-indexed faces

### Modified
- ✅ `pages/app/person-manager.vue` - Updated `searchSimilarFaces()` to call new endpoint
- ✅ `server/api/ai/index-face-rekognition.post.js` - No changes needed (reverted temporary changes)

## How It Works Now

### 1. Initial Photo Upload
```
Photo uploaded
    ↓
/api/ai/index-face-rekognition
    ↓
IndexFaces detects 3 faces
    ↓
All 3 faces stored in database with needs_assignment=true
```

### 2. User Assigns One Face
```
User clicks face 1 → assigns to "Grandma"
    ↓
Face 1: needs_assignment=false, assigned to person
Face 2: needs_assignment=true (unassigned)
Face 3: needs_assignment=true (unassigned)
```

### 3. Search Similar Faces
```
User clicks "Search Similar Faces"
    ↓
Get unassigned faces (Face 2, Face 3)
    ↓
For Face 2:
    Call /api/ai/search-face-matches
        ↓
    SearchFaces in Rekognition collection
        ↓
    Found match to Face 1 ("Grandma") with 96% similarity
        ↓
    AUTO-ASSIGN Face 2 to "Grandma" ✅
    
For Face 3:
    Call /api/ai/search-face-matches
        ↓
    SearchFaces in Rekognition collection
        ↓
    Found match to Face 1 ("Grandma") with 85% similarity
        ↓
    SUGGEST "Grandma" to user for confirmation ❓
```

## Auto-Assignment Logic

Faces are automatically assigned when:

1. **Option 1**: Similarity ≥ 95% AND at least 2 matching faces to same person
   - Example: 96% match + 2 faces = very confident

2. **Option 2**: Similarity ≥ 97% (single very strong match)
   - Example: 98% match = confident even with 1 match

**Otherwise**: Show suggestions for user confirmation (80-95% similarity)

## Benefits

### Correct Behavior
- ✅ Searches ALL unassigned faces, regardless of whether photo has other assigned faces
- ✅ Doesn't re-index photos unnecessarily
- ✅ Uses existing Rekognition data efficiently

### Performance
- ✅ Faster: Only calls `SearchFaces`, not `IndexFaces`
- ✅ Cheaper: No duplicate face detection
- ✅ No risk of creating duplicate face records

### User Experience
- ✅ Photos with mixed assigned/unassigned faces are now properly handled
- ✅ Progressive face identification works correctly
- ✅ Auto-assignment when confident, user confirmation when uncertain

## Testing

### Test Case 1: Mixed Assigned/Unassigned Faces

**Setup**:
1. Upload photo with 3 faces (A, B, C)
2. Assign face A to "John"
3. Leave faces B and C unassigned

**Test**:
1. Click "Search Similar Faces"
2. **Expected**: Faces B and C are searched (not skipped)
3. **Verify**: Check terminal logs for "Searching for matches for face..."

### Test Case 2: Multiple Photos of Same Person

**Setup**:
1. Upload 3 photos of "Grandma"
2. Assign 1 face in photo 1 to "Grandma"
3. Leave faces in photos 2 and 3 unassigned

**Test**:
1. Click "Search Similar Faces"
2. **Expected**: Faces in photos 2 and 3 are auto-assigned or suggested
3. **Verify**: Check unassigned faces decreases

### Test Case 3: No Matches

**Setup**:
1. Upload photo with 1 face (new person, no other photos)
2. Face is unassigned

**Test**:
1. Click "Search Similar Faces"
2. **Expected**: Modal opens asking to create new person
3. **Verify**: `action: "no_match"` in response

## Monitoring Queries

### Check Unassigned Faces
```sql
SELECT 
  a.id as asset_id,
  a.title,
  COUNT(f.id) as total_faces,
  COUNT(f.id) FILTER (WHERE f.needs_assignment = true) as unassigned_faces,
  COUNT(fpl.id) as assigned_faces
FROM assets a
LEFT JOIN faces f ON f.asset_id = a.id AND f.deleted = false
LEFT JOIN face_person_links fpl ON fpl.face_id = f.id AND fpl.deleted = false
WHERE a.deleted = false
GROUP BY a.id, a.title
HAVING COUNT(f.id) FILTER (WHERE f.needs_assignment = true) > 0
ORDER BY unassigned_faces DESC;
```

### Check Auto-Assignment Stats
```sql
SELECT 
  auto_assigned,
  needs_assignment,
  COUNT(*) as face_count
FROM faces
WHERE deleted = false
GROUP BY auto_assigned, needs_assignment
ORDER BY auto_assigned DESC, needs_assignment;
```

## API Reference

### POST /api/ai/search-face-matches

Search for matches for an already-indexed face.

**Request Body**:
```json
{
  "faceId": "uuid",
  "rekognitionFaceId": "aws-face-id-string"
}
```

**Response**:
```json
{
  "success": true,
  "action": "auto_assigned",
  "matchCount": 5,
  "suggestionCount": 1,
  "autoAssigned": [
    {
      "faceId": "uuid",
      "personId": "uuid",
      "personName": "Grandma Sarah",
      "similarity": 96.5,
      "matchCount": 3
    }
  ],
  "needsUserInput": []
}
```

**Actions**:
- `auto_assigned`: Face was automatically assigned to a person
- `needs_user_input`: Found suggestions, needs user confirmation
- `no_match`: No similar faces found, needs new person creation

## Troubleshooting

### Issue: "No matches found" for obvious duplicates

**Check**:
1. Verify both faces are actually indexed:
   ```sql
   SELECT id, rekognition_face_id, needs_assignment 
   FROM faces 
   WHERE asset_id IN ('photo1_id', 'photo2_id');
   ```
2. Check if first face is assigned to a person
3. Verify face size (may be filtered if too small)

### Issue: Too many false positives

**Solution**: Increase similarity threshold in `search-face-matches.post.js`:
```javascript
FaceMatchThreshold: 85,  // Change from 80 to 85
```

### Issue: Too conservative (missing matches)

**Solution**: Lower auto-assignment threshold:
```javascript
const shouldAutoAssign = 
  (bestMatch.maxSimilarity >= 92 && bestMatch.matchCount >= 2) ||  // Lower from 95
  (bestMatch.maxSimilarity >= 95)  // Lower from 97
```

## Summary

The fix correctly implements the "Search Similar Faces" feature by:

1. ✅ Using a dedicated endpoint for searching already-indexed faces
2. ✅ Calling `SearchFaces` (not `IndexFaces`) on existing face IDs
3. ✅ Processing ALL unassigned faces, regardless of photo state
4. ✅ Auto-assigning high-confidence matches
5. ✅ Suggesting medium-confidence matches for user review
6. ✅ Avoiding duplicate face detection/indexing

Photos with mixed assigned/unassigned faces now work correctly! 🎉

