// Test endpoint to debug status API issues
export default defineEventHandler(async (event) => {
  try {
    console.log('🧪 Testing status API...')
    
    // Get the authorization header
    const authHeader = getHeader(event, 'authorization')
    console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: 'No valid authorization header',
        authHeader: authHeader ? 'Present but invalid' : 'Missing'
      }
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('🔑 Token length:', token.length)
    
    // Create Supabase client
    const config = useRuntimeConfig()
    console.log('⚙️ Config keys:', Object.keys(config))
    console.log('🔗 Supabase URL:', config.public.supabaseUrl ? 'Present' : 'Missing')
    console.log('🔑 Service role key:', config.supabaseServiceRoleKey ? 'Present' : 'Missing')
    
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Test auth
    console.log('🔐 Testing auth...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError) {
      console.log('❌ Auth error:', authError)
      return {
        error: 'Auth failed',
        authError: authError.message
      }
    }
    
    if (!user) {
      console.log('❌ No user found')
      return {
        error: 'No user found'
      }
    }
    
    console.log('✅ User authenticated:', user.id)
    
    // Test database connection
    console.log('🗄️ Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('memory_books')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.log('❌ Database error:', testError)
      return {
        error: 'Database connection failed',
        dbError: testError.message
      }
    }
    
    console.log('✅ Database connection successful')
    
    // Test pdf_status table
    console.log('📊 Testing pdf_status table...')
    const { data: statusData, error: statusError } = await supabase
      .from('pdf_status')
      .select('*')
      .limit(1)
    
    if (statusError) {
      console.log('❌ PDF status table error:', statusError)
      return {
        error: 'PDF status table error',
        statusError: statusError.message,
        statusErrorCode: statusError.code
      }
    }
    
    console.log('✅ PDF status table accessible')
    
    return {
      success: true,
      user: user.id,
      database: 'Connected',
      pdfStatusTable: 'Accessible',
      message: 'All tests passed'
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
    return {
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    }
  }
}) 