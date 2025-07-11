import { defineNuxtPlugin } from '#app'
import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'
import type { NuxtApp } from 'nuxt/dist/app/nuxt'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  const supabase = createClient(supabaseUrl, supabaseKey)

  nuxtApp.provide('supabase', supabase)
})