# Savta AI

A family memory sharing platform that uses AI to help organize, caption, and create beautiful memory books from family photos and stories.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## ✨ Features

- **AI-Powered Memory Books**: Generate beautiful memory books with custom DALL-E 3 backgrounds
- **Location-Based Photo Selection**: Intelligent 6-tier location hierarchy with ZipCodeAPI.com integration
- **Smart Asset Management**: Upload photos and text stories with AI captioning and tagging
- **Review System**: Approve/reject assets with AI-generated captions
- **PDF Generation**: Professional PDF creation with arranged assets
- **Email Analytics**: Track email delivery and engagement via SendGrid webhooks
- **Responsive Design**: Modern UI with PrimeVue 3 and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Nuxt 3
- **UI Components**: PrimeVue 3
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Processing**: OpenAI (GPT-5, DALL-E 3)
- **Email**: SendGrid SMTP + Webhooks
- **PDF Generation**: PDF-lib
- **Deployment**: Railway.com

## 📁 Project Structure

```
savta-ai/
├── app.vue                 # Main application shell
├── assets/css/main.css     # Custom styles
├── layouts/
│   ├── default.vue         # Main app layout
│   └── landing-page.vue    # Splash page layout
├── pages/
│   ├── index.vue           # Public splash page
│   └── app/                # Protected app pages
│       ├── dashboard.vue   # Main dashboard
│       ├── upload.vue      # Asset upload
│       ├── review.vue      # Asset review
│       ├── memory-books/   # Memory book management
│       ├── login.vue       # Authentication
│       └── signup.vue      # Registration
├── server/api/             # Backend API endpoints
│   ├── ai/                 # AI processing endpoints
│   ├── memory-books/       # Memory book generation
│   └── webhooks/           # SendGrid webhooks
├── composables/            # Vue composables
├── plugins/                # Nuxt plugins
├── supabase/               # Database schema
├── tests/                  # Test files and scripts
│   ├── *.sql              # Database test queries
│   ├── *.js               # JavaScript test files
│   └── README.md          # Test documentation
├── docs/                   # Detailed documentation
│   ├── *.md               # Feature and setup documentation
│   └── README.md          # Documentation index
└── public/                 # Static assets
```

## 🔧 Setup & Configuration

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key
- SendGrid account (optional, for email analytics)

### Environment Variables

Create a `.env` file in the project root:

```bash
# Site Configuration
NUXT_PUBLIC_SITE_URL=http://localhost:3000
INSIDER_PASSWORD=savta2025

# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# SendGrid Configuration (optional)
SENDGRID_WEBHOOK_SECRET=your_sendgrid_webhook_secret

# ZipCodeAPI Configuration (optional, for location-based photo selection)
ZIP_CODE_API=your_zipcode_api_key

# Note: MapBox token is no longer required - geolocation now uses IP-API (free service)

### Installation

1. **Clone and install**:
   ```bash
   git clone <your-repo-url>
   cd savta-ai
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run the database schema (see Supabase Setup section)
   - Configure storage bucket and policies

3. **Configure SendGrid** (optional):
   - Set up SMTP for Supabase authentication emails
   - Configure webhooks for email analytics

4. **Start development**:
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

### Schema Installation

Run the database schema in your Supabase SQL Editor:

```bash
# Copy and paste the contents of supabase/schema.sql
```

### Storage Configuration

1. **Create Storage Bucket**:
   - Name: `assets`
   - Public bucket: ✅ Enabled

2. **Storage Policies**:
   ```sql
   -- Upload Policy
   CREATE POLICY "Users can upload assets" ON storage.objects
   FOR INSERT TO authenticated
   USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- View Policy
   CREATE POLICY "Users can view own assets" ON storage.objects
   FOR SELECT TO authenticated
   USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Update Policy
   CREATE POLICY "Users can update own assets" ON storage.objects
   FOR UPDATE TO authenticated
   USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Delete Policy
   CREATE POLICY "Users can delete own assets" ON storage.objects
   FOR DELETE TO authenticated
   USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### Storage Structure

```
assets/
├── {user_id}/                    # User-specific folders
│   ├── memory_book/              # Memory book files
│   │   ├── backgrounds/          # AI-generated backgrounds
│   │   └── pdfs/                # Generated PDFs
│   └── {timestamp}-{filename}   # User uploaded assets
```

## 🗺️ Location-Based Photo Selection

Our sophisticated location-based photo selection system is a key differentiator that provides intelligent, location-aware photo selection for memory books.

### How It Works

The system uses a 6-tier location matching hierarchy:

1. **EXACT CITY MATCH** (100 points) - Matches exact city names
2. **WITHIN 100 MILES (API)** (80 points) - Uses ZipCodeAPI.com for accurate distances
3. **WITHIN 100 MILES (APPROX)** (80-distance/10) - Fallback to zip code approximation
4. **STATE MATCH** (60 points) - Photos from same state
5. **COUNTRY MATCH** (40 points) - Photos from same country
6. **THEMATIC FALLBACK** (10 points) - Theme-based selection

### Setup

1. **Get ZipCodeAPI Key** (optional):
   - Sign up at [ZipCodeAPI.com](https://zipcodeapi.com/)
   - Get your free API key (1,000 requests/month)
   - Add to `.env`: `ZIP_CODE_API=your_api_key`

2. **Features**:
   - **Intelligent Caching**: 24-hour cache reduces API calls by 90%
   - **Robust Fallback**: System never fails, always returns results
   - **Professional Accuracy**: Real geographic distances vs approximations
   - **Cost Effective**: Free tier sufficient for most use cases

### Example Usage

Users can create memory books with location-specific prompts:
- "Chicago Vacation" → Photos from Chicago and nearby areas
- "Miami Beach Trip" → Photos from Miami and Florida
- "California Adventure" → Photos from California cities

For detailed documentation, see [Location-Based Photo Selection](docs/LOCATION_BASED_PHOTO_SELECTION.md).

## 📧 SendGrid Email Configuration

### SMTP Setup for Supabase Auth

1. **Get SendGrid API Key**:
   - Go to SendGrid Dashboard → Settings → API Keys
   - Create new API key with Mail Send permissions

2. **Configure Supabase SMTP**:
   - Go to Supabase Dashboard → Authentication → Settings → SMTP Settings
   - Enable SMTP with these settings:
     - **Host**: `smtp.sendgrid.net`
     - **Port**: `587`
     - **Username**: `apikey`
     - **Password**: Your SendGrid API key
     - **Sender**: `noreply@savta.ai`

3. **Domain Authentication** (Recommended):
   - SendGrid Dashboard → Settings → Sender Authentication
   - Authenticate your domain for better deliverability

### Email Analytics Webhook

The app includes webhook tracking for email events:

#### Webhook Endpoint
- **URL**: `https://your-domain.com/api/webhooks/sendgrid`
- **Method**: POST

#### Database Schema
```sql
CREATE TABLE email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'delivered', 'bounced', 'opened', 'clicked'
  email text NOT NULL,
  user_id uuid,
  message_id text,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()),
  sendgrid_event_id text,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
```

#### Webhook Configuration

1. **In SendGrid Dashboard**:
   - Settings → Mail Settings → Event Webhook
   - Enable Event Webhook
   - URL: `https://your-domain.com/api/webhooks/sendgrid`
   - Events: `delivered`, `opened`, `clicked`, `bounced`, `dropped`

2. **Optional: Signed Webhooks**:
   - Enable Signed Webhooks in SendGrid
   - Add `SENDGRID_WEBHOOK_SECRET` to environment variables

#### Email Analytics Usage

```javascript
// In Vue components
const { getUserEmailStats, getUserEmailEvents } = useEmailEvents()

// Get user's email statistics
const stats = await getUserEmailStats()

// Get recent email events
const events = await getUserEmailEvents(10)
```

#### Database Queries

```sql
-- Check total events
SELECT COUNT(*) as total_events FROM email_events;

-- View recent events
SELECT event_type, email, user_id, created_at 
FROM email_events 
ORDER BY created_at DESC 
LIMIT 10;

-- Group events by type
SELECT event_type, COUNT(*) as count 
FROM email_events 
GROUP BY event_type 
ORDER BY count DESC;
```

## 📊 Analytics & User Tracking

### User Analytics System

The application includes a comprehensive analytics system that tracks user behavior and engagement:

#### **Features:**
- **Page Views**: Track which pages users visit
- **Session Duration**: Monitor how long users stay on the site
- **Geographic Distribution**: See where your users are located globally
- **Device & Browser Analytics**: Understand user technology preferences
- **Engagement Metrics**: Scroll depth, time on page, interaction rates
- **Marketing Attribution**: UTM parameters, referrer tracking

#### **Geolocation Service**

**Current Implementation:**
- **Service**: IP-API (free service)
- **Data Collected**: Country, region, city
- **Privacy**: IP addresses are hashed for privacy protection
- **No API Key Required**: Completely free service

**Geographic Data Collection:**
```javascript
// Example of collected data
{
  country: "United States",
  region: "California", 
  city: "San Francisco"
}
```

**Privacy Protection:**
- IP addresses are hashed before storage
- No raw IP addresses are stored in the database
- Private IP ranges (localhost, internal networks) are excluded
- Compliant with privacy regulations

#### **Analytics Dashboard**

Access the analytics dashboard at `/app/analytics-dashboard` (admin only):

- **Overview Metrics**: Unique users, page views, session duration, engagement score
- **Geographic Distribution**: Top countries and regions by visit count
- **Page Performance**: Engagement scores for each page
- **Technical Analytics**: Device types, browsers, screen resolutions
- **Marketing Analytics**: Referrers, UTM sources, campaign tracking

#### **Database Schema**

```sql
-- Activity tracking table
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL, -- 'page_visit', 'session_start', etc.
  session_id text,
  page_path text,
  ip_hash text, -- Hashed IP address for privacy
  country text,
  region text,
  city text,
  device_type text,
  browser text,
  session_duration integer,
  exit_page boolean DEFAULT false,
  details jsonb, -- Additional tracking data
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
```

#### **Analytics API Endpoints**

- **`POST /api/analytics/track`**: Track user activity and geolocation
- **`GET /api/admin/analytics-dashboard`**: Get analytics data (admin only)

#### **Usage Examples**

```javascript
// Track page visit with geolocation
await $fetch('/api/analytics/track', {
  method: 'POST',
  body: {
    events: [{
      action: 'page_visit',
      page_path: '/app/dashboard',
      timestamp: new Date().toISOString()
    }]
  }
})

// Get analytics data (admin only)
const analytics = await $fetch('/api/admin/analytics-dashboard?timeRange=30d')
```

#### **Migration from MapBox**

**Previous Implementation:**
- Used MapBox geocoding API for IP geolocation
- Required API key and had usage limits
- Was not designed for IP geolocation

**Current Implementation:**
- ✅ Uses IP-API (free service, no API key required)
- ✅ Specifically designed for IP geolocation
- ✅ More accurate geographic data
- ✅ No usage limits for reasonable traffic
- ✅ Reduced costs (no MapBox subscription needed)

**You can safely cancel your MapBox subscription!** 🎉

## 🎨 UI Framework Configuration

### PrimeVue Setup

This project uses **manual PrimeVue integration** via `plugins/primevue.ts`.

**Important Notes:**
- ✅ PrimeVue configured manually (not via Nuxt modules)
- ❌ Do NOT install `@nuxtjs/primevue` or `primevue/nuxt`
- ❌ Do NOT add PrimeVue modules to `nuxt.config.ts`

**If you see PrimeVue errors:**
1. Check `plugins/primevue.ts` for missing component registrations
2. Ensure the plugin is loading correctly
3. Do NOT attempt to install Nuxt PrimeVue modules

### Styling System

- **PrimeVue Theme**: `lara-light-purple` with CSS custom properties
- **Tailwind Integration**: Custom colors mapped to PrimeVue theme variables
- **Custom Styles**: Additional styles in `assets/css/main.css`
- **Animations**: Custom animations defined in `tailwind.config.js`

## 🔒 Authentication & Database

### Custom Supabase Plugin

This project uses a **custom Supabase plugin** instead of the official Nuxt module.

**Why Custom Plugin:**
- ✅ Resolves development issues with auto-imports
- ✅ More reliable development experience
- ✅ Better control over client configuration

**Implementation:**
- **Plugin**: `plugins/custom-supabase.ts` - Creates Supabase client
- **Composable**: `composables/useSupabase.js` - Reactive user state
- **Database**: `composables/useDatabase.js` - Database operations

### Server API Pattern

**Important:** In all server API endpoints, use this pattern:

```js
const config = useRuntimeConfig()
const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(
  config.public.supabaseUrl,
  config.supabaseServiceRoleKey || config.public.supabaseKey
)
```

**Do NOT use** `#supabase/server` or Nuxt module auto-imports.

## 🛠️ Development Tools

### Test Files

All test files are organized in the `tests/` directory:

- **SQL Tests**: Database queries and schema tests
- **JavaScript Tests**: API and functionality tests
- **Documentation**: See `tests/README.md` for detailed usage

### Documentation

Detailed documentation is available in the `docs/` directory:

- **Setup Guides**: Environment setup, PrimeVue configuration
- **Feature Documentation**: Memory books, location features, image processing
- **Database Guides**: Schema updates, migration instructions
- **Troubleshooting**: Common issues and solutions

### Database Access with susql

The project uses a `susql` alias to run PostgreSQL commands against the Supabase database. This provides a convenient way to execute SQL commands and migrations.

#### Creating the susql Alias

1. **Get your Supabase database credentials**:
   - Go to your Supabase Dashboard → Settings → Database
   - Copy the **Host**, **Database name**, **Port**, **User**, and **Password**

2. **Add the alias to your shell profile**:
   
   **For macOS/Linux (zsh/bash)**:
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   alias susql='psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"'
   ```
   
   **For Windows (PowerShell)**:
   ```powershell
   # Add to your PowerShell profile
   Set-Alias -Name susql -Value "psql `"postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres`""
   ```

3. **Replace the placeholders**:
   - `[YOUR-PASSWORD]`: Your Supabase database password
   - `[YOUR-HOST]`: Your Supabase database host (e.g., `db.abcdefghijklmnop.supabase.co`)

4. **Reload your shell profile**:
   ```bash
   # For zsh
   source ~/.zshrc
   
   # For bash
   source ~/.bashrc
   
   # For PowerShell
   . $PROFILE
   ```

5. **Test the alias**:
   ```bash
   susql -c "SELECT version();"
   ```

#### Usage Examples

```bash
# Execute a single command
susql -c "SELECT COUNT(*) FROM email_events;"

# Run a migration script
cat supabase/schema.sql | susql

# Run test queries
cat tests/test_sendgrid_events.sql | susql

# Connect to database interactively
susql

# Run multiple commands from a file
susql < migration_script.sql

# Check table structure
susql -c "\d email_events"

# List all tables
susql -c "\dt"
```

#### Security Notes

- **Keep credentials secure**: Never commit your database credentials to version control
- **Use environment variables**: Consider using environment variables for the connection string
- **Limit access**: Only use the service role key for server-side operations

#### Alternative: Using Environment Variables

For better security, you can use environment variables:

```bash
# Add to your shell profile
alias susql='psql "postgresql://postgres:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:5432/postgres"'

# Set environment variables
export SUPABASE_DB_PASSWORD="your-password"
export SUPABASE_DB_HOST="db.abcdefghijklmnop.supabase.co"
```

### Development Troubleshooting

If you encounter issues after stopping the dev server:

```bash
npm run cleanup
```

This script will:
- Remove cache directories
- Kill development processes
- Clear npm cache
- Reinstall dependencies

## 🚀 Deployment

### Railway.com Deployment

**Build Command:**
```bash
apt-get update && apt-get install -y poppler-utils && npm run build
```

**Configuration:**
- **Builder**: Nixpacks
- **Runtime**: Node.js
- **Dependencies**: `poppler-utils` for PDF processing

### Why poppler-utils?

The `poppler-utils` package is required for **PDF to JPG conversion** functionality in the memory book generation system. Specifically:

#### **Modules that use poppler:**

1. **`server/api/pdf-to-jpg.post.js`** - Main PDF conversion endpoint
   - Uses `pdftoppm` command-line tool from poppler-utils
   - Converts single-page PDFs to high-quality JPG images
   - Supports multiple print sizes (7x5, 8x10, 11x14, 12x12, A4)
   - Generates images at 300 DPI for print quality

2. **`server/api/memory-books/generate-pdf/[id].post.js`** - Memory book generation
   - Calls the PDF-to-JPG conversion endpoint
   - Converts single-page memory book PDFs to JPG format
   - Reduces file size while maintaining print quality
   - Only converts single-page PDFs (multi-page PDFs remain as PDF)

#### **What poppler-utils provides:**
- **`pdftoppm`**: Converts PDF pages to image formats (JPG, PNG)
- **High-quality conversion**: Maintains 300 DPI resolution for print
- **Precise dimensions**: Generates exact pixel dimensions for different print sizes
- **System-level performance**: Faster than JavaScript-based PDF processing

#### **Alternative approaches considered:**
- **JavaScript PDF libraries**: Slower and less reliable for high-quality conversion
- **Cloud services**: Would add external dependencies and costs
- **Other tools**: poppler-utils is the industry standard for PDF processing

## 📚 Application Flow

### Routing Structure

- **Splash Page (`/`)**: Public landing page with newsletter signup
- **App (`/app/*`)**: Protected authenticated pages
  - `/app/dashboard` - Main dashboard
  - `/app/upload` - Asset upload
  - `/app/review` - Asset review
  - `/app/memory-books` - Memory book management
  - `/app/login` - Authentication
  - `/app/signup` - Registration

### Memory Book Generation

1. **Upload Assets**: Photos and text stories with AI processing
2. **Review & Approve**: Approve assets with AI-generated captions
3. **Generate Background**: DALL-E 3 creates custom backgrounds
4. **Create PDF**: Professional PDF with arranged assets
5. **Download**: Direct download with proper file naming

### Asset Management

- **AI Processing**: Automatic caption generation, tagging, people detection
- **Review Workflow**: Approve/reject with editing capabilities
- **Organization**: Assets organized by type, status, and approval state

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run cleanup` - Clean development environment
- `npm run preview` - Preview production build

## 📖 Additional Resources

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **SendGrid Documentation**: [sendgrid.com/docs](https://sendgrid.com/docs)
- **PrimeVue Documentation**: [primevue.org](https://primevue.org)
- **Nuxt 3 Documentation**: [nuxt.com/docs](https://nuxt.com/docs)