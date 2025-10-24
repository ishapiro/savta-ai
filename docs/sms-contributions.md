# SMS Photo Contributions Feature - Design & Implementation Plan

## Overview

This document outlines the complete design for adding SMS photo contribution capabilities to Savta.ai. Family members can text photos to shared phone numbers, which are automatically added to an unapproved drawer for the account owner to review and approve.

**Use Case**: Grandchildren text photos they think Grandma would like. Parent (account owner) receives photos via SMS, reviews them, and sends approved cards to Grandma monthly.

**Tech Stack**: Twilio SMS/MMS integration, Nuxt API routes, Supabase PostgreSQL, Railway.com hosting

---

## Key Simplifications

This design is **significantly simpler** than initially conceived because it leverages existing Savta.ai infrastructure:

| What We Don't Need | Why |
|-------------------|-----|
| Separate approval routes | Use existing `/api/assets/[id]/approve` workflow |
| Rejection routes | Use existing soft-delete/trash workflows |
| Separate contributors table | Extend `person_groups` instead - one unified system |
| Contributor management composable | Leverage existing `usePersonManagement` |
| Separate SMS drawer endpoint | Query existing assets table with SMS metadata filters |

**Result**: 
- Only 2 API routes needed (1 webhook + 1 receiving number lookup)
- 0 new composables (reuse existing usePersonManagement)
- No new UI screens (extend existing person editor)

---

## People Database Integration Opportunity

The existing `person_groups` table can be leveraged to simplify SMS contributor management:

### Current Structure
- `person_groups`: Represents named family members (Grandma, Dad, etc.)
  - Fields: `name`, `display_name`, `relationship`, `description`, `is_primary_person`
  - Already has association with account owner
  - Used for face recognition and photo attribution

### Proposed Integration

**Option 1: Extend person_groups (RECOMMENDED)**
Add SMS contact info to existing `person_groups` table:
```sql
ALTER TABLE person_groups ADD COLUMN IF NOT EXISTS
  sms_phone_number TEXT UNIQUE,  -- Person's phone number for SMS contributions
  can_contribute_via_sms BOOLEAN DEFAULT false  -- Must be true to accept SMS photos
```

**Benefits**:
- ✅ One "people" system instead of separate contributors table
- ✅ Faces, names, and SMS numbers all linked together
- ✅ Photos from SMS automatically know who sent them
- ✅ Simplify contributor authorization - just add phone to person_group
- ✅ UI: Edit person record to add/remove phone number
- ✅ Can later auto-assign SMS photos to person using SearchFaces on first photo

**Workflow**:
1. Account owner creates/edits person group → adds phone number → enables `can_contribute_via_sms`
2. SMS arrives from that number → looked up in person_groups
3. Photo created with contributor_person_group_id linking it to the person
4. Photo metadata shows sender's name and person relationship

**Alternative: Keep separate (current design)**
- More flexible (one person can SMS from different numbers)
- Less integrated (two separate systems)
- Slightly more code to maintain

---

## 1. Architecture Overview

### Data Flow

```
Contributor (e.g., daughter)
    ↓ (texts photo to shared phone number)
Twilio Receives MMS
    ↓ (webhook callback)
Nuxt API Route: POST /api/webhooks/twilio-sms
    ↓
Lookup: Phone# → Account via account_receiving_numbers
    ↓
Validate: Is sender authorized? Rate limit?
    ↓
Download photo from Twilio
    ↓
Store in Supabase Storage (sms-pending folder)
    ↓
Create asset record with contributor metadata
    ↓
Send SMS reply to contributor
    ↓
Notify account owner (email + dashboard)
    ↓
Account owner reviews & approves/rejects in SMS drawer
    ↓
Approved photos move to regular drawer
```

### System Components

1. **Twilio Webhook Handler** - Receives incoming MMS messages
2. **Receiving Numbers Pool** - Support up to 5 phone numbers per Savta deployment
3. **Authorization Layer** - Whitelist of approved contributors per account
4. **Rate Limiting & Spam Control** - Prevent DOS and abuse
5. **SMS Drawer UI** - Account owner approval interface
6. **Notifications** - Email to owner, SMS to contributor
7. **Contributor Management** - Account owner settings panel

---

## 2. Decision: Nuxt API Routes

**Why Not Supabase Edge Functions?**
- ✅ Simpler monorepo structure - all code in `/server/api/`
- ✅ Single Railway.com deployment - no separate infrastructure
- ✅ Auto-deploys with main app
- ✅ Existing Supabase client setup reusable
- ✅ SMS volume supports this approach
- ✅ Easier debugging alongside existing codebase

**Implementation Path**: Create `/server/api/webhooks/twilio-sms.post.js`

---

## 3. Multiple Phone Numbers Approach

### Problem It Solves

Daughter with 2 accounts (one for her family, one for husband's family) needs to send photos to different recipients without ambiguity.

### Solution

Support up to 5 unique receiving phone numbers across all Savta accounts:
- Phone #1 → Account A (Mom's family)
- Phone #2 → Account B (MIL's family)
- Phone #3 → Account C (Aunt's family)
- etc.

Each account receives on exactly ONE number. Contributors know which number = which recipient.

### Account Owner Setup

```
Settings → "SMS Contributions"
  ├─ Display: "Your receiving number: +1-555-MEMORY-1"
  ├─ Copy to clipboard button
  ├─ QR code for sharing
  └─ Instructions: "Share this number with [recipient name]"
```

### Implementation Details

- Table `account_receiving_numbers`: Maps account → phone number (1:1 relationship)
- When Twilio webhook arrives for phone #1, look up which account uses it
- Route to that account only
- No ambiguity, no routing keywords needed

---

## 4. Database Schema

### New Tables

#### `account_receiving_numbers`

Stores which Twilio phone number each account receives SMS on.

```sql
CREATE TABLE account_receiving_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,  -- E.164 format: +1234567890
  recipient_name TEXT,  -- e.g., "Grandma", "Mom"
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Only one number per account
  UNIQUE(account_id),
  
  -- Phone numbers must be unique (can't assign same number to multiple accounts)
  UNIQUE(phone_number)
);

CREATE INDEX idx_account_receiving_numbers_phone ON account_receiving_numbers(phone_number);
```

---

#### `sms_rate_limits`

Tracks SMS submission rates per contributor phone to prevent spam/DOS.

```sql
CREATE TABLE sms_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,  -- E.164 format
  submission_count INTEGER DEFAULT 0,
  hour_window_start TIMESTAMP,
  blocked_until TIMESTAMP,  -- NULL if not blocked
  block_reason TEXT,  -- 'rate_limit', 'spam', 'manual'
  failed_auth_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(phone_number)
);

CREATE INDEX idx_sms_rate_limits_phone ON sms_rate_limits(phone_number);
CREATE INDEX idx_sms_rate_limits_blocked ON sms_rate_limits(blocked_until) 
  WHERE blocked_until IS NOT NULL;
```

---

### Modified Tables

#### `person_groups` (add SMS contact info)

Extend existing person_groups table to support SMS contributions:

```sql
ALTER TABLE person_groups ADD COLUMN IF NOT EXISTS
  sms_phone_number TEXT UNIQUE,  -- E.164 format, person's phone for SMS contributions

ALTER TABLE person_groups ADD COLUMN IF NOT EXISTS
  can_contribute_via_sms BOOLEAN DEFAULT false;  -- Must have both phone AND this flag enabled

-- Email for future notifications
ALTER TABLE person_groups ADD COLUMN IF NOT EXISTS
  email TEXT;  -- Person's email address for notifications

-- Mailing address fields for printing and shipping cards
ALTER TABLE person_groups ADD COLUMN IF NOT EXISTS
  street_address TEXT;  -- Street address line 1

ALTER TABLE person_groups ADD COLUMN IF NOT EXISTS
  city TEXT;  -- City or town

ALTER TABLE person_groups ADD COLUMN IF NOT EXISTS
  state_province TEXT;  -- State, province, or region

ALTER TABLE person_groups ADD COLUMN IF NOT EXISTS
  postal_code TEXT;  -- ZIP code or postal code

ALTER TABLE person_groups ADD COLUMN IF NOT EXISTS
  country TEXT;  -- Country name or code

-- Create partial index for faster lookup by phone (only active contributors)
CREATE INDEX IF NOT EXISTS idx_person_groups_sms_phone 
  ON person_groups(sms_phone_number) 
  WHERE can_contribute_via_sms = true AND deleted = false;
```

**Authorization Logic**:
- A person can contribute via SMS only if BOTH conditions are met:
  1. `sms_phone_number` is set (not null)
  2. `can_contribute_via_sms = true`
- This allows flexibility: you can have a person in the system (for faces) without enabling SMS contributions
- Or have a phone number stored without enabling contributions yet

**Contact & Mailing Fields** (for future use):
- `email` - For future notifications (approval confirmations, delivery status, etc.)
- `street_address`, `city`, `state_province`, `postal_code`, `country` - Full mailing address for printing and shipping physical cards
- These fields are optional and can be populated gradually as cards are prepared for mailing

**Benefits of this approach**:
- One unified "people" system instead of separate contributors
- SMS photos automatically linked to the person who sent them
- Explicit control: can disable SMS for a person without losing their history
- Can add phone number without immediately enabling contributions
- Complete contact information for both digital and physical delivery
- UI integration: Add phone field + checkbox + email + address to existing person_groups edit form

---

#### `assets` (add SMS metadata columns)

Add SMS-specific metadata to track contribution source and approval status.

```sql
ALTER TABLE assets ADD COLUMN IF NOT EXISTS
  contribution_source TEXT DEFAULT 'app_upload',  -- 'sms' or 'app_upload'

ALTER TABLE assets ADD COLUMN IF NOT EXISTS
  sms_received_at TIMESTAMP,  -- When Twilio received it

ALTER TABLE assets ADD COLUMN IF NOT EXISTS
  contributor_person_group_id UUID REFERENCES person_groups(id) ON DELETE SET NULL,
  -- Link to person_groups record for SMS contributors

-- Create index for fast SMS drawer queries
CREATE INDEX idx_assets_sms_pending 
  ON assets(user_id, contribution_source) 
  WHERE contribution_source = 'sms' AND deleted = false;

-- Create index for filtering by contributor person
CREATE INDEX idx_assets_sms_contributor 
  ON assets(user_id, contributor_person_group_id) 
  WHERE contribution_source = 'sms';
```

---

## 5. API Routes

### Route 1: `POST /api/webhooks/twilio-sms`

**Purpose**: Receive incoming MMS messages from Twilio

**Webhook Source**: Twilio Messaging Services configuration

**Flow**:

```
1. Validate Twilio webhook signature
2. Extract: sender_phone, receiving_phone_number, media_url, message_body
3. Lookup account by receiving_phone_number (account_receiving_numbers table)
4. If no account found → log error, return 400
5. Lookup person_group by sms_phone_number AND can_contribute_via_sms=true
6. If not found → send SMS rejection, increment failed_attempts, return 200
7. Check rate limits (sms_rate_limits table)
8. If rate limited → send SMS rejection, return 200
9. Download image from Twilio
10. Validate file: size < 25MB, type is image
11. Compress if needed
12. Upload to Supabase Storage: /assets/{account_id}/
13. Create asset record with SMS metadata:
    - contribution_source = 'sms'
    - contributor_person_group_id = person_group.id
    - sms_received_at = now()
14. Send SMS success reply to contributor
15. Send email to account owner
16. Return 200
```

**Request** (from Twilio):
```
POST /api/webhooks/twilio-sms
Content-Type: application/x-www-form-urlencoded

From=+1555CCCCCCC
To=+1555MEMORY1
NumMedia=1
MediaUrl0=https://api.twilio.com/...
MessageSid=...
AccountSid=...
... (Twilio fields)
```

**Response**:
```json
{
  "success": true,
  "assetId": "uuid"
}
```

Or error:
```json
{
  "error": "Sender not authorized",
  "code": "UNAUTHORIZED"
}
```

**Security**:
- ✅ Verify Twilio signature (X-Twilio-Signature header)
- ✅ Validate AccountSid matches environment variable
- ✅ Implement rate limiting per sender phone
- ✅ Log all attempts (successful and failed)

---

### Route 2: `GET /api/receiving-numbers`

**Purpose**: Fetch account's configured receiving number

**Protected**: ✅ Requires JWT token

**Response**:
```json
{
  "phoneNumber": "+1-555-MEMORY-1",
  "recipientName": "Grandma",
  "active": true
}
```

---

## Contributor Management (via existing person_groups UI)

**No new API routes needed!** Contributor authorization is now managed through the existing person_groups edit interface:

1. **Add contributor**: Edit person_group → add `sms_phone_number` → set `sms_enabled = true`
2. **Remove contributor**: Edit person_group → clear `sms_phone_number` or set `sms_enabled = false`
3. **View contributors**: List person_groups with `sms_enabled = true`

This integrates SMS contributions directly into the existing "People" management UI, eliminating the need for separate contributor management screens or API routes.

---

## 6. Composables Architecture

### Modify: `useMemoryStudio.js`

Add SMS filtering to existing memory studio composable:

```javascript
export const useMemoryStudio = () => {
  // ... existing code ...
  
  // New: SMS photos awaiting approval
  const smsPhotosAwaitingApproval = computed(() => {
    return memoryBooks.value.filter(book => 
      book.contribution_source === 'sms' && 
      !book.deleted
    )
  })
  
  // New: Count for badge
  const smsPhotosPendingCount = computed(() => {
    return smsPhotosAwaitingApproval.value.length
  })
  
  return {
    // ... existing ...
    smsPhotosAwaitingApproval,
    smsPhotosPendingCount
  }
}
```

---

### Modify: `useDatabase.js`

Add receiving numbers section for SMS setup:

```javascript
export const useDatabase = () => {
  // ... existing code ...
  
  const receivingNumbers = {
    getReceivingNumber: async () => { ... }
  }
  
  return {
    // ... existing ...
    receivingNumbers
  }
}
```

**Note**: Contributor authorization is now managed via existing `usePersonManagement.js` composable by adding `sms_phone_number` field to person_groups.

---

## 7. UI/UX Changes

### Settings Page: "SMS Contributions" Section

**Location**: `pages/app/settings.vue` or new `pages/app/settings/sms-contributions.vue`

**Content**:

```vue
<template>
  <div class="sms-contributions-settings">
    <!-- Your Receiving Number Setup -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">Your Receiving Number</h3>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p class="text-sm text-gray-600 mb-2">Share this number with family members:</p>
        <div class="flex items-center gap-2">
          <code class="text-2xl font-mono font-bold">+1-555-MEMORY-1</code>
          <button @click="copyToClipboard" class="p-2 hover:bg-gray-200 rounded">
            📋 Copy
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">Recipient: Grandma</p>
        <QRCode :value="phoneNumber" class="mt-4 w-32 h-32" />
      </div>
    </section>

    <!-- Manage Contributors via People Editor -->
    <section class="mb-8">
      <h3 class="text-xl font-semibold mb-4">Family Members</h3>
      <p class="text-sm text-gray-600 mb-4">
        To enable SMS contributions from a family member, edit their person record and add their phone number, then enable contributions.
      </p>
      
      <div class="space-y-2">
        <div v-for="person in personGroups" :key="person.id" 
             class="flex items-center justify-between bg-white border rounded p-4">
          <div>
            <p class="font-medium">{{ person.name }}</p>
            <p class="text-sm text-gray-600" v-if="person.sms_phone_number">
              📱 {{ person.sms_phone_number }}
              <span v-if="person.can_contribute_via_sms" class="ml-2 text-green-600">✓ SMS enabled</span>
              <span v-else class="ml-2 text-gray-400">SMS disabled</span>
            </p>
            <p class="text-sm text-gray-400" v-else>
              No SMS number configured
            </p>
          </div>
          <button @click="editPerson(person.id)" class="text-blue-600 hover:text-blue-800">
            ✏️ Edit
          </button>
        </div>
      </div>
    </section>

    <!-- Links to Edit Person Modal (existing component) -->
    <!-- PersonGroupEditor modal handles adding/editing sms_phone_number and can_contribute_via_sms fields -->
  </div>
</template>
```

**Key Points**:
- Receiving number display & QR code for sharing
- Shows list of family members from existing `person_groups`
- Displays phone number + SMS enabled status for each person
- "Edit" button opens existing `PersonGroupEditor` modal
- Phone field + checkbox added to existing person edit form (requires BOTH to enable)
- Email and mailing address fields also available in person editor (for future use)
- No new contributor management UI needed

---

### Memory Studio: SMS Drawer Tab

**Location**: `pages/app/memory-studio.vue` - Add new tab to existing TabView

**Purpose**: Filter assets by `contribution_source = 'sms'` and `approved_by_owner = false` to show SMS photos awaiting approval

**Note**: Uses existing asset approval/trash workflows - no new approval logic needed

**Content**:

```vue
<template>
  <div class="memory-studio">
    <!-- Tabs -->
    <TabView v-model:activeIndex="activeTab">
      <TabPanel header="All Memory Cards">
        <!-- Existing cards view -->
      </TabPanel>
      
      <TabPanel header="Memory Books">
        <!-- Existing books view -->
      </TabPanel>
      
      <!-- NEW: SMS Drawer Tab -->
      <TabPanel header="SMS Drawer">
        <div v-if="smsPhotosPendingCount > 0" class="mb-4 p-4 bg-amber-50 border border-amber-200 rounded">
          <p class="text-amber-900">
            📸 {{ smsPhotosPendingCount }} photo(s) awaiting approval
          </p>
        </div>
        
        <div v-if="smsPhotosAwaitingApproval.length === 0" class="text-center py-12">
          <p class="text-gray-500">No SMS photos yet. Share your number with family!</p>
        </div>
        
        <!-- Grid of SMS photos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="photo in smsPhotosAwaitingApproval" :key="photo.id"
               class="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition">
            
            <!-- Photo thumbnail -->
            <div class="relative bg-gray-100 aspect-square">
              <img :src="photo.url" 
                   :alt="`Photo from ${photo.contributor_name}`"
                   class="w-full h-full object-cover" />
            </div>
            
            <!-- Contributor info -->
            <div class="p-4">
              <p class="font-medium">{{ photo.contributor_name }}</p>
              <p class="text-sm text-gray-600">{{ photo.contributor_phone_number }}</p>
              <p class="text-xs text-gray-500 mt-2">
                Received: {{ formatTime(photo.sms_received_at) }}
              </p>
            </div>
            
            <!-- Actions: Use existing approve/trash workflows -->
            <div class="flex gap-2 p-4 border-t">
              <button @click="approveAsset(photo.id)"
                      class="flex-1 btn-success text-sm">
                ✅ Approve
              </button>
              <button @click="trashAsset(photo.id)"
                      class="flex-1 btn-danger text-sm">
                🗑️ Trash
              </button>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMemoryStudio } from '~/composables/useMemoryStudio'

const { smsPhotosAwaitingApproval, smsPhotosPendingCount, approveAsset, trashAsset } = useMemoryStudio()

const activeTab = ref(0)
</script>
```

**Key Points**:
- SMS photos are just assets with `contribution_source = 'sms'` and `approved_by_owner = false`
- Approve/trash buttons use existing asset workflows (no new logic)
- When approved: `approved_by_owner` is set to true and photo moves to regular drawer
- When trashed: asset is soft-deleted and disappears from SMS drawer

---

## 8. Future Enhancement Opportunities

### Email Notifications (Phase 2+)

The `email` field on `person_groups` enables future features:

**Use Cases**:
- Send approval confirmation when account owner approves a photo contribution
- Send delivery notification when cards are mailed
- Send alerts about new memory books/cards created
- Send monthly digest of family memories
- Allow person to manage their own contribution preferences

### Printed Card Mailing (Phase 3+)

The address fields enable future physical product fulfillment:

**Use Cases**:
- Print and mail physical memory cards to family members
- Track delivery status
- Support international addresses
- Integrate with printing/fulfillment services
- Generate mailing labels
- Export address data for batch mailings

**Address Fields**:
```
street_address    - Full street address (e.g., "123 Main St, Apt 4B")
city              - City or town
state_province    - State, province, or region code
postal_code       - ZIP/postal code
country           - Country name or code
```

**Example Workflow** (Phase 3):
```
1. Account owner creates memory cards from SMS photos
2. Selects recipients to receive printed cards
3. System generates print files (PDF) with proper sizing
4. Exports addresses for fulfillment service
5. Fulfillment service prints and mails cards
6. Account owner tracks delivery status
```

---

## 9. Environment Configuration

### Railway.com Environment Variables

Add these to your Railway project settings:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WEBHOOK_AUTH_TOKEN=your_webhook_secret

# Receiving Phone Numbers (up to 5)
# Format: +1234567890 (E.164 format, must start with +)
TWILIO_PHONE_NUMBER_1=+15559999901
TWILIO_PHONE_NUMBER_2=+15559999902
TWILIO_PHONE_NUMBER_3=+15559999903
TWILIO_PHONE_NUMBER_4=+15559999904
TWILIO_PHONE_NUMBER_5=+15559999905

# Each number can optionally have a display name
TWILIO_PHONE_NAME_1=Grandma
TWILIO_PHONE_NAME_2=MIL
TWILIO_PHONE_NAME_3=Aunt Susan
TWILIO_PHONE_NAME_4=
TWILIO_PHONE_NAME_5=
```

### Local `.env` Setup

For development:

```bash
# .env.local (git ignored)

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_WEBHOOK_AUTH_TOKEN=your_webhook_secret

# Twilio Phone Numbers
TWILIO_PHONE_NUMBER_1=+15559999901
TWILIO_PHONE_NUMBER_2=+15559999902
TWILIO_PHONE_NUMBER_3=+15559999903
TWILIO_PHONE_NUMBER_4=+15559999904
TWILIO_PHONE_NUMBER_5=+15559999905

TWILIO_PHONE_NAME_1=Grandma
TWILIO_PHONE_NAME_2=MIL
TWILIO_PHONE_NAME_3=Aunt Susan
TWILIO_PHONE_NAME_4=
TWILIO_PHONE_NAME_5=
```

### `nuxt.config.ts` Configuration

Add to your Nuxt config:

```typescript
export default defineNuxtConfig({
  // ... existing config ...
  
  runtimeConfig: {
    // Private keys (server-side only)
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioWebhookAuthToken: process.env.TWILIO_WEBHOOK_AUTH_TOKEN,
    twilioPhoneNumbers: [
      process.env.TWILIO_PHONE_NUMBER_1,
      process.env.TWILIO_PHONE_NUMBER_2,
      process.env.TWILIO_PHONE_NUMBER_3,
      process.env.TWILIO_PHONE_NUMBER_4,
      process.env.TWILIO_PHONE_NUMBER_5
    ].filter(Boolean),
    
    public: {
      // Public keys (client + server)
      twilioPhoneNames: [
        process.env.TWILIO_PHONE_NAME_1,
        process.env.TWILIO_PHONE_NAME_2,
        process.env.TWILIO_PHONE_NAME_3,
        process.env.TWILIO_PHONE_NAME_4,
        process.env.TWILIO_PHONE_NAME_5
      ].filter(Boolean)
    }
  }
})
```

---

## 10. Security & Validation

### Twilio Webhook Verification

Every webhook request must verify the signature:

```javascript
// Inside /api/webhooks/twilio-sms.post.js
const verifyTwilioSignature = (event, token) => {
  const signature = getHeader(event, 'x-twilio-signature')
  const url = getRequestURL(event).toString()
  const data = await readBody(event)
  
  // Twilio signature verification
  // (library: twilio)
  const client = twilio(accountSid, authToken)
  return client.request({ url, method: 'POST', data }).signature === signature
}
```

### Input Validation

- ✅ Phone numbers: E.164 format validation
- ✅ Image files: Type (JPEG, PNG), size (< 25MB)
- ✅ JWT token: Valid and not expired
- ✅ Account ownership: User owns receiving number used
- ✅ Contributor authorization: Phone in whitelist

### Rate Limiting

```javascript
// Per-phone-number limits:
const LIMITS = {
  PHOTOS_PER_HOUR: 10,
  PHOTOS_PER_DAY: 50,
  FAILED_AUTH_ATTEMPTS: 3,
  BLOCK_DURATION_MINUTES: 60
}

// Check rate limit:
if (failedAttempts >= 3) {
  blockContributor(phoneNumber, 60) // 1 hour
  return sendSMSError('Try again later')
}
```

### Authentication in Routes

All routes (except webhook) require JWT:

```javascript
export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(...)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }
  
  return user
}
```

---

## 11. SMS Communication

### Success Message (to Contributor)

```
✅ Got your photo! It's waiting for approval.
```

### Authorization Failed (to Contributor)

```
❌ Sorry, this number isn't authorized. 
Please contact the account owner.
```

### Rate Limited (to Contributor)

```
⏸️ Too many photos right now. Please try again later.
```

### File Too Large (to Contributor)

```
📸 Photo is too large. Please try a smaller image.
```

### Error (to Contributor)

```
Something went wrong. Please try again.
```

### Email to Owner

```
Subject: New photo from Sarah - Awaiting approval

Hi [Owner name],

Sarah just sent a photo via SMS. 

Contributor: Sarah
Phone: +1-555-1234
Received: Oct 24, 2:30 PM

Approve or reject in your SMS drawer: [link]

- Savta
```

---

## 12. Deployment Notes

### Railway.com Build Process

No changes needed. Railway already installs required dependencies:

```bash
# Existing build command
apt-get update && apt-get install -y poppler-utils graphicsmagick imagemagick && npm run build
```

Nuxt API routes deploy automatically with the app.

### Twilio Configuration

After deployment to Railway, configure Twilio webhook:

```
Twilio Dashboard → Messaging Services → Your Service
  → Inbound Settings → Request URL
  → Set to: https://your-railway-app.up.railway.app/api/webhooks/twilio-sms
  → HTTP method: POST
  → Save
```

### Testing the Webhook

Use `curl` or Twilio's testing tool:

```bash
curl -X POST https://your-app.railway.app/api/webhooks/twilio-sms \
  -H "X-Twilio-Signature: [signature]" \
  -d "From=%2B1555CCCCCCC&To=%2B1555MEMORY1&NumMedia=1&MediaUrl0=https://..."
```

---

## 13. Implementation Phases

### Phase 1: MVP

**Priority**: Core functionality

- [x] Database schema (2 new tables: account_receiving_numbers, sms_rate_limits)
- [x] Extend person_groups table (add sms_phone_number, can_contribute_via_sms, email, and mailing address fields)
- [x] Extend assets table (add contribution_source, sms_received_at, contributor_person_group_id)
- [x] Twilio webhook route (`POST /api/webhooks/twilio-sms`)
- [x] Rate limiting (10/hour, 50/day)
- [x] Email notifications to owner
- [x] SMS replies to contributor
- [x] SMS drawer UI tab (filters existing assets)
- [x] Settings page: receiving number setup
- [x] Settings page: person management integration
- [x] Environment setup for 5 phone numbers

**Leverages Existing Code**:
- ✅ Existing asset approval workflow (no new routes)
- ✅ Existing asset trash/soft-delete (no new routes)
- ✅ Existing person_groups management UI
- ✅ Existing asset model and storage
- ✅ Existing email notification system
- ✅ Existing usePersonManagement composable

**Testing**:
- [x] Webhook verification (Twilio signature)
- [x] Photo download & compression
- [x] Person authorization checking (via can_contribute_via_sms flag)
- [x] Rate limit enforcement
- [x] Email delivery
- [x] SMS replies
- [x] SMS drawer filtering
- [x] Approve/trash workflows
- [x] Person <→ SMS photo linking

---

### Phase 2: Enhancement

**Priority**: Better UX and scalability

- [ ] Auto-link SMS photos to detected faces using SearchFaces
- [ ] QR code generation for settings page
- [ ] SMS confirmation to contributor on approval
- [ ] Bulk approve/reject in SMS drawer
- [ ] Enhanced analytics dashboard
- [ ] Blocked numbers management UI
- [ ] Contributor activity log

---

### Phase 3: Advanced

**Priority**: Advanced features

- [ ] PIN-based authorization (security)
- [ ] Contributor self-service verification
- [ ] Web form submission (non-SMS fallback)
- [ ] Photo auto-categorization by contributor
- [ ] SMS scheduling (send at specific times)

---

## 14. File Structure

New and modified files:

```
savta-ai/
├── server/api/
│   └── webhooks/
│       └── twilio-sms.post.js          [NEW] Twilio webhook handler
├── composables/
│   ├── useMemoryStudio.js              [MODIFY] Add SMS drawer filtering computed
│   ├── useDatabase.js                  [MODIFY] Add receiving-numbers section
│   └── usePersonManagement.js          [MODIFY] SMS field in person editor (if needed)
├── pages/app/
│   ├── memory-studio.vue               [MODIFY] Add SMS drawer tab
│   └── settings.vue                    [MODIFY] Add SMS contributions section
├── supabase/
│   └── schema.sql                      [MODIFY] Add SMS tables + person_groups + asset columns
├── docs/
│   └── sms-contributions.md            [THIS FILE]
└── nuxt.config.ts                      [MODIFY] Add Twilio runtime config
```

**Total New Files**: 1 (Twilio webhook route)
**Total Modified Files**: 7 (2 composables, 2 pages, 1 schema, 1 config, 1 docs)
**Leverage Existing Code**: Person management, asset approval/trash, email notifications

**Why so simple?**
- SMS contributors are just `person_groups` with phone numbers
- No separate contributor database tables
- No new approval routes (reuse existing asset workflows)
- Settings UI extends existing person editor

---

## 15. Key Assumptions & Constraints

| Assumption | Impact | Solution |
|-----------|--------|----------|
| One number per account | Simple design, no routing logic | Owner chooses receiving number per account |
| Contributor can't use 2+ numbers | Limits multi-account scenario | Document: "Use different numbers for different accounts" |
| MMS files < 25MB | Simplifies processing | Validate, compress if needed |
| Photos always need approval | Guarantees owner review | Default: all SMS photos = pending |
| Contributors not tech-savvy | Simple SMS interface | No complicated PIN/keywords in Phase 1 |
| Twilio reliability | Webhook delivery | Implement retry logic, logging |

---

## 16. Success Criteria

**Phase 1 MVP Complete When**:

- ✅ Daughter can text photo to shared number
- ✅ Photo appears in owner's SMS drawer within 5 seconds
- ✅ Owner receives email notification
- ✅ Owner can approve/reject photo with one click
- ✅ Approved photo appears in regular drawer
- ✅ Owner can add/revoke contributors in settings
- ✅ Rate limiting prevents spam (10/hour)
- ✅ Unauthorized senders get rejected SMS
- ✅ No crashes or errors in production logs

---

## 17. Monitoring & Debugging

### Key Metrics to Track

```