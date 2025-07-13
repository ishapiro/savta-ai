<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex-1 flex gap-2">
          <button
            class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-8 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="navigateTo('/app/review')"
          >
            <i class="pi pi-list text-2xl animate-bounce"></i>
            View All Memories
          </button>
          <button
            class="p-3 text-blue-600 hover:text-blue-700 bg-white rounded-full shadow border border-blue-100 transition-colors"
            v-tooltip.top="'How to use this page'"
            @click="showHelpModal = true"
          >
            <i class="pi pi-info-circle text-2xl"></i>
          </button>
        </div>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-color mb-2">Upload Memories</h1>
        <p class="text-color-secondary">Share your family photos and stories. Our AI will help organize and caption them.</p>
      </div>

      <!-- Upload Tabs -->
      <div class="mb-6">
        <TabView v-model:activeIndex="activeTabIndex" class="w-full">
          <TabPanel header="📸 Photos">
            <div class="space-y-6">
              <Card>
                <template #title>
                  <h2 class="text-xl font-semibold text-color">Upload Photos</h2>
                </template>
                <template #content>
                  <!-- File Upload Area -->
                  <div
                    @drop.prevent="handleFileDrop"
                    @dragover.prevent
                    @dragenter.prevent
                    class="border-2 border-dashed border-surface-border rounded-lg p-6 text-center hover:border-primary transition-colors bg-white shadow"
                    :class="{ 'border-primary bg-primary-50': isDragOver }"
                  >
                    <div class="space-y-4">
                      <div class="text-color-secondary">
                        <i class="pi pi-image text-4xl"></i>
                      </div>
                      <div>
                        <label for="photo-upload" class="cursor-pointer">
                          <span class="text-primary hover:text-primary-600 font-medium">Click to upload</span>
                          <span class="text-color-secondary"> or drag and drop</span>
                        </label>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          class="hidden"
                          @change="handleFileSelect"
                        />
                      </div>
                      <p class="text-xs text-color-secondary">PNG, JPG, GIF up to 10MB each</p>
                    </div>
                  </div>

                  <!-- Upload Progress -->
                  <div v-if="uploadingFiles.length > 0" class="mt-6 space-y-3">
                    <h3 class="text-sm font-medium text-color">
                      Uploading and applying magic to {{ currentFileIndex }} of {{ totalFilesToUpload }}
                    </h3>
                    <div v-for="(file, idx) in uploadingFiles" :key="file.id" class="surface-100 rounded-lg p-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <div class="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                            <i class="pi pi-image text-primary text-xs"></i>
                          </div>
                          <div>
                            <p class="text-sm font-medium text-color">{{ file.name }}</p>
                            <p class="text-xs text-color-secondary">{{ file.size }} bytes</p>
                          </div>
                        </div>
                        <div class="flex items-center space-x-2">
                          <div v-if="file.processing" class="text-xs text-info">Magic is happening...</div>
                          <div v-else-if="file.uploading" class="text-xs text-color-secondary">Uploading...</div>
                          <div v-else-if="file.error" class="text-xs text-danger">{{ file.error }}</div>
                          <div v-else class="text-xs text-success">Complete</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </TabPanel>

          <TabPanel header="📝 Stories">
            <div class="space-y-6">
              <Card>
                <template #title>
                  <h2 class="text-xl font-semibold text-color">Share Stories</h2>
                </template>
                <template #content>
                  <form @submit.prevent="submitTextStory" class="space-y-4">
                    <div class="field">
                      <label for="story-title" class="block text-sm font-medium text-color mb-1">
                        Story Title
                      </label>
                      <InputText
                        id="story-title"
                        v-model="textStory.title"
                        placeholder="Enter a title for your story"
                        class="w-full"
                        required
                      />
                    </div>

                    <div class="field">
                      <label for="story-content" class="block text-sm font-medium text-color mb-1">
                        Your Story
                      </label>
                      <Textarea
                        id="story-content"
                        v-model="textStory.content"
                        rows="6"
                        placeholder="Share your family story, memory, or moment..."
                        class="w-full"
                        required
                      />
                    </div>

                    <div class="field">
                      <label for="story-caption" class="block text-sm font-medium text-color mb-1">
                        Your Caption (Optional)
                      </label>
                      <InputText
                        id="story-caption"
                        v-model="textStory.userCaption"
                        placeholder="Add your own caption or let AI generate one"
                        class="w-full"
                      />
                    </div>

                    <div class="flex items-center space-x-4">
                      <Button
                        type="submit"
                        icon="pi pi-send"
                        :loading="submittingStory"
                        :disabled="!textStory.title || !textStory.content"
                        v-tooltip.top="'Share Story'"
                      >
                        <span class="hidden sm:inline ml-1">Share Story</span>
                      </Button>
                      <Button
                        type="button"
                        icon="pi pi-times"
                        severity="secondary"
                        v-tooltip.top="'Clear Form'"
                        @click="clearTextStory"
                      >
                        <span class="hidden sm:inline ml-1">Clear</span>
                      </Button>
                    </div>
                  </form>
                </template>
              </Card>
            </div>
          </TabPanel>
        </TabView>
      </div>

      <!-- Recent Uploads -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-color mb-4">Recent Uploads</h2>
        <p class="text-sm text-color-secondary mb-4">
          Showing your 25 most recent uploads. Visit the Review page to see all your memories and manage them.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <Card
            v-for="asset in recentAssets"
            :key="asset.id"
            class="bg-white rounded-2xl shadow-xl p-0 flex flex-col justify-between hover:shadow-2xl transition-shadow border border-gray-100 text-xs"
          >
            <template #content>
              <!-- Photo -->
              <div class="rounded-t-2xl overflow-hidden bg-gray-100">
                <div class="w-full h-40 flex items-center justify-center">
                <img
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || 'Family photo'"
                    class="max-w-full max-h-full object-contain"
                />
                  <i v-else class="pi pi-image text-2xl text-gray-400"></i>
                </div>
              </div>
              <div class="flex-1 flex flex-col p-2">
                <!-- User Caption -->
                <div class="mb-1">
                  <label class="block text-xs font-semibold text-color mb-1">Your Caption</label>
                  <InputText
                    v-model="asset.user_caption"
                    placeholder="Add your caption"
                    class="w-full text-xs rounded"
                    @blur="updateAssetCaption(asset.id, asset.user_caption)"
                  />
                </div>
                <!-- AI Caption -->
                <div v-if="asset.ai_caption" class="mb-1">
                  <label class="block text-xs font-semibold text-color mb-1">AI Caption</label>
                  <div class="italic text-xs text-color-secondary bg-slate-50 rounded p-1">"{{ asset.ai_caption }}"</div>
                </div>
                <!-- Tags -->
                <div v-if="asset.tags && asset.tags.length > 0" class="mb-1">
                  <label class="block text-xs font-semibold text-color mb-1">Tags</label>
                  <div class="flex flex-wrap gap-1">
                    <Chip
                      v-for="tag in asset.tags"
                      :key="tag"
                      :label="tag"
                      class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5"
                    />
                  </div>
                </div>
                <!-- People Detected -->
                <div v-if="asset.people_detected && asset.people_detected.length > 0" class="mb-1">
                  <label class="block text-xs font-semibold text-color mb-1">People/Objects</label>
                  <div class="flex flex-wrap gap-1">
                    <Chip
                      v-for="person in asset.people_detected"
                      :key="person"
                      :label="person"
                      class="text-xs bg-pink-100 text-pink-700 px-2 py-0.5"
                    />
                  </div>
                </div>
              </div>
              <!-- Action Bar -->
              <div class="rounded-b-2xl bg-gradient-to-r from-blue-100 via-pink-100 to-purple-100 px-4 py-3 flex items-center justify-center gap-4 border-t border-gray-200">
                <span class="inline-block px-3 py-1 rounded-full bg-orange-200 text-orange-800 font-semibold text-xs shadow">{{ asset.approved ? 'Approved' : 'Pending' }}</span>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Help Modal -->
      <Dialog
        v-model:visible="showHelpModal"
        modal
        :closable="true"
        :dismissableMask="true"
        header="How to Use the Upload Page"
        class="w-full max-w-2xl"
      >
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-color mb-3">Overview</h3>
            <p class="text-color-secondary">
              Use this page to upload new photos and stories. Recent uploads are shown below. To manage or approve your memories, go to the Review page.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-color mb-3">What does "Pending" mean?</h3>
            <p class="text-color-secondary">
              <b>Pending</b> means your memory is waiting for your review and approval before it can be included in a memory book. You can approve, edit, or delete pending memories on the Review page.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-color mb-3">Recent Uploads</h3>
            <p class="text-color-secondary">
              Recent uploads are displayed as cards. Each card shows your caption, AI-generated caption, tags, and people/objects detected. The status badge shows if the memory is approved or pending review.
            </p>
          </div>
          <div class="surface-100 rounded p-4">
            <h3 class="text-lg font-semibold text-color mb-2">💡 Tips</h3>
            <ul class="space-y-1 text-sm text-color-secondary">
              <li>• Click "View All Memories" to manage and approve your uploads</li>
              <li>• Only approved memories appear in memory books</li>
              <li>• Use the Review page to edit captions, approve, or delete memories</li>
            </ul>
          </div>
        </div>
      </Dialog>

      <!-- Upload Completion Dialog -->
      <Dialog
        v-model:visible="showCompletionDialog"
        modal
        :closable="false"
        :dismissableMask="true"
        class="w-full max-w-md"
        :header="false"
      >
        <div class="text-center p-6">
          <!-- Success Icon -->
          <div v-if="successfulUploads > 0 && failedUploads === 0" class="mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="pi pi-check text-white text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-green-700 mb-2">🎉 Magic Complete!</h2>
            <p class="text-lg text-green-600 mb-4">
              We uploaded and worked our magic on <span class="font-bold">{{ successfulUploads }}</span> 
              <span v-if="successfulUploads === 1">memory</span>
              <span v-else>memories</span>!
            </p>
          </div>

          <!-- Mixed Results -->
          <div v-else-if="successfulUploads > 0 && failedUploads > 0" class="mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="pi pi-exclamation-triangle text-white text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-orange-700 mb-2">✨ Partially Complete!</h2>
            <p class="text-lg text-orange-600 mb-2">
              We uploaded and worked our magic on <span class="font-bold">{{ successfulUploads }}</span> 
              <span v-if="successfulUploads === 1">memory</span>
              <span v-else>memories</span>!
            </p>
            <p class="text-sm text-orange-500">
              Unfortunately, we could not process <span class="font-bold">{{ failedUploads }}</span> 
              <span v-if="failedUploads === 1">memory</span>
              <span v-else>memories</span>.
            </p>
          </div>

          <!-- All Failed -->
          <div v-else-if="successfulUploads === 0 && failedUploads > 0" class="mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="pi pi-times text-white text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-red-700 mb-2">😔 Upload Issues</h2>
            <p class="text-lg text-red-600 mb-4">
              Unfortunately, we could not process <span class="font-bold">{{ failedUploads }}</span> 
              <span v-if="failedUploads === 1">memory</span>
              <span v-else>memories</span>.
            </p>
          </div>

          <!-- Fun Message -->
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <p class="text-sm text-gray-600">
              <span v-if="successfulUploads > 0">✨ Your memories are now ready for review and approval!</span>
              <span v-else>💡 Try uploading smaller files or check your internet connection.</span>
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 justify-center">
            <Button
              @click="showCompletionDialog = false"
              class="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <i class="pi pi-check mr-2"></i>
              Got it!
            </Button>
            <Button
              v-if="successfulUploads > 0"
              @click="navigateTo('/app/review')"
              severity="secondary"
              class="px-6 py-3 rounded-full font-semibold"
            >
              <i class="pi pi-eye mr-2"></i>
              Review Memories
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
import { ref } from 'vue'

definePageMeta({
  layout: 'default'
})

const db = useDatabase()

// Reactive data
const activeTabIndex = ref(0)
const isDragOver = ref(false)
const uploadingFiles = ref([])
const totalFilesToUpload = ref(0)
const currentFileIndex = ref(0)
const successfulUploads = ref(0)
const failedUploads = ref(0)
const showCompletionDialog = ref(false)
const recentAssets = ref([])
const submittingStory = ref(false)
const showHelpModal = ref(false)

// Text story form
const textStory = ref({
  title: '',
  content: '',
  userCaption: ''
})

// Load recent assets
onMounted(async () => {
  await loadRecentAssets()
})

// Load recent assets
const loadRecentAssets = async () => {
  try {
    const assets = await db.assets.getAssets({ limit: 25 })
    recentAssets.value = assets
  } catch (error) {
    console.error('Failed to load recent assets:', error)
  }
}

// Handle file selection
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  uploadFiles(files)
}

// Handle file drop
const handleFileDrop = (event) => {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'))
  uploadFiles(files)
}

// Upload files
const uploadFiles = async (files) => {
  // Set total files to upload
  totalFilesToUpload.value = files.length
  currentFileIndex.value = 0
  successfulUploads.value = 0
  failedUploads.value = 0
  
  for (const file of files) {
    currentFileIndex.value++
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      console.error(`${file.name} is too large. Maximum size is 10MB.`)
      continue
    }

    const fileId = Date.now() + Math.random()
    const uploadFile = {
      id: fileId,
      file,
      name: file.name,
      size: file.size,
      uploading: true,
      processing: false,
      error: null
    }

    uploadingFiles.value.push(uploadFile)

    try {
      // Upload asset
      const asset = await db.assets.uploadAsset({
        type: 'photo',
        user_caption: file.name
      }, file)

      uploadFile.uploading = false
      uploadFile.processing = true

      // Process with AI
      await $fetch('/api/ai/process-asset', {
        method: 'POST',
        body: {
          assetId: asset.id,
          assetType: 'photo',
          storageUrl: asset.storage_url
        }
      })

      uploadFile.processing = false
      successfulUploads.value++
      
      // Remove file from uploadingFiles immediately
      uploadingFiles.value = uploadingFiles.value.filter(f => f.id !== uploadFile.id)
      await loadRecentAssets()

    } catch (error) {
      uploadFile.error = error.message
      uploadFile.uploading = false
      uploadFile.processing = false
      failedUploads.value++
      
      console.error(`Failed to upload ${file.name}:`, error.message)
      // Remove file from uploadingFiles immediately on error
      uploadingFiles.value = uploadingFiles.value.filter(f => f.id !== uploadFile.id)
    }
  }
  
  // Reset total files when all uploads are complete
  if (uploadingFiles.value.length === 0) {
    totalFilesToUpload.value = 0
    currentFileIndex.value = 0
    showCompletionDialog.value = true
  }
}

// Submit text story
const submitTextStory = async () => {
  if (!textStory.value.title || !textStory.value.content) return

  submittingStory.value = true

  try {
    // Upload text asset
    const asset = await db.assets.uploadAsset({
      type: 'text',
      user_caption: textStory.value.title,
      content: textStory.value.content
    })

    // Process with AI
    await $fetch('/api/ai/process-asset', {
      method: 'POST',
      body: {
        assetId: asset.id,
        assetType: 'text',
        userCaption: textStory.value.content
      }
    })

    // Clear form and reload assets
    clearTextStory()
    await loadRecentAssets()

  } catch (error) {
    console.error('Failed to upload your story:', error)
  } finally {
    submittingStory.value = false
  }
}

// Clear text story form
const clearTextStory = () => {
  textStory.value = {
    title: '',
    content: '',
    userCaption: ''
  }
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Unknown date'
  }
}
</script> 