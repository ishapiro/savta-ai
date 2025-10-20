<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :style="{ width: '90vw', maxWidth: '600px' }"
    :closable="false"
    :draggable="false"
    :resizable="false"
    class="photo-replacement-modal"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-gray-900">Select Photos to Replace</h3>
        <Button
          icon="pi pi-times"
          text
          rounded
          severity="secondary"
          @click="handleClose"
          class="p-1"
        />
      </div>
    </template>

    <div class="py-4">
      <!-- Photo Replacement Selector -->
      <PhotoReplacementSelector
        :existing-assets="existingAssets"
        :item-type="itemType"
        :model-value="localPhotosToReplace"
        @update:model-value="localPhotosToReplace = $event"
      />
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <Button
          label="CANCEL"
          @click="handleClose"
          class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-white border-0 w-full sm:w-auto px-4 py-2 text-sm font-medium tracking-wider rounded shadow-elevation-2 hover:shadow-elevation-3"
        />
        <Button
          label="SAVE REPLACEMENTS"
          @click="handleSave"
          :disabled="localPhotosToReplace.length === 0"
          class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 w-full sm:w-auto px-4 py-2 text-sm font-medium tracking-wider rounded shadow-elevation-2 hover:shadow-elevation-3"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import PhotoReplacementSelector from './PhotoReplacementSelector.vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  existingAssets: {
    type: Array,
    default: () => []
  },
  itemType: {
    type: String,
    default: 'memory book'
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:visible', 'update:modelValue', 'save'])

// Local state
const localPhotosToReplace = ref([...props.modelValue])

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  localPhotosToReplace.value = [...newValue]
}, { deep: true })

// Watch for changes to visible prop
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // Reset to current modelValue when modal opens
    localPhotosToReplace.value = [...props.modelValue]
  }
})

// Handle close
const handleClose = () => {
  emit('update:visible', false)
}

// Handle save
const handleSave = () => {
  emit('update:modelValue', [...localPhotosToReplace.value])
  emit('save', [...localPhotosToReplace.value])
  emit('update:visible', false)
}
</script>

<style scoped>
.photo-replacement-modal :deep(.p-dialog-content) {
  padding: 0;
}

.photo-replacement-modal :deep(.p-dialog-header) {
  padding: 1rem 1.5rem 0.5rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.photo-replacement-modal :deep(.p-dialog-footer) {
  padding: 0.5rem 1.5rem 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>
