<template>
  <ClientOnly>
    <div class="relative w-full h-full bg-brand-navigation">
              <!-- PDF Document -->
        <div class="w-full h-full overflow-auto pb-20 scrollbar-hide">
          <div class="w-full h-full flex p-4 mb-4" :class="shouldPositionAtTop ? 'items-start justify-center' : 'items-center justify-center'" @vue:mounted="logPositioningClasses">
          <div 
            ref="pdfContainer"
            class="mb-4 flex"
            :style="pdfContainerStyle"
          >
            <div 
              :style="{ 
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }"
            >
              <VuePdfEmbed
                :key="`pdf-${pdfEmbedKey}`"
                ref="pdfRef"
                :source="props.src"
                :page="currentPage"
                :scale="1.0"
                annotation-layer
                text-layer
                @loaded="onLoaded"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation + Zoom Controls -->
      <div class="absolute bottom-0 left-0 right-0 flex justify-center items-center py-2 sm:py-3 bg-white z-10 border-t border-brand-primary/20">
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Previous Page -->
          <button
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
            :disabled="currentPage <= 1"
            @click="prevPage"
            aria-label="Previous page"
          >
            <i class="pi pi-angle-left text-xl sm:text-2xl text-brand-primary" :class="{ 'opacity-50': currentPage <= 1 }"></i>
          </button>

          <!-- Page Info -->
          <span class="text-xs sm:text-base font-medium text-brand-primary select-none">
            Page {{ currentPage }} / {{ pageCount }}
          </span>

          <!-- Next Page -->
          <button
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
            :disabled="currentPage >= pageCount"
            @click="nextPage"
            aria-label="Next page"
          >
            <i class="pi pi-angle-right text-xl sm:text-2xl text-brand-primary" :class="{ 'opacity-50': currentPage >= pageCount }"></i>
          </button>

          <!-- Zoom Out -->
          <button
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header ml-2"
            @click="zoomOut"
            aria-label="Zoom Out"
          >
            <i class="pi pi-search-minus text-xl sm:text-2xl text-brand-header"></i>
          </button>

          <!-- Zoom In -->
          <button
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
            @click="zoomIn"
            aria-label="Zoom In"
          >
            <i class="pi pi-search-plus text-xl sm:text-2xl text-brand-header"></i>
          </button>

          <!-- Download -->
          <button
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header ml-2"
            @click="downloadPdf"
            aria-label="Download PDF"
          >
            <i class="pi pi-download text-xl sm:text-2xl text-brand-header"></i>
          </button>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/styles/annotationLayer.css'
import 'vue-pdf-embed/dist/styles/textLayer.css'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const pdfRef = ref(null)
const pdfContainer = ref(null)
const currentPage = ref(1)
const pageCount = ref(1)
const isLoaded = ref(false)
const scale = ref(0.8)
const pdfEmbedKey = ref(0) // used to force VuePdfEmbed to re-render
const pdfDimensions = ref({ width: 0, height: 0 })

const pdfContainerStyle = computed(() => {
  // For 8.5 x 11 aspect ratio, we want to maintain this ratio
  // 8.5:11 = 0.773 aspect ratio
  const targetAspectRatio = 8.5 / 11 // 0.773
  
  // Calculate container dimensions based on scale
  const baseWidth = 600 + (scale.value - 0.8) * 200 // Start at 600px, scale up/down
  const baseHeight = baseWidth / targetAspectRatio // Maintain 8.5:11 ratio
  
  // Ensure minimum and maximum sizes
  const minWidth = 400
  const maxWidth = 1200
  const minHeight = minWidth / targetAspectRatio
  const maxHeight = maxWidth / targetAspectRatio
  
  const containerWidth = Math.max(minWidth, Math.min(maxWidth, baseWidth))
  const containerHeight = Math.max(minHeight, Math.min(maxHeight, baseHeight))

  console.log('🔍 PDF Container Style Update:', {
    scale: scale.value,
    targetAspectRatio,
    containerWidth,
    containerHeight,
    baseWidth,
    baseHeight
  })

  return {
    width: `${containerWidth}px`,
    height: `${containerHeight}px`,
    maxWidth: 'none',
    maxHeight: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

// Determine if PDF should be positioned at top or centered based on actual PDF dimensions
const shouldPositionAtTop = computed(() => {
  const { width, height } = pdfDimensions.value
  
  console.log('🔍 PDF Positioning Logic:', {
    pdfWidth: width,
    pdfHeight: height,
    hasDimensions: width > 0 && height > 0
  })
  
  if (!width || !height) {
    console.log('🔍 No PDF dimensions available, defaulting to center')
    return false
  }
  
  // Since all PDFs are now scaled to fit the available space, center all of them
  console.log('🔍 All PDFs are scaled to fit, centering all')
  return false
})

function onLoaded(pdf) {
  pageCount.value = pdf.numPages
  isLoaded.value = true
  if (currentPage.value > pdf.numPages) {
    currentPage.value = 1
  }

  pdf.getPage(1).then(page => {
    const viewport = page.getViewport({ scale: 1.0 })
    pdfDimensions.value = {
      width: viewport.width,
      height: viewport.height
    }
    console.log('🔍 PDF Loaded with dimensions:', pdfDimensions.value)
    
    // Calculate initial scale to fit PDF in dialog with 10px margins
    // Add small delay to ensure container is available
    setTimeout(() => {
      calculateInitialScale()
    }, 100)
  }).catch(() => {
    // For 8.5 x 11 documents, use standard dimensions
    pdfDimensions.value = { width: 612, height: 792 } // 8.5 x 11 at 72 DPI
    console.log('🔍 PDF Loaded with 8.5x11 fallback dimensions:', pdfDimensions.value)
    setTimeout(() => {
      calculateInitialScale()
    }, 100)
  })
}

function calculateInitialScale() {
  // Get the actual container dimensions
  const container = pdfContainer.value
  if (!container) {
    console.log('🔍 Container not available, using default scale')
    scale.value = 0.8
    return
  }
  
  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width
  const containerHeight = containerRect.height
  
  const { width: pdfWidth, height: pdfHeight } = pdfDimensions.value
  
  if (!pdfWidth || !pdfHeight) {
    console.log('🔍 No PDF dimensions available, using default scale')
    scale.value = 0.8
    return
  }
  
  // Account for padding (p-4 = 16px on each side)
  const availableWidth = containerWidth - 32 // 16px padding on each side
  const availableHeight = containerHeight - 32 // 16px padding on top and bottom
  
  // Calculate scale to fit width and height with 20px margins for better spacing
  const scaleForWidth = (availableWidth - 40) / pdfWidth // 20px margin on each side
  const scaleForHeight = (availableHeight - 40) / pdfHeight // 20px margin on top and bottom
  
  // Use the smaller scale to ensure PDF fits completely
  const calculatedScale = Math.min(scaleForWidth, scaleForHeight, 2.5) // Cap at 2.5x zoom
  
  console.log('🔍 Initial Scale Calculation:', {
    containerWidth,
    containerHeight,
    availableWidth,
    availableHeight,
    pdfWidth,
    pdfHeight,
    scaleForWidth,
    scaleForHeight,
    calculatedScale,
    finalScale: Math.max(calculatedScale, 0.4)
  })
  
  scale.value = Math.max(calculatedScale, 0.4) // Minimum 0.4x zoom for better visibility
}

function logPositioningClasses() {
  console.log('🔍 PDF Container Positioning Classes:', {
    shouldPositionAtTop: shouldPositionAtTop.value,
    appliedClasses: shouldPositionAtTop.value ? 'items-start justify-center' : 'items-center justify-center',
    pdfDimensions: pdfDimensions.value
  })
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function nextPage() {
  if (currentPage.value < pageCount.value) currentPage.value++
}
function downloadPdf() {
  if (pdfRef.value?.download) {
    pdfRef.value.download()
  } else {
    window.open(props.src, '_blank')
  }
}

function zoomIn() {
  console.log('🔍 Zoom In clicked, current scale:', scale.value)
  if (scale.value < 2.5) {
    scale.value = +(scale.value + 0.2).toFixed(1)
    console.log('🔍 New scale after zoom in:', scale.value)
    pdfEmbedKey.value++  // force component to re-render
    // Force a small delay to ensure the component re-renders
    setTimeout(() => {
      console.log('🔍 Forcing PDF re-render after zoom in')
    }, 100)
  }
}
function zoomOut() {
  console.log('🔍 Zoom Out clicked, current scale:', scale.value)
  if (scale.value > 0.4) {
    scale.value = +(scale.value - 0.2).toFixed(1)
    console.log('🔍 New scale after zoom out:', scale.value)
    pdfEmbedKey.value++
    // Force a small delay to ensure the component re-renders
    setTimeout(() => {
      console.log('🔍 Forcing PDF re-render after zoom out')
    }, 100)
  }
}

watch(() => props.src, () => {
  currentPage.value = 1
  isLoaded.value = false
  scale.value = 0.8 // Will be recalculated when PDF loads
  pdfDimensions.value = { width: 0, height: 0 }
  pdfEmbedKey.value++ // ensure rerender when switching files
})

// Watch for scale changes to debug
watch(scale, (newScale) => {
  console.log('🔍 Scale changed to:', newScale)
})

// Watch for container style changes
watch(pdfContainerStyle, (newStyle) => {
  console.log('🔍 Container style updated:', newStyle)
}, { deep: true })

// Watch for PDF dimensions changes
watch(pdfDimensions, (newDimensions) => {
  console.log('🔍 PDF dimensions changed:', newDimensions)
}, { deep: true })

// Watch for positioning changes
watch(shouldPositionAtTop, (newPosition) => {
  console.log('🔍 PDF positioning changed:', {
    shouldPositionAtTop: newPosition,
    pdfDimensions: pdfDimensions.value,
    appliedClasses: newPosition ? 'items-start justify-center' : 'items-center justify-center'
  })
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}
</style>