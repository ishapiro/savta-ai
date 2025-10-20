<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    :header="isEditing ? 'Edit Memory Recipe' : 'Create a New Memory Recipe'"
    class="w-[95vw] max-w-4xl memory-book-dialog mt-3"
    :closable="false"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Book Details Section -->
      <div class="bg-gradient-to-r from-brand-highlight/10 to-brand-secondary/10 rounded-lg p-4 border border-brand-highlight/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-book text-brand-secondary"></i>
          Book Details
        </h3>
        <div class="space-y-4">
          <!-- AI Supplemental Prompt -->
          <div>
            <label for="ai_supplemental_prompt" class="block text-sm font-medium text-brand-primary mb-2">
              Tell me about your memory (dates, locations, events, people)
            </label>
            <InputText
              id="ai_supplemental_prompt"
              v-model="form.ai_supplemental_prompt"
              class="w-full"
              placeholder="Enter AI prompt for story creation."
            />
          </div>
          
          <!-- Memory Event -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Optional Memory Event</label>
            <Dropdown
              v-model="form.memoryEvent"
              :options="memoryEventOptions"
              option-label="label"
              option-value="value"
              placeholder="Select event"
              class="w-full"
            />
            <InputText
              v-if="form.memoryEvent === 'custom'"
              v-model="form.customMemoryEvent"
              class="w-full mt-2"
              placeholder="Enter custom event"
            />
          </div>
        </div>
      </div>

      <!-- Layout & Print Section -->
      <div class="bg-gradient-to-r from-brand-header/10 to-brand-highlight/10 rounded-lg p-4 border border-brand-header/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-file-pdf text-brand-header"></i>
          Layout & Print
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Layout Type -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Layout Type</label>
            <Dropdown
              v-model="form.layoutType"
              :options="layoutOptions"
              option-label="label"
              option-value="value"
              placeholder="Select layout"
              class="w-full"
            />
          </div>
          
          <!-- Theme (only show when layout type is 'theme') -->
          <div v-if="form.layoutType === 'theme'">
            <label class="block text-sm font-medium text-brand-primary mb-2">Theme</label>
            <Dropdown
              v-model="form.theme_id"
              :options="themeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select theme"
              class="w-full"
              :loading="loadingThemes"
            />
            <div class="bg-brand-accent/10 rounded-lg p-3 mt-2">
              <div class="flex items-start gap-2">
                <i class="pi pi-info-circle text-brand-accent text-sm mt-0.5" title="Ask Savta"></i>
                <div class="text-xs text-brand-primary/80">
                  <p class="font-medium mb-1">Theme layouts are always single page</p>
                  <p>Each theme has a fixed design with a specific number of photos. The theme determines the layout, size, and photo count automatically.</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Print Size -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Print Size</label>
            <Dropdown
              v-model="form.printSize"
              :options="printSizeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select size"
              class="w-full"
              :disabled="form.layoutType === 'theme'"
            />
            <small v-if="form.layoutType === 'theme'" class="text-brand-primary/70 text-xs mt-1 block">
              Print size is determined by the selected theme
            </small>
          </div>
          
          <!-- Quality -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Quality</label>
            <Dropdown
              v-model="form.quality"
              :options="qualityOptions"
              option-label="label"
              option-value="value"
              placeholder="Select quality"
              class="w-full"
            />
          </div>
          
          <!-- Medium -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Medium</label>
            <Dropdown
              v-model="form.medium"
              :options="mediumOptions"
              option-label="label"
              option-value="value"
              placeholder="Select medium"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Grid & Shape Section -->
      <div v-if="form.layoutType !== 'theme'" class="bg-gradient-to-r from-brand-secondary/10 to-brand-accent/10 rounded-lg p-4 border border-brand-secondary/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-th-large text-brand-secondary"></i>
          Grid & Pages
        </h3>
        <div class="space-y-4">
          <!-- Grid Layout -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Grid Layout</label>
            <Dropdown
              v-model="form.gridLayout"
              :options="gridLayoutOptions"
              option-label="label"
              option-value="value"
              placeholder="Select grid layout"
              class="w-full"
            />
          </div>
          
          <!-- Number of Pages Input -->
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <label class="block text-sm font-medium text-brand-primary">Number of Pages</label>
              <i 
                class="pi pi-info-circle text-brand-secondary text-lg hover:text-brand-highlight transition-colors cursor-help"
                data-savta="pages-info-icon"
                title="Ask Savta"
                @click="showPagesInfoBubble = true"
              ></i>
            </div>
            <div class="flex items-center gap-3">
              <InputNumber
                v-model="form.page_count"
                :min="1"
                :max="maxPagesAllowed"
                :step="1"
                placeholder="Enter number of pages"
                class="w-full"
                :pt="{
                  input: 'text-center'
                }"
              />
            </div>
            <div class="text-sm text-brand-primary/70 whitespace-nowrap mt-1">
                (max {{ maxPagesAllowed }} pages supported)
            </div>
            <div class="bg-brand-secondary/10 rounded-lg p-3 mt-2">
              <p class="text-sm font-medium text-brand-primary mb-1">
                Photos needed: <span class="font-bold text-brand-highlight">{{ totalPhotosNeeded }}</span>
              </p>
              <p class="text-xs text-brand-primary/70">
                {{ form.gridLayout }} grid × {{ form.page_count }} page{{ form.page_count > 1 ? 's' : '' }} = {{ totalPhotosNeeded }} photos
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Background and Captions Section -->
      <div class="bg-gradient-to-r from-brand-accent/10 to-brand-header/10 rounded-lg p-4 border border-brand-accent/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-magic text-brand-accent"></i>
          Background and Captions
        </h3>
        <div class="space-y-4">
          <!-- Background Type Selection -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Background Style</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                class="relative cursor-pointer"
                @click="form.backgroundType = 'white'"
              >
                <div
                  class="border-2 rounded-lg p-4 text-center transition-all duration-200 h-full bg-brand-background shadow-md"
                  :class="form.backgroundType === 'white' 
                    ? 'border-brand-highlight bg-brand-highlight/10 shadow-xl scale-105' 
                    : 'border-brand-primary/20 hover:border-brand-accent hover:bg-brand-accent/10 hover:shadow-lg'"
                >
                  <div class="w-8 h-8 bg-white border-2 border-brand-primary/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <i class="pi pi-file text-brand-primary text-sm"></i>
                  </div>
                  <div class="text-sm font-bold text-brand-primary mb-1">Clean & Simple</div>
                  <div class="text-xs text-brand-primary/70">Pure white background for a classic, elegant look</div>
                  <div v-if="form.backgroundType === 'white'" class="absolute top-2 right-2">
                    <i class="pi pi-check text-brand-highlight text-sm"></i>
                  </div>
                </div>
              </div>
              
              <div
                class="relative cursor-pointer"
                @click="form.backgroundType = 'magical'"
              >
                <div
                  class="border-2 rounded-lg p-4 text-center transition-all duration-200 h-full bg-brand-background shadow-md"
                  :class="form.backgroundType === 'magical' 
                    ? 'border-brand-highlight bg-brand-highlight/10 shadow-xl scale-105' 
                    : 'border-brand-primary/20 hover:border-brand-accent hover:bg-brand-accent/10 hover:shadow-lg'"
                >
                  <div class="w-8 h-8 bg-gradient-to-br from-brand-accent/30 via-brand-secondary/30 to-brand-highlight/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <i class="pi pi-sparkles text-brand-secondary text-sm"></i>
                  </div>
                  <div class="text-sm font-bold text-brand-primary mb-1">Magical Design</div>
                  <div class="text-xs text-brand-primary/70">AI-generated background that matches your theme</div>
                  <div v-if="form.backgroundType === 'magical'" class="absolute top-2 right-2">
                    <i class="pi pi-check text-brand-highlight text-sm"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Background Opacity (only show when magical background is selected) -->
          <div v-if="form.backgroundType === 'magical'" class="bg-white rounded-lg p-4 border border-brand-primary/20">
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-brand-accent/20 to-brand-header/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-sliders-h text-brand-accent text-sm"></i>
                </div>
                <div class="flex-1">
                  <label class="text-sm font-semibold text-brand-primary">Background Opacity</label>
                  <p class="text-xs text-brand-primary/70">Adjust how transparent the background appears</p>
                </div>
                <div class="text-sm font-bold text-brand-primary min-w-[3rem] text-center">
                  {{ form.backgroundOpacity }}%
                </div>
              </div>
              <div class="px-2">
                <Slider
                  v-model="form.backgroundOpacity"
                  :min="10"
                  :max="100"
                  :step="5"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-brand-primary/50 mt-1">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- AI Captions Option -->
          <div class="bg-white rounded-lg p-4 border border-brand-primary/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-header/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-comment text-brand-secondary text-sm"></i>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <Checkbox
                      v-model="form.includeCaptions"
                      :binary="true"
                      input-id="includeCaptions"
                    />
                    <label for="includeCaptions" class="text-sm font-semibold text-brand-primary">Captions</label>
                  </div>
                  <p class="text-xs text-brand-primary/70 mt-1">Include AI or user provided captions with each photo</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Auto Enhance Option -->
          <div class="bg-white rounded-lg p-4 border border-brand-primary/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-brand-accent/20 to-brand-secondary/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-magic text-brand-accent text-sm"></i>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <Checkbox
                      v-model="form.autoEnhance"
                      :binary="true"
                      input-id="autoEnhance"
                    />
                    <label for="autoEnhance" class="text-sm font-semibold text-brand-primary">Auto Enhance</label>
                  </div>
                  <p class="text-xs text-brand-primary/70 mt-1">Automatically enhance photos with brightness, saturation, and sharpness improvements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Photo Selection Section -->
      <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg p-4 border border-brand-secondary/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-images text-brand-secondary"></i>
          Photo Selection
        </h3>
        <div class="space-y-4">
          <!-- Selected Assets Summary -->
          <div class="bg-white rounded-lg p-3 border border-brand-primary/20">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
                  <i class="pi pi-heart text-brand-secondary text-sm"></i>
                </div>
                <div>
                  <p class="text-sm font-medium text-brand-primary">
                    <span v-if="isAiDrivenMethod">
                      Savta is selecting the photos for you
                    </span>
                    <span v-else>
                      {{ selectedAssets.length }} photos selected
                    </span>
                  </p>
                  <p class="text-xs text-brand-primary/70">
                    <span v-if="form.layoutType === 'theme' && selectedThemePhotoCount">
                      Theme will select {{ selectedThemePhotoCount }} photos from your selection.
                    </span>
                    <span v-else-if="form.layoutType === 'theme' && !selectedThemePhotoCount">
                      Please select a theme to see photo count.
                    </span>
                    <span v-else-if="isAiDrivenMethod">
                      <span v-if="photoSelection_method === 'last_100'">
                        Savta will choose from your most recent photos
                      </span>
                      <span v-else-if="photoSelection_method === 'geo_code'">
                        Savta will find photos from {{ photoSelection_selectedLocation?.city || 'your selected location' }}
                      </span>
                      <span v-else-if="photoSelection_method === 'date_range'">
                        Savta will find photos from your selected date range
                      </span>
                      <span v-else-if="photoSelection_method === 'tags'">
                        Savta will find photos with your selected tags
                      </span>
                      <span v-else>
                        Savta will choose the perfect photos for your memory book
                      </span>
                    </span>
                    <span v-else-if="form.layoutType === 'grid' && selectedAssets.length === 0">
                      Need {{ totalPhotosNeeded }} photos for {{ form.page_count }} page{{ form.page_count > 1 ? 's' : '' }}
                    </span>
                    <span v-else-if="form.layoutType === 'grid' && selectedAssets.length > 0">
                      {{ selectedAssets.length }} photos selected for {{ form.page_count }} page{{ form.page_count > 1 ? 's' : '' }}
                    </span>
                    <span v-else-if="selectedAssets.length === 0">
                      No photos selected
                    </span>
                    <span v-else>
                      Will create approximately {{ calculatedPageCount }} pages
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Photo Selection Interface (like wizard) -->
          <div v-if="!photoSelection_loadingAssets" class="bg-white rounded-lg p-4 border border-brand-primary/20">
            <!-- Photo Selection Interface (always show for recreate mode) -->
            <div v-if="props.isRecreateMode">
              <!-- Recreation Mode Options - Match PhotoSelectionInterface width -->
              <div class="w-full max-w-xs mx-auto sm:max-w-md md:max-w-lg lg:max-w-2xl">
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <!-- Keep Same Photos Option -->
                  <div class="relative cursor-pointer group" @click="selectMethod('keep_same')">
                    <div class="bg-white rounded-lg p-4 border-2 transition-all duration-300 hover:border-brand-flash/50 hover:shadow-md h-full flex flex-col"
                      :class="photoSelection_method === 'keep_same' 
                        ? 'border-brand-flash bg-gradient-to-br from-brand-flash/10 to-brand-highlight/10 shadow-lg' 
                        : 'border-gray-200'">
                      <div class="text-center flex flex-col h-full justify-center">
                        <div class="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-3">
                          <i class="pi pi-refresh text-white text-xl"></i>
                        </div>
                        <h4 class="font-semibold text-gray-900 mb-1">Keep the same photos</h4>
                        <p class="text-xs text-gray-600">Use all the same photos from your original memory book.</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Select Photos to Replace Option -->
                  <div class="relative cursor-pointer group" @click="selectMethod('replace_selected')">
                    <div class="bg-white rounded-lg p-4 border-2 transition-all duration-300 hover:border-brand-flash/50 hover:shadow-md h-full flex flex-col"
                      :class="photoSelection_method === 'replace_selected' 
                        ? 'border-brand-flash bg-gradient-to-br from-brand-flash/10 to-brand-highlight/10 shadow-lg' 
                        : 'border-gray-200'">
                      <div class="text-center flex flex-col h-full justify-center">
                        <div class="w-12 h-12 bg-brand-flash rounded-full flex items-center justify-center mx-auto mb-3">
                          <i class="pi pi-images text-white text-xl"></i>
                        </div>
                        <h4 class="font-semibold text-gray-900 mb-1">Select photos to replace</h4>
                        <p class="text-xs text-gray-600">Choose which photos to replace with new ones.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Photo Replacement Status (when replace_selected is chosen) -->
                <div v-if="photoSelection_method === 'replace_selected'" class="bg-brand-surface-hover/50 rounded-lg p-4 border border-brand-primary/20 mb-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-semibold text-brand-primary mb-1">Photo Replacement</h4>
                    <p class="text-sm text-gray-600">
                      <span v-if="photosToReplaceCount === 0" class="text-gray-500">
                        No photos selected for replacement
                      </span>
                      <span v-else class="text-brand-flash font-medium">
                        {{ photosToReplaceCount }} photo{{ photosToReplaceCount === 1 ? '' : 's' }} selected for replacement
                      </span>
                    </p>
                    </div>
                    <Button
                      :label="photosToReplaceCount === 0 ? 'Select Photos' : 'Change selection'"
                      :icon="photosToReplaceCount === 0 ? 'pi pi-images' : 'pi pi-pencil'"
                      severity="secondary"
                      @click="openPhotoReplacementModal"
                      class="px-4 py-2"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Other Photo Selection Options (always visible) -->
              <PhotoSelectionInterface
                ref="photoSelectionInterfaceRef"
                v-model:method="photoSelection_method"
                v-model:dateRange="photoSelection_dateRange"
                v-model:selectedTags="photoSelection_selectedTags"
                v-model:locationType="photoSelection_locationType"
                v-model:selectedLocation="photoSelection_selectedLocation"
                v-model:selectedMemories="photoSelection_selectedMemories"
                v-model:selectedTagFilter="photoSelection_selectedTagFilter"
                :title="form.ai_supplemental_prompt || 'your memory book'"
                :computedAvailableTags="photoSelection_computedAvailableTags"
                :isRecreateMode="false"
                :availableCountries="photoSelection_availableCountries"
                :availableStates="photoSelection_availableStates"
                :availableCities="photoSelection_availableCities"
                :filteredAssets="photoSelection_filteredAssets"
                :loadingAssets="photoSelection_loadingAssets"
                :isUploading="photoSelection_isUploading"
                :maxPhotoCount="selectedThemePhotoCount || totalPhotosNeeded"
                @upload-photos="handleUploadPhotos"
                @photo-library-selected="handlePhotoLibrarySelected"
                @no-photos-found="handleNoPhotosFound"
                @close-photo-library="handleClosePhotoLibrary"
              />
            </div>
            
            <!-- Normal Photo Selection Interface (for non-recreate modes) -->
            <div v-else>
              <PhotoSelectionInterface
                ref="photoSelectionInterfaceRef"
                v-model:method="photoSelection_method"
                v-model:dateRange="photoSelection_dateRange"
                v-model:selectedTags="photoSelection_selectedTags"
                v-model:locationType="photoSelection_locationType"
                v-model:selectedLocation="photoSelection_selectedLocation"
                v-model:selectedMemories="photoSelection_selectedMemories"
                v-model:selectedTagFilter="photoSelection_selectedTagFilter"
                :title="form.ai_supplemental_prompt || 'your memory book'"
                :computedAvailableTags="photoSelection_computedAvailableTags"
                :isRecreateMode="props.isRecreateMode"
                :availableCountries="photoSelection_availableCountries"
                :availableStates="photoSelection_availableStates"
                :availableCities="photoSelection_availableCities"
                :filteredAssets="photoSelection_filteredAssets"
                :loadingAssets="photoSelection_loadingAssets"
                :isUploading="photoSelection_isUploading"
                :maxPhotoCount="selectedThemePhotoCount || totalPhotosNeeded"
                @upload-photos="handleUploadPhotos"
                @photo-library-selected="handlePhotoLibrarySelected"
                @no-photos-found="handleNoPhotosFound"
                @close-photo-library="handleClosePhotoLibrary"
              />
            </div>
          </div>
          
          <!-- Loading State for Photo Selection -->
          <div v-else class="bg-white rounded-lg p-4 border border-brand-primary/20">
            <div class="flex items-center justify-center py-4">
              <i class="pi pi-spin pi-spinner text-xl mb-2 text-brand-secondary"></i>
              <p class="text-sm text-brand-primary/70 ml-2">Loading your photos...</p>
            </div>
          </div>
          
          <!-- Selected Assets Grid -->
          <div v-if="selectedAssets.length > 0" class="bg-white rounded-lg p-3 border border-brand-primary/20">
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-32 overflow-y-auto">
              <div
                v-for="asset in selectedAssets.slice(0, 16)"
                :key="asset.id"
                class="aspect-square bg-brand-background rounded-lg border border-brand-primary/20 overflow-hidden"
              >
                <img 
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || asset.ai_caption || 'Memory'"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="pi pi-image text-brand-primary/40 text-xs"></i>
                </div>
              </div>
              <div v-if="selectedAssets.length > 16" class="aspect-square bg-brand-background rounded-lg border border-brand-primary/20 flex items-center justify-center text-xs text-brand-primary/50 font-medium">
                +{{ selectedAssets.length - 16 }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-brand-primary/20">
        <Button
          type="button"
          label="CLEANUP"
          icon="pi pi-refresh"
          @click="$emit('cleanup')"
          class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 w-full sm:w-auto px-6 py-2 text-sm font-medium tracking-wider rounded shadow-elevation-2 hover:shadow-elevation-3"
        />
        <Button
          type="button"
          label="CANCEL"
          icon="pi pi-times"
          @click="$emit('close')"
          class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-white border-0 w-full sm:w-auto px-6 py-2 text-sm font-medium tracking-wider rounded shadow-elevation-2 hover:shadow-elevation-3"
        />
        <Button
          type="submit"
          :label="isEditing ? 'RECREATE' : 'COMPOSE MEMORY BOOK'"
          icon="pi pi-check"
          :loading="loading"
          :disabled="loading || !canSubmit"
          class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 w-full sm:w-auto px-6 py-2 text-sm font-medium tracking-wider rounded shadow-elevation-2 hover:shadow-elevation-3"
        />
      </div>
    </form>

  </Dialog>

  <!-- Info Bubble for Pages Explanation -->
  <SavtaBubble
    v-model:open="showPagesInfoBubble"
    target="[data-savta='pages-info-icon']"
    placement="top"
    :offset="10"
    heading="Grid Layouts & Pages"
    text="Grid layouts: Each page contains your selected grid (e.g., 2x2 = 4 photos per page).\n\nTotal photos needed: Grid size × Number of pages\n\nExample: 2x2 grid × 3 pages = 12 photos needed\n\nTheme layouts: Always single page with a fixed number of photos determined by the theme"
  />

  <!-- Photo Replacement Modal -->
  <PhotoReplacementModal
    v-model:visible="showPhotoReplacementModal"
    :existing-assets="props.existingBookData?.created_from_assets || []"
    item-type="memory book"
    v-model="photosToReplace"
    @save="handlePhotoReplacementSave"
  />
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import PhotoSelectionInterface from '~/components/PhotoSelectionInterface.vue'
import PhotoReplacementModal from '~/components/PhotoReplacementModal.vue'
import SavtaBubble from '~/components/SavtaBubble.vue'
import { useDatabase } from '~/composables/useDatabase'
import { usePhotoReplacement } from '~/composables/usePhotoReplacement'

// Import database composable
const db = useDatabase()

const props = defineProps({
  isEditing: Boolean,
  initialData: { type: Object, default: () => ({}) },
  loading: Boolean,
  initialSelectedAssets: { type: Array, default: () => [] },
  initialPhotoSelectionMethod: { type: String, default: 'last_100' },
  visible: { type: Boolean, default: false },
  isRecreateMode: { type: Boolean, default: false },
  existingBookData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['submit', 'close', 'cleanup'])

// Form state
const form = ref({
  ai_supplemental_prompt: '',
  layoutType: 'grid',
  printSize: '8.5x11',
  quality: 'standard',
  medium: 'digital',
  output: 'PDF',
  theme_id: null,
  memoryEvent: '',
  customMemoryEvent: '',
  backgroundType: 'white',
  backgroundOpacity: 30,
  includeCaptions: true,
  autoEnhance: true,
  gridLayout: '2x2',
  page_count: 1
})

// Photo selection state
const selectedAssets = ref([])

// Info bubble state
const showPagesInfoBubble = ref(false)

// Use the photo selection composable
const {
  photoSelection_method,
  photoSelection_dateRange,
  photoSelection_selectedTags,
  photoSelection_selectedTagFilter,
  photoSelection_locationType,
  photoSelection_selectedLocation,
  photoSelection_selectedMemories,
  photoSelection_availableCountries,
  photoSelection_availableStates,
  photoSelection_availableCities,
  photoSelection_availableAssets,
  photoSelection_loadingAssets,
  photoSelection_isUploading,
  photoSelection_showUploadDialog,
  photoSelection_options,
  photoSelection_computedAvailableTags,
  photoSelection_filteredAssets,
  photoSelection_loadAvailableAssets,
  photoSelection_loadLocationData,
  photoSelection_toggleMemorySelection,
  photoSelection_populatePhotoSelectionPool,
  photoSelection_resetSelection,
  photoSelection_getSelectedAssets
} = usePhotoSelection()

// Use the shared photo replacement composable
const {
  photosToReplace,
  existingBookForRecreation,
  isRecreateMode,
  initializePhotoReplacement,
  resetPhotoReplacement,
  togglePhotoReplacement,
  getPhotoSelectionPool,
  getPhotosToReplace,
  hasPhotoReplacements,
  photosToKeepCount,
  photosToReplaceCount
} = usePhotoReplacement()

// Photo replacement modal state
const showPhotoReplacementModal = ref(false)


// Theme state
const themeOptions = ref([])
const loadingThemes = ref(false)

// Options for dropdowns
const layoutOptions = ref([
  { label: 'Grid Layout', value: 'grid' },
  { label: 'Theme Layout', value: 'theme' }
])

const printSizeOptions = ref([
  { label: '4x6 inches (Portrait)', value: '4x6' },
  { label: '6x4 inches (Landscape)', value: '6x4' },
  { label: '5x3 inches (Landscape)', value: '5x3' },
  { label: '5x7 inches (Portrait)', value: '5x7' },
  { label: '7x5 inches (Landscape)', value: '7x5' },
  { label: '8x10 inches (Portrait)', value: '8x10' },
  { label: '10x8 inches (Landscape)', value: '10x8' },
  { label: '8.5x11 inches (Letter Portrait)', value: '8.5x11' },
  { label: '11x8.5 inches (Letter Landscape)', value: '11x8.5' },
  { label: '11x14 inches (Portrait)', value: '11x14' },
  { label: '14x11 inches (Landscape)', value: '14x11' },
  { label: '12x12 inches (Square)', value: '12x12' }
])

const qualityOptions = ref([
  { label: 'Standard', value: 'standard' },
  { label: 'High Quality', value: 'high' },
  { label: 'Premium', value: 'premium' }
])

const mediumOptions = ref([
  { label: 'Digital PDF', value: 'digital' },
  { label: 'Print Ready', value: 'print' },
  { label: 'Web View', value: 'web' }
])

const gridLayoutOptions = ref([
  { label: '1 memory per page (1x1)', value: '1x1' },
  { label: '2 memories per page (2x1)', value: '2x1' },
  { label: '4 memories per page (2x2)', value: '2x2' },
  { label: '6 memories per page (3x2)', value: '3x2' },
  { label: '9 memories per page (3x3)', value: '3x3' },
  { label: '12 memories per page (3x4)', value: '3x4' },
  { label: '16 memories per page (4x4)', value: '4x4' }
])

const memoryEventOptions = ref([
  { label: 'Vacation', value: 'vacation' },
  { label: 'Birthday', value: 'birthday' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Graduation', value: 'graduation' },
  { label: 'Family Trip', value: 'family_trip' },
  { label: 'Other (custom)', value: 'custom' }
])

// Computed properties
const showDialog = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      // Clean up state when dialog is closed
      console.log('🔄 Dialog closing - cleaning up state')
      photoSelection_resetSelection()
      emit('close')
    }
  }
})

// Calculate maximum pages allowed based on grid layout and 100 photo limit
const maxPagesAllowed = computed(() => {
  if (form.value.layoutType !== 'grid') return 10
  
  // Parse grid layout to get memories per page
  const gridLayout = form.value.gridLayout || '2x2'
  const [rows, cols] = gridLayout.split('x').map(Number)
  const memoriesPerPage = rows * cols
  
  // Calculate maximum pages without exceeding 100 photo limit
  const maxPages = Math.floor(100 / memoriesPerPage)
  
  // Ensure at least 1 page is allowed
  return Math.max(1, maxPages)
})

// Calculate total photos needed based on grid layout and number of pages
const totalPhotosNeeded = computed(() => {
  if (form.value.layoutType !== 'grid') return 0
  
  // Parse grid layout to get memories per page
  const gridLayout = form.value.gridLayout || '2x2'
  const [rows, cols] = gridLayout.split('x').map(Number)
  const memoriesPerPage = rows * cols
  
  // Calculate total photos needed
  const pageCount = form.value.page_count || 1
  const totalPhotos = memoriesPerPage * pageCount
  
  return totalPhotos
})

// Determine if user can submit based on photo selection method
const canSubmit = computed(() => {
  // If we have manually selected assets, use them
  if (selectedAssets.value.length > 0) {
    return true
  }
  
  // For AI-driven methods, allow submission without manual selection
  const aiDrivenMethods = ['last_100', 'geo_code', 'date_range', 'tags']
  const method = photoSelection_method.value
  
  if (aiDrivenMethods.includes(method)) {
    // For AI-driven methods, check if we have the required parameters
    switch (method) {
      case 'geo_code':
        return !!photoSelection_selectedLocation.value
      case 'date_range':
        return !!(photoSelection_dateRange.value.start || photoSelection_dateRange.value.end)
      case 'tags':
        return photoSelection_selectedTags.value.length > 0
      case 'last_100':
        return true // No additional parameters needed
      default:
        return true
    }
  }
  
  // For manual selection (photo_library), require selected photos
  return false
})

// Check if we're using an AI-driven method
const isAiDrivenMethod = computed(() => {
  const aiDrivenMethods = ['last_100', 'geo_code', 'date_range', 'tags']
  const method = photoSelection_method.value
  return aiDrivenMethods.includes(method) && selectedAssets.value.length === 0
})

// Calculate page count based on grid layout and number of selected assets (for display purposes)
const calculatedPageCount = computed(() => {
  if (selectedAssets.value.length === 0) return 0
  
  // Parse grid layout to get memories per page
  const gridLayout = form.value.gridLayout || '2x2'
  const [rows, cols] = gridLayout.split('x').map(Number)
  const memoriesPerPage = rows * cols
  
  // Calculate total pages needed
  const totalPages = Math.ceil(selectedAssets.value.length / memoriesPerPage)
  
  return totalPages
})

// Get selected theme's photo count
const selectedThemePhotoCount = computed(() => {
  if (form.value.layoutType !== 'theme' || !form.value.theme_id) return null
  
  const selectedTheme = themeOptions.value.find(theme => theme.value === form.value.theme_id)
  if (!selectedTheme) return null
  
  return selectedTheme.photoCount || null
})

// Function to fetch themes from database
const fetchThemes = async () => {
  try {
    loadingThemes.value = true
    const { data, error } = await supabase
      .from('themes')
      .select('id, name, description, is_active, layout_config')
      .eq('is_active', true)
      .eq('deleted', false)
      .order('name')
    
    if (error) {
      console.error('Error fetching themes:', error)
      return
    }
    
    // Transform themes for dropdown
    themeOptions.value = data.map(theme => {
      let photoCount = 0
      try {
        const layoutConfig = typeof theme.layout_config === 'string' 
          ? JSON.parse(theme.layout_config) 
          : theme.layout_config
        
        if (layoutConfig && layoutConfig.photos && Array.isArray(layoutConfig.photos)) {
          photoCount = layoutConfig.photos.length
        }
      } catch (error) {
        console.error('Error parsing theme layout config:', error)
      }
      
      return {
        label: photoCount > 0 ? `${theme.name} (${photoCount} photos)` : theme.name,
        value: theme.id,
        description: theme.description,
        layoutConfig: theme.layout_config,
        photoCount: photoCount
      }
    })
    
    console.log('[MEMORY-BOOK-DIALOG] Fetched themes:', themeOptions.value)
  } catch (error) {
    console.error('Error fetching themes:', error)
  } finally {
    loadingThemes.value = false
  }
}

// Database composable
const { $supabase: supabase } = useNuxtApp()

// Watchers
// Initialize form on mount instead of using a watcher
onMounted(() => {
  console.log('🔍 [MemoryBookDialog] Component mounted, initializing form')
  console.log('🔍 [MemoryBookDialog] Initial data:', props.initialData)
  
  if (props.initialData && Object.keys(props.initialData).length > 0) {
    form.value = {
      ai_supplemental_prompt: '',
      layoutType: 'grid',
      printSize: '8.5x11',
      quality: 'standard',
      medium: 'digital',
      output: 'PDF',
      theme_id: null,
      memoryEvent: '',
      customMemoryEvent: '',
      backgroundType: 'white',
      backgroundOpacity: 30,
      includeCaptions: true,
      autoEnhance: true,
      gridLayout: '2x2',
      page_count: 1,
      ...props.initialData,
      output: 'PDF'
    }
    console.log('🔍 [MemoryBookDialog] Form initialized with initialData. GridLayout:', form.value.gridLayout)
  }
})

watch(() => form.value.layoutType, (newLayoutType) => {
  if (newLayoutType !== 'theme') {
    form.value.theme_id = null
  }
})

// Watch for grid layout changes and adjust page count if it exceeds the new maximum
watch(() => form.value.gridLayout, (newGridLayout) => {
  console.log('🔍 [MemoryBookDialog] Grid layout changed to:', newGridLayout)
  console.log('🔍 [MemoryBookDialog] Current form.gridLayout:', form.value.gridLayout)
  console.log('🔍 [MemoryBookDialog] Current form.layoutType:', form.value.layoutType)
  
  if (form.value.layoutType === 'grid') {
    // Calculate new maximum pages for the new grid layout
    const [rows, cols] = (newGridLayout || '2x2').split('x').map(Number)
    const memoriesPerPage = rows * cols
    const newMaxPages = Math.max(1, Math.floor(100 / memoriesPerPage))
    
    console.log(`📐 Grid layout changed to ${newGridLayout}, memories per page: ${memoriesPerPage}, max pages: ${newMaxPages}`)
    
    // If current page count exceeds new maximum, adjust it
    if (form.value.page_count > newMaxPages) {
      form.value.page_count = newMaxPages
      console.log(`📐 Grid layout changed to ${newGridLayout}, adjusted page count to ${newMaxPages} (max photos: ${newMaxPages * memoriesPerPage})`)
    }
  }
})

watch(() => props.initialSelectedAssets, async (val) => {
  console.log('🔍 [MemoryBookDialog] initialSelectedAssets changed:', val)
  if (val && Array.isArray(val)) {
    console.log('🔍 [MemoryBookDialog] Processing initial assets, length:', val.length)
    // If val contains asset objects, use them directly
    if (val.length > 0 && typeof val[0] === 'object' && val[0].id) {
      console.log('🔍 [MemoryBookDialog] Using asset objects directly')
      selectedAssets.value = [...val]
    } else if (val.length > 0 && typeof val[0] === 'string') {
      console.log('🔍 [MemoryBookDialog] Fetching asset objects from IDs:', val)
      // If val contains asset IDs, fetch the full asset objects
      try {
        const { useDatabase } = await import('~/composables/useDatabase')
        const db = useDatabase()
        const assets = await db.assets.getAssets({ approved: true })
        const selectedAssetObjects = assets.filter(asset => val.includes(asset.id))
        selectedAssets.value = selectedAssetObjects
        console.log('🔍 [MemoryBookDialog] Loaded selected assets from IDs:', selectedAssetObjects.length)
      } catch (error) {
        console.error('Error loading selected assets:', error)
        selectedAssets.value = []
      }
    }
  } else {
    console.log('🔍 [MemoryBookDialog] No initial assets provided')
  }
}, { immediate: true })

// Watch for initial photo selection method
watch(() => props.initialPhotoSelectionMethod, (method) => {
  console.log('🔍 [MemoryBookDialog] initialPhotoSelectionMethod changed:', method)
  if (method) {
    photoSelection_method.value = method
    console.log('🔍 [MemoryBookDialog] Set photo selection method:', method)
  }
}, { immediate: true })

watch(() => props.visible, (isVisible) => {
  console.log('🔍 [MemoryBookDialog] Dialog visibility changed:', isVisible)
  console.log('🔍 [MemoryBookDialog] Props:', { 
    isEditing: props.isEditing, 
    initialSelectedAssets: props.initialSelectedAssets, 
    initialPhotoSelectionMethod: props.initialPhotoSelectionMethod 
  })
  console.log('🔍 [MemoryBookDialog] Current form.gridLayout when visibility changes:', form.value.gridLayout)
  
  if (isVisible) {
    if (!props.isEditing) {
      // Only reset form if it's completely empty (first time opening)
      const hasUserInput = form.value.ai_supplemental_prompt || 
                          form.value.gridLayout !== '2x2' || 
                          form.value.page_count !== 1 ||
                          form.value.printSize !== '8.5x11' ||
                          form.value.backgroundType !== 'white'
      
      if (!hasUserInput) {
        // Reset all state for new memory book creation
        console.log('🔄 Resetting all state for new memory book')
        
        // Reset form to defaults
        form.value = {
          ai_supplemental_prompt: '',
          layoutType: 'grid',
          printSize: '8.5x11',
          quality: 'standard',
          medium: 'digital',
          output: 'PDF',
          theme_id: null,
          memoryEvent: '',
          customMemoryEvent: '',
          backgroundType: 'white',
          backgroundOpacity: 30,
          includeCaptions: true,
          autoEnhance: true,
          gridLayout: '2x2',
          page_count: 1
        }
      } else {
        console.log('🔄 Preserving user input, not resetting form')
      }
      
      // Reset selected assets only if no initial assets are provided
      if (!props.initialSelectedAssets || props.initialSelectedAssets.length === 0) {
        console.log('🔍 [MemoryBookDialog] No initial assets, resetting selection')
        selectedAssets.value = []
        // Reset photo selection state
        photoSelection_resetSelection()
      } else {
        console.log('🔍 [MemoryBookDialog] Preserving photo selection state with initial assets:', props.initialSelectedAssets)
        // Set the photo selection method from props
        if (props.initialPhotoSelectionMethod) {
          photoSelection_method.value = props.initialPhotoSelectionMethod
          console.log('🔍 [MemoryBookDialog] Set photo selection method from props:', props.initialPhotoSelectionMethod)
        }
      }
      
      // Close any open modals
      
      console.log('✅ All state reset for new memory book')
    } else {
      // For editing, just ensure state is clean
      console.log('🔄 Editing mode - state cleaned')
    }
  }
})

// Photo selection methods

const savePhotoSelection = () => {
  console.log('💾 Saving photo selection')
  
  // Determine target photo count based on layout type
  let targetCount = null
  if (form.value.layoutType === 'grid') {
    targetCount = totalPhotosNeeded.value
    console.log('💾 Grid layout: targeting', targetCount, 'photos for', form.value.page_count, 'pages')
  } else if (form.value.layoutType === 'theme') {
    targetCount = selectedThemePhotoCount.value || 3 // Default to 3 for themes
    console.log('💾 Theme layout: targeting', targetCount, 'photos')
  }
  
  // Get selected assets from the photo selection pool
  const selectedAssetIds = photoSelection_populatePhotoSelectionPool(targetCount)
  selectedAssets.value = photoSelection_availableAssets.value.filter(asset => selectedAssetIds.includes(asset.id))
  
  console.log('💾 Saved', selectedAssets.value.length, 'selected assets')
  
  // For grid layouts, ensure we have enough photos for the specified number of pages
  if (form.value.layoutType === 'grid' && selectedAssets.value.length < totalPhotosNeeded.value) {
    console.log('⚠️ Warning: Selected', selectedAssets.value.length, 'photos but need', totalPhotosNeeded.value, 'for', form.value.page_count, 'pages')
  }
  
  // Reset photo selection state
  photoSelection_resetSelection()
}




// Fetch themes when component mounts
onMounted(() => {
  fetchThemes()
})

async function handleSubmit() {
  console.log('🔍 [MemoryBookDialog] handleSubmit called')
  console.log('🔍 [MemoryBookDialog] Form data:', form.value)
  console.log('🔍 [MemoryBookDialog] Selected assets:', selectedAssets.value.length)
  console.log('🔍 [MemoryBookDialog] Photo selection method:', photoSelection_method.value)
  
  // Initialize photo replacement if in recreate mode
  if (props.isRecreateMode && props.existingBookData) {
    initializePhotoReplacement(props.existingBookData, props.existingBookData.created_from_assets || [])
  }
  
  // Load available assets for photo selection
  await photoSelection_loadAvailableAssets()
  
  // Use the shared photo replacement logic (same as wizard)
  const photoSelectionPool = getPhotoSelectionPool(
    photoSelection_method.value, 
    photoSelection_populatePhotoSelectionPool,
    (memories) => { photoSelection_selectedMemories.value = memories }
  )
  
  const submitData = {
    ...form.value,
    memoryEvent: form.value.memoryEvent === 'custom' ? form.value.customMemoryEvent : form.value.memoryEvent,
    backgroundType: form.value.backgroundType,
    backgroundOpacity: form.value.backgroundOpacity,
    selectedAssets: selectedAssets.value,
    photo_selection_pool: photoSelectionPool,
    photoSelectionMethod: photoSelection_method.value,
    photosToReplace: getPhotosToReplace(photoSelection_method.value),
    // Match wizard logic exactly for photos_to_replace
    photos_to_replace: getPhotosToReplace(photoSelection_method.value),
    // Ensure grid layout and photo count are properly set for grid layouts
    grid_layout: form.value.layoutType === 'grid' ? form.value.gridLayout : undefined,
    photo_count: form.value.layoutType === 'grid' ? totalPhotosNeeded.value : undefined
  }
  
  console.log('🔍 [MemoryBookDialog] Emitting submit event with data:', submitData)
  console.log('🔍 [MemoryBookDialog] Photo selection pool length:', photoSelectionPool.length)
  console.log('🔍 [MemoryBookDialog] Photo selection pool:', photoSelectionPool)
  console.log('🔍 [MemoryBookDialog] Photos to replace:', photosToReplace.value)
  console.log('🔍 [MemoryBookDialog] Form gridLayout:', form.value.gridLayout)
  console.log('🔍 [MemoryBookDialog] Form layoutType:', form.value.layoutType)
  console.log('🔍 [MemoryBookDialog] Total photos needed:', totalPhotosNeeded.value)
  console.log('🔍 [MemoryBookDialog] Submit data grid_layout:', submitData.grid_layout)
  console.log('🔍 [MemoryBookDialog] Submit data photo_count:', submitData.photo_count)
  emit('submit', submitData)
}

// Event handlers for PhotoSelectionInterface (matching wizard)
const handleUploadPhotos = () => {
  console.log('🔍 [MemoryBookDialog] handleUploadPhotos called')
  // Close the dialog and navigate to upload route
  emit('close')
  navigateTo('/app/memory-books/upload?from=dialog&return=dialog')
}

const handleNoPhotosFound = (data) => {
  console.log('🔍 [MemoryBookDialog] handleNoPhotosFound called with data:', data)
  
  let title = 'No Photos Found'
  let message = data?.message

  // Provide friendly defaults if message not provided
  if (!message) {
    switch (data?.method) {
      case 'last_100':
        message = 'No recent photos found. Try uploading some photos first.'
        break
      case 'geo_code':
        message = 'No photos found for this location. Try a different location or upload photos.'
        break
      case 'date_range':
        message = 'No photos found for this date range. Try a different date range or upload photos.'
        break
      case 'photo_library':
        message = 'Your Photo Box is empty. Upload photos to continue.'
        break
      default:
        message = 'No matching photos found. Try adjusting your selections.'
    }
  }

  console.log('🔍 [MemoryBookDialog] Showing toast with:', { title, message })
  
  // Show toast notification (you may need to import useToast if not already imported)
  // For now, just log the message
  console.warn(`⚠️ ${title}: ${message}`)
}

const handlePhotoLibrarySelected = () => {
  console.log('🔍 [MemoryBookDialog] handlePhotoLibrarySelected called')
  // Handle photo library selection - this is called when user selects photos from Photo Box
  // The PhotoSelectionInterface component handles the selection internally
}

const handleClosePhotoLibrary = () => {
  console.log('🔍 [MemoryBookDialog] handleClosePhotoLibrary called')
  // Reset any photo library state if needed
  // The PhotoSelectionInterface component handles this internally
}

// Photo replacement modal handlers
const handlePhotoReplacementSave = (selectedPhotos) => {
  console.log('🔍 [MemoryBookDialog] Photo replacement saved:', selectedPhotos)
  photosToReplace.value = selectedPhotos
  showPhotoReplacementModal.value = false
}

// Method selection handler
const selectMethod = (method) => {
  console.log('🔍 [MemoryBookDialog] Method selected:', method)
  photoSelection_method.value = method
  
  if (method === 'keep_same') {
    // Clear any photo replacements when keeping same photos
    photosToReplace.value = []
  }
}

// Open photo replacement modal
const openPhotoReplacementModal = () => {
  console.log('🔍 [MemoryBookDialog] Opening photo replacement modal')
  showPhotoReplacementModal.value = true
}

</script> 