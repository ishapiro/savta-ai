# Face Recognition with AWS Rekognition Collections

## Overview

Savta.ai uses AWS Rekognition Collections for face detection, indexing, and matching. This architecture eliminates local vector storage and leverages Rekognition's native face matching capabilities for robust, scalable face recognition.

## Architecture

### Key Components

1. **AWS Rekognition Collections**: One collection per user (`savta-user-{userId}`)
2. **IndexFaces API**: Detects faces and adds them to the collection
3. **SearchFaces API**: Finds similar faces within the collection
4. **Auto-Assignment Logic**: Automatically assigns highly similar faces (≥95%)
5. **User Prompts**: Requests user input for medium similarity (80-94%) or new faces

### Data Flow

```
Photo Upload
    ↓
IndexFaces (detect + index)
    ↓
For each face: SearchFaces (find matches)
    ↓
Process Matches:
    - Similarity ≥ 95% → Auto-assign to person
    - Similarity 80-94% → Prompt user with suggestions
    - Similarity < 80% or no matches → User creates new person
    ↓
Store in Database (faces, face_person_links tables)
```

## Database Schema

### `faces` Table

Stores detected faces with Rekognition FaceIds:

```sql
CREATE TABLE faces (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  rekognition_face_id TEXT NOT NULL,  -- FaceId from Rekognition
  rekognition_image_id TEXT,          -- External image ID
  bounding_box JSONB NOT NULL,        -- Face location (for cropping)
  confidence DECIMAL(5,4) NOT NULL,   -- Detection confidence (0-1)
  needs_assignment BOOLEAN DEFAULT true,
  auto_assigned BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted BOOLEAN DEFAULT false
);
```

**Key Fields:**
- `rekognition_face_id`: Unique FaceId from AWS Rekognition IndexFaces
- `rekognition_image_id`: External image ID (typically `asset_id`)
- `bounding_box`: Face coordinates for image cropping `{Left, Top, Width, Height}`
- `needs_assignment`: Face awaiting user assignment
- `auto_assigned`: Face was automatically assigned by the system

### `face_collections` Table

Tracks user's Rekognition collections:

```sql
CREATE TABLE face_collections (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  aws_collection_id TEXT UNIQUE NOT NULL,
  rekognition_arn TEXT,
  face_count INTEGER DEFAULT 0,
  last_indexed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted BOOLEAN DEFAULT false
);
```

### `person_groups` Table

User-defined people (names):

```sql
CREATE TABLE person_groups (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  avatar_face_id UUID,  -- Representative face
  relationship TEXT,
  is_primary_person BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted BOOLEAN DEFAULT false
);
```

### `face_person_links` Table

Many-to-many relationship between faces and people:

```sql
CREATE TABLE face_person_links (
  id UUID PRIMARY KEY,
  face_id UUID NOT NULL,
  person_group_id UUID NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  assigned_by TEXT CHECK (assigned_by IN ('ai', 'user', 'system')),
  assigned_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted BOOLEAN DEFAULT false
);
```

## API Endpoints

### 1. Index Faces

**POST** `/api/ai/index-face-rekognition`

Detects and indexes faces in an image.

**Request:**
```json
{
  "imageUrl": "https://...",
  "assetId": "uuid",
  "reprocessOptions": {
    "faces": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "facesDetected": 2,
  "autoAssigned": [
    {
      "face": { "id": "...", "rekognition_face_id": "..." },
      "person": { "id": "...", "name": "Grandma" },
      "similarity": 98.5
    }
  ],
  "needsUserInput": [
    {
      "face": { "id": "...", "rekognition_face_id": "..." },
      "suggestions": [
        { "person": {...}, "similarity": 87.2 }
      ]
    }
  ]
}
```

### 2. Assign Face to Person

**POST** `/api/ai/assign-face-to-person`

User assigns a face to an existing person.

**Request:**
```json
{
  "faceId": "uuid",
  "personGroupId": "uuid",
  "confidence": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "assignment": {
    "faceId": "...",
    "personGroupId": "...",
    "personName": "Grandma",
    "linkId": "..."
  }
}
```

### 3. Create Person from Face

**POST** `/api/ai/create-person-from-face`

User creates a new person and assigns a face.

**Request:**
```json
{
  "faceId": "uuid",
  "personName": "Aunt Sarah",
  "displayName": "Sarah",
  "relationship": "Aunt"
}
```

**Response:**
```json
{
  "success": true,
  "person": {
    "id": "...",
    "name": "Aunt Sarah",
    "displayName": "Sarah"
  },
  "assignment": { "faceId": "...", "personGroupId": "..." }
}
```

### 4. Remove Face Assignment

**POST** `/api/ai/remove-face-assignment`

Unlinks a face from a person.

**Request:**
```json
{
  "faceId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "faceId": "...",
  "message": "Face assignment removed successfully"
}
```

### 5. Get Unassigned Faces

**GET** `/api/ai/unassigned-faces`

Retrieves faces needing user assignment.

**Response:**
```json
{
  "success": true,
  "count": 12,
  "faces": [
    {
      "id": "...",
      "asset_id": "...",
      "bounding_box": {...},
      "assets": {
        "storage_url": "...",
        "thumbnail_url": "..."
      }
    }
  ]
}
```

### 6. Reindex All Faces

**POST** `/api/admin/reindex-all-faces`

Batch reprocesses all user photos.

**Response:**
```json
{
  "success": true,
  "processed": 150,
  "facesDetected": 287,
  "autoAssigned": 245,
  "needsUserInput": 42,
  "message": "Processed 150 photos..."
}
```

## Auto-Assignment Logic

### Similarity Thresholds

1. **≥95% Similarity**: Auto-assign to matching person
   - System creates `face_person_links` record automatically
   - `assigned_by = 'system'`
   - `auto_assigned = true`
   
2. **80-94% Similarity**: Prompt user with suggestions
   - Face stored with `needs_assignment = true`
   - Suggestions array includes top matches
   - User confirms or selects different person

3. **<80% Similarity** or **No Matches**: User creates new person
   - Face stored with `needs_assignment = true`
   - No suggestions provided
   - User enters name and creates new `person_group`

### User Match Filtering

Only faces belonging to the current user are considered matches. This prevents cross-user face matching in shared Rekognition collections (not applicable with one collection per user, but included for safety).

## User Workflow

### Initial Photo Upload

1. User uploads photo via Review page
2. System calls `index-face-rekognition`
3. If faces detected:
   - High similarity (≥95%): Auto-assigned silently
   - Medium/low similarity: Modal prompts user
4. User assigns faces to people or creates new people

### Reprocessing Photos

1. User clicks "Rerun AI" on asset
2. Selects "Face Recognition" option
3. System reindexes faces
4. If new unassigned faces: Modal appears

### Person Manager

1. Shows notification: "42 faces awaiting your input"
2. User clicks through each face
3. Assigns to existing person or creates new
4. Can change/remove assignments for already-assigned faces

## Cost Optimization

### AWS Rekognition Pricing (as of 2024)

- **IndexFaces**: $0.001 per image
- **SearchFaces**: $0.001 per search

### Cost Per User (Example: 100 photos, avg 2 faces/photo)

- IndexFaces: 100 images × $0.001 = **$0.10**
- SearchFaces: 200 faces × $0.001 = **$0.20**
- **Total one-time cost**: ~$0.30 per user

### Ongoing Costs

- Only new photos incur costs
- No repeated API calls for existing faces
- Faces persist in collection until explicitly deleted

### Minimization Strategies

1. **No redundant calls**: Faces indexed once and stored
2. **Smart thresholds**: Auto-assignment reduces manual work
3. **Batch processing**: Reindex endpoint processes sequentially
4. **Quality filter**: `QualityFilter: 'AUTO'` excludes poor-quality faces

## Utilities

### `rekognition-collections.js`

Manages Rekognition collections:

- `ensureUserCollection(userId)`: Creates collection if doesn't exist
- `saveCollectionToDb(...)`: Stores collection info in database
- `getCollectionFromDb(userId)`: Retrieves collection info
- `deleteFacesFromCollection(...)`: Removes faces from Rekognition
- `deleteCollection(collectionId)`: Deletes entire collection
- `listCollectionFaces(...)`: Lists faces in collection

### `process-face-matches.js`

Handles face matching logic:

- `processFacesWithMatches(...)`: Main processing function
- `filterUserMatches(...)`: Filters matches to user's faces only
- `storeFaceInDb(...)`: Saves face record
- `getPersonGroupForFaceId(...)`: Looks up person for a face
- `assignFaceToPerson(...)`: Creates face-person link
- `getSuggestedPeople(...)`: Extracts top match suggestions

## Migration from Old System

### What Changed

1. **Removed pgvector**: No local face vector storage
2. **Removed fallback mode**: Single Rekognition-based system
3. **Removed local similarity**: Rekognition SearchFaces handles matching
4. **Simplified schema**: Dropped `face_vector`, `is_fallback`, metadata fields
5. **Auto-matching integrated**: Happens during IndexFaces, not separate step

### Migration Steps

1. Applied `migrate_to_rekognition_collections.sql`
2. Dropped `vector` extension and related functions
3. Deleted all existing face data
4. Kept `person_groups` (user-created people names)
5. Users reindex photos and reassign faces

### For Existing Users

- All photos need reindexing (one-time operation)
- Face assignments reset (user reassigns)
- Person names preserved
- Estimated cost: ~$0.30 per 100 photos

## Troubleshooting

### Collection Not Found

```
ResourceNotFoundException: Collection not found
```

**Solution**: Collection created automatically on first IndexFaces call. Ensure `ensureUserCollection()` is called.

### No Matches Found

```
InvalidParameterException: There are not enough faces in the collection
```

**Solution**: This is expected for the first face in a collection. Code handles this gracefully by continuing with no matches.

### Face Already Indexed

```
InvalidParameterException: Face already exists in collection
```

**Solution**: Rekognition detects duplicate faces. Either delete old face first or use different `ExternalImageId`.

### High AWS Costs

**Check**:
- Are you calling IndexFaces multiple times for the same photo?
- Are you reindexing unnecessarily?
- Consider implementing face detection cache

## Future Enhancements

1. **Face grouping**: Auto-create person groups for similar faces
2. **Face search by photo**: Upload photo to find matches
3. **Celebrity recognition**: Use Rekognition's celebrity detection
4. **Emotion analysis**: Track emotions in family photos
5. **Age progression**: Track family members over time
6. **Smart suggestions**: ML to improve person suggestions

## Security Considerations

1. **One collection per user**: Prevents cross-user face leakage
2. **RLS policies**: Database enforces user ownership
3. **Token validation**: All endpoints validate JWT
4. **Soft deletes**: Face assignments preserved for audit
5. **Collection cleanup**: Delete collections when user deleted

## Performance

- **IndexFaces**: ~1-2 seconds per image
- **SearchFaces**: ~200-300ms per face
- **Batch reindex**: Sequential to avoid rate limits
- **Database queries**: Indexed on `user_id`, `rekognition_face_id`

## Support

For issues or questions:
- Check logs for error details
- Verify AWS credentials and permissions
- Ensure collection exists before indexing
- Test with small batch before full reindex

