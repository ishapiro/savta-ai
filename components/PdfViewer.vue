<template>
  <ClientOnly>
    <div class="relative w-full h-full bg-brand-background">
      <!-- PDF Document -->
      <div class="w-full h-full overflow-auto pb-16">
        <div class="w-full flex items-center justify-center p-4">
          <div class="w-full max-w-4xl border-4 border-brand-primary rounded-lg shadow-2xl bg-white">
            <VuePdfEmbed
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
import { ref, defineProps, watch } from 'vue'
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
const currentPage = ref(1)
const pageCount = ref(1)
const isLoaded = ref(false)
const scale = ref(1.0)

function onLoaded(pdf) {
  pageCount.value = pdf.numPages
  isLoaded.value = true
  if (currentPage.value > pdf.numPages) {
    currentPage.value = 1
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
function zoomIn() {
  if (scale.value < 3.0) {
    scale.value = Math.min(3.0, scale.value + 0.25)
  }
}
function zoomOut() {
  if (scale.value > 0.25) {
    scale.value = Math.max(0.25, scale.value - 0.25)
  }
}

// Reset page on src change
watch(() => props.src, () => {
  currentPage.value = 1
  isLoaded.value = false
  scale.value = 1.0
})
</script>