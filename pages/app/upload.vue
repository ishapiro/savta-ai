<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex-1 flex items-center gap-2 sm:gap-3">
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-primary">Add Your Favorite Photos</h1>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-brand-info-outline shadow hover:bg-gray-100 transition-colors focus:outline-none flex-shrink-0"
            v-tooltip.top="'How to add favorite photos'"
            @click="showHelpModal = true"
            aria-label="Information about adding favorite photos"
          >
            <i class="pi pi-info text-lg text-brand-info-letter font-bold"></i>
          </button>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button
            class="flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-header text-white font-bold rounded px-6 py-2 shadow transition-all duration-200 w-full sm:w-auto"
            @click="navigateTo('/app/review')"
          >
            <i class="pi pi-list animate-bounce"></i>
            <span class="hidden sm:inline">Review My Photos</span>
            <span class="sm:hidden">Review Photos</span>
          </button>
        </div>
      </div>

      <!-- Upload Progress Dialog -->
      <Dialog
        v-model:visible="showUploadProgressDialog"
        modal
        :closable="false"
        :dismissableMask="false"
        class="w-full max-w-sm rounded-2xl magic-upload-dialog"
      >
        <div class="text-center py-8 px-6">
          <div class="w-20 h-20 bg-gradient-to-br from-brand-flash to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <SavtaIcon icon-class="w-10 h-10" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">🌸 Savta is working her magic! 🌸</h3>
          <p class="text-gray-600 mb-4">Uploading, tagging, and captioning your precious memories...</p>
          
          <div class="bg-white rounded-lg p-4 mb-4 border-2 border-brand-flash/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Progress</span>
              <span class="text-sm font-bold text-brand-flash">{{ completedUploads }} of {{ totalFilesToUpload }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                class="bg-gradient-to-r from-brand-flash to-brand-highlight h-3 rounded-full transition-all duration-500 ease-out"
                :style="{ width: totalFilesToUpload > 0 ? `${(completedUploads / totalFilesToUpload) * 100}%` : '0%' }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 truncate mb-2">{{ currentUploadingFileName }}</p>
            
            <!-- Success/Failure Counts -->
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-3">
                <span class="text-green-600 font-medium">
                  <i class="pi pi-check-circle mr-1"></i>
                  {{ successfulUploads }} success
                </span>
                <span v-if="failedUploads > 0" class="text-red-600 font-medium">
                  <i class="pi pi-times-circle mr-1"></i>
                  {{ failedUploads }} failed
                </span>
              </div>
              <span class="text-gray-500">{{ remainingUploads }} remaining</span>
            </div>
          </div>
          
          <div class="flex items-center justify-center gap-2 text-brand-flash">
            <i class="pi pi-spin pi-spinner text-lg"></i>
            <span class="text-sm font-medium">Processing with love...</span>
          </div>
        </div>
      </Dialog>

      <!-- Oversized Files Warning -->
      <div v-if="oversizedFiles.length > 0" class="mb-6 bg-gradient-to-r from-red-50 to-brand-navigation rounded-lg p-4 sm:p-3 border border-red-200">
        <div class="flex items-center gap-3 sm:gap-2 mb-3 sm:mb-2">
          <i class="pi pi-times-circle text-red-600 text-base sm:text-sm"></i>
          <span class="text-sm font-semibold text-red-800">📁 Photos too large ({{ oversizedFiles.length }} skipped)</span>
        </div>
        <div class="space-y-2 sm:space-y-1">
          <div v-for="file in oversizedFiles" :key="file.name" class="bg-white rounded p-3 sm:p-2 border border-red-100">
            <div class="flex items-center justify-between text-sm sm:text-xs">
              <span class="text-gray-800 truncate flex-1 mr-3 sm:mr-2">{{ file.name }}</span>
              <span class="text-red-600 font-semibold flex-shrink-0">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Tabs (Hidden During Upload) -->
      <div class="mb-6" v-if="uploadingFiles.length === 0">
        <TabView v-model:activeIndex="activeTabIndex" class="w-full" :pt="{ nav: 'flex-col sm:flex-row' }">
          <TabPanel header="📸 Photos">
            <div class="space-y-6">
              <Card>
                <template #title>
                  <h2 class="text-xl font-semibold text-brand-primary">Upload Your Favorite Photos</h2>
                </template>
                <template #content>
                  <!-- Important Note -->
                  <div class="mb-4 bg-gradient-to-r from-brand-highlight/10 to-brand-secondary/10 border border-brand-highlight/30 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 bg-brand-highlight rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i class="pi pi-star text-white text-sm"></i>
                      </div>
                      <div>
                        <h4 class="font-semibold text-brand-secondary mb-1">📸 Upload Only Your Favorites</h4>
                        <p class="text-sm text-brand-primary">
                          Don't upload your entire camera roll! Choose only your favorite photos that you'd want to share with family and friends. 
                          Savta will select the best ones from your favorites to create beautiful memory cards and books.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- File Upload Area -->
                  <div
                    @drop.prevent="handleFileDrop"
                    @dragover.prevent
                    @dragenter.prevent
                    class="border-2 border-dashed border-brand-border rounded-lg p-8 sm:p-6 text-center hover:border-brand-primary transition-colors bg-white shadow"
                    :class="{ 'border-brand-primary bg-brand-primary-50': isDragOver }"
                  >
                    <div class="space-y-6 sm:space-y-4">
                      <div class="text-brand-secondary">
                        <i class="pi pi-image text-5xl sm:text-4xl"></i>
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
                      <p class="text-sm sm:text-xs text-brand-secondary">PNG, JPG, GIF up to 15MB each (files over 5MB will be automatically compressed)</p>
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
                  <form @submit.prevent="submitTextStory" class="space-y-6 sm:space-y-4">
                    <div class="field">
                      <label for="story-title" class="block text-sm font-medium text-brand-primary mb-2 sm:mb-1">
                        Story Title
                      </label>
                      <InputText
                        id="story-title"
                        v-model="textStory.title"
                        placeholder="Enter a title for your story"
                        class="w-full py-3 sm:py-2 text-base"
                        required
                      />
                    </div>

                    <div class="field">
                      <label for="story-content" class="block text-sm font-medium text-brand-primary mb-2 sm:mb-1">
                        Your Story
                      </label>
                      <Textarea
                        id="story-content"
                        v-model="textStory.content"
                        rows="6"
                        placeholder="Share your family story, memory, or moment..."
                        class="w-full py-3 sm:py-2 text-base"
                        required
                      />
                    </div>

                    <div class="field">
                      <label for="story-caption" class="block text-sm font-medium text-brand-primary mb-2 sm:mb-1">
                        Your Caption (Optional)
                      </label>
                      <InputText
                        id="story-caption"
                        v-model="textStory.userCaption"
                        placeholder="Add your own caption or let AI generate one"
                        class="w-full py-3 sm:py-2 text-base"
                      />
                    </div>

                    <div class="flex flex-col sm:flex-row items-center gap-3 sm:space-x-4">
                      <Button
                        type="submit"
                        icon="pi pi-send"
                        :loading="submittingStory"
                        :disabled="!textStory.title || !textStory.content"
                        v-tooltip.top="'Share Story'"
                        class="w-full sm:w-auto min-h-[48px] sm:min-h-0 bg-brand-secondary hover:bg-brand-header text-white border-0 px-8 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg flex items-center justify-center"
                      >
                        <span class="hidden sm:inline ml-1">Share Story</span>
                        <span class="sm:hidden">Share Story</span>
                      </Button>
                      <Button
                        type="button"
                        icon="pi pi-times"
                        v-tooltip.top="'Clear Form'"
                        @click="clearTextStory"
                        class="w-full sm:w-auto min-h-[48px] sm:min-h-0 bg-gray-500 hover:bg-gray-600 text-white border-0 px-8 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg flex items-center justify-center"
                      >
                        <span class="hidden sm:inline ml-1">Clear</span>
                        <span class="sm:hidden">Clear</span>
                      </Button>
                    </div>
                  </form>
                </template>
              </Card>
            </div>
          </TabPanel>
        </TabView>
      </div>



      <!-- Help Modal -->
      <Dialog
        v-model:visible="showHelpModal"
        modal
        :closable="true"
        :dismissableMask="true"
        header="✨ Adding Your Favorite Photos to Savta's Drawer ✨"
        class="w-full max-w-3xl"
      >
        <div class="space-y-6">
          <!-- Welcome Section -->
          <div class="bg-gradient-to-r from-brand-navigation via-brand-accent-light to-blue-50 rounded-2xl p-6 border border-brand-highlight">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-brand-navigation to-brand-accent-light rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-magic text-brand-header text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800 mb-1">Welcome to Savta's Drawer! 🎨</h3>
                <p class="text-gray-600">Upload only your favorite photos (not your entire camera roll). Savta will select the best ones from your favorites to create beautiful memory cards and books!</p>
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
                <h3 class="text-lg font-bold text-gray-800 mb-1">📸 Photos & 📝 Posts</h3>
                <p class="text-gray-600">Choose your special medium! Upload photos or share your family posts - both will be transformed into beautiful memory moments.</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-4 border border-blue-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-image text-blue-500"></i>
                  <span class="font-semibold text-gray-800">Photo Memories</span>
                </div>
                <p class="text-sm text-gray-600">Add your favorite photos from your phone or computer. We'll store them in Savta's Drawer so you can use them to create beautiful memory cards and books anytime.</p>
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
          <div class="bg-gradient-to-r from-brand-navigation to-brand-accent-light rounded-2xl p-6 border border-brand-highlight">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-brand-navigation to-brand-accent-light rounded-full flex items-center justify-center shadow-lg">
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
            <p class="text-gray-600 mb-4">Upload your first photos or post and watch the special moments unfold!</p>
            <button
              class="bg-gradient-to-r from-blue-500 to-brand-secondary hover:from-blue-600 hover:to-brand-secondary text-white font-bold rounded px-8 py-3 text-base shadow-lg transition-all duration-200 transform hover:scale-105"
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
        class="w-full max-w-lg"
        :header="false"
      >
        <div class="text-center p-6">
          <!-- Success Icon -->
          <div v-if="successfulUploads > 0 && failedUploads === 0" class="mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="pi pi-check text-white text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-green-700 mb-2">🎉 Uploads Complete!</h2>
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
              <span v-if="successfulUploads > 0 && !isFromWizard">✨ Your memories are now ready for review and approval!</span>
              <span v-else-if="successfulUploads > 0 && isFromWizard">✨ Great! Your new photos are ready. Now you can go back and try editing your memory again!</span>
            </p>
          </div>

          <!-- Completion Dialog Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
            <Button
              @click="showCompletionDialog = false"
              severity="success"
              size="large"
              icon="pi pi-check"
              label="Got it"
              class="min-w-[120px]"
            />
            <Button
              v-if="successfulUploads > 0 && !isFromWizard"
              @click="navigateTo('/app/review')"
              severity="info"
              size="large"
              icon="pi pi-eye"
              label="Review Photos"
              class="min-w-[160px]"
            />
            <Button
              v-if="successfulUploads > 0 && isFromWizard"
              @click="navigateTo('/app/memory-books')"
              severity="info"
              size="large"
              icon="pi pi-arrow-left"
              label="Back to Books"
              class="min-w-[160px]"
            />
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
            You have uploads currently in progress. 
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
              class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 flex items-center justify-center"
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
import SavtaIcon from '~/components/SavtaIcon.vue'

const router = useRouter()

definePageMeta({
  layout: 'default'
})

const db = useDatabase()
const user = useSupabaseUser()

// Configuration
const MAX_CONCURRENT_UPLOADS = 3 // Limit concurrent uploads to prevent memory issues and app crashes
                                  // Processing 3 files at a time provides good performance while staying within memory limits

// Reactive data
const activeTabIndex = ref(0)
const isDragOver = ref(false)
const uploadingFiles = ref([])
const totalFilesToUpload = ref(0)
const currentFileIndex = ref(0)
const successfulUploads = ref(0)
const failedUploads = ref(0)
const showCompletionDialog = ref(false)
const showUploadProgressDialog = ref(false)
const currentUploadingFileName = ref('')
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

const completedUploads = computed(() => {
  return successfulUploads.value + failedUploads.value
})

// Check if user came from wizard
const isFromWizard = computed(() => {
  const route = useRoute()
  return route.query.from === 'wizard'
})

const remainingUploads = computed(() => {
  return totalFilesToUpload.value - completedUploads.value
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
    if (showUploadProgressDialog.value) {
      pendingNavigation.value = to
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalPush.call(this, to)
  }
  
  // Override router.replace
  originalReplace = router.replace
  router.replace = function(to) {
    if (showUploadProgressDialog.value) {
      pendingNavigation.value = to
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalReplace.call(this, to)
  }
  
  // Override router.go for back/forward navigation
  originalGo = router.go
  router.go = function(delta) {
    if (showUploadProgressDialog.value) {
      pendingNavigation.value = delta > 0 ? 'forward' : 'back'
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalGo.call(this, delta)
  }
  
  // Override router.back specifically
  originalBack = router.back
  router.back = function() {
    if (showUploadProgressDialog.value) {
      pendingNavigation.value = 'back'
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalBack.call(this)
  }
  
  // Override router.forward
  originalForward = router.forward
  router.forward = function() {
    if (showUploadProgressDialog.value) {
      pendingNavigation.value = 'forward'
      showNavigationWarning.value = true
      return Promise.resolve(false)
    }
    return originalForward.call(this)
  }
}

// Enhanced beforeunload handler
const handleBeforeUnload = (event) => {
  if (showUploadProgressDialog.value) {
    event.preventDefault()
    event.returnValue = 'You have uploads in progress. Are you sure you want to leave?'
    return 'You have uploads in progress. Are you sure you want to leave?'
  }
}

// Enhanced popstate handler for browser back/forward buttons
const handlePopstate = (event) => {
  if (showUploadProgressDialog.value) {
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
watch(showUploadProgressDialog, (isUploading) => {
  if (isUploading) {
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
  
  // Show progress dialog if we have files to upload
  if (validFiles.length > 0) {
    showUploadProgressDialog.value = true
  }
  
  // Process files with concurrency limit to prevent memory issues
  
  // Create upload file objects first
  const uploadTasks = validFiles.map((file, index) => {
    const fileId = Date.now() + Math.random() + index
    const uploadFile = {
      id: fileId,
      file,
      name: file.name,
      size: file.size,
      uploading: false,
      processing: false,
      error: null,
      completed: false
    }
    uploadingFiles.value.push(uploadFile)
    return { uploadFile, file }
  })

  // Process files in controlled batches
  const processBatch = async (tasks) => {
    const batchPromises = tasks.map(async ({ uploadFile, file }) => {
      try {
        // Mark as uploading and set current filename
        uploadFile.uploading = true
        currentUploadingFileName.value = file.name
        
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
            storageUrl: asset.storage_url,
            userId: user.value?.id
          }
        })

        uploadFile.processing = false
        uploadFile.completed = true
        successfulUploads.value++
        
        // Keep successful files in the array for display
        await loadRecentAssets()

      } catch (error) {
        uploadFile.error = error.message
        uploadFile.uploading = false
        uploadFile.processing = false
        uploadFile.completed = true
        failedUploads.value++
        
        console.error(`Failed to upload ${file.name}:`, error.message)
        // Keep failed files in the array for display
      }
    })

    await Promise.allSettled(batchPromises)
  }

  // Process files in batches to limit memory usage
  console.log(`🔄 Processing ${uploadTasks.length} files in batches of ${MAX_CONCURRENT_UPLOADS}`)
  
  for (let i = 0; i < uploadTasks.length; i += MAX_CONCURRENT_UPLOADS) {
    const batch = uploadTasks.slice(i, i + MAX_CONCURRENT_UPLOADS)
    const batchNumber = Math.floor(i / MAX_CONCURRENT_UPLOADS) + 1
    const totalBatches = Math.ceil(uploadTasks.length / MAX_CONCURRENT_UPLOADS)
    
    console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)`)
    await processBatch(batch)
    console.log(`✅ Completed batch ${batchNumber}/${totalBatches}`)
  }
  
  console.log(`🎉 All ${uploadTasks.length} files processed!`)
  
  // Hide progress dialog and show completion dialog when all uploads are complete
  showUploadProgressDialog.value = false
  currentUploadingFileName.value = ''
  
  // Clear the uploading files array after showing completion
  setTimeout(() => {
    uploadingFiles.value = []
    totalFilesToUpload.value = 0
    currentFileIndex.value = 0
  }, 1000) // Small delay to show final state
  
  showCompletionDialog.value = true
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
        userCaption: textStory.value.content,
        userId: user.value?.id
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

<style scoped>
/* Magic upload dialog styling to match memory books */
.magic-upload-dialog {
  border-radius: 1rem !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.magic-upload-dialog :deep(.p-dialog-header) {
  display: none !important;
}

.magic-upload-dialog :deep(.p-dialog-content) {
  padding: 0 !important;
  border-radius: 1rem !important;
}
</style> 