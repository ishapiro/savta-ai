import { defineNuxtConfig } from 'nuxt/config'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-primevue',
    // '@nuxtjs/supabase'
  ],
  css: [
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@/assets/css/main.css'
  ],
  primevue: {
    cssLayerOrder: 'tailwind-base, primevue, tailwind-utilities',
    options: { unstyled: true, ripple: true },
    components: {
      include: ['Button', 'InputText']
    }
  },
  // supabase: {
  //   clientOptions: {
  //     auth: {
  //       persistSession: true,
  //       autoRefreshToken: true,
  //       detectSessionInUrl: true
  //     }
  //   }
  // },
  nitro: {
    compatibilityDate: '2025-07-01'
  },
  ssr: true,
  experimental: {
    payloadExtraction: false
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('prime-')
    }
  },
  router: {
    options: {
      strict: false
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  }
}) 