<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-brand-primary bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 sm:px-6 py-4 border-b border-brand-highlight/20">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-brand-accent rounded-full flex items-center justify-center">
                  <i class="pi pi-user text-brand-secondary text-lg sm:text-xl"></i>
                </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ person?.display_name || person?.name }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ person?.relationship || 'Person' }} • {{ personFaces.length }} photos
                </p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                          <span class="sr-only">Close</span>
            <i class="pi pi-times text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="bg-white px-4 sm:px-6 py-4">
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <i class="pi pi-spin pi-spinner text-2xl text-brand-highlight"></i>
            <span class="ml-3 text-gray-600">Loading photos...</span>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <i class="pi pi-exclamation-triangle text-red-400"></i>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error loading photos</h3>
                <p class="mt-1 text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Photos Grid -->
          <div v-else>
            <div v-if="personFaces.length === 0" class="text-center py-8 sm:py-12">
              <i class="pi pi-image text-4xl text-gray-400"></i>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No photos yet</h3>
              <p class="mt-1 text-sm text-gray-500">
                This person doesn't have any assigned faces yet.
              </p>
            </div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              <div
                v-for="face in personFaces"
                :key="face.id"
                class="relative group cursor-pointer"
                @click="viewPhoto(face)"
              >
                <div class="aspect-square bg-brand-card rounded-lg overflow-hidden">
                  <img
                    v-if="face.asset_url"
                    :src="face.asset_url"
                    :alt="`Photo of ${person?.display_name || person?.name}`"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <i class="pi pi-image text-brand-primary/40 text-lg sm:text-xl"></i>
                  </div>
                </div>
                
                <!-- Face confidence indicator -->
                <div class="absolute top-1 right-1">
                  <div class="bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                    {{ Math.round((face.confidence || 0) * 100) }}%
                  </div>
                </div>

                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-brand-secondary bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <span class="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                    View
                  </span>
                </div>
              </div>
            </div>

            <!-- Load More Button -->
            <div v-if="hasMoreFaces" class="mt-4 sm:mt-6 text-center">
              <button
                @click="loadMoreFaces"
                :disabled="loadingMore"
                class="inline-flex items-center border-0 px-6 py-2 bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-sm font-medium text-white tracking-wider uppercase focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-elevation-2 hover:shadow-elevation-3"
              >
                <i v-if="loadingMore" class="pi pi-spin pi-spinner mr-2"></i>
                LOAD MORE PHOTOS
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-brand-background px-4 sm:px-6 py-3 border-t border-brand-highlight/20">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-500">
              {{ personFaces.length }} photos of {{ person?.display_name || person?.name }}
            </div>
            <div class="flex space-x-2">
              <button
                @click="exportPersonData"
                class="inline-flex items-center border-0 px-6 py-2 bg-brand-dialog-primary hover:bg-brand-dialog-primary-hover text-sm font-medium text-white tracking-wider uppercase focus:outline-none rounded shadow-elevation-2 hover:shadow-elevation-3"
              >
                <i class="pi pi-download mr-2"></i>
                EXPORT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Detail Modal -->
    <PhotoDetailModal
      v-if="showPhotoDetail"
      :face="selectedFace"
      :person="person"
      @close="closePhotoDetail"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
// Using PrimeVue icons instead of Heroicons

// Get Supabase client
const supabase = useNuxtApp().$supabase;

// Props
const props = defineProps({
  person: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['close']);

// State
const personFaces = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref(null);
const hasMoreFaces = ref(true);
const showPhotoDetail = ref(false);
const selectedFace = ref(null);

// Load person's faces
const loadPersonFaces = async (limit = 24) => {
  try {
    loading.value = true;
    error.value = null;
    
    // Use Supabase RPC to get faces for this person
    const { data, error: dbError } = await supabase
      .rpc('find_faces_by_person', {
        person_group_id_param: props.person.id,
        limit_count: limit
      });
    
    if (dbError) {
      throw dbError;
    }
    
    personFaces.value = data || [];
    hasMoreFaces.value = personFaces.value.length >= limit;
  } catch (err) {
    error.value = err.message || 'Failed to load photos';
    console.error('Error loading person faces:', err);
  } finally {
    loading.value = false;
  }
};

// Load more faces
const loadMoreFaces = async () => {
  try {
    loadingMore.value = true;
    const currentCount = personFaces.value.length;
    const { data, error: dbError } = await supabase
      .rpc('find_faces_by_person', {
        person_group_id_param: props.person.id,
        limit_count: currentCount + 12
      });
    
    if (dbError) {
      throw dbError;
    }
    
    personFaces.value = data || [];
    hasMoreFaces.value = personFaces.value.length > currentCount;
  } catch (err) {
    console.error('Error loading more faces:', err);
  } finally {
    loadingMore.value = false;
  }
};

// View photo detail
const viewPhoto = (face) => {
  selectedFace.value = face;
  showPhotoDetail.value = true;
};

const closePhotoDetail = () => {
  showPhotoDetail.value = false;
  selectedFace.value = null;
};

// Export person data
const exportPersonData = () => {
  // Create a simple export of the person's data
  const data = {
    person: props.person,
    faces: personFaces.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.person.name || 'person'}-photos.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Watch for person changes
watch(() => props.person, (newPerson) => {
  if (newPerson) {
    loadPersonFaces();
  }
}, { immediate: true });

// Load data on mount
onMounted(() => {
  if (props.person) {
    loadPersonFaces();
  }
});
</script>
