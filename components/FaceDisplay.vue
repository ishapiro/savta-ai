<template>
  <div class="relative group cursor-pointer" @click="$emit('click', face)">
    <!-- Full Photo Container -->
    <div class="aspect-square bg-brand-card rounded-lg overflow-hidden relative">
      <!-- Full Photo -->
      <div 
        v-if="face.asset_url"
        class="w-full h-full relative"
      >
        <img
          :src="face.asset_url"
          :alt="`Photo with Face ${faceNumber}`"
          class="w-full h-full object-contain"
        />
        
        <!-- Face Bounding Box Overlay -->
        <div 
          v-if="face.bounding_box"
          class="absolute border-2 border-brand-highlight rounded"
          :style="boundingBoxStyle"
        >
          <!-- Face Number Badge in Center of Bounding Box -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="bg-brand-highlight text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white">
              {{ faceNumber }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Fallback Icon -->
      <div v-else class="w-full h-full flex items-center justify-center">
        <i class="pi pi-user text-brand-primary/40 text-lg sm:text-xl"></i>
      </div>
      
      <!-- Confidence Badge -->
      <div class="absolute top-2 right-2 bg-brand-secondary/80 text-white text-xs font-bold rounded-full px-2 py-1 shadow-lg">
        {{ Math.round((face.confidence || 0) * 100) }}%
      </div>
    </div>
    
    <!-- Hover Overlay -->
    <div class="absolute inset-0 bg-brand-secondary bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
      <span class="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
        Assign Face {{ faceNumber }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  face: {
    type: Object,
    required: true
  },
  faceNumber: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['click']);

// Compute the bounding box overlay style
const boundingBoxStyle = computed(() => {
  if (!props.face.bounding_box) return {};
  
  const box = props.face.bounding_box;
  
  // AWS Rekognition bounding box coordinates are normalized (0-1)
  // Convert to percentages for CSS positioning
  const left = (box.Left || 0) * 100;
  const top = (box.Top || 0) * 100;
  const width = (box.Width || 0) * 100;
  const height = (box.Height || 0) * 100;
  
  // Debug logging for the first few faces
  if (props.faceNumber <= 3) {
    console.log(`Face ${props.faceNumber} bounding box:`, {
      original: box,
      calculated: { left, top, width, height }
    });
  }
  
  // Position the bounding box overlay
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`
  };
});
</script>

<style scoped>
/* Bounding box overlay styling */
.border-brand-highlight {
  border-color: #41706C;
}
</style>
