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
        class="fixed inset-0 bg-black/20 z-[999]"
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
        class="fixed z-[1000]"
        role="dialog"
        aria-live="polite"
      >
        <div
          class="relative max-w-[480px] px-6 py-4 rounded-2xl shadow-lg border text-[22px] leading-snug"
          :class="variantClasses[variant]"
        >
          <!-- Savta avatar + text -->
          <div class="flex items-start gap-3">
            <div v-if="showAvatar" class="shrink-0">
              <SavtaIcon class="w-12 h-12" />
            </div>

            <div class="min-w-0">
              <!-- Optional heading -->
              <p v-if="heading" class="font-semibold mb-0.5">{{ heading }}</p>
              <!-- Main text -->
              <p class="whitespace-pre-line">{{ text }}</p>

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

          <!-- Tail / Arrow -->
          <div
            class="absolute w-3 h-3 rotate-45 border"
            :class="tailClasses[variant] + ' ' + tailPlacementClass"
          />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
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

const props = withDefaults(defineProps<{
  open: boolean
  target: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-center' | 'center'
  offset?: number
  heading?: string
  text: string
  variant?: 'instruction' | 'tip' | 'warning' | 'celebrate'
  dismissible?: boolean
  showAvatar?: boolean
}>(), {
  placement: 'top',
  offset: 10,
  variant: 'instruction',
  dismissible: true,
  showAvatar: true
})

const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>()

const coords = ref<{ left: number; top: number } | null>(null)
let cleanupFns: Array<() => void> = []

const variantClasses: Record<string, string> = {
  instruction: 'bg-[#F9F6F2] border-[#E7D8DE] text-[#3c2d33] shadow-rose-100',
  tip: 'bg-[#F3EDF4] border-[#E0CCE3] text-[#3a2a35]',
  warning: 'bg-[#FDECEF] border-[#F4C4CD] text-[#52242c]',
  celebrate: 'bg-[#FFF6E5] border-[#FFE1B3] text-[#4a3521]'
}

const tailClasses: Record<string, string> = {
  instruction: 'bg-[#F9F6F2] border-[#E7D8DE]',
  tip: 'bg-[#F3EDF4] border-[#E0CCE3]',
  warning: 'bg-[#FDECEF] border-[#F4C4CD]',
  celebrate: 'bg-[#FFF6E5] border-[#FFE1B3]'
}

const tailPlacementClass = computed(() => {
  switch (props.placement) {
    case 'top':
      return 'left-6 -bottom-1 border-t border-l'
    case 'bottom':
      return 'left-6 -top-1 border-b border-r'
    case 'left':
      return '-right-1 top-5 border-l border-b'
    case 'right':
      return '-left-1 top-5 border-r border-t'
    case 'top-center':
      return 'left-1/2 transform -translate-x-1/2 -bottom-1 border-t border-l'
    case 'center':
      return '' // No tail/pointer for center placement
  }
})

function calcPosition() {
  const el = document.querySelector(props.target) as HTMLElement | null
  if (!el) return
  const r = el.getBoundingClientRect()
  const bubble = document.createElement('div')
  bubble.style.position = 'fixed'
  bubble.style.visibility = 'hidden'
  bubble.style.maxWidth = '480px'
  bubble.style.padding = '16px 24px'
  bubble.style.fontSize = '22px'
  bubble.style.lineHeight = '1.2'
  bubble.style.fontFamily = 'system-ui, sans-serif'
  bubble.style.borderRadius = '16px'
  bubble.style.border = '1px solid #E7D8DE'
  bubble.style.backgroundColor = '#F9F6F2'
  bubble.style.boxShadow = '0 10px 20px rgba(209, 109, 132, 0.08), 0 6px 6px rgba(0,0,0,0.04)'
  bubble.style.whiteSpace = 'pre-line'
  bubble.style.wordWrap = 'break-word'
  bubble.style.overflowWrap = 'break-word'
  bubble.style.maxWidth = '480px'
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

  // Clamp to viewport with padding
  const pad = 12
  left = Math.max(pad, Math.min(left, window.innerWidth - pad - 480))
  top = Math.max(pad, Math.min(top, window.innerHeight - pad - 300))
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
</style>
