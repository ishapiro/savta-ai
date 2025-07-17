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
      
      console.log('🚀 uploadAsset called with:', { 
        type: assetData.type, 
        hasFile: !!file, 
        fileName: file?.name,
        fileSize: file?.size 
      })
      
      let storageUrl = null
      let photoMetadata = null
      let fileToUpload = file
      
      // Process image for metadata, geocoding, and compression if it's an image file
      if (file && file.type && file.type.startsWith('image/')) {
        try {
          console.log('📸 Starting image analysis in uploadAsset...')
          
          // Check if compression is needed (5MB threshold)
          if (file.size > 5 * 1024 * 1024) {
            console.log('🗜️ File size exceeds 5MB, compressing...')
            try {
              // Create form data for the compression API
              const formData = new FormData()
              formData.append('file', file)
              formData.append('maxSizeMB', '5')

              // Call the compression API
              const response = await $fetch('/api/compress-image', {
                method: 'POST',
                body: formData
              })

              if (response.compressed) {
                // Convert base64 back to blob
                const compressedBlob = await fetch(`data:image/jpeg;base64,${response.compressedBuffer}`)
                  .then(res => res.blob())
                
                // Create a new File object with the compressed blob
                fileToUpload = new File([compressedBlob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                
                console.log(`🗜️ Compression successful: ${file.size} -> ${fileToUpload.size} bytes`)
              } else {
                console.log('🗜️ No compression needed')
              }
            } catch (compressionError) {
              console.warn('⚠️ Compression failed, using original file:', compressionError.message)
              fileToUpload = file
            }
          }
          
          // Analyze image metadata and geocoding on the server
          console.log('📸 Analyzing image metadata...')
          try {
            const analysisFormData = new FormData()
            analysisFormData.append('file', fileToUpload)
            
            const analysisResponse = await $fetch('/api/analyze-image', {
              method: 'POST',
              body: analysisFormData
            })
            
            if (analysisResponse.success) {
              photoMetadata = analysisResponse.metadata
              console.log('📸 Image analysis completed successfully:', photoMetadata)
            } else {
              console.warn('⚠️ Image analysis failed')
            }
          } catch (analysisError) {
            console.warn('⚠️ Failed to analyze image:', analysisError.message)
            // Continue without metadata
          }
          
        } catch (error) {
          console.error('❌ Failed to process image:', error)
          // Continue without metadata
        }
      }
      
      // Upload file to Supabase Storage if provided
      if (fileToUpload) {
        // Use user-specific folder structure for organization
        const fileName = `${user.value.id}/${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(fileName, fileToUpload)
        
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
      
      // Create asset record with photo metadata if available
      const assetRecord = {
        user_id: user.value.id,
        storage_url: storageUrl,
        ...assetData
      }
      
      // Add photo metadata if available
      if (photoMetadata) {
        assetRecord.width = photoMetadata.width
        assetRecord.height = photoMetadata.height
        assetRecord.orientation = photoMetadata.orientation
        assetRecord.location = photoMetadata.location
        assetRecord.city = photoMetadata.city
        assetRecord.state = photoMetadata.state
        assetRecord.country = photoMetadata.country
        assetRecord.zip_code = photoMetadata.zip_code
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
      
      console.log('✅ Upload completed successfully')
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
    },

    // Get all unique tags from user's assets (for autocomplete)
    getAllTags: async () => {
      if (!user.value) return []
      
      const { data, error } = await supabase
        .from('assets')
        .select('tags, user_tags')
        .eq('user_id', user.value.id)
        .eq('deleted', false)
      
      if (error) {
        console.error('Error fetching tags:', error)
        return []
      }
      
      // Combine AI tags and user tags, remove duplicates
      const allTags = new Set()
      data.forEach(asset => {
        if (asset.tags) {
          asset.tags.forEach(tag => allTags.add(tag))
        }
        if (asset.user_tags) {
          asset.user_tags.forEach(tag => allTags.add(tag))
        }
      })
      
      return Array.from(allTags).sort()
    },

    // Get all unique people/objects from user's assets (for autocomplete)
    getAllPeople: async () => {
      if (!user.value) return []
      
      const { data, error } = await supabase
        .from('assets')
        .select('people_detected, user_people')
        .eq('user_id', user.value.id)
        .eq('deleted', false)
      
      if (error) {
        console.error('Error fetching people:', error)
        return []
      }
      
      // Combine AI people and user people, remove duplicates
      const allPeople = new Set()
      data.forEach(asset => {
        if (asset.people_detected) {
          asset.people_detected.forEach(person => allPeople.add(person))
        }
        if (asset.user_people) {
          asset.user_people.forEach(person => allPeople.add(person))
        }
      })
      
      return Array.from(allPeople).sort()
    },

    // Rerun AI analysis on an asset (preserves user-added tags and people)
    rerunAI: async (assetId) => {
      if (!user.value) throw new Error('User not authenticated')
      
      // Get the current asset to preserve user data
      const { data: currentAsset, error: fetchError } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .eq('user_id', user.value.id)
        .single()
      
      if (fetchError) throw fetchError
      
      // Call the AI processing endpoint using fetch
      const response = await fetch('/api/ai/process-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: assetId,
          assetType: currentAsset.type,
          storageUrl: currentAsset.storage_url,
          userCaption: currentAsset.user_caption,
          preserveUserData: true,
          userTags: currentAsset.user_tags || [],
          userPeople: currentAsset.user_people || [],
          peopleDetected: currentAsset.people_detected || [],
          tags: currentAsset.tags || []
        })
      })
      
      if (!response.ok) {
        throw new Error(`AI processing failed: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      await logActivity('asset_ai_rerun', { assetId })
      return result
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
    },

    // Get a single memory book by id
    getMemoryBook: async (bookId) => {
      if (!user.value) return null
      const { data, error } = await supabase
        .from('memory_books')
        .select('*')
        .eq('id', bookId)
        .eq('user_id', user.value.id)
        .single()
      if (error) {
        console.error('Error fetching memory book:', error)
        return null
      }
      return data
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