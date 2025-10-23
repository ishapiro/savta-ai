<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-brand-primary bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="absolute top-0 right-0 pt-4 pr-4">
          <button
            @click="$emit('close')"
            class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span class="sr-only">Close</span>
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-brand-accent sm:mx-0">
            <i class="pi pi-user text-brand-secondary text-lg sm:text-xl"></i>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ isEdit ? 'Edit Person' : 'Add New Person' }}
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              {{ isEdit ? 'Update the person\'s information.' : 'Create a new person to organize your photos.' }}
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full border-brand-primary/20 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-sm"
              placeholder="e.g., Grandma, Mom, John"
            />
          </div>

          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              id="displayName"
              v-model="form.display_name"
              type="text"
              class="mt-1 block w-full border-brand-primary/20 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-sm"
              placeholder="e.g., Grandma Sarah, Mom, John Smith"
            />
            <p class="mt-1 text-xs text-gray-500">
              Optional. If not provided, the name will be used as display name.
            </p>
          </div>

          <!-- Relationship -->
          <div>
            <label for="relationship" class="block text-sm font-medium text-gray-700">
              Relationship
            </label>
            <select
              id="relationship"
              v-model="form.relationship"
              class="mt-1 block w-full border-brand-primary/20 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-sm"
            >
              <option
                v-for="option in relationshipOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="mt-1 block w-full border-brand-primary/20 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-sm"
              placeholder="Optional notes about this person..."
            ></textarea>
          </div>

          <!-- Primary Person Toggle -->
          <div class="flex items-center">
            <input
              id="isPrimary"
              v-model="form.is_primary_person"
              type="checkbox"
              class="h-4 w-4 text-brand-highlight focus:ring-brand-highlight border-brand-primary/20 rounded"
            />
            <label for="isPrimary" class="ml-2 block text-sm text-gray-900">
              Mark as primary person
            </label>
          </div>
          <p class="text-xs text-gray-500">
            Primary people are shown first and may be used for special features.
          </p>
        </form>

        <div class="mt-4 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <button
              type="button"
              @click="handleSubmit"
              :disabled="submitting"
              class="w-full inline-flex justify-center border-0 px-3 sm:px-4 py-2 bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-xs sm:text-sm font-bold text-white tracking-wider uppercase focus:outline-none sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-elevation-2 hover:shadow-elevation-3"
            >
              <i v-if="submitting" class="pi pi-spin pi-spinner mr-2"></i>
              {{ isEdit ? 'UPDATE PERSON' : 'CREATE PERSON' }}
            </button>
          <button
              type="button"
              @click="$emit('close')"
              class="w-full inline-flex justify-center border-0 px-3 sm:px-4 py-2 bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-xs sm:text-sm font-bold text-white tracking-wider uppercase focus:outline-none sm:w-auto rounded shadow-elevation-2 hover:shadow-elevation-3"
            >
              Cancel
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRelationshipOptions } from '~/composables/useRelationshipOptions';
// Using PrimeVue icons instead of Heroicons

// Get shared relationship options
const { relationshipOptions } = useRelationshipOptions();

// Props
const props = defineProps({
  person: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['close', 'save']);

// Form state
const submitting = ref(false);
const form = reactive({
  name: '',
  display_name: '',
  relationship: '',
  description: '',
  is_primary_person: false
});

// Watch for person prop changes (for editing)
watch(() => props.person, (newPerson) => {
  if (newPerson) {
    form.name = newPerson.name || '';
    form.display_name = newPerson.display_name || '';
    form.relationship = newPerson.relationship || '';
    form.description = newPerson.description || '';
    form.is_primary_person = newPerson.is_primary_person || false;
  } else {
    // Reset form for new person
    form.name = '';
    form.display_name = '';
    form.relationship = '';
    form.description = '';
    form.is_primary_person = false;
  }
}, { immediate: true });

// Handle form submission
const handleSubmit = async () => {
  if (!form.name.trim()) {
    return;
  }

  submitting.value = true;
  
  try {
    const personData = {
      name: form.name.trim(),
      display_name: form.display_name.trim() || form.name.trim(),
      relationship: form.relationship || null,
      description: form.description.trim() || null,
      is_primary_person: form.is_primary_person
    };

    emit('save', personData);
  } catch (error) {
    console.error('Error saving person:', error);
  } finally {
    submitting.value = false;
  }
};
</script>
