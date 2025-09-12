<template>
  <div class="mb-8">
    <!-- Memory Cards Hero -->
    <div v-if="activeView === 'cards'" class="text-center mb-6">
      <h2 class="text-2xl lg:text-3xl font-bold text-brand-primary mb-3">Create Beautiful Memory Cards</h2>
      <p class="text-base text-brand-text-muted max-w-2xl mx-auto">
        Turn your photos into stunning memory cards in minutes. Perfect for printing and mailing to family and friends.
      </p>
    </div>

    <!-- Memory Books Hero -->
    <div v-else class="text-center mb-6">
      <h2 class="text-2xl lg:text-3xl font-bold text-brand-primary mb-3">Create Advanced Memory Books</h2>
      <p class="text-base text-brand-text-muted max-w-2xl mx-auto">
        Memory books have multiple pages and both grid and predefined layouts.
      </p>
    </div>

    <!-- Memory Cards Hero Card -->
    <div v-if="activeView === 'cards'" class="max-w-3xl mx-auto">
      <div data-savta="memory-cards-tile" class="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 rounded-xl shadow-lg border border-brand-secondary/20 p-6 relative overflow-hidden">
        <!-- Decorative background elements -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-brand-secondary/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div class="absolute bottom-0 left-0 w-16 h-16 bg-brand-accent/10 rounded-full translate-y-8 -translate-x-8"></div>

        <div class="relative z-10 text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-brand-secondary to-brand-secondary/80 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles class="w-8 h-8 text-white" />
          </div>

          <h3 class="text-xl font-bold text-brand-secondary mb-3">Magic Memory Cards</h3>
          <p class="text-brand-text-muted mb-4 max-w-md mx-auto text-sm">
            Our AI wizard guides you through creating beautiful memory cards step-by-step.
            Perfect for beginners and experienced users alike.
          </p>

          <button
            data-testid="create-memory-card-button"
            class="border-0 bg-gradient-to-r from-brand-secondary to-brand-secondary/80 hover:from-brand-secondary/90 hover:to-brand-secondary text-white font-bold rounded-lg px-6 py-3 text-base shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 magic-memory-btn min-h-[48px]"
            @click="$emit('create-card')"
          >
            <Sparkles class="w-5 h-5 text-yellow-300 drop-shadow mr-2" />
            Create a Memory Card
          </button>

          <div class="flex justify-center items-center gap-4 mt-4 text-xs text-brand-text-muted">
            <div class="flex items-center gap-1">
              <i class="pi pi-check-circle text-brand-secondary"></i>
              <span>Simple wizard</span>
            </div>
            <div class="flex items-center gap-1">
              <i class="pi pi-check-circle text-brand-secondary"></i>
              <span>Print & mail</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-brand-secondary"></i>
              <span>AI-powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Memory Books Hero Card -->
    <div v-else class="max-w-2xl mx-auto">
      <div class="bg-gradient-to-br from-brand-highlight/10 to-brand-highlight/5 rounded-lg shadow-md border border-brand-highlight/20 p-4 relative overflow-hidden">
        <!-- Decorative background elements -->
        <div class="absolute top-0 right-0 w-16 h-16 bg-brand-highlight/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div class="absolute bottom-0 left-0 w-12 h-12 bg-brand-accent/10 rounded-full translate-y-6 -translate-x-6"></div>

        <div class="relative z-10 text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-brand-highlight to-brand-highlight/80 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
            <i class="pi pi-book text-lg text-white"></i>
          </div>

          <h3 class="text-lg font-bold text-brand-highlight mb-2">Advanced Memory Books</h3>
          <p class="text-brand-text-muted mb-3 max-w-sm mx-auto text-xs">
            Unlike memory cards which are quick and simple, memory books provide extensive customization
            options including custom layouts, themes, and photo arrangements for digital use.
          </p>

          <div class="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <button
              data-testid="create-memory-book-button"
              class="border-0 bg-gradient-to-r from-brand-highlight to-brand-highlight/80 hover:from-brand-highlight/90 hover:to-brand-highlight text-white font-bold rounded-md px-4 py-2 text-sm shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
              @click="$emit('create-book')"
            >
              <i class="pi pi-plus mr-2"></i>
              Create a Memory Book
            </button>
          </div>

          <div class="flex justify-center items-center gap-3 mt-3 text-xs text-brand-text-muted">
            <div class="flex items-center gap-1">
              <i class="pi pi-check-circle text-brand-highlight"></i>
              <span>Custom layouts</span>
            </div>
            <div class="flex items-center gap-1">
              <i class="pi pi-check-circle text-brand-highlight"></i>
              <span>Professional themes</span>
            </div>
            <div class="flex items-center gap-1">
              <i class="pi pi-check-circle text-brand-highlight"></i>
              <span>Digital PDFs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Sparkles } from 'lucide-vue-next'

// Props
defineProps({
  activeView: {
    type: String,
    required: true,
    validator: (value) => ['cards', 'books'].includes(value)
  }
})

// Emits
defineEmits(['create-card', 'create-book'])
</script>
