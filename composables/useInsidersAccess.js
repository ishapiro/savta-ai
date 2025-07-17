export const useInsidersAccess = () => {
  // Create a reactive ref for insiders access state
  const insidersAccessState = ref(false)
  
  // Function to check and update the state
  const checkInsidersAccess = () => {
    if (process.client) {
      try {
        insidersAccessState.value = ((sessionStorage.getItem('insiders-access') || '').toLowerCase() === 'true'.toLowerCase())
      } catch (error) {
        console.error('Error checking insiders access:', error)
        insidersAccessState.value = false
      }
    } else {
      insidersAccessState.value = false
    }
  }
  
  // Initialize the state
  checkInsidersAccess()
  
  // Create a computed that returns the current state
  const hasInsidersAccess = computed(() => insidersAccessState.value)

  const setInsidersAccess = () => {
    if (process.client) {
      try {
        sessionStorage.setItem('insiders-access', 'true')
        insidersAccessState.value = true
        console.log('Insiders access granted')
      } catch (error) {
        console.error('Error setting insiders access:', error)
      }
    }
  }

  const clearInsidersAccess = () => {
    if (process.client) {
      try {
        sessionStorage.removeItem('insiders-access')
        insidersAccessState.value = false
        console.log('Insiders access cleared')
      } catch (error) {
        console.error('Error clearing insiders access:', error)
      }
    }
  }

  return {
    hasInsidersAccess,
    setInsidersAccess,
    clearInsidersAccess,
    checkInsidersAccess
  }
} 