import { ref } from 'vue'

let globalUser = ref(null)
let authListenerInitialized = false

export function useSupabaseUser() {
  if (!authListenerInitialized) {
    try {
    const supabase = useNuxtApp().$supabase
      
      // Get initial user
      const getUser = async () => {
        try {
    const { data } = await supabase.auth.getUser()
          console.log('Getting user:', data.user?.email)
          globalUser.value = data.user
        } catch (error) {
          console.error('Error getting user:', error)
          globalUser.value = null
        }
      }
      
      const handleAuthChange = (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        globalUser.value = session?.user || null
      }
      
      // Initialize immediately
      getUser()
      
      // Set up auth listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)
      
      authListenerInitialized = true
    } catch (error) {
      console.error('Error initializing auth listener:', error)
      authListenerInitialized = true // Prevent infinite retries
    }
  }
  
  return globalUser
  }