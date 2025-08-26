import { getHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Get user from auth token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }

    // Check if requesting user is admin
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (profileError || !adminProfile || adminProfile.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    const targetUserId = event.context.params.id
    if (!targetUserId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing user id' })
    }

    // Prevent admin from deleting themselves
    if (targetUserId === user.id) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot delete your own account' })
    }

    console.log(`🗑️ Starting user deletion for: ${targetUserId}`)

    // 1. Get user profile first to check if user exists
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (userError || !userProfile) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // 2. Create backup first (using existing backup logic)
    console.log(`📦 Creating backup before deletion...`)
    let backupCreated = false
    let backupId = null
    
    try {
      // Get Auth user data first
      let authUser = null
      try {
        const { data: authUserData, error: authError } = await supabase.auth.admin.getUserById(targetUserId)
        if (authUserData && !authError) {
          authUser = authUserData
          console.log(`✅ Retrieved Auth user data for backup: ${targetUserId}`)
        } else {
          console.log(`⚠️ Could not retrieve Auth user data: ${authError?.message || 'User not found'}`)
        }
      } catch (authError) {
        console.log(`⚠️ Error retrieving Auth user data: ${authError.message}`)
      }

      // Create backup using the existing backup endpoint logic
      const backup = {
        metadata: {
          backup_created_at: new Date().toISOString(),
          backup_created_by: user.id,
          target_user_id: targetUserId,
          target_user_email: userProfile.email,
          backup_reason: 'user_deletion'
        },
        user_profile: userProfile,
        auth_user: authUser,  // Include Auth user data
        families: [],
        assets: [],
        memory_books: [],
        pdf_status: [],
        activity_logs: [],
        email_events: [],
        storage_files: []
      }

      // Get user's families
      const { data: families } = await supabase
        .from('families')
        .select('*')
        .eq('user_id', targetUserId)
      backup.families = families || []

      // Get user's assets
      const { data: assets } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', targetUserId)
      backup.assets = assets || []

      // Get user's memory books
      const { data: memoryBooks } = await supabase
        .from('memory_books')
        .select('*')
        .eq('user_id', targetUserId)
      backup.memory_books = memoryBooks || []

      // Get user's PDF status records
      const { data: pdfStatus } = await supabase
        .from('pdf_status')
        .select('*')
        .eq('user_id', targetUserId)
      backup.pdf_status = pdfStatus || []

      // Get user's activity logs
      const { data: activityLogs } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', targetUserId)
      backup.activity_logs = activityLogs || []

      // Get user's email events
      const { data: emailEvents } = await supabase
        .from('email_events')
        .select('*')
        .eq('user_id', targetUserId)
      backup.email_events = emailEvents || []

      // Get storage files info
      const storageFiles = []
      try {
        const { data: files } = await supabase.storage
          .from('assets')
          .list(`${targetUserId}/`)
        
        if (files) {
          const collectFiles = async (path) => {
            const { data: folderFiles } = await supabase.storage
              .from('assets')
              .list(path)
            
            if (folderFiles) {
              for (const file of folderFiles) {
                if (file.id) {
                  const { data: urlData } = supabase.storage
                    .from('assets')
                    .getPublicUrl(`${path}/${file.name}`)
                  
                  storageFiles.push({
                    path: `${path}/${file.name}`,
                    name: file.name,
                    size: file.metadata?.size,
                    mime_type: file.metadata?.mimetype,
                    created_at: file.created_at,
                    updated_at: file.updated_at,
                    public_url: urlData?.publicUrl
                  })
                } else {
                  await collectFiles(`${path}/${file.name}`)
                }
              }
            }
          }
          
          await collectFiles(`${targetUserId}/`)
        }
      } catch (storageError) {
        console.warn('Could not fetch storage files for backup:', storageError.message)
      }
      backup.storage_files = storageFiles

      // Create backup record
      const { data: backupRecord, error: backupError } = await supabase
        .from('user_backups')
        .insert([{
          user_id: targetUserId,
          original_uuid: targetUserId,
          original_email: userProfile.email,
          backup_data: backup,
          created_by: user.id,
          status: 'completed'
        }])
        .select()
        .single()

      if (backupError) {
        console.error('Error creating backup record:', backupError)
        throw new Error('Failed to create backup')
      }

      backupCreated = true
      backupId = backupRecord.id
      console.log(`✅ Backup created successfully: ${backupId}`)
    } catch (backupError) {
      console.error('Failed to create backup:', backupError)
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to create backup before deletion' 
      })
    }

    // 3. Delete all database records (in transaction-like order)
    console.log(`🗑️ Deleting database records...`)
    
    const deletionResults = {}
    
    // First, delete asset_tags that reference the user's assets
    try {
      // Get all asset IDs for this user
      const { data: userAssets, error: assetsQueryError } = await supabase
        .from('assets')
        .select('id')
        .eq('user_id', targetUserId)
      
      if (assetsQueryError) {
        console.error('Error fetching user assets for tag cleanup:', assetsQueryError)
      } else if (userAssets && userAssets.length > 0) {
        const assetIds = userAssets.map(asset => asset.id)
        
        // Delete asset_tags for these assets
        const { data: deletedTags, error: tagsError } = await supabase
          .from('asset_tags')
          .delete()
          .in('asset_id', assetIds)
        
        if (tagsError) {
          console.error('Error deleting asset tags:', tagsError)
          deletionResults['asset_tags'] = { success: false, error: tagsError.message }
        } else {
          deletionResults['asset_tags'] = { success: true, count: deletedTags?.length || 0 }
          console.log(`✅ Deleted asset tags for ${assetIds.length} assets`)
        }
      } else {
        deletionResults['asset_tags'] = { success: true, count: 0 }
        console.log(`✅ No asset tags to delete`)
      }
    } catch (tagsError) {
      console.error('Error in asset tags deletion:', tagsError)
      deletionResults['asset_tags'] = { success: false, error: tagsError.message }
    }

    // Delete in order to respect foreign key constraints
    const deletionSteps = [
      { table: 'pdf_status', description: 'PDF status records' },
      { table: 'memory_books', description: 'Memory books' },
      { table: 'assets', description: 'Assets' },
      { table: 'families', description: 'Families' },
      { table: 'email_events', description: 'Email events' },
      { table: 'activity_log', description: 'Activity logs' }
    ]
    
    for (const step of deletionSteps) {
      try {
        const { data, error } = await supabase
          .from(step.table)
          .delete()
          .eq('user_id', targetUserId)
        
        if (error) {
          console.error(`Error deleting ${step.description}:`, error)
          deletionResults[step.table] = { success: false, error: error.message }
        } else {
          deletionResults[step.table] = { success: true, count: data?.length || 0 }
          console.log(`✅ Deleted ${step.description}`)
        }
      } catch (stepError) {
        console.error(`Error in ${step.description} deletion:`, stepError)
        deletionResults[step.table] = { success: false, error: stepError.message }
      }
    }

    // Handle user_backups separately - we want to keep the backup records but set user_id to NULL
    try {
      const { data: backupUpdateData, error: backupUpdateError } = await supabase
        .from('user_backups')
        .update({ user_id: null })
        .eq('user_id', targetUserId)
      
      if (backupUpdateError) {
        console.error('Error updating user_backups:', backupUpdateError)
        deletionResults['user_backups'] = { success: false, error: backupUpdateError.message }
      } else {
        deletionResults['user_backups'] = { success: true, count: backupUpdateData?.length || 0 }
        console.log(`✅ Updated user_backups records (set user_id to NULL)`)
      }
    } catch (backupError) {
      console.error('Error in user_backups update:', backupError)
      deletionResults['user_backups'] = { success: false, error: backupError.message }
    }

    // Delete the user profile last
    try {
      const { data, error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', targetUserId)
      
      if (error) {
        console.error('Error deleting user profile:', error)
        deletionResults['profiles'] = { success: false, error: error.message }
      } else {
        deletionResults['profiles'] = { success: true, count: data?.length || 0 }
        console.log(`✅ Deleted user profile`)
      }
    } catch (profileError) {
      console.error('Error in user profile deletion:', profileError)
      deletionResults['profiles'] = { success: false, error: profileError.message }
    }

    // 4. Delete storage files
    console.log(`🗑️ Deleting storage files...`)
    let storageDeletionResult = { success: false, filesDeleted: 0, errors: [] }
    
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('assets')
        .list(`${targetUserId}/`)
      
      if (!listError && files) {
        const deleteFilesRecursively = async (path) => {
          const { data: folderFiles } = await supabase.storage
            .from('assets')
            .list(path)
          
          if (folderFiles) {
            for (const file of folderFiles) {
              if (file.id) {
                // Delete file
                const { error: deleteError } = await supabase.storage
                  .from('assets')
                  .remove([`${path}/${file.name}`])
                
                if (deleteError) {
                  storageDeletionResult.errors.push(`${path}/${file.name}: ${deleteError.message}`)
                } else {
                  storageDeletionResult.filesDeleted++
                }
              } else {
                // Recursively delete files in subfolder
                await deleteFilesRecursively(`${path}/${file.name}`)
                // Delete the empty folder
                const { error: folderDeleteError } = await supabase.storage
                  .from('assets')
                  .remove([`${path}/${file.name}`])
                
                if (folderDeleteError) {
                  storageDeletionResult.errors.push(`Folder ${path}/${file.name}: ${folderDeleteError.message}`)
                }
              }
            }
          }
        }
        
        await deleteFilesRecursively(`${targetUserId}/`)
        
        // Delete the main user folder
        const { error: mainFolderError } = await supabase.storage
          .from('assets')
          .remove([`${targetUserId}/`])
        
        if (mainFolderError) {
          storageDeletionResult.errors.push(`Main folder: ${mainFolderError.message}`)
        }
        
        storageDeletionResult.success = true
        console.log(`✅ Deleted ${storageDeletionResult.filesDeleted} storage files`)
      }
    } catch (storageError) {
      console.error('Error deleting storage files:', storageError)
      storageDeletionResult.errors.push(`Storage error: ${storageError.message}`)
    }

    // 5. Delete Supabase Auth user
    console.log(`🗑️ Deleting Supabase Auth user...`)
    let authDeletionResult = { success: false, error: null }
    
    try {
      // First check if the Auth user exists
      const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserById(targetUserId)
      
      if (authCheckError) {
        if (authCheckError.message.includes('User not found') || authCheckError.message.includes('not found')) {
          console.log(`ℹ️ Auth user not found (may have been already deleted): ${targetUserId}`)
          authDeletionResult.success = true // Consider this a success since the goal is achieved
          authDeletionResult.error = 'Auth user not found (may have been already deleted)'
        } else {
          console.error('Error checking auth user:', authCheckError)
          authDeletionResult.error = authCheckError.message
        }
      } else if (authUser) {
        // Auth user exists, proceed with deletion
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetUserId)
        
        if (authDeleteError) {
          console.error('Error deleting auth user:', authDeleteError)
          authDeletionResult.error = authDeleteError.message
        } else {
          authDeletionResult.success = true
          console.log(`✅ Deleted Supabase Auth user`)
        }
      } else {
        console.log(`ℹ️ Auth user not found: ${targetUserId}`)
        authDeletionResult.success = true // Consider this a success since the goal is achieved
        authDeletionResult.error = 'Auth user not found'
      }
    } catch (authError) {
      console.error('Error in auth user deletion:', authError)
      authDeletionResult.error = authError.message
    }

    // 6. Log the deletion activity
    try {
      await supabase
        .from('activity_log')
        .insert([{
          user_id: user.id,
          action: 'user_deleted',
          details: {
            deleted_user_id: targetUserId,
            deleted_user_email: userProfile.email,
            backup_id: backupId,
            deletion_results: deletionResults,
            storage_deletion: storageDeletionResult,
            auth_deletion: authDeletionResult
          }
        }])
    } catch (logError) {
      console.warn('Failed to log deletion activity:', logError)
    }

    console.log(`✅ User deletion completed for: ${targetUserId}`)
    console.log(`📊 Deletion summary:`)
    console.log(`   - Backup created: ${backupCreated ? 'Yes' : 'No'} (ID: ${backupId})`)
    console.log(`   - Database records deleted: ${Object.keys(deletionResults).length} tables`)
    console.log(`   - Storage files deleted: ${storageDeletionResult.filesDeleted}`)
    console.log(`   - Auth user deleted: ${authDeletionResult.success ? 'Yes' : 'No'}`)
    if (authDeletionResult.error) {
      console.log(`   - Auth deletion note: ${authDeletionResult.error}`)
    }

    return {
      success: true,
      message: 'User deleted successfully',
      backup_id: backupId,
      deletion_summary: {
        user_email: userProfile.email,
        backup_created: backupCreated,
        database_deletions: deletionResults,
        storage_deletion: storageDeletionResult,
        auth_deletion: authDeletionResult
      }
    }

  } catch (error) {
    console.error('User deletion error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete user'
    })
  }
})
