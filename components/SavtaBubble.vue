<template>
  <!-- Teleport to body so bubbles are not clipped by parents -->
  <Teleport to="body">
    <!-- Dimming overlay -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1199]"
        @click="$emit('update:open', false)"
      />
    </transition>

    <!-- Savta Bubble -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && coords"
        :style="{ left: coords.left + 'px', top: coords.top + 'px' }"
        class="fixed z-[1200]"
        data-savta-bubble
        role="dialog"
        aria-live="polite"
      >
        <div
          :class="[
            'relative bg-gray-50 rounded-xl p-6 border-2 border-brand-highlight shadow-lg',
            html ? 'max-w-[600px] max-h-[80vh]' : 'max-w-[500px]'
          ]"
        >
                      <!-- Savta avatar + text -->
            <div class="flex items-start gap-3">
              <div v-if="showAvatar" class="shrink-0">
                <SavtaIcon class="w-12 h-12" />
              </div>

              <div class="min-w-0">
                <!-- Optional heading -->
                <p v-if="heading" class="font-bold mb-2 font-sans text-brand-header text-xl">{{ cleanedHeading }}</p>
                <!-- Main content - HTML or text with line break support -->
                <div v-if="html" class="text-sm text-gray-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2" v-html="html"></div>
                <p v-else-if="text" class="whitespace-pre-line text-sm text-gray-700 leading-relaxed">{{ cleanedText }}</p>
                <div v-else class="text-sm text-gray-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                  <slot />
                </div>

                <!-- Actions slot (buttons/links) -->
                <div v-if="$slots.actions" class="mt-2 flex gap-2">
                  <slot name="actions" />
                </div>
              </div>

            <!-- Dismiss (if enabled) -->
            <button
              v-if="dismissible"
              @click="$emit('update:open', false)"
              aria-label="Dismiss"
              class="ml-1 p-1.5 rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6">
                <path fill="currentColor" d="M6.4 5l12.6 12.6-1.4 1.4L5 6.4 6.4 5Zm12.6 1.4L6.4 19.1 5 17.7 17.7 5l1.3 1.4Z" />
              </svg>
            </button>
          </div>


        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from 'vue'
import SavtaIcon from './SavtaIcon.vue'

/**
 * Reusable speech bubble for Savta guidance.
 *
 * Props
 * - open (v-model): show/hide bubble
 * - target: CSS selector for the anchor element (required)
 * - placement: 'top' | 'bottom' | 'left' | 'right' | 'top-center' | 'center'
 * - offset: pixel gap between bubble and target (default 10)
 * - heading: optional bold heading
 * - text: main message
 * - variant: look & feel of the bubble ('instruction'|'tip'|'warning'|'celebrate')
 * - dismissible: show small close button
 * - showAvatar: include Savta avatar image
 */

const props = defineProps({
  open: Boolean,
  target: String,
  placement: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom', 'left', 'right', 'top-center', 'center'].includes(value)
  },
  offset: {
    type: Number,
    default: 10
  },
  heading: String,
  text: String,
  html: String,
  variant: {
    type: String,
    default: 'instruction',
    validator: (value) => ['instruction', 'tip', 'warning', 'celebrate'].includes(value)
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:open'])

const coords = ref(null)
let cleanupFns = []

// Clean text by removing unwanted whitespace/line breaks while preserving intentional \n
const cleanedHeading = computed(() => {
  if (!props.heading) return ''
  // Remove line breaks and extra whitespace from code formatting, but preserve intentional \n
  return props.heading.replace(/\n(?!\n)/g, ' ').replace(/\s+/g, ' ').trim()
})

const cleanedText = computed(() => {
  if (!props.text) return ''
  
  // Debug: log the raw text to see what we're getting
  console.log('SavtaBubble raw text:', JSON.stringify(props.text))
  
  let processedText = props.text
  
  // Check if this contains intentional \n characters (literal \n in the string)
  if (props.text.includes('\\n')) {
    // Handle literal \n strings - convert to actual newlines
    processedText = props.text
      .replace(/\\n/g, '\n')
      .split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .join('\n')
      .trim()
  } else {
    // This is formatted text in source code - clean it up to single paragraph
    processedText = props.text
      .replace(/\s+/g, ' ') // Replace all whitespace (including newlines) with single spaces
      .trim()
  }
  
  console.log('SavtaBubble processed text:', JSON.stringify(processedText))
  return processedText
})



function calcPosition() {
  // If no target is provided, use center placement
  if (!props.target) {
    // Initially position at center with estimated dimensions
    const estimatedWidth = props.html ? 500 : 400
    const estimatedHeight = props.html ? 400 : 200
    
    const left = window.innerWidth / 2 - estimatedWidth / 2
    const top = window.innerHeight / 2 - estimatedHeight / 2
    
    coords.value = { left, top }
    
    // After the bubble is rendered, re-center it with actual dimensions
    nextTick(() => {
      const bubbleElement = document.querySelector('[data-savta-bubble]')
      
      if (bubbleElement) {
        const rect = bubbleElement.getBoundingClientRect()
        const actualWidth = rect.width
        const actualHeight = rect.height
        
        // Recalculate center position with actual dimensions
        const centeredLeft = window.innerWidth / 2 - actualWidth / 2
        const centeredTop = window.innerHeight / 2 - actualHeight / 2
        
        // Ensure it stays within bounds
        const pad = 12
        const finalLeft = Math.max(pad, Math.min(centeredLeft, window.innerWidth - pad - actualWidth))
        const finalTop = Math.max(pad, Math.min(centeredTop, window.innerHeight - pad - actualHeight))
        
        coords.value = { left: finalLeft, top: finalTop }
      }
    })
    return
  }
  
  const el = document.querySelector(props.target)
  if (!el) return
  const r = el.getBoundingClientRect()
  const bubble = document.createElement('div')
  bubble.style.position = 'fixed'
  bubble.style.visibility = 'hidden'
  bubble.style.maxWidth = '500px'
  bubble.style.padding = '24px'
  bubble.style.fontSize = '14px'
  bubble.style.lineHeight = '1.5'
  bubble.style.fontFamily = 'system-ui, sans-serif'
  bubble.style.borderRadius = '12px'
  bubble.style.border = '2px solid #41706C' // brand.highlight
  bubble.style.backgroundColor = '#F9F6F2' // brand.background
  bubble.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
  bubble.style.whiteSpace = 'pre-line'
  bubble.style.wordWrap = 'break-word'
  bubble.style.overflowWrap = 'break-word'
  bubble.style.width = 'max-content'
  bubble.style.minWidth = '200px'
  
  // Add the actual text content to get accurate dimensions
  bubble.textContent = props.text
  
  document.body.appendChild(bubble)
  const bubbleRect = bubble.getBoundingClientRect()
  bubble.remove()

  const gap = props.offset
  let left = 0, top = 0
  if (props.placement === 'top') {
    left = r.left + r.width / 2 - Math.min(480, Math.max(360, r.width)) / 2
    top = r.top - bubbleRect.height - gap
  } else if (props.placement === 'bottom') {
    left = r.left + r.width / 2 - Math.min(480, Math.max(360, r.width)) / 2
    top = r.bottom + gap
  } else if (props.placement === 'left') {
    left = r.left - (bubbleRect.width || 420) - gap
    top = r.top
  } else if (props.placement === 'right') {
    left = r.right + gap
    top = r.top
  } else if (props.placement === 'top-center') {
    // Center horizontally on the page, position at top with offset
    left = window.innerWidth / 2 - Math.min(480, 480) / 2
    top = gap
  } else if (props.placement === 'center') {
    // Center both horizontally and vertically in the browser window
    // Use outerWidth for horizontal centering (includes chrome)
    // Use innerHeight for vertical centering (viewport only, since position is fixed)
    const bubbleWidth = bubbleRect.width || 480
    const bubbleHeight = bubbleRect.height || 300
    
    console.log('[SavtaBubble] Center positioning debug:', {
      windowOuterWidth: window.outerWidth,
      windowOuterHeight: window.outerHeight,
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight,
      screenAvailHeight: window.screen.availHeight,
      bubbleWidth: bubbleWidth,
      bubbleHeight: bubbleHeight,
      calculatedLeft: window.outerWidth / 2 - bubbleWidth / 2,
      calculatedTop: window.innerHeight / 2 - bubbleHeight / 2
    })
    
    // Position the top-left corner so that the bubble's center is at the window center
    left = window.outerWidth / 2 - bubbleWidth / 2
    top = window.innerHeight / 2 - bubbleHeight / 2 - 150 // Move up 150px
    
    // Ensure the bubble stays within the visible window bounds
    const minTop = 20 // Minimum distance from top of viewport
    const maxTop = window.innerHeight - bubbleHeight - 20 // Maximum distance from bottom of viewport
    top = Math.max(minTop, Math.min(maxTop, top))
    
    console.log('[SavtaBubble] Final positioning:', {
      left,
      top,
      bubbleCenterX: left + bubbleWidth / 2,
      bubbleCenterY: top + bubbleHeight / 2,
      windowCenterX: window.outerWidth / 2,
      windowCenterY: window.innerHeight / 2,
      adjustedUp: 150
    })
  }

  // Clamp to viewport with padding - adjust for HTML content
  const pad = 12
  const maxWidth = props.html ? 600 : 480
  const maxHeight = props.html ? window.innerHeight * 0.8 : 300
  
  left = Math.max(pad, Math.min(left, window.innerWidth - pad - maxWidth))
  top = Math.max(pad, Math.min(top, window.innerHeight - pad - maxHeight))
  coords.value = { left, top }
}

function bindReposition() {
  const fn = () => calcPosition()
  window.addEventListener('resize', fn)
  window.addEventListener('scroll', fn, true)
  cleanupFns.push(() => {
    window.removeEventListener('resize', fn)
    window.removeEventListener('scroll', fn, true)
  })
}

watch(() => props.open, async (v) => {
  if (!v) return
  await nextTick()
  calcPosition()
})

onMounted(() => {
  if (props.open) calcPosition()
  bindReposition()
})

onBeforeUnmount(() => {
  cleanupFns.forEach((c) => c())
})
</script>

<style scoped>
/***** Optional: subtle lifted shadow *****/
.shadow-rose-100 { box-shadow: 0 10px 20px rgba(209, 109, 132, 0.08), 0 6px 6px rgba(0,0,0,0.04); }

/* Enhanced defocus effect for backdrop overlay */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Ensure the overlay covers everything properly */
.fixed.inset-0 {
  /* Additional fallback for older browsers */
  background-color: rgba(0, 0, 0, 0.3);
}

/* Smooth transition for backdrop filter */
.transition {
  transition: backdrop-filter 0.2s ease-out, -webkit-backdrop-filter 0.2s ease-out;
}
</style>
