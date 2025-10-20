<template>
  <div class="bg-white shadow-elevation-2 border border-gray-200 rounded overflow-hidden">
    <!-- Card Header -->
    <div class="relative flex items-center justify-between h-14 px-4 bg-gray-50 border-b border-gray-200">
      <!-- Icon and Title -->
      <div class="flex items-center gap-2">
        <i class="pi pi-book w-5 h-5 text-brand-highlight flex-shrink-0"></i>
        <span class="text-sm font-medium text-gray-900 truncate">
          {{ book.ai_supplemental_prompt || 'Memory Book' }}
        </span>
      </div>
      
      <!-- Status Badge -->
      <div :class="getStatusBadgeClass(book.status)" class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium">
        <i :class="getStatusIcon(book.status)" class="text-xs"></i>
        <span class="hidden sm:inline">{{ getStatusText(book.status) }}</span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-4 h-56 flex flex-col">
      <!-- Magic Story Preview -->
      <div v-if="book.magic_story" class="flex-1 p-3 bg-gray-50 border border-gray-200 mb-3">
        <div class="flex items-start gap-2 h-full">
          <Sparkle class="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
          <p class="text-xs text-gray-600 leading-relaxed overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical;">
            {{ book.magic_story.length > 150 ? book.magic_story.slice(0, 150) + '...' : book.magic_story }}
          </p>
        </div>
      </div>

      <!-- Photo Thumbnail -->
      <div v-else-if="!book.magic_story && getFirstAssetThumbnail(book)" class="flex-1 mb-3">
        <div class="relative w-full h-32 overflow-hidden border border-gray-200">
          <img 
            :src="getFirstAssetThumbnail(book)" 
            :alt="book.ai_supplemental_prompt || 'Memory Book'"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Key Info -->
      <div class="space-y-2 text-xs mt-auto">
        <div class="flex justify-between items-center">
          <span class="text-gray-500">Created:</span>
          <span class="text-gray-700">{{ formatDate(book.created_at) }}</span>
        </div>
        <div v-if="book.created_from_assets" class="flex justify-between items-center">
          <span class="text-gray-500">Photos:</span>
          <span class="bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            {{ book.created_from_assets.length }}
          </span>
        </div>
      </div>

      <!-- Review Notes -->
      <div v-if="book.review_notes" class="mt-2 p-2 bg-amber-50 border border-amber-200">
        <p class="text-xs text-amber-900 leading-relaxed overflow-hidden" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">{{ book.review_notes }}</p>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="border-t border-gray-200 bg-gray-50 px-4 py-3 h-16 flex items-center">
      <div class="flex items-center justify-between gap-2 w-full">
        <!-- Primary Action Button -->
        <div v-if="book.status === 'draft'" class="flex-1">
          <button
            data-testid="compose-button"
            class="w-full bg-brand-highlight hover:bg-brand-secondary-dark text-white text-sm font-medium uppercase tracking-wider py-2 px-3 rounded shadow-elevation-2 hover:shadow-elevation-3"
            @click="$emit('generate', book)"
          >
            <Wand2 class="w-4 h-4 inline mr-2" />
            {{ book.magic_story ? 'CREATE STORY' : 'COMPOSE' }}
          </button>
        </div>
        
        <div v-else-if="book.status === 'ready'" class="flex-1">
          <button
            data-testid="approve-button"
            class="w-full bg-brand-dialog-primary hover:bg-brand-dialog-primary-hover text-white text-sm font-medium uppercase tracking-wider py-2 px-3 rounded shadow-elevation-2 hover:shadow-elevation-3"
            @click="$emit('approve', book.id)"
            v-tooltip.top="'Approve this Book and I\'ll Send it Out For You'"
          >
            <i class="pi pi-check mr-2"></i>
            PRINT AND MAIL
          </button>
        </div>
        
        <div v-else-if="book.status === 'approved'" class="flex-1">
          <button
            data-testid="unapprove-button"
            class="w-full bg-brand-warning hover:bg-brand-warning-dark text-white text-sm font-medium uppercase tracking-wider py-2 px-3 rounded shadow-elevation-2 hover:shadow-elevation-3"
            @click="$emit('unapprove', book.id)"
          >
            <i class="pi pi-undo mr-2"></i>
            UNAPPROVE
          </button>
        </div>
        
        <div v-else-if="book.status === 'background_ready'" class="flex-1">
          <button
            data-testid="recreate-button"
            class="w-full bg-gray-300 text-gray-600 text-sm font-medium uppercase tracking-wider py-2 px-3 rounded cursor-not-allowed"
            disabled
          >
            <i class="pi pi-refresh mr-2"></i>
            PROCESSING
          </button>
        </div>
        
        <!-- Secondary Actions -->
        <div class="flex gap-2">
          <button
            data-testid="view-button"
            class="p-2 text-gray-600 hover:bg-gray-100"
            @click="$emit('download', book)"
            title="View"
          >
            <i class="pi pi-external-link text-lg"></i>
          </button>
          
          <button
            data-testid="details-button"
            class="p-2 text-gray-600 hover:bg-gray-100"
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
