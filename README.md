# Savta AI - Coming Soon

A beautiful "Coming Soon" page built with Nuxt 3, PrimeVue 3, and Tailwind CSS.

## Features

- 🎨 Beautiful animated "Coming Soon" page
- 🚀 Built with Nuxt 3 for optimal performance
- 🎯 PrimeVue 3 components with Tailwind CSS styling
- 📱 Fully responsive design
- ✨ Smooth animations and transitions
- 🔧 Ready for Vercel deployment

## Tech Stack

- **Framework**: Nuxt 3
- **UI Components**: PrimeVue 3
- **Styling**: Tailwind CSS
- **Database**: Supabase (configured but not used in this version)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd savta-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional for this version):
```bash
# .env
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the Nuxt framework
4. Deploy!

### Manual Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
vercel
```

## Project Structure

```
savta-ai/
├── app.vue                 # Main application component
├── assets/                 # Static assets and CSS
│   └── css/
│       └── main.css        # Main stylesheet
├── components/             # Vue components (empty for now)
├── layouts/                # Page layouts (empty for now)
├── pages/                  # Application pages (empty for now)
├── plugins/                # Nuxt plugins (empty for now)
├── public/                 # Public static files
├── nuxt.config.ts          # Nuxt configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json            # Dependencies and scripts
├── vercel.json            # Vercel deployment configuration
└── README.md              # This file
```

## Customization

### Colors and Theme

The main colors and theme can be customized in:
- `tailwind.config.js` - Animation and color extensions
- `assets/css/main.css` - Custom CSS classes and base styles

### Animations

Custom animations are defined in `tailwind.config.js`:
- `fade-in-up` - Fade in from bottom
- `fade-in-down` - Fade in from top
- `float` - Floating animation
- `glow` - Glowing effect
- `pulse-slow` - Slow pulsing

### Content

Edit the content in `app.vue`:
- Brand name and tagline
- Features preview
- Social media links
- Newsletter signup functionality

## Environment Variables

For production, you may want to set these environment variables in Vercel:

- `NUXT_PUBLIC_SITE_URL` - Your production domain

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request 