# Photo Selection AI Prompt Enhancement - People Names & Relationships

## Overview

The photo selection AI prompt has been enhanced to include names of people in photos and their relationships. This allows users to ask for photos by person name when creating memory books with the AI-powered photo selection feature.

## What Changed

### 1. Enhanced Data Fetching (`server/api/ai/magic-memory.post.js`)

**Before:** Only fetched basic asset metadata (title, captions, tags, location, date)

**After:** Now also fetches associated people information:
- Queries the `faces`, `face_person_links`, and `person_groups` tables
- Builds a map of asset IDs to their associated people
- Includes full name, display name, and relationship for each person
- Attaches people data to asset objects before passing to photo selection

```javascript
// Fetch person information for each asset
const { data: assetFaces } = await supabase
  .from('faces')
  .select(`
    asset_id,
    face_person_links!inner (
      person_groups (
        id,
        name,
        display_name,
        relationship
      )
    )
  `)
  .in('asset_id', memoryBook.photo_selection_pool)
  .eq('deleted', false)
```

### 2. Enhanced Asset Data Formatting (`server/utils/openai-client.js`)

**Before:** 
```
- People: Sarah, Michael
```

**After:** 
```
- Identified People: Sarah (Mom), Michael (Dad), Uncle Tom
```

The new format includes:
- **Display Name** (primary identifier)
- **Full Name in Parentheses** (if different from display name)
- **Relationship** (if available) - e.g., "Grandmother", "Uncle", "Friend"

```javascript
// Format people with display name, full name, and relationship
peopleFormatted = asset.people.map(person => {
  const displayName = person.display_name || person.name
  const relationship = person.relationship ? ` (${person.relationship})` : ''
  const fullNameNote = person.display_name && person.display_name !== person.name 
    ? ` (${person.name})` : ''
  return `${displayName}${fullNameNote}${relationship}`
}).join(', ')
```

### 3. Enhanced AI Prompt Instructions

**People Matching is now the #1 Priority** (upgraded from #4):

```
CRITICAL SELECTION PRIORITY (in order of importance):
1. **PEOPLE MATCH**: If the prompt mentions specific people by name, prioritize 
   photos containing those people. Look for exact name matches or relationships 
   mentioned. Examples: "Sarah (Grandmother)", "Michael", "Uncle Tom", etc.
```

**New PEOPLE PRIORITY RULES section:**
- Match both display names AND full names when searching
- Consider relationship context (e.g., "Grandmother" matches photos with that relationship)
- Prioritize primary people first when multiple are mentioned
- Use other family members as fallback if insufficient photos exist for mentioned people

## Usage Examples

### Example 1: By Person Name
**User Prompt:** "I want photos of my Grandmother Sarah"

**AI will look for:**
1. Photos tagged with people named "Sarah" or display name containing "Sarah"
2. Photos with relationship "Grandmother" 
3. Prioritize photos with both the name AND relationship match
4. Fill remaining slots with other family photos if needed

### Example 2: By Relationship
**User Prompt:** "I want photos of the uncles"

**AI will look for:**
1. Photos tagged with people having "Uncle" in the relationship field
2. Select the most visually compelling and cohesive uncle photos

### Example 3: By Full Name
**User Prompt:** "I want photos of Benjamin - we call him Ben"

**AI will look for:**
1. Display name "Ben" - will match the formatted string "Ben (Benjamin)"
2. Full name "Benjamin" - will also match if shown in parentheses
3. Either match will work due to the enhanced format

### Example 4: Mixed Criteria
**User Prompt:** "Chicago memories with family"

**AI will prioritize in this order:**
1. Look for specific family members if names are mentioned
2. Then filter by location: photos from Chicago
3. Then filter by thematic relevance: family moments
4. Select up to the required count (3, 6, 9, etc.)

## Data Format in Prompt

Each photo is now described with this format:

```
Photo 1:
- Title: Family Dinner
- AI Caption: A family gathered around a dining table
- AI Description: [detailed description]
- User Caption: Thanksgiving 2023
- Tags: dinner, holiday, indoor
- User Tags: thanksgiving
- Identified People: Sarah (Mom), Michael (Dad), Ben (Uncle Benjamin)
- Location: Chicago, Illinois
- Date: 11/23/2023
```

## Benefits

1. **More Intuitive Prompts**: Users can now ask for photos by person name
   - "Show me photos with Grandma" 
   - "I want to see pictures of Uncle Tom"
   - "Find photos of Sarah and Michael together"

2. **Better Photo Selection**: AI can understand family relationships
   - Recognizes "Grandmother" means looking for the grandmother relationship tag
   - Understands nicknames vs. full names

3. **Richer Context**: The system uses both face recognition data AND user-provided names
   - Maintains full name, display name, and relationship in one format
   - Handles edge cases where user changed a name or has multiple names for someone

4. **Backward Compatible**: Falls back gracefully
   - If no people data exists, uses `asset.user_people` as fallback
   - Continues to work with location and thematic matching
   - Doesn't break if face recognition failed

## Technical Implementation

### Database Tables Used
- `faces`: Detected faces in photos
- `face_person_links`: Links faces to person groups
- `person_groups`: Named people with display names and relationships

### API Endpoints Involved
1. `/api/ai/magic-memory`: Fetches people data along with assets
2. `/api/utils/openai-client.js`: Formats people data and includes in prompt

### Token Efficiency
- Person information is formatted concisely (e.g., "Name (Full Name) (Relationship)")
- Reduces token overhead while maintaining clarity
- Fits within the 50K token limit for the OpenAI API call

## Testing Recommendations

1. Create test memory books with prompts mentioning:
   - Specific person names: "Create cards for Sarah"
   - Relationships: "Show me Grandmother photos"
   - Mixed: "Chicago visit with Uncle Tom"

2. Verify AI correctly identifies and prioritizes:
   - Photos with mentioned people
   - Photos with mentioned relationships
   - Fallback to thematic matching if insufficient people-tagged photos

3. Check edge cases:
   - People with only display name (no full name)
   - People with only full name (no display name)
   - People with no relationship defined
   - Multiple people in same photo

## Future Enhancements

Potential improvements for future releases:
1. Support for group photos (e.g., "photos with Sarah AND Michael together")
2. Weighted relationship matching (primary people vs. secondary)
3. Machine learning to learn user preferences for specific people
4. Time-based people trends (e.g., "early photos with Grandpa")

