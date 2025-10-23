<template>
  <div class="person-manager min-h-screen bg-brand-background">
    <!-- Header -->
          <div class="bg-white shadow-sm border-b border-brand-highlight/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">People in Your Photos</h1>
            <p class="mt-1 text-sm text-gray-500">
              Identify and organize the people in your photo collection
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <button
              @click="showCreatePersonModal = true"
              class="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-full shadow transition-all duration-200 text-white bg-brand-highlight hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-highlight"
            >
              <i class="pi pi-plus mr-2"></i>
              Add New Person
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <i class="pi pi-spin pi-spinner text-2xl text-brand-highlight"></i>
        <span class="ml-3 text-gray-600">Loading people and faces...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <i class="pi pi-exclamation-triangle text-red-400"></i>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading data</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6 sm:space-y-8">
        <!-- Unassigned Faces Alert -->
        <div v-if="unassignedFaces.length > 0" class="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="pi pi-info-circle text-blue-400 text-xl"></i>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-blue-800">
                {{ unassignedFaces.length }} {{ unassignedFaces.length === 1 ? 'face needs' : 'faces need' }} your attention
              </p>
              <p class="mt-1 text-sm text-blue-700">
                These faces were detected but not yet identified. Click on a face below to assign it to a person.
              </p>
            </div>
            <div class="ml-3">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {{ unassignedFaces.length }}
              </span>
            </div>
          </div>
        </div>

        <!-- Unassigned Faces Section -->
        <div v-if="unassignedFaces.length > 0" class="bg-white rounded-lg shadow">
          <div class="px-4 sm:px-6 py-4 border-b border-brand-highlight/20">
            <h2 class="text-lg font-medium text-gray-900">Faces Awaiting Assignment</h2>
            <p class="mt-1 text-sm text-gray-500">
              Click on a face to identify who it is
            </p>
          </div>
          
          <div class="p-4 sm:p-6">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div
                v-for="(face, index) in unassignedFaces"
                :key="face.id"
                class="relative group cursor-pointer"
                @click="openAssignmentModal([face])"
              >
                <div class="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-brand-highlight transition-colors">
                <img
                  :src="face.assets?.thumbnail_url || face.assets?.storage_url"
                  :alt="`Unassigned face ${index + 1}`"
                  class="w-full h-full object-contain bg-gray-100"
                />
                </div>
                <div class="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Assign
                </div>
                <div class="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {{ Math.round(face.confidence * 100) }}%
                </div>
              </div>
            </div>
            
            <div class="mt-4 sm:mt-6 text-center">
              <button
                @click="loadMoreUnassignedFaces"
                class="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-full border border-brand-primary/20 text-brand-primary bg-white hover:bg-brand-accent/10 transition-all duration-200"
              >
                Load More Faces
              </button>
            </div>
          </div>
        </div>

        <!-- People Section -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-4 sm:px-6 py-4 border-b border-brand-highlight/20">
            <h2 class="text-lg font-medium text-gray-900">Identified People</h2>
            <p class="mt-1 text-sm text-gray-500">
              {{ personGroups.length }} people identified in your collection
            </p>
          </div>
          
          <div v-if="personGroups.length === 0" class="p-6 sm:p-8 text-center">
            <i class="pi pi-users text-4xl text-gray-400"></i>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No people identified yet</h3>
            <p class="mt-1 text-sm text-gray-500">
              Start by adding a person and then assigning faces to them.
            </p>
          </div>
          
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
            <div
              v-for="person in personGroups"
              :key="person.id"
              class="bg-brand-card rounded-lg p-3 sm:p-4 hover:bg-brand-accent/20 transition-colors cursor-pointer"
              @click="viewPerson(person)"
            >
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 bg-brand-accent rounded-full flex items-center justify-center">
                    <i class="pi pi-user text-brand-secondary text-lg sm:text-xl"></i>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ person.display_name || person.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ person.face_count || 0 }} photos
                  </p>
                  <p v-if="person.relationship" class="text-xs text-gray-400">
                    {{ person.relationship }}
                  </p>
                </div>
                <div class="flex-shrink-0">
                  <button
                    @click.stop="editPerson(person)"
                    class="text-brand-primary/60 hover:text-brand-secondary"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Person Modal -->
    <PersonModal
      v-if="showCreatePersonModal || showEditPersonModal"
      :person="editingPerson"
      :is-edit="showEditPersonModal"
      @close="closePersonModal"
      @save="savePerson"
    />

    <!-- Face Assignment Modal (Rekognition-based) -->
    <FaceAssignmentModal
      v-model:visible="showNewFaceAssignmentModal"
      :faces="facesToAssign"
      :existingPeople="personGroups"
      @assign="handleFaceAssignment"
      @create-person="handleCreatePersonFromFace"
      @remove="handleRemoveFaceAssignment"
      @skip="handleSkipFace"
    />

    <!-- Person Gallery Modal -->
    <PersonGalleryModal
      v-if="showPersonGalleryModal"
      :person="selectedPerson"
      @close="closePersonGalleryModal"
    />

    <!-- Clear All Assignments Confirmation Dialog -->
    <Dialog
      v-model:visible="showClearConfirmDialog"
      modal
      header="Clear All Face Assignments?"
      :style="{ width: '90vw', maxWidth: '400px' }"
      class="mx-auto"
    >
      <div class="space-y-4">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-800">
            <strong>Warning:</strong> This will remove all face-to-person assignments in your database. Unassigned faces will reappear in the unassigned faces section.
          </p>
        </div>
        <p class="text-sm text-gray-600">
          This is useful for testing or if the auto-match assignments need to be redone.
        </p>
      </div>
      <template #footer>
        <button
          @click="showClearConfirmDialog = false"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-highlight"
        >
          Cancel
        </button>
        <button
          @click="confirmClearAllAssignments"
          :disabled="isClearing"
          class="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="isClearing" class="pi pi-spin pi-spinner mr-2"></i>
          {{ isClearing ? 'Clearing...' : 'Clear All Assignments' }}
        </button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
// Using PrimeVue icons instead of Heroicons

// Use the person management composable
const {
  personGroups,
  unassignedFaces,
  loading,
  error,
  fetchPersonGroups,
  fetchUnassignedFaces,
  createPersonGroup,
  updatePersonGroup,
  assignFaceToPerson: assignFaceToPersonApi
} = usePersonManagement();

// Get user from Supabase
const user = useSupabaseUser();

// Get Supabase client
const supabase = useNuxtApp().$supabase;

// Modal states
const showCreatePersonModal = ref(false);
const showEditPersonModal = ref(false);
const showPersonGalleryModal = ref(false);
const showClearConfirmDialog = ref(false); // New state for confirmation dialog

// Selected items
const editingPerson = ref(null);
const selectedPerson = ref(null);

// Clearing state
const isClearing = ref(false);

// New face assignment state (Rekognition-based)
const showNewFaceAssignmentModal = ref(false);
const facesToAssign = ref([]);

// Load data on mount
onMounted(async () => {
  console.log('Person manager mounted');
  try {
    await Promise.all([
      fetchPersonGroups(),
      fetchUnassignedFaces()
    ]);
    console.log('Person manager mounted, unassigned faces:', unassignedFaces.value);
  } catch (err) {
    console.error('Error loading initial data:', err);
  }
});

// Watch for user authentication changes
watch(user, async (newUser) => {
  console.log('User changed:', newUser);
  if (newUser) {
    try {
      await Promise.all([
        fetchPersonGroups(),
        fetchUnassignedFaces()
      ]);
      console.log('Data reloaded after user change, unassigned faces:', unassignedFaces.value);
    } catch (err) {
      console.error('Error reloading data after user change:', err);
    }
  }
}, { immediate: true });

// Person modal functions
const closePersonModal = () => {
  showCreatePersonModal.value = false;
  showEditPersonModal.value = false;
  editingPerson.value = null;
};

const editPerson = (person) => {
  editingPerson.value = { ...person };
  showEditPersonModal.value = true;
};

const savePerson = async (personData) => {
  try {
    if (showEditPersonModal.value) {
      await updatePersonGroup(editingPerson.value.id, personData);
    } else {
      await createPersonGroup(personData);
    }
    closePersonModal();
  } catch (err) {
    console.error('Error saving person:', err);
  }
};

// Person gallery functions
const viewPerson = (person) => {
  selectedPerson.value = person;
  showPersonGalleryModal.value = true;
};

const closePersonGalleryModal = () => {
  showPersonGalleryModal.value = false;
  selectedPerson.value = null;
};

// Load more unassigned faces
const loadMoreUnassignedFaces = async () => {
  try {
    const currentCount = unassignedFaces.value.length;
    await fetchUnassignedFaces(currentCount + 20);
  } catch (err) {
    console.error('Error loading more faces:', err);
  }
};

// Clear all face assignments
const confirmClearAllAssignments = async () => {
  try {
    isClearing.value = true;
    
    // Get session token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    console.log('🗑️ [Clear Assignments] Starting clear all face assignments...');
    
    // Try to call the RPC function
    const { data, error } = await supabase.rpc('clear_all_face_assignments');
    
    if (error) {
      console.warn('⚠️ [Clear Assignments] RPC error:', error.message);
      
      // If function doesn't exist, try to apply migrations first
      if (error.message.includes('does not exist') || error.message.includes('unknown')) {
        console.log('📦 [Clear Assignments] Function not found, attempting to apply migration...');
        
        const migrationResponse = await $fetch('/api/admin/apply-migrations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        console.log('✅ [Clear Assignments] Migration applied:', migrationResponse);
        
        // Retry the RPC call
        const { data: retryData, error: retryError } = await supabase.rpc('clear_all_face_assignments');
        
        if (retryError) {
          throw new Error(`Failed to clear assignments after migration: ${retryError.message}`);
        }
        
        console.log('✅ [Clear Assignments] Face assignments cleared successfully!');
        data = retryData;
      } else {
        throw error;
      }
    }
    
    console.log('✅ [Clear Assignments] Successfully cleared face assignments:', data);
    showClearConfirmDialog.value = false;
    
    // Refresh unassigned faces
    console.log('🔄 [Clear Assignments] Refreshing unassigned faces...');
    await fetchUnassignedFaces();
    await fetchPersonGroups();
    
    console.log('✅ [Clear Assignments] Complete!');
  } catch (err) {
    console.error('❌ [Clear Assignments] Error:', err);
    alert(`Error clearing assignments: ${err.message}`);
  } finally {
    isClearing.value = false;
  }
};


// Rekognition-based face assignment functions

// Open assignment modal with faces
const openAssignmentModal = (faces) => {
  facesToAssign.value = faces;
  showNewFaceAssignmentModal.value = true;
};

// Handle face assignment to existing person
const handleFaceAssignment = async ({ faceId, personGroupId, confidence }) => {
  try {
    console.log('🔗 Assigning face to person:', { faceId, personGroupId, confidence });
    
    // Get session token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    // Call API to assign face
    await $fetch('/api/ai/assign-face-to-person', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        faceId,
        personGroupId,
        confidence
      }
    });
    
    console.log('✅ Face assigned successfully');
    
    // Refresh data
    await Promise.all([
      fetchPersonGroups(),
      fetchUnassignedFaces()
    ]);
  } catch (error) {
    console.error('❌ Error assigning face:', error);
    throw error;
  }
};

// Handle creating new person from face
const handleCreatePersonFromFace = async ({ faceId, personName, displayName, relationship }) => {
  try {
    console.log('👤 Creating new person from face:', { faceId, personName });
    
    // Get session token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    // Call API to create person and assign face
    await $fetch('/api/ai/create-person-from-face', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        faceId,
        personName,
        displayName,
        relationship
      }
    });
    
    console.log('✅ Person created and face assigned successfully');
    
    // Refresh data
    await Promise.all([
      fetchPersonGroups(),
      fetchUnassignedFaces()
    ]);
  } catch (error) {
    console.error('❌ Error creating person from face:', error);
    throw error;
  }
};

// Handle removing face assignment
const handleRemoveFaceAssignment = async (faceId) => {
  try {
    console.log('🗑️ Removing face assignment:', faceId);
    
    // Get session token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    // Call API to remove assignment
    await $fetch('/api/ai/remove-face-assignment', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        faceId
      }
    });
    
    console.log('✅ Face assignment removed successfully');
    
    // Refresh data
    await Promise.all([
      fetchPersonGroups(),
      fetchUnassignedFaces()
    ]);
  } catch (error) {
    console.error('❌ Error removing face assignment:', error);
    throw error;
  }
};

// Handle skipping face
const handleSkipFace = (faceId) => {
  console.log('⏭️ Skipping face:', faceId);
  // For now, just log it. Could add skip tracking in database if needed
};
</script>
