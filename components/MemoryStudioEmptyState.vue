<template>
  <div class="text-center py-12">
    <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" :class="activeView === 'cards' ? 'bg-brand-secondary/20' : 'bg-brand-highlight/20'">
      <Wand2 v-if="activeView === 'cards'" class="w-10 h-10 text-brand-secondary" />
      <i v-else class="pi pi-book text-3xl text-brand-highlight"></i>
    </div>
    <h3 class="text-xl font-semibold text-brand-primary mb-3">
      No {{ activeView === 'cards' ? 'memory cards' : 'memory books' }} yet
    </h3>
    <p class="text-brand-text-muted mb-6">
      {{ activeView === 'cards' 
        ? 'You have memory books but no memory cards yet. Create your first memory card to print and mail to loved ones!' 
        : 'Create your first memory book to organize your photos into beautiful digital collections!' 
      }}
    </p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        v-if="activeView === 'cards'"
        data-testid="create-first-card-button"
        class="bg-brand-secondary hover:bg-brand-secondary/80 text-white font-medium rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all duration-200"
        @click="$emit('create-card')"
      >
        <i class="pi pi-magic-wand mr-2"></i> Create Memory Card
      </button>
      <button
        v-else
        data-testid="create-first-book-button"
        class="bg-brand-highlight hover:bg-brand-highlight/80 text-white font-medium rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all duration-200"
        @click="$emit('create-book')"
      >
        <i class="pi pi-plus mr-2"></i> Create Memory Book
      </button>
    </div>
  </div>
</template>

<script setup>
import { Wand2 } from 'lucide-vue-next'

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
