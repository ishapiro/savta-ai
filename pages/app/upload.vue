<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex-1 flex items-center gap-2 sm:gap-3">
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-primary">Upload Moments (Photo and Posts)</h1>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-brand-background transition-colors focus:outline-none flex-shrink-0"
            v-tooltip.top="'How to use this page'"
            @click="showHelpModal = true"
            aria-label="Information about upload page"
          >
            <i class="pi pi-info text-lg text-brand-highlight"></i>
          </button>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button
            class="flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-header text-white font-bold rounded-full px-4 sm:px-8 py-3 text-sm sm:text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="navigateTo('/app/review')"
          >
            <i class="pi pi-list text-lg sm:text-2xl animate-bounce"></i>
            <span class="hidden sm:inline">View All Uploads</span>
            <span class="sm:hidden">View All</span>
          </button>
        </div>
      </div>

      <!-- Upload Progress (Always Visible When Uploading) -->
      <div v-if="uploadingFiles.length > 0" class="mb-6 space-y-3">
        <!-- Upload Warning -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-triangle text-amber-600 text-sm"></i>
            <span class="text-sm font-semibold text-amber-800">⚠️ Please stay on this page until uploads complete</span>
          </div>
        </div>

        <!-- Oversized Files Warning -->
        <div v-if="oversizedFiles.length > 0" class="bg-gradient-to-r from-red-50 to-brand-navigation rounded-lg p-3 border border-red-200">
          <div class="flex items-center gap-2 mb-2">
            <i class="pi pi-times-circle text-red-600 text-sm"></i>
            <span class="text-sm font-semibold text-red-800">📁 Files too large ({{ oversizedFiles.length }} skipped)</span>
          </div>
          <div class="space-y-1">
            <div v-for="file in oversizedFiles" :key="file.name" class="bg-white rounded p-2 border border-red-100">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-800 truncate flex-1 mr-2">{{ file.name }}</span>
                <span class="text-red-600 font-semibold flex-shrink-0">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Progress Bar -->
        <div class="bg-gradient-to-r from-blue-50 to-brand-navigation rounded-lg p-3 border border-blue-200">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <i class="pi pi-cloud-upload text-blue-500 text-sm"></i>
              <span class="text-sm font-semibold text-gray-800">{{ currentFileIndex }}/{{ totalFilesToUpload }} files</span>
            </div>
            <span class="text-sm font-medium text-gray-600">{{ Math.round(overallProgress) }}%</span>
          </div>
          
          <!-- Overall Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              class="bg-gradient-to-r from-blue-500 to-brand-secondary h-2 rounded-full transition-all duration-300 ease-out"
              :style="{ width: overallProgress + '%' }"
            ></div>
          </div>
          
          <!-- Progress Stats -->
          <div class="flex justify-between text-xs text-gray-600">
            <span>{{ successfulUploads }} done</span>
            <span>{{ uploadingFiles.length }} uploading</span>
            <span>{{ failedUploads }} failed</span>
          </div>
        </div>

        <!-- Individual File Progress -->
        <div class="space-y-2">
          <div v-for="(file, idx) in uploadingFiles" :key="file.id" class="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <i class="pi pi-image text-blue-600 text-sm"></i>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <!-- Status Icon -->
                <div v-if="file.processing" class="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i class="pi pi-spin pi-spinner text-yellow-600 text-xs"></i>
                </div>
                <div v-else-if="file.uploading" class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <i class="pi pi-spin pi-spinner text-blue-600 text-xs"></i>
                </div>
                <div v-else-if="file.error" class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <i class="pi pi-times text-red-600 text-xs"></i>
                </div>
                <div v-else class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <i class="pi pi-check text-green-600 text-xs"></i>
                </div>
                
                <!-- Status Text -->
                <span class="text-xs font-medium">
                  <span v-if="file.processing" class="text-yellow-600">Processing</span>
                  <span v-else-if="file.uploading" class="text-blue-600">Uploading</span>
                  <span v-else-if="file.error" class="text-red-600">Failed</span>
                  <span v-else class="text-green-600">Done</span>
                </span>
              </div>
            </div>
            
            <!-- File Progress Bar -->
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                class="h-1.5 rounded-full transition-all duration-300 ease-out"
                :class="{
                  'bg-gradient-to-r from-blue-500 to-blue-600': file.uploading,
                  'bg-gradient-to-r from-yellow-500 to-orange-500': file.processing,
                  'bg-gradient-to-r from-green-500 to-green-600': !file.uploading && !file.processing && !file.error,
                  'bg-gradient-to-r from-red-500 to-red-600': file.error
                }"
                :style="{ width: getFileProgress(file) + '%' }"
              ></div>
            </div>
            
            <!-- Error Message -->
            <div v-if="file.error" class="mt-1 text-xs text-red-600 bg-red-50 rounded p-1">
              <i class="pi pi-exclamation-triangle mr-1"></i>
              {{ file.error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Tabs (Hidden During Upload) -->
      <div class="mb-6" v-if="uploadingFiles.length === 0">
        <TabView v-model:activeIndex="activeTabIndex" class="w-full">
          <TabPanel header="📸 Photos">
            <div class="space-y-6">
              <Card>
                <template #title>
                  <h2 class="text-xl font-semibold text-brand-primary">Upload Photos</h2>
                </template>
                <template #content>
                  <!-- File Upload Area -->
                  <div
                    @drop.prevent="handleFileDrop"
                    @dragover.prevent
                    @dragenter.prevent
                    class="border-2 border-dashed border-brand-border rounded-lg p-6 text-center hover:border-brand-primary transition-colors bg-white shadow"
                    :class="{ 'border-brand-primary bg-brand-primary-50': isDragOver }"
                  >
                    <div class="space-y-4">
                      <div class="text-brand-secondary">
                        <i class="pi pi-image text-4xl"></i>
                      </div>
                      <div>
                        <label for="photo-upload" class="cursor-pointer">
                          <span class="text-brand-primary hover:text-brand-primary-600 font-medium">Click to upload</span>
                          <span class="text-brand-secondary"> or drag and drop</span>
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
                      <p class="text-xs text-brand-secondary">PNG, JPG, GIF up to 15MB each (files over 5MB will be automatically compressed)</p>
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
                  <h2 class="text-xl font-semibold text-brand-primary">Share Stories</h2>
                </template>
                <template #content>
                  <form @submit.prevent="submitTextStory" class="space-y-4">
                    <div class="field">
                      <label for="story-title" class="block text-sm font-medium text-brand-primary mb-1">
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
                      <label for="story-content" class="block text-sm font-medium text-brand-primary mb-1">
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
                      <label for="story-caption" class="block text-sm font-medium text-brand-primary mb-1">
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
        <h2 class="text-xl font-semibold text-brand-primary mb-4">Recent Uploads</h2>
        
        <!-- Review Button Section -->
        <div class="bg-gradient-to-r from-brand-navigation via-brand-warm to-blue-50 rounded-2xl p-6 mb-6 border border-brand-highlight shadow-lg">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-brand-navigation to-brand-warm rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-heart text-brand-secondary text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">✨ Manage Your Special Moments</h3>
                <p class="text-sm text-gray-600">Use review to manage and edit your moments</p>
              </div>
            </div>
            <button
              class="bg-gradient-to-r from-brand-secondary to-purple-500 hover:from-brand-secondary hover:to-purple-600 text-white font-bold rounded-full px-8 py-3 text-base shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              @click="navigateTo('/app/review')"
            >
              <i class="pi pi-list text-lg"></i>
              <span>Review</span>
            </button>
          </div>
        </div>
        
        <p class="text-sm text-gray-600 mb-4">
          Showing your 10 most recent uploads. Visit the Review page to see all your memories and manage them.
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
              <!-- Action Bar -->
              <div class="rounded-b-2xl bg-brand-navigation px-4 py-3 flex items-center justify-center gap-4 border-t border-gray-200">
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
        header="✨ Your Special Upload Guide ✨"
        class="w-full max-w-3xl"
      >
        <div class="space-y-6">
          <!-- Welcome Section -->
          <div class="bg-gradient-to-r from-brand-navigation via-brand-warm to-blue-50 rounded-2xl p-6 border border-brand-highlight">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-brand-navigation to-brand-warm rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-magic text-brand-header text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800 mb-1">Welcome to Your Memory Workshop! 🎨</h3>
                <p class="text-gray-600">This is where the special moments begin - upload your precious memories and watch them transform into beautiful family stories!</p>
              </div>
            </div>
          </div>

          <!-- Upload Tabs Section -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-images text-blue-600 text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">📸 Photos & 📝 Stories</h3>
                <p class="text-gray-600">Choose your special medium! Upload photos or share your family stories - both will be transformed into beautiful memory moments.</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-4 border border-blue-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-image text-blue-500"></i>
                  <span class="font-semibold text-gray-800">Photo Memories</span>
                </div>
                <p class="text-sm text-gray-600">Drag & drop or click to upload your family photos. Our AI will add captions and detect people!</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-blue-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-file-edit text-indigo-500"></i>
                  <span class="font-semibold text-gray-800">Family Stories</span>
                </div>
                <p class="text-sm text-gray-600">Share your family stories and memories. Add a title and let the special moments happen!</p>
              </div>
            </div>
          </div>

          <!-- Status Section -->
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-clock text-amber-600 text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">🔮 What Does "Pending" Mean?</h3>
                <p class="text-gray-600">Your memory moment is waiting for your special approval! Think of it as a precious moment that needs your final blessing before it can join your memory books.</p>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-amber-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <i class="pi pi-star text-amber-600 text-sm"></i>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">✨ Only approved moments can be included in your special memory books!</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Uploads Section -->
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-heart text-green-600 text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">💫 Your Recent Special Moments</h3>
                <p class="text-gray-600">See your latest uploads displayed as beautiful cards! Each card shows your captions, AI-generated memories, tags, and detected people.</p>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-green-100">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 class="font-semibold text-gray-800 mb-2">🎯 What You'll See:</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Your personal captions</li>
                    <li>• AI-generated special descriptions</li>
                    <li>• Smart tags and people detection</li>
                    <li>• Approval status badges</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-800 mb-2">✨ Quick Actions:</h4>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• Edit captions directly</li>
                    <li>• View AI-generated content</li>
                    <li>• See detected people/objects</li>
                    <li>• Check approval status</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Tips Section -->
          <div class="bg-gradient-to-r from-brand-navigation to-brand-warm rounded-2xl p-6 border border-brand-highlight">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-brand-navigation to-brand-warm rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-lightbulb text-brand-secondary text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">🌟 Special Tips & Tricks</h3>
                <p class="text-gray-600">Unlock the full potential of your memory workshop with these helpful tips!</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-4 border border-pink-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-list text-brand-secondary"></i>
                  <span class="font-semibold text-gray-800">Review & Manage</span>
                </div>
                <p class="text-sm text-gray-600">Click "View All Uploads" to access your complete collection and manage all your special memories!</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-pink-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-check-circle text-brand-header"></i>
                  <span class="font-semibold text-gray-800">Approval Process</span>
                </div>
                <p class="text-sm text-gray-600">Only approved moments can be included in your beautiful special memory books!</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-pink-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-edit text-brand-secondary"></i>
                  <span class="font-semibold text-gray-800">Edit & Refine</span>
                </div>
                <p class="text-sm text-gray-600">Use the Review page to edit captions, approve, or delete moments with ease!</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-pink-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-book text-brand-header"></i>
                  <span class="font-semibold text-gray-800">Memory Books</span>
                </div>
                <p class="text-sm text-gray-600">Create beautiful memory books from your approved moments - the ultimate special collection!</p>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="bg-gradient-to-r from-blue-50 to-brand-navigation rounded-2xl p-6 border border-brand-highlight text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-brand-navigation rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <i class="pi pi-rocket text-blue-600 text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">🚀 Ready to Start Your Special Journey?</h3>
            <p class="text-gray-600 mb-4">Upload your first moment (photo or post) and watch the special moments unfold!</p>
            <button
              class="bg-gradient-to-r from-blue-500 to-brand-secondary hover:from-blue-600 hover:to-brand-secondary text-white font-bold rounded-full px-8 py-3 text-base shadow-lg transition-all duration-200 transform hover:scale-105"
              @click="showHelpModal = false"
            >
              <i class="pi pi-check mr-2"></i>
              Let's Get Started!
            </button>
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
            <h2 class="text-2xl font-bold text-green-700 mb-2">🎉 Special Moments Complete!</h2>
            <p class="text-lg text-green-600 mb-4">
              We uploaded and created special moments from <span class="font-bold">{{ successfulUploads }}</span> 
              <span v-if="successfulUploads === 1">&nbsp; memory</span>
              <span v-else>&nbsp; memories</span>!
            </p>
          </div>

          <!-- Mixed Results -->
          <div v-else-if="successfulUploads > 0 && failedUploads > 0" class="mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="pi pi-exclamation-triangle text-white text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-orange-700 mb-2">✨ Partially Complete!</h2>
            <p class="text-lg text-orange-600 mb-2">
              We uploaded and created special moments from <span class="font-bold">{{ successfulUploads }} &nbsp;</span> 
              <span v-if="successfulUploads === 1">&nbsp; moment</span>
              <span v-else>&nbsp; moments</span>!
            </p>
            <p class="text-sm text-orange-500">
              Unfortunately, we could not process <span class="font-bold">{{ failedUploads }} &nbsp;</span> 
              <span v-if="failedUploads === 1">&nbsp; moments</span>
              <span v-else>&nbsp; moments</span>.
            </p>
          </div>

          <!-- All Failed -->
          <div v-else-if="successfulUploads === 0 && failedUploads > 0" class="mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="pi pi-times text-white text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-red-700 mb-2">😔 Upload Issues</h2>
            <p class="text-lg text-red-600 mb-4">
              Unfortunately, we could not process <span class="font-bold">{{ failedUploads }} &nbsp;</span> 
              <span v-if="failedUploads === 1">&nbsp;   moment</span>
              <span v-else>&nbsp; moments</span>.
            </p>
          </div>

          <!-- Fun Message -->
          <div class="bg-gradient-to-r from-blue-50 to-brand-navigation rounded-lg p-4 mb-6">
            <p class="text-sm text-gray-600">
              <span v-if="successfulUploads > 0">✨ Your memories are now ready for review and approval!</span>
            </p>
          </div>

          <!-- Completion Dialog Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              @click="showCompletionDialog = false"
              class="bg-brand-dialog-save text-white border-0 px-8 py-3 rounded-full font-semibold hover:bg-brand-header/80 transition-all duration-200 shadow-lg whitespace-nowrap flex items-center justify-center"
            >
              <i class="pi pi-check mr-2"></i>
              <span class="pr-2">Got it!</span>
            </Button>
            <Button
              v-if="successfulUploads > 0"
              @click="navigateTo('/app/review')"
              class="bg-brand-dialog-edit text-white border-0 px-8 py-3 rounded-full font-semibold hover:bg-brand-secondary/80 transition-all duration-200 whitespace-nowrap flex items-center justify-center"
            >
              <i class="pi pi-eye mr-2"></i>
              <span class="hidden sm:inline pr-2">Review Moments</span>
              <span class="sm:hidden pr-2">Review</span>
            </Button>
          </div>
        </div>
      </Dialog>

      <!-- Navigation Warning Dialog -->
      <Dialog
        v-model:visible="showNavigationWarning"
        modal
        :closable="false"
        :dismissableMask="false"
        class="w-full max-w-md"
        header="⚠️ Uploads in Progress"
      >
        <div class="text-center p-6">
          <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i class="pi pi-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">Uploads in Progress</h3>
          <p class="text-gray-600 mb-6">
            You have {{ uploadingFiles.length }} file(s) currently uploading. 
            If you leave now, your uploads will be canceled and you'll lose your progress.
          </p>
          
          <!-- Navigation Warning Dialog Action Buttons -->
          <div class="flex gap-3 justify-center">
            <Button
              @click="confirmNavigation"
              class="bg-brand-dialog-delete text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-dialog-delete/80 flex items-center justify-center"
            >
              <i class="pi pi-times mr-2"></i>
              Leave Anyway
            </Button>
            <Button
              @click="cancelNavigation"
              class="bg-brand-dialog-cancel text-white px-6 py-3 rounded-full font-semibold hover:bg-brand-dialog-cancel/80 flex items-center justify-center"
            >
              <i class="pi pi-check mr-2"></i>
              Stay Here
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'

const router = useRouter()

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
const showNavigationWarning = ref(false)
const pendingNavigation = ref(null)
const oversizedFiles = ref([])

// Text story form
const textStory = ref({
  title: '',
  content: '',
  userCaption: '' // Initially blank caption
})

// Computed properties for progress tracking
const overallProgress = computed(() => {
  if (totalFilesToUpload.value === 0) return 0
  
  const completed = successfulUploads.value + failedUploads.value
  return (completed / totalFilesToUpload.value) * 100
})

// Helper function to get individual file progress
const getFileProgress = (file) => {
  if (file.error) return 100 // Show full bar for failed files
  if (!file.uploading && !file.processing) return 100 // Show full bar for completed files
  if (file.uploading) return 50 // Show 50% during upload
  if (file.processing) return 75 // Show 75% during processing
  return 0
}

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Load recent assets
onMounted(async () => {
  await loadRecentAssets()
})

// Navigation handling functions
const confirmNavigation = () => {
  showNavigationWarning.value = false
  if (pendingNavigation.value) {
    if (pendingNavigation.value === 'back') {
      originalBack.call(router)
    } else if (pendingNavigation.value === 'forward') {
      originalForward.call(router)
    } else {
      navigateTo(pendingNavigation.value)
    }
    pendingNavigation.value = null
  }
}

const cancelNavigation = () => {
  showNavigationWarning.value = false
  pendingNavigation.value = null
}

// Store original router methods for restoration
let originalPush = null
let originalReplace = null
let originalGo = null
let originalBack = null
let originalForward = null

// Enhanced navigation protection
const setupNavigationProtection = () => {
  // Override router.push
  originalPush = router.push
  router.push = function(to) {
    if (uploadingFiles.value.length > 0) {
      pendingNavigation.value = to
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalPush.call(this, to)
  }
  
  // Override router.replace
  originalReplace = router.replace
  router.replace = function(to) {
    if (uploadingFiles.value.length > 0) {
      pendingNavigation.value = to
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalReplace.call(this, to)
  }
  
  // Override router.go for back/forward navigation
  originalGo = router.go
  router.go = function(delta) {
    if (uploadingFiles.value.length > 0) {
      pendingNavigation.value = delta > 0 ? 'forward' : 'back'
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalGo.call(this, delta)
  }
  
  // Override router.back specifically
  originalBack = router.back
  router.back = function() {
    if (uploadingFiles.value.length > 0) {
      pendingNavigation.value = 'back'
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalBack.call(this)
  }
  
  // Override router.forward
  originalForward = router.forward
  router.forward = function() {
    if (uploadingFiles.value.length > 0) {
      pendingNavigation.value = 'forward'
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalForward.call(this)
  }
}

// Enhanced beforeunload handler
const handleBeforeUnload = (event) => {
  if (uploadingFiles.value.length > 0) {
    event.preventDefault()
    event.returnValue = 'You have uploads in progress. Are you sure you want to leave?'
    return 'You have uploads in progress. Are you sure you want to leave?'
  }
}

// Enhanced popstate handler for browser back/forward buttons
const handlePopstate = (event) => {
  if (uploadingFiles.value.length > 0) {
    // Prevent the navigation
    event.preventDefault()
    
    // Show our custom warning dialog
    pendingNavigation.value = 'back'
    showNavigationWarning.value = true
    
    // Push the current state back to prevent navigation
    window.history.pushState(null, '', window.location.href)
    
    return false
  }
}

// Add page-level route guard
onMounted(() => {
  setupNavigationProtection()
  
  // Add popstate listener for browser back/forward buttons
  window.addEventListener('popstate', handlePopstate)
  
  // Push current state to history to enable popstate detection
  window.history.pushState(null, '', window.location.href)
})

// Navigation guard to warn users about leaving during uploads
onBeforeUnmount(() => {
  // Remove all event listeners when component is unmounted
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('popstate', handlePopstate)
  
  // Restore all original router methods
  if (originalPush) router.push = originalPush
  if (originalReplace) router.replace = originalReplace
  if (originalGo) router.go = originalGo
  if (originalBack) router.back = originalBack
  if (originalForward) router.forward = originalForward
})

// Watch for uploads and add/remove navigation guard
watch(uploadingFiles, (files) => {
  if (files.length > 0) {
    // Add navigation guard when uploads start
    window.addEventListener('beforeunload', handleBeforeUnload)
  } else {
    // Remove navigation guard when uploads complete
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}, { immediate: true })

// Load recent assets
const loadRecentAssets = async () => {
  try {
    const assets = await db.assets.getAssets({ limit: 10 })
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

// Helper function to compress image using Sharp
// Compression is now handled in the useDatabase composable

// Upload files
const uploadFiles = async (files) => {
  // Reset oversized files list
  oversizedFiles.value = []
  
  // Filter out oversized files and collect them
  const validFiles = files.filter(file => {
    if (file.size > 15 * 1024 * 1024) { // 15MB limit
      oversizedFiles.value.push({
        name: file.name,
        size: file.size
      })
      return false
    }
    return true
  })
  
  // Set total files to upload (only valid files)
  totalFilesToUpload.value = validFiles.length
  currentFileIndex.value = 0
  successfulUploads.value = 0
  failedUploads.value = 0
  
  for (const file of validFiles) {
    currentFileIndex.value++

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
      // Upload asset (compression, geocoding, and metadata extraction handled in composable)
      const asset = await db.assets.uploadAsset({
        type: 'photo',
        title: file.name, // Use filename as default title
        user_caption: '' // Initially blank caption
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
    userCaption: '' // Reset to blank caption
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