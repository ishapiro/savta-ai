<template>
  <div class="min-h-screen surface-ground p-4">
    <div class="max-w-4xl mx-auto">
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
                    class="border-2 border-dashed border-surface-border rounded-lg p-6 text-center hover:border-primary transition-colors"
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
                    <h3 class="text-sm font-medium text-color">Uploading...</h3>
                    <div v-for="file in uploadingFiles" :key="file.id" class="surface-100 rounded-lg p-3">
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
                          <div v-if="file.processing" class="text-xs text-info">AI Processing...</div>
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
                        label="Share Story"
                        :loading="submittingStory"
                        :disabled="!textStory.title || !textStory.content"
                      />
                      <Button
                        type="button"
                        label="Clear"
                        severity="secondary"
                        @click="clearTextStory"
                      />
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="asset in recentAssets"
            :key="asset.id"
            class="hover:shadow-md transition-shadow"
          >
            <template #content>
              <!-- Photo Asset -->
              <div v-if="asset.type === 'photo'" class="space-y-3">
                <div class="aspect-w-16 aspect-h-9 surface-100 rounded-lg overflow-hidden">
                  <img
                    v-if="asset.storage_url"
                    :src="asset.storage_url"
                    :alt="asset.user_caption || 'Family photo'"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-color-secondary">
                    <i class="pi pi-image text-2xl"></i>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <p class="text-sm text-color font-medium">
                    {{ asset.user_caption || 'Family photo' }}
                  </p>
                  <p v-if="asset.ai_caption" class="text-xs text-color-secondary italic">
                    "{{ asset.ai_caption }}"
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <Chip
                      v-for="tag in asset.tags"
                      :key="tag"
                      :label="tag"
                      class="text-xs"
                    />
                  </div>
                  <div class="flex items-center justify-between text-xs text-color-secondary">
                    <span>{{ formatDate(asset.created_at) }}</span>
                    <Tag
                      :value="asset.approved ? 'Approved' : 'Pending'"
                      :severity="asset.approved ? 'success' : 'warning'"
                    />
                  </div>
                </div>
              </div>

              <!-- Text Asset -->
              <div v-else class="space-y-3">
                <div class="w-full h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-file-edit text-3xl text-primary"></i>
                </div>
                
                <div class="space-y-2">
                  <p class="text-sm text-color font-medium">
                    {{ asset.user_caption || 'Family story' }}
                  </p>
                  <p v-if="asset.ai_caption" class="text-xs text-color-secondary italic">
                    "{{ asset.ai_caption }}"
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <Chip
                      v-for="tag in asset.tags"
                      :key="tag"
                      :label="tag"
                      class="text-xs"
                    />
                  </div>
                  <div class="flex items-center justify-between text-xs text-color-secondary">
                    <span>{{ formatDate(asset.created_at) }}</span>
                    <Tag
                      :value="asset.approved ? 'Approved' : 'Pending'"
                      :severity="asset.approved ? 'success' : 'warning'"
                    />
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { $toast } = useNuxtApp()
const db = useDatabase()

// Reactive data
const activeTabIndex = ref(0)
const isDragOver = ref(false)
const uploadingFiles = ref([])
const recentAssets = ref([])
const submittingStory = ref(false)

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
    const assets = await db.assets.getAssets({ limit: 6 })
    recentAssets.value = assets
  } catch (error) {
    console.error('Error loading recent assets:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load recent assets',
      life: 3000
    })
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
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      $toast.add({
        severity: 'error',
        summary: 'File Too Large',
        detail: `${file.name} is too large. Maximum size is 10MB.`,
        life: 3000
      })
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
      
      $toast.add({
        severity: 'success',
        summary: 'Upload Complete',
        detail: `${file.name} uploaded and processed successfully`,
        life: 3000
      })

      // Reload recent assets
      await loadRecentAssets()

    } catch (error) {
      console.error('Upload error:', error)
      uploadFile.error = error.message
      uploadFile.uploading = false
      uploadFile.processing = false
      
      $toast.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: `Failed to upload ${file.name}`,
        life: 3000
      })
    }
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
      user_caption: textStory.value.content
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

    $toast.add({
      severity: 'success',
      summary: 'Story Shared',
      detail: 'Your story has been uploaded and processed successfully',
      life: 3000
    })

    // Clear form and reload assets
    clearTextStory()
    await loadRecentAssets()

  } catch (error) {
    console.error('Story submission error:', error)
    $toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: 'Failed to upload your story',
      life: 3000
    })
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