import { defineNuxtConfig } from 'nuxt/config'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    // '@nuxtjs/supabase'
  ],
  css: [
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@/assets/css/main.css'
  ],
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
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  }
}) 