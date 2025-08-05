
<!-- PDF/Image Viewer for Savta.AI -->
<template>
  <ClientOnly>
    <div class="relative w-full h-full bg-brand-navigation">
      <!-- Document/Image Container -->
      <div class="w-full h-full overflow-auto pb-20 scrollbar-hide">
        <div class="w-full h-full flex p-4 mb-4" :class="shouldPositionAtTop ? 'items-start justify-center' : 'items-center justify-center'" @vue:mounted="logPositioningClasses">
          
          <!-- PNG Image Display -->
          <div v-if="isPngImage"
               ref="imageContainer"
               class="mb-4 flex"
               :style="imageContainerStyle"
          >
            <img 
              :src="props.src"
              :alt="'Memory Book Image'"
              class="max-w-full max-h-full object-contain"
              @load="onImageLoaded"
              @error="onImageError"
            />
          </div>

          <!-- PDF Document Display -->
          <div v-else
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

      <!-- Navigation + Zoom Controls (only show for PDFs) -->
              <div v-if="!isPngImage" class="absolute bottom-0 left-0 right-0 flex justify-center items-center py-2 sm:py-3 bg-white z-10 border-t border-brand-primary/20">
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

      <!-- Download/Share Controls for PNG Images -->
              <div v-if="isPngImage" class="absolute bottom-0 left-0 right-0 flex justify-center items-center py-2 sm:py-3 bg-white z-10 border-t border-brand-primary/20">
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Download PNG -->
          <button
            v-if="!isMobile"
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
            @click="downloadImage"
            aria-label="Download Image"
          >
            <i class="pi pi-download text-xl sm:text-2xl text-brand-header"></i>
          </button>

          <!-- Share PNG -->
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
const isSharing = ref(false) // Track if we're currently sharing

// Check if the source is a PNG image
const isPngImage = computed(() => {
  // Remove query parameters and hash from URL before checking
  const cleanUrl = props.src ? props.src.split('?')[0].split('#')[0] : ''
  const result = cleanUrl && cleanUrl.toLowerCase().endsWith('.png')
  
  console.log('🔍 isPngImage check:', {
    src: props.src,
    cleanUrl: cleanUrl,
    endsWithPng: cleanUrl?.toLowerCase().endsWith('.png'),
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
  // For images, use a more flexible container that adapts to the image size
  const maxWidth = 800
  const maxHeight = 600
  
  return {
    maxWidth: `${maxWidth}px`,
    maxHeight: `${maxHeight}px`,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

// Determine if PDF should be positioned at top or centered based on actual PDF dimensions
const shouldPositionAtTop = computed(() => {
  if (isPngImage.value) {
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
  console.log('🔍 Image loaded successfully:', props.src)
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
    // For PNG images, use 1.0 (original size), for PDFs use 0.8
    scale.value = isPngImage.value ? 1.0 : 0.8
    return
  }
  
  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width
  const containerHeight = containerRect.height
  
  const { width: pdfWidth, height: pdfHeight } = pdfDimensions.value
  
  if (!pdfWidth || !pdfHeight) {
    console.log('🔍 No PDF dimensions available, using default scale')
    // For PNG images, use 1.0 (original size), for PDFs use 0.8
    scale.value = isPngImage.value ? 1.0 : 0.8
    return
  }
  
  // For PNG images, start at original size (1.0) and let user zoom if needed
  if (isPngImage.value) {
    console.log('🔍 PNG image detected, setting initial scale to 1.0 (original size)')
    scale.value = 1.0
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
    isPngImage: isPngImage.value,
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
  
  console.log('🔍 Downloading PNG image:', props.src)
  
  // For cross-origin URLs, we need to fetch the image first
  fetch(props.src)
    .then(response => response.blob())
    .then(blob => {
      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob)
      
      // Create a temporary link to download the image
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'memory-book.png'
      link.style.display = 'none'
      
      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 100)
      
      console.log('🔍 PNG download initiated')
    })
    .catch(error => {
      console.error('🔍 Error downloading PNG:', error)
      // Fallback: try direct download
      const link = document.createElement('a')
      link.href = props.src
      link.download = 'memory-book.png'
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
    // No need to force re-render since container size is fixed
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
          clearTimeout(sharingTimeout)
          isSharing.value = false
        })
        .catch((error) => {
          console.error('🔍 Error sharing PDF:', error)
          if (error.name !== 'AbortError') {
            // Only log error if it's not a user cancellation
            console.warn('🔍 Share was cancelled or failed')
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
          clearTimeout(sharingTimeout)
          isSharing.value = false
        })
        .catch((error) => {
          console.error('🔍 Error sharing image:', error)
          if (error.name !== 'AbortError') {
            // Only log error if it's not a user cancellation
            console.warn('🔍 Share was cancelled or failed')
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
  // Set initial scale based on file type: PNG = 1.0 (original size), PDF = 0.8
  scale.value = isPngImage.value ? 1.0 : 0.8
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
  console.log('🔍 Container positioning changed:', {
    isPngImage: isPngImage.value,
    shouldPositionAtTop: newPosition,
    pdfDimensions: pdfDimensions.value,
    appliedClasses: newPosition ? 'items-start justify-center' : 'items-center justify-center'
  })
})

// Watch for file type changes
watch(isPngImage, (isPng) => {
  console.log('🔍 File type changed:', {
    isPngImage: isPng,
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
</style>