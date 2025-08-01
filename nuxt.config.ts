import { defineNuxtConfig } from 'nuxt/config'

// Add build timestamp for cache busting
const buildTimestamp = new Date().toISOString()

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    // '@nuxtjs/supabase'
    // NOTE: PrimeVue is handled manually via plugins/primevue.ts
    // DO NOT add primevue/nuxt or @nuxtjs/primevue modules here
  ],

  css: [
    'primevue/resources/themes/lara-light-purple/theme.css',
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@/assets/css/main.css'
  ],
  build: {
    transpile: ['primevue', '@vue-pdf-viewer/viewer']
  },
  // @ts-ignore
  supabase: {
    // @ts-ignore
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    // @ts-ignore
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    redirect: false,
    clientOptions: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  },
  nitro: {
    compatibilityDate: '2025-07-01',
    externals: {
      external: ['@supabase/ssr', 'cookie']
    },
    minify: {
      css: {
        // Disable CSS minification to avoid issues with CSS custom properties
        enabled: false
      }
    }
  },
  ssr: true,
  experimental: {
    payloadExtraction: false,
    componentIslands: false,
    asyncContext: true
  },

  router: {
    options: {
      strict: false
    }
  },
  postcss: {
    plugins: {
      'postcss-import': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    optimizeDeps: {
      include: ['primevue']
    },
    ssr: {
      noExternal: ['primevue']
    },
    css: {
      postcss: {
        plugins: [
          require('autoprefixer'),
          require('tailwindcss'),
          require('postcss-import')
        ]
      }
    }
  },
  runtimeConfig: {
    // Server-side environment variables
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    vpvLicenseKey: process.env.NUXT_VPV_LICENSE_KEY,
    mapboxToken: process.env.MAPBOX_TOKEN,
    
    public: {
      // @ts-ignore
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      // @ts-ignore
      insidersPassword: process.env.INSIDER_PASSWORD || 'savta2025',
      // @ts-ignore
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      // @ts-ignore
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      buildTimestamp
    }
  }
}) 