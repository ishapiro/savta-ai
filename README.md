# Savta AI

A family memory sharing platform that uses AI to help organize, caption, and create beautiful memory books from family photos and stories.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🎨 UI Framework

### PrimeVue Setup
This project uses a **manual PrimeVue integration** via `plugins/primevue.ts`. 

**Important Notes:**
- ✅ PrimeVue is configured manually (not via Nuxt modules)
- ❌ Do NOT install `@nuxtjs/primevue` or `primevue/nuxt` modules
- ❌ Do NOT add PrimeVue modules to `nuxt.config.ts`
- ✅ All components are registered in `plugins/primevue.ts`

**If you see PrimeVue component errors:**
1. Check `plugins/primevue.ts` for missing component registrations
2. Ensure the plugin is loading correctly
3. Do NOT attempt to install Nuxt PrimeVue modules

## 🛠️ Development

## Features & Tech Stack
- ✨ Animated splash (landing) page with email subscription and insiders access
- 🏠 Authenticated app dashboard for memory management
- 📸 **Asset Upload**: Photo and text story upload with AI processing
- 🔍 **Review System**: Approve/reject assets with AI-generated captions
- 📚 **Memory Books**: AI-powered memory book generation with custom backgrounds
- 🎨 **AI Backgrounds**: DALL-E 3 generated backgrounds based on asset themes
- 📄 **PDF Generation**: Professional PDF creation with arranged assets
- 🔄 **Regeneration**: Create new memory books with fresh AI backgrounds
- 🎨 PrimeVue 3 components styled with Tailwind CSS and custom color system
- 🔒 Supabase authentication and comprehensive database
- 🚀 Ready for Vercel deployment

**Tech Stack:**
- **Framework:** Nuxt 3
- **UI Components:** PrimeVue 3
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **AI Processing:** OpenAI (GPT-4 Vision, DALL-E 3)
- **PDF Generation:** PDF-lib
- **Deployment:** Vercel

## Project Structure
```
savta-ai/
├── app.vue                 # Main application shell
├── assets/css/main.css     # Custom and Tailwind-based styles
├── layouts/
│   ├── default.vue         # Main app layout (header, footer, content)
│   └── landing-page.vue    # Splash/landing page layout
├── pages/
│   ├── index.vue           # Splash/landing page (public)
│   ├── app/                # App pages (protected)
│   │   ├── dashboard.vue   # Main dashboard
│   │   ├── upload.vue      # Asset upload page
│   │   ├── review.vue      # Asset review and approval
│   │   ├── memory-books.vue # Memory book management
│   │   ├── editor.vue      # Content editor (admin/editor only)
│   │   ├── admin.vue       # Admin panel (admin only)
│   │   ├── login.vue       # Authentication
│   │   └── signup.vue      # Registration
├── server/api/             # Backend API endpoints
│   ├── ai/process-asset.post.js # AI processing for assets
│   └── memory-books/       # Memory book generation APIs
├── plugins/primevue.js     # PrimeVue setup and global config
├── public/                 # Static assets (images, logo, etc.)
├── supabase/schema.sql     # DB schema for users, assets, memory books
├── nuxt.config.ts          # Nuxt and module configuration
├── tailwind.config.js      # Tailwind CSS and color system
├── vercel.json             # Vercel deployment config
└── README.md               # This file
```

## Application Flow: Splash Page vs. App
- **Splash Page (`/`)**: The public landing page (`pages/index.vue`) uses the `landing-page` layout. It features animated backgrounds, a newsletter signup form (email stored in Supabase), and an "Insiders" button for password-protected access.
- **App (`/app`)**: After successful insiders access or login, users are routed to the main app dashboard (`pages/app/dashboard.vue`), which uses the `default` layout (header, footer, breadcrumbs, etc.). All authenticated/protected content is under `/app`.

## Routing Structure & Middleware

### App Routes
The application uses a nested routing structure where all authenticated pages are under `/app`:

- `/app/dashboard` - Main dashboard (home page for authenticated users)
- `/app/upload` - File upload page with AI processing
- `/app/review` - Asset review and approval page  
- `/app/memory-books` - Memory books management and generation
- `/app/login` - Authentication page
- `/app/signup` - Registration page
- `/app/editor` - Content editor (admin/editor only)
- `/app/admin` - Admin panel (admin only)

### Routing Changes
Originally, the app had a parent route at `pages/app.vue` that nested child routes underneath it. This caused issues where child pages would render below the dashboard content instead of replacing it entirely.

**Solution**: Restructured the routing by:
1. **Moving dashboard content** from `pages/app.vue` to `pages/app/dashboard.vue`
2. **Removing the parent route** `pages/app.vue` entirely
3. **Making all app pages standalone** - each page now replaces the entire content area
4. **Updating navigation** to point to `/app/dashboard` instead of `/app`

### Middleware Updates
The authentication middleware (`middleware/auth.js`) was updated to handle the new routing structure:

- **Redirects to dashboard**: Authenticated users accessing auth pages are redirected to `/app/dashboard`
- **Auth protection**: All `/app/*` routes require authentication (except login/signup)
- **Role-based access**: Editor and admin pages have additional middleware for role verification

### Navigation Updates
The main layout (`layouts/default.vue`) navigation was updated to:
- Point the "Home" button to `/app/dashboard`
- Maintain all existing app navigation links
- Keep mobile navigation working with the new structure

This ensures a clean separation between the dashboard and individual app pages, with each page having full control over its content area.

## Memory Book Features

### AI-Powered Memory Book Generation
The platform features a comprehensive memory book system that creates beautiful, personalized memory books from approved assets:

#### **Two-Step Generation Process**
1. **Background Generation**: Uses DALL-E 3 to create custom backgrounds based on asset tags
2. **PDF Generation**: Creates professional PDFs with arranged assets and AI backgrounds

#### **Key Features**
- **AI Backgrounds**: Custom DALL-E 3 generated backgrounds themed to asset content
- **Asset Arrangement**: Professional 2x2 grid layout with captions
- **Real-time Progress**: Detailed status updates during generation
- **Regeneration**: Create new memory books with fresh AI backgrounds
- **Download System**: Direct PDF download with proper file naming

#### **Generation Flow**
1. User uploads photos/text → AI processes with captions and tags
2. User reviews and approves assets → Assets marked for memory books
3. User creates memory book → AI generates custom background
4. System creates PDF → User downloads beautiful memory book

### Asset Management
- **Upload System**: Drag & drop photo uploads and text story creation
- **AI Processing**: Automatic caption generation, tagging, and people detection
- **Review Workflow**: Approve/reject assets with editing capabilities
- **Organization**: Assets organized by type, status, and approval state

## PrimeVue, Tailwind, and Customization
- **PrimeVue 3.x**: The app uses PrimeVue 3.x for stability and comprehensive component library. This version provides excellent TypeScript support, modern Vue 3 composition API integration, and a mature ecosystem.
- **Dual Styling Approach**: PrimeVue 3.x offers both Tailwind CSS overrides and built-in themes, giving maximum flexibility for styling:
  - **Tailwind Integration**: Direct Tailwind class application to PrimeVue components
  - **PrimeVue Themes**: Built-in themes like `lara-light-purple` with CSS custom properties
- **Plugin Architecture**: PrimeVue is configured via `plugins/primevue.ts` which:
  - Registers components globally for both client and server-side rendering
  - Configures PrimeVue with ripple effects and filled input style
  - Sets up services (Toast, Confirmation) for app-wide notifications
  - Ensures consistent component availability across the entire application
- **Theme System**: The app uses the `lara-light-purple` theme which defines CSS variables for primary, surface, and text colors.
- **Tailwind Integration**: In `tailwind.config.js`, custom color names (like `primary`, `surface`) are mapped to these CSS variables. This allows you to use Tailwind classes (e.g., `bg-primary`, `text-surface`) that always match the PrimeVue theme.
- **Custom Styles**: Additional component and utility styles are defined in `assets/css/main.css`.
- **Animations**: Custom animations (e.g., `fade-in-up`, `glow`, `pulse-slow`) are defined in `tailwind.config.js` and used throughout the UI.

## Supabase Database & Auth

### Custom Supabase Plugin
This project uses a **custom Supabase plugin** instead of the official Nuxt Supabase module to resolve development issues.

**Why Custom Plugin:**
- ✅ Resolves `Ctrl+C` and `npm run dev` issues with auto-imports
- ✅ More reliable development experience
- ✅ Better control over Supabase client configuration
- ❌ Do NOT install `@nuxtjs/supabase` module
- ❌ Do NOT add Supabase modules to `nuxt.config.ts`

**Implementation:**
- **Plugin**: `plugins/custom-supabase.ts` - Creates and provides Supabase client
- **Composable**: `composables/useSupabase.js` - Provides reactive user state
- **Database**: `composables/useDatabase.js` - Centralized database operations

**If you see Supabase errors:**
1. Check `plugins/custom-supabase.ts` for client configuration
2. Ensure environment variables are set correctly
3. Do NOT attempt to install Nuxt Supabase modules

### Database Features
- **Email Subscriptions**: The `supabase/schema.sql` defines a table `email_subscriptions` for storing newsletter signups from the splash page.
- **User Management**: Comprehensive user system with roles (user, editor, admin)
- **Asset Storage**: Photos and text stories with AI processing metadata
- **Memory Books**: Complete memory book system with background and PDF storage
- **Auth**: The app uses Supabase authentication for user sign up, login, and session management. Auth state is managed via the custom plugin and composables.
- **Usage**: All `/app` routes are protected by middleware and require authentication or insiders access.

## Supabase Setup

### Environment Variables
Set up your environment variables in a `.env` file:

```bash
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Site Configuration
NUXT_PUBLIC_SITE_URL=http://localhost:3000
INSIDER_PASSWORD=savta2025
```

### Database Schema
1. Run the database schema:
   ```bash
   # First, run the reset script to clean up any existing tables
   # Copy and paste the contents of supabase/reset.sql into your Supabase SQL Editor
   
   # Then run the main schema
   # Copy and paste the contents of supabase/schema.sql into your Supabase SQL Editor
   ```

### Storage Bucket Setup
The app uses Supabase Storage for file uploads. You need to create the storage bucket and policies:

1. **Create the Storage Bucket:**
   - Go to your Supabase Dashboard
   - Navigate to **Storage** in the left sidebar
   - Click **"Create a new bucket"**
   - Name: `assets`
   - Check **"Public bucket"** (so files can be accessed publicly)
   - Click **"Create bucket"**

2. **Set up Storage Policies:**
   - In the Storage section, click on your `assets` bucket
   - Go to the **Policies** tab
   - Click **"New Policy"**
   - Use the **Policy Editor** with these settings:

   **Upload Policy:**
   - Policy Name: `Users can upload assets`
   - Allowed operation: INSERT
   - Target roles: authenticated
   - Using expression: `bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]`

   **View Policy:**
   - Policy Name: `Users can view own assets`
   - Allowed operation: SELECT
   - Target roles: authenticated
   - Using expression: `bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]`

   **Update Policy:**
   - Policy Name: `Users can update own assets`
   - Allowed operation: UPDATE
   - Target roles: authenticated
   - Using expression: `bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]`

   **Delete Policy:**
   - Policy Name: `Users can delete own assets`
   - Allowed operation: DELETE
   - Target roles: authenticated
   - Using expression: `bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]`

### Storage Bucket Structure
The app uses a single `assets` bucket with a hierarchical folder structure to organize different types of files:

```
assets/
├── {user_id}/                    # User-specific folders
│   ├── memory_book/              # Memory book files
│   │   ├── backgrounds/          # AI-generated background images
│   │   │   └── {book_id}.png    # Background for specific memory book
│   │   └── pdfs/                # Generated PDF files
│   │       └── {book_id}.pdf    # PDF for specific memory book
│   └── {timestamp}-{filename}   # User uploaded assets (photos, text)
│       ├── 1234567890-photo.jpg
│       ├── 1234567891-story.txt
│       └── ...
└── {user_id_2}/
    ├── memory_book/
    │   └── ...
    └── ...
```

**File Types:**
- **User Assets**: Photos and text stories uploaded by users
- **Background Images**: AI-generated backgrounds for memory books (PNG format)
- **PDF Files**: Generated memory book PDFs (PDF format)

**Security:**
- Each user can only access files in their own folder (`{user_id}/`)
- Memory book files are organized in subdirectories for easy management
- All files are stored in the public `assets` bucket for easy access

## Environment Variables
Create a `.env` file in the project root with the following variables:
```
# Public site URL
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase project credentials
NUXT_PUBLIC_SUPABASE_URL=your-supabase-url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI API key for AI processing
OPENAI_API_KEY=your-openai-api-key

# (Optional) Insiders password for splash page access
INSIDER_PASSWORD=your-secret-password
```

## Getting Started
### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (for AI features)

### Installation & Development
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd savta-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file as described above.
4. Set up your Supabase database and storage as described in the Supabase Setup section.
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Troubleshooting
If you encounter issues after stopping the dev server with Ctrl+C, especially import errors like `useSupabaseSession`, use the cleanup script:

```bash
npm run cleanup
```

This comprehensive cleanup script will:
- Remove all cache directories (`.nuxt`, `.output`, etc.)
- Kill all development processes
- Clear npm cache and temporary files
- Install dependencies to ensure everything works properly
- Provide a fresh development environment

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run cleanup` - Comprehensive cleanup and dependency reinstall
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Deployment

The project is configured for Vercel deployment with the `vercel.json` configuration file. Simply connect your repository to Vercel and deploy.

- `vercel deploy --prod --force`

This will do a complete rebuild and redeploy the the app.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.