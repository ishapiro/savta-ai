<template>
  <client-only>
    <div class="pdf-viewer-container w-full h-full">
      <VPdfViewer
        :src="src"
        class="w-full h-full"
        :options="viewerOptions"
      />
    </div>
  </client-only>
</template>

<script setup>
import { VPdfViewer } from '@vue-pdf-viewer/viewer';

const props = defineProps({
  src: {
    type: String,
    required: true
  }
});

// Viewer options for better mobile experience
const viewerOptions = {
  defaultZoom: 1.0,
  enableDownload: true,
  enablePrint: true,
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
  enablePrinting: true,
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
:deep(.rpv-core__viewer) {
  height: 100% !important;
}

/* Mobile-friendly adjustments */
@media (max-width: 768px) {
  .pdf-viewer-container {
    min-height: 300px;
  }
}
</style> 