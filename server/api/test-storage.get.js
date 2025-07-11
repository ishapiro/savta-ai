// Test storage access endpoint

export default defineEventHandler(async (event) => {
  try {
    console.log('🧪 Testing storage access...')
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    
    // Use the service role key for server-side operations
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )
    
    // Test if we can list buckets
    console.log('📦 Testing bucket access...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Bucket list error:', bucketsError)
      return {
        success: false,
        error: 'Failed to list buckets: ' + bucketsError.message
      }
    }
    
    console.log('✅ Buckets found:', buckets?.length || 0)
    
    // Test if assets bucket exists
    const assetsBucket = buckets?.find(b => b.name === 'assets')
    if (!assetsBucket) {
      return {
        success: false,
        error: 'Assets bucket not found'
      }
    }
    
    console.log('✅ Assets bucket found')
    
    // Test if we can list files in assets bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('assets')
      .list('', { limit: 10 })
    
    if (filesError) {
      console.error('❌ File list error:', filesError)
      return {
        success: false,
        error: 'Failed to list files: ' + filesError.message
      }
    }
    
    console.log('✅ Files in assets bucket:', files?.length || 0)
    
    return {
      success: true,
      buckets: buckets?.length || 0,
      assetsBucket: !!assetsBucket,
      files: files?.length || 0
    }
    
  } catch (error) {
    console.error('❌ Storage test error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}) 