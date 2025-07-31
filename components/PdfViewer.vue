<template>
  <ClientOnly>
    <div class="relative w-full h-full bg-brand-navigation">
      <!-- PDF Document -->
      <div class="w-full h-full overflow-auto pb-16">
        <div class="w-full h-full flex items-center justify-center p-4 mb-4">
          <div 
            ref="pdfContainer"
            class="mb-4 flex items-center justify-center"
            :style="pdfContainerStyle"
          >
            <VuePdfEmbed
              ref="pdfRef"
              :source="props.src"
              :page="currentPage"
              :scale="0.8"
              annotation-layer
              text-layer
              @loaded="onLoaded"
            />
          </div>
        </div>
      </div>
      <!-- Navigation Bar -->
      <div class="absolute bottom-0 left-0 right-0 flex justify-center items-center py-2 sm:py-3 bg-white z-10 border-t border-brand-primary/20">
        <div class="flex items-center gap-2 sm:gap-4">
          <button
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
            :disabled="currentPage <= 1"
            @click="prevPage"
            aria-label="Previous page"
          >
            <i class="pi pi-angle-left text-xl sm:text-2xl text-brand-primary" :class="{ 'opacity-50': currentPage <= 1 }"></i>
          </button>
          <span class="text-xs sm:text-base font-medium text-brand-primary select-none">
            Page {{ currentPage }} / {{ pageCount }}
          </span>
          <button
            class="w-10 h-10 sm:w-12 sm:h-12 p-0 flex items-center justify-center rounded-full hover:bg-brand-background focus:outline-none focus:ring-2 focus:ring-brand-header"
            :disabled="currentPage >= pageCount"
            @click="nextPage"
            aria-label="Next page"
          >
            <i class="pi pi-angle-right text-xl sm:text-2xl text-brand-primary" :class="{ 'opacity-50': currentPage >= pageCount }"></i>
          </button>
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
import { ref, watch, computed, nextTick, onUnmounted } from 'vue'
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
const pdfDimensions = ref({ width: 0, height: 0 })

// Computed style for the PDF container - adjusted for scale
const pdfContainerStyle = computed(() => {
  if (!pdfDimensions.value.width || !pdfDimensions.value.height) {
    // Default size while loading - use a smaller default
    return {
      width: '100%',
      maxWidth: '600px',
      height: 'auto',
      maxHeight: '400px'
    }
  }

  const pdfAspectRatio = pdfDimensions.value.width / pdfDimensions.value.height
  
  // Use consistent maximum size to ensure PDF fits completely and maintains consistent centering
  // Since we're using scale=0.8, we can use larger container dimensions
  const maxWidth = 600
  const maxHeight = 400
  
  let finalWidth, finalHeight
  
  if (pdfAspectRatio > 1) {
    // Landscape PDF - fit to max width
    finalWidth = maxWidth
    finalHeight = maxWidth / pdfAspectRatio
    
    // If height exceeds max height, scale down proportionally
    if (finalHeight > maxHeight) {
      const scale = maxHeight / finalHeight
      finalWidth = finalWidth * scale
      finalHeight = maxHeight
    }
  } else {
    // Portrait PDF - fit to max height
    finalHeight = maxHeight
    finalWidth = maxHeight * pdfAspectRatio
    
    // If width exceeds max width, scale down proportionally
    if (finalWidth > maxWidth) {
      const scale = maxWidth / finalWidth
      finalHeight = finalHeight * scale
      finalWidth = maxWidth
    }
  }
  
  return {
    width: `${finalWidth}px`,
    height: `${finalHeight}px`,
    maxWidth: '100%',
    maxHeight: '100%'
  }
})

function onLoaded(pdf) {
  pageCount.value = pdf.numPages
  isLoaded.value = true
  if (currentPage.value > pdf.numPages) {
    currentPage.value = 1
  }
  
  // Get PDF dimensions from the loaded PDF object
  if (pdf.numPages > 0) {
    pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: 1.0 })
      pdfDimensions.value = {
        width: viewport.width,
        height: viewport.height
      }
      console.log('📐 PDF dimensions loaded:', pdfDimensions.value)
    }).catch(error => {
      console.error('❌ Error getting PDF dimensions:', error)
      // Fallback to default dimensions
      pdfDimensions.value = { width: 595, height: 842 } // A4 default
    })
  }
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function nextPage() {
  if (currentPage.value < pageCount.value) currentPage.value++
}
function downloadPdf() {
  if (pdfRef.value && pdfRef.value.download) {
    pdfRef.value.download()
  } else {
    // fallback: open in new tab
    window.open(props.src, '_blank')
  }
}

// Reset page on src change
watch(() => props.src, () => {
  currentPage.value = 1
  isLoaded.value = false
  scale.value = 0.8
  pdfDimensions.value = { width: 0, height: 0 }
})
</script>