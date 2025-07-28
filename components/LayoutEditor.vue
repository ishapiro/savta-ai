<template>
  <div>
    <div class="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
      Click and drag red boxes to move elements. Click X to delete an element.
    </div>
    
    <div class="mb-3 space-x-2">
      <button @click="addPhoto" class="px-2 py-1 bg-green-600 text-white rounded text-sm">Add Photo</button>
      <button 
        @click="addStory" 
        :disabled="!!layoutData.story"
        class="px-2 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Story
      </button>
      <button 
        v-if="layoutData.story"
        @click="deleteStory" 
        class="px-2 py-1 bg-red-600 text-white rounded text-sm"
      >
        Remove Story
      </button>
      <button @click="resetLayout" class="px-2 py-1 bg-orange-600 text-white rounded text-sm">Reset</button>
      <button @click="saveLayout" class="px-2 py-1 bg-blue-600 text-white rounded text-sm">Save Layout</button>
      
      <!-- Edit Defaults Mode Toggle -->
      <button
        @click="isEditDefaultsMode = !isEditDefaultsMode"
        :class="isEditDefaultsMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'"
        class="px-2 py-1 text-white rounded text-sm transition-colors"
      >
        {{ editDefaultsButtonText }}
      </button>

      <!-- Save Defaults Button (only show in edit mode) -->
      <button
        v-if="isEditDefaultsMode"
        @click="saveEditedDefaults"
        class="px-2 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
      >
        Save as Default
      </button>
    </div>

    <!-- Size and Scale Information -->
    <div class="mb-3 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
      <div class="flex justify-between items-center">
        <span class="text-gray-700">
          <strong>Size:</strong> {{ sizeDimensions.width }}" × {{ sizeDimensions.height }}" 
          ({{ sizeDimensions.aspectRatio.toFixed(2) }}:1 ratio)
        </span>
        <span class="text-gray-700">
          <strong>Scale Factor:</strong> {{ SCALE_FACTOR.toFixed(2) }}x
        </span>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
      <div class="text-blue-800">
        <strong>Instructions:</strong>
        <ul class="mt-1 space-y-1">
          <li>• Click and drag the <span class="font-semibold text-blue-600">blue dots</span> to move elements</li>
          <li>• Click the <span class="font-semibold text-red-600">red X</span> to delete an element</li>
          <li>• Use the Reset button to restore default layout for current size</li>
        </ul>
      </div>
    </div>

    <!-- Edit Defaults Mode Indicator -->
    <div v-if="isEditDefaultsMode" class="mb-3 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm">
      <div class="text-yellow-800">
        <strong>⚠️ Edit Defaults Mode Active</strong>
        <p class="mt-1">You are editing the default layout for size: <span class="font-semibold">{{ props.size }}</span></p>
        <p class="mt-1 text-xs">Changes will be saved as the new default for this size.</p>
      </div>
    </div>

    <div 
      class="relative" 
      :style="canvasStyle" 
      :class="{ 'border-4 border-yellow-400 bg-yellow-50': isEditDefaultsMode }"
      id="canvas"
    >
      <!-- Original boxes restored -->
      <div
        v-if="layoutData.story"
        class="box story-box"
        :id="`box-story`"
        :style="boxStyle(layoutData.story.position, layoutData.story.size)"
      >
        <div class="drag-handle" :id="`drag-story`" @pointerdown="startDrag('story', $event)"></div>
        <span>Story ({{ layoutData.story.fontSizePt }}pt)</span>
        <button @click.stop="deleteStory">×</button>
        <div class="resize-handle" @pointerdown.stop.prevent="startResize('story', $event)"></div>
      </div>

      <div
        v-for="photo in layoutData.photos"
        :key="photo.id"
        class="box photo-box"
        :id="`box-${photo.id}`"
        :style="photoBoxStyle(photo)"
      >
        <div class="drag-handle" :id="`drag-${photo.id}`" @pointerdown="startDrag(photo.id, $event)"></div>
        <span>Photo {{ photo.id }}</span>
        <button @click.stop="deletePhoto(photo.id)">×</button>
        <div class="resize-handle" @pointerdown.stop.prevent="startResize(photo.id, $event)"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'

const props = defineProps({
  initialLayout: {
    type: Object,
    default: null
  },
  size: {
    type: String,
    default: '7x5'
  }
})

const emit = defineEmits(['save'])

// Plain JavaScript variables for drag state
let isDragging = false
let currentDragId = null
let isResizing = false
let currentResizeId = null
let resizeStart = { x: 0, y: 0, width: 0, height: 0 }

// Reactive object for layout data
const layoutData = reactive({
  name: 'Four Photo Portrait with Story',
  units: { position: 'px', size: 'px', fontSize: 'pt' },
  canvasSize: { width: 800, height: 600 },
  cardSize: { width: 0, height: 0 }, // Will be calculated based on size
  orientation: 'portrait',
  story: {
    position: { x: 70, y: 420 },
    size: { width: 700, height: 120 },
    fontSizePt: 10,
    align: 'center'
  },
  photos: [
    { id: '1', position: { x: 35, y: 35 }, size: { width: 350, height: 180 }, borderRadius: 12 },
    { id: '2', position: { x: 455, y: 35 }, size: { width: 350, height: 180 }, borderRadius: 12 },
    { id: '3', position: { x: 35, y: 240 }, size: { width: 350, height: 180 }, borderRadius: 12 },
    { id: '4', position: { x: 455, y: 240 }, size: { width: 350, height: 180 }, borderRadius: 12 }
  ]
})

// Edit defaults mode
const isEditDefaultsMode = ref(false)
const editDefaultsButtonText = computed(() => 
  isEditDefaultsMode.value ? 'Exit Edit Mode' : 'Edit Defaults'
)

// Function to calculate dimensions and scale factor based on size
function calculateSizeDimensions(size) {
  const sizeMap = {
    '3x5': { width: 3, height: 5, aspectRatio: 0.6 },
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
          units: { position: 'px', size: 'px', fontSize: 'pt' },
          canvasSize: { width: 0, height: 0 },
          cardSize: { width: 0, height: 0 },
          orientation: 'landscape',
          story: {
            position: { x: 533, y: 50 },
            size: { width: 267, height: 500 },
            fontSizePt: 9,
            align: 'center'
          },
          photos: [
            { id: '1', position: { x: 50, y: 50 }, size: { width: 220, height: 220 }, borderRadius: 10 },
            { id: '2', position: { x: 290, y: 50 }, size: { width: 220, height: 220 }, borderRadius: 10 },
            { id: '3', position: { x: 50, y: 290 }, size: { width: 220, height: 220 }, borderRadius: 10 },
            { id: '4', position: { x: 290, y: 290 }, size: { width: 220, height: 220 }, borderRadius: 10 }
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
    
    // Create a clean copy of the current layout data
    const layoutToSave = {
      name: layoutData.name,
      units: { ...layoutData.units },
      canvasSize: { width: 0, height: 0 }, // Always 0, calculated by watcher
      cardSize: { width: 0, height: 0 },
      orientation: layoutData.orientation,
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
      
      // Show success message
      alert(`✅ Default layout for ${props.size} saved successfully!`)
    } else {
      console.error('[SAVE DEFAULTS] Failed to save defaults:', response.statusText)
      alert('❌ Failed to save default layout. Please try again.')
    }
  } catch (error) {
    console.error('[SAVE DEFAULTS] Error saving defaults:', error)
    alert('❌ Error saving default layout. Please try again.')
  }
}

// Calculate dimensions and scale factor
const sizeDimensions = computed(() => calculateSizeDimensions(props.size))
const SCALE_FACTOR = computed(() => {
  // Calculate scale factor to fit within 800x600 wireframe
  const maxWidth = 800
  const maxHeight = 600
  const scaleX = maxWidth / (sizeDimensions.value.width * 100) // Convert inches to points (1 inch = 100 points)
  const scaleY = maxHeight / (sizeDimensions.value.height * 100)
  return Math.min(scaleX, scaleY, 2.5) // Cap at 2.5x scale factor
})

const canvasStyle = computed(() => ({
  width: `${layoutData.canvasSize.width}px`,
  height: `${layoutData.canvasSize.height}px`,
  backgroundColor: '#fff8f0',
  border: '1px solid #ccc',
  borderRadius: '4px'
}))

function boxStyle(position, size) {
  return {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    padding: '4px',
    userSelect: 'none'
  }
}

function photoBoxStyle(photo) {
  return {
    ...boxStyle(photo.position, photo.size),
    borderRadius: `${photo.borderRadius}px`
  }
}

function clampToBounds(pos, size) {
  console.log('[CLAMP DEBUG] Input values:', { pos, size, canvasSize: layoutData.canvasSize })
  
  const maxX = layoutData.canvasSize.width - size.width
  const maxY = layoutData.canvasSize.height - size.height
  
  console.log('[CLAMP DEBUG] Bounds:', { maxX, maxY })
  
  const clamped = {
    x: Math.max(0, Math.min(maxX, pos.x)),
    y: Math.max(0, Math.min(maxY, pos.y))
  }
  
  console.log('[CLAMP DEBUG] Calculation:', { 
    originalX: pos.x, 
    maxX, 
    clampedX: clamped.x,
    originalY: pos.y,
    maxY,
    clampedY: clamped.y
  })
  
  console.log('[CLAMP]', { input: pos, size, canvasSize: layoutData.canvasSize, output: clamped })
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
  dragHandle.style.width = '12px'
  dragHandle.style.height = '12px'
  dragHandle.style.background = '#666'
  dragHandle.style.borderRadius = '50%'
  dragHandle.style.cursor = 'move'
  dragHandle.style.zIndex = '10'
  
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

  isDragging = true
  currentDragId = id

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

  if (isDragging && currentDragId) {
    const canvas = document.getElementById('canvas')
    const canvasRect = canvas.getBoundingClientRect()

    // Simply place the box top-left corner at mouse position
    const mouseX = event.clientX - canvasRect.left
    const mouseY = event.clientY - canvasRect.top

    console.log('[DRAG MOVE]', {
      dragging: currentDragId,
      clientX: event.clientX,
      clientY: event.clientY,
      canvasRect: { left: canvasRect.left, top: canvasRect.top },
      mouseRelativeToCanvas: { x: mouseX, y: mouseY }
    })

    // Direct DOM manipulation - bypass Vue entirely
    const boxId = currentDragId === 'story' ? 'box-story' : `box-${currentDragId}`
    const box = document.getElementById(boxId)
    
    if (box) {
      // Get the appropriate size based on the element type
      let size
      if (currentDragId === 'story') {
        size = layoutData.story.size
      } else {
        const photo = layoutData.photos.find(p => p.id === currentDragId)
        size = photo ? photo.size : { width: 200, height: 150 }
      }
      
      console.log('[DRAG MOVE] Before clampToBounds:', { mouseX, mouseY, size })
      const newPos = clampToBounds({ x: mouseX, y: mouseY }, size)
      console.log('[DRAG MOVE] After clampToBounds:', { newPos })
      
      // Set position directly on DOM element
      box.style.left = `${newPos.x}px`
      box.style.top = `${newPos.y}px`
      
      console.log('[DRAG MOVE] Direct DOM update:', { boxId, newPos })
    } else {
      console.log('[DRAG MOVE] Box not found:', boxId)
    }
  }

  if (isResizing && currentResizeId) {
    const dx = event.clientX - resizeStart.x
    const dy = event.clientY - resizeStart.y

    if (currentResizeId === 'story') {
      layoutData.story.size.width = Math.max(50, resizeStart.width + dx)
      layoutData.story.size.height = Math.max(30, resizeStart.height + dy)
    } else {
      const photo = layoutData.photos.find(p => p.id === currentResizeId)
      if (photo) {
        photo.size.width = Math.max(50, resizeStart.width + dx)
        photo.size.height = Math.max(30, resizeStart.height + dy)
      }
    }
  }
}

function stopInteraction() {
  console.log('[DRAG STOP]', { dragging: currentDragId, resizing: currentResizeId })
  
  // If we were dragging, sync the final position back to data
  if (isDragging && currentDragId) {
    const boxId = currentDragId === 'story' ? 'box-story' : `box-${currentDragId}`
    const box = document.getElementById(boxId)
    
    if (box) {
      const finalX = parseInt(box.style.left)
      const finalY = parseInt(box.style.top)
      
      console.log('[DRAG STOP] Syncing final position to data:', { currentDragId, finalX, finalY })
      
      // Sync position back to layoutData
      if (currentDragId === 'story') {
        layoutData.story.position = { x: finalX, y: finalY }
      } else {
        const photo = layoutData.photos.find(p => p.id === currentDragId)
        if (photo) {
          photo.position = { x: finalX, y: finalY }
        }
      }
      
      console.log('[DRAG STOP] Position synced to layoutData:', { currentDragId, finalX, finalY })
    }
  }
  
  isDragging = false
  currentDragId = null
  isResizing = false
  currentResizeId = null
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', stopInteraction)
}

function startResize(id, event) {
  event.preventDefault()
  isResizing = true
  currentResizeId = id
  resizeStart = {
    x: event.clientX,
    y: event.clientY,
    width: id === 'story' ? layoutData.story.size.width : layoutData.photos.find(p => p.id === id).size.width,
    height: id === 'story' ? layoutData.story.size.height : layoutData.photos.find(p => p.id === id).size.height
  }
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', stopInteraction)
}

function addPhoto() {
  const newId = String(Date.now())
  const newPhoto = {
    id: newId,
    position: { x: 70, y: 70 },
    size: { width: 200, height: 150 },
    borderRadius: 10
  }
  
  layoutData.photos.push(newPhoto)
  // Box will be rendered by Vue template automatically
}

function addStory() {
  layoutData.story = {
    position: { x: 70, y: 420 },
    size: { width: 700, height: 120 },
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
  const defaultLayout = await getDefaultLayout(props.size)
  
  // Reset to default layout for current size
  layoutData.name = defaultLayout.name
  layoutData.orientation = defaultLayout.orientation
  layoutData.story = defaultLayout.story
  layoutData.photos = defaultLayout.photos
  
  console.log('[RESET] Reset to default layout for size:', props.size)
}

function saveLayout() {
  // Create a deep copy of the layout data
  const jsonLayout = JSON.parse(JSON.stringify(layoutData))
  jsonLayout.cardSize = layoutData.cardSize

  if (jsonLayout.story) {
    jsonLayout.story.position = {
      x: Math.round(layoutData.story.position.x * SCALE_FACTOR),
      y: Math.round(layoutData.story.position.y * SCALE_FACTOR)
    }
    jsonLayout.story.size = {
      width: Math.round(layoutData.story.size.width * SCALE_FACTOR),
      height: Math.round(layoutData.story.size.height * SCALE_FACTOR)
    }
  }

  jsonLayout.photos = layoutData.photos.map(photo => ({
    ...photo,
    position: {
      x: Math.round(photo.position.x * SCALE_FACTOR),
      y: Math.round(photo.position.y * SCALE_FACTOR)
    },
    size: {
      width: Math.round(photo.size.width * SCALE_FACTOR),
      height: Math.round(photo.size.height * SCALE_FACTOR)
    },
    borderRadius: Math.round(photo.borderRadius * SCALE_FACTOR)
  }))

  delete jsonLayout.canvasSize
  emit('save', jsonLayout)
}

// Track if this is an existing theme with layout data
let hasExistingLayout = false

// Watcher to update canvas size based on aspect ratio
watch(() => props.size, (newSize) => {
  const dimensions = calculateSizeDimensions(newSize)
  const maxWidth = 800
  const maxHeight = 600
  
  // Calculate canvas size to maintain aspect ratio within 800x600 bounds
  if (dimensions.aspectRatio > 1) {
    // Landscape: fit to width
    layoutData.canvasSize.width = maxWidth
    layoutData.canvasSize.height = Math.round(maxWidth / dimensions.aspectRatio)
  } else {
    // Portrait: fit to height
    layoutData.canvasSize.height = maxHeight
    layoutData.canvasSize.width = Math.round(maxHeight * dimensions.aspectRatio)
  }
  
  // Update card size (actual print size in points)
  layoutData.cardSize.width = Math.round(dimensions.width * 100 * SCALE_FACTOR.value)
  layoutData.cardSize.height = Math.round(dimensions.height * 100 * SCALE_FACTOR.value)
  
  // Only reposition boxes if this is a new theme (no existing layout)
  if (!hasExistingLayout) {
    getDefaultLayout(newSize).then(defaultLayout => {
      layoutData.name = defaultLayout.name
      layoutData.orientation = defaultLayout.orientation
      layoutData.story = defaultLayout.story
      layoutData.photos = defaultLayout.photos
    })
  }
  
  console.log('[SIZE CHANGE]', { 
    size: newSize, 
    dimensions, 
    canvasSize: layoutData.canvasSize, 
    cardSize: layoutData.cardSize,
    scaleFactor: SCALE_FACTOR.value,
    hasExistingLayout
  })
}, { immediate: true })

// Initialize boxes when component mounts
onMounted(() => {
  // If initial layout is provided, use it to initialize the layout data
  if (props.initialLayout) {
    console.log('[MOUNTED] Initializing with provided layout:', props.initialLayout)
    Object.assign(layoutData, props.initialLayout)
    hasExistingLayout = true
  } else {
    console.log('[MOUNTED] Layout editor initialized with default layout')
    hasExistingLayout = false
  }
})
</script>

<style scoped>
.box {
  position: relative;
  border-radius: 4px;
  font-size: 12px;
  cursor: move;
}

.story-box {
  background: #cfe8ff;
  border: 1px dashed #3b82f6;
  color: #1d4ed8;
}

.photo-box {
  background-color: #d1fae5;
  border: 1px solid #10b981;
  color: #065f46;
}

.drag-handle {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: move;
  z-index: 10;
  border: 2px solid #1d4ed8;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  background: #555;
  cursor: nwse-resize;
  border-radius: 2px;
}

.box button {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: background-color 0.2s;
}

.box button:hover {
  background: #b91c1c;
}
</style>