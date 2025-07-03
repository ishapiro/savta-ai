# Savta AI

A modern AI-powered family newsletter app built with Nuxt 3, PrimeVue, Tailwind CSS, and Supabase.

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

## PrimeVue, Tailwind, and Customization
- **PrimeVue** is initialized in `plugins/primevue.js` with styled mode (`unstyled: false`) and PassThrough (`pt`) config to apply Tailwind classes to PrimeVue components.
- **Theme**: The app uses the `lara-light-purple` theme, which defines CSS variables for primary, surface, and text colors.
- **Tailwind Integration**: In `tailwind.config.js`, custom color names (like `primary`, `surface`) are mapped to these CSS variables. This allows you to use Tailwind classes (e.g., `bg-primary`, `text-primary`) that always match the PrimeVue theme.
- **Custom Styles**: Additional component and utility styles are defined in `assets/css/main.css`.
- **Animations**: Custom animations (e.g., `fade-in-up`, `glow`, `pulse-slow`) are defined in `tailwind.config.js` and used throughout the UI.

## Supabase Database & Auth
- **Email Subscriptions**: The `supabase/schema.sql` defines a table `email_subscriptions` for storing newsletter signups from the splash page.
- **Auth**: The app uses Supabase authentication for user sign up, login, and session management. Auth state is persisted and auto-refreshed via Nuxt module config.
- **Usage**: All `/app` routes are protected by middleware and require authentication or insiders access.

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
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Useful Scripts
```bash
npm run dev        # Start local dev server
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