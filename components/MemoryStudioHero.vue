<template>
  <div class="mb-4">
    <!-- Memory Cards Hero Card -->
    <div v-if="activeView === 'cards'" class="max-w-2xl mx-auto">
      <div data-savta="memory-cards-tile" class="bg-white rounded shadow-elevation-2 border border-gray-200 p-6">
        <div class="text-center">
          <div class="w-12 h-12 bg-brand-secondary rounded flex items-center justify-center mx-auto mb-3">
            <Sparkles class="w-6 h-6 text-white" />
          </div>

          <h3 class="text-lg font-semibold text-brand-primary mb-2">Magic Memory Cards</h3>
          <p class="text-brand-text-secondary mb-4 max-w-md mx-auto text-sm">
            Our AI wizard guides you through creating beautiful memory cards step-by-step.
            Perfect for beginners and experienced users alike.
          </p>

          <button
            data-testid="create-memory-card-button"
            class="border-0 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-bold uppercase tracking-wider rounded px-6 py-2 text-sm shadow-elevation-2 hover:shadow-elevation-3 inline-flex items-center justify-center gap-2"
            @click="$emit('create-card')"
          >
            <Sparkles class="w-4 h-4" />
            CREATE A MEMORY CARD
          </button>

          <div class="flex justify-center items-center gap-4 mt-4 text-xs text-brand-text-secondary">
            <div class="flex items-center gap-1">
              <i class="pi pi-check-circle text-brand-secondary"></i>
              <span>Simple wizard</span>
            </div>
            <div class="flex items-center gap-1">
              <i class="pi pi-check-circle text-brand-secondary"></i>
              <span>Print & mail</span>
            </div>
            <div class="flex items-center gap-1">
              <i class="pi pi-check-circle text-brand-secondary"></i>
              <span>AI-powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Memory Books Hero Card -->
    <div v-else class="max-w-2xl mx-auto">
      <div class="bg-white rounded shadow-elevation-2 border border-gray-200 p-6">
        <div class="text-center">
          <div class="w-12 h-12 bg-brand-highlight rounded flex items-center justify-center mx-auto mb-3">
            <i class="pi pi-book text-lg text-white"></i>
          </div>

          <h3 class="text-lg font-semibold text-brand-primary mb-2">Advanced Memory Books</h3>
          <p class="text-brand-text-secondary mb-4 max-w-md mx-auto text-sm">
            Unlike memory cards which are quick and simple, memory books provide extensive customization
            options including custom layouts, themes, and photo arrangements for digital use.
          </p>

          <button
            data-testid="create-memory-book-button"
            class="border-0 bg-brand-highlight hover:bg-brand-secondary-dark text-white font-bold uppercase tracking-wider rounded px-6 py-2 text-sm shadow-elevation-2 hover:shadow-elevation-3 inline-flex items-center justify-center gap-2"
            @click="$emit('create-book')"
          >
            <i class="pi pi-plus"></i>
            CREATE A MEMORY BOOK
          </button>

          <div class="flex justify-center items-center gap-4 mt-4 text-xs text-brand-text-secondary">
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
