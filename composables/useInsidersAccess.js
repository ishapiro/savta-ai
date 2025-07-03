export const useInsidersAccess = () => {
  const hasInsidersAccess = computed(() => {
    if (process.client) {
      try {
        return sessionStorage.getItem('insiders-access') === 'true'
      } catch (error) {
        console.error('Error checking insiders access:', error)
        return false
      }
    }
    return false
  })

  const setInsidersAccess = () => {
    if (process.client) {
      try {
        sessionStorage.setItem('insiders-access', 'true')
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
        console.log('Insiders access cleared')
      } catch (error) {
        console.error('Error clearing insiders access:', error)
      }
    }
  }

  return {
    hasInsidersAccess,
    setInsidersAccess,
    clearInsidersAccess
  }
} 