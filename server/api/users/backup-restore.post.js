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
    const targetUserId = backup.metadata.target_user_id
    const targetUserEmail = backup.metadata.target_user_email

    console.log(`📋 Restoring backup for user: ${targetUserEmail} (${targetUserId})`)

    // 2. Check if user already exists by both user ID and email
    const { data: existingUserById, error: userCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    const { data: existingUserByEmail, error: emailCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', targetUserEmail)
      .single()

    const existingUser = existingUserById || existingUserByEmail
    const userExistsById = !!existingUserById
    const userExistsByEmail = !!existingUserByEmail

    console.log(`User existence check:`, {
      targetUserId,
      targetUserEmail,
      userExistsById,
      userExistsByEmail,
      existingUser: !!existingUser
    })

    if (existingUser && !overwrite) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: `User already exists (${userExistsById ? 'by ID' : 'by email'}) and overwrite not specified` 
      })
    }

    // 3. If user exists and we're overwriting, delete existing data
    if (existingUser && overwrite) {
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
    if (existingUser && overwrite) {
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
    if (backup.auth_user && !userExistsById) {
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
    } else if (backup.auth_user && userExistsById) {
      console.log(`🔐 Auth user already exists for: ${targetUserEmail}`)
    } else {
      console.log(`⚠️ No Auth user data in backup for: ${targetUserEmail}`)
    }

    // 5. Restore families
    if (backup.families && backup.families.length > 0) {
      const { error: familiesError } = await supabase
        .from('families')
        .insert(backup.families)

      if (familiesError) {
        console.error('Error restoring families:', familiesError)
      } else {
        console.log(`✅ Restored ${backup.families.length} family records`)
      }
    }

    // 6. Restore assets
    if (backup.assets && backup.assets.length > 0) {
      const { error: assetsError } = await supabase
        .from('assets')
        .insert(backup.assets)

      if (assetsError) {
        console.error('Error restoring assets:', assetsError)
      } else {
        console.log(`✅ Restored ${backup.assets.length} asset records`)
      }
    }

    // 7. Restore memory books
    if (backup.memory_books && backup.memory_books.length > 0) {
      const { error: booksError } = await supabase
        .from('memory_books')
        .insert(backup.memory_books)

      if (booksError) {
        console.error('Error restoring memory books:', booksError)
      } else {
        console.log(`✅ Restored ${backup.memory_books.length} memory book records`)
      }
    }

    // 8. Restore PDF status records
    if (backup.pdf_status && backup.pdf_status.length > 0) {
      const { error: pdfError } = await supabase
        .from('pdf_status')
        .insert(backup.pdf_status)

      if (pdfError) {
        console.error('Error restoring PDF status records:', pdfError)
      } else {
        console.log(`✅ Restored ${backup.pdf_status.length} PDF status records`)
      }
    }

    // 9. Restore activity logs
    if (backup.activity_logs && backup.activity_logs.length > 0) {
      const { error: activityError } = await supabase
        .from('activity_log')
        .insert(backup.activity_logs)

      if (activityError) {
        console.error('Error restoring activity logs:', activityError)
      } else {
        console.log(`✅ Restored ${backup.activity_logs.length} activity log records`)
      }
    }

    // 10. Restore email events
    if (backup.email_events && backup.email_events.length > 0) {
      const { error: emailError } = await supabase
        .from('email_events')
        .insert(backup.email_events)

      if (emailError) {
        console.error('Error restoring email events:', emailError)
      } else {
        console.log(`✅ Restored ${backup.email_events.length} email event records`)
      }
    }

    // 11. Restore storage files from backup to main storage
    const restoredFiles = []
    if (backup.storage_files && backup.storage_files.length > 0) {
      console.log(`📁 Restoring ${backup.storage_files.length} files from backup storage`)
      
      for (const fileInfo of backup.storage_files) {
        try {
          // Download file from backup storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('backups')
            .download(fileInfo.path)
          
          if (downloadError) {
            console.error(`Failed to download file ${fileInfo.path} from backup:`, downloadError)
            continue
          }

          // Upload file to main storage
          const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(fileInfo.path, fileData, {
              contentType: fileInfo.mime_type || 'application/octet-stream'
            })
          
          if (uploadError) {
            console.error(`Failed to restore file ${fileInfo.path} to main storage:`, uploadError)
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
    console.log(`   - Profile: ${existingUser && overwrite ? 'updated' : 'created'}`)
    console.log(`   - Auth User: ${backup.auth_user ? (userExistsById ? 'already exists' : 'restored') : 'not available'}`)
    console.log(`   - Families: ${backup.families?.length || 0} records`)
    console.log(`   - Assets: ${backup.assets?.length || 0} records`)
    console.log(`   - Memory Books: ${backup.memory_books?.length || 0} records`)
    console.log(`   - PDF Status: ${backup.pdf_status?.length || 0} records`)
    console.log(`   - Activity Logs: ${backup.activity_logs?.length || 0} records`)
    console.log(`   - Email Events: ${backup.email_events?.length || 0} records`)
    console.log(`   - Storage Files: ${restoredFiles.length} files restored`)

    return {
      success: true,
      user_email: targetUserEmail,
      user_id: targetUserId,
      action: existingUser && overwrite ? 'overwritten' : 'created',
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
