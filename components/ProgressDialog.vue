<template>
  <!-- PDF Progress Dialog -->
  <div 
    v-if="showProgressDialog"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-1000 ease-out"
    :class="showProgressDialog ? 'backdrop-blur-xl' : 'backdrop-blur-none'"
    style="z-index: 9999;"
  >
    <!-- Main dialog container -->
    <div 
      class="bg-white rounded-2xl shadow-2xl border-4 border-brand-highlight overflow-hidden"
      :style="{ 
        width: isMobile ? '95vw' : '450px', 
        maxWidth: '95vw',
        maxHeight: '90vh'
      }"
    >
      <!-- Main content container -->
      <div class="p-6 sm:p-8">
        <!-- Magic Header -->
        <div class="text-center mb-6">
          <div class="relative mb-4">
            <!-- Floating sparkles -->
            <div class="absolute -top-2 -left-2 w-4 h-4 bg-brand-flash rounded-full animate-ping"></div>
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-brand-highlight rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
            <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-brand-accent rounded-full animate-ping" style="animation-delay: 1s;"></div>
            
            <!-- Main magic circle -->
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-brand-accent via-brand-highlight to-brand-secondary rounded-full flex items-center justify-center shadow-lg mx-auto animate-pulse">
              <i class="pi pi-sparkles text-3xl sm:text-4xl text-brand-header animate-bounce"></i>
            </div>
          </div>
          
          <h2 class="text-lg sm:text-xl font-bold text-brand-header mb-2 animate-fade-in">
            {{ isRegenerating ? '🌸 Recreating Your Memory 🌸' : '🌸 Creating Your Memory 🌸' }}
          </h2>
          <p class="text-sm sm:text-base text-brand-primary font-medium">
            {{ isRegenerating ? 'Baking fresh memories with love...' : 'Baking your memory with love...' }}
          </p>
        </div>

        <!-- Progress Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border-2 border-brand-highlight shadow-lg">
          <div class="text-center">
            <h3 class="text-sm sm:text-base font-semibold text-brand-header mb-3 leading-tight">
              {{ currentProgressMessage }}
            </h3>
            
            <!-- Animated progress bar -->
            <div class="relative mb-4">
              <div class="w-full bg-gradient-to-r from-brand-accent/30 to-brand-highlight/30 rounded-full h-3 shadow-inner">
                <div 
                  class="bg-gradient-to-r from-brand-accent via-brand-highlight to-brand-secondary h-3 rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                  :style="`width: ${currentProgress}%`"
                >
                  <!-- Shimmer effect -->
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <!-- Status indicator -->
            <div class="flex items-center justify-center gap-2 text-sm sm:text-base text-brand-primary">
              <i class="pi pi-cog text-brand-highlight animate-spin"></i>
              <span class="font-medium">{{ isRegenerating ? 'Baking...' : 'Baking...' }}</span>
            </div>
          </div>
        </div>

        <!-- Magic particles effect -->
        <div class="relative mt-4 h-8">
          <div class="absolute inset-0 flex justify-center">
            <div class="w-2 h-2 bg-brand-flash rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-2 h-2 bg-brand-highlight rounded-full animate-bounce ml-2" style="animation-delay: 0.2s;"></div>
            <div class="w-2 h-2 bg-brand-accent rounded-full animate-bounce ml-2" style="animation-delay: 0.4s;"></div>
            <div class="w-2 h-2 bg-brand-secondary rounded-full animate-bounce ml-2" style="animation-delay: 0.6s;"></div>
            <div class="w-2 h-2 bg-brand-flash rounded-full animate-bounce ml-2" style="animation-delay: 0.8s;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  showProgressDialog: {
    type: Boolean,
    default: false
  },
  currentProgress: {
    type: Number,
    default: 0
  },
  currentProgressMessage: {
    type: String,
    default: ''
  },
  isRegenerating: {
    type: Boolean,
    default: false
  }
})

// Mobile detection
const isMobile = ref(false)

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})
</script>
