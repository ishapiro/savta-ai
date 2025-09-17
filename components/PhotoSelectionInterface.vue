<template>
  <div class="photo-selection-interface">
    <!-- Photo Selection Method UI -->
    <div v-if="!showPhotoLibrary" class="space-y-3 w-full max-w-xs mx-auto sm:max-w-md md:max-w-lg lg:max-w-2xl">
      <!-- Keep Same Photos Option (Recreate Mode Only) -->
      <div v-if="isRecreateMode" class="relative cursor-pointer group" @click="selectMethod('keep_same')">
        <div class="mx-1 sm:mx-2 border-2 rounded-xl p-3 text-center transition-all duration-300 h-full min-h-[60px] flex flex-col items-center justify-center"
          :class="methodValue === 'keep_same' 
            ? 'border-brand-accent bg-gradient-to-br from-brand-accent/10 to-brand-highlight/10 shadow-xl scale-105' 
            : 'border-gray-200 hover:border-brand-accent/50 hover:bg-gradient-to-br hover:from-brand-accent/5 hover:to-brand-highlight/5 hover:shadow-lg'">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-accent to-brand-highlight rounded-full mx-auto mb-1 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <i class="pi pi-refresh text-sm sm:text-lg text-white"></i>
          </div>
          <div class="text-sm sm:text-base font-bold text-gray-900 mb-1">Keep the same photos</div>
          <div class="text-xs text-gray-600">Use the same photos from your original memory card and just update the story and layout.</div>
          <div v-if="methodValue === 'keep_same'" class="absolute top-1 right-1">
            <div class="w-5 h-5 bg-brand-accent rounded-full flex items-center justify-center shadow-lg">
              <i class="pi pi-check text-white text-xs"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Savta Selects Tile (Wide Button) -->
      <div class="relative cursor-pointer group" @click="selectMethod('last_100')">
        <div class="mx-1 sm:mx-2 border-2 rounded-xl p-3 text-center transition-all duration-300 h-full min-h-[60px] flex flex-col items-center justify-center"
          :class="methodValue === 'last_100' 
            ? 'border-brand-flash bg-gradient-to-br from-brand-flash/10 to-brand-highlight/10 shadow-xl scale-105' 
            : 'border-gray-200 hover:border-brand-flash/50 hover:bg-gradient-to-br hover:from-brand-flash/5 hover:to-brand-highlight/5 hover:shadow-lg'">
          <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-flash to-brand-highlight rounded-full mx-auto mb-1 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <i class="pi pi-images text-sm sm:text-lg text-white"></i>
          </div>
          <div class="text-sm sm:text-base font-bold text-gray-900 mb-1">I'll choose for you</div>
          <div class="text-xs text-gray-600">I'll search your photos for matches to "{{ title || 'your memory' }}" 
            and pick the best photos from your recent uploads (up to 100 photos).</div>
          <div v-if="methodValue === 'last_100'" class="absolute top-1 right-1">
            <div class="w-5 h-5 bg-brand-flash rounded-full flex items-center justify-center shadow-lg">
              <i class="pi pi-check text-white text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Other Options Grid (2x2) -->
      <div class="grid grid-cols-2 gap-1 sm:gap-2">
        <!-- Photo Library Selection Tile -->
        <div class="relative cursor-pointer group" @click="selectPhotoLibrary">
                      <div class="border-2 rounded-lg sm:rounded-xl p-1 sm:p-2 text-center transition-all duration-300 h-full min-h-[35px] sm:min-h-[45px] lg:min-h-[50px] flex flex-col items-center justify-center"
              :class="methodValue === 'photo_library' 
                ? 'border-brand-flash bg-gradient-to-br from-brand-flash/10 to-brand-highlight/10 shadow-xl scale-105' 
                : 'border-gray-200 hover:border-brand-flash/50 hover:bg-gradient-to-br hover:from-brand-flash/5 hover:to-brand-highlight/5 hover:shadow-lg'">
            <div class="w-3 h-3 sm:w-5 sm:h-5 lg:w-8 lg:h-8 bg-gradient-to-br from-brand-secondary to-brand-flash rounded-full mx-auto mb-0.5 sm:mb-1 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-folder-open text-xs text-white"></i>
            </div>
            <div class="text-xs font-bold text-gray-900 mb-0.5 sm:mb-1">Photo Box</div>
            <div class="text-xs text-gray-600 leading-tight">Choose exactly which photos you want from your Photo Box.</div>
                            <div v-if="methodValue === 'photo_library'" class="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
              <div class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-brand-flash rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-check text-white text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- By Location Tile -->
        <div class="relative cursor-pointer group" @click="selectMethod('geo_code')">
                      <div class="border-2 rounded-lg sm:rounded-xl p-1 sm:p-2 text-center transition-all duration-300 h-full min-h-[35px] sm:min-h-[45px] lg:min-h-[50px] flex flex-col items-center justify-center"
              :class="methodValue === 'geo_code' 
                ? 'border-brand-flash bg-gradient-to-br from-brand-flash/10 to-brand-highlight/10 shadow-xl scale-105' 
                : 'border-gray-200 hover:border-brand-flash/50 hover:bg-gradient-to-br hover:from-brand-flash/5 hover:to-brand-highlight/5 hover:shadow-lg'">
            <div class="w-3 h-3 sm:w-5 sm:h-5 lg:w-8 lg:h-8 bg-gradient-to-br from-brand-secondary to-brand-flash rounded-full mx-auto mb-0.5 sm:mb-1 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-map-marker text-xs text-white"></i>
            </div>
            <div class="text-xs font-bold text-gray-900 mb-0.5 sm:mb-1">By location</div>
            <div class="text-xs text-gray-600 leading-tight">Choose a country, city, or state. 
              I'll pick the best photos from this location (up to 100 most recent).</div>
                            <div v-if="methodValue === 'geo_code'" class="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
              <div class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-brand-flash rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-check text-white text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- By Date Tile -->
        <div class="relative cursor-pointer group" @click="selectMethod('date_range')">
                      <div class="border-2 rounded-lg sm:rounded-xl p-1 sm:p-2 text-center transition-all duration-300 h-full min-h-[35px] sm:min-h-[45px] lg:min-h-[50px] flex flex-col items-center justify-center"
              :class="methodValue === 'date_range' 
                ? 'border-brand-flash bg-gradient-to-br from-brand-flash/10 to-brand-highlight/10 shadow-xl scale-105' 
                : 'border-gray-200 hover:border-brand-flash/50 hover:bg-gradient-to-br hover:from-brand-flash/5 hover:to-brand-highlight/5 hover:shadow-lg'">
            <div class="w-3 h-3 sm:w-5 sm:h-5 lg:w-8 lg:h-8 bg-gradient-to-br from-brand-highlight to-brand-flash rounded-full mx-auto mb-0.5 sm:mb-1 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-calendar-plus text-xs text-white"></i>
            </div>
            <div class="text-xs font-bold text-gray-900 mb-0.5 sm:mb-1">By date</div>
            <div class="text-xs text-gray-600 leading-tight">Choose a specific time period. 
              I'll pick the best photos from this date range (up to 100 most recent).</div>
                            <div v-if="methodValue === 'date_range'" class="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
              <div class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-brand-flash rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-check text-white text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- By Tags Tile -->
        <div class="relative cursor-pointer group" @click="selectMethod('tags')">
                      <div class="border-2 rounded-lg sm:rounded-xl p-1 sm:p-2 text-center transition-all duration-300 h-full min-h-[35px] sm:min-h-[45px] lg:min-h-[50px] flex flex-col items-center justify-center"
              :class="methodValue === 'tags' 
                ? 'border-brand-flash bg-gradient-to-br from-brand-flash/10 to-brand-highlight/10 shadow-xl scale-105' 
                : 'border-gray-200 hover:border-brand-flash/50 hover:bg-gradient-to-br hover:from-brand-flash/5 hover:to-brand-highlight/5 hover:shadow-lg'">
            <div class="w-3 h-3 sm:w-5 sm:h-5 lg:w-8 lg:h-8 bg-gradient-to-br from-brand-header to-brand-flash rounded-full mx-auto mb-0.5 sm:mb-1 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-tags text-xs text-white"></i>
            </div>
            <div class="text-xs font-bold text-gray-900 mb-0.5 sm:mb-1">By tags</div>
            <div class="text-xs text-gray-600 leading-tight">Choose a tag or person. 
              I'll pick the best photos with these tags (up to 100 most recent).</div>
                            <div v-if="methodValue === 'tags'" class="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
              <div class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-brand-flash rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-check text-white text-xs"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conditional UI Sections -->
    <!-- Date Range Selection -->
    <div ref="dateRangeForm" v-if="methodValue === 'date_range'" class="bg-gradient-to-r from-brand-flash/10 to-brand-highlight/10 rounded-xl p-4 sm:p-6 border border-brand-flash/20 mt-6 w-full max-w-md mx-auto">
      <h4 class="font-semibold text-brand-flash mb-4 text-center">Select Date Range</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">Start Date</label>
          <Calendar v-model="dateRangeValue.start" dateFormat="mm/dd/yy" placeholder="Select start date" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">End Date</label>
          <Calendar v-model="dateRangeValue.end" dateFormat="mm/dd/yy" placeholder="Select end date" class="w-full" />
        </div>
      </div>
    </div>

    <!-- Tag Selection -->
    <div ref="tagsForm" v-if="methodValue === 'tags'" class="bg-gradient-to-r from-brand-flash/10 to-brand-highlight/10 rounded-xl p-4 sm:p-6 border border-brand-flash/20 mt-6 w-full max-w-md mx-auto">
      <h4 class="font-semibold text-brand-flash mb-4 text-center">Select Tags</h4>
              <MultiSelect
          v-model="selectedTagsValue"
          :options="computedAvailableTags"
        option-label="label"
        option-value="value"
        placeholder="Choose tags..."
        class="w-full"
        :show-toggle-all="false"
      />
      <p class="text-sm text-brand-flash mt-3 text-center">I'll find photos that have any of these tags</p>
    </div>

    <!-- Location Selection -->
    <div ref="locationForm" v-if="methodValue === 'geo_code'" class="bg-gradient-to-r from-brand-flash/10 to-brand-highlight/10 rounded-xl p-4 sm:p-6 border border-brand-flash/20 mt-6 w-full max-w-md mx-auto">
      <h4 class="font-semibold text-brand-flash mb-4 text-center">Select Location</h4>
      <div class="space-y-4">
        <!-- Location Type Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">Location Type</label>
          <Dropdown
            v-model="locationTypeValue"
            :options="[
              { label: 'Country', value: 'country' },
              { label: 'State/Province', value: 'state' },
              { label: 'City', value: 'city' }
            ]"
            option-label="label"
            option-value="value"
            placeholder="Select location type..."
            class="w-full"
          />
        </div>

        <!-- Country Selection -->
        <div v-if="locationTypeValue === 'country'">
          <label class="block text-sm font-medium text-gray-900 mb-2">Select Country</label>
          <Dropdown
            v-model="selectedLocationValue"
            :options="availableCountries"
            option-label="label"
            option-value="value"
            placeholder="Choose a country..."
            class="w-full"
            :filter="true"
            filter-placeholder="Search countries..."
          />
        </div>

        <!-- State Selection -->
        <div v-if="locationTypeValue === 'state'">
          <label class="block text-sm font-medium text-gray-900 mb-2">Select State/Province</label>
          <Dropdown
            v-model="selectedLocationValue"
            :options="availableStates"
            option-label="label"
            option-value="value"
            placeholder="Choose a state..."
            class="w-full"
            :filter="true"
            filter-placeholder="Search states..."
          />
        </div>

        <!-- City Selection -->
        <div v-if="locationTypeValue === 'city'">
          <label class="block text-sm font-medium text-gray-900 mb-2">Select City</label>
          <Dropdown
            v-model="selectedLocationValue"
            :options="availableCities"
            option-label="label"
            option-value="value"
            placeholder="Choose a city..."
            class="w-full"
            :filter="true"
            filter-placeholder="Search cities..."
          />
        </div>

        <!-- Selected Location Display -->
        <div v-if="selectedLocationValue" class="bg-brand-flash/20 rounded-lg p-3 border border-brand-flash/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i class="pi pi-map-marker text-brand-flash"></i>
                              <span class="text-sm font-medium text-gray-900">
                  {{ locationTypeValue === 'country' ? 'Country' : locationTypeValue === 'state' ? 'State' : 'City' }}: {{ selectedLocationValue }}
                </span>
            </div>
                          <Button
                label="Change"
                icon="pi pi-edit"
                size="small"
                @click="selectedLocationValue = null"
              class="bg-brand-flash border-0 text-xs px-2 py-1"
            />
          </div>
        </div>

                    <p class="text-sm text-brand-flash mt-3 text-center">
              I'll find photos from {{ locationTypeValue === 'country' ? 'this country' : locationTypeValue === 'state' ? 'this state/province' : 'this city' }}
            </p>
      </div>
    </div>

    <!-- Photo Library Selection UI -->
    <div v-if="showPhotoLibrary && !loadingAssets" class="space-y-3 sm:space-y-4 px-4 overflow-x-hidden">
      <div class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 w-full mx-auto">
        <!-- Header with close button -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Select Photos from Your Library</h3>
          <button
            @click="closePhotoLibrary"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-flash"
            aria-label="Close Photo Box"
          >
            <i class="pi pi-times text-gray-600"></i>
          </button>
        </div>
        <label class="block text-sm font-medium text-gray-900 mb-2">Filter by Tags</label>
        <div class="flex gap-2 mb-3">
          <MultiSelect
            v-model="selectedTagFilterValue"
            :options="computedAvailableTags"
            option-label="label"
            option-value="value"
            placeholder="All photos"
            class="flex-1"
            :show-toggle-all="false"
          />
                      <Button
              v-if="selectedTagFilterValue && selectedTagFilterValue.length > 0"
              icon="pi pi-times"
              size="small"
              @click="selectedTagFilterValue = []"
            class="px-2"
            v-tooltip.top="'Clear filter'"
          />
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 max-h-64 sm:max-h-80 overflow-y-auto">
                      <div
              v-for="asset in filteredAssets"
              :key="asset.id"
              class="relative group cursor-pointer touch-manipulation magic-photo-card"
              :class="{
                'opacity-60 pointer-events-none': selectedMemoriesValue.length >= maxPhotoCount && !selectedMemoriesValue.includes(asset.id),
                'ring-4 ring-purple-400 ring-offset-2 scale-105 z-10 bg-purple-100 shadow-xl': selectedMemoriesValue.includes(asset.id)
              }"
            @click="toggleMemorySelection(asset.id)"
          >
            <div v-if="selectedMemoriesValue.includes(asset.id)" class="absolute inset-0 bg-purple-200/40 rounded-lg z-20 flex items-center justify-center pointer-events-none transition-all duration-200">
              <i class="pi pi-check text-4xl text-purple-500 animate-bounce"></i>
            </div>
            <div class="aspect-square bg-gradient-to-br from-brand-navigation via-purple-50 to-blue-100 rounded-lg overflow-hidden border-2 border-brand-highlight hover:border-purple-400 transition-colors">
              <img
                v-if="asset.storage_url"
                :src="asset.storage_url"
                :alt="asset.user_caption || asset.ai_caption || 'Memory'"
                class="w-full h-full object-contain bg-white"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <i class="pi pi-image text-gray-400 text-lg"></i>
              </div>
            </div>
            <div class="mt-1 text-center">
              <CaptionRenderer 
                :caption="asset.user_caption || asset.ai_caption || `Photo ${asset.id.slice(-4)}`"
                :max-width="140"
                :max-height="50"
                :font-size="11"
              />
            </div>
          </div>
        </div>
                  <div class="mt-2 text-xs text-gray-600 text-center">
            <span>{{ selectedMemoriesValue.length }} selected (up to {{ maxPhotoCount }} photo{{ maxPhotoCount !== 1 ? 's' : '' }})</span>
            <span v-if="selectedTagFilterValue && selectedTagFilterValue.length > 0"> • Filtered by: {{ selectedTagFilterValue.join(', ') }}</span>
          </div>
      </div>
    </div>

    <!-- Loading State for Photo Library -->
    <div v-else-if="showPhotoLibrary && loadingAssets" class="flex items-center justify-center py-8 relative">
      <!-- Close button for loading state -->
      <button
        @click="closePhotoLibrary"
        class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-flash"
        aria-label="Close Memory Box"
      >
        <i class="pi pi-times text-gray-600"></i>
      </button>
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-3xl text-brand-header mb-3"></i>
        <p class="text-sm text-gray-600">Loading your Photo Box...</p>
      </div>
    </div>

    <!-- Upload New Photos Section -->
    <div v-if="!showPhotoLibrary" class="mt-3 pt-2 border-t border-gray-200 w-full max-w-md mx-auto">
      <div class="text-center">
        <p class="text-sm text-gray-600 mb-2">Need more photos?</p>
        <button
          @click="$emit('upload-photos')"
          class="bg-brand-dialog-edit text-white font-semibold rounded-full px-4 py-2 text-sm shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
          :disabled="isUploading"
        >
          <i class="pi pi-upload"></i>
          <span v-if="!isUploading">🌸 Upload New Photos 🌸</span>
          <span v-else>🌸 Uploading and working our magic... 🌸</span>
        </button>
        <p class="text-xs text-gray-500 mt-2">New photos will be automatically approved and available for selection</p>
      </div>
    </div>

    <!-- Upload New Photos Section for Photo Library -->
    <div v-if="showPhotoLibrary" class="mt-4 pt-4 border-t border-gray-200">
      <div class="text-center">
        <p class="text-sm text-gray-600 mb-3">Don't see the photos you want?</p>
        <button
          @click="$emit('upload-photos')"
          class="bg-gradient-to-r from-purple-500 to-brand-secondary hover:from-purple-600 hover:to-brand-secondary text-white font-semibold rounded-lg px-4 py-2 text-sm shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
          :disabled="isUploading"
        >
          <i class="pi pi-upload"></i>
          <span v-if="!isUploading">✨ Upload New Photos ✨</span>
          <span v-else>✨ Uploading and working our magic... ✨</span>
        </button>
        <p class="text-xs text-gray-500 mt-2">New photos will be automatically approved and available for selection</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick } from 'vue'
import CaptionRenderer from './CaptionRenderer.vue'

// Props
const props = defineProps({
  // Photo selection method
  method: {
    type: String,
    default: 'last_100'
  },
  // Title for context (used in "I'll choose for you" description)
  title: {
    type: String,
    default: ''
  },
  // Date range for date_range method
  dateRange: {
    type: Object,
    default: () => ({ start: null, end: null })
  },
  // Selected tags for tags method
  selectedTags: {
    type: Array,
    default: () => []
  },
  // Available tags for selection
  computedAvailableTags: {
    type: Array,
    default: () => []
  },
  // Location selection for geo_code method
  locationType: {
    type: String,
    default: 'country'
  },
  selectedLocation: {
    type: String,
    default: ''
  },
  availableCountries: {
    type: Array,
    default: () => []
  },
  availableStates: {
    type: Array,
    default: () => []
  },
  availableCities: {
    type: Array,
    default: () => []
  },
  // Photo library selection
  selectedMemories: {
    type: Array,
    default: () => []
  },
  selectedTagFilter: {
    type: Array,
    default: () => []
  },
  filteredAssets: {
    type: Array,
    default: () => []
  },
  loadingAssets: {
    type: Boolean,
    default: false
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  // Maximum number of photos that can be selected (from theme or grid layout)
  maxPhotoCount: {
    type: Number,
    default: 12
  },
  // Whether we're in recreate mode
  isRecreateMode: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'update:method',
  'update:dateRange',
  'update:selectedTags',
  'update:locationType',
  'update:selectedLocation',
  'update:selectedMemories',
  'update:selectedTagFilter',
  'upload-photos',
  'photo-library-selected',
  'no-photos-found',
  'close-photo-library'
])

// Computed properties with getters and setters for v-model
const methodValue = computed({
  get: () => props.method,
  set: (value) => emit('update:method', value)
})

const dateRangeValue = computed({
  get: () => props.dateRange,
  set: (value) => emit('update:dateRange', value)
})

const selectedTagsValue = computed({
  get: () => props.selectedTags,
  set: (value) => emit('update:selectedTags', value)
})

const locationTypeValue = computed({
  get: () => props.locationType,
  set: (value) => emit('update:locationType', value)
})

const selectedLocationValue = computed({
  get: () => props.selectedLocation,
  set: (value) => emit('update:selectedLocation', value)
})

// Validation function to check if photos are available for the current selection
const validatePhotoSelection = () => {
  console.log('🔍 [validatePhotoSelection] Called with method:', methodValue.value)
  console.log('🔍 [validatePhotoSelection] Available assets count:', props.filteredAssets.length)
  
  switch (methodValue.value) {
    case 'date_range':
      if (dateRangeValue.value.start || dateRangeValue.value.end) {
        const matchingPhotos = props.filteredAssets.filter(asset => {
          if (!asset.asset_date && !asset.created_at) return false
          
          const assetDate = asset.asset_date ? new Date(asset.asset_date) : new Date(asset.created_at)
          const start = dateRangeValue.value.start ? new Date(dateRangeValue.value.start) : null
          const end = dateRangeValue.value.end ? new Date(dateRangeValue.value.end) : null
          
          // If only start date is selected
          if (start && !end) {
            return assetDate >= start
          }
          
          // If only end date is selected
          if (!start && end) {
            return assetDate <= end
          }
          
          // If both dates are selected
          if (start && end) {
            return assetDate >= start && assetDate <= end
          }
          
          return true
        })
        
        if (matchingPhotos.length === 0) {
          emit('no-photos-found', {
            method: 'date_range',
            dateRange: dateRangeValue.value,
            message: `No photos found for the selected date range. Please try a different date range or choose another selection method.`
          })
          return false
        }
      }
      break
      
    case 'tags':
      if (selectedTagsValue.value.length > 0) {
        const matchingPhotos = props.filteredAssets.filter(asset => {
          if (!asset.tags || !Array.isArray(asset.tags)) return false
          return selectedTagsValue.value.some(tag => asset.tags.includes(tag))
        })
        
        if (matchingPhotos.length === 0) {
          emit('no-photos-found', {
            method: 'tags',
            tags: selectedTagsValue.value,
            message: `No photos found with the selected tags. Please try different tags or choose another selection method.`
          })
          return false
        }
      }
      break
      
    case 'geo_code':
      if (selectedLocationValue.value) {
        const matchingPhotos = props.filteredAssets.filter(asset => {
          if (!selectedLocationValue.value) return false
          
          // Check both location_data structure and direct fields
          let assetCountry, assetState, assetCity
          
          if (asset.location_data) {
            assetCountry = asset.location_data.country
            assetState = asset.location_data.state
            assetCity = asset.location_data.city
          } else {
            assetCountry = asset.country
            assetState = asset.state
            assetCity = asset.city
          }
          
          switch (locationTypeValue.value) {
            case 'country':
              return assetCountry === selectedLocationValue.value
            case 'state':
              return assetState === selectedLocationValue.value
            case 'city':
              return assetCity === selectedLocationValue.value
            default:
              return false
          }
        })
        
        if (matchingPhotos.length === 0) {
          emit('no-photos-found', {
            method: 'geo_code',
            location: selectedLocationValue.value,
            locationType: locationTypeValue.value,
            message: `No photos found for the selected location. Please try a different location or choose another selection method.`
          })
          return false
        }
      }
      break
  }
  
  return true
}

// Expose the validation function so parent can call it
defineExpose({
  validatePhotoSelection
})

const selectedMemoriesValue = computed({
  get: () => props.selectedMemories,
  set: (value) => emit('update:selectedMemories', value)
})

const selectedTagFilterValue = computed({
  get: () => props.selectedTagFilter,
  set: (value) => emit('update:selectedTagFilter', value)
})

// Refs for scrolling
const dateRangeForm = ref(null)
const tagsForm = ref(null)
const locationForm = ref(null)

// Computed
const showPhotoLibrary = computed(() => props.method === 'photo_library')

// Methods
const selectMethod = (newMethod) => {
  emit('update:method', newMethod)
  
  // Scroll to the appropriate form after a short delay to ensure DOM is updated
  nextTick(() => {
    setTimeout(() => {
      let targetElement = null
      
      switch (newMethod) {
        case 'date_range':
          targetElement = dateRangeForm.value
          break
        case 'tags':
          targetElement = tagsForm.value
          break
        case 'geo_code':
          targetElement = locationForm.value
          break
      }
      
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        })
      }
    }, 100) // Small delay to ensure the form is rendered
  })
}

const selectPhotoLibrary = () => {
  console.log('🔍 [PhotoSelectionInterface] selectPhotoLibrary clicked!')
  console.log('🔍 [PhotoSelectionInterface] Current method before:', props.method)
  emit('update:method', 'photo_library')
  console.log('🔍 [PhotoSelectionInterface] Emitted update:method with photo_library')
  // Note: Don't emit 'photo-library-selected' here - that should only be emitted
  // when the user actually proceeds to the next step, not when they select the method
}

const closePhotoLibrary = () => {
  emit('update:method', 'last_100') // Reset to default method
  emit('update:selectedMemories', []) // Clear selected memories
  emit('close-photo-library') // Emit event to notify parent to go back to PHOTOS step
}

const toggleMemorySelection = (assetId) => {
  const newSelectedMemories = [...props.selectedMemories]
  const index = newSelectedMemories.indexOf(assetId)
  
  if (index > -1) {
    newSelectedMemories.splice(index, 1)
  } else if (newSelectedMemories.length < props.maxPhotoCount) {
    newSelectedMemories.push(assetId)
  }
  
  emit('update:selectedMemories', newSelectedMemories)
}
</script>

<style scoped>
.photo-selection-interface {
  /* Component-specific styles can be added here */
}
</style>
