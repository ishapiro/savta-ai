<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-brand-primary bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
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
              Assign Face to Person
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              Choose which person this face belongs to, or create a new person.
            </p>
          </div>
        </div>

        <div class="mt-4 sm:mt-6">
          <!-- Face Preview -->
          <div class="mb-4 sm:mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Face to Assign</h4>
            <div class="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-6">
              <div class="w-full max-w-xs h-48 sm:w-48 sm:h-64 bg-brand-card rounded-lg overflow-hidden flex-shrink-0 relative">
                <img
                  v-if="face?.asset_url"
                  :src="face.asset_url"
                  :alt="`Photo with Face ${faceNumber}`"
                  class="w-full h-full object-contain"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="pi pi-user text-brand-primary/40 text-lg sm:text-xl"></i>
                </div>
                
                <!-- Face Bounding Box Overlay -->
                <div 
                  v-if="face?.bounding_box"
                  class="absolute border-2 border-brand-highlight rounded"
                  :style="boundingBoxStyle"
                >
                  <!-- Face Number Badge in Center of Bounding Box -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="bg-brand-highlight text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white">
                      {{ faceNumber }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-center sm:text-left">
                <p class="text-sm text-gray-600">
                  <strong>Confidence:</strong> {{ Math.round((face?.confidence || 0) * 100) }}%
                </p>
                <p class="text-sm text-gray-600">
                  <strong>Detected:</strong> {{ formatDate(face?.created_at) }}
                </p>
                <p class="text-sm text-gray-600 mt-2">
                  <strong>Face Number:</strong> {{ faceNumber }}
                </p>
              </div>
            </div>
          </div>

          <!-- Assignment Options -->
          <div class="space-y-3 sm:space-y-4">
            <!-- Existing People -->
            <div v-if="personGroups.length > 0">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Assign to Existing Person</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="person in personGroups"
                  :key="person.id"
                  class="relative border border-brand-primary/20 rounded-lg p-3 cursor-pointer hover:border-brand-highlight hover:bg-brand-accent/10 transition-colors"
                  :class="{ 'border-brand-highlight bg-brand-accent/20': selectedPersonId === person.id }"
                  @click="selectPerson(person.id)"
                >
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                                          <div class="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center">
                      <i class="pi pi-user text-brand-secondary"></i>
                    </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ person.display_name || person.name }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ person.face_count || 0 }} photos
                      </p>
                    </div>
                    <div v-if="selectedPersonId === person.id" class="flex-shrink-0">
                      <i class="pi pi-check text-brand-highlight"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Create New Person -->
            <div class="border-t border-brand-primary/20 pt-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Or Create New Person</h4>
              <div class="space-y-3">
                <input
                  v-model="newPersonName"
                  type="text"
                  placeholder="Enter person's name..."
                  class="block w-full border-brand-primary/20 rounded-md shadow-sm focus:ring-brand-highlight focus:border-brand-highlight text-sm"
                />
                <div class="flex items-center space-x-3">
                  <input
                    v-model="createNewPerson"
                    type="checkbox"
                    class="h-4 w-4 text-brand-highlight focus:ring-brand-highlight border-brand-primary/20 rounded"
                  />
                  <label class="text-sm text-gray-700">
                    Create new person: "{{ newPersonName || 'Enter name' }}"
                  </label>
                </div>
              </div>
            </div>

            <!-- Confidence Slider -->
            <div class="border-t border-brand-primary/20 pt-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Assignment Confidence</h4>
              <div class="space-y-2">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Low</span>
                  <span>{{ Math.round(assignmentConfidence * 100) }}%</span>
                  <span>High</span>
                </div>
                <input
                  v-model="assignmentConfidence"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <p class="text-xs text-gray-500">
                  Higher confidence means you're more certain this face belongs to the selected person.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 sm:mt-6 sm:flex sm:flex-row-reverse">
                      <button
              type="button"
              @click="handleAssign"
              :disabled="!canAssign || assigning"
              class="w-full inline-flex justify-center rounded-full border border-transparent shadow-sm px-3 sm:px-4 py-2 bg-brand-highlight text-xs sm:text-sm font-bold text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-highlight sm:ml-3 sm:w-auto transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="assigning" class="pi pi-spin pi-spinner mr-2"></i>
              {{ createNewPerson ? 'Create & Assign' : 'Assign Face' }}
            </button>
                      <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-full border border-brand-primary/20 shadow-sm px-3 sm:px-4 py-2 bg-white text-xs sm:text-sm font-bold text-brand-primary hover:bg-brand-accent/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-highlight sm:mt-0 sm:w-auto transition-all duration-200"
            >
              Cancel
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
// Using PrimeVue icons instead of Heroicons

// Props
const props = defineProps({
  face: {
    type: Object,
    required: true
  },
  personGroups: {
    type: Array,
    default: () => []
  },
  faceNumber: {
    type: Number,
    default: null
  }
});

// Emits
const emit = defineEmits(['close', 'assign', 'create-person-and-assign']);

// Form state
const selectedPersonId = ref('');
const createNewPerson = ref(false);
const newPersonName = ref('');
const assignmentConfidence = ref(0.9);
const assigning = ref(false);

// Computed
const canAssign = computed(() => {
  if (createNewPerson.value) {
    return newPersonName.value.trim().length > 0;
  }
  return selectedPersonId.value !== '';
});

// Compute the bounding box overlay style for the face preview
const boundingBoxStyle = computed(() => {
  if (!props.face?.bounding_box) return {};
  
  const box = props.face.bounding_box;
  
  // AWS Rekognition bounding box coordinates are normalized (0-1)
  // Convert to percentages for CSS positioning
  const left = (box.Left || 0) * 100;
  const top = (box.Top || 0) * 100;
  const width = (box.Width || 0) * 100;
  const height = (box.Height || 0) * 100;
  
  // Position the bounding box overlay
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`
  };
});

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString();
};

// Handle assignment
const handleAssign = async () => {
  if (!canAssign.value) return;

  assigning.value = true;

  try {
    // Extract reactive variables to local variables for better reliability
    const face = props.face;
    const faceId = face?.face_id; // Fixed: use face_id instead of id
    const personId = selectedPersonId.value;
    const confidence = assignmentConfidence.value;
    const createNew = createNewPerson.value;
    const personName = newPersonName.value.trim();
    
    console.log('handleAssign - extracted values:', {
      face,
      faceId,
      personId,
      confidence,
      createNew,
      personName
    });
    console.log('handleAssign - face object keys:', Object.keys(face || {}));
    console.log('handleAssign - face object values:', Object.entries(face || {}).map(([key, value]) => `${key}: ${value}`));
    
    if (createNew) {
      // Emit special event for creating new person and assigning face
      emit('create-person-and-assign', {
        faceId: faceId,
        personName: personName,
        confidence: confidence
      });
    } else {
      // Assign to existing person
      if (!personId) {
        throw new Error('No person selected for assignment');
      }
      console.log('Emitting assign with:', {
        faceId: faceId,
        personId: personId,
        confidence: confidence
      });
      emit('assign', faceId, personId, confidence);
    }
  } catch (error) {
    console.error('Error assigning face:', error);
  } finally {
    assigning.value = false;
  }
};

// Person selection
const selectPerson = (personId) => {
  console.log('selectPerson called with:', personId);
  selectedPersonId.value = personId;
  console.log('selectedPersonId set to:', selectedPersonId.value);
};

// Watch for changes
watch(createNewPerson, (newValue) => {
  if (newValue) {
    selectedPersonId.value = '';
  }
});

watch(selectedPersonId, (newValue) => {
  if (newValue) {
    createNewPerson.value = false;
  }
});
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #41706C;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #41706C;
  cursor: pointer;
  border: none;
}
</style>
