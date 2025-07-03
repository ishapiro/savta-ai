import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  css: [
    'primevue/resources/themes/lara-light-purple/theme.css',
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@/assets/css/main.css'
  ],
  build: {
    transpile: ['primevue']
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
    compatibilityDate: '2025-07-01'
  },
  ssr: true,
  experimental: {
    payloadExtraction: false
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag.startsWith('prime-')
    }
  },
  router: {
    options: {
      strict: false
    }
  },
  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    optimizeDeps: {
      include: ['primevue']
    }
  },
  runtimeConfig: {
    public: {
      // @ts-ignore
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      // @ts-ignore
      insidersPassword: process.env.INSIDER_PASSWORD || 'savta2025',
      // @ts-ignore
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      // @ts-ignore
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }
}) 