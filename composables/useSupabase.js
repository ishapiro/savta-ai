import { ref } from 'vue'

export const globalUser = ref(null)
let authListenerInitialized = false

export function useSupabaseUser() {
  if (!authListenerInitialized) {
    const supabase = useNuxtApp().$supabase

    // Get initial session (more robust than getUser)
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        globalUser.value = data.session?.user || null
        console.log('Initial session user:', globalUser.value?.email)
      } catch (error) {
        console.error('Error getting session:', error)
        globalUser.value = null
      }
    }

    const handleAuthChange = (event, session) => {
      if (event === 'SIGNED_OUT') {
        globalUser.value = null
      } else {
        globalUser.value = session?.user || null
      }
      console.log('Auth state change:', event, session?.user?.email)
    }

    getSession()
    supabase.auth.onAuthStateChange(handleAuthChange)
    authListenerInitialized = true
  }

  return globalUser
}