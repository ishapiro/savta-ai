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
              AI Supplemental Prompt
            </label>
            <InputText
              id="ai_supplemental_prompt"
              v-model="form.ai_supplemental_prompt"
              class="w-full"
              placeholder="Enter AI supplemental prompt for photo selection and story creation"
              required
            />
          </div>
          
          <!-- Memory Event -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Memory Event</label>
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
            <small class="text-brand-primary/70 text-xs mt-1 block">
              Select a custom theme for your memory book layout
            </small>
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
          
          <!-- Output Format -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Output Format</label>
            <Dropdown
              v-model="form.output"
              :options="outputOptions"
              option-label="label"
              option-value="value"
              placeholder="Select output format"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Grid & Shape Section -->
      <div v-if="form.layoutType !== 'theme'" class="bg-gradient-to-r from-brand-secondary/10 to-brand-accent/10 rounded-lg p-4 border border-brand-secondary/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-th-large text-brand-secondary"></i>
          Grid & Shape
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          
          <!-- Memory Shape -->
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-2">Memory Shape</label>
            <Dropdown
              v-model="form.memoryShape"
              :options="memoryShapeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select shape"
              class="w-full"
            />
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

      <!-- Asset Selection Section -->
      <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg p-4 border border-brand-secondary/30">
        <h3 class="text-lg font-semibold text-brand-primary mb-4 flex items-center gap-2">
          <i class="pi pi-images text-brand-secondary"></i>
          Memory Selection
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
                    {{ selectedAssets.length }} memories selected
                  </p>
                  <p class="text-xs text-brand-primary/70">
                    <span v-if="form.layoutType === 'theme' && selectedThemePhotoCount">
                      Savta will select {{ selectedThemePhotoCount }} photos from this theme.
                    </span>
                    <span v-else-if="form.layoutType === 'theme' && !selectedThemePhotoCount">
                      Please select a theme to see photo count.
                    </span>
                    <span v-else-if="selectedAssets.length === 0">
                      No memories selected
                    </span>
                    <span v-else>
                      Will create approximately {{ calculatedPageCount }} pages
                    </span>
                  </p>
                </div>
              </div>
              <Button
                label="Select Assets"
                icon="pi pi-images"
                size="small"
                @click="openAssetSelector"
                class="bg-brand-dialog-save border-0 text-white font-semibold rounded-full px-4 py-2 shadow-lg transition-all duration-200 hover:scale-105"
              />
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
          label="Cleanup"
          icon="pi pi-refresh"
          @click="$emit('cleanup')"
          class="bg-brand-dialog-delete border-0 w-auto rounded-full px-6 py-2 shadow"
        />
        <Button
          type="button"
          label="Cancel"
          icon="pi pi-times"
          @click="$emit('close')"
          class="bg-brand-dialog-cancel border-0 w-auto rounded-full px-6 py-2"
        />
        <Button
          type="submit"
          :label="isEditing ? 'Update' : 'Compose Memory Book'"
          icon="pi pi-check"
          :loading="loading"
          :disabled="loading || selectedAssets.length === 0"
          class="bg-brand-dialog-save border-0 w-auto rounded-full px-6 py-2"
        />
      </div>
    </form>

    <!-- Asset Selection Modal -->
    <Dialog
      v-model:visible="showAssetSelector"
      modal
      header="Select Your Memories"
      class="w-[95vw] max-w-6xl h-[90vh] select-memories-dialog"
      :closable="false">
      <div v-if="!loadingAssets" class="space-y-4">
        <!-- Instructions -->
        <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg p-3 sm:p-4 border border-brand-secondary/30">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-6 h-6 sm:h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
              <i class="pi pi-heart text-brand-secondary text-xs sm:text-sm"></i>
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-brand-primary">Choose Your Memories</h3>
          </div>
          <p class="text-xs sm:text-sm text-brand-primary/70">Select the memories you'd like to include in your magic memory. You can filter by tags and select multiple memories at once.</p>
        </div>
        <!-- Filter Section -->
        <div class="bg-white rounded-lg border border-brand-primary/20 sm:p-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div class="flex-1 min-w-0">
              <label class="block text-sm font-medium text-brand-primary">Filter by Tags</label>
              <div class="flex gap-2">
                <MultiSelect
                  v-model="selectedTagFilter"
                  :options="computedAvailableTags"
                  option-label="label"
                  option-value="value"
                  placeholder="All memories"
                  class="flex-1"
                  @change="filterMemories"
                  :show-toggle-all="false"
                />
                <Button
                  v-if="selectedTagFilter && selectedTagFilter.length > 0"
                  icon="pi pi-times"
                  size="small"
                  @click="clearTagFilter"
                  class="text-xs px-2 sm:px-3 py-2"
                  v-tooltip.top="'Clear filter'"
                />
              </div>
            </div>
            <div class="flex items-center justify-center sm:justify-end gap-2">
              <!-- Location Filter Button -->
              <Button
                label="Location"
                icon="pi pi-map-marker"
                size="small"
                @click="openLocationDialog"
                class="bg-brand-secondary hover:bg-brand-header border-0 text-xs px-2 sm:px-3 py-2"
                :class="{ 'bg-brand-header text-white': selectedLocationFilter }"
              />
              <!-- Tag Filter Button -->
              <Button
                label="Tags"
                icon="pi pi-tags"
                size="small"
                @click="openTagDialog"
                class="bg-brand-secondary hover:bg-brand-header border-0 text-xs px-2 sm:px-3 py-2"
                :class="{ 'bg-brand-header text-white': selectedTagFilter && selectedTagFilter.length > 0 }"
              />
              <!-- Date Filter Button -->
              <Button
                label="Date"
                icon="pi pi-calendar"
                size="small"
                @click="openDateDialog"
                class="bg-brand-secondary hover:bg-brand-header border-0 text-xs px-2 sm:px-3 py-2"
                :class="{ 'bg-brand-header text-white': selectedDateFilter }"
              />
              <Button
                label="Select All"
                icon="pi pi-check-square"
                size="small"
                @click="selectAllMemories"
                class="bg-brand-secondary hover:bg-brand-header border-0 text-xs px-2 sm:px-3 py-2"
              />
              <Button
                label="Clear All"
                icon="pi pi-times"
                size="small"
                @click="selectedMemories = []"
                class="bg-brand-cancel text-xs px-2 sm:px-3 py-2"
              />
            </div>
          </div>
          <div class="mt-2 text-xs sm:text-sm text-brand-primary/70 text-center sm:text-left">
            Showing {{ filteredAssets.length }} of {{ availableAssets.length }} memories
            <span v-if="selectedTagFilter && selectedTagFilter.length > 0" class="block sm:inline"> • Filtered by: {{ selectedTagFilter.join(', ') }}</span>
            <span v-if="selectedLocationFilter" class="block sm:inline"> • Location: {{ selectedLocationFilter }}</span>
            <span v-if="selectedDateFilter" class="block sm:inline"> • Date: {{ formatDateRange(selectedDateFilter) }}</span>
          </div>
        </div>
        <!-- Memories Grid -->
        <div class="bg-white rounded-lg border border-brand-primary/20 sm:p-4">
          <div v-if="filteredAssets.length === 0" class="text-center py-8">
            <i class="pi pi-images text-3xl sm:text-4xl mb-2 block"></i>
            <p class="text-base sm:text-lg font-medium text-brand-primary">No memories found</p>
            <p class="text-xs sm:text-sm text-brand-primary/70">Try changing your filter or add some memories first</p>
          </div>
          <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 max-h-48 sm:max-h-64 md:max-h-96 overflow-y-auto">
            <div
              v-for="asset in filteredAssets"
              :key="asset.id"
              class="relative group cursor-pointer touch-manipulation"
              @click="toggleMemorySelection(asset.id)">
              <!-- Selection Overlay -->
              <div 
                class="absolute inset-0 rounded-lg border-2 transition-all duration-200 z-10"
                :class="selectedMemories.includes(asset.id) ? 'border-brand-secondary bg-brand-secondary/10' : 'border-transparent'"
              >
                <div 
                  class="absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-sm"
                  :class="selectedMemories.includes(asset.id) ? 'bg-brand-secondary text-white' : 'bg-white text-brand-primary/40'"
                >
                  <i 
                    class="text-xs"
                    :class="selectedMemories.includes(asset.id) ? 'pi pi-check' : 'pi pi-plus'"
                  ></i>
                </div>
              </div>
              <!-- Memory Card -->
              <div class="aspect-square bg-brand-background rounded-lg overflow-hidden border-2 border-brand-primary/20 hover:border-brand-header transition-colors">
                <img 
                  v-if="asset.storage_url"
                  :src="asset.storage_url"
                  :alt="asset.user_caption || asset.ai_caption || 'Memory'"
                  class="w-full h-full object-contain bg-white"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="pi pi-image text-brand-primary/60 text-base sm:text-lg md:text-2xl"></i>
                </div>
              </div>
              <!-- Memory Info -->
              <div class="mt-1 sm:mt-2 text-center">
                <CaptionRenderer 
                  :caption="asset.user_caption || asset.ai_caption || `Memory ${asset.id.slice(-4)}`"
                  :max-width="150"
                  :max-height="50"
                  :font-size="12"
                />
                <p class="text-xs text-brand-primary/70">
                  {{ formatDate(asset.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Selection Summary -->
        <div class="bg-gradient-to-r from-brand-header/10 to-brand-highlight/10 rounded-lg p-3 sm:p-4 border border-brand-header/30">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 sm:h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
                <i class="pi pi-check text-brand-secondary text-xs sm:text-sm"></i>
              </div>
              <div>
                <p class="text-xs sm:text-sm font-medium text-brand-primary">
                  {{ selectedMemories.length }} photos selected
                  <span v-if="form.layoutType === 'theme' && selectedThemePhotoCount" class="text-orange-600">
                    / {{ selectedThemePhotoCount }}
                  </span>
                </p>
                <p class="text-xs text-brand-primary/70">
                  <span v-if="form.layoutType === 'theme' && selectedThemePhotoCount">
                    Theme limit: {{ selectedThemePhotoCount }} photos
                  </span>
                  <span v-else>
                    Ready to create your cards or booklets
                  </span>
                </p>
              </div>
            </div>
            <div class="text-center sm:text-right">
              <p class="text-xs text-brand-primary/70">
                Estimated pages: {{ Math.ceil(selectedMemories.length / 4) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- Loading State -->
      <div v-else class="flex items-center justify-center py-8 sm:py-12">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-3xl sm:text-4xl mb-3 sm:mb-4 text-brand-secondary"></i>
          <p class="text-sm sm:text-base text-brand-primary/70">Loading your memories...</p>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <div class="flex gap-2 w-full sm:w-auto">
            <Button
              label="Cancel"
              icon="pi pi-times"
              @click="closeAssetSelector"
              class="bg-brand-dialog-cancel border-0 rounded-full px-4 sm:px-5 text-xs sm:text-sm font-bold shadow w-full sm:w-auto"
            />
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <span class="text-xs sm:text-sm text-brand-primary/70 text-center sm:text-left">
              {{ selectedMemories.length }} selected
              <span v-if="form.layoutType === 'theme' && selectedThemePhotoCount" class="text-orange-600">
                / {{ selectedThemePhotoCount }}
              </span>
            </span>
            <Button
              label="Save Selection"
              icon="pi pi-check"
              :disabled="selectedMemories.length === 0"
              @click="saveSelectedMemories"
              class="bg-brand-dialog-save rounded-full border-0 w-full sm:w-auto text-xs sm:text-sm px-4 sm:px-5 py-2"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Location Selection Dialog -->
    <Dialog
      v-model:visible="showLocationDialog"
      modal
      header="Filter by Location"
      class="w-[95vw] max-w-2xl location-dialog"
      :closable="false"
    >
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg p-4 border border-brand-secondary/30">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-8 h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
              <i class="pi pi-map-marker text-brand-secondary text-sm"></i>
            </div>
            <h3 class="text-lg font-semibold text-brand-primary">Choose Location</h3>
          </div>
          <p class="text-sm text-brand-primary/70">Select a location to filter your memories. Only memories from this location will be shown.</p>
        </div>

        <div class="bg-white rounded-lg border border-brand-primary/20 p-4">
          <div class="space-y-4">
            <!-- Location Search -->
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-2">Search Locations</label>
              <InputText
                v-model="locationSearch"
                placeholder="Type to search locations..."
                class="w-full"
                @input="filterLocations"
              />
            </div>

            <!-- Available Locations -->
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-2">Available Locations</label>
              <div class="max-h-48 overflow-y-auto border border-brand-primary/20 rounded-lg">
                <div
                  v-for="location in filteredLocations"
                  :key="location"
                  class="flex items-center justify-between p-3 hover:bg-brand-highlight/10 cursor-pointer border-b border-brand-primary/10 last:border-b-0"
                  @click="selectLocation(location)"
                >
                  <div class="flex items-center space-x-3">
                    <i class="pi pi-map-marker text-brand-secondary"></i>
                    <span class="text-sm text-brand-primary">{{ location }}</span>
                  </div>
                  <div v-if="selectedLocationFilter === location" class="w-5 h-5 bg-brand-secondary rounded-full flex items-center justify-center">
                    <i class="pi pi-check text-white text-xs"></i>
                  </div>
                </div>
                <div v-if="filteredLocations.length === 0" class="p-4 text-center text-sm text-brand-primary/70">
                  No locations found
                </div>
              </div>
            </div>

            <!-- Clear Location Filter -->
            <div v-if="selectedLocationFilter" class="bg-brand-highlight/10 rounded-lg p-3 border border-brand-highlight/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <i class="pi pi-map-marker text-brand-secondary"></i>
                  <span class="text-sm font-medium text-brand-primary">Selected: {{ selectedLocationFilter }}</span>
                </div>
                <Button
                  label="Clear"
                  icon="pi pi-times"
                  size="small"
                  @click="clearLocationFilter"
                  class="bg-brand-dialog-delete border-0 text-xs px-3 py-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeLocationDialog"
            class="bg-brand-dialog-cancel border-0 rounded-full px-4 py-2"
          />
          <Button
            label="Apply Filter"
            icon="pi pi-check"
            @click="applyLocationFilter"
            class="bg-brand-dialog-save border-0 rounded-full px-4 py-2"
          />
        </div>
      </template>
    </Dialog>

    <!-- Tag Selection Dialog -->
    <Dialog
      v-model:visible="showTagDialog"
      modal
      header="Filter by Tags"
      class="w-[95vw] max-w-2xl tag-dialog"
      :closable="false"
    >
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg p-4 border border-brand-secondary/30">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-8 h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
              <i class="pi pi-tags text-brand-secondary text-sm"></i>
            </div>
            <h3 class="text-lg font-semibold text-brand-primary">Choose Tags</h3>
          </div>
          <p class="text-sm text-brand-primary/70">Select one or more tags to filter your memories. Only memories with these tags will be shown.</p>
        </div>

        <div class="bg-white rounded-lg border border-brand-primary/20 p-4">
          <div class="space-y-4">
            <!-- Tag Search -->
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-2">Search Tags</label>
              <InputText
                v-model="tagSearch"
                placeholder="Type to search tags..."
                class="w-full"
                @input="filterTags"
              />
            </div>

            <!-- Available Tags -->
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-2">Available Tags</label>
              <div class="max-h-48 overflow-y-auto border border-brand-primary/20 rounded-lg">
                <div
                  v-for="tag in filteredTags"
                  :key="tag"
                  class="flex items-center justify-between p-3 hover:bg-brand-highlight/10 cursor-pointer border-b border-brand-primary/10 last:border-b-0"
                  @click="toggleTagSelection(tag)"
                >
                  <div class="flex items-center space-x-3">
                    <i class="pi pi-tag text-brand-secondary"></i>
                    <span class="text-sm text-brand-primary">{{ tag }}</span>
                  </div>
                  <div v-if="selectedTagFilter.includes(tag)" class="w-5 h-5 bg-brand-secondary rounded-full flex items-center justify-center">
                    <i class="pi pi-check text-white text-xs"></i>
                  </div>
                </div>
                <div v-if="filteredTags.length === 0" class="p-4 text-center text-sm text-brand-primary/70">
                  No tags found
                </div>
              </div>
            </div>

            <!-- Selected Tags -->
            <div v-if="selectedTagFilter.length > 0" class="bg-brand-highlight/10 rounded-lg p-3 border border-brand-highlight/30">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-brand-primary">Selected Tags:</span>
                <Button
                  label="Clear All"
                  icon="pi pi-times"
                  size="small"
                  @click="clearTagFilter"
                  class="bg-brand-dialog-delete border-0 text-xs px-3 py-1"
                />
              </div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="tag in selectedTagFilter"
                  :key="tag"
                  class="flex items-center space-x-2 bg-brand-secondary text-white rounded-full px-3 py-1 text-xs"
                >
                  <span>{{ tag }}</span>
                  <button @click="removeTag(tag)" class="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center">
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeTagDialog"
            class="bg-brand-dialog-cancel border-0 rounded-full px-4 py-2"
          />
          <Button
            label="Apply Filter"
            icon="pi pi-check"
            @click="applyTagFilter"
            class="bg-brand-dialog-save border-0 rounded-full px-4 py-2"
          />
        </div>
      </template>
    </Dialog>

    <!-- Date Selection Dialog -->
    <Dialog
      v-model:visible="showDateDialog"
      modal
      header="Filter by Date"
      class="w-[95vw] max-w-2xl date-dialog"
      :closable="false"
    >
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-brand-secondary/10 to-brand-highlight/10 rounded-lg p-4 border border-brand-secondary/30">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-8 h-8 bg-gradient-to-br from-brand-secondary/20 to-brand-highlight/20 rounded-full flex items-center justify-center">
              <i class="pi pi-calendar text-brand-secondary text-sm"></i>
            </div>
            <h3 class="text-lg font-semibold text-brand-primary">Choose Date Range</h3>
          </div>
          <p class="text-sm text-brand-primary/70">Select a date range to filter your memories. Only memories within this range will be shown.</p>
        </div>

        <div class="bg-white rounded-lg border border-brand-primary/20 p-4">
          <div class="space-y-4">
            <!-- Date Range Selection -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-brand-primary mb-2">From Date</label>
                <Calendar
                  v-model="dateRange.from"
                  :show-icon="true"
                  date-format="mm/dd/yy"
                  placeholder="Select start date"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-primary mb-2">To Date</label>
                <Calendar
                  v-model="dateRange.to"
                  :show-icon="true"
                  date-format="mm/dd/yy"
                  placeholder="Select end date"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Quick Date Presets -->
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-2">Quick Presets</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  label="Last Week"
                  size="small"
                  @click="setDatePreset('lastWeek')"
                  class="bg-brand-secondary hover:bg-brand-header border-0 text-xs"
                />
                <Button
                  label="Last Month"
                  size="small"
                  @click="setDatePreset('lastMonth')"
                  class="bg-brand-secondary hover:bg-brand-header border-0 text-xs"
                />
                <Button
                  label="Last 3 Months"
                  size="small"
                  @click="setDatePreset('last3Months')"
                  class="bg-brand-secondary hover:bg-brand-header border-0 text-xs"
                />
                <Button
                  label="Last Year"
                  size="small"
                  @click="setDatePreset('lastYear')"
                  class="bg-brand-secondary hover:bg-brand-header border-0 text-xs"
                />
              </div>
            </div>

            <!-- Selected Date Range -->
            <div v-if="dateRange.from || dateRange.to" class="bg-brand-highlight/10 rounded-lg p-3 border border-brand-highlight/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <i class="pi pi-calendar text-brand-secondary"></i>
                  <span class="text-sm font-medium text-brand-primary">
                    {{ formatDateRange({ from: dateRange.from, to: dateRange.to }) }}
                  </span>
                </div>
                <Button
                  label="Clear"
                  icon="pi pi-times"
                  size="small"
                  @click="clearDateFilter"
                  class="bg-brand-dialog-delete border-0 text-xs px-3 py-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeDateDialog"
            class="bg-brand-dialog-cancel border-0 rounded-full px-4 py-2"
          />
          <Button
            label="Apply Filter"
            icon="pi pi-check"
            @click="applyDateFilter"
            class="bg-brand-dialog-save border-0 rounded-full px-4 py-2"
          />
        </div>
      </template>
    </Dialog>
    
    <!-- Theme Limit Alert Dialog -->
    <Dialog
      v-model:visible="showThemeLimitAlert"
      modal
      :closable="true"
      class="theme-limit-alert"
      style="max-width: 95vw; width: 500px;"
    >
      <div class="flex flex-col items-center justify-center py-6 px-4 text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-4">
          <i class="pi pi-exclamation-triangle text-2xl text-orange-500"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Theme Photo Limit</h3>
        <p class="text-sm text-gray-600 mb-4">{{ themeLimitMessage }}</p>
        <Button
          label="OK"
          @click="showThemeLimitAlert = false"
          class="bg-brand-dialog-save border-0 rounded-full px-6 py-2"
        />
      </div>
    </Dialog>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import CaptionRenderer from '~/components/CaptionRenderer.vue'

// Import database composable
const db = useDatabase()

const props = defineProps({
  isEditing: Boolean,
  initialData: { type: Object, default: () => ({}) },
  loading: Boolean,
  initialSelectedAssets: { type: Array, default: () => [] },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'close', 'cleanup'])

const form = ref({
  ai_supplemental_prompt: '',
  layoutType: 'grid', // Default to grid for traditional memory books
  printSize: '8.5x11',
  quality: 'standard',
  medium: 'digital',
  output: 'PDF', // Default to PDF
  theme: '', // Will be set when themes are loaded
  memoryEvent: '',
  customMemoryEvent: '',
  backgroundType: 'white',
  backgroundOpacity: 30,
  includeCaptions: true,
  autoEnhance: false,
  gridLayout: '2x2',
  memoryShape: 'original'
})

// Asset selection state
const showAssetSelector = ref(false)
const loadingAssets = ref(false)
const availableAssets = ref([])
const selectedAssets = ref([])
const selectedMemories = ref([])
const selectedTagFilter = ref([])

// Secondary dialog states
const showLocationDialog = ref(false)
const showTagDialog = ref(false)
const showDateDialog = ref(false)
const showThemeLimitAlert = ref(false)
const themeLimitMessage = ref('')

// Location filter state
const locationSearch = ref('')
const selectedLocationFilter = ref('')
const availableLocations = ref([])
const filteredLocations = ref([])

// Tag filter state (separate from existing selectedTagFilter)
const tagSearch = ref('')
const availableTags = ref([])
const filteredTags = ref([])

// Date filter state
const selectedDateFilter = ref(null)
const dateRange = ref({
  from: null,
  to: null
})

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

const outputOptions = ref([
  { label: 'PDF Document', value: 'PDF' },
  { label: 'JPG Image', value: 'JPG' }
])

const themeOptions = ref([])
const loadingThemes = ref(false)

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

const gridLayoutOptions = ref([
  { label: '1 memory per page (1x1)', value: '1x1' },
  { label: '2 memories per page (2x1)', value: '2x1' },
  { label: '4 memories per page (2x2)', value: '2x2' },
  { label: '6 memories per page (3x2)', value: '3x2' },
  { label: '9 memories per page (3x3)', value: '3x3' },
  { label: '12 memories per page (3x4)', value: '3x4' },
  { label: '16 memories per page (4x4)', value: '4x4' }
])

const memoryShapeOptions = ref([
  { label: 'Original (keep natural aspect ratio)', value: 'original' },
  { label: 'Magic (AI chooses best shape)', value: 'magic' }
])

const memoryEventOptions = ref([
  { label: 'Vacation', value: 'vacation' },
  { label: 'Birthday', value: 'birthday' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Graduation', value: 'graduation' },
  { label: 'Family Trip', value: 'family_trip' },
  { label: 'Other (custom)', value: 'custom' }
])

// Database composable
const { $supabase: supabase } = useNuxtApp()

// Computed properties
const showDialog = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

const filteredAssets = computed(() => {
  let filtered = availableAssets.value

  // Apply location filter
  if (selectedLocationFilter.value) {
    filtered = filtered.filter(asset => 
      asset.location && asset.location === selectedLocationFilter.value
    )
  }

  // Apply tag filter
  if (selectedTagFilter.value && selectedTagFilter.value.length > 0) {
    filtered = filtered.filter(asset => {
      const assetTags = [...(asset.tags || []), ...(asset.user_tags || [])]
      return selectedTagFilter.value.some(tag => assetTags.includes(tag))
    })
  }

  // Apply date filter
  if (selectedDateFilter.value) {
    filtered = filtered.filter(asset => {
      if (!asset.asset_date) return false
      const assetDate = new Date(asset.asset_date)
      const from = selectedDateFilter.value.from ? new Date(selectedDateFilter.value.from) : null
      const to = selectedDateFilter.value.to ? new Date(selectedDateFilter.value.to) : null
      
      if (from && assetDate < from) return false
      if (to && assetDate > to) return false
      return true
    })
  }

  return filtered
})

const computedAvailableTags = computed(() => {
  if (!Array.isArray(availableAssets.value)) return 
  const allTags = new Set()
  availableAssets.value.forEach(asset => {
    if (asset.tags && Array.isArray(asset.tags)) {
      asset.tags.forEach(tag => allTags.add(tag))
    }
  })
  return Array.from(allTags).map(tag => ({ label: tag, value: tag }))
})

// Calculate page count based on grid layout and number of selected assets
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

// Watch for initial data changes
watch(() => props.initialData, (val) => {
  if (val && Object.keys(val).length > 0) {
    // Reset form to defaults first, then apply initial data
    form.value = {
      ai_supplemental_prompt: '',
      layoutType: 'grid', // Default to grid for traditional memory books
      printSize: '8.5x11',
      quality: 'standard',
      medium: 'digital',
      output: 'PDF', // Default to PDF
      theme_id: null, // Will be set when themes are loaded
      memoryEvent: '',
      customMemoryEvent: '',
      backgroundType: 'white',
      backgroundOpacity: 30,
      includeCaptions: true,
      autoEnhance: false,
      gridLayout: '2x2',
      memoryShape: 'original',
      ...val // Override with initial data
    }
  }
}, { immediate: true })

// Watch for layout type changes to reset theme when not using theme layout
watch(() => form.value.layoutType, (newLayoutType) => {
  if (newLayoutType !== 'theme') {
    form.value.theme_id = null
  }
})

// Watch for initial selected assets
watch(() => props.initialSelectedAssets, (val) => {
  if (val && Array.isArray(val)) {
    selectedAssets.value = [...val]
  }
}, { immediate: true })

// Asset selection functions
const openAssetSelector = async () => {
  loadingAssets.value = true
  try {
    const allApprovedAssets = await db.assets.getAssets({ approved: true })
    availableAssets.value = allApprovedAssets || []     // Set current selection
    selectedMemories.value = selectedAssets.value.map(asset => asset.id)
    selectedTagFilter.value = []
    showAssetSelector.value = true
  } catch (error) {
    console.error('Error loading assets for memory selection:', error)
  } finally {
    loadingAssets.value = false
  }
}

const closeAssetSelector = () => {
  showAssetSelector.value = false
  selectedMemories.value = []
  selectedTagFilter.value = []
}

const toggleMemorySelection = (assetId) => {
  const index = selectedMemories.value.indexOf(assetId)
  if (index > -1) {
    // Remove photo - always allowed
    selectedMemories.value.splice(index, 1)
  } else {
    // Add photo - check theme limits
    if (form.value.layoutType === 'theme' && selectedThemePhotoCount.value) {
      if (selectedMemories.value.length >= selectedThemePhotoCount.value) {
        // Get theme name for error message
        const selectedTheme = themeOptions.value.find(theme => theme.value === form.value.theme_id)
        const themeName = selectedTheme ? selectedTheme.label.split(' (')[0] : 'this theme'
        
        themeLimitMessage.value = `The "${themeName}" theme only uses ${selectedThemePhotoCount.value} photos. Please deselect some photos first.`
        showThemeLimitAlert.value = true
        return
      }
    }
    selectedMemories.value.push(assetId)
  }
}

const selectAllMemories = () => {
  selectedMemories.value = filteredAssets.value.map(asset => asset.id)
}

const saveSelectedMemories = () => {
  selectedAssets.value = availableAssets.value.filter(asset => selectedMemories.value.includes(asset.id))
  showAssetSelector.value = false
}

const removeAsset = (assetId) => {
  selectedAssets.value = selectedAssets.value.filter(asset => asset.id !== assetId)
}

const clearTagFilter = () => {
  selectedTagFilter.value = []
}

const filterMemories = () => {
  // This is handled by the computed property
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Location dialog methods
const openLocationDialog = () => {
  showLocationDialog.value = true
  // Extract unique locations from available assets
  const locations = [...new Set(availableAssets.value
    .map(asset => asset.location)
    .filter(location => location && location.trim() !== ''))]
  availableLocations.value = locations
  filteredLocations.value = locations
}

const closeLocationDialog = () => {
  showLocationDialog.value = false
  locationSearch.value = ''
}

const filterLocations = () => {
  if (!locationSearch.value) {
    filteredLocations.value = availableLocations.value
  } else {
    filteredLocations.value = availableLocations.value.filter(location =>
      location.toLowerCase().includes(locationSearch.value.toLowerCase())
    )
  }
}

const selectLocation = (location) => {
  selectedLocationFilter.value = location
}

const clearLocationFilter = () => {
  selectedLocationFilter.value = ''
}

const applyLocationFilter = () => {
  showLocationDialog.value = false
  // The filtering will be handled by the computed property
}

// Tag dialog methods
const openTagDialog = () => {
  showTagDialog.value = true
  // Extract unique tags from available assets
  const tags = [...new Set(availableAssets.value
    .flatMap(asset => [...(asset.tags || []), ...(asset.user_tags || [])])
    .filter(tag => tag && tag.trim() !== ''))]
  availableTags.value = tags
  filteredTags.value = tags
}

const closeTagDialog = () => {
  showTagDialog.value = false
  tagSearch.value = ''
}

const filterTags = () => {
  if (!tagSearch.value) {
    filteredTags.value = availableTags.value
  } else {
    filteredTags.value = availableTags.value.filter(tag =>
      tag.toLowerCase().includes(tagSearch.value.toLowerCase())
    )
  }
}

const toggleTagSelection = (tag) => {
  const index = selectedTagFilter.value.indexOf(tag)
  if (index > -1) {
    selectedTagFilter.value.splice(index, 1)
  } else {
    selectedTagFilter.value.push(tag)
  }
}

const removeTag = (tag) => {
  const index = selectedTagFilter.value.indexOf(tag)
  if (index > -1) {
    selectedTagFilter.value.splice(index, 1)
  }
}

const applyTagFilter = () => {
  showTagDialog.value = false
  // The filtering will be handled by the computed property
}

// Date dialog methods
const openDateDialog = () => {
  showDateDialog.value = true
  // Reset date range
  dateRange.value = { from: null, to: null }
}

const closeDateDialog = () => {
  showDateDialog.value = false
  dateRange.value = { from: null, to: null }
}

const setDatePreset = (preset) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (preset) {
    case 'lastWeek':
      dateRange.value = {
        from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        to: today
      }
      break
    case 'lastMonth':
      dateRange.value = {
        from: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
        to: today
      }
      break
    case 'last3Months':
      dateRange.value = {
        from: new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()),
        to: today
      }
      break
    case 'lastYear':
      dateRange.value = {
        from: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
        to: today
      }
      break
  }
}

const clearDateFilter = () => {
  selectedDateFilter.value = null
  dateRange.value = { from: null, to: null }
}

const applyDateFilter = () => {
  if (dateRange.value.from || dateRange.value.to) {
    selectedDateFilter.value = {
      from: dateRange.value.from,
      to: dateRange.value.to
    }
  }
  showDateDialog.value = false
}

const formatDateRange = (range) => {
  if (!range) return ''
  const from = range.from ? new Date(range.from).toLocaleDateString() : 'Any'
  const to = range.to ? new Date(range.to).toLocaleDateString() : 'Any'
  return `${from} to ${to}`
}

// Fetch themes when component mounts
onMounted(() => {
  fetchThemes()
})

function handleSubmit() {
  emit('submit', {
    ...form.value,
    memoryEvent: form.value.memoryEvent === 'custom' ? form.value.customMemoryEvent : form.value.memoryEvent,
    backgroundType: form.value.backgroundType,
    backgroundOpacity: form.value.backgroundOpacity,
    selectedAssets: selectedAssets.value
  })
}
</script> 