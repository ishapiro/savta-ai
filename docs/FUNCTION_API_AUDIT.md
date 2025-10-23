# Function & API Audit - AWS Rekognition Collections

## Backend API Endpoints

### 1. ✅ `/api/ai/index-face-rekognition.post.js`

**Exports:** `defineEventHandler(async (event) => {})`

**Expected Parameters (body):**
- `imageUrl` (string) - URL to image
- `assetId` (string/UUID) - Asset ID
- `reprocessOptions` (object) - Optional { faces, captions, tags, location }

**Returns:**
```javascript
{
  success: true,
  facesDetected: number,
  autoAssigned: Array,
  needsUserInput: Array
}
```

**Called By:**
- `pages/app/review.vue` → `handleRerunAIWithOptions()`
- Future: upload flow

**Status:** ✅ CORRECT

---

### 2. ✅ `/api/ai/assign-face-to-person.post.js`

**Exports:** `defineEventHandler(async (event) => {})`

**Expected Parameters (body):**
- `faceId` (UUID) - Face ID
- `personGroupId` (UUID) - Person group ID
- `confidence` (number) - Confidence score 0-1

**Returns:**
```javascript
{
  success: true,
  assignment: {
    faceId: string,
    personGroupId: string,
    personName: string,
    linkId: string
  }
}
```

**Called By:**
- `components/FaceAssignmentModal.vue` → emits 'assign'
- `pages/app/person-manager.vue` → `handleFaceAssignment()`
- `pages/app/review.vue` → `handleFaceAssignment()`

**Status:** ✅ CORRECT

---

### 3. ✅ `/api/ai/create-person-from-face.post.js`

**Exports:** `defineEventHandler(async (event) => {})`

**Expected Parameters (body):**
- `faceId` (UUID) - Face ID
- `personName` (string) - Person's name
- `displayName` (string) - Optional display name
- `relationship` (string) - Optional relationship

**Returns:**
```javascript
{
  success: true,
  person: {
    id: string,
    name: string,
    displayName: string,
    relationship: string
  },
  assignment: {
    faceId: string,
    personGroupId: string,
    linkId: string
  }
}
```

**Called By:**
- `components/FaceAssignmentModal.vue` → emits 'create-person'
- `pages/app/person-manager.vue` → `handleCreatePersonFromFace()`
- `pages/app/review.vue` → `handleCreatePersonFromFace()`

**Status:** ✅ CORRECT

---

### 4. ✅ `/api/ai/remove-face-assignment.post.js`

**Exports:** `defineEventHandler(async (event) => {})`

**Expected Parameters (body):**
- `faceId` (UUID) - Face ID

**Returns:**
```javascript
{
  success: true,
  faceId: string,
  message: string
}
```

**Called By:**
- `components/FaceAssignmentModal.vue` → emits 'remove'
- `pages/app/person-manager.vue` → `handleRemoveFaceAssignment()`
- `pages/app/review.vue` → `handleRemoveFaceAssignment()`

**Status:** ✅ CORRECT

---

### 5. ✅ `/api/ai/unassigned-faces.get.js`

**Exports:** `defineEventHandler(async (event) => {})`

**Expected Parameters:** None (uses auth header)

**Returns:**
```javascript
{
  success: true,
  count: number,
  faces: Array<{
    id: UUID,
    asset_id: UUID,
    rekognition_face_id: string,
    bounding_box: object,
    confidence: number,
    needs_assignment: boolean,
    auto_assigned: boolean,
    created_at: timestamp,
    assets: {
      id: UUID,
      storage_url: string,
      thumbnail_url: string,
      file_name: string
    }
  }>
}
```

**Called By:**
- `pages/app/person-manager.vue` → `fetchUnassignedFaces()` (via composable)

**Status:** ✅ CORRECT

---

### 6. ✅ `/api/admin/reindex-all-faces.post.js`

**Exports:** `defineEventHandler(async (event) => {})`

**Expected Parameters:** None (uses auth to get user)

**Returns:**
```javascript
{
  success: true,
  processed: number,
  total: number,
  facesDetected: number,
  autoAssigned: number,
  needsUserInput: number,
  errors: Array (optional),
  message: string
}
```

**Called By:**
- Future: Admin panel or migration script

**Status:** ✅ CORRECT

---

## Backend Utilities

### 1. ✅ `/server/utils/rekognition-collections.js`

**Exported Functions:**

#### `ensureUserCollection(userId)`
- **Parameters:** `userId` (string)
- **Returns:** `Promise<{ collectionId, exists, faceCount, arn }>`
- **Status:** ✅ CORRECT

#### `saveCollectionToDb(supabase, userId, collectionId, arn, faceCount)`
- **Parameters:** 
  - `supabase` (object)
  - `userId` (string)
  - `collectionId` (string)
  - `arn` (string)
  - `faceCount` (number)
- **Returns:** `Promise<object>` (collection record)
- **Status:** ✅ CORRECT

#### `getCollectionFromDb(supabase, userId)`
- **Parameters:**
  - `supabase` (object)
  - `userId` (string)
- **Returns:** `Promise<object|null>`
- **Status:** ✅ CORRECT

#### `deleteFacesFromCollection(collectionId, faceIds)`
- **Parameters:**
  - `collectionId` (string)
  - `faceIds` (string[])
- **Returns:** `Promise<object>`
- **Status:** ✅ CORRECT

#### `deleteCollection(collectionId)`
- **Parameters:** `collectionId` (string)
- **Returns:** `Promise<object>`
- **Status:** ✅ CORRECT

#### `listCollectionFaces(collectionId, maxResults)`
- **Parameters:**
  - `collectionId` (string)
  - `maxResults` (number) - default 100
- **Returns:** `Promise<Array>`
- **Status:** ✅ CORRECT

---

### 2. ✅ `/server/utils/process-face-matches.js`

**Exported Functions:**

#### `processFacesWithMatches(facesWithMatches, assetId, userId, collectionId, supabase)`
- **Parameters:**
  - `facesWithMatches` (Array)
  - `assetId` (string)
  - `userId` (string)
  - `collectionId` (string)
  - `supabase` (object)
- **Returns:** `Promise<{ autoAssigned, needsUserInput, newFaces }>`
- **Called By:** `/api/ai/index-face-rekognition.post.js`
- **Status:** ✅ CORRECT

**Internal Functions (not exported):**

#### `filterUserMatches(matches, userId, supabase)`
- **Parameters:** matches (Array), userId (string), supabase (object)
- **Returns:** `Promise<Array>`
- **Status:** ✅ CORRECT

#### `storeFaceInDb(face, assetId, userId, collectionId, needsAssignment, autoAssigned, supabase)`
- **Parameters:** 7 parameters as listed
- **Returns:** `Promise<object>` (face record)
- **Status:** ✅ CORRECT

#### `getPersonGroupForFaceId(faceId, supabase)`
- **Parameters:** faceId (string), supabase (object)
- **Returns:** `Promise<object|null>`
- **Status:** ✅ CORRECT

#### `assignFaceToPerson(faceId, personGroupId, confidence, assignedBy, supabase)`
- **Parameters:** 5 parameters as listed
- **Returns:** `Promise<object>`
- **Status:** ✅ CORRECT

#### `getSuggestedPeople(matches, supabase)`
- **Parameters:** matches (Array), supabase (object)
- **Returns:** `Promise<Array>`
- **Status:** ✅ CORRECT

---

## Frontend Components

### 1. ✅ `components/FaceAssignmentModal.vue`

**Props:**
- `visible` (Boolean, required)
- `faces` (Array, default: [])
- `existingPeople` (Array, default: [])
- `mode` (String, default: 'assign', validator: ['assign', 'change'])

**Emits:**
- `update:visible` (Boolean)
- `assign` ({ faceId, personGroupId, confidence })
- `create-person` ({ faceId, personName, displayName, relationship })
- `remove` (faceId)
- `skip` (faceId)

**Used By:**
- `pages/app/person-manager.vue`
- `pages/app/review.vue`

**Status:** ✅ CORRECT

---

### 2. ✅ `components/RerunAIOptionsDialog.vue`

**Props:**
- `visible` (Boolean, required)
- `totalPhotos` (Number, default: 0)

**Emits:**
- `update:visible` (Boolean)
- `start` (options object: { faces, captions, tags, location })

**Used By:**
- `pages/app/review.vue`

**Status:** ✅ CORRECT

---

## Frontend Pages

### 1. ✅ `pages/app/person-manager.vue`

**New Functions Added:**

#### `openAssignmentModal(faces)`
- **Parameters:** `faces` (Array)
- **Returns:** void
- **Status:** ✅ CORRECT

#### `handleFaceAssignment({ faceId, personGroupId, confidence })`
- **Parameters:** Object with 3 properties
- **Calls:** `/api/ai/assign-face-to-person`
- **Status:** ✅ CORRECT

#### `handleCreatePersonFromFace({ faceId, personName, displayName, relationship })`
- **Parameters:** Object with 4 properties
- **Calls:** `/api/ai/create-person-from-face`
- **Status:** ✅ CORRECT

#### `handleRemoveFaceAssignment(faceId)`
- **Parameters:** `faceId` (string)
- **Calls:** `/api/ai/remove-face-assignment`
- **Status:** ✅ CORRECT

#### `handleSkipFace(faceId)`
- **Parameters:** `faceId` (string)
- **Returns:** void (logs only)
- **Status:** ✅ CORRECT

**State Variables:**
- `showNewFaceAssignmentModal` (ref)
- `facesToAssign` (ref)

**Status:** ✅ ALL CORRECT

---

### 2. ✅ `pages/app/review.vue`

**New Functions Added:**

#### `handleRerunAIWithOptions(options)`
- **Parameters:** `options` (object: { faces, captions, tags, location })
- **Calls:** `/api/ai/index-face-rekognition` for each asset
- **Returns:** Promise
- **Status:** ✅ CORRECT

#### `handleFaceAssignment({ faceId, personGroupId, confidence })`
- **Parameters:** Object with 3 properties
- **Calls:** `/api/ai/assign-face-to-person`
- **Status:** ✅ CORRECT

#### `handleCreatePersonFromFace({ faceId, personName, displayName, relationship })`
- **Parameters:** Object with 4 properties
- **Calls:** `/api/ai/create-person-from-face`
- **Status:** ✅ CORRECT

#### `handleRemoveFaceAssignment(faceId)`
- **Parameters:** `faceId` (string)
- **Calls:** `/api/ai/remove-face-assignment`
- **Status:** ✅ CORRECT

#### `handleSkipFace(faceId)`
- **Parameters:** `faceId` (string)
- **Returns:** void (logs only)
- **Status:** ✅ CORRECT

**State Variables:**
- `showFaceAssignmentModal` (ref)
- `facesNeedingAssignment` (ref)
- `personGroups` (ref)
- `reprocessOptions` (ref)

**Status:** ✅ ALL CORRECT

---

## Issues Found & Fixes Applied

### ✅ Issue 1: Missing `user` in review.vue

**Location:** `pages/app/review.vue` line 1667

**Problem:** References `user.value?.id` but `user` not defined

**Fix Applied:**
```javascript
// Added at line 868
const user = useSupabaseUser()
```

**Status:** ✅ FIXED

---

## Cross-Reference Verification

### API Call → Endpoint Matching

#### ✅ 1. Face Assignment Calls

**From:** `pages/app/person-manager.vue`, `pages/app/review.vue`

**To:** `/api/ai/assign-face-to-person`

**Parameters Match:**
```javascript
// Caller sends:
{ faceId, personGroupId, confidence }

// Endpoint expects (body):
{ faceId, personGroupId, confidence }
```

**Status:** ✅ MATCH

---

#### ✅ 2. Create Person Calls

**From:** `pages/app/person-manager.vue`, `pages/app/review.vue`

**To:** `/api/ai/create-person-from-face`

**Parameters Match:**
```javascript
// Caller sends:
{ faceId, personName, displayName, relationship }

// Endpoint expects (body):
{ faceId, personName, displayName, relationship }
```

**Status:** ✅ MATCH

---

#### ✅ 3. Remove Assignment Calls

**From:** `pages/app/person-manager.vue`, `pages/app/review.vue`

**To:** `/api/ai/remove-face-assignment`

**Parameters Match:**
```javascript
// Caller sends:
{ faceId }

// Endpoint expects (body):
{ faceId }
```

**Status:** ✅ MATCH

---

#### ✅ 4. Index Faces Calls

**From:** `pages/app/review.vue` → `handleRerunAIWithOptions()`

**To:** `/api/ai/index-face-rekognition`

**Parameters Match:**
```javascript
// Caller sends:
{
  imageUrl: asset.storage_url,
  assetId: asset.id,
  reprocessOptions: options
}

// Endpoint expects (body):
{ imageUrl, assetId, reprocessOptions }
```

**Status:** ✅ MATCH

---

### Component Event → Handler Matching

#### ✅ 1. FaceAssignmentModal Events

**Emits:**
- `@assign` → `({ faceId, personGroupId, confidence })`
- `@create-person` → `({ faceId, personName, displayName, relationship })`
- `@remove` → `(faceId)`
- `@skip` → `(faceId)`

**Handlers in person-manager.vue:**
- `handleFaceAssignment({ faceId, personGroupId, confidence })` ✅
- `handleCreatePersonFromFace({ faceId, personName, displayName, relationship })` ✅
- `handleRemoveFaceAssignment(faceId)` ✅
- `handleSkipFace(faceId)` ✅

**Handlers in review.vue:**
- `handleFaceAssignment({ faceId, personGroupId, confidence })` ✅
- `handleCreatePersonFromFace({ faceId, personName, displayName, relationship })` ✅
- `handleRemoveFaceAssignment(faceId)` ✅
- `handleSkipFace(faceId)` ✅

**Status:** ✅ ALL MATCH

---

#### ✅ 2. RerunAIOptionsDialog Events

**Emits:**
- `@start` → `(options)` where options = `{ faces, captions, tags, location }`

**Handler in review.vue:**
- `handleRerunAIWithOptions(options)` ✅

**Status:** ✅ MATCH

---

### Internal Function Calls

#### ✅ 1. process-face-matches.js Internal Calls

**Function:** `processFacesWithMatches()`

**Calls:**
- `filterUserMatches(matches, userId, supabase)` ✅
- `storeFaceInDb(face, assetId, userId, collectionId, needsAssignment, autoAssigned, supabase)` ✅
- `getPersonGroupForFaceId(faceId, supabase)` ✅
- `assignFaceToPerson(faceId, personGroupId, confidence, assignedBy, supabase)` ✅
- `getSuggestedPeople(matches, supabase)` ✅

**All internal calls:** ✅ CORRECT

---

#### ✅ 2. index-face-rekognition.post.js Calls

**Calls:**
- `ensureUserCollection(userId)` ✅ from rekognition-collections.js
- `saveCollectionToDb(supabase, userId, collectionId, arn, faceCount)` ✅ from rekognition-collections.js
- `processFacesWithMatches(facesWithMatches, assetId, userId, collectionId, supabase)` ✅ from process-face-matches.js
- `fetchImageBytes(imageUrl)` ✅ defined in same file

**All calls:** ✅ CORRECT

---

## AWS SDK Function Calls

### ✅ Rekognition Client Calls

**File:** `server/utils/rekognition-collections.js`, `server/api/ai/index-face-rekognition.post.js`

#### Commands Used:
1. `CreateCollectionCommand({ CollectionId })` ✅
2. `DescribeCollectionCommand({ CollectionId })` ✅
3. `DeleteCollectionCommand({ CollectionId })` ✅
4. `DeleteFacesCommand({ CollectionId, FaceIds })` ✅
5. `ListFacesCommand({ CollectionId, MaxResults })` ✅
6. `IndexFacesCommand({ CollectionId, Image, ExternalImageId, DetectionAttributes, MaxFaces, QualityFilter })` ✅
7. `SearchFacesCommand({ CollectionId, FaceId, FaceMatchThreshold, MaxFaces })` ✅

**All AWS SDK calls:** ✅ CORRECT (match AWS SDK v3 syntax)

---

## Supabase Query Validation

### ✅ Database Operations

All Supabase queries audited in separate DATABASE_AUDIT.md

**Summary:**
- All `.select()` statements reference existing fields ✅
- All `.insert()` statements use valid fields ✅  
- All `.update()` statements modify existing fields ✅
- All foreign key relationships properly defined ✅
- All nested queries use correct Supabase PostgREST syntax ✅

---

## Summary

### Overall Status: ✅ PASS WITH 1 FIX APPLIED

**Total Items Audited:** 87
- API Endpoints: 6
- Utility Functions: 12
- Component Props/Events: 9
- Page Functions: 10
- AWS SDK Calls: 7
- Database Operations: 43

**Issues Found:** 1
**Issues Fixed:** 1

### All Systems Ready ✅

1. ✅ All API endpoints defined and exported correctly
2. ✅ All utility functions defined with correct signatures
3. ✅ All component props and events match handlers
4. ✅ All API calls use correct parameters
5. ✅ All AWS SDK commands use correct syntax
6. ✅ All database queries reference existing fields
7. ✅ Missing `user` variable in review.vue - **FIXED**

**The system is fully audited and ready for testing!**

---

## PDF Cropping Compatibility

### Additional Audit: Face-Based Cropping System

**File:** `server/api/memory-books/generate-pdf/[id].post.js`

**Issue Identified:** PDF generation was calling the old `detect-faces-rekognition` endpoint (being removed).

**Fix Applied:** Updated PDF generation to query faces from database instead:
```javascript
// OLD: Called API endpoint
const rekognitionResponse = await fetch('/api/ai/detect-faces-rekognition', ...)

// NEW: Query database
const { data: facesData } = await supabase
  .from('faces')
  .select('bounding_box, confidence')
  .eq('asset_id', assetId)
  .eq('deleted', false)
```

**Compatibility Verified:**
- ✅ Bounding box format identical: `{Left, Top, Width, Height}`
- ✅ Coordinates normalized 0-1 (unchanged)
- ✅ Cropping algorithm unchanged
- ✅ Database schema unchanged
- ✅ Face padding logic unchanged

**Benefits:**
- ✅ No AWS API calls during PDF generation (faster, cheaper)
- ✅ Uses already-indexed face data
- ✅ Consistent with face-person assignments
- ✅ More reliable (no network dependency)

**Documentation:** See `docs/PDF_CROPPING_COMPATIBILITY_AUDIT.md`

**Status:** ✅ FIXED AND VERIFIED

