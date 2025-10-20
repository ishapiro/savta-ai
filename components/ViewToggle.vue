<template>
  <div class="flex items-center justify-center sm:justify-end">
    <div class="bg-white rounded p-1 shadow-elevation-1 border border-gray-200">
      <div class="flex">
        <button
          :class="[
            'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded',
            activeView === 'cards' 
              ? 'bg-brand-secondary text-white shadow-elevation-1' 
              : 'text-brand-text-secondary hover:text-brand-primary hover:bg-gray-50'
          ]"
          @click="$emit('update:activeView', 'cards')"
          data-testid="toggle-cards"
        >
          <Sparkles class="w-4 h-4" />
          <span class="hidden xs:inline">Memory Cards</span>
          <span class="xs:hidden">Cards</span>
        </button>
        <button
          :class="[
            'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded',
            activeView === 'books' 
              ? 'bg-brand-highlight text-white shadow-elevation-1' 
              : 'text-brand-text-secondary hover:text-brand-primary hover:bg-gray-50'
          ]"
          @click="$emit('update:activeView', 'books')"
          data-testid="toggle-books"
        >
          <i class="pi pi-book text-sm"></i>
          <span class="hidden xs:inline">Memory Books</span>
          <span class="xs:hidden">Books</span>
        </button>
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
defineEmits(['update:activeView'])
</script>
