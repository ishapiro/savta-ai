<template>
  <div>
    <!-- Combined Header and Toolbar -->
    <div class="mb-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 overflow-hidden">
      <!-- Top Row: Controls and Info -->
      <div class="flex items-center justify-between mb-2">
        <!-- Left: Instructions Button and Snap Controls -->
        <div class="flex items-center gap-3">
          <button
            @click="showInstructionsDialog = true"
            class="flex items-center gap-1.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-medium transition-colors"
          >
            <i class="pi pi-info-circle text-sm"></i>
            <span>Help</span>
          </button>
          
          <!-- Snap Controls -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="snapToGrid" 
                  v-model="snapEnabled"
                      class="w-4 h-4 text-red-500 bg-white rounded ring-2 ring-brand-primary focus:ring-brand-success focus:ring-2 checked:bg-red-500 checked:border-red-500"
                />
                <label for="snapToGrid" class="text-sm text-brand-primary/70 cursor-pointer pl-2">Snap to Grid</label>
    </div>
    
            <!-- Grid Size Input -->
            <div class="flex items-center gap-1">
              <label class="text-gray-600 text-xs font-medium">Grid Size:</label>
              <InputText
                v-model="gridSize"
                type="number"
                min="5"
                max="100"
                class="w-12 h-6 text-xs px-1"
                @input="updateGridSize"
              />
            </div>
          </div>
        </div>
        
        <!-- Right: Card Size Info and Edit Defaults Mode -->
        <div class="flex items-center gap-3">
          <!-- Card Size Info -->
          <div class="flex items-center gap-3 text-xs text-gray-600">
            <span class="bg-white px-2 py-1 rounded border">
              <strong>{{ sizeDimensions.width }}"×{{ sizeDimensions.height }}"</strong>
              <span class="text-gray-500 ml-1">({{ Math.round(sizeDimensions.width * 25.4) }}×{{ Math.round(sizeDimensions.height * 25.4) }}mm)</span>
            </span>
            <span class="bg-white px-2 py-1 rounded border">
              <strong>{{ cardDimensions.width }}×{{ cardDimensions.height }}px</strong>
              <span class="text-gray-500 ml-1">({{ SCALE_FACTOR.toFixed(2) }}x)</span>
            </span>
          </div>
          
          <!-- Edit Defaults Mode Indicator -->
          <div v-if="isEditDefaultsMode" class="flex items-center gap-2 text-xs text-amber-800 bg-amber-100 px-2 py-1 rounded border border-amber-200">
            <i class="pi pi-exclamation-triangle text-amber-600"></i>
            <span class="font-medium">Edit Defaults Mode</span>
            <span class="text-amber-600">•</span>
            <span>Size: <strong>{{ props.size }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Action Buttons -->
      <div class="flex flex-wrap gap-1.5">
        <!-- Primary Actions -->
        <button @click="addPhoto" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors">
          <i class="pi pi-image text-xs mr-1"></i>Add Photo
        </button>
      <button 
        @click="addStory" 
        :disabled="!!layoutData.story"
          class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
          <i class="pi pi-file-edit text-xs mr-1"></i>Add Story
      </button>
      <button 
        v-if="layoutData.story"
        @click="deleteStory" 
          class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
      >
          <i class="pi pi-trash text-xs mr-1"></i>Remove Story
      </button>
        <button @click="resetLayout" class="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-medium transition-colors">
          <i class="pi pi-refresh text-xs mr-1"></i>Reset
        </button>
        <button @click="showNewLayoutDialog = true" class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors">
          <i class="pi pi-sync text-xs mr-1"></i>New Layout
        </button>
        <button @click="saveLayout" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
          <i class="pi pi-save text-xs mr-1"></i>Save
        </button>
        <button
          @click="showPasswordDialog = true"
          class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
        >
          <i class="pi pi-cog text-xs mr-1"></i>Defaults
        </button>
        <button
          @click="openJsonDialog"
          class="px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
        >
          <i class="pi pi-code text-xs mr-1"></i>JSON
        </button>
        
        <!-- Selection Tools -->
      <button
          @click="clearSelection" 
          :disabled="selectedBoxes.length === 0"
          class="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="pi pi-times text-xs mr-1"></i>Clear ({{ selectedBoxes.length }})
        </button>
        <button 
          @click="makeSameSize" 
          :disabled="selectedBoxes.length < 2"
          class="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="pi pi-th-large text-xs mr-1"></i>Same Size
        </button>
        <button 
          @click="copySelectedBoxes" 
          :disabled="selectedBoxes.length === 0"
          class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="pi pi-copy text-xs mr-1"></i>Copy ({{ selectedBoxes.length }})
        </button>
        <button 
          @click="pasteCopiedBoxes" 
          :disabled="copiedBoxes.length === 0"
          class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="pi pi-paste text-xs mr-1"></i>Paste ({{ copiedBoxes.length }})
        </button>
        <button 
          @click="alignVertical" 
          :disabled="selectedBoxes.length < 2"
          class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="pi pi-align-left text-xs mr-1"></i>Align V
        </button>
        <button 
          @click="alignHorizontal" 
          :disabled="selectedBoxes.length < 2"
          class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="pi pi-align-center text-xs mr-1"></i>Align H
      </button>

        <!-- Edit Defaults Mode Buttons -->
        <button
          v-if="isEditDefaultsMode"
          @click="exitEditMode"
          class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium transition-colors"
        >
          <i class="pi pi-sign-out text-xs mr-1"></i>Exit Edit
        </button>
      <button
        v-if="isEditDefaultsMode"
        @click="saveEditedDefaults"
          class="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-medium transition-colors"
      >
          <i class="pi pi-check text-xs mr-1"></i>Save Default
      </button>
      </div>
    </div>

    <!-- Instructions Dialog -->
    <div v-if="showInstructionsDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-brand-secondary">Layout Editor Instructions</h3>
          <button
            @click="showInstructionsDialog = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="pi pi-times text-xl"></i>
          </button>
      </div>
        
        <div class="text-gray-700 space-y-4">
          <div>
            <h4 class="font-semibold text-brand-primary mb-2">Basic Controls</h4>
            <ul class="space-y-2 text-sm">
              <li>• <span class="font-semibold text-blue-600">Click and drag the blue dots</span> to move elements</li>
              <li>• <span class="font-semibold text-red-600">Click the red X</span> to delete an element</li>
              <li>• Use the <span class="font-semibold">Reset button</span> to restore default layout for current size</li>
            </ul>
    </div>

          <div>
            <h4 class="font-semibold text-brand-primary mb-2">Grid and Snapping</h4>
            <ul class="space-y-2 text-sm">
              <li>• Enable <span class="font-semibold">snap to 5mm grid</span> to align elements precisely</li>
              <li>• Grid lines appear at the specified interval when snap is enabled</li>
              <li>• Snapping works for both moving and resizing elements</li>
        </ul>
      </div>
          
          <div>
            <h4 class="font-semibold text-brand-primary mb-2">Multi-Select Features</h4>
            <ul class="space-y-2 text-sm">
              <li>• <span class="font-semibold text-indigo-600">Click on boxes</span> to select multiple elements</li>
              <li>• <span class="font-semibold text-indigo-600">Drag any selected box</span> to move all selected boxes together</li>
              <li>• Use <span class="font-semibold">"Same Size & Distribute"</span> to make selected boxes equal size and distribute horizontally with 10mm spacing</li>
            </ul>
    </div>

          <div>
            <h4 class="font-semibold text-brand-primary mb-2">Layout Management</h4>
            <ul class="space-y-2 text-sm">
              <li>• Add photos and stories using the buttons above the layout area</li>
              <li>• Use <span class="font-semibold">"Edit Defaults"</span> to modify default layouts (requires password)</li>
              <li>• Save your layout when finished</li>
            </ul>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end">
          <Button
            label="Got it!"
            @click="showInstructionsDialog = false"
            class="bg-brand-secondary hover:bg-brand-secondary/80"
          />
        </div>
      </div>
    </div>

    <!-- Password Dialog -->

    <!-- Password Dialog -->
    <div v-if="showPasswordDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 class="text-lg font-semibold text-brand-secondary mb-4">Editor Defaults Access</h3>
        <p class="text-brand-primary mb-4">Enter the password to edit default layouts:</p>
        <p class="text-sm text-gray-600 mb-4 italic">Hint: Think about education and innovation</p>
        
        <form @submit.prevent="checkPassword" class="space-y-4">
          <InputText
            v-model="password"
            type="password"
            placeholder="Enter password"
            class="w-full"
            autocomplete="current-password"
            aria-label="Password"
            @keyup.enter="checkPassword"
          />
          
          <div class="flex gap-3">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              class="flex-1"
              @click="cancelPassword"
            />
            <Button
              type="submit"
              label="Enter"
              class="flex-1"
              @click="checkPassword"
            />
          </div>
          
          <div v-if="passwordError" class="text-red-500 text-sm">
            {{ passwordError }}
          </div>
        </form>
      </div>
    </div>

    <!-- JSON Dialog -->
    <div v-if="showJsonDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 shadow-xl border-2 border-gray-200 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-brand-secondary">Edit Layout JSON</h3>
          <button
            @click="cancelJsonEdit"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="text-sm text-gray-600">
            <p>Edit the JSON below to modify the layout. The layout will be updated when you save.</p>
            <p class="text-xs text-gray-500 mt-1">Format: {"name": "Layout Name", "units": {...}, "orientation": "portrait", "story": {...}, "photos": [...]}</p>
          </div>
          
          <div class="border border-gray-300 rounded p-4 bg-gray-50">
            <textarea
              v-model="editableJsonContent"
              class="w-full h-96 p-3 border border-gray-300 rounded font-mono text-sm resize-none"
              placeholder="Enter JSON layout data..."
            ></textarea>
          </div>
          
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>JSON Editor - Edit the layout structure above</span>
            <span>{{ editableJsonContent.length }} characters</span>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="cancelJsonEdit"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            @click="copyJsonToClipboard"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            Copy to Clipboard
          </button>
          <button
            @click="saveJsonChanges"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Resize Dialog -->
    <div v-if="showResizeDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border-2 border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-brand-secondary">Resize Element</h3>
          <button
            @click="showResizeDialog = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="text-sm text-gray-600">
            <p>Current size: <strong>{{ resizeDialogData.currentWidth }}×{{ resizeDialogData.currentHeight }}px</strong></p>
            <p>Enter new dimensions in millimeters:</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Width (mm)</label>
              <InputText
                v-model="resizeDialogData.newWidthMm"
                type="number"
                placeholder="Width"
                class="w-full"
                min="1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Height (mm)</label>
              <InputText
                v-model="resizeDialogData.newHeightMm"
                type="number"
                placeholder="Height"
                class="w-full"
                min="1"
              />
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="showResizeDialog = false"
            class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            @click="applyResize"
            class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>

    <div 
      class="relative overflow-hidden bg-gray-50 rounded-lg border border-gray-200 p-4 h-full" 
      :class="{ 'border-2 border-amber-400 bg-amber-50': isEditDefaultsMode }"
    >
    <div 
      class="relative" 
      :style="canvasStyle" 
      id="canvas"
        @click="handleCanvasClick"
      >
        <!-- Card Outline -->
        <div :style="cardOutlineStyle" class="card-outline"></div>
        
        <!-- Grid Lines (within card boundaries) -->
        <div v-if="snapEnabled" class="absolute pointer-events-none" :style="cardOutlineStyle">
          <!-- Vertical grid lines -->
          <div
            v-for="x in gridLines.x"
            :key="`grid-v-${x}`"
            class="absolute top-0 bottom-0 w-px bg-gray-400 opacity-60"
            :style="{ left: `${x}px` }"
          ></div>
          <!-- Horizontal grid lines -->
          <div
            v-for="y in gridLines.y"
            :key="`grid-h-${y}`"
            class="absolute left-0 right-0 h-px bg-gray-400 opacity-60"
            :style="{ top: `${y}px` }"
          ></div>
        </div>

      <!-- Original boxes restored -->
      <div
        v-if="layoutData.story"
        class="box story-box"
          :class="{ 'selected': selectedBoxes.includes('story') }"
        :id="`box-story`"
        :style="boxStyle(layoutData.story.position, layoutData.story.size)"
          @click="toggleSelection('story', $event)"
          @dblclick="handleBoxDoubleClick('story', $event)"
      >
        <div class="drag-handle" :id="`drag-story`" @pointerdown="startDrag('story', $event)"></div>
        <span>Story ({{ layoutData.story.fontSizePt }}pt)</span>
        <button @click.stop="deleteStory">×</button>
        <div class="resize-handle" @pointerdown.stop.prevent="startResize('story', $event)"></div>
          <div v-if="selectedBoxes.includes('story')" class="selection-indicator"></div>
      </div>

      <div
        v-for="photo in layoutData.photos"
        :key="photo.id"
        class="box photo-box"
          :class="{ 'selected': selectedBoxes.includes(photo.id) }"
        :id="`box-${photo.id}`"
        :style="photoBoxStyle(photo)"
          @click="toggleSelection(photo.id, $event)"
          @dblclick="handleBoxDoubleClick(photo.id, $event)"
      >
        <div class="drag-handle" :id="`drag-${photo.id}`" @pointerdown="startDrag(photo.id, $event)"></div>
        <span>Photo {{ photo.id }}</span>
        <button @click.stop="deletePhoto(photo.id)">×</button>
        <div class="resize-handle" @pointerdown.stop.prevent="startResize(photo.id, $event)"></div>
          <div v-if="selectedBoxes.includes(photo.id)" class="selection-indicator"></div>
        </div>
      </div>
    </div>
    
    <!-- New Layout Selection Dialog -->
    <Dialog
      v-model:visible="showNewLayoutDialog"
      modal
      :closable="true"
      class="new-layout-dialog"
      style="max-width: 95vw; width: 600px;"
    >
      <div class="flex flex-col py-6 px-4">
        <div class="flex items-center justify-center mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <i class="pi pi-th-large text-2xl text-purple-500"></i>
          </div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2 text-center">Select New Layout</h3>
        <p class="text-sm text-gray-600 mb-6 text-center">
          Choose a layout from the default layouts. This will replace your current layout.
        </p>
        
        <!-- Loading State -->
        <div v-if="loadingDefaultLayouts" class="flex items-center justify-center py-8">
          <div class="text-center">
            <i class="pi pi-spin pi-spinner text-2xl text-purple-500 mb-2"></i>
            <p class="text-sm text-gray-600">Loading layouts...</p>
          </div>
        </div>
        
        <!-- Layout Selection -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            <div
              v-for="(layout, size) in availableLayouts"
              :key="size"
              @click="selectedLayoutSize = size"
              class="relative cursor-pointer border-2 rounded-lg p-3 transition-all duration-200 hover:shadow-md"
              :class="selectedLayoutSize === size 
                ? 'border-purple-500 bg-purple-50 shadow-md' 
                : 'border-gray-200 hover:border-purple-300'"
            >
              <div class="text-center">
                <div class="text-lg font-semibold text-gray-900 mb-1">{{ size }}</div>
                <div class="text-xs text-gray-600 mb-2">{{ layout.name }}</div>
                <div class="text-xs text-gray-500">
                  {{ layout.photos?.length || 0 }} photos
                  <span v-if="layout.story" class="ml-1">• Story</span>
                </div>
                <div v-if="selectedLayoutSize === size" class="absolute top-2 right-2">
                  <i class="pi pi-check text-purple-500 text-sm"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="Object.keys(availableLayouts).length === 0" class="text-center py-8">
            <i class="pi pi-exclamation-triangle text-2xl text-gray-400 mb-2"></i>
            <p class="text-sm text-gray-600">No layouts available</p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6 justify-center">
          <Button
            label="Cancel"
            @click="showNewLayoutDialog = false"
            class="bg-gray-500 hover:bg-gray-600 text-white border-0 rounded-full px-6 py-2"
          />
          <Button
            label="Apply Layout"
            :disabled="!selectedLayoutSize"
            @click="applySelectedLayout"
            class="bg-purple-600 hover:bg-purple-700 text-white border-0 rounded-full px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
// Temporarily use textarea instead of JsonEditor due to import issues
// const JsonEditor = defineAsyncComponent({
//   loader: () => import('vue-json-editor'),
//   errorComponent: {
//     template: '<div class="p-4 text-red-600">JSON Editor failed to load. Please refresh the page.</div>'
//   },
//   loadingComponent: {
//     template: '<div class="p-4 text-gray-600">Loading JSON Editor...</div>'
//   }
// })

const props = defineProps({
  initialLayout: {
    type: Object,
    default: null
  },
  size: {
    type: String,
    default: '7x5'
  },
  editDefaultsMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save'])

// Password protection variables
const showPasswordDialog = ref(false)
const password = ref('')
const passwordError = ref('')
const isEditDefaultsMode = computed(() => props.editDefaultsMode)

// Instructions dialog
const showInstructionsDialog = ref(false)

// JSON popup dialog
const showJsonDialog = ref(false)

// New Layout dialog
const showNewLayoutDialog = ref(false)
const selectedLayoutSize = ref('')
const loadingDefaultLayouts = ref(false)
const dialogLayouts = ref({})

// Computed property for dialog layouts
const availableLayouts = computed(() => dialogLayouts.value)

// Resize dialog
const showResizeDialog = ref(false)
const resizeDialogData = ref({
  id: null,
  currentWidth: 0,
  currentHeight: 0,
  newWidthMm: '',
  newHeightMm: ''
})

// Copy/paste functionality
const copiedBoxes = ref([])
const nextPhotoId = ref(1)

// JSON editing functionality
const editableJsonContent = ref('')

// JSON Editor configuration - removed due to import issues
// const jsonEditorOptions = ref({
//   mode: 'tree',
//   modes: ['tree', 'code', 'text'],
//   search: true,
//   navigationBar: true,
//   statusBar: true,
//   colorPicker: true,
//   sortObjectKeys: false,
//   history: true
// })

// Snap functionality
const snapEnabled = ref(false)
const gridSize = ref(10) // Default grid size in mm
const snapGridSize = computed(() => gridSize.value * SCALE_FACTOR.value) // Convert mm to pixels
const gridLineInterval = computed(() => gridSize.value * SCALE_FACTOR.value) // Convert mm to pixels

// Update grid size function
function updateGridSize() {
  // Ensure grid size is within bounds (5-100)
  if (gridSize.value < 5) gridSize.value = 5
  if (gridSize.value > 100) gridSize.value = 100
}

// Load default layouts for the new layout dialog
async function loadDefaultLayoutsForDialog() {
  try {
    loadingDefaultLayouts.value = true
    const layouts = await loadDefaultLayouts()
    // Convert to reactive object for the dialog
    const reactiveLayouts = {}
    Object.keys(layouts).forEach(size => {
      reactiveLayouts[size] = layouts[size]
    })
    return reactiveLayouts
  } catch (error) {
    console.error('[NEW LAYOUT] Error loading default layouts:', error)
    alert('❌ Error loading default layouts. Please try again.')
    return {}
  } finally {
    loadingDefaultLayouts.value = false
  }
}

// Multi-select functionality
const selectedBoxes = ref([])

// Toggle selection of a box
function toggleSelection(boxId, event) {
  // Prevent selection when clicking on drag handle or resize handle
  if (event.target.classList.contains('drag-handle') || 
      event.target.classList.contains('resize-handle') ||
      event.target.tagName === 'BUTTON') {
    return
  }
  
  const index = selectedBoxes.value.indexOf(boxId)
  if (index > -1) {
    selectedBoxes.value.splice(index, 1)
  } else {
    selectedBoxes.value.push(boxId)
  }
}

// Clear all selections
function clearSelection() {
  selectedBoxes.value = []
}

// Handle clicks on the canvas (outside of boxes)
function handleCanvasClick(event) {
  // Only clear selection if clicking directly on the canvas, not on boxes or their children
  if (event.target.id === 'canvas' || event.target.classList.contains('card-outline')) {
    selectedBoxes.value = []
  }
}

// Make selected boxes the same size and distribute them horizontally
function makeSameSize() {
  if (selectedBoxes.value.length < 2) return
  
  const boxes = selectedBoxes.value
  // Get card dimensions in mm
  const cardWidthMm = layoutData.cardWidthMm
  const margin = 10 // 10mm margin on each side
  const spacing = 10 // 10mm spacing between boxes
  const totalSpacing = (boxes.length - 1) * spacing
  const availableWidth = cardWidthMm - (margin * 2) - totalSpacing
  const boxWidth = Math.floor(availableWidth / boxes.length)
  
  // Find the highest box to determine the height and vertical position
  let maxHeight = 0
  let highestBoxY = 0
  
  boxes.forEach(boxId => {
    let height, y
    if (boxId === 'story') {
      height = layoutData.story.size.height
      y = layoutData.story.position.y
    } else {
      const photo = layoutData.photos.find(p => p.id === boxId)
      if (photo) {
        height = photo.size.height
        y = photo.position.y
      } else {
        height = 0
        y = 0
      }
    }
    
    if (height > maxHeight) {
      maxHeight = height
      highestBoxY = y
    }
  })
  
  // Use the height of the highest box
  const boxHeight = maxHeight
  
  // Calculate positions for horizontal distribution
  boxes.forEach((boxId, index) => {
    let x = margin + (index * (boxWidth + spacing))
    let y = highestBoxY // Use the same vertical position as the highest box
    let width = boxWidth
    let height = boxHeight
    
    // Apply snapping if enabled (snap to grid in mm)
    if (snapEnabled.value) {
      const gridSizeMm = gridSize.value
      x = Math.round(x / gridSizeMm) * gridSizeMm
      y = Math.round(y / gridSizeMm) * gridSizeMm
      width = Math.round(width / gridSizeMm) * gridSizeMm
      height = Math.round(height / gridSizeMm) * gridSizeMm
    }
    
    if (boxId === 'story') {
      layoutData.story.position = { x, y }
      layoutData.story.size = { width, height }
    } else {
      const photo = layoutData.photos.find(p => p.id === boxId)
      if (photo) {
        photo.position = { x, y }
        photo.size = { width, height }
      }
    }
  })
  
  // Clear selection after applying changes
  selectedBoxes.value = []
}

// Calculate grid lines positions (within card boundaries)
const gridLines = computed(() => {
  if (!snapEnabled.value) return { x: [], y: [] }
  
  const xLines = []
  const yLines = []
  const cardWidth = cardDimensions.value.width
  const cardHeight = cardDimensions.value.height
  
  // Convert grid size from mm to pixels
  const gridSizePx = Math.round(gridSize.value * SCALE_FACTOR.value)
  
  // Calculate vertical lines (x positions) within card
  for (let x = gridSizePx; x < cardWidth; x += gridSizePx) {
    xLines.push(x)
  }
  
  // Calculate horizontal lines (y positions) within card
  for (let y = gridSizePx; y < cardHeight; y += gridSizePx) {
    yLines.push(y)
  }
  
  return { x: xLines, y: yLines }
})



// Snap position to grid
function snapToGrid(position) {
  if (!snapEnabled.value) return position
  
  // Convert grid size from pixels to mm
  const gridSizeMm = gridSize.value
  
  return {
    x: Math.round(position.x / gridSizeMm) * gridSizeMm,
    y: Math.round(position.y / gridSizeMm) * gridSizeMm
  }
}

// Drag state
const isDragging = ref(false)
const currentDragId = ref(null)
const dragStart = ref({ x: 0, y: 0 })
const dragOffset = ref({ x: 0, y: 0 })

// Multi-drag state
const isMultiDragging = ref(false)
const multiDragStart = ref({ x: 0, y: 0 })
const selectedBoxRelativePositions = ref([])

// Resize state
const isResizing = ref(false)
const currentResizeId = ref(null)
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })

// Reactive object for layout data - simplified
const layoutData = reactive({
  name: 'Four Photo Portrait with Story',
  units: { position: 'mm', size: 'mm', fontSize: 'pt' },
  cardWidthMm: 0, // Will be set based on size
  cardHeightMm: 0, // Will be set based on size
  story: {
    position: { x: 20, y: 120 },
    size: { width: 200, height: 30 },
    fontSizePt: 10,
    align: 'center'
  },
  photos: [
    { id: '1', position: { x: 10, y: 10 }, size: { width: 100, height: 50 }, borderRadius: 3 },
    { id: '2', position: { x: 120, y: 10 }, size: { width: 100, height: 50 }, borderRadius: 3 },
    { id: '3', position: { x: 10, y: 70 }, size: { width: 100, height: 50 }, borderRadius: 3 },
    { id: '4', position: { x: 120, y: 70 }, size: { width: 100, height: 50 }, borderRadius: 3 }
  ]
})

// Password protection functions
function checkPassword() {
  if (password.value === 'edventions') {
    isEditDefaultsMode.value = true
    showPasswordDialog.value = false
    password.value = ''
    passwordError.value = ''
  } else {
    passwordError.value = 'Incorrect password. Please try again.'
  }
}

function cancelPassword() {
  showPasswordDialog.value = false
  password.value = ''
  passwordError.value = ''
}

function exitEditMode() {
  isEditDefaultsMode.value = false
  showPasswordDialog.value = false
  password.value = ''
  passwordError.value = ''
}

// Function to calculate dimensions and scale factor based on size
function calculateSizeDimensions(size) {
  const sizeMap = {
    '4x6': { width: 4, height: 6, aspectRatio: 0.67 },
    '6x4': { width: 6, height: 4, aspectRatio: 1.5 },
    '5x3': { width: 5, height: 3, aspectRatio: 1.67 },
    '5x7': { width: 5, height: 7, aspectRatio: 0.71 },
    '7x5': { width: 7, height: 5, aspectRatio: 1.4 },
    '8x10': { width: 8, height: 10, aspectRatio: 0.8 },
    '10x8': { width: 10, height: 8, aspectRatio: 1.25 },
    '8.5x11': { width: 8.5, height: 11, aspectRatio: 0.77 },
    '11x8.5': { width: 11, height: 8.5, aspectRatio: 1.29 },
    '11x14': { width: 11, height: 14, aspectRatio: 0.79 },
    '14x11': { width: 14, height: 11, aspectRatio: 1.27 },
    '12x12': { width: 12, height: 12, aspectRatio: 1 }
  }
  
  return sizeMap[size] || sizeMap['7x5'] // Default to 7x5 if size not found
}

// Default layouts loaded from JSON file
let defaultLayouts = null

// Load default layouts from JSON file
async function loadDefaultLayouts() {
  if (!defaultLayouts) {
    try {
      const response = await fetch('/default-layouts.json')
      defaultLayouts = await response.json()
    } catch (error) {
      console.error('Failed to load default layouts:', error)
      // Fallback to a simple default
      defaultLayouts = {
        '7x5': {
          name: 'Medium Landscape Layout',
          units: { position: 'mm', size: 'mm', fontSize: 'pt' },
          orientation: 'landscape',
          story: {
            position: { x: 90, y: 10 },
            size: { width: 45, height: 120 },
            fontSizePt: 9,
            align: 'center'
          },
          photos: [
            { id: '1', position: { x: 10, y: 10 }, size: { width: 35, height: 35 }, borderRadius: 3 },
            { id: '2', position: { x: 50, y: 10 }, size: { width: 35, height: 35 }, borderRadius: 3 },
            { id: '3', position: { x: 10, y: 50 }, size: { width: 35, height: 35 }, borderRadius: 3 },
            { id: '4', position: { x: 50, y: 50 }, size: { width: 35, height: 35 }, borderRadius: 3 }
          ]
        }
      }
    }
  }
  return defaultLayouts
}

// Get default layout for a specific size
async function getDefaultLayout(size) {
  const layouts = await loadDefaultLayouts()
  return layouts[size] || layouts['7x5'] // Default to 7x5 if size not found
}

// Save edited defaults back to JSON file
async function saveEditedDefaults() {
  try {
    const layouts = await loadDefaultLayouts()
    
    // Create a clean copy of the current layout data with mm units
    const layoutToSave = {
      name: layoutData.name,
      units: {
        position: 'mm',
        size: 'mm',
        fontSize: 'pt'
      },
      cardWidthMm: layoutData.cardWidthMm,
      cardHeightMm: layoutData.cardHeightMm,
      story: layoutData.story ? { ...layoutData.story } : null,
      photos: layoutData.photos.map(photo => ({ ...photo }))
    }
    
    // Update the layout for current size
    layouts[props.size] = layoutToSave
    
    // Save back to server
    const response = await fetch('/api/layouts/save-defaults', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(layouts)
    })
    
    if (response.ok) {
      console.log('[SAVE DEFAULTS] Successfully saved defaults for size:', props.size)
      // Reload the defaults to ensure we have the latest
      defaultLayouts = null
      await loadDefaultLayouts()
      
    } else {
      console.error('[SAVE DEFAULTS] Failed to save defaults:', response.statusText)
      alert('❌ Failed to save default layout. Please try again.')
    }
  } catch (error) {
    console.error('[SAVE DEFAULTS] Error saving defaults:', error)
    alert('❌ Error saving default layout. Please try again.')
  }
}

// Calculate dimensions and simple scaling
const sizeDimensions = computed(() => calculateSizeDimensions(props.size))

// Dynamic wireframe scaling based on card dimensions
const BASE_WIREFRAME_WIDTH = 800
const BASE_WIREFRAME_HEIGHT = 600
const MIN_SCALE = 2.0
const MAX_SCALE = 4.0

// Calculate dynamic wireframe dimensions based on card size
const wireframeDimensions = computed(() => {
  const cardWidthInches = sizeDimensions.value.width
  const cardHeightInches = sizeDimensions.value.height
  
  // Convert inches to mm (1 inch = 25.4mm)
  const cardWidthMm = cardWidthInches * 25.4
  const cardHeightMm = cardHeightInches * 25.4
  
  // Calculate aspect ratio
  const cardAspectRatio = cardWidthMm / cardHeightMm
  
  // Adjust wireframe dimensions based on card aspect ratio
  let width = BASE_WIREFRAME_WIDTH
  let height = BASE_WIREFRAME_HEIGHT
  
  if (cardAspectRatio < 0.8) {
    // Tall cards (portrait) - increase height
    height = Math.max(BASE_WIREFRAME_HEIGHT, Math.round(cardHeightMm * 2.5))
  } else if (cardAspectRatio > 1.2) {
    // Wide cards (landscape) - increase width
    width = Math.max(BASE_WIREFRAME_WIDTH, Math.round(cardWidthMm * 2.5))
  }
  
  return { width, height }
})

// Calculate scale factor to fit card in wireframe
const SCALE_FACTOR = computed(() => {
  const cardWidthInches = sizeDimensions.value.width
  const cardHeightInches = sizeDimensions.value.height
  
  // Convert inches to mm (1 inch = 25.4mm)
  const cardWidthMm = cardWidthInches * 25.4
  const cardHeightMm = cardHeightInches * 25.4
  
  const { width: wireframeWidth, height: wireframeHeight } = wireframeDimensions.value
  
  // Calculate scale to fit in wireframe with minimal borders
  const availableWidth = wireframeWidth - 100 // 50px border on each side
  const availableHeight = wireframeHeight - 120 // 60px border on each side for more space
  
  const scaleX = availableWidth / cardWidthMm
  const scaleY = availableHeight / cardHeightMm
  
  // Use the smaller scale to ensure card fits completely
  const scale = Math.min(scaleX, scaleY)
  
  // Ensure we have a reasonable scale within bounds
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale))
})

// Calculate card dimensions in wireframe pixels
const cardDimensions = computed(() => {
  const cardWidthInches = sizeDimensions.value.width
  const cardHeightInches = sizeDimensions.value.height
  
  // Convert inches to mm, then to wireframe pixels
  const cardWidthMm = cardWidthInches * 25.4
  const cardHeightMm = cardHeightInches * 25.4
  
  const scale = SCALE_FACTOR.value
  
  const width = Math.round(cardWidthMm * scale)
  const height = Math.round(cardHeightMm * scale)
  
  return {
    width: width,
    height: height
  }
})

// Calculate card position to center it in the wireframe
const cardPosition = computed(() => {
  const cardWidth = cardDimensions.value.width
  const cardHeight = cardDimensions.value.height
  const { width: wireframeWidth, height: wireframeHeight } = wireframeDimensions.value
  
  return {
    left: Math.round((wireframeWidth - cardWidth) / 2),
    top: Math.round((wireframeHeight - cardHeight) / 2)
  }
})

const canvasStyle = computed(() => {
  const { width: wireframeWidth, height: wireframeHeight } = wireframeDimensions.value
  return {
    width: `${wireframeWidth}px`,
    height: `${wireframeHeight}px`,
  backgroundColor: '#fff8f0',
    border: '2px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
    position: 'relative'
  }
})

// Card outline style
const cardOutlineStyle = computed(() => ({
  position: 'absolute',
  left: `${cardPosition.value.left}px`,
  top: `${cardPosition.value.top}px`,
  width: `${cardDimensions.value.width}px`,
  height: `${cardDimensions.value.height}px`,
  border: '2px dashed #666',
  backgroundColor: 'transparent',
  pointerEvents: 'none'
}))

function boxStyle(position, size) {
  // Convert mm coordinates to wireframe pixels
  const scale = SCALE_FACTOR.value
  
  // Convert position from mm to pixels
  const xMm = position.x
  const yMm = position.y
  const xPx = Math.round(xMm * scale)
  const yPx = Math.round(yMm * scale)
  
  // Convert size from mm to pixels
  const widthMm = size.width
  const heightMm = size.height
  const widthPx = Math.round(widthMm * scale)
  const heightPx = Math.round(heightMm * scale)
  
  // Position relative to card center
  const cardX = cardPosition.value.left + xPx
  const cardY = cardPosition.value.top + yPx
  
  return {
    position: 'absolute',
    left: `${cardX}px`,
    top: `${cardY}px`,
    width: `${widthPx}px`,
    height: `${heightPx}px`,
    padding: '4px',
    userSelect: 'none'
  }
}

function photoBoxStyle(photo) {
  // Convert border radius from mm to pixels for display
  const scale = SCALE_FACTOR.value
  const borderRadiusPx = Math.round(photo.borderRadius * scale)
  
  return {
    ...boxStyle(photo.position, photo.size),
    borderRadius: `${borderRadiusPx}px`
  }
}

function clampToBounds(pos, size) {
  // Use stored card dimensions in mm
  const cardWidthMm = layoutData.cardWidthMm
  const cardHeightMm = layoutData.cardHeightMm
  
  // Calculate max positions in mm
  const maxX = cardWidthMm - size.width
  const maxY = cardHeightMm - size.height
  
  const clamped = {
    x: Math.max(0, Math.min(maxX, pos.x)),
    y: Math.max(0, Math.min(maxY, pos.y))
  }
  
  // Only log in development mode to reduce console spam
  if (process.env.NODE_ENV === 'development') {
    console.log('[CLAMP]', { input: pos, size, cardWidthMm, cardHeightMm, maxX, maxY, output: clamped })
  }
  return clamped
}

function createBox(id, type, position, size, borderRadius = 0) {
  const canvas = document.getElementById('canvas')
  const box = document.createElement('div')
  
  box.id = `box-${id}`
  box.className = `box ${type}-box`
  box.style.position = 'absolute'
  box.style.left = `${position.x}px`
  box.style.top = `${position.y}px`
  box.style.width = `${size.width}px`
  box.style.height = `${size.height}px`
  box.style.padding = '4px'
  box.style.userSelect = 'none'
  box.style.borderRadius = `${borderRadius}px`
  
  if (type === 'story') {
    box.style.background = '#cfe8ff'
    box.style.border = '1px dashed #3b82f6'
    box.style.color = '#1d4ed8'
  } else {
    box.style.backgroundColor = '#d1fae5'
    box.style.border = '1px solid #10b981'
    box.style.color = '#065f46'
  }
  
  // Create drag handle
  const dragHandle = document.createElement('div')
  dragHandle.id = `drag-${id}`
  dragHandle.className = 'drag-handle'
  dragHandle.style.position = 'absolute'
  dragHandle.style.top = '4px'
  dragHandle.style.left = '4px'
  dragHandle.style.width = '20px'
  dragHandle.style.height = '20px'
  dragHandle.style.background = '#3b82f6'
  dragHandle.style.borderRadius = '50%'
  dragHandle.style.cursor = 'move'
  dragHandle.style.zIndex = '10'
  dragHandle.style.border = '2px solid #1d4ed8'
  
  dragHandle.addEventListener('pointerdown', (e) => startDrag(id, e))
  
  // Create content
  const content = document.createElement('span')
  content.textContent = type === 'story' ? `Story (${layoutData.story.fontSizePt}pt)` : `Photo ${id}`
  
  // Create delete button
  const deleteBtn = document.createElement('button')
  deleteBtn.textContent = '×'
  deleteBtn.style.position = 'absolute'
  deleteBtn.style.top = '0'
  deleteBtn.style.right = '0'
  deleteBtn.style.background = '#dc2626'
  deleteBtn.style.color = 'white'
  deleteBtn.style.borderRadius = '4px'
  deleteBtn.style.padding = '0 4px'
  deleteBtn.style.fontSize = '12px'
  deleteBtn.style.border = 'none'
  deleteBtn.style.cursor = 'pointer'
  
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    if (type === 'story') {
      deleteStory()
    } else {
      deletePhoto(id)
    }
  })
  
  // Create resize handle
  const resizeHandle = document.createElement('div')
  resizeHandle.className = 'resize-handle'
  resizeHandle.style.position = 'absolute'
  resizeHandle.style.right = '0'
  resizeHandle.style.bottom = '0'
  resizeHandle.style.width = '10px'
  resizeHandle.style.height = '10px'
  resizeHandle.style.background = '#555'
  resizeHandle.style.cursor = 'nwse-resize'
  resizeHandle.style.borderRadius = '2px'
  
  resizeHandle.addEventListener('pointerdown', (e) => {
    e.stopPropagation()
    e.preventDefault()
    startResize(id, e)
  })
  
  box.appendChild(dragHandle)
  box.appendChild(content)
  box.appendChild(deleteBtn)
  box.appendChild(resizeHandle)
  
  canvas.appendChild(box)
  return box
}

function startDrag(id, event) {
  event.preventDefault()
  console.log('[DRAG START]', { id, eventType: event.type })

  // Clear any existing selection when starting to drag
  selectedBoxes.value = []

  // Check if we should do multi-drag (if the dragged box is selected and there are other selected boxes)
  if (selectedBoxes.value.includes(id) && selectedBoxes.value.length > 1) {
    // Start multi-drag
    isMultiDragging.value = true
    isDragging.value = false
    currentDragId.value = null
    
    const canvas = document.getElementById('canvas')
    const canvasRect = canvas.getBoundingClientRect()
    multiDragStart.value = {
      x: event.clientX - canvasRect.left,
      y: event.clientY - canvasRect.top
    }
    
    // Calculate relative positions of all selected boxes
    selectedBoxRelativePositions.value = selectedBoxes.value.map(boxId => {
      let position
      if (boxId === 'story') {
        position = { ...layoutData.story.position }
      } else {
        const photo = layoutData.photos.find(p => p.id === boxId)
        position = photo ? { ...photo.position } : { x: 0, y: 0 }
      }
      
      return {
        id: boxId,
        relativeX: position.x - multiDragStart.value.x,
        relativeY: position.y - multiDragStart.value.y
      }
    })
    
    console.log('[MULTI DRAG START]', { 
      selectedBoxes: selectedBoxes.value, 
      multiDragStart: multiDragStart.value, 
      relativePositions: selectedBoxRelativePositions.value 
    })
  } else {
    // Single box drag (original behavior)
    isDragging.value = true
    isMultiDragging.value = false
    currentDragId.value = id
    
    // Calculate the offset from the drag handle to the mouse position
    const dragHandle = event.currentTarget
    const dragHandleRect = dragHandle.getBoundingClientRect()
    dragOffset.value = {
      x: event.clientX - dragHandleRect.left,
      y: event.clientY - dragHandleRect.top
    }
    
    console.log('[DRAG START] Drag offset:', dragOffset.value)
  }

  const dragHandle = event.currentTarget
  const boxId = id.startsWith('box-') ? id : `box-${id}` // Handle both formats
  const box = document.getElementById(id) // Use the actual ID directly
  const canvas = dragHandle.closest('.relative')
  const canvasRect = canvas.getBoundingClientRect()

  console.log('[DRAG START] Box ID:', boxId)
  console.log('[DRAG START] Box element:', box)
  console.log('[DRAG START] Drag handle element:', dragHandle)
  console.log('[DRAG START] Canvas element:', canvas)
  console.log('[DRAG START] Canvas rect: ', canvasRect)
  console.log('[DRAG START] Client coords:', { x: event.clientX, y: event.clientY })

  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', stopInteraction)
}

function onPointerMove(event) {
  event.preventDefault()

  if (isMultiDragging.value) {
    // Handle multi-box dragging
    const canvas = document.getElementById('canvas')
    const canvasRect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - canvasRect.left
    const mouseY = event.clientY - canvasRect.top

    console.log('[MULTI DRAG MOVE]', { mouseX, mouseY })
    
    // Move all selected boxes maintaining their relative positions
    selectedBoxRelativePositions.value.forEach(({ id, relativeX, relativeY }) => {
      let newX = mouseX + relativeX
      let newY = mouseY + relativeY
      
      // Convert from wireframe coordinates to mm coordinates
      const mouseXRelativeToCard = mouseX - cardPosition.value.left
      const mouseYRelativeToCard = mouseY - cardPosition.value.top
      
      // Convert pixels to mm
      const scale = SCALE_FACTOR.value
      newX = Math.round(mouseXRelativeToCard / scale)
      newY = Math.round(mouseYRelativeToCard / scale)
      
      // Get the box size for clamping
      let size
      if (id === 'story') {
        size = layoutData.story.size
      } else {
        const photo = layoutData.photos.find(p => p.id === id)
        size = photo ? photo.size : { width: 50, height: 40 }
      }
      
      // Apply clamping to bounds
      const clampedPos = clampToBounds({ x: newX, y: newY }, size)
      
      // Apply snapping if enabled
      let finalPos = clampedPos
      if (snapEnabled.value) {
        finalPos = snapToGrid(clampedPos)
      }
      
      // Update the box position
      if (id === 'story') {
        layoutData.story.position = finalPos
      } else {
        const photo = layoutData.photos.find(p => p.id === id)
        if (photo) {
          photo.position = finalPos
        }
      }
      
      console.log('[MULTI DRAG MOVE] Updated box:', { id, finalPos })
    })
  } else if (isDragging.value && currentDragId.value) {
    // Handle single box dragging
    const canvas = document.getElementById('canvas')
    const canvasRect = canvas.getBoundingClientRect()

    // Get mouse position relative to canvas, accounting for drag offset
    const mouseX = event.clientX - canvasRect.left - dragOffset.value.x
    const mouseY = event.clientY - canvasRect.top - dragOffset.value.y

    if (process.env.NODE_ENV === 'development') {
    console.log('[DRAG MOVE]', {
        dragging: currentDragId.value,
      clientX: event.clientX,
      clientY: event.clientY,
      canvasRect: { left: canvasRect.left, top: canvasRect.top },
        mouseRelativeToCanvas: { x: mouseX, y: mouseY },
        dragOffset: dragOffset.value
      })
    }

    // Convert from wireframe coordinates to mm coordinates
    const mouseXRelativeToCard = mouseX - cardPosition.value.left
    const mouseYRelativeToCard = mouseY - cardPosition.value.top
    
    // Convert pixels to mm
    const scale = SCALE_FACTOR.value
    const newX = Math.round(mouseXRelativeToCard / scale)
    const newY = Math.round(mouseYRelativeToCard / scale)

      // Get the appropriate size based on the element type
      let size
    if (currentDragId.value === 'story') {
        size = layoutData.story.size
      } else {
      const photo = layoutData.photos.find(p => p.id === currentDragId.value)
        size = photo ? photo.size : { width: 200, height: 150 }
      }
      
    if (process.env.NODE_ENV === 'development') {
      console.log('[DRAG MOVE] Before clampToBounds:', { newX, newY, size })
    }
    let newPos = clampToBounds({ x: newX, y: newY }, size)
    
    // Apply snapping if enabled
    if (snapEnabled.value) {
      newPos = snapToGrid(newPos)
      if (process.env.NODE_ENV === 'development') {
        console.log('[DRAG MOVE] After snapToGrid:', { newPos })
      }
    }
    
    // Update the box position in layoutData
    if (currentDragId.value === 'story') {
      layoutData.story.position = newPos
    } else {
      const photo = layoutData.photos.find(p => p.id === currentDragId.value)
      if (photo) {
        photo.position = newPos
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[DRAG MOVE] Updated position:', { currentDragId: currentDragId.value, newPos })
    }
  } else if (isResizing.value && currentResizeId.value) {
    // Handle resizing
    const deltaX = event.clientX - resizeStart.value.x
    const deltaY = event.clientY - resizeStart.value.y
    
    // Convert pixel delta to mm delta
    const scale = SCALE_FACTOR.value
    const deltaXmm = deltaX / scale
    const deltaYmm = deltaY / scale
    
    // Calculate new size in mm
    let newWidthMm = resizeStart.value.width + deltaXmm
    let newHeightMm = resizeStart.value.height + deltaYmm
    
    // Ensure minimum size in mm
    const minSizeMm = 5 // 5mm minimum
    newWidthMm = Math.max(minSizeMm, newWidthMm)
    newHeightMm = Math.max(minSizeMm, newHeightMm)
    
    // Apply snapping if enabled (snap to grid in mm)
    if (snapEnabled.value) {
      const gridSizeMm = gridSize.value
      newWidthMm = Math.round(newWidthMm / gridSizeMm) * gridSizeMm
      newHeightMm = Math.round(newHeightMm / gridSizeMm) * gridSizeMm
    }
    
    // Update the box size in mm
    if (currentResizeId.value === 'story') {
      layoutData.story.size.width = newWidthMm
      layoutData.story.size.height = newHeightMm
    } else {
      const photo = layoutData.photos.find(p => p.id === currentResizeId.value)
      if (photo) {
        photo.size.width = newWidthMm
        photo.size.height = newHeightMm
      }
    }
  }
}

function stopInteraction() {
  console.log('[DRAG STOP]', { dragging: currentDragId.value, resizing: currentResizeId.value, multiDragging: isMultiDragging.value })
  
  // If we were multi-dragging, sync all final positions back to data
  if (isMultiDragging.value) {
    console.log('[MULTI DRAG STOP] Syncing final positions for all selected boxes')
    
    // All positions are already synced in the onPointerMove function
    // Just clear the multi-drag state
    isMultiDragging.value = false
    selectedBoxRelativePositions.value = []
  }
  // If we were dragging, sync the final position back to data
  else if (isDragging.value && currentDragId.value) {
    const boxId = currentDragId.value === 'story' ? 'box-story' : `box-${currentDragId.value}`
    const box = document.getElementById(boxId)
    
    if (box) {
      const finalX = parseInt(box.style.left)
      const finalY = parseInt(box.style.top)
      
      console.log('[DRAG STOP] Syncing final position to data:', { currentDragId: currentDragId.value, finalX, finalY })
      
      // Convert from wireframe coordinates back to mm coordinates
      const finalXRelativeToCard = finalX - cardPosition.value.left
      const finalYRelativeToCard = finalY - cardPosition.value.top
      
      // Convert pixels to mm
      const scale = SCALE_FACTOR.value
      const cardX = Math.round(finalXRelativeToCard / scale)
      const cardY = Math.round(finalYRelativeToCard / scale)
      
      // Get the appropriate size for clamping
      let size
      if (currentDragId.value === 'story') {
        size = layoutData.story.size
      } else {
        const photo = layoutData.photos.find(p => p.id === currentDragId.value)
        size = photo ? photo.size : { width: 50, height: 40 }
      }
      
      // Apply clamping to bounds
      let finalPos = clampToBounds({ x: cardX, y: cardY }, size)
      
      // Apply final snapping if enabled
      if (snapEnabled.value) {
        finalPos = snapToGrid(finalPos)
        // Update the DOM element with the snapped position
        let snappedX = finalPos.x
        let snappedY = finalPos.y
        if (!props.editDefaultsMode) {
          snappedX += cardPosition.value.left
          snappedY += cardPosition.value.top
        }
        box.style.left = `${snappedX}px`
        box.style.top = `${snappedY}px`
        console.log('[DRAG STOP] Final snapped position:', finalPos)
      }
      
      // Sync position back to layoutData
      if (currentDragId.value === 'story') {
        layoutData.story.position = finalPos
      } else {
        const photo = layoutData.photos.find(p => p.id === currentDragId.value)
        if (photo) {
          photo.position = finalPos
        }
      }
      
      console.log('[DRAG STOP] Position synced to layoutData:', { currentDragId: currentDragId.value, finalPos })
    }
  }
  
  // Clear any selection after drag
  selectedBoxes.value = []
  
  isDragging.value = false
  currentDragId.value = null
  isResizing.value = false
  currentResizeId.value = null
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', stopInteraction)
}

function startResize(id, event) {
  event.preventDefault()
  isResizing.value = true
  currentResizeId.value = id
  
  // Get the current size from layoutData (already in mm)
  let currentSize
  if (id === 'story') {
    currentSize = layoutData.story.size
  } else {
    const photo = layoutData.photos.find(p => p.id === id)
    currentSize = photo ? photo.size : { width: 50, height: 40 } // Default in mm
  }
  
  // Store the initial mouse position and current size in mm
  resizeStart.value = {
    x: event.clientX,
    y: event.clientY,
    width: currentSize.width, // Already in mm
    height: currentSize.height // Already in mm
  }
  
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', stopInteraction)
}

function applyResize() {
  const id = resizeDialogData.value.id
  const newWidthMm = parseFloat(resizeDialogData.value.newWidthMm)
  const newHeightMm = parseFloat(resizeDialogData.value.newHeightMm)

  if (isNaN(newWidthMm) || isNaN(newHeightMm) || newWidthMm <= 0 || newHeightMm <= 0) {
    alert('Please enter valid positive numbers for width and height.')
    return
  }

  // Ensure minimum size in mm
  const minSizeMm = 5 // 5mm minimum
  const finalWidthMm = Math.max(minSizeMm, newWidthMm)
  const finalHeightMm = Math.max(minSizeMm, newHeightMm)

  // Apply snapping if enabled (snap to grid in mm)
  let finalWidth = finalWidthMm
  let finalHeight = finalHeightMm
  
  if (snapEnabled.value) {
    const gridSizeMm = gridSize.value
    finalWidth = Math.round(finalWidth / gridSizeMm) * gridSizeMm
    finalHeight = Math.round(finalHeight / gridSizeMm) * gridSizeMm
  }

  // Update the box size in layoutData (store in mm)
  if (id === 'story') {
    layoutData.story.size.width = finalWidth
    layoutData.story.size.height = finalHeight
  } else {
    const photo = layoutData.photos.find(p => p.id === id)
    if (photo) {
      photo.size.width = finalWidth
      photo.size.height = finalHeight
    }
  }

  showResizeDialog.value = false
}

// Copy selected boxes
function copySelectedBoxes() {
  if (selectedBoxes.value.length === 0) {
    alert('Please select at least one box to copy.')
    return
  }
  
  copiedBoxes.value = []
  
  selectedBoxes.value.forEach(boxId => {
    if (boxId === 'story') {
      // Copy story box
      copiedBoxes.value.push({
        type: 'story',
        id: 'story',
        position: { ...layoutData.story.position },
        size: { ...layoutData.story.size },
        fontSizePt: layoutData.story.fontSizePt
      })
    } else {
      // Copy photo box
      const photo = layoutData.photos.find(p => p.id === boxId)
      if (photo) {
        copiedBoxes.value.push({
          type: 'photo',
          id: photo.id,
          position: { ...photo.position },
          size: { ...photo.size },
          borderRadius: photo.borderRadius
        })
      }
    }
  })
  
  // Deselect all boxes after copying
  selectedBoxes.value = []
  
  console.log('[COPY] Copied boxes:', copiedBoxes.value)
}

// Paste copied boxes
function pasteCopiedBoxes() {
  if (copiedBoxes.value.length === 0) {
    alert('No boxes copied. Please copy some boxes first.')
    return
  }
  
  const offset = 10 // Offset in mm for pasted boxes
  const newSelectedBoxes = []
  
  copiedBoxes.value.forEach(copiedBox => {
    if (copiedBox.type === 'story') {
      // Paste story box
      const newPosition = {
        x: copiedBox.position.x + offset,
        y: copiedBox.position.y + offset
      }
      
      // Apply clamping to ensure it stays within bounds
      const clampedPosition = clampToBounds(newPosition, copiedBox.size)
      
      layoutData.story.position = clampedPosition
      layoutData.story.size = { ...copiedBox.size }
      layoutData.story.fontSizePt = copiedBox.fontSizePt
      
      newSelectedBoxes.push('story')
    } else if (copiedBox.type === 'photo') {
      // Paste photo box
      const newPhotoId = `photo-${nextPhotoId.value}`
      nextPhotoId.value++
      
      const newPosition = {
        x: copiedBox.position.x + offset,
        y: copiedBox.position.y + offset
      }
      
      // Apply clamping to ensure it stays within bounds
      const clampedPosition = clampToBounds(newPosition, copiedBox.size)
      
      const newPhoto = {
        id: newPhotoId,
        position: clampedPosition,
        size: { ...copiedBox.size },
        borderRadius: copiedBox.borderRadius
      }
      
      layoutData.photos.push(newPhoto)
      newSelectedBoxes.push(newPhotoId)
    }
  })
  
  // Select the newly pasted boxes
  selectedBoxes.value = newSelectedBoxes
  
  console.log('[PASTE] Pasted boxes:', newSelectedBoxes)
}

// Align selected boxes vertically (left edge)
function alignVertical() {
  if (selectedBoxes.value.length < 2) {
    alert('Please select at least 2 boxes to align.')
    return
  }
  
  // Find the leftmost position among selected boxes
  let leftmostX = Infinity
  
  selectedBoxes.value.forEach(boxId => {
    let position
    if (boxId === 'story') {
      position = layoutData.story.position
    } else {
      const photo = layoutData.photos.find(p => p.id === boxId)
      position = photo ? photo.position : { x: 0, y: 0 }
    }
    leftmostX = Math.min(leftmostX, position.x)
  })
  
  // Align all selected boxes to the leftmost position
  selectedBoxes.value.forEach(boxId => {
    if (boxId === 'story') {
      layoutData.story.position.x = leftmostX
    } else {
      const photo = layoutData.photos.find(p => p.id === boxId)
      if (photo) {
        photo.position.x = leftmostX
      }
    }
  })
  
  console.log('[ALIGN VERTICAL] Aligned boxes to x:', leftmostX)
}

// Align selected boxes horizontally (top edge)
function alignHorizontal() {
  if (selectedBoxes.value.length < 2) {
    alert('Please select at least 2 boxes to align.')
    return
  }
  
  // Find the topmost position among selected boxes
  let topmostY = Infinity
  
  selectedBoxes.value.forEach(boxId => {
    let position
    if (boxId === 'story') {
      position = layoutData.story.position
    } else {
      const photo = layoutData.photos.find(p => p.id === boxId)
      position = photo ? photo.position : { x: 0, y: 0 }
    }
    topmostY = Math.min(topmostY, position.y)
  })
  
  // Align all selected boxes to the topmost position
  selectedBoxes.value.forEach(boxId => {
    if (boxId === 'story') {
      layoutData.story.position.y = topmostY
    } else {
      const photo = layoutData.photos.find(p => p.id === boxId)
      if (photo) {
        photo.position.y = topmostY
      }
    }
  })
  
  console.log('[ALIGN HORIZONTAL] Aligned boxes to y:', topmostY)
}

function addPhoto() {
  const newId = String(Date.now())
  const newPhoto = {
    id: newId,
    position: { x: 20, y: 20 },
    size: { width: 50, height: 40 },
    borderRadius: 3
  }
  
  layoutData.photos.push(newPhoto)
  // Box will be rendered by Vue template automatically
}

function addStory() {
  layoutData.story = {
    position: { x: 20, y: 120 },
    size: { width: 200, height: 30 },
    fontSizePt: 10,
    align: 'center'
  }
  // Box will be rendered by Vue template automatically
}

function deleteStory() {
  layoutData.story = null
  // Vue template will automatically remove the box
}

function deletePhoto(id) {
  layoutData.photos = layoutData.photos.filter(p => p.id !== id)
  // Vue template will automatically remove the box
}

async function resetLayout() {
  try {
    console.log('[RESET] Resetting layout for size:', props.size)
  
    // Generate a fresh default layout
    const defaultLayout = generateDefaultLayout(props.size)
    
    // Update layout data
  layoutData.name = defaultLayout.name
  layoutData.orientation = defaultLayout.orientation
  layoutData.story = defaultLayout.story
  layoutData.photos = defaultLayout.photos
  
    console.log('[RESET] Layout reset successfully:', defaultLayout)
  } catch (error) {
    console.error('[RESET] Error resetting layout:', error)
    alert('❌ Error resetting layout. Please try again.')
  }
}

async function applySelectedLayout() {
  try {
    if (!selectedLayoutSize.value) {
      alert('Please select a layout first.')
      return
    }
    
    console.log('[NEW LAYOUT] Applying selected layout:', selectedLayoutSize.value)
    
    // Get the selected layout
    const layouts = await loadDefaultLayouts()
    const selectedLayout = layouts[selectedLayoutSize.value]
    if (!selectedLayout) {
      throw new Error(`Layout for size ${selectedLayoutSize.value} not found`)
    }
    
    // Apply the layout data
    layoutData.name = selectedLayout.name
    layoutData.orientation = selectedLayout.orientation || 'portrait'
    layoutData.story = selectedLayout.story || null
    layoutData.photos = selectedLayout.photos || []
    layoutData.cardWidthMm = selectedLayout.cardWidthMm
    layoutData.cardHeightMm = selectedLayout.cardHeightMm
    
    // Clear any selections
    selectedBoxes.value = []
    copiedBoxes.value = []
    
    // Close the dialog
    showNewLayoutDialog.value = false
    selectedLayoutSize.value = ''
    
    console.log('[NEW LAYOUT] Layout applied successfully:', selectedLayout)
  } catch (error) {
    console.error('[NEW LAYOUT] Error applying layout:', error)
    alert('❌ Error applying layout. Please try again.')
  }
}

function saveLayout() {
  // If in edit defaults mode, save to defaults
  if (props.editDefaultsMode) {
    saveEditedDefaults()
    return
  }

  // Create a deep copy of the layout data
  const jsonLayout = JSON.parse(JSON.stringify(layoutData))
  
  // Update units to use mm and pt
  jsonLayout.units = {
    position: 'mm',
    size: 'mm',
    fontSize: 'pt'
  }

  // Add card dimensions in mm
  jsonLayout.cardWidthMm = layoutData.cardWidthMm
  jsonLayout.cardHeightMm = layoutData.cardHeightMm

  if (jsonLayout.story) {
    // Story position and size are already in mm
    jsonLayout.story.position = {
      x: layoutData.story.position.x,
      y: layoutData.story.position.y
    }
    jsonLayout.story.size = {
      width: layoutData.story.size.width,
      height: layoutData.story.size.height
    }
  }

  jsonLayout.photos = layoutData.photos.map(photo => ({
    ...photo,
    position: {
      x: photo.position.x,
      y: photo.position.y
    },
    size: {
      width: photo.size.width,
      height: photo.size.height
    },
    borderRadius: photo.borderRadius
  }))

  delete jsonLayout.canvasSize
  emit('save', jsonLayout)
}

// Track if this is an existing theme with layout data
let hasExistingLayout = false

// Watcher to update card dimensions when size changes
watch(() => props.size, (newSize) => {
  const dimensions = calculateSizeDimensions(newSize)
  
  // Update card dimensions in mm
  layoutData.cardWidthMm = Math.round(dimensions.width * 25.4)
  layoutData.cardHeightMm = Math.round(dimensions.height * 25.4)
  
  // Only reposition boxes if this is a new theme (no existing layout)
  if (!hasExistingLayout) {
    // Generate a proper default layout instead of loading from JSON
    const defaultLayout = generateDefaultLayout(newSize)
      layoutData.name = defaultLayout.name
      layoutData.story = defaultLayout.story
      layoutData.photos = defaultLayout.photos
  }
  
  console.log('[SIZE CHANGE]', { 
    size: newSize, 
    dimensions, 
    cardDimensions: cardDimensions.value,
    scaleFactor: SCALE_FACTOR.value,
    hasExistingLayout
  })
}, { immediate: true })

// Watch for new layout dialog to load layouts
watch(() => showNewLayoutDialog.value, (isOpen) => {
  if (isOpen && Object.keys(dialogLayouts.value).length === 0) {
    loadDefaultLayoutsForDialog().then(layouts => {
      dialogLayouts.value = layouts
    })
  }
})

// Initialize boxes when component mounts
onMounted(async () => {
  // If in edit defaults mode, load the actual default layout from JSON
  if (props.editDefaultsMode) {
    console.log('[MOUNTED] Loading default layout for editing:', props.size)
    try {
      const defaultLayout = await getDefaultLayout(props.size)
      Object.assign(layoutData, defaultLayout)
      hasExistingLayout = true
      console.log('[MOUNTED] Loaded default layout:', defaultLayout)
    } catch (error) {
      console.error('[MOUNTED] Error loading default layout:', error)
      // Fallback to generated default
      const generatedDefault = generateDefaultLayout(props.size)
      Object.assign(layoutData, generatedDefault)
      hasExistingLayout = false
    }
  } else if (props.initialLayout) {
    console.log('[MOUNTED] Initializing with provided layout:', props.initialLayout)
    Object.assign(layoutData, props.initialLayout)
    hasExistingLayout = true
  } else {
    console.log('[MOUNTED] Layout editor initialized with default layout')
    hasExistingLayout = false
  }

  // Initialize nextPhotoId based on existing photos
  if (layoutData.photos.length > 0) {
    const maxId = Math.max(...layoutData.photos.map(p => {
      const match = p.id.match(/photo-(\d+)/)
      return match ? parseInt(match[1]) : 0
    }))
    nextPhotoId.value = maxId + 1
  } else {
    nextPhotoId.value = 1
  }
})

// Function to open JSON dialog with populated content
function openJsonDialog() {
  try {
    const jsonLayout = {
      name: `Layout for ${props.size}`,
      units: { position: 'mm', size: 'mm', fontSize: 'pt' },
      cardWidthMm: layoutData.cardWidthMm,
      cardHeightMm: layoutData.cardHeightMm,
      story: layoutData.story ? {
        position: { ...layoutData.story.position },
        size: { ...layoutData.story.size },
        fontSizePt: layoutData.story.fontSizePt || 12
      } : null,
      photos: layoutData.photos.map(photo => ({
        id: photo.id,
        position: { ...photo.position },
        size: { ...photo.size },
        borderRadius: photo.borderRadius || 0
      }))
    }
    
    // Populate the editable content
    editableJsonContent.value = JSON.stringify(jsonLayout, null, 2)
    
    // Open the dialog
    showJsonDialog.value = true
    
    console.log('[JSON DIALOG] Opened with content:', editableJsonContent.value.length, 'characters')
  } catch (error) {
    console.error('Error opening JSON dialog:', error)
    alert('Error preparing JSON content. Please try again.')
  }
}

// Function to get current layout as JSON
function getCurrentLayoutJson() {
  try {
    const jsonLayout = {
      name: `Layout for ${props.size}`,
      units: { position: 'mm', size: 'mm', fontSize: 'pt' },
      cardWidthMm: layoutData.cardWidthMm,
      cardHeightMm: layoutData.cardHeightMm,
      story: layoutData.story ? {
        position: { ...layoutData.story.position },
        size: { ...layoutData.story.size },
        fontSizePt: layoutData.story.fontSizePt || 12
      } : null,
      photos: layoutData.photos.map(photo => ({
        id: photo.id,
        position: { ...photo.position },
        size: { ...photo.size },
        borderRadius: photo.borderRadius || 0
      }))
    }
    
    // Populate the editable content when getting JSON
    editableJsonContent.value = JSON.stringify(jsonLayout, null, 2)
    
    return jsonLayout
  } catch (error) {
    console.error('Error generating JSON:', error)
    return '{}'
  }
}

// Function to copy JSON to clipboard
function copyJsonToClipboard() {
  const jsonString = getCurrentLayoutJson()
  navigator.clipboard.writeText(jsonString).then(() => {
    alert('JSON copied to clipboard!')
  }).catch(err => {
    console.error('Failed to copy JSON to clipboard:', err)
    alert('Failed to copy JSON to clipboard.')
  })
}

// Function to apply changes from the editable JSON textarea
function applyJsonChanges() {
  try {
    const parsedJson = typeof editableJsonContent.value === 'string' 
      ? JSON.parse(editableJsonContent.value) 
      : editableJsonContent.value
    
    // Ensure it's a valid layout structure
    if (!parsedJson || !parsedJson.name || !parsedJson.units || !parsedJson.cardWidthMm || !parsedJson.cardHeightMm || !parsedJson.photos) {
      alert('Invalid JSON structure. Please ensure it includes "name", "units", "cardWidthMm", "cardHeightMm", and "photos".')
      return
    }

    // Update layoutData with the new JSON
    layoutData.cardWidthMm = parsedJson.cardWidthMm
    layoutData.cardHeightMm = parsedJson.cardHeightMm
    
    // Update story data
    if (parsedJson.story) {
      layoutData.story.position = { ...parsedJson.story.position }
      layoutData.story.size = { ...parsedJson.story.size }
      layoutData.story.fontSizePt = parsedJson.story.fontSizePt || 12
    }
    
    // Update photos data
    if (parsedJson.photos && Array.isArray(parsedJson.photos)) {
      layoutData.photos = parsedJson.photos.map(photo => ({
        id: photo.id,
        position: { ...photo.position },
        size: { ...photo.size },
        borderRadius: photo.borderRadius || 0
      }))
      
      // Update nextPhotoId to avoid conflicts
      if (layoutData.photos.length > 0) {
        const maxId = Math.max(...layoutData.photos.map(p => {
          const match = p.id.match(/photo-(\d+)/)
          return match ? parseInt(match[1]) : 0
        }))
        nextPhotoId.value = maxId + 1
      }
    }
    
    // Clear any selections
    selectedBoxes.value = []
    
    console.log('[JSON APPLIED]', parsedJson)
  } catch (error) {
    console.error('Error applying JSON changes:', error)
    alert('❌ Failed to apply JSON changes. Please check the JSON format.')
  }
}

// Function to cancel JSON editing
function cancelJsonEdit() {
  showJsonDialog.value = false
  // Reset the editable content to the current layout
  editableJsonContent.value = getCurrentLayoutJson()
}

// Function to save JSON changes
function saveJsonChanges() {
  try {
    const parsedJson = typeof editableJsonContent.value === 'string' 
      ? JSON.parse(editableJsonContent.value) 
      : editableJsonContent.value
    
    // Ensure it's a valid layout structure
    if (!parsedJson || !parsedJson.name || !parsedJson.units || !parsedJson.cardWidthMm || !parsedJson.cardHeightMm || !parsedJson.photos) {
      alert('Invalid JSON structure. Please ensure it includes "name", "units", "cardWidthMm", "cardHeightMm", and "photos".')
      return
    }

    // Update layoutData with the new JSON
    layoutData.cardWidthMm = parsedJson.cardWidthMm
    layoutData.cardHeightMm = parsedJson.cardHeightMm
    
    // Update story data
    if (parsedJson.story) {
      layoutData.story.position = { ...parsedJson.story.position }
      layoutData.story.size = { ...parsedJson.story.size }
      layoutData.story.fontSizePt = parsedJson.story.fontSizePt || 12
    }
    
    // Update photos data
    if (parsedJson.photos && Array.isArray(parsedJson.photos)) {
      layoutData.photos = parsedJson.photos.map(photo => ({
        id: photo.id,
        position: { ...photo.position },
        size: { ...photo.size },
        borderRadius: photo.borderRadius || 0
      }))
      
      // Update nextPhotoId to avoid conflicts
      if (layoutData.photos.length > 0) {
        const maxId = Math.max(...layoutData.photos.map(p => {
          const match = p.id.match(/photo-(\d+)/)
          return match ? parseInt(match[1]) : 0
        }))
        nextPhotoId.value = maxId + 1
      }
    }
    
    // Clear any selections
    selectedBoxes.value = []
    
    // Close the dialog
    showJsonDialog.value = false
    
    // Refresh the JSON content in the editor
    editableJsonContent.value = getCurrentLayoutJson()
    
    console.log('[JSON SAVED]', parsedJson)
    alert("JSON saved")
  } catch (error) {
    console.error('Error saving JSON changes:', error)
    alert('❌ Failed to save JSON changes. Please check the JSON format.')
  }
}

// JSON Editor event handlers - removed due to import issues
// function onJsonEditorChange(value) {
//   editableJsonContent.value = value
// }

// function onJsonEditorError(error) {
//   console.error('JSON Editor Error:', error)
// }

// function onJsonEditorHasError(error) {
//   console.error('JSON Editor Has Error:', error)
// }

// Function to handle double-click on boxes
function handleBoxDoubleClick(id, event) {
  event.preventDefault()
  event.stopPropagation()
  
  // Get current dimensions (already in mm)
  let currentWidth, currentHeight
  if (id === 'story') {
    currentWidth = layoutData.story.size.width
    currentHeight = layoutData.story.size.height
  } else {
    const photo = layoutData.photos.find(p => p.id === id)
    if (!photo) return
    currentWidth = photo.size.width
    currentHeight = photo.size.height
  }
  
  // Dimensions are already in mm, no conversion needed
  const widthMm = Math.round(currentWidth)
  const heightMm = Math.round(currentHeight)
  
  // Set up dialog data
  resizeDialogData.value = {
    id: id,
    currentWidth: currentWidth,
    currentHeight: currentHeight,
    newWidthMm: widthMm.toString(),
    newHeightMm: heightMm.toString()
  }
  
  showResizeDialog.value = true
}

// Generate proper default layout for a given size
function generateDefaultLayout(size) {
  const dimensions = calculateSizeDimensions(size)
  
  // Convert card dimensions to mm
  const cardWidthMm = Math.round(dimensions.width * 25.4)
  const cardHeightMm = Math.round(dimensions.height * 25.4)
  
  // Calculate margins and spacing in mm
  const marginMm = 10 // 10mm margin
  const spacingMm = 10 // 10mm spacing
  
  // Calculate available area
  const availableWidth = cardWidthMm - (marginMm * 2)
  const availableHeight = cardHeightMm - (marginMm * 2)
  
  // Generate layout based on aspect ratio
  if (dimensions.aspectRatio > 1) {
    // Landscape layout
    const photoWidth = (availableWidth - spacingMm) / 2
    const photoHeight = (availableHeight - spacingMm) / 2
    
    return {
      name: `${size} Landscape Layout`,
      units: { position: 'mm', size: 'mm', fontSize: 'pt' },
      cardWidthMm: cardWidthMm,
      cardHeightMm: cardHeightMm,
      story: {
        position: { x: marginMm + photoWidth + spacingMm, y: marginMm },
        size: { width: photoWidth, height: availableHeight },
        fontSizePt: 12,
        align: 'center'
      },
      photos: [
        { id: '1', position: { x: marginMm, y: marginMm }, size: { width: photoWidth, height: photoHeight }, borderRadius: 3 },
        { id: '2', position: { x: marginMm, y: marginMm + photoHeight + spacingMm }, size: { width: photoWidth, height: photoHeight }, borderRadius: 3 },
        { id: '3', position: { x: marginMm + photoWidth + spacingMm, y: marginMm + photoHeight + spacingMm }, size: { width: photoWidth, height: photoHeight }, borderRadius: 3 },
        { id: '4', position: { x: marginMm + photoWidth + spacingMm, y: marginMm + photoHeight + spacingMm }, size: { width: photoWidth, height: photoHeight }, borderRadius: 3 }
      ]
    }
  } else {
    // Portrait layout
    const photoWidth = (availableWidth - spacingMm) / 2
    const photoHeight = (availableHeight - spacingMm * 2) / 3
    
    return {
      name: `${size} Portrait Layout`,
      units: { position: 'mm', size: 'mm', fontSize: 'pt' },
      cardWidthMm: cardWidthMm,
      cardHeightMm: cardHeightMm,
      story: {
        position: { x: marginMm, y: marginMm + photoHeight * 2 + spacingMm * 2 },
        size: { width: availableWidth, height: photoHeight },
        fontSizePt: 12,
        align: 'center'
      },
      photos: [
        { id: '1', position: { x: marginMm, y: marginMm }, size: { width: photoWidth, height: photoHeight }, borderRadius: 3 },
        { id: '2', position: { x: marginMm + photoWidth + spacingMm, y: marginMm }, size: { width: photoWidth, height: photoHeight }, borderRadius: 3 },
        { id: '3', position: { x: marginMm, y: marginMm + photoHeight + spacingMm }, size: { width: photoWidth, height: photoHeight }, borderRadius: 3 },
        { id: '4', position: { x: marginMm + photoWidth + spacingMm, y: marginMm + photoHeight + spacingMm }, size: { width: photoWidth, height: photoHeight }, borderRadius: 3 }
      ]
    }
  }
}
</script>

<style scoped>
.box {
  position: relative;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: move;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.story-box {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #3b82f6;
  color: #1e40af;
}

.photo-box {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
  color: #065f46;
}

.drag-handle {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  cursor: move;
  z-index: 10;
  border: 1px solid #1e40af;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease;
}

.drag-handle:hover {
  transform: scale(1.1);
}

.resize-handle {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 8px;
  height: 8px;
  background: #6b7280;
  cursor: nwse-resize;
  border-radius: 1px;
  border: 1px solid #374151;
  transition: background-color 0.1s ease;
}

.resize-handle:hover {
  background: #4b5563;
}

.box button {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.box button:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: scale(1.1);
}

.selected {
  border: 2px solid #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.2) !important;
  transform: scale(1.02);
}

.selection-indicator {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  pointer-events: none;
  z-index: 5;
  background: rgba(59, 130, 246, 0.05);
}

</style>