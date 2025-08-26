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

    const body = await readBody(event)
    const { backupId, overwrite } = body

    if (!backupId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing backup ID' })
    }

    console.log(`🔄 Starting backup restoration for backup: ${backupId}`)

    // 1. Get backup record from database
    const { data: backupRecord, error: backupError } = await supabase
      .from('user_backups')
      .select('*')
      .eq('id', backupId)
      .single()

    if (backupError || !backupRecord) {
      throw createError({ statusCode: 404, statusMessage: 'Backup not found' })
    }

    const backup = backupRecord.backup_data
    const targetUserId = backupRecord.original_uuid || backup.metadata.target_user_id
    const targetUserEmail = backupRecord.original_email || backup.metadata.target_user_email

    console.log(`📋 Restoring backup for user: ${targetUserEmail} (${targetUserId})`)
    console.log(`📋 Backup record details:`, {
      original_uuid: backupRecord.original_uuid,
      original_email: backupRecord.original_email,
      backup_metadata: backup.metadata,
      targetUserId,
      targetUserEmail
    })

    // 2. Check if user exists in Supabase Auth and profiles
    let authUserExists = false
    let profileUserExists = false
    let existingProfile = null
    
    // Check Supabase Auth first
    try {
      const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserById(targetUserId)
      authUserExists = !!authUser && !authCheckError
      console.log(`🔐 Supabase Auth check for ${targetUserId}:`, { exists: authUserExists, error: authCheckError?.message })
    } catch (authError) {
      console.log(`🔐 Supabase Auth check failed for ${targetUserId}:`, authError.message)
    }
    
    // Check profiles table for active users
    const { data: existingUserById, error: userCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .is('deleted', null)  // Only active users
      .maybeSingle()

    const { data: existingUserByEmail, error: emailCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', targetUserEmail)
      .is('deleted', null)  // Only active users
      .maybeSingle()

    existingProfile = existingUserById || existingUserByEmail
    profileUserExists = !!existingProfile

    // Additional check: see if there are any users with this email (including deleted ones)
    const { data: allUsersWithEmail, error: allUsersError } = await supabase
      .from('profiles')
      .select('id, user_id, email, deleted')
      .eq('email', targetUserEmail)

    console.log(`User existence check:`, {
      targetUserId,
      targetUserEmail,
      authUserExists,
      profileUserExists,
      existingProfile: existingProfile ? { id: existingProfile.id, user_id: existingProfile.user_id, email: existingProfile.email, deleted: existingProfile.deleted } : null,
      existingUserById: existingUserById ? { id: existingUserById.id, user_id: existingUserById.user_id, email: existingUserById.email, deleted: existingUserById.deleted } : null,
      existingUserByEmail: existingUserByEmail ? { id: existingUserByEmail.id, user_id: existingUserByEmail.user_id, email: existingUserByEmail.email, deleted: existingUserByEmail.deleted } : null,
      userCheckError: userCheckError?.message,
      emailCheckError: emailCheckError?.message,
      allUsersWithEmail: allUsersWithEmail || [],
      allUsersError: allUsersError?.message
    })

    // Check for soft-deleted user that needs to be "fixed"
    const softDeletedUser = allUsersWithEmail?.find(user => user.deleted === true)
    const needsFixing = softDeletedUser && !authUserExists && !profileUserExists
    
    // Determine if we should overwrite, create new, or fix existing
    const shouldOverwrite = (authUserExists || profileUserExists) && overwrite
    const shouldCreateNew = !authUserExists && !profileUserExists && !needsFixing
    const shouldFixUser = needsFixing
    
    if ((authUserExists || profileUserExists) && !overwrite && !needsFixing) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: `User already exists (${authUserExists ? 'in Auth' : ''}${authUserExists && profileUserExists ? ' and ' : ''}${profileUserExists ? 'in profiles' : ''}) and overwrite not specified` 
      })
    }
    
    if (shouldFixUser) {
      console.log(`🔧 Fixing soft-deleted user: ${targetUserEmail} (${targetUserId})`)
    }

    // 3. If user exists and we're overwriting, delete existing data
    if (shouldOverwrite) {
      console.log(`🗑️ Overwriting existing user data for: ${targetUserEmail}`)
      
      // Delete existing data in reverse dependency order
      await supabase.from('email_events').delete().eq('user_id', targetUserId)
      await supabase.from('activity_log').delete().eq('user_id', targetUserId)
      await supabase.from('pdf_status').delete().eq('user_id', targetUserId)
      await supabase.from('memory_books').delete().eq('user_id', targetUserId)
      await supabase.from('assets').delete().eq('user_id', targetUserId)
      await supabase.from('families').delete().eq('user_id', targetUserId)
      
      // Delete existing storage files
      try {
        const { data: existingFiles } = await supabase.storage
          .from('assets')
          .list(`${targetUserId}/`)
        
        if (existingFiles) {
          for (const file of existingFiles) {
            if (file.id) {
              await supabase.storage
                .from('assets')
                .remove([`${targetUserId}/${file.name}`])
            }
          }
        }
      } catch (storageError) {
        console.warn('Error cleaning existing storage files:', storageError)
      }
    }

    // 4. Restore user profile
    if (shouldOverwrite && existingProfile) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...backup.user_profile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUserId)

      if (updateError) {
        console.error('Error updating user profile:', updateError)
        throw createError({ statusCode: 500, statusMessage: 'Failed to update user profile' })
      }
    } else if (shouldFixUser && softDeletedUser) {
      // Fix soft-deleted user by updating the existing record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...backup.user_profile,
          deleted: null,  // Remove deleted flag
          updated_at: new Date().toISOString()
        })
        .eq('id', softDeletedUser.id)  // Use the existing record ID

      if (updateError) {
        console.error('Error fixing user profile:', updateError)
        throw createError({ statusCode: 500, statusMessage: 'Failed to fix user profile' })
      }
      
      console.log(`✅ Fixed user profile: ${targetUserEmail}`)
    } else {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([backup.user_profile])

      if (insertError) {
        console.error('Error creating user profile:', insertError)
        throw createError({ statusCode: 500, statusMessage: 'Failed to create user profile' })
      }
    }

    // 4.5. Restore Supabase Auth user (if backup contains Auth data)
    if (backup.auth_user && !authUserExists) {
      console.log(`🔐 Restoring Supabase Auth user for: ${targetUserEmail}`)
      
      try {
        // Create Auth user with the same ID and email
        const { data: createdAuthUser, error: authCreateError } = await supabase.auth.admin.createUser({
          email: targetUserEmail,
          user_metadata: backup.auth_user.user_metadata || {},
          app_metadata: backup.auth_user.app_metadata || {},
          email_confirm: backup.auth_user.email_confirmed_at ? true : false,
          phone_confirm: backup.auth_user.phone_confirmed_at ? true : false,
          user_id: targetUserId // Use the original user ID
        })

        if (authCreateError) {
          console.error('Error creating Auth user:', authCreateError)
          // Don't fail the entire restoration, just log the error
        } else {
          console.log(`✅ Restored Supabase Auth user: ${createdAuthUser.user.id}`)
        }
      } catch (authError) {
        console.error('Error in Auth user restoration:', authError)
        // Continue with restoration even if Auth user creation fails
      }
    } else if (backup.auth_user && authUserExists) {
      console.log(`🔐 Auth user already exists for: ${targetUserEmail}`)
    } else if (shouldFixUser) {
      // For fixing users, try to create Auth user even without backup data
      console.log(`🔐 Creating Auth user for fixed user: ${targetUserEmail}`)
      
      try {
        const { data: createdAuthUser, error: authCreateError } = await supabase.auth.admin.createUser({
          email: targetUserEmail,
          user_metadata: {},
          app_metadata: {},
          email_confirm: true,  // Assume email is confirmed for restored users
          phone_confirm: false,
          user_id: targetUserId
        })

        if (authCreateError) {
          console.error('Error creating Auth user for fixed user:', authCreateError)
        } else {
          console.log(`✅ Created Auth user for fixed user: ${createdAuthUser.user.id}`)
        }
      } catch (authError) {
        console.error('Error creating Auth user for fixed user:', authError)
      }
    } else {
      console.log(`⚠️ No Auth user data in backup for: ${targetUserEmail}`)
    }

    // 5. Restore families
    if (backup.families && backup.families.length > 0) {
      if (shouldFixUser) {
        // For fixing users, skip families if they already exist
        console.log(`ℹ️ Skipping families restoration for fixed user (may already exist)`)
      } else {
        const { error: familiesError } = await supabase
          .from('families')
          .insert(backup.families)

        if (familiesError) {
          console.error('Error restoring families:', familiesError)
        } else {
          console.log(`✅ Restored ${backup.families.length} family records`)
        }
      }
    }

    // 6. Restore assets
    if (backup.assets && backup.assets.length > 0) {
      if (shouldFixUser) {
        // For fixing users, skip assets if they already exist
        console.log(`ℹ️ Skipping assets restoration for fixed user (may already exist)`)
      } else {
        const { error: assetsError } = await supabase
          .from('assets')
          .insert(backup.assets)

        if (assetsError) {
          console.error('Error restoring assets:', assetsError)
        } else {
          console.log(`✅ Restored ${backup.assets.length} asset records`)
        }
      }
    }

    // 7. Restore memory books
    if (backup.memory_books && backup.memory_books.length > 0) {
      if (shouldFixUser) {
        // For fixing users, skip memory books if they already exist
        console.log(`ℹ️ Skipping memory books restoration for fixed user (may already exist)`)
      } else {
        const { error: booksError } = await supabase
          .from('memory_books')
          .insert(backup.memory_books)

        if (booksError) {
          console.error('Error restoring memory books:', booksError)
        } else {
          console.log(`✅ Restored ${backup.memory_books.length} memory book records`)
        }
      }
    }

    // 8. Restore PDF status records
    if (backup.pdf_status && backup.pdf_status.length > 0) {
      if (shouldFixUser) {
        // For fixing users, skip PDF status if they already exist
        console.log(`ℹ️ Skipping PDF status restoration for fixed user (may already exist)`)
      } else {
        const { error: pdfError } = await supabase
          .from('pdf_status')
          .insert(backup.pdf_status)

        if (pdfError) {
          console.error('Error restoring PDF status records:', pdfError)
        } else {
          console.log(`✅ Restored ${backup.pdf_status.length} PDF status records`)
        }
      }
    }

    // 9. Restore activity logs
    if (backup.activity_logs && backup.activity_logs.length > 0) {
      if (shouldFixUser) {
        // For fixing users, skip activity logs if they already exist
        console.log(`ℹ️ Skipping activity logs restoration for fixed user (may already exist)`)
      } else {
        const { error: activityError } = await supabase
          .from('activity_log')
          .insert(backup.activity_logs)

        if (activityError) {
          console.error('Error restoring activity logs:', activityError)
        } else {
          console.log(`✅ Restored ${backup.activity_logs.length} activity log records`)
        }
      }
    }

    // 10. Restore email events
    if (backup.email_events && backup.email_events.length > 0) {
      if (shouldFixUser) {
        // For fixing users, skip email events if they already exist
        console.log(`ℹ️ Skipping email events restoration for fixed user (may already exist)`)
      } else {
        const { error: emailError } = await supabase
          .from('email_events')
          .insert(backup.email_events)

        if (emailError) {
          console.error('Error restoring email events:', emailError)
        } else {
          console.log(`✅ Restored ${backup.email_events.length} email event records`)
        }
      }
    }

    // 11. Restore storage files from backup to main storage
    const restoredFiles = []
    if (backup.storage_files && backup.storage_files.length > 0) {
      console.log(`📁 Restoring ${backup.storage_files.length} files from backup storage`)
      
      let processedCount = 0
      for (const fileInfo of backup.storage_files) {
        processedCount++
        console.log(`📁 Processing file ${processedCount}/${backup.storage_files.length}: ${fileInfo.path}`)
        try {
          // Download file from backup storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('backups')
            .download(fileInfo.path)
          
          if (downloadError) {
            console.error(`Failed to download file ${fileInfo.path} from backup:`, downloadError)
            continue
          }

          // Check if file already exists in main storage
          const { data: existingFile } = await supabase.storage
            .from('assets')
            .list(fileInfo.path.split('/').slice(0, -1).join('/'))
          
          const fileName = fileInfo.path.split('/').pop()
          const fileExists = existingFile?.some(file => file.name === fileName)
          
          if (fileExists) {
            console.log(`ℹ️ File already exists, skipping: ${fileInfo.path}`)
            restoredFiles.push(fileInfo.path)
            continue
          }
          
          // Upload file to main storage
          const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(fileInfo.path, fileData, {
              contentType: fileInfo.mime_type || 'application/octet-stream'
            })
          
          if (uploadError) {
            if (uploadError.message.includes('Duplicate') || uploadError.message.includes('already exists')) {
              console.log(`ℹ️ File already exists (handled): ${fileInfo.path}`)
              restoredFiles.push(fileInfo.path)
            } else {
              console.error(`Failed to restore file ${fileInfo.path} to main storage:`, uploadError)
            }
          } else {
            restoredFiles.push(fileInfo.path)
            console.log(`✅ Restored file: ${fileInfo.path}`)
          }
        } catch (fileError) {
          console.error(`Error restoring file ${fileInfo.path}:`, fileError)
        }
      }
    }

    console.log(`✅ Backup restoration completed for user: ${targetUserEmail}`)
    console.log(`📊 Restoration summary:`)
    console.log(`   - Profile: ${shouldOverwrite ? 'updated' : shouldFixUser ? 'fixed' : 'created'}`)
    console.log(`   - Auth User: ${backup.auth_user ? (authUserExists ? 'already exists' : 'restored') : shouldFixUser ? 'created' : 'not available'}`)
    console.log(`   - Families: ${shouldFixUser ? 'skipped (may exist)' : backup.families?.length || 0} records`)
    console.log(`   - Assets: ${shouldFixUser ? 'skipped (may exist)' : backup.assets?.length || 0} records`)
    console.log(`   - Memory Books: ${shouldFixUser ? 'skipped (may exist)' : backup.memory_books?.length || 0} records`)
    console.log(`   - PDF Status: ${shouldFixUser ? 'skipped (may exist)' : backup.pdf_status?.length || 0} records`)
    console.log(`   - Activity Logs: ${shouldFixUser ? 'skipped (may exist)' : backup.activity_logs?.length || 0} records`)
    console.log(`   - Email Events: ${shouldFixUser ? 'skipped (may exist)' : backup.email_events?.length || 0} records`)
    console.log(`   - Storage Files: ${restoredFiles.length} files restored`)

    return {
      success: true,
      user_email: targetUserEmail,
      user_id: targetUserId,
      action: shouldOverwrite ? 'overwritten' : shouldFixUser ? 'fixed' : 'created',
      summary: {
        total_records: (backup.families?.length || 0) + (backup.assets?.length || 0) + 
                      (backup.memory_books?.length || 0) + (backup.pdf_status?.length || 0) + 
                      (backup.activity_logs?.length || 0) + (backup.email_events?.length || 0),
        total_files: restoredFiles.length
      }
    }

  } catch (error) {
    console.error('Backup restoration error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to restore backup'
    })
  }
})
