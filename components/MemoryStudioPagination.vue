<template>
  <div v-if="totalItems > itemsPerPage" class="flex justify-center items-center mt-8">
    <div class="flex items-center gap-2">
      <button
        @click="$emit('previous-page')"
        :disabled="currentPage === 1"
        class="px-3 py-2 text-sm font-medium text-brand-text-muted bg-white border border-brand-surface-border rounded-lg hover:bg-brand-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-testid="pagination-previous"
      >
        <i class="pi pi-chevron-left"></i>
      </button>

      <div class="flex items-center gap-1">
        <span
          v-for="page in totalPages"
          :key="page"
          @click="$emit('go-to-page', page)"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors',
            page === currentPage
              ? (activeView === 'cards' ? 'bg-brand-secondary text-white' : 'bg-brand-highlight text-white')
              : 'text-brand-text-muted hover:bg-brand-surface-hover'
          ]"
          :data-testid="`pagination-page-${page}`"
        >
          {{ page }}
        </span>
      </div>

      <button
        @click="$emit('next-page')"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 text-sm font-medium text-brand-text-muted bg-white border border-brand-surface-border rounded-lg hover:bg-brand-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-testid="pagination-next"
      >
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    required: true
  },
  activeView: {
    type: String,
    required: true,
    validator: (value) => ['cards', 'books'].includes(value)
  }
})

// Emits
defineEmits(['previous-page', 'next-page', 'go-to-page'])
</script>
