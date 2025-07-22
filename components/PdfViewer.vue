<template>
  <client-only>
    <div class="pdf-viewer-container w-full" :style="{ height }">
      <VPdfViewer
        v-if="isLicenseReady"
        :src="src"
        class="w-full h-full"
        :options="viewerOptions"
      />
      <div v-else class="flex items-center justify-center h-full">
        <div class="text-gray-500">Loading PDF viewer...</div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { watchOnce } from '@vueuse/core'
import { VPdfViewer, useLicense } from '@vue-pdf-viewer/viewer'

// Props
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  height: {
    type: String,
    default: '100%'
  }
})

// License logic
const licenseRegistered = globalThis.__vue_pdf_license_registered ??= ref(false)
const { licenseKey } = useVuePdfViewerLicense()
const isLicenseReady = ref(false)

onMounted(() => {
  if (licenseRegistered.value) {
    isLicenseReady.value = true
    return
  }

  if (licenseKey.value) {
    useLicense(licenseKey.value)
    licenseRegistered.value = true
    isLicenseReady.value = true
  } else {
    watchOnce(licenseKey, (key) => {
      if (key) {
        useLicense(key)
        licenseRegistered.value = true
        isLicenseReady.value = true
      }
    })
  }
})

// Viewer config
const viewerOptions = {
  defaultZoom: 0.9,
  enableDownload: true,
  enablePrint: false,
  enableSearch: true,
  enableThumbnail: false,
  enableToolbar: true,
  enableSidebar: false, // Disable sidebar
  sidebarTabs: [],      // No sidebar tabs
  toolbarPlugin: {
    fullScreenPlugin: {
      onEnterFullScreen: (zoom) => console.log('Entered full screen with zoom:', zoom),
      onExitFullScreen: (zoom) => console.log('Exited full screen with zoom:', zoom),
    }
  },
  enableFileDrop: false,
  enableDragAndDrop: false,
  enableOpenFile: false,
  enablePaging: true,
  enableScrolling: true,
  enableZooming: true,
  enableSearching: true,
  enableThumbnails: true,
  enableBookmarks: true,
  enableAttachments: true,
  enableAnnotations: false,
  enableForms: false,
  enableHandTool: true,
  enableSelectionTool: true,
  enableTextSelection: true,
  enableDownloading: true,
  enableRotating: true,
  enableFlipping: true,
  enableScaling: true,
  enablePanning: true,
  enableKeyboardNavigation: true,
  enableMouseWheelZoom: true,
  enableTouchGestures: true,
  enablePinchZoom: true,
  enableDoubleClickZoom: true,
  enableRightClickMenu: true,
  enableContextMenu: true,
  enableAutoSave: false,
  enableAutoLoad: false,
  enableAutoPrint: false,
  enableAutoDownload: false,
  enableAutoRotate: false,
  enableAutoFlip: false,
  enableAutoScale: false,
  enableAutoPan: false,
  enableAutoZoom: false,
  enableAutoSearch: false,
  enableAutoThumbnails: false,
  enableAutoBookmarks: false,
  enableAutoAttachments: false,
  enableAutoAnnotations: false,
  enableAutoForms: false,
  enableAutoHandTool: false,
  enableAutoSelectionTool: false,
  enableAutoTextSelection: false,
  enableAutoPrinting: false,
  enableAutoDownloading: false,
  enableAutoRotating: false,
  enableAutoFlipping: false,
  enableAutoScaling: false,
  enableAutoPanning: false,
  enableAutoZooming: false,
  enableAutoKeyboardNavigation: false,
  enableAutoMouseWheelZoom: false,
  enableAutoTouchGestures: false,
  enableAutoPinchZoom: false,
  enableAutoDoubleClickZoom: false,
  enableAutoRightClickMenu: false,
  enableAutoContextMenu: false,
  enableAutoDragAndDrop: false,
  enableAutoFileDrop: false
}
</script>

<style scoped>
.pdf-viewer-container {
  min-height: 400px;
}

/* Hide print button */
:deep([data-testid="print__button"]),
:deep(.rpv-toolbar__item[aria-label*="Print"]),
:deep(.vpv-toolbar-btn[aria-label="Print"]),
:deep(button[aria-label="Print"]),
:deep(.vpv-toolbar-btn[aria-label*="print"]) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Hide open local file button */
:deep(.vpv-toolbar-btn[aria-label="Open local file"]),
:deep(button[aria-label="Open local file"]) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  position: absolute !important;
  left: -9999px !important;
  top: -9999px !important;
}

/* Forcibly hide sidebar and sidebar toggle in @vue-pdf-viewer */
:deep(.vpv-sidebar),
:deep(.vpv-sidebar-container),
:deep(.vpv-sidebar-features),
:deep(.vpv-sidebar-tabs),
:deep(.vpv-sidebar-content-container),
:deep(.vpv-toolbar-btn[aria-label="Toggle sidebar"]),
:deep(.vpv-toolbar-btn[aria-label="Show sidebar"]),
:deep(.vpv-sidebar-tab),
:deep(.vpv-sidebar-tab[role="tab"]),
:deep(.vpv-sidebar-tab[aria-selected]),
:deep(.vpv-sidebar-tab[aria-controls]),
:deep(.vpv-sidebar-tabpanel),
:deep(.vpv-sidebar-content) {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}

/* Force main viewer to use full width */
:deep(.vpv-body-wrapper) {
  margin-left: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .pdf-viewer-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: white;
    overflow: hidden;
  }

  :deep(.rpv-core__viewer) {
    height: 100vh !important;
    width: 100vw !important;
  }
}
</style>