<template>
  <div class="caption-renderer">
    <img 
      v-if="captionImageUrl" 
      :src="captionImageUrl" 
      :alt="caption"
      class="w-full h-auto object-contain"
      :style="{ maxHeight: maxHeight + 'px' }"
    />
    <div v-else class="text-xs font-medium text-brand-header truncate px-1">
      {{ caption }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  caption: {
    type: String,
    required: true
  },
  maxWidth: {
    type: Number,
    default: 120
  },
  maxHeight: {
    type: Number,
    default: 40
  },
  fontSize: {
    type: Number,
    default: 10
  }
})

const captionImageUrl = ref(null)

const renderCaption = async () => {
  if (!props.caption || props.caption.trim() === '') {
    captionImageUrl.value = null
    return
  }

  try {
    // Call the API to render the caption with high-quality text
    const response = await fetch('/api/render-caption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: props.caption,
        width: props.maxWidth,
        height: props.maxHeight,
        fontSize: props.fontSize,
        color: '#D16D84', // brand-header color
        backgroundColor: 'transparent'
      })
    })

    if (response.ok) {
      const blob = await response.blob()
      captionImageUrl.value = URL.createObjectURL(blob)
    } else {
      console.warn('Failed to render caption, falling back to CSS text')
      captionImageUrl.value = null
    }
  } catch (error) {
    console.warn('Error rendering caption:', error)
    captionImageUrl.value = null
  }
}

onMounted(() => {
  renderCaption()
})

watch(() => props.caption, () => {
  renderCaption()
})

// Clean up blob URL when component is unmounted
onUnmounted(() => {
  if (captionImageUrl.value) {
    URL.revokeObjectURL(captionImageUrl.value)
  }
})
</script>

<style scoped>
.caption-renderer {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 