declare global {
  const defineNuxtPlugin: typeof import('#app')['defineNuxtPlugin']
  const definePageMeta: typeof import('#app')['definePageMeta']
  const useSupabaseClient: typeof import('#supabase/client')['useSupabaseClient']
  const useSupabaseUser: typeof import('#supabase/client')['useSupabaseUser']
  const navigateTo: typeof import('#app')['navigateTo']
  const watchEffect: typeof import('vue')['watchEffect']
  const computed: typeof import('vue')['computed']
  const ref: typeof import('vue')['ref']
  const process: {
    client: boolean
  }
}

export {} 