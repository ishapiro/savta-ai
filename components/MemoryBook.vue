<template>
  <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-brand-surface-border overflow-hidden group">
    <!-- Card Header -->
    <div class="relative flex items-center justify-center h-16 px-4 bg-brand-highlight">
      <!-- Status Badge -->
      <div class="absolute top-2 right-2">
        <div :class="getStatusBadgeClass(book.status)" class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
          <i :class="getStatusIcon(book.status)" class="text-xs"></i>
          <span class="hidden sm:inline">{{ getStatusText(book.status) }}</span>
        </div>
      </div>
      
      <!-- Icon and Title -->
      <div class="flex flex-col items-center text-center">
        <div class="mb-1">
          <i class="pi pi-book w-6 h-6 text-white text-xl"></i>
        </div>
        <span class="text-xs font-medium text-white leading-tight">
          {{ 
            book.ai_supplemental_prompt 
              ? (book.ai_supplemental_prompt.length > 25 ? book.ai_supplemental_prompt.slice(0, 25) + '...' : book.ai_supplemental_prompt)
              : 'Memory Book'
          }}
        </span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-4 h-56 flex flex-col">
      <!-- Magic Story Preview -->
      <div v-if="book.magic_story" class="flex-1 p-3 bg-brand-accent-light/20 rounded-lg border border-brand-accent-light/30 mb-3">
        <div class="flex items-start gap-2 h-full">
          <Sparkle class="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
          <p class="text-xs text-brand-text-muted leading-relaxed overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical;">
            {{ book.magic_story.length > 150 ? book.magic_story.slice(0, 150) + '...' : book.magic_story }}
          </p>
        </div>
      </div>

      <!-- Photo Thumbnail -->
      <div v-else-if="!book.magic_story && getFirstAssetThumbnail(book)" class="flex-1 mb-3">
        <div class="relative w-full h-32 rounded-lg overflow-hidden border border-brand-surface-border">
          <img 
            :src="getFirstAssetThumbnail(book)" 
            :alt="book.ai_supplemental_prompt || 'Memory Book'"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
      </div>

      <!-- Key Info -->
      <div class="space-y-1 text-xs mt-auto">
        <div class="flex justify-between items-center">
          <span class="text-brand-text-muted">Created:</span>
          <span class="font-mono text-xs text-brand-text-muted">{{ formatDate(book.created_at) }}</span>
        </div>
        <div v-if="book.created_from_assets" class="flex justify-between items-center">
          <span class="text-brand-text-muted">Photos:</span>
          <span class="bg-brand-surface-hover px-2 py-1 rounded-full text-xs font-medium text-brand-text-muted">
            {{ book.created_from_assets.length }}
          </span>
        </div>
      </div>

      <!-- Review Notes -->
      <div v-if="book.review_notes" class="mt-2 p-2 bg-brand-accent/10 rounded border border-brand-accent/20">
        <p class="text-xs text-brand-accent font-medium leading-relaxed overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">{{ book.review_notes }}</p>
      </div>
    </div>

    <!-- Divider -->
    <div class="h-0.5 w-full bg-brand-primary/10"></div>

    <!-- Card Footer -->
    <div class="border-t border-brand-surface-border bg-brand-surface-hover/30 px-4 py-3 h-16 flex items-center">
      <div class="flex items-center justify-between gap-2 w-full">
        <!-- Primary Action Button -->
        <div v-if="book.status === 'draft'" class="flex-1">
          <button
            data-testid="compose-button"
            class="w-full bg-brand-highlight hover:bg-brand-highlight/80 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            @click="$emit('generate', book)"
          >
            <Wand2 class="w-4 h-4 inline mr-2" />
            {{ book.magic_story ? 'Create Story' : 'Compose' }}
          </button>
        </div>
        
        <div v-else-if="book.status === 'ready'" class="flex-1">
          <button
            data-testid="approve-button"
            class="w-full bg-brand-flash hover:bg-brand-flash/80 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            @click="$emit('approve', book.id)"
            v-tooltip.top="'Approve this Book and I\'ll Send it Out For You'"
          >
            <i class="pi pi-check mr-2"></i>
            Print and Mail
          </button>
        </div>
        
        <div v-else-if="book.status === 'approved'" class="flex-1">
          <button
            data-testid="unapprove-button"
            class="w-full bg-brand-accent hover:bg-brand-accent/80 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            @click="$emit('unapprove', book.id)"
          >
            <i class="pi pi-undo mr-2"></i>
            Unapprove
          </button>
        </div>
        
        <div v-else-if="book.status === 'background_ready'" class="flex-1">
          <button
            data-testid="recreate-button"
            class="w-full bg-brand-accent/50 text-brand-accent text-sm font-medium py-2 px-3 rounded-lg cursor-not-allowed opacity-50"
            disabled
          >
            <i class="pi pi-refresh mr-2"></i>
            Processing
          </button>
        </div>
        
        <!-- Secondary Actions -->
        <div class="flex gap-2">
          <button
            data-testid="view-button"
            class="p-2 text-brand-highlight hover:bg-brand-highlight/10 rounded-lg transition-colors"
            @click="$emit('download', book)"
            title="View"
          >
            <i class="pi pi-external-link text-lg"></i>
          </button>
          
          <button
            data-testid="details-button"
            class="p-2 text-brand-text-muted hover:bg-brand-surface-hover rounded-lg transition-colors"
            @click="$emit('view-details', book)"
            title="Details"
          >
            <i class="pi pi-list text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Wand2, Sparkle } from 'lucide-vue-next'
import { useMemoryStudio } from '~/composables/useMemoryStudio'

// Props
defineProps({
  book: {
    type: Object,
    required: true
  }
})

// Emits
defineEmits(['generate', 'approve', 'unapprove', 'download', 'view-details'])

// Composables
const memoryStudio = useMemoryStudio()
const { 
  getFirstAssetThumbnail, 
  formatDate, 
  getStatusText, 
  getStatusBadgeClass, 
  getStatusIcon 
} = memoryStudio
</script>
