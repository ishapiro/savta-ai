
<!-- PDF/Image Viewer for Savta.AI -->
<template>
  <ClientOnly>
    <div class="relative w-full h-full bg-brand-navigation">
      <!-- Document/Image Container -->
      <div class="w-full h-full overflow-hidden scrollbar-hide" :class="{ 'pb-16 sm:pb-20': true }">
        <div 
          ref="panContainer"
          class="w-full h-full relative"
          :class="[
            shouldPositionAtTop ? 'flex items-start justify-center' : 'flex items-center justify-center',
            isPanningAvailable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
            { 'touch-none': isPanningAvailable && isMobile }
          ]"
          @vue:mounted="logPositioningClasses"
          @mousedown="startPan"
          @mousemove="pan"
          @mouseup="stopPan"
          @mouseleave="stopPan"
          @touchstart="startPan"
          @touchmove="pan"
          @touchend="stopPan"
          @touchcancel="stopPan"
        >
          
          <!-- JPG Image Display -->
          <div v-if="isJpgImage"
               ref="imageContainer"
               class="flex"
               :class="{ 'mb-4': !isMobile }"
               :style="imageContainerStyle"
          >
            <img 
              :src="props.src"
              :alt="'Memory Book Image'"
              class="max-w-full max-h-full object-contain select-none"
              :style="{ 
                transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.2s ease-in-out'
              }"
              @load="onImageLoaded"
              @error="onImageError"
            />
          </div>

          <!-- PDF Document Display -->
          <div v-else
               ref="pdfContainer"
               class="flex"
               :class="{ 'mb-4': !isMobile }"
               :style="pdfContainerStyle"
          >
            <div 
              :style="{ 
                transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
                transformOrigin: 'center center',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: isPanning ? 'none' : 'transform 0.2s ease-in-out'
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

      <!-- Navigation + Zoom Controls (show for PDFs and JPGs) -->
              <div v-if="!isJpgImage" class="absolute bottom-0 left-0 right-0 flex justify-center items-center py-2 sm:py-3 bg-white z-10 border-t border-brand-primary/20">
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
            <span v-if="isPanningAvailable" class="ml-1 text-xs text-brand-header">(drag to pan)</span>
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
            v-if="!isMobile"
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header ml-2"
            @click="downloadPdf"
            aria-label="Download PDF"
          >
            <i class="pi pi-download text-xl sm:text-2xl text-brand-header"></i>
          </button>

          <!-- Share -->
          <button
            v-if="canShare"
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header ml-2"
            @click.prevent="sharePdf"
            aria-label="Share PDF"
          >
            <i class="pi pi-share-alt text-xl sm:text-2xl text-brand-header"></i>
          </button>
        </div>
      </div>

      <!-- Download/Share Controls for JPG Images -->
              <div v-if="isJpgImage" class="absolute bottom-0 left-0 right-0 flex justify-center items-center py-2 sm:py-3 bg-white z-10 border-t border-brand-primary/20">
                <div class="flex items-center gap-2 sm:gap-4">
                  <!-- Zoom Out -->
                  <button
                    class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
                    @click="zoomOut"
                    aria-label="Zoom Out"
                  >
                    <i class="pi pi-search-minus text-xl sm:text-2xl text-brand-header"></i>
                  </button>

                  <!-- Zoom Level Display -->
                  <span class="text-xs sm:text-base font-medium text-brand-primary select-none">
                    {{ Math.round(scale * 100) }}%
                    <span v-if="isPanningAvailable" class="ml-1 text-xs text-brand-header">(drag to pan)</span>
                  </span>

                  <!-- Zoom In -->
                  <button
                    class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
                    @click="zoomIn"
                    aria-label="Zoom In"
                  >
                    <i class="pi pi-search-plus text-xl sm:text-2xl text-brand-header"></i>
                  </button>

                  <!-- Reset Zoom -->
                  <button
                    class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
                    @click="resetZoom"
                    aria-label="Reset Zoom"
                    title="Reset to fit view"
                  >
                    <i class="pi pi-refresh text-xl sm:text-2xl text-brand-header"></i>
                  </button>

                  <!-- Download JPG -->
                  <button
                    v-if="!isMobile"
                    class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
                    @click="downloadImage"
                    aria-label="Download Image"
                  >
                    <i class="pi pi-download text-xl sm:text-2xl text-brand-header"></i>
                  </button>

                  <!-- Share JPG -->
                  <button
                    v-if="canShare"
                    class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header ml-2"
                    @click.prevent="shareImage"
                    aria-label="Share Image"
                  >
                    <i class="pi pi-share-alt text-xl sm:text-2xl text-brand-header"></i>
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
import { useAnalytics } from '~/composables/useAnalytics'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const pdfRef = ref(null)
const pdfContainer = ref(null)
const imageContainer = ref(null)
const panContainer = ref(null)
const currentPage = ref(1)
const pageCount = ref(1)
const isLoaded = ref(false)
const scale = ref(0.7)
const pdfEmbedKey = ref(0) // used to force VuePdfEmbed to re-render
const pdfDimensions = ref({ width: 0, height: 0 })
const isSharing = ref(false) // Track if we're currently sharing

// Panning state
const isPanning = ref(false)
const panX = ref(0)
const panY = ref(0)
const lastPanX = ref(0)
const lastPanY = ref(0)
const startX = ref(0)
const startY = ref(0)

// Image dimensions state
const imageDimensions = ref({ width: 0, height: 0 })
const actualImageDimensions = ref({ width: 0, height: 0 })

// Analytics tracking
const { trackEvent } = useAnalytics()

// Check if the source is a JPG image
const isJpgImage = computed(() => {
  // Remove query parameters and hash from URL before checking
  const cleanUrl = props.src ? props.src.split('?')[0].split('#')[0] : ''
  const result = cleanUrl && (cleanUrl.toLowerCase().endsWith('.jpg') || cleanUrl.toLowerCase().endsWith('.jpeg'))
  
  console.log('🔍 isJpgImage check:', {
    src: props.src,
    cleanUrl: cleanUrl,
    endsWithJpg: cleanUrl?.toLowerCase().endsWith('.jpg') || cleanUrl?.toLowerCase().endsWith('.jpeg'),
    result: result
  })
  return result
})

// Check if Web Share API is available
const canShare = computed(() => {
  return 'share' in navigator && navigator.canShare
})

// Check if device is mobile
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

// Check if panning is available (content larger than container)
const isPanningAvailable = computed(() => {
  if (!panContainer.value) {
    return false
  }
  
  const containerRect = panContainer.value.getBoundingClientRect()
  const containerWidth = containerRect.width
  const containerHeight = containerRect.height
  
  // Calculate scaled content dimensions
  let contentWidth, contentHeight
  if (isJpgImage.value) {
    const { width: actualWidth, height: actualHeight } = actualImageDimensions.value
    if (actualWidth > 0 && actualHeight > 0) {
      contentWidth = actualWidth * scale.value
      contentHeight = actualHeight * scale.value
    } else {
      const { width: displayWidth, height: displayHeight } = imageDimensions.value
      contentWidth = displayWidth * scale.value
      contentHeight = displayHeight * scale.value
    }
  } else {
    const { width, height } = pdfDimensions.value
    contentWidth = width * scale.value
    contentHeight = height * scale.value
  }
  
  return contentWidth > containerWidth || contentHeight > containerHeight
})

const pdfContainerStyle = computed(() => {
  // For 8.5 x 11 aspect ratio, we want to maintain this ratio
  // 8.5:11 = 0.773 aspect ratio
  const targetAspectRatio = 8.5 / 11 // 0.773
  
  // Use a fixed base size that doesn't change with scale
  // The scale will be applied to the PDF content inside, not the container
  const baseWidth = 750 // Increased from 600 to 750 (25% larger)
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

const imageContainerStyle = computed(() => {
  // For JPG images, use detected dimensions or fallback to defaults
  const { width: detectedWidth, height: detectedHeight } = imageDimensions.value
  const maxDisplayWidth = 1200 // Maximum display width
  const maxDisplayHeight = 900 // Maximum display height
  
  // Use detected dimensions if available, otherwise use defaults
  const displayWidth = detectedWidth > 0 ? detectedWidth : Math.min(1200, maxDisplayWidth)
  const displayHeight = detectedHeight > 0 ? detectedHeight : Math.min(900, maxDisplayHeight)
  
  console.log('🔍 JPG Image Container Style:', {
    detectedDimensions: `${detectedWidth}x${detectedHeight}`,
    displayDimensions: `${displayWidth}x${displayHeight}`,
    maxDisplayDimensions: `${maxDisplayWidth}x${maxDisplayHeight}`,
    hasDetectedDimensions: detectedWidth > 0 && detectedHeight > 0
  })
  
  return {
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    maxWidth: `${maxDisplayWidth}px`,
    maxHeight: `${maxDisplayHeight}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

// Determine if PDF should be positioned at top or centered based on actual PDF dimensions
const shouldPositionAtTop = computed(() => {
  if (isJpgImage.value) {
    // For images, always center
    return false
  }
  
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

function onImageLoaded(event) {
  const img = event.target
  isLoaded.value = true
  
  // Get actual image dimensions
  const actualWidth = img.naturalWidth
  const actualHeight = img.naturalHeight
  actualImageDimensions.value = { width: actualWidth, height: actualHeight }
  
  // Calculate display dimensions while maintaining aspect ratio
  const maxDisplayWidth = 1200
  const maxDisplayHeight = 900
  
  const scaleX = maxDisplayWidth / actualWidth
  const scaleY = maxDisplayHeight / actualHeight
  const displayScale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down
  
  const displayWidth = Math.round(actualWidth * displayScale)
  const displayHeight = Math.round(actualHeight * displayScale)
  
  imageDimensions.value = { width: displayWidth, height: displayHeight }
  
  console.log('🔍 Image loaded successfully:', {
    src: props.src,
    actualDimensions: `${actualWidth}x${actualHeight}`,
    displayDimensions: `${displayWidth}x${displayHeight}`,
    displayScale: displayScale
  })
  
  // Update initial scale for this specific image
  if (isJpgImage.value) {
    scale.value = displayScale
  }
}

function onImageError() {
  console.error('🔍 Failed to load image:', props.src)
  isLoaded.value = false
}

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
    // For JPG images, use detected dimensions or default, for PDFs use 0.7
    if (isJpgImage.value) {
      const { width: actualWidth, height: actualHeight } = actualImageDimensions.value
      
      if (actualWidth > 0 && actualHeight > 0) {
        // Use actual image dimensions
        const maxDisplayWidth = 1200
        const maxDisplayHeight = 900
        
        const scaleX = maxDisplayWidth / actualWidth
        const scaleY = maxDisplayHeight / actualHeight
        const fitScale = Math.min(scaleX, scaleY, 1)
        
        scale.value = fitScale
        console.log('🔍 JPG initial scale using actual dimensions:', fitScale)
      } else {
        // Fallback to default scale
        scale.value = 0.8
        console.log('🔍 JPG initial scale using default:', scale.value)
      }
    } else {
      scale.value = 0.7
    }
    return
  }
  
  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width
  const containerHeight = containerRect.height
  
  const { width: pdfWidth, height: pdfHeight } = pdfDimensions.value
  
  if (!pdfWidth || !pdfHeight) {
    console.log('🔍 No PDF dimensions available, using default scale')
    // For JPG images, use detected dimensions or default, for PDFs use 0.7
    if (isJpgImage.value) {
      const { width: actualWidth, height: actualHeight } = actualImageDimensions.value
      
      if (actualWidth > 0 && actualHeight > 0) {
        // Use actual image dimensions
        const maxDisplayWidth = 1200
        const maxDisplayHeight = 900
        
        const scaleX = maxDisplayWidth / actualWidth
        const scaleY = maxDisplayHeight / actualHeight
        const fitScale = Math.min(scaleX, scaleY, 1)
        
        scale.value = fitScale
        console.log('🔍 JPG initial scale using actual dimensions:', fitScale)
      } else {
        // Fallback to default scale
        scale.value = 0.8
        console.log('🔍 JPG initial scale using default:', scale.value)
      }
    } else {
      scale.value = 0.7
    }
    return
  }
  
  // For JPG images, use detected dimensions
  if (isJpgImage.value) {
    console.log('🔍 JPG image detected, setting initial scale based on actual dimensions')
    const { width: actualWidth, height: actualHeight } = actualImageDimensions.value
    
    if (actualWidth > 0 && actualHeight > 0) {
      // Calculate the scale to display at actual image dimensions
      const maxDisplayWidth = 1200
      const maxDisplayHeight = 900
      
      const scaleX = maxDisplayWidth / actualWidth
      const scaleY = maxDisplayHeight / actualHeight
      const initialScale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down
      
      scale.value = initialScale
      console.log('🔍 JPG initial scale set to:', initialScale)
    } else {
      // Fallback to default scale
      scale.value = 0.8
      console.log('🔍 JPG initial scale using default:', scale.value)
    }
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
  console.log('🔍 Container Positioning Classes:', {
    isJpgImage: isJpgImage.value,
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
  // Prevent download if we're currently sharing
  if (isSharing.value) {
    console.log('🔍 Download blocked - currently sharing')
    return
  }
  
  // Track download event
  trackEvent('pdf_download', {
    file_type: isJpgImage.value ? 'image' : 'pdf',
    file_url: props.src,
    component: 'PdfViewer'
  })
  
  if (pdfRef.value?.download) {
    pdfRef.value.download()
  } else {
    window.open(props.src, '_blank')
  }
}

function downloadImage() {
  // Prevent download if we're currently sharing
  if (isSharing.value) {
    console.log('🔍 Download blocked - currently sharing')
    return
  }
  
  // Track download event
  trackEvent('image_download', {
    file_type: 'image',
    file_url: props.src,
    component: 'PdfViewer'
  })
  
  // Determine file extension based on URL
  const cleanUrl = props.src ? props.src.split('?')[0].split('#')[0] : ''
  const isJpg = cleanUrl && (cleanUrl.toLowerCase().endsWith('.jpg') || cleanUrl.toLowerCase().endsWith('.jpeg'))
  const fileExtension = isJpg ? 'jpg' : 'pdf'
  const fileName = `memory-book.${fileExtension}`
  
  console.log('🔍 Downloading image:', props.src, 'with extension:', fileExtension)
  
  // For cross-origin URLs, we need to fetch the image first
  fetch(props.src)
    .then(response => response.blob())
    .then(blob => {
      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob)
      
      // Create a temporary link to download the image
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      link.style.display = 'none'
      
      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 100)
      
      console.log('🔍 Download initiated with filename:', fileName)
    })
    .catch(error => {
      console.error('🔍 Error downloading file:', error)
      // Fallback: try direct download
      const link = document.createElement('a')
      link.href = props.src
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

function zoomIn() {
  console.log('🔍 Zoom In clicked, current scale:', scale.value)
  if (scale.value < 2.5) {
    scale.value = +(scale.value + 0.2).toFixed(1)
    console.log('🔍 New scale after zoom in:', scale.value)
    // No need to force re-render since container size is fixed
  }
}

function zoomOut() {
  console.log('🔍 Zoom Out clicked, current scale:', scale.value)
  if (scale.value > 0.4) {
    scale.value = +(scale.value - 0.2).toFixed(1)
    console.log('🔍 New scale after zoom out:', scale.value)
    
    // Reset pan position when zooming out to fit view
    if (scale.value <= 1.0) {
      panX.value = 0
      panY.value = 0
      lastPanX.value = 0
      lastPanY.value = 0
    }
  }
}

function resetZoom() {
  console.log('🔍 Reset Zoom clicked, current scale:', scale.value)
  if (isJpgImage.value) {
    // Reset to fit-to-view scale for JPG images based on actual dimensions
    const { width: actualWidth, height: actualHeight } = actualImageDimensions.value
    
    if (actualWidth > 0 && actualHeight > 0) {
      // Use actual image dimensions to calculate fit-to-view scale
      const maxDisplayWidth = 1200
      const maxDisplayHeight = 900
      
      const scaleX = maxDisplayWidth / actualWidth
      const scaleY = maxDisplayHeight / actualHeight
      const fitScale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down
      
      scale.value = fitScale
      console.log('🔍 JPG scale reset to fit-to-view:', {
        actualDimensions: `${actualWidth}x${actualHeight}`,
        fitScale: fitScale
      })
    } else {
      // Fallback to default scale if dimensions not available
      scale.value = 0.8
      console.log('🔍 JPG scale reset to default:', scale.value)
    }
  } else {
    scale.value = 0.7
    console.log('🔍 PDF scale reset to:', scale.value)
  }
  
  // Reset pan position when zoom is reset
  panX.value = 0
  panY.value = 0
  lastPanX.value = 0
  lastPanY.value = 0
}

// Panning functions
function startPan(event) {
  // Check if content is larger than container (allowing panning)
  const container = panContainer.value
  if (!container) {
    return
  }
  
  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width
  const containerHeight = containerRect.height
  
  // Calculate scaled content dimensions
  let contentWidth, contentHeight
  if (isJpgImage.value) {
    const { width: actualWidth, height: actualHeight } = actualImageDimensions.value
    if (actualWidth > 0 && actualHeight > 0) {
      contentWidth = actualWidth * scale.value
      contentHeight = actualHeight * scale.value
    } else {
      const { width: displayWidth, height: displayHeight } = imageDimensions.value
      contentWidth = displayWidth * scale.value
      contentHeight = displayHeight * scale.value
    }
  } else {
    const { width, height } = pdfDimensions.value
    contentWidth = width * scale.value
    contentHeight = height * scale.value
  }
  
  // Only allow panning if content is larger than container
  if (contentWidth <= containerWidth && contentHeight <= containerHeight) {
    return
  }
  
  // Prevent default behavior to avoid unwanted scrolling/movement
  event.preventDefault()
  event.stopPropagation()
  
  isPanning.value = true
  
  const clientX = event.clientX || (event.touches && event.touches[0]?.clientX)
  const clientY = event.clientY || (event.touches && event.touches[0]?.clientY)
  
  startX.value = clientX
  startY.value = clientY
  lastPanX.value = panX.value
  lastPanY.value = panY.value
  
  console.log('🔍 Pan started:', { 
    startX: startX.value, 
    startY: startY.value, 
    scale: scale.value,
    contentWidth,
    contentHeight,
    containerWidth,
    containerHeight,
    isMobile: isMobile.value
  })
}

function pan(event) {
  if (!isPanning.value) {
    return
  }
  
  // Prevent default behavior to avoid unwanted scrolling/movement
  event.preventDefault()
  event.stopPropagation()
  
  const clientX = event.clientX || (event.touches && event.touches[0]?.clientX)
  const clientY = event.clientY || (event.touches && event.touches[0]?.clientY)
  
  const deltaX = clientX - startX.value
  const deltaY = clientY - startY.value
  
  // Calculate new pan position
  const newPanX = lastPanX.value + deltaX
  const newPanY = lastPanY.value + deltaY
  
  // Calculate bounds to prevent over-panning
  const container = panContainer.value
  if (container) {
    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height
    
         // Calculate scaled content dimensions
     let contentWidth, contentHeight
     if (isJpgImage.value) {
       // Use actual detected image dimensions
       const { width: actualWidth, height: actualHeight } = actualImageDimensions.value
       
       if (actualWidth > 0 && actualHeight > 0) {
         // Use actual image dimensions
         contentWidth = actualWidth * scale.value
         contentHeight = actualHeight * scale.value
       } else {
         // Fallback to display dimensions if actual dimensions not available
         const { width: displayWidth, height: displayHeight } = imageDimensions.value
         contentWidth = displayWidth * scale.value
         contentHeight = displayHeight * scale.value
       }
     } else {
       const { width, height } = pdfDimensions.value
       contentWidth = width * scale.value
       contentHeight = height * scale.value
     }
    
    // Calculate maximum pan bounds
    const maxPanX = Math.max(0, (contentWidth - containerWidth) / 2)
    const maxPanY = Math.max(0, (contentHeight - containerHeight) / 2)
    
    // Clamp pan values
    panX.value = Math.max(-maxPanX, Math.min(maxPanX, newPanX))
    panY.value = Math.max(-maxPanY, Math.min(maxPanY, newPanY))
  } else {
    // Fallback if container not available
    panX.value = newPanX
    panY.value = newPanY
  }
  
  console.log('🔍 Panning:', { panX: panX.value, panY: panY.value, scale: scale.value })
}

function stopPan() {
  if (isPanning.value) {
    isPanning.value = false
    console.log('🔍 Pan stopped:', { panX: panX.value, panY: panY.value, isMobile: isMobile.value })
  }
}

function sharePdf() {
  console.log('🔍 Share button clicked - starting sharePdf function')
  
  // Prevent multiple share attempts
  if (isSharing.value) {
    console.log('🔍 Already sharing, ignoring click')
    return
  }
  
  isSharing.value = true
  
  // Set a timeout to reset the sharing flag after 10 seconds
  const sharingTimeout = setTimeout(() => {
    if (isSharing.value) {
      console.log('🔍 Sharing timeout - resetting flag')
      isSharing.value = false
    }
  }, 10000)
  
  try {
    // Get the PDF source URL
    const pdfUrl = props.src
    console.log('🔍 PDF URL to share:', pdfUrl)
    
    if (!pdfUrl) {
      console.warn('🔍 No PDF source available to share')
      clearTimeout(sharingTimeout)
      isSharing.value = false
      return
    }

    // Check if Web Share API is available
    console.log('🔍 Can share check:', canShare.value)
    if (!canShare.value) {
      console.warn('🔍 Web Share API not available')
      // Fallback: copy URL to clipboard only
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pdfUrl).then(() => {
          console.log('🔍 PDF URL copied to clipboard')
          // Track clipboard fallback
          trackEvent('pdf_share_fallback', {
            file_type: 'pdf',
            file_url: pdfUrl,
            component: 'PdfViewer',
            fallback_method: 'clipboard'
          })
        }).catch(err => {
          console.error('🔍 Failed to copy URL:', err)
        })
      }
      clearTimeout(sharingTimeout)
      isSharing.value = false
      return
    }

    // Prepare share data
    const shareData = {
      title: 'Memory Book PDF',
      text: 'Check out this beautiful memory book!',
      url: pdfUrl
    }
    console.log('🔍 Share data prepared:', shareData)

    // Check if the data can be shared
    if (navigator.canShare && navigator.canShare(shareData)) {
      console.log('🔍 Attempting to share...')
      navigator.share(shareData)
        .then(() => {
          console.log('🔍 PDF shared successfully!')
          // Track successful share
          trackEvent('pdf_share', {
            file_type: 'pdf',
            file_url: pdfUrl,
            component: 'PdfViewer',
            share_method: 'web_share_api'
          })
          clearTimeout(sharingTimeout)
          isSharing.value = false
        })
        .catch((error) => {
          console.error('🔍 Error sharing PDF:', error)
          if (error.name !== 'AbortError') {
            // Only log error if it's not a user cancellation
            console.warn('🔍 Share was cancelled or failed')
            // Track failed share
            trackEvent('pdf_share_failed', {
              file_type: 'pdf',
              file_url: pdfUrl,
              component: 'PdfViewer',
              error: error.name || 'unknown'
            })
          }
          // Explicitly do nothing - don't open any windows
          console.log('🔍 Share cancelled/failed - no window opened')
          clearTimeout(sharingTimeout)
          isSharing.value = false
        })
    } else {
      console.warn('🔍 Share data not supported')
      // Fallback: copy URL to clipboard only
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pdfUrl).then(() => {
          console.log('🔍 PDF URL copied to clipboard')
          // Track clipboard fallback
          trackEvent('pdf_share_fallback', {
            file_type: 'pdf',
            file_url: pdfUrl,
            component: 'PdfViewer',
            fallback_method: 'clipboard'
          })
        }).catch(err => {
          console.error('🔍 Failed to copy URL:', err)
        })
      }
      clearTimeout(sharingTimeout)
      isSharing.value = false
    }
  } catch (error) {
    console.error('🔍 Error in sharePdf function:', error)
    // Explicitly do nothing - don't open any windows
    console.log('🔍 Share error caught - no window opened')
    clearTimeout(sharingTimeout)
    isSharing.value = false
  }
}

function shareImage() {
  console.log('🔍 Share button clicked - starting shareImage function')
  
  // Prevent multiple share attempts
  if (isSharing.value) {
    console.log('🔍 Already sharing, ignoring click')
    return
  }
  
  isSharing.value = true
  
  // Set a timeout to reset the sharing flag after 10 seconds
  const sharingTimeout = setTimeout(() => {
    if (isSharing.value) {
      console.log('🔍 Sharing timeout - resetting flag')
      isSharing.value = false
    }
  }, 10000)
  
  try {
    // Get the image source URL
    const imageUrl = props.src
    console.log('🔍 Image URL to share:', imageUrl)
    
    if (!imageUrl) {
      console.warn('🔍 No image source available to share')
      clearTimeout(sharingTimeout)
      isSharing.value = false
      return
    }

    // Check if Web Share API is available
    console.log('🔍 Can share check:', canShare.value)
    if (!canShare.value) {
      console.warn('🔍 Web Share API not available')
      // Fallback: copy URL to clipboard only
      if (navigator.clipboard) {
        navigator.clipboard.writeText(imageUrl).then(() => {
          console.log('🔍 Image URL copied to clipboard')
          // Track clipboard fallback
          trackEvent('image_share_fallback', {
            file_type: 'image',
            file_url: imageUrl,
            component: 'PdfViewer',
            fallback_method: 'clipboard'
          })
        }).catch(err => {
          console.error('🔍 Failed to copy URL:', err)
        })
      }
      clearTimeout(sharingTimeout)
      isSharing.value = false
      return
    }

    // Prepare share data
    const shareData = {
      title: 'Memory Book Image',
      text: 'Check out this beautiful memory book!',
      url: imageUrl
    }
    console.log('🔍 Share data prepared:', shareData)

    // Check if the data can be shared
    if (navigator.canShare && navigator.canShare(shareData)) {
      console.log('🔍 Attempting to share...')
      navigator.share(shareData)
        .then(() => {
          console.log('🔍 Image shared successfully!')
          // Track successful share
          trackEvent('image_share', {
            file_type: 'image',
            file_url: imageUrl,
            component: 'PdfViewer',
            share_method: 'web_share_api'
          })
          clearTimeout(sharingTimeout)
          isSharing.value = false
        })
        .catch((error) => {
          console.error('🔍 Error sharing image:', error)
          if (error.name !== 'AbortError') {
            // Only log error if it's not a user cancellation
            console.warn('🔍 Share was cancelled or failed')
            // Track failed share
            trackEvent('image_share_failed', {
              file_type: 'image',
              file_url: imageUrl,
              component: 'PdfViewer',
              error: error.name || 'unknown'
            })
          }
          // Explicitly do nothing - don't open any windows
          console.log('🔍 Share cancelled/failed - no window opened')
          clearTimeout(sharingTimeout)
          isSharing.value = false
        })
    } else {
      console.warn('🔍 Share data not supported')
      // Fallback: copy URL to clipboard only
      if (navigator.clipboard) {
        navigator.clipboard.writeText(imageUrl).then(() => {
          console.log('🔍 Image URL copied to clipboard')
          // Track clipboard fallback
          trackEvent('image_share_fallback', {
            file_type: 'image',
            file_url: imageUrl,
            component: 'PdfViewer',
            fallback_method: 'clipboard'
          })
        }).catch(err => {
          console.error('🔍 Failed to copy URL:', err)
        })
      }
      clearTimeout(sharingTimeout)
      isSharing.value = false
    }
  } catch (error) {
    console.error('🔍 Error in shareImage function:', error)
    // Explicitly do nothing - don't open any windows
    console.log('🔍 Share error caught - no window opened')
    clearTimeout(sharingTimeout)
    isSharing.value = false
  }
}

watch(() => props.src, () => {
  currentPage.value = 1
  isLoaded.value = false
  
  // Reset image dimensions when source changes
  imageDimensions.value = { width: 0, height: 0 }
  actualImageDimensions.value = { width: 0, height: 0 }
  
  // Set initial scale based on file type
  if (isJpgImage.value) {
    // For JPG images, we'll set the scale when the image loads
    // Use a default scale for now
    scale.value = 0.8
  } else {
    scale.value = 0.7
  }
  
  pdfDimensions.value = { width: 0, height: 0 }
  pdfEmbedKey.value++ // ensure rerender when switching files
  
  // Reset pan position when source changes
  panX.value = 0
  panY.value = 0
  lastPanX.value = 0
  lastPanY.value = 0
  isPanning.value = false
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
  console.log('🔍 Container positioning changed:', {
    isJpgImage: isJpgImage.value,
    shouldPositionAtTop: newPosition,
    pdfDimensions: pdfDimensions.value,
    appliedClasses: newPosition ? 'items-start justify-center' : 'items-center justify-center'
  })
})

// Watch for file type changes
watch(isJpgImage, (isJpg) => {
  console.log('🔍 File type changed:', {
    isJpgImage: isJpg,
    src: props.src
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

/* Panning cursor styles */
.cursor-grab {
  cursor: grab;
}

.cursor-grab:active {
  cursor: grabbing;
}

/* Prevent text selection during panning */
.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Smooth transitions for zoom changes */
img, div {
  will-change: transform;
}

/* Mobile fullscreen styles */
.mobile-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 0 !important;
  overflow: hidden !important;
}

.mobile-fullscreen .scrollbar-hide {
  padding-bottom: 4rem !important; /* Ensure space for controls */
}

/* Ensure pan container fills entire screen on mobile */
.mobile-fullscreen .w-full.h-full {
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Mobile pan container styles */
.mobile-pan-container {
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  touch-action: none !important;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  -khtml-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
  -webkit-tap-highlight-color: transparent !important;
}
</style>