// Shared database operations for Savta.ai memory book features
// This library centralizes all database logic to avoid repetition

export const useDatabase = () => {
  const supabase = useNuxtApp().$supabase
  const user = useSupabaseUser()

  // Helper function to get current user's profile
  const getCurrentProfile = async () => {
    if (!user.value) return null
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.value.id)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      
      // If profile doesn't exist, try to create one
      if (error.code === 'PGRST116') {
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              user_id: user.value.id,
              email: user.value.email
            }])
            .select()
            .single()
          
          if (createError) {
            console.error('Error creating profile:', createError)
            return null
          }
          
          return newProfile
        } catch (createError) {
          console.error('Error creating profile:', createError)
          return null
        }
      }
      
      return null
    }
    
    return data
  }

  // Helper function to log activity
  const logActivity = async (action, details = {}) => {
    if (!user.value) return
    
    const { error } = await supabase
      .from('activity_log')
      .insert([{
        user_id: user.value.id,
        action,
        details
      }])
    
    if (error) {
      console.error('Error logging activity:', error)
    }
  }

  // Profile operations
  const profileOperations = {
    // Get user profile
    getProfile: async () => {
      return await getCurrentProfile()
    },

    // Update profile
    updateProfile: async (updates) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('profile_updated', { updates })
      return data
    },

    // Create profile (for confirm.vue)
    createProfile: async (profileData) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          user_id: user.value.id,
          email: user.value.email,
          ...profileData
        }])
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('profile_created', profileData)
      return data
    }
  }

  // Family operations
  const familyOperations = {
    // Get user's families
    getFamilies: async () => {
      if (!user.value) return []
      
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('user_id', user.value.id)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching families:', error)
        return []
      }
      
      return data || []
    },

    // Create family
    createFamily: async (familyData) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('families')
        .insert([{
          user_id: user.value.id,
          ...familyData
        }])
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('family_created', familyData)
      return data
    },

    // Update family
    updateFamily: async (familyId, updates) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('families')
        .update(updates)
        .eq('id', familyId)
        .eq('user_id', user.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('family_updated', { familyId, updates })
      return data
    },

    // Soft delete family
    deleteFamily: async (familyId) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { error } = await supabase
        .from('families')
        .update({ deleted: true })
        .eq('id', familyId)
        .eq('user_id', user.value.id)
      
      if (error) throw error
      
      await logActivity('family_deleted', { familyId })
    }
  }

  // Memory preferences operations
  const preferencesOperations = {
    // Get user's memory preferences
    getPreferences: async () => {
      if (!user.value) return null
      
      const { data, error } = await supabase
        .from('memory_preferences')
        .select('*')
        .eq('user_id', user.value.id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error)
        return null
      }
      
      return data
    },

    // Create or update preferences
    upsertPreferences: async (preferences) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('memory_preferences')
        .upsert({
          user_id: user.value.id,
          ...preferences
        })
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('preferences_updated', preferences)
      return data
    }
  }

  // Asset operations
  const assetOperations = {
    // Get user's assets
    getAssets: async (filters = {}) => {
      if (!user.value) return []
      
      let query = supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.value.id)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
      
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      
      if (filters.approved !== undefined) {
        query = query.eq('approved', filters.approved)
      }
      
      if (filters.ai_processed !== undefined) {
        query = query.eq('ai_processed', filters.ai_processed)
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching assets:', error)
        return []
      }
      
      return data || []
    },

    // Upload asset
    uploadAsset: async (assetData, file = null) => {
      if (!user.value) throw new Error('User not authenticated')
      
      let storageUrl = null
      
      // Upload file to Supabase Storage if provided
      if (file) {
        // Use user-specific folder structure for organization
        const fileName = `${user.value.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(fileName, file)
        
        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          throw uploadError
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('assets')
          .getPublicUrl(fileName)
        
        storageUrl = urlData.publicUrl
      }
      
      // Create asset record
      const assetRecord = {
        user_id: user.value.id,
        storage_url: storageUrl,
        ...assetData
      }
      
      const { data, error } = await supabase
        .from('assets')
        .insert([assetRecord])
        .select()
        .single()
      
      if (error) {
        console.error('Database insert error:', error)
        throw error
      }
      
      await logActivity('asset_uploaded', { 
        assetId: data.id, 
        type: assetData.type,
        hasFile: !!file 
      })
      
      return data
    },

    // Update asset
    updateAsset: async (assetId, updates) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', assetId)
        .eq('user_id', user.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('asset_updated', { assetId, updates })
      return data
    },

    // Approve/reject asset
    approveAsset: async (assetId, approved) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('assets')
        .update({ approved })
        .eq('id', assetId)
        .eq('user_id', user.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('asset_approved', { assetId, approved })
      return data
    },

    // Soft delete asset
    deleteAsset: async (assetId) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { error } = await supabase
        .from('assets')
        .update({ deleted: true })
        .eq('id', assetId)
        .eq('user_id', user.value.id)
      
      if (error) throw error
      
      await logActivity('asset_deleted', { assetId })
    },

    // Get deleted assets
    getDeletedAssets: async () => {
      if (!user.value) return []
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.value.id)
        .eq('deleted', true)
        .order('updated_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching deleted assets:', error)
        return []
      }
      
      return data || []
    },

    // Restore asset
    restoreAsset: async (assetId) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { error } = await supabase
        .from('assets')
        .update({ deleted: false })
        .eq('id', assetId)
        .eq('user_id', user.value.id)
      
      if (error) throw error
      
      await logActivity('asset_restored', { assetId })
    },

    // Get assets by book (for memory book thumbnails)
    getAssetsByBook: async (assetIds, limit = 12) => {
      if (!user.value) return []
      
      if (!assetIds || assetIds.length === 0) return []
      
      const { data, error } = await supabase
        .from('assets')
        .select('id, storage_url, user_caption, ai_caption')
        .eq('user_id', user.value.id)
        .eq('deleted', false)
        .in('id', assetIds)
        .limit(limit)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching assets by book:', error)
        return []
      }
      
      return data || []
    }
  }

  // Memory book operations
  const memoryBookOperations = {
    // Get user's memory books
    getMemoryBooks: async () => {
      if (!user.value) return []
      
      const { data, error } = await supabase
        .from('memory_books')
        .select('*')
        .eq('user_id', user.value.id)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching memory books:', error)
        return []
      }
      
      return data || []
    },

    // Create memory book
    createMemoryBook: async (bookData) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('memory_books')
        .insert([{
          user_id: user.value.id,
          ...bookData
        }])
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('memory_book_created', bookData)
      return data
    },

    // Update memory book
    updateMemoryBook: async (bookId, updates) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('memory_books')
        .update(updates)
        .eq('id', bookId)
        .eq('user_id', user.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('memory_book_updated', { bookId, updates })
      return data
    },

    // Generate memory book from approved assets
    generateMemoryBook: async (bookId, assetIds) => {
      if (!user.value) throw new Error('User not authenticated')
      
      // Update memory book with generated assets and mark as ready
      const { data, error } = await supabase
        .from('memory_books')
        .update({
          status: 'ready',
          created_from_assets: assetIds,
          generated_at: new Date().toISOString()
        })
        .eq('id', bookId)
        .eq('user_id', user.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('memory_book_generated', { bookId, assetCount: assetIds.length })
      return data
    },

    // Download memory book PDF (placeholder implementation)
    downloadMemoryBook: async (bookId) => {
      if (!user.value) throw new Error('User not authenticated')
      
      // For now, return a placeholder URL
      // In a real implementation, this would generate and return the actual PDF
      const placeholderUrl = `https://example.com/memory-book-${bookId}.pdf`
      
      await logActivity('memory_book_downloaded', { bookId })
      return placeholderUrl
    }
  }

  // Admin operations (for admin users only)
  const adminOperations = {
    // Get all users (admin only)
    getAllUsers: async () => {
      if (!user.value) return []
      
      const profile = await getCurrentProfile()
      if (profile?.role !== 'admin') {
        throw new Error('Admin access required')
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching users:', error)
        return []
      }
      
      return data || []
    },

    // Update user role (admin only)
    updateUserRole: async (userId, newRole) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const profile = await getCurrentProfile()
      if (profile?.role !== 'admin') {
        throw new Error('Admin access required')
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      
      await logActivity('user_role_updated', { targetUserId: userId, newRole })
      return data
    },

    // Soft delete user (admin only)
    deleteUser: async (userId) => {
      if (!user.value) throw new Error('User not authenticated')
      
      const profile = await getCurrentProfile()
      if (profile?.role !== 'admin') {
        throw new Error('Admin access required')
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ deleted: true })
        .eq('user_id', userId)
      
      if (error) throw error
      
      await logActivity('user_deleted', { targetUserId: userId })
    }
  }

  // Editor operations (for editor users)
  const editorOperations = {
    // Get all assets for review (editor only)
    getAllAssetsForReview: async () => {
      if (!user.value) return []
      
      const profile = await getCurrentProfile()
      if (profile?.role !== 'editor' && profile?.role !== 'admin') {
        throw new Error('Editor access required')
      }
      
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          profiles!inner(email, first_name, last_name)
        `)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching assets for review:', error)
        return []
      }
      
      return data || []
    },

    // Get all memory books for review (editor only)
    getAllMemoryBooksForReview: async () => {
      if (!user.value) return []
      
      const profile = await getCurrentProfile()
      if (profile?.role !== 'editor' && profile?.role !== 'admin') {
        throw new Error('Editor access required')
      }
      
      const { data, error } = await supabase
        .from('memory_books')
        .select(`
          *,
          profiles!inner(email, first_name, last_name)
        `)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching memory books for review:', error)
        return []
      }
      
      return data || []
    }
  }

  return {
    // Core operations
    getCurrentProfile,
    logActivity,
    
    // Feature-specific operations
    profile: profileOperations,
    family: familyOperations,
    preferences: preferencesOperations,
    assets: assetOperations,
    memoryBooks: memoryBookOperations,
    admin: adminOperations,
    editor: editorOperations
  }
} 