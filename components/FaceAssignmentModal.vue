<script setup>
import { ref, computed, watch } from 'vue'
import { useRelationshipOptions } from '~/composables/useRelationshipOptions'

// Get shared relationship options
const { relationshipOptions } = useRelationshipOptions()

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  faces: {
    type: Array,
    default: () => []
  },
  existingPeople: {
    type: Array,
    default: () => []
  },
  mode: {
    type: String,
    default: 'assign', // 'assign' or 'change'
    validator: (value) => ['assign', 'change'].includes(value)
  }
})

const emit = defineEmits(['update:visible', 'assign', 'create-person', 'remove', 'skip', 'skip-permanently'])

const supabase = useNuxtApp().$supabase

// Current face being processed
const currentIndex = ref(0)
const currentFace = computed(() => props.faces[currentIndex.value])

// Assignment UI state
const assignmentMode = ref('suggest') // 'suggest', 'select', 'create'
const selectedPersonId = ref(null)
const newPersonName = ref('')
const newPersonDisplayName = ref('')
const newPersonRelationship = ref('')
const isProcessing = ref(false)
const errorMessage = ref('')

// Face image URL
const faceImageUrl = computed(() => {
  if (!currentFace.value) return null
  return currentFace.value.assets?.thumbnail_url || currentFace.value.assets?.storage_url
})

// Calculate bounding box position for object-contain images
const boundingBoxStyle = computed(() => {
  if (!currentFace.value?.bounding_box) return null
  
  const box = currentFace.value.bounding_box
  
  // AWS Rekognition bounding box coordinates are normalized (0-1)
  // These are relative to the actual image dimensions
  // When using object-contain, we need to account for letterboxing/pillarboxing
  
  // Add padding around the bounding box (expand by 15% on each side)
  const padding = 0.15
  const left = Math.max(0, (box.Left || 0) - (box.Width || 0) * padding) * 100
  const top = Math.max(0, (box.Top || 0) - (box.Height || 0) * padding) * 100
  const width = Math.min(1, (box.Width || 0) * (1 + padding * 2)) * 100
  const height = Math.min(1, (box.Height || 0) * (1 + padding * 2)) * 100
  
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`
  }
})

// Suggestions for current face
const suggestions = computed(() => {
  return currentFace.value?.suggestions || []
})

// Has suggestions
const hasSuggestions = computed(() => {
  return suggestions.value && suggestions.value.length > 0
})

// Best suggestion (highest similarity)
const bestSuggestion = computed(() => {
  if (!hasSuggestions.value) return null
  return suggestions.value[0]
})

// Progress
const progress = computed(() => {
  if (props.faces.length === 0) return 0
  return Math.round(((currentIndex.value + 1) / props.faces.length) * 100)
})

// Reset state when modal opens
watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentIndex.value = 0
    assignmentMode.value = hasSuggestions.value ? 'suggest' : 'create'
    selectedPersonId.value = null
    newPersonName.value = ''
    newPersonDisplayName.value = ''
    newPersonRelationship.value = ''
    errorMessage.value = ''
  }
})

// Watch for faces array changes - if current face is removed, we're already on next face
watch(() => props.faces.length, (newLength, oldLength) => {
  if (newLength < oldLength && newLength === 0) {
    // All faces processed - close modal
    emit('update:visible', false)
  } else if (newLength < oldLength) {
    // A face was removed (processed), currentIndex now points to next face
    // Just reset the mode and selection for the new current face
    assignmentMode.value = hasSuggestions.value ? 'suggest' : 'create'
    selectedPersonId.value = null
    errorMessage.value = ''
  }
})

// Navigate to next face
const nextFace = () => {
  if (currentIndex.value < props.faces.length - 1) {
    currentIndex.value++
    assignmentMode.value = hasSuggestions.value ? 'suggest' : 'create'
    selectedPersonId.value = null
    errorMessage.value = ''
  } else {
    // All faces processed
    emit('update:visible', false)
  }
}

// Confirm suggestion
const confirmSuggestion = async () => {
  if (!bestSuggestion.value) return
  
  isProcessing.value = true
  errorMessage.value = ''
  
  try {
    await emit('assign', {
      faceId: currentFace.value.id,
      personGroupId: bestSuggestion.value.personId,
      confidence: bestSuggestion.value.similarity / 100
    })
    
    // Parent will remove this face from array, watcher will handle UI update
  } catch (error) {
    console.error('Error confirming suggestion:', error)
    errorMessage.value = 'Failed to assign face. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

// Reject suggestion - show person selector
const rejectSuggestion = () => {
  assignmentMode.value = 'select'
}

// Assign to selected person
const assignToSelectedPerson = async () => {
  if (!selectedPersonId.value) {
    errorMessage.value = 'Please select a person'
    return
  }
  
  isProcessing.value = true
  errorMessage.value = ''
  
  try {
    await emit('assign', {
      faceId: currentFace.value.id,
      personGroupId: selectedPersonId.value,
      confidence: 1.0
    })
    
    // Parent will remove this face from array, watcher will handle UI update
  } catch (error) {
    console.error('Error assigning to person:', error)
    errorMessage.value = 'Failed to assign face. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

// Create new person
const createNewPerson = async () => {
  if (!newPersonName.value.trim()) {
    errorMessage.value = 'Please enter a person name'
    return
  }
  
  isProcessing.value = true
  errorMessage.value = ''
  
  try {
    await emit('create-person', {
      faceId: currentFace.value.id,
      personName: newPersonName.value.trim(),
      displayName: newPersonDisplayName.value.trim() || newPersonName.value.trim(),
      relationship: newPersonRelationship.value.trim() || null
    })
    
    // Reset form
    newPersonName.value = ''
    newPersonDisplayName.value = ''
    newPersonRelationship.value = ''
    
    // Parent will remove this face from array, watcher will handle UI update
  } catch (error) {
    console.error('Error creating person:', error)
    errorMessage.value = 'Failed to create person. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

// Skip face (temporary - face will appear again later)
const skipFace = () => {
  emit('skip', currentFace.value.id)
  // For temporary skip, manually advance since face stays in array
  nextFace()
}

// Skip face permanently (will never ask about this face again)
const skipFacePermanently = () => {
  emit('skip-permanently', currentFace.value.id)
  // Parent will remove this face from array, watcher will handle UI update
}

// Remove assignment (for 'change' mode)
const removeAssignment = async () => {
  isProcessing.value = true
  errorMessage.value = ''
  
  try {
    await emit('remove', currentFace.value.id)
    emit('update:visible', false)
  } catch (error) {
    console.error('Error removing assignment:', error)
    errorMessage.value = 'Failed to remove assignment. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

// Close modal
const closeModal = () => {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :closable="!isProcessing"
    class="w-[95vw] max-w-2xl"
  >
    <template #header>
      <div class="flex items-center justify-between w-full pr-8">
        <h3 class="text-xl font-bold text-gray-900">
          {{ mode === 'assign' ? 'Assign Faces to People' : 'Change Face Assignment' }}
        </h3>
        <div v-if="mode === 'assign'" class="text-sm text-gray-600">
          {{ currentIndex + 1 }} of {{ faces.length }}
        </div>
      </div>
    </template>

    <div v-if="currentFace" class="space-y-6">
      <!-- Progress Bar -->
      <div v-if="mode === 'assign' && faces.length > 1" class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-brand-primary h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {{ errorMessage }}
      </div>

      <!-- Face Image -->
      <div class="flex justify-center">
        <div class="relative inline-block">
          <img
            :src="faceImageUrl"
            alt="Detected face"
            class="max-w-full max-h-64 rounded-lg shadow-lg border-4 border-gray-200 object-contain bg-gray-50"
            style="min-height: 256px;"
          />
          
          <!-- Face Bounding Box Overlay -->
          <div 
            v-if="boundingBoxStyle"
            class="absolute border-2 border-brand-highlight rounded-lg pointer-events-none"
            :style="boundingBoxStyle"
          >
          </div>
          
          <div class="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded z-10">
            {{ Math.round(currentFace.confidence * 100) }}% confidence
          </div>
          
          <!-- Debug Info: Asset ID -->
          <div class="absolute bottom-2 left-2 bg-blue-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded font-mono z-10" style="font-size: 10px;">
            Asset: {{ currentFace.asset_id || currentFace.assets?.id || 'N/A' }}
          </div>
        </div>
      </div>

      <!-- Suggestion Mode -->
      <div v-if="assignmentMode === 'suggest' && hasSuggestions" class="space-y-4">
        <div class="text-center">
          <h4 class="text-lg font-semibold text-gray-900 mb-2">Is this {{ bestSuggestion.name }}?</h4>
          <p class="text-sm text-gray-600">
            {{ Math.round(bestSuggestion.similarity) }}% match confidence
          </p>
        </div>

        <div class="flex gap-3 justify-center">
          <Button
            @click="confirmSuggestion"
            :disabled="isProcessing"
            label="Yes, that's them"
            icon="pi pi-check"
            class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-6 py-2 rounded"
          />
          <Button
            @click="rejectSuggestion"
            :disabled="isProcessing"
            label="No, select different person"
            icon="pi pi-times"
            class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-6 py-2 rounded"
          />
          <Button
            @click="assignmentMode = 'create'"
            :disabled="isProcessing"
            label="Create new person"
            icon="pi pi-user-plus"
            class="bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white border-0 px-6 py-2 rounded"
          />
        </div>

        <div class="flex justify-center gap-3">
          <Button
            @click="skipFace"
            :disabled="isProcessing"
            label="Skip for now"
            icon="pi pi-forward"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0 px-6 py-2 rounded"
          />
          <Button
            @click="skipFacePermanently"
            :disabled="isProcessing"
            label="Skip Permanently"
            icon="pi pi-ban"
            class="bg-red-100 hover:bg-red-200 text-red-700 border-0 px-6 py-2 rounded"
          />
        </div>
      </div>

      <!-- Select Person Mode -->
      <div v-if="assignmentMode === 'select'" class="space-y-4">
        <div class="text-center">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Who is this person?</h4>
        </div>

        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">Select existing person:</label>
          <Dropdown
            v-model="selectedPersonId"
            :options="existingPeople"
            optionLabel="name"
            optionValue="id"
            placeholder="Choose a person..."
            class="w-full"
            filter
          />
        </div>

        <div class="flex gap-3 justify-center">
          <Button
            @click="assignToSelectedPerson"
            :disabled="isProcessing || !selectedPersonId"
            label="Assign"
            icon="pi pi-check"
            class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-6 py-2 rounded"
          />
          <Button
            @click="assignmentMode = 'create'"
            :disabled="isProcessing"
            label="Create new person instead"
            icon="pi pi-user-plus"
            class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-6 py-2 rounded"
          />
        </div>

        <div class="flex justify-center gap-3">
          <Button
            @click="skipFace"
            :disabled="isProcessing"
            label="Skip for now"
            icon="pi pi-forward"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0 px-6 py-2 rounded"
          />
          <Button
            @click="skipFacePermanently"
            :disabled="isProcessing"
            label="Skip Permanently"
            icon="pi pi-ban"
            class="bg-red-100 hover:bg-red-200 text-red-700 border-0 px-6 py-2 rounded"
          />
        </div>
      </div>

      <!-- Create Person Mode -->
      <div v-if="assignmentMode === 'create'" class="space-y-4">
        <div class="text-center">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Create a new person</h4>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Person's name *</label>
            <InputText
              v-model="newPersonName"
              placeholder="e.g., Grandma Sarah"
              class="w-full"
              :disabled="isProcessing"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Display name (optional)</label>
            <InputText
              v-model="newPersonDisplayName"
              placeholder="e.g., Sarah"
              class="w-full"
              :disabled="isProcessing"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Relationship (optional)</label>
            <Dropdown
              v-model="newPersonRelationship"
              :options="relationshipOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select relationship..."
              class="w-full"
              :disabled="isProcessing"
              :filter="true"
              filterPlaceholder="Search relationships..."
            />
          </div>
        </div>

        <div class="flex gap-3 justify-center">
          <Button
            @click="createNewPerson"
            :disabled="isProcessing || !newPersonName.trim()"
            label="Create & Assign"
            icon="pi pi-check"
            class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-6 py-2 rounded"
          />
          <Button
            v-if="existingPeople.length > 0"
            @click="assignmentMode = 'select'"
            :disabled="isProcessing"
            label="Select existing instead"
            icon="pi pi-users"
            class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-6 py-2 rounded"
          />
        </div>

        <div class="flex justify-center gap-3">
          <Button
            @click="skipFace"
            :disabled="isProcessing"
            label="Skip for now"
            icon="pi pi-forward"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0 px-6 py-2 rounded"
          />
          <Button
            @click="skipFacePermanently"
            :disabled="isProcessing"
            label="Skip Permanently"
            icon="pi pi-ban"
            class="bg-red-100 hover:bg-red-200 text-red-700 border-0 px-6 py-2 rounded"
          />
        </div>
      </div>

      <!-- Remove Assignment (Change Mode) -->
      <div v-if="mode === 'change'" class="flex justify-center pt-4 border-t">
        <Button
          @click="removeAssignment"
          :disabled="isProcessing"
          label="Remove this face assignment"
          icon="pi pi-trash"
          class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-6 py-2 rounded"
        />
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-600">
      No faces to assign
    </div>
  </Dialog>
</template>

<style scoped>
.p-dialog-header {
  padding: 1.5rem;
}

.p-dialog-content {
  padding: 1.5rem;
}
</style>
