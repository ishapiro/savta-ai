<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-6 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">
            {{ isEditing ? 'Edit Magic Memory Settings' : 'Create Memory Book' }}
          </h2>
          <p class="text-blue-100 text-sm">
            {{ isEditing ? 'Update your memory book settings' : 'Create a beautiful memory book with AI enhancements' }}
          </p>
        </div>
        <button @click="$emit('close')" class="text-white hover:text-blue-100 transition-colors" aria-label="Close dialog">
          ×
        </button>
      </div>
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input v-model="form.title" type="text" class="w-full px-4 py-2 border rounded" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Grid Layout</label>
          <select v-model="form.gridLayout" class="w-full px-4 py-2 border rounded">
            <option value="1x1">1 memory per page (1x1)</option>
            <option value="2x1">2 memories per page (2x1)</option>
            <option value="2x2">4 memories per page (2x2)</option>
            <option value="3x2">6 memories per page (3x2)</option>
            <option value="3x3">9 memories per page (3x3)</option>
            <option value="3x4">12 memories per page (3x4)</option>
            <option value="4x4">16 memories per page (4x4)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Memory Shape</label>
          <select v-model="form.memoryShape" class="w-full px-4 py-2 border rounded">
            <option value="original">Original (keep natural aspect ratio)</option>
            <option value="magic">Magic (AI chooses best shape)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Theme</label>
          <select v-model="form.theme" class="w-full px-4 py-2 border rounded">
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="vintage">Vintage</option>
            <option value="minimalist">Minimalist</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Memory Event</label>
          <select v-model="form.memoryEvent" class="w-full px-4 py-2 border rounded">
            <option value="">Select event</option>
            <option value="vacation">Vacation</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="graduation">Graduation</option>
            <option value="family_trip">Family Trip</option>
            <option value="custom">Other (custom)</option>
          </select>
          <input v-if="form.memoryEvent === 'custom'" v-model="form.customMemoryEvent" type="text" class="w-full mt-2 px-4 py-2 border rounded" placeholder="Enter custom event" />
        </div>
        <div class="flex items-center space-x-4">
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="form.aiBackground" />
            <span>AI Background</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="form.includeCaptions" />
            <span>AI Captions</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="form.includeTags" />
            <span>Photo Tags</span>
          </label>
        </div>
        <div class="flex justify-end space-x-2 pt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded bg-gray-100 text-gray-700">Cancel</button>
          <button type="submit" :disabled="loading" class="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-50">
            {{ isEditing ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  isEditing: Boolean,
  initialData: { type: Object, default: () => ({}) },
  loading: Boolean
})
const emit = defineEmits(['submit', 'close'])
const form = ref({
  title: '',
  theme: 'classic',
  memoryEvent: '',
  customMemoryEvent: '',
  aiBackground: true,
  includeCaptions: true,
  includeTags: true,
  gridLayout: '2x2',
  memoryShape: 'original'
})
watch(() => props.initialData, (val) => {
  if (val && Object.keys(val).length > 0) {
    form.value = {
      ...form.value,
      ...val
    }
  }
}, { immediate: true })
function handleSubmit() {
  emit('submit', {
    ...form.value,
    memoryEvent: form.value.memoryEvent === 'custom' ? form.value.customMemoryEvent : form.value.memoryEvent
  })
}
</script> 