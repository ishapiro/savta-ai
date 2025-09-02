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
          <button
            @click="showCreatePersonModal = true"
            class="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-full shadow transition-all duration-200 text-white bg-brand-highlight hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-highlight"
          >
            <i class="pi pi-plus mr-2"></i>
            Add New Person
          </button>
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

        <!-- Unassigned Faces Section -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-4 sm:px-6 py-4 border-b border-brand-highlight/20">
            <h2 class="text-lg font-medium text-gray-900">Unassigned Faces</h2>
            <p class="mt-1 text-sm text-gray-500">
              {{ unassignedFaces.length }} faces detected but not yet assigned to people
            </p>
          </div>
          
          <div v-if="unassignedFaces.length === 0" class="p-6 sm:p-8 text-center">
            <i class="pi pi-smile text-4xl text-gray-400"></i>
            <h3 class="mt-2 text-sm font-medium text-gray-900">All faces assigned!</h3>
            <p class="mt-1 text-sm text-gray-500">
              Great job! All detected faces have been assigned to people.
            </p>
          </div>
          
          <div v-else class="p-4 sm:p-6">
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
              <FaceDisplay
                v-for="(face, index) in unassignedFaces"
                :key="face.id"
                :face="face"
                :face-number="index + 1"
                @click="assignFace(face, index + 1)"
              />
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

    <!-- Face Assignment Modal -->
    <FaceAssignmentModal
      v-if="showFaceAssignmentModal"
      :face="selectedFace"
      :person-groups="personGroups"
      :face-number="selectedFaceNumber"
      @close="closeFaceAssignmentModal"
      @assign="assignFaceToPerson"
      @create-person-and-assign="createPersonAndAssignFace"
    />

    <!-- Person Gallery Modal -->
    <PersonGalleryModal
      v-if="showPersonGalleryModal"
      :person="selectedPerson"
      @close="closePersonGalleryModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import FaceDisplay from '~/components/FaceDisplay.vue';
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

// Modal states
const showCreatePersonModal = ref(false);
const showEditPersonModal = ref(false);
const showFaceAssignmentModal = ref(false);
const showPersonGalleryModal = ref(false);

// Selected items
const editingPerson = ref(null);
const selectedFace = ref(null);
const selectedFaceNumber = ref(null);
const selectedPerson = ref(null);

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

// Face assignment functions
const assignFace = (face, faceNumber) => {
  // Extract reactive variables to local variables for better reliability
  const faceObj = face;
  const faceId = faceObj?.face_id; // Fixed: use face_id instead of id
  
  console.log('assignFace called with:', { face: faceObj, faceNumber });
  console.log('face object:', faceObj);
  console.log('face.face_id:', faceId);
  console.log('face object keys:', Object.keys(faceObj || {}));
  console.log('face object values:', Object.entries(faceObj || {}).map(([key, value]) => `${key}: ${value}`));
  
  selectedFace.value = faceObj;
  selectedFaceNumber.value = faceNumber;
  
  console.log('selectedFace.value set to:', selectedFace.value);
  console.log('selectedFace.value.face_id:', selectedFace.value?.face_id);
  showFaceAssignmentModal.value = true;
};

const closeFaceAssignmentModal = () => {
  showFaceAssignmentModal.value = false;
  selectedFace.value = null;
  selectedFaceNumber.value = null;
};

const assignFaceToPerson = async (faceId, personGroupId, confidence) => {
  try {
    console.log('assignFaceToPerson called with:', { faceId, personGroupId, confidence });
    console.log('faceId type:', typeof faceId, 'value:', faceId);
    console.log('personGroupId type:', typeof personGroupId, 'value:', personGroupId);
    
    if (!faceId) {
      throw new Error('faceId is required but was not provided');
    }
    
    if (!personGroupId) {
      throw new Error('personGroupId is required but was not provided');
    }
    
    await assignFaceToPersonApi(faceId, personGroupId, confidence);
    closeFaceAssignmentModal();
  } catch (err) {
    console.error('Error assigning face:', err);
  }
};

// Create new person and assign face
const createPersonAndAssignFace = async (data) => {
  try {
    // First create the person
    const newPerson = await createPersonGroup({
      name: data.personName.toLowerCase().replace(/\s+/g, '-'),
      display_name: data.personName,
      description: `Person identified from face assignment`,
      relationship: 'family',
      is_primary_person: false
    });
    
    // Then assign the face to the new person
    await assignFaceToPersonApi(data.faceId, newPerson.id, data.confidence);
    
    closeFaceAssignmentModal();
  } catch (err) {
    console.error('Error creating person and assigning face:', err);
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
</script>
