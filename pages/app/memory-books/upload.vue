<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button
          @click="goBack"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors focus:outline-none"
          aria-label="Go back"
        >
          <i class="pi pi-arrow-left text-lg text-brand-primary"></i>
        </button>
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-brand-primary">Add Favorite Photos to Savta's Drawer</h1>
          <p class="text-brand-text-muted">Build your secure collection of favorite photos for Savta to use in memory cards and books</p>
        </div>
      </div>

      <!-- Upload Dialog Content -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div v-if="!isUploading" class="space-y-6">
          <!-- Upload Area -->
          <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-highlight transition-colors">
            <div class="space-y-4">
              <div class="w-16 h-16 mx-auto bg-brand-highlight/10 rounded-full flex items-center justify-center">
                <i class="pi pi-cloud-upload text-2xl text-brand-highlight"></i>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-brand-primary mb-2">Add favorite photos to Savta's Drawer</h3>
                <p class="text-sm text-brand-text-muted mb-4">
                  Upload only your favorite JPG, PNG, or HEIC files. Savta will automatically caption and tag them, then select the best ones for your memory cards and books.
                </p>
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
                <button
                  @click="$refs.fileInput.click()"
                  class="bg-brand-highlight hover:bg-brand-highlight/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Choose Photos
                </button>
              </div>
            </div>
          </div>

          <!-- Special messaging for wizard flow -->
          <div v-if="showSpecialMessaging" class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 border border-brand-secondary/20 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <i class="pi pi-magic-wand text-white text-sm"></i>
              </div>
              <div>
                <h4 class="font-semibold text-brand-secondary mb-1">Building Your Favorite Photo Collection</h4>
                <p class="text-sm text-brand-text-muted">
                  These photos go into Savta's Drawer—a secure collection Savta uses to create memory cards and books. 
                  Choose only your favorite photos (not your entire camera roll) that you'd want to share with family and friends.
                  <br />
                  <br />
                  Upload at least 6 photos for the best results. Savta will select the perfect photos for each memory based on your instructions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-else class="space-y-6">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto bg-brand-highlight/10 rounded-full flex items-center justify-center mb-4">
              <i class="pi pi-spin pi-spinner text-2xl text-brand-highlight"></i>
            </div>
            <h3 class="text-lg font-semibold text-brand-primary mb-2">Uploading your photos...</h3>
            <p class="text-sm text-brand-text-muted">{{ uploadStatus }}</p>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-brand-highlight h-2 rounded-full transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>

          <!-- File List -->
          <div v-if="uploadingFiles.length > 0" class="space-y-2">
            <h4 class="font-semibold text-brand-primary">Uploading files:</h4>
            <div class="space-y-1 max-h-40 overflow-y-auto">
              <div 
                v-for="file in uploadingFiles" 
                :key="file.name"
                class="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span class="text-sm text-brand-text-muted truncate">{{ file.name }}</span>
                <span class="text-xs text-brand-highlight">{{ getMagicStatusText(file.status) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between items-center pt-6 border-t border-gray-100">
          <button
            @click="goBack"
            :disabled="isUploading"
            class="px-4 py-2 text-brand-text-muted hover:text-brand-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            v-if="!isUploading && uploadedFiles.length > 0"
            @click="finishUpload"
            class="bg-brand-highlight hover:bg-brand-highlight/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Continue to Photo Selection
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  ssr: false
})

import { useDatabase } from '~/composables/useDatabase'
import { useToast } from 'primevue/usetoast'

// Get route and router
const route = useRoute()
const router = useRouter()

// Get composables
const db = useDatabase()
const toast = useToast()

// State
const fileInput = ref(null)
const isUploading = ref(false)
const uploadingFiles = ref([])
const uploadedFiles = ref([])
const failedFiles = ref([])
const uploadProgress = ref(0)
const uploadStatus = ref('')

// Check if we should show special messaging (from wizard flow)
const showSpecialMessaging = computed(() => {
  return route.query.from === 'wizard'
})

// Check if we should return to wizard after upload
const shouldReturnToWizard = computed(() => {
  return route.query.return === 'wizard'
})

// Handle file selection
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return

  await uploadFiles(files)
}

// Upload files
const uploadFiles = async (files) => {
  isUploading.value = true
  uploadingFiles.value = files.map(file => ({
    name: file.name,
    status: 'pending'
  }))
  uploadedFiles.value = []
  failedFiles.value = []
  uploadProgress.value = 0
  uploadStatus.value = 'Preparing files...'

  try {
    uploadStatus.value = 'Uploading to Savta\'s Drawer...'
    
    // Upload files one by one using the database composable
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileData = uploadingFiles.value.find(f => f.name === file.name)
      
      try {
        // Update progress
        uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
        uploadStatus.value = `Uploading ${file.name}...`
        
        // Update file status to uploading
        if (fileData) fileData.status = 'uploading'
        
        // Upload asset using database composable
        const asset = await db.assets.uploadAsset({
          type: 'photo',
          title: file.name,
          user_caption: '',
          approved: true // Set as approved since it's a direct upload
        }, file)
        
        // Update file status to processing
        if (fileData) fileData.status = 'processing'
        uploadStatus.value = `Processing ${file.name} with AI...`
        
        // Process with AI
        const aiResult = await $fetch('/api/ai/process-asset', {
          method: 'POST',
          body: {
            assetId: asset.id,
            assetType: 'photo',
            storageUrl: asset.storage_url
          }
        })
        
        // Update file status to completed
        if (fileData) fileData.status = 'completed'
        uploadedFiles.value.push(asset)
        
        console.log(`✅ Successfully uploaded and processed: ${file.name}`)
        
      } catch (fileError) {
        console.error(`❌ Failed to upload ${file.name}:`, fileError)
        if (fileData) fileData.status = 'failed'
        failedFiles.value.push({ name: file.name, error: fileError.message })
      }
    }

    uploadStatus.value = 'Upload complete!'

    if (uploadedFiles.value.length > 0) {
      toast.add({
        severity: 'success',
        summary: 'Upload Complete',
        detail: `Successfully uploaded ${uploadedFiles.value.length} favorite photos to Savta's Drawer`,
        life: 3000
      })

      // Auto-advance after a short delay
      setTimeout(() => {
        finishUpload()
      }, 1500)
    } else {
      throw new Error('No files were successfully uploaded')
    }
    
  } catch (error) {
    console.error('Upload error:', error)
    uploadStatus.value = 'Upload failed'
    
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: error.message || 'Please try again',
      life: 5000
    })
  } finally {
    isUploading.value = false
  }
}

// Convert status to magical language
const getMagicStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '🌟 Waiting for file...'
    case 'uploading':
      return '📤 Uploading to collection...'
    case 'processing':
      return '🤔 Processing with AI...'
    case 'completed':
      return '✨ Uploaded, captioned, tags added! ✨'
    case 'failed':
      return '😔 Preparation failed'
    default:
      return status
  }
}

// Finish upload and navigate
const finishUpload = () => {
  // Check if we need to preserve previous selection
  const preserveSelection = route.query.preserveSelection
  const method = route.query.method
  
  let returnUrl = '/app/memory-books/photo-selection?'
  returnUrl += shouldReturnToWizard.value ? 'return=wizard' : 'return=memory-book'
  
  // Preserve the previous selection and method
  if (preserveSelection) {
    returnUrl += `&preserveSelection=${preserveSelection}`
  }
  if (method) {
    returnUrl += `&method=${method}`
  }
  
  router.push(returnUrl)
}

// Go back
const goBack = () => {
  if (shouldReturnToWizard.value) {
    router.push('/app/memory-books')
  } else {
    router.push('/app/memory-books')
  }
}
</script>

<style scoped>
/* Upload dialog styling */
.upload-dialog {
  box-shadow: 0 0 32px 12px #fbbf24, 0 0 48px 24px #a78bfa;
  border: 2px solid #a78bfa;
  background: linear-gradient(135deg, #fef9c3 0%, #f3e8ff 100%);
}
</style>
