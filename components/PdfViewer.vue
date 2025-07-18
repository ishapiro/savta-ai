<template>
  <client-only>
    <div class="pdf-viewer-container w-full" :style="{ height }">
      <VPdfViewer
        v-if="licenseInitialized"
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
import { VPdfViewer, useLicense } from '@vue-pdf-viewer/viewer';
import { watch } from 'vue';

// Use the global license composable
const { licenseKey, licenseInitialized } = useVuePdfViewerLicense()

// Watch for when the license key becomes available and initialize the PDF viewer
watch(licenseKey, (newLicenseKey) => {
  if (newLicenseKey) {
    useLicense(newLicenseKey);
    console.log('Vue PDF Viewer license initialized in component');
  }
}, { immediate: true });

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  height: {
    type: String,
    default: '100%'
  }
});

// Viewer options for better mobile experience
const viewerOptions = {
  defaultZoom: 1.0,
  enableDownload: true,
  enablePrint: false,
  enablePrinting: false,
  enableSearch: true,
  enableThumbnail: true,
  enableToolbar: true,
  enableSidebar: true,
  sidebarTabs: ['thumbnails', 'bookmarks', 'attachments'],
  toolbarPlugin: {
    fullScreenPlugin: {
      onEnterFullScreen: (zoom) => {
        console.log('Entered full screen with zoom:', zoom)
      },
      onExitFullScreen: (zoom) => {
        console.log('Exited full screen with zoom:', zoom)
      }
    }
  },
  // Disable file opening functionality
  enableFileDrop: false,
  enableDragAndDrop: false,
  enableOpenFile: false,
  // Mobile-friendly settings
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
  // enablePrinting: true, // REMOVE or set to false
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
};
</script>

<style scoped>
.pdf-viewer-container {
  min-height: 400px;
}

/* Ensure the PDF viewer takes full height */

/* Hide the print button in the toolbar */
:deep([data-testid="print__button"]),
:deep(.rpv-toolbar__item[data-testid="print__button"]),
:deep(.rpv-toolbar__item[aria-label*="print"]),
:deep(.rpv-toolbar__item[aria-label*="Print"]),
:deep(.rpv-toolbar__item[title*="print"]),
:deep(.rpv-toolbar__item[title*="Print"]),
:deep(.rpv-toolbar__item button[aria-label*="print"]),
:deep(.rpv-toolbar__item button[aria-label*="Print"]),
:deep(.rpv-toolbar__item button[title*="print"]),
:deep(.rpv-toolbar__item button[title*="Print"]),
:deep(.rpv-toolbar__item[role="button"]:has(svg[aria-label*="Print"])),
:deep(.rpv-toolbar__item[role="button"] svg[aria-label*="Print"]),
:deep(.rpv-toolbar__item[role="button"] svg[aria-label*="print"]),
:deep(.vpv-toolbar-btn[aria-label="Print"]),
:deep(button[aria-label="Print"]),
:deep(.vpv-toolbar-btn[aria-label*="print"]),
:deep(button[aria-label*="print"]),
:deep(.vpv-toolbar-btn.vp-h-8.vp-w-8[aria-label="Print"]),
:deep(button.vpv-toolbar-btn[aria-label="Print"]),
:deep(.vpv-toolbar-btn[aria-label="Print"]),
:deep([class*="vpv-toolbar-btn"][aria-label="Print"]) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Global CSS to hide print button */
.vpv-toolbar-btn[aria-label="Print"],
button[aria-label="Print"],
[class*="vpv-toolbar-btn"][aria-label="Print"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Global CSS to hide open local file button - no scoping */
.vpv-toolbar-btn[aria-label="Open local file"],
button[aria-label="Open local file"],
[class*="vpv-toolbar-btn"][aria-label="Open local file"],
.vpv-toolbar-btn.vp-h-8.vp-w-8[aria-label="Open local file"],
button.vpv-toolbar-btn.vp-h-8.vp-w-8[aria-label="Open local file"],
[data-v-851e235f][aria-label="Open local file"],
[data-v-971703f0][aria-label="Open local file"],
[data-v-1218acd3][aria-label="Open local file"],
[data-v-da4050df][aria-label="Open local file"],
.vpv-toolbar-end .vpv-toolbar-btn[aria-label="Open local file"],
.vpv-toolbar-end button[aria-label="Open local file"] {
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

/* Additional high-specificity rules */
.vpv-toolbar-end .vpv-toolbar-btn[aria-label="Open local file"],
.vpv-toolbar-end button[aria-label="Open local file"],
div .vpv-toolbar-btn[aria-label="Open local file"],
div button[aria-label="Open local file"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Mobile-friendly adjustments */
@media (max-width: 768px) {
  .pdf-viewer-container {
    min-height: 300px;
  }
  
  /* Make PDF viewer full screen on mobile */
  .pdf-viewer-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: white;
  }
  
  /* Ensure the PDF viewer takes full screen */
  :deep(.rpv-core__viewer) {
    height: 100vh !important;
    width: 100vw !important;
  }
  
  /* Hide any scrollbars on mobile */
  .pdf-viewer-container {
    overflow: hidden;
  }
}
</style> 