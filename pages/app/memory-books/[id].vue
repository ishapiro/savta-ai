<template>
  <div class="min-h-screen surface-ground p-4">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6 flex flex-col items-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-color mb-2">Memory Book Preview</h1>
        <p class="text-color-secondary text-center">View your special memory book as a PDF. You can download or share it from here.</p>
      </div>
      <div class="w-full flex flex-col items-center">
        <!-- PDF Viewer - Mobile (with overflow) -->
        <div class="flex-1 min-h-0 w-full flex items-center justify-center overflow-auto sm:hidden px-0">
          <ClientOnly>
            <PdfViewer v-if="pdfBlobUrl" :src="pdfBlobUrl" :style="pdfViewerStyle" />
            <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
              <i class="h-[80%] pi pi-file-pdf text-3xl sm:text-4xl text-gray-400"></i>
              <p class="text-sm sm:text-base text-gray-600 mt-2">No PDF available for preview.</p>
            </div>
          </ClientOnly>
        </div>
        <!-- PDF Viewer - Desktop (without overflow) -->
        <div class="hidden sm:flex flex-1 min-h-0 w-full items-start justify-center pt-2">
          <ClientOnly>
            <PdfViewer v-if="pdfBlobUrl" :src="pdfBlobUrl" :style="pdfViewerStyle" />
            <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
              <i class="h-[80%] pi pi-file-pdf text-3xl sm:text-4xl text-gray-400"></i>
              <p class="text-sm sm:text-base text-gray-600 mt-2">No PDF available for preview.</p>
            </div>
          </ClientOnly>
        </div>
        <div class="z-50 flex justify-center items-center gap-3 sm:gap-4 py-4 sm:py-6 px-4 bg-gray-50 border-t border-gray-200 min-h-[60px] sm:min-h-[80px] w-full">
          <Button
            v-if="pdfBlobUrl"
            label="Download PDF"
            icon="pi pi-download"
            size="small"
            class="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 border-0"
            @click="downloadPdf"
          />
          <Button
            label="Back"
            severity="secondary"
            size="small"
            class="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3"
            @click="goBack"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PdfViewer from '~/components/PdfViewer.vue'

const route = useRoute()
const router = useRouter()
const bookId = route.params.id
const pdfBlobUrl = ref('')

const pdfViewerStyle = computed(() => ({
  width: '100%',
  height: '80vh',
  maxHeight: '80vh',
  minHeight: '400px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
}))

const fetchPdfUrl = async () => {
  try {
    // Use the same download endpoint as the main memory-books page
    const res = await fetch(`/api/memory-books/download/${bookId}`)
    if (!res.ok) throw new Error('Failed to fetch PDF')
    const blob = await res.blob()
    pdfBlobUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    pdfBlobUrl.value = ''
  }
}

const downloadPdf = async () => {
  if (!pdfBlobUrl.value) return
  const link = document.createElement('a')
  link.href = pdfBlobUrl.value
  link.download = `memory-book-${bookId}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const goBack = () => {
  router.back()
}

onMounted(fetchPdfUrl)
</script>

<style scoped>
.pdf-viewer-container {
  min-height: 400px;
}
</style> 