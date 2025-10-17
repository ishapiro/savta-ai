# Technical Specifications - Savta.ai

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Supabase Configuration](#supabase-configuration)
4. [Railway Deployment](#railway-deployment)
5. [DNS & Domain Configuration](#dns--domain-configuration)
6. [Environment Variables](#environment-variables)
7. [Build Configuration](#build-configuration)
8. [Database Schema](#database-schema)
9. [Authentication & Security](#authentication--security)
10. [API Architecture](#api-architecture)
11. [External Services Integration](#external-services-integration)
12. [Performance Optimization](#performance-optimization)
13. [Development Workflow](#development-workflow)
14. [Troubleshooting](#troubleshooting)

---

## Technology Stack

### Frontend
- **Framework**: Nuxt 3 (v3.17.5)
- **UI Framework**: Vue 3.5.17 (Composition API)
- **Styling**: TailwindCSS v6.11.3 with custom brand color system
- **Component Library**: PrimeVue 3.49.1 (manual integration, NOT Nuxt module)
- **Icons**: PrimeIcons v6.0.1, Lucide Vue Next v0.525.0
- **State Management**: Vue Composition API with reactive refs
- **PDF Viewer**: @vue-pdf-viewer/viewer v2.5.6
- **Utilities**: VueUse Core v13.5.0

### Backend
- **Runtime**: Node.js ≥18.0.0
- **Server Framework**: Nuxt Server API (Nitro)
- **Database**: Supabase PostgreSQL with pgvector extension
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage (assets bucket, backups bucket)
- **API Architecture**: RESTful endpoints via Nuxt server routes

### AI & Processing
- **AI Platform**: OpenAI
  - GPT-4/GPT-5 for captions, stories, and content generation
  - DALL-E 3 for custom background image generation
- **Face Recognition**: AWS Rekognition (with fallback mode)
- **Image Processing**: 
  - Sharp v0.33.5 (primary image manipulation)
  - GraphicsMagick via @fatchan/gm v1.3.2
  - smartcrop-gm v2.0.2 (intelligent cropping)
- **PDF Processing**:
  - pdf-lib v1.17.1 (PDF generation)
  - poppler-utils (pdftoppm for PDF to JPG conversion)
  - pdfjs-dist v3.11.174 (client-side PDF rendering)

### External Services
- **Email**: SendGrid (SMTP + webhooks for delivery tracking)
- **Geolocation**: IP-API (free service, no API key required)
- **Location Services**: ZipCodeAPI.com (optional, for distance calculations)
- **Analytics**: Custom analytics system with IP geolocation
- **Deployment**: Railway.com (Nixpacks builder)

### Development Tools
- **Package Manager**: npm
- **TypeScript**: v5.3.3
- **Testing**: Vitest v3.2.4 with @vitest/ui
- **Linting**: ESLint v8.56.0 with Vue and Tailwind plugins
- **Build Tool**: Vite (via Nuxt 3)

---

## Architecture Overview

### System Architecture
See `docs/architecture.mermaid` for complete system architecture diagram.

**Key Architectural Layers:**

1. **Client Layer**
   - Vue 3 pages (landing, auth, protected app pages)
   - Composables for business logic
   - PrimeVue 3 + custom components
   - TailwindCSS styling

2. **Server Layer**
   - Nuxt server API routes organized by feature
   - Memory books API (create, delete, PDF generation)
   - AI processing API (captions, faces, stories)
   - Analytics API (tracking, geolocation)
   - Webhooks (SendGrid email events)

3. **Database Layer**
   - PostgreSQL with pgvector extension
   - Core tables: profiles, assets, memory_books, themes
   - Supporting tables: families, activity_log, email_events, people, face_vectors

4. **External Services**
   - Supabase (database, auth, storage)
   - OpenAI (GPT-4, DALL-E 3)
   - AWS Rekognition (face detection)
   - SendGrid, IP-API, ZipCodeAPI

### Design Patterns

**Soft Delete Pattern** (Critical)
```javascript
// All deletions are soft deletes by default
const { error } = await supabase
  .from('memory_books')
  .update({ 
    deleted: true,
    deleted_at: new Date().toISOString()
  })
  .eq('id', bookId)

// Default queries filter out deleted items
query.eq('deleted', false)
```

**Memory Books Architecture**
- `format` field: `'card'` (wizard UI) or `'book'` (form UI)
- `ui` field: `'wizard'` or `'form'` (tracks creation method)
- `status` field: `'draft'`, `'ready'`, `'background_ready'`, `'approved'`, `'distributed'`, `'template'`

**Authentication Flow**
- Client gets JWT token from Supabase Auth
- Token passed via `Authorization: Bearer ${token}` header
- Server validates token and checks resource ownership
- All mutations require authentication and ownership verification

---

## Supabase Configuration

### Project Setup

**1. Create Supabase Project**
- Go to [supabase.com](https://supabase.com)
- Create new project
- Note your Project URL and API Keys

**2. Database Schema**
```bash
# Run the complete schema
cat supabase/schema.sql | psql "your-connection-string"

# Or use Supabase SQL Editor
# Copy contents of supabase/schema.sql and execute
```

**3. Storage Buckets**

**Assets Bucket** (Public)
```sql
-- Create bucket
CREATE BUCKET assets WITH public = true;

-- Storage policies
CREATE POLICY "Users can upload own assets"
ON storage.objects FOR INSERT TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Backups Bucket** (Private, Admin-only)
```sql
-- Create bucket
CREATE BUCKET backups WITH public = false;

-- Admin-only policies
CREATE POLICY "Admins can manage backups"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'backups' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

**Storage Structure:**
```
assets/
├── {user_id}/
│   ├── memory_book/
│   │   ├── backgrounds/
│   │   │   └── {book_id}_background.png
│   │   └── pdfs/
│   │       └── {book_id}.pdf
│   └── {timestamp}-{filename}
```

**4. Authentication Configuration**

**Email Settings:**
- Go to **Authentication** > **Settings** > **Email**
- Configure email templates (confirmation, reset password)
- Set up SendGrid SMTP (see SendGrid section)

**Auth Providers:**
- Email/Password: ✅ Enabled
- Google OAuth: ✅ Enabled (configure in Google Cloud Console)
- Magic Link: Optional

**Security Settings:**
- JWT expiry: 3600 seconds (1 hour)
- Refresh token expiry: 604800 seconds (7 days)
- Enable email confirmations: ✅ Recommended
- Site URL: `https://savta.ai` (production) or `http://localhost:3000` (development)
- Redirect URLs: Add your domain URLs

**5. Row Level Security (RLS)**

Enable RLS on all tables and create policies:

```sql
-- Example: Memory Books RLS
ALTER TABLE memory_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memory books"
ON memory_books FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own memory books"
ON memory_books FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memory books"
ON memory_books FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Note: Soft delete via API, not direct DELETE
```

**6. Database Extensions**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "vector";     -- pgvector for face vectors
```

**7. Database Indexes**

The schema includes optimized indexes for:
- User lookups (`profiles.user_id`, `profiles.email`)
- Asset queries (`assets.user_id`, `assets.type`, `assets.approved`)
- Memory book queries (`memory_books.user_id`, `memory_books.status`, `memory_books.format`)
- Face detection (`assets.face_detection_processed_at`)
- Analytics (`activity_log.user_id`, `activity_log.session_id`)

### Supabase API Keys

**Three types of keys:**

1. **Anon Key** (`NUXT_PUBLIC_SUPABASE_ANON_KEY`)
   - ✅ Safe for client-side use
   - ✅ Respects Row Level Security
   - ✅ Used in browser/Vue components
   - ❌ Cannot bypass RLS

2. **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`)
   - ❌ NEVER expose in client-side code
   - ✅ Bypasses Row Level Security
   - ✅ Used in server API routes only
   - ✅ Full database access

3. **Project URL** (`NUXT_PUBLIC_SUPABASE_URL`)
   - ✅ Safe for client-side use
   - Format: `https://{project-id}.supabase.co`

### Supabase Client Patterns

**Client-Side (Vue Composables):**
```javascript
// Get Supabase client
const supabase = useNuxtApp().$supabase

// Get current user
const user = useSupabaseUser()  // Returns reactive ref
if (!user.value?.id) return

// Get session token for API calls
const { data: sessionData } = await supabase.auth.getSession()
const accessToken = sessionData.session?.access_token

// Call API with token
const response = await $fetch('/api/memory-books/create', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`
  },
  body: { ... }
})
```

**Server-Side (API Routes):**
```javascript
import { getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // ALWAYS use this pattern in server API routes
  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey || config.public.supabaseKey
  )

  // Validate authentication
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  // Proceed with authenticated request...
})
```

**⚠️ Important: DO NOT use `#supabase/server` or Nuxt module auto-imports in server routes**

---

## Railway Deployment

### Railway Configuration

**Platform**: Railway.com  
**Builder**: Nixpacks (automatic)  
**Runtime**: Node.js ≥18.0.0

### Railway Setup

**1. Create Railway Project**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project (in project directory)
railway link

# Or create new project
railway init
```

**2. Configuration File** (`railway.toml`)

```toml
[build]
builder = "nixpacks"
buildCommand = "apt-get update && apt-get install -y poppler-utils graphicsmagick imagemagick && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[env]
NODE_ENV = "production"
```

**⚠️ Critical Railway Requirements:**

1. **Start Command MUST be `npm start`**
   - ❌ NEVER use `npm run dev` on Railway
   - ✅ ALWAYS use `npm start` (runs `.output/server/index.mjs`)

2. **System Dependencies Required:**
   - `poppler-utils`: PDF to JPG conversion (pdftoppm command)
   - `graphicsmagick`: Image processing and manipulation
   - `imagemagick`: Required by smartcrop-gm for intelligent cropping

3. **Build Command:**
   ```bash
   apt-get update && apt-get install -y poppler-utils graphicsmagick imagemagick && npm run build
   ```

### Environment Variables on Railway

**Required Environment Variables:**

```bash
# Site Configuration
NUXT_PUBLIC_SITE_URL=https://savta.ai
INSIDER_PASSWORD=savta2025

# Supabase
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# AWS Rekognition
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Optional
SENDGRID_WEBHOOK_SECRET=your-webhook-secret
ZIP_CODE_API=your-zipcode-api-key
NUXT_VPV_LICENSE_KEY=your-vue-pdf-viewer-license
```

**Set Environment Variables:**
```bash
# Via CLI
railway variables set NUXT_PUBLIC_SITE_URL=https://savta.ai
railway variables set OPENAI_API_KEY=sk-...

# Via Railway Dashboard
# Go to project > Variables tab > Add variables
```

### Deployment Workflows

**Production Deployment:**
```bash
# Deploy to production
railway up

# Or push to main branch (if connected to GitHub)
git push origin main
```

**Development Mode Deployment** (for debugging):
```bash
# Set development environment
railway variables set NODE_ENV=development
railway variables set NUXT_DEV=true
railway variables set NUXT_DEBUG=true

# Deploy
railway up

# Revert to production
railway variables set NODE_ENV=production
railway variables unset NUXT_DEV
railway variables unset NUXT_DEBUG
```

### Railway Monitoring

**View Logs:**
```bash
# Real-time logs
railway logs

# Last 50 lines
railway logs --lines 50

# Follow logs
watch -n 2 railway logs --lines 20
```

**Check Status:**
```bash
railway status
```

**Redeploy:**
```bash
railway redeploy
```

### Custom Domain on Railway

**1. Add Domain in Railway:**
- Go to Railway Dashboard > Project > Settings
- Click "Custom Domain"
- Add your domain: `savta.ai` or `www.savta.ai`
- Railway will provide DNS records

**2. Configure DNS (see DNS section)**

**3. SSL Certificate:**
- Railway automatically provisions Let's Encrypt SSL
- HTTPS enabled automatically
- Certificate auto-renewal

---

## DNS & Domain Configuration

### Domain Registrar Setup

**Primary Domain**: `savta.ai`

### DNS Records Configuration

**Required DNS Records:**

```
# Root domain to Railway
Type: CNAME
Name: @
Value: {your-project}.up.railway.app
TTL: 3600

# WWW subdomain (optional)
Type: CNAME
Name: www
Value: {your-project}.up.railway.app
TTL: 3600

# Email (if using custom domain with SendGrid)
Type: CNAME
Name: em123
Value: u{your-id}.wl.sendgrid.net
TTL: 3600

Type: TXT
Name: @
Value: "v=spf1 include:sendgrid.net ~all"
TTL: 3600

Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=none; rua=mailto:admin@savta.ai"
TTL: 3600
```

### SendGrid Domain Authentication

**1. SendGrid Dashboard Setup:**
- Go to Settings > Sender Authentication
- Click "Authenticate Your Domain"
- Enter your domain: `savta.ai`
- Choose DNS host provider
- SendGrid generates DNS records

**2. Add DNS Records:**
Copy the provided records to your DNS provider:
- CNAME records (typically 3)
- TXT records for SPF and DKIM

**3. Verify:**
- Wait for DNS propagation (up to 48 hours)
- Click "Verify" in SendGrid dashboard
- Status should show "Verified"

### Google OAuth Domain Configuration

**1. Google Cloud Console:**
- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Navigate to APIs & Services > Credentials
- Select your OAuth 2.0 Client ID

**2. Authorized JavaScript Origins:**
```
https://savta.ai
http://localhost:3000
```

**3. Authorized Redirect URIs:**
```
https://savta.ai/auth/callback
https://{your-project}.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

**4. Update Supabase:**
- Go to Supabase Dashboard > Authentication > Providers
- Click Google
- Enter Client ID and Client Secret
- Set Redirect URL: `https://savta.ai/auth/callback`

### Supabase Custom Domain (Optional)

**To use custom domain with Supabase:**
- Supabase Pro plan required
- Dashboard > Settings > Custom Domain
- Add CNAME: `auth.savta.ai` → `{project}.supabase.co`

### DNS Troubleshooting

**Check DNS Propagation:**
```bash
# Check CNAME records
dig savta.ai CNAME
dig www.savta.ai CNAME

# Check TXT records (SPF, DKIM)
dig savta.ai TXT
dig _dmarc.savta.ai TXT

# Check from different nameservers
dig @8.8.8.8 savta.ai
dig @1.1.1.1 savta.ai
```

**Common Issues:**
- DNS propagation can take up to 48 hours
- Clear DNS cache: `sudo systemd-resolve --flush-caches` (Linux)
- Test with: [dnschecker.org](https://dnschecker.org)
- Verify Railway domain is active: [your-project].up.railway.app

---

## Environment Variables

### Complete Environment Variables List

```bash
# ==========================================
# SITE CONFIGURATION
# ==========================================
NUXT_PUBLIC_SITE_URL=https://savta.ai
# Used for: OAuth redirects, email links, absolute URLs
# Development: http://localhost:3000
# Production: https://savta.ai

INSIDER_PASSWORD=savta2025
# Early access password for beta users

# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# Get from: Supabase Dashboard > Settings > API > Project URL

NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
# Get from: Supabase Dashboard > Settings > API > Project API keys > anon public
# Safe for client-side use, respects RLS

SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
# Get from: Supabase Dashboard > Settings > API > Project API keys > service_role secret
# NEVER expose in client-side code, bypasses RLS

# ==========================================
# OPENAI CONFIGURATION
# ==========================================
OPENAI_API_KEY=sk-proj-...
# Get from: https://platform.openai.com/api-keys
# Used for: GPT-4 captions/stories, DALL-E 3 backgrounds

# ==========================================
# AWS REKOGNITION (Face Recognition)
# ==========================================
AWS_ACCESS_KEY_ID=AKIA...
# AWS IAM user: savta-ai
# Required permission: AmazonRekognitionFullAccess

AWS_SECRET_ACCESS_KEY=...
# AWS secret key for savta-ai IAM user

AWS_REGION=us-east-1
# AWS region for Rekognition service

# ==========================================
# SENDGRID (Email)
# ==========================================
SENDGRID_WEBHOOK_SECRET=your-webhook-secret
# Optional: For verifying SendGrid webhook signatures
# Get from: SendGrid Dashboard > Mail Settings > Event Webhook

# ==========================================
# LOCATION SERVICES (Optional)
# ==========================================
ZIP_CODE_API=your-api-key
# Optional: For accurate distance calculations
# Get from: https://zipcodeapi.com
# Free tier: 1,000 requests/month

# ==========================================
# PDF VIEWER LICENSE (Optional)
# ==========================================
NUXT_VPV_LICENSE_KEY=your-license-key
# Optional: For @vue-pdf-viewer/viewer
# Get from: Vue PDF Viewer license purchase

# ==========================================
# DEPRECATED (No longer used)
# ==========================================
# MAPBOX_TOKEN - Replaced by IP-API (free service)
```

### Environment Variable Usage

**nuxt.config.ts Configuration:**
```typescript
runtimeConfig: {
  // Server-only variables (never sent to client)
  openaiApiKey: process.env.OPENAI_API_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  vpvLicenseKey: process.env.NUXT_VPV_LICENSE_KEY,
  sendgridWebhookSecret: process.env.SENDGRID_WEBHOOK_SECRET,
  
  public: {
    // Client-side accessible variables
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    insidersPassword: process.env.INSIDER_PASSWORD || 'savta2025',
    supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}
```

**Accessing in Code:**
```javascript
// Server-side (API routes)
const config = useRuntimeConfig()
const apiKey = config.openaiApiKey  // Server-only

// Client-side (Vue components)
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl  // Client-accessible
```

---

## Build Configuration

### Nuxt Configuration

**Key Build Settings** (`nuxt.config.ts`):

```typescript
export default defineNuxtConfig({
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    // NOTE: PrimeVue handled manually via plugins/primevue.ts
  ],

  // CSS imports
  css: [
    'primevue/resources/themes/lara-light-purple/theme.css',
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@/assets/css/main.css'
  ],

  // Build transpilation
  build: {
    transpile: ['primevue', '@vue-pdf-viewer/viewer']
  },

  // Nitro server configuration
  nitro: {
    compatibilityDate: '2025-07-01',
    externals: {
      external: ['@supabase/ssr', 'cookie']
    },
    minify: false  // Disabled to avoid CSS custom property issues
  },

  // SSR enabled
  ssr: true,

  // Vite configuration
  vite: {
    optimizeDeps: {
      include: ['primevue']
    },
    ssr: {
      noExternal: ['primevue']
    }
  }
})
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "start": "node .output/server/index.mjs",
    "preview": "nuxt preview",
    "cleanup": "bash scripts/cleanup.sh"
  }
}
```

**Important:**
- **Development**: `npm run dev` (local only)
- **Build**: `npm run build` (generates `.output/` directory)
- **Production**: `npm start` (serves built application)
- **Railway**: MUST use `npm start`, never `npm run dev`

### PrimeVue Manual Integration

**Why Manual Setup:**
- Better control over component registration
- No module conflicts with other Nuxt modules
- Easier debugging
- Direct access to PrimeVue features

**Plugin Setup** (`plugins/primevue.ts`):
```typescript
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
// ... other components

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: true,
    inputStyle: 'filled'
  })
  
  // Register components
  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('Dialog', Dialog)
  // ... other components
})
```

**⚠️ DO NOT install:**
- `@nuxtjs/primevue`
- `primevue/nuxt`
- Any Nuxt PrimeVue modules

### Custom Supabase Plugin

**Why Custom Plugin:**
- Resolves development issues with auto-imports
- More reliable development experience
- Better control over client configuration

**Plugin** (`plugins/custom-supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )
  
  nuxtApp.provide('supabase', supabase)
})
```

---

## Database Schema

See `supabase/schema.sql` for complete schema.

### Core Tables

**profiles**
- User profiles extending Supabase auth.users
- Fields: `user_id`, `email`, `first_name`, `last_name`, `role`, `subscription_type`, `deleted`
- Role: `'user'`, `'editor'`, `'admin'`

**assets**
- User-uploaded photos and text stories
- AI processing: captions, tags, people detection
- Face detection data from AWS Rekognition
- Fields: `user_id`, `type`, `storage_url`, `ai_caption`, `face_detection_data`, `deleted`

**memory_books**
- Memory cards and books
- Fields: `user_id`, `format`, `ui`, `status`, `created_from_assets`, `magic_story`, `pdf_url`, `background_url`, `deleted`
- Format: `'card'` or `'book'`
- UI: `'wizard'` or `'form'`

**themes**
- Predefined card/book themes
- Fields: `name`, `description`, `background_color`, `fonts`, `layout_config`, `card_default`, `card_wizard`

### Supporting Tables

**families** - Family member delivery scheduling  
**activity_log** - Analytics and user behavior tracking  
**email_events** - SendGrid webhook event storage  
**pdf_status** - PDF generation progress tracking  
**people** - Face recognition person database  
**face_vectors** - AWS Rekognition face vectors  
**asset_tags** - Many-to-many asset-tag relationships  

### Database Patterns

**Soft Delete:**
- All tables have `deleted` boolean (default `false`)
- Queries default to `eq('deleted', false)`
- Permanent deletes only for already-deleted items

**UUID Primary Keys:**
- All tables use UUID primary keys
- Generated via `gen_random_uuid()`

**Timestamps:**
- `created_at` - Record creation
- `updated_at` - Last modification
- `deleted_at` - Soft delete timestamp

**Foreign Keys:**
- Explicit foreign key constraints
- Cascade delete for supporting tables
- User-scoped data isolation

---

## Authentication & Security

### Authentication Flow

**1. Client Sign-In:**
```javascript
// Email/Password
const { data, error } = await supabase.auth.signInWithPassword({
  email: user@example.com',
  password: 'password'
})

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${siteUrl}/auth/callback`
  }
})
```

**2. Session Management:**
```javascript
// Get session token
const { data: sessionData } = await supabase.auth.getSession()
const accessToken = sessionData.session?.access_token

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  globalUser.value = session?.user || null
})
```

**3. Server Validation:**
```javascript
// Validate JWT token
const token = authHeader.replace('Bearer ', '')
const { data: { user }, error } = await supabase.auth.getUser(token)
```

### Security Best Practices

**Client-Side:**
- ✅ Use anon key for Supabase client
- ✅ Pass JWT tokens in Authorization header
- ✅ Never store passwords in local storage
- ✅ Use HTTPS in production

**Server-Side:**
- ✅ Use service role key in API routes
- ✅ Validate JWT on every request
- ✅ Check resource ownership before mutations
- ✅ Sanitize user input
- ❌ Never expose service role key

**Database:**
- ✅ Enable Row Level Security (RLS)
- ✅ Create policies for all tables
- ✅ Use parameterized queries
- ✅ Soft delete sensitive data

**Storage:**
- ✅ User-specific folders: `assets/{user_id}/`
- ✅ Validate file types and sizes
- ✅ Check ownership before file operations
- ✅ Use signed URLs for private files

---

## API Architecture

### Server API Routes

**Organization:**
```
server/api/
├── memory-books/          # Memory book CRUD
│   ├── [id].delete.js     # Soft delete
│   ├── [id].post.js       # Create book
│   ├── create-magic-memory.post.js  # Create card
│   └── generate-pdf/[id].post.js    # PDF generation
├── ai/                    # AI processing
│   ├── process-asset.post.js        # Caption/tag generation
│   ├── detect-faces-rekognition.post.js  # Face detection
│   ├── generate-story.post.js       # Story generation
│   └── magic-memory.post.js         # AI card creation
├── analytics/             # Analytics tracking
│   └── track.post.js      # Event tracking + geolocation
├── webhooks/              # External webhooks
│   └── sendgrid.post.js   # Email event tracking
└── compress-image.post.js # Image compression
```

### API Patterns

**Standard API Route Structure:**
```javascript
import { getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // 1. Setup Supabase
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey
    )

    // 2. Validate authentication
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }

    // 3. Get request body
    const body = await readBody(event)
    
    // 4. Validate ownership (if applicable)
    const { data: resource } = await supabase
      .from('resources')
      .select('user_id')
      .eq('id', body.id)
      .single()
    
    if (resource.user_id !== user.id) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    // 5. Perform operation
    const { data, error } = await supabase
      .from('resources')
      .update({ ... })
      .eq('id', body.id)
    
    if (error) throw error

    // 6. Return response
    return { success: true, data }

  } catch (error) {
    console.error('API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
```

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (missing/invalid parameters)
- **401**: Unauthorized (no/invalid token)
- **403**: Forbidden (not owner)
- **404**: Not found
- **500**: Server error

---

## External Services Integration

### OpenAI

**Used For:**
- GPT-4: Image captions, story generation, content analysis
- DALL-E 3: Custom background image generation

**Configuration:**
```javascript
const openai = new OpenAI({
  apiKey: config.openaiApiKey
})

// GPT-4 Vision for image analysis
const response = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "Describe this image..." },
      { type: "image_url", image_url: { url: imageUrl } }
    ]
  }]
})

// DALL-E 3 for background generation
const image = await openai.images.generate({
  model: "dall-e-3",
  prompt: "Create a warm, nostalgic background...",
  size: "1024x1024",
  quality: "standard"
})
```

### AWS Rekognition

**Used For:**
- Face detection in photos
- Face indexing for similarity search
- Person identification

**Configuration:**
```javascript
import { RekognitionClient, DetectFacesCommand, IndexFacesCommand } from '@aws-sdk/client-rekognition'

const client = new RekognitionClient({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  }
})

// Detect faces
const command = new DetectFacesCommand({
  Image: { S3Object: { Bucket: bucket, Name: key } },
  Attributes: ['ALL']
})
const response = await client.send(command)
```

**Fallback Mode:**
- If Rekognition permissions unavailable
- Face detection still works
- Face indexing disabled
- No similarity search

### SendGrid

**Used For:**
- SMTP for Supabase auth emails
- Webhook tracking for email delivery

**SMTP Configuration** (in Supabase):
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: SendGrid API key
- Sender: `noreply@savta.ai`

**Webhook Endpoint:**
```javascript
// server/api/webhooks/sendgrid.post.js
export default defineEventHandler(async (event) => {
  const events = await readBody(event)
  
  for (const evt of events) {
    await supabase.from('email_events').insert({
      event_type: evt.event,
      email: evt.email,
      message_id: evt.sg_message_id,
      timestamp: new Date(evt.timestamp * 1000).toISOString(),
      event_data: evt
    })
  }
  
  return { success: true }
})
```

### IP-API (Geolocation)

**Used For:**
- User location tracking for analytics
- Geographic distribution analysis

**Free Service:**
- No API key required
- No cost
- Reasonable rate limits

**Usage:**
```javascript
const response = await fetch(`http://ip-api.com/json/${ipAddress}`)
const data = await response.json()
// Returns: { country, region, city, ... }
```

### ZipCodeAPI (Optional)

**Used For:**
- Accurate distance calculations
- Location-based photo selection

**Configuration:**
```javascript
const response = await fetch(
  `https://www.zipcodeapi.com/rest/${apiKey}/distance.json/${zip1}/${zip2}/mile`
)
const { distance } = await response.json()
```

---

## Performance Optimization

### Image Optimization

**Compression Pipeline:**
1. Client uploads image
2. Server checks size (> 5MB triggers compression)
3. Compress using Sharp
4. Store compressed version
5. Generate thumbnails

**smartcrop-gm:**
- Intelligent cropping for memory cards
- Focuses on faces and important content
- Requires GraphicsMagick + ImageMagick

### PDF Optimization

**Generation:**
- pdf-lib v1.17.1 for PDF creation
- 300 DPI for print quality
- Convert single-page PDFs to JPG (smaller file size)
- Coordinate system: Bottom-origin (Y=0 at bottom)
- Rotation: Around bottom-left corner (compensated to match CSS center rotation)

**Conversion:**
- poppler-utils `pdftoppm` for PDF → JPG
- High-quality output
- Exact pixel dimensions for print sizes

**Rotation & Positioning:**
- See [`docs/PDF_ROTATION_AND_POSITIONING.md`](./PDF_ROTATION_AND_POSITIONING.md) for details
- Mathematical compensation ensures rotated images match theme editor preview
- Converts between top-origin (CSS) and bottom-origin (PDF) coordinate systems

### Database Optimization

**Indexes:**
- User lookups: `profiles.user_id`
- Asset queries: `assets.user_id`, `assets.type`
- Memory books: `memory_books.user_id`, `memory_books.format`

**Query Patterns:**
- Always filter `deleted = false`
- Limit results to 12-20 per page
- Use `select('*')` only when needed

### Caching

**Client-Side:**
- Thumbnail caching in refs
- Computed properties for memoization
- Session storage for temporary data

**Server-Side:**
- ZipCodeAPI responses (24-hour cache)
- Face detection results
- AI-generated content

---

## Development Workflow

### Local Development

**Setup:**
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your keys

# Run development server
npm run dev

# Access at http://localhost:3000
```

**Database Access:**
```bash
# Using susql alias (see README)
alias susql='psql "postgresql://postgres:PASSWORD@HOST:5432/postgres"'

# Run queries
susql -c "SELECT COUNT(*) FROM memory_books;"

# Run migrations
cat supabase/schema.sql | susql
```

### Testing

**Manual Testing:**
```bash
# Run test scripts
npm run test:recreation

# API endpoint testing
curl -X POST http://localhost:3000/api/test
```

**Vitest:**
```bash
# Run tests
npm test

# Run with UI
npm run test:ui
```

### Debugging

**Development Tools:**
- Vue DevTools (browser extension)
- Nuxt DevTools (built-in)
- Browser console
- Network tab for API calls

**Server Logging:**
```javascript
console.log('🔧 DEBUG:', variable)
console.error('❌ ERROR:', error)
console.log('✅ SUCCESS:', result)
```

### Code Quality

**Linting:**
```bash
# Run linter
npm run lint

# Fix issues
npm run lint:fix
```

**Pre-Commit:**
- Remove debugging logs
- Run linter
- Test authentication flows
- Verify database operations

---

## Troubleshooting

### Common Issues

**Issue: PrimeVue components not found**
- **Solution**: Check `plugins/primevue.ts`, add missing components
- **DON'T**: Install Nuxt PrimeVue modules

**Issue: Supabase auth errors**
- **Solution**: Verify environment variables, check JWT expiry
- **Check**: Token in Authorization header, service role key server-side

**Issue: Railway deployment fails**
- **Solution**: Verify build command includes system dependencies
- **Check**: Start command is `npm start`, not `npm run dev`

**Issue: Images not processing**
- **Solution**: Ensure GraphicsMagick and ImageMagick installed
- **Check**: Railway build command includes both packages

**Issue: PDF generation hangs**
- **Solution**: Check OpenAI API rate limits, timeout settings
- **Check**: Railway logs for error messages

**Issue: Face detection not working**
- **Solution**: Verify AWS credentials and permissions
- **Check**: Fallback mode enabled if Rekognition unavailable

### Debugging Tools

**Railway Logs:**
```bash
railway logs --lines 50
```

**Supabase Logs:**
- Dashboard > Logs
- Filter by error level
- Check auth attempts

**Browser DevTools:**
- Network tab for API calls
- Console for errors
- Application tab for storage

### Getting Help

**Documentation:**
- Nuxt: [nuxt.com/docs](https://nuxt.com/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)

**Project Resources:**
- `docs/architecture.mermaid` - System architecture
- `docs/` - Feature documentation
- `.cursorrules` - Development conventions
- `README.md` - Project overview

---

## Version History

- **v1.0.0** - Initial technical specification
- Created: 2025-01-10
- Last Updated: 2025-01-10

---

**For architectural diagrams and visual representations, see: `docs/architecture.mermaid`**

**For current development tasks, see: `tasks/tasks.md` (if exists)**

**For project status updates, see: `docs/status.md` (if exists)**

