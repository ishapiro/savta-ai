<template>
  <ClientOnly>
    <div class="relative w-full h-full bg-brand-navigation">
              <!-- PDF Document -->
        <div class="w-full h-full overflow-auto pb-20 scrollbar-hide">
          <div class="w-full h-full flex p-4 mb-4" :class="shouldPositionAtTop ? 'items-start justify-center' : 'items-center justify-center'">
          <div 
            ref="pdfContainer"
            class="mb-4 flex items-center justify-center"
            :style="pdfContainerStyle"
          >
            <div 
              :style="{ 
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                width: '100%',
                height: '100%'
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
  },
  printSize: {
    type: String,
    default: '7x5'
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
  // Provide a fixed size container that the PDF will scale to fit
  const containerWidth = 600 + (scale.value - 0.8) * 200 // Start at 600px, scale up/down
  const containerHeight = 400 + (scale.value - 0.8) * 150 // Start at 400px, scale up/down

  console.log('🔍 PDF Container Style Update:', {
    scale: scale.value,
    containerWidth,
    containerHeight
  })

  return {
    width: `${containerWidth}px`,
    height: `${containerHeight}px`,
    maxWidth: 'none',
    maxHeight: 'none'
  }
})

// Determine if PDF should be positioned at top or centered based on print size
const shouldPositionAtTop = computed(() => {
  // Parse the print size to determine if it's larger than 7x5
  const size = props.printSize.toLowerCase()
  
  // Define size hierarchy - larger sizes should be positioned at top
  const sizeOrder = ['3x5', '5x3', '5x7', '7x5', '8x10', '10x8', '8.5x11', '11x8.5', '11x14', '14x11', '12x12']
  
  const currentIndex = sizeOrder.indexOf(size)
  const sevenByFiveIndex = sizeOrder.indexOf('7x5')
  
  // If current size is larger than 7x5, position at top
  return currentIndex > sevenByFiveIndex
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
  }).catch(() => {
    pdfDimensions.value = { width: 595, height: 842 } // fallback to A4 size
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
  if (scale.value < 3) {
    scale.value = +(scale.value + 0.3).toFixed(1)
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
  if (scale.value > 0.5) {
    scale.value = +(scale.value - 0.3).toFixed(1)
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
  scale.value = 0.8
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