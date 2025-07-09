# Savta AI

A family memory sharing platform that uses AI to help organize and caption family photos and stories.

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
- 🏠 Authenticated app dashboard for newsletter management
- 🎨 PrimeVue 3 components styled with Tailwind CSS and custom color system
- 🔒 Supabase authentication and email subscription database
- 🚀 Ready for Vercel deployment

**Tech Stack:**
- **Framework:** Nuxt 3
- **UI Components:** PrimeVue 3
- **Styling:** Tailwind CSS
- **Database:** Supabase
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
│   ├── app.vue             # App dashboard (protected)
│   └── app/                # Auth pages (login, signup)
├── plugins/primevue.js     # PrimeVue setup and global config
├── public/                 # Static assets (images, logo, etc.)
├── supabase/schema.sql     # DB schema for email subscriptions
├── nuxt.config.ts          # Nuxt and module configuration
├── tailwind.config.js      # Tailwind CSS and color system
├── vercel.json             # Vercel deployment config
└── README.md               # This file
```

## Application Flow: Splash Page vs. App
- **Splash Page (`/`)**: The public landing page (`pages/index.vue`) uses the `landing-page` layout. It features animated backgrounds, a newsletter signup form (email stored in Supabase), and an "Insiders" button for password-protected access.
- **App (`/app`)**: After successful insiders access or login, users are routed to the main app dashboard (`pages/app.vue`), which uses the `default` layout (header, footer, breadcrumbs, etc.). All authenticated/protected content is under `/app`.

## Routing Structure & Middleware

### App Routes
The application uses a nested routing structure where all authenticated pages are under `/app`:

- `/app/dashboard` - Main dashboard (home page for authenticated users)
- `/app/upload` - File upload page
- `/app/review` - Asset review page  
- `/app/memory-books` - Memory books management
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
- **Email Subscriptions**: The `supabase/schema.sql` defines a table `email_subscriptions` for storing newsletter signups from the splash page.
- **Auth**: The app uses Supabase authentication for user sign up, login, and session management. Auth state is persisted and auto-refreshed via Nuxt module config.
- **Usage**: All `/app` routes are protected by middleware and require authentication or insiders access.

## Supabase Setup

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

## Environment Variables
Create a `.env` file in the project root with the following variables:
```
# Public site URL
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase project credentials
NUXT_PUBLIC_SUPABASE_URL=your-supabase-url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# (Optional) Insiders password for splash page access
INSIDER_PASSWORD=your-secret-password
```

## Getting Started
### Prerequisites
- Node.js 18+
- npm or yarn

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
If you encounter issues after stopping the dev server with Ctrl+C, especially import errors like `useSupabaseSession`, use these cleanup scripts:

```bash
# Quick cleanup (recommended for most issues)
npm run cleanup

# Clean and restart dev server
npm run dev:clean

# Complete reset (for severe cache corruption)
npm run dev:reset
```

**Common Issues:**
- **`useSupabaseSession` import error**: This occurs when the Nuxt Supabase module cache gets corrupted after abrupt termination. Use `npm run cleanup` to fix.
- **Port already in use**: The cleanup script automatically kills processes on ports 3000 and 3001.
- **Module cache issues**: The comprehensive cleanup clears all Nuxt, Vite, and Node.js caches.

### Useful Scripts
```bash
npm run dev        # Start local dev server
npm run dev:clean  # Clean cache and start dev server
npm run dev:reset  # Complete reset (cleanup + npm install + dev)
npm run cleanup    # Comprehensive cache cleanup
npm run build      # Build for production
npm run preview    # Preview production build
npm run generate   # Generate static site
```

## Vercel Deployment
- **Automatic**: Push your repo to GitHub and connect to Vercel. Vercel auto-detects Nuxt and builds/deploys your app.
- **Manual**:
  ```bash
  npm run build
  vercel
  ```
- **Config**: `vercel.json` sets the build, dev, and output directory. Environment variables should be set in the Vercel dashboard for production.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License
MIT License