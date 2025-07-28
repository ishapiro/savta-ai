<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6 flex flex-col items-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-brand-primary mb-2">Memory Book Preview</h1>
        <p class="text-brand-primary/70 text-center">View your special memory book as a PDF. You can download or share it from here.</p>
      </div>
      <div class="w-full flex flex-col items-center">
        <!-- PDF Viewer - Mobile (with overflow) -->
        <div class="flex-1 min-h-0 w-full flex items-center justify-center overflow-auto sm:hidden px-0">
          <ClientOnly>
            <PdfViewer 
              v-if="pdfBlobUrl" 
              :key="pdfBlobUrl"
              :src="pdfBlobUrl" 
              :style="pdfViewerStyle" 
            />
            <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
              <i class="h-[80%] pi pi-file-pdf text-3xl sm:text-4xl text-brand-primary/40"></i>
              <p class="text-sm sm:text-base text-brand-primary/60 mt-2">No PDF available for preview.</p>
            </div>
          </ClientOnly>
        </div>
        <!-- PDF Viewer - Desktop (without overflow) -->
        <div class="hidden sm:flex flex-1 min-h-0 w-full items-start justify-center pt-2">
          <ClientOnly>
            <PdfViewer 
              v-if="pdfBlobUrl" 
              :key="pdfBlobUrl"
              :src="pdfBlobUrl" 
              :style="pdfViewerStyle" 
            />
            <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
              <i class="h-[80%] pi pi-file-pdf text-3xl sm:text-4xl text-brand-primary/40"></i>
              <p class="text-sm sm:text-base text-brand-primary/60 mt-2">No PDF available for preview.</p>
            </div>
          </ClientOnly>
        </div>
        <div class="z-50 flex justify-center items-center gap-3 sm:gap-4 py-4 sm:py-6 px-4 bg-brand-navigation/20 border-t border-brand-primary/20 min-h-[60px] sm:min-h-[80px] w-full">
          <Button
            label="Back"
            severity="secondary"
            size="small"
            class="border-0 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3"
            @click="goBack"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PdfViewer from '~/components/PdfViewer.vue'

const route = useRoute()
const router = useRouter()
const bookId = route.params.id
const pdfBlobUrl = ref('')

const pdfViewerStyle = computed(() => ({
  width: '100%',
  height: '80vh',
  maxHeight: '80vh',
  minHeight: '400px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
}))

const fetchPdfUrl = async () => {
  try {
    // Get the user's session token for authentication
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      console.error('No authentication token available')
      pdfBlobUrl.value = ''
      return
    }

    console.log('🔍 Fetching PDF for book ID:', bookId)
    console.log('🔍 Using token:', session.access_token.substring(0, 20) + '...')

    // Use the same download endpoint as the main memory-books page with authentication
    const res = await fetch(`/api/memory-books/download/${bookId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    
    console.log('🔍 Response status:', res.status)
    console.log('🔍 Response headers:', Object.fromEntries(res.headers.entries()))
    
    if (!res.ok) {
      console.error('Failed to fetch PDF:', res.status, res.statusText)
      const errorText = await res.text()
      console.error('Error response body:', errorText)
      throw new Error('Failed to fetch PDF')
    }
    
    // Check if response is JSON (contains downloadUrl) or direct PDF blob
    const contentType = res.headers.get('content-type')
    console.log('🔍 Content-Type:', contentType)
    
    if (contentType && contentType.includes('application/json')) {
      // API returned JSON with downloadUrl
      const jsonResponse = await res.json()
      console.log('🔍 JSON response:', jsonResponse)
      
      if (jsonResponse.downloadUrl) {
        console.log('🔍 Fetching PDF from downloadUrl:', jsonResponse.downloadUrl)
        // Fetch the actual PDF from the downloadUrl
        const pdfRes = await fetch(jsonResponse.downloadUrl)
        
        if (!pdfRes.ok) {
          console.error('Failed to fetch PDF from downloadUrl:', pdfRes.status)
          throw new Error('Failed to fetch PDF from download URL')
        }
        
        const blob = await pdfRes.blob()
        console.log('🔍 PDF blob from downloadUrl:', {
          size: blob.size,
          type: blob.type,
          lastModified: blob.lastModified
        })
        
        if (blob.size === 0) {
          console.error('PDF blob is empty (0 bytes)')
          throw new Error('PDF is empty')
        }
        
        pdfBlobUrl.value = URL.createObjectURL(blob)
        console.log('🔍 PDF blob URL created from downloadUrl:', pdfBlobUrl.value)
      } else {
        throw new Error('No downloadUrl in response')
      }
    } else {
      // Direct PDF blob response
      const blob = await res.blob()
      console.log('🔍 Direct PDF blob:', {
        size: blob.size,
        type: blob.type,
        lastModified: blob.lastModified
      })
      
      if (blob.size === 0) {
        console.error('PDF blob is empty (0 bytes)')
        throw new Error('PDF is empty')
      }
      
      pdfBlobUrl.value = URL.createObjectURL(blob)
      console.log('🔍 PDF blob URL created from direct response:', pdfBlobUrl.value)
    }
  } catch (e) {
    console.error('Error loading PDF:', e)
    pdfBlobUrl.value = ''
  }
}

const goBack = () => {
  // Clean up the blob URL to prevent memory leaks
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
    pdfBlobUrl.value = ''
  }
  // Navigate back to the editor page with the memory books tab (index 1) and selected user
  const queryParams = {
    tab: '1', // Memory books tab
    user: selectedUser.value
  }
  router.push({ path: '/app/admin', query: queryParams })
}

onMounted(fetchPdfUrl)

// Clean up blob URL when component is unmounted
onUnmounted(() => {
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
  }
})
</script>

<style scoped>
.pdf-viewer-container {
  min-height: 400px;
}
</style> 