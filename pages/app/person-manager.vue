<template>
  <div class="person-manager min-h-screen bg-brand-background">
    <!-- Header -->
          <div class="bg-white shadow-sm border-b border-brand-highlight/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">People in Your Photos</h1>
              <p class="mt-1 text-sm text-gray-500">
                Identify and organize the people in your photo collection
              </p>
            </div>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-brand-info-outline shadow hover:bg-gray-100 transition-colors focus:outline-none flex-shrink-0"
              v-tooltip.top="'How to identify people'"
              @click="showHelpModal = true"
              aria-label="Information about identifying people in photos"
            >
              <i class="pi pi-info text-lg text-brand-info-letter font-bold"></i>
            </button>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <button
              @click="searchSimilarFaces"
              :disabled="isSearching || unassignedFaces.length === 0"
              class="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-full shadow transition-all duration-200 text-white bg-brand-accent hover:bg-brand-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="isSearching" class="pi pi-spin pi-spinner mr-2"></i>
              <i v-else class="pi pi-search mr-2"></i>
              {{ isSearching ? 'Searching...' : 'Search Similar Faces' }}
            </button>
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
      @skip-permanently="handleSkipFacePermanently"
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

    <!-- Help Modal -->
    <Dialog
      v-model:visible="showHelpModal"
      modal
      :closable="true"
      :dismissableMask="true"
      header="✨ How to Identify People in Your Photos ✨"
      class="w-full max-w-3xl"
    >
      <div class="space-y-6">
        <!-- Welcome Section -->
        <div class="bg-gradient-to-r from-brand-highlight/10 via-brand-secondary/10 to-brand-accent/10 rounded-2xl p-6 border border-brand-highlight/30">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-brand-highlight flex items-center justify-center flex-shrink-0">
              <i class="pi pi-users text-white text-2xl"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Welcome to Your Photo Collection!</h3>
              <p class="text-gray-700 leading-relaxed">
                You've uploaded your photos, and now it's time to identify the special people in them. 
                This will help you create beautiful personalized memory books and find photos of specific family members instantly.
              </p>
            </div>
          </div>
        </div>

        <!-- Step-by-Step Guide -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Simple 3-Step Process
          </h4>

          <!-- Step 1 -->
          <div class="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-highlight text-white flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h5 class="font-semibold text-gray-900 mb-2">Start with a Few Faces</h5>
              <p class="text-gray-700 text-sm leading-relaxed mb-2">
                Below, you'll see faces that our system detected in your photos. Click on 2-3 faces of each person 
                to get started. For example:
              </p>
              <ul class="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Click on 2-3 clear photos of Grandma</li>
                <li>• Then 2-3 photos of Grandpa</li>
                <li>• Then 2-3 photos of each family member</li>
              </ul>
              <p class="text-gray-700 text-sm mt-2 italic">
                💡 Tip: Choose photos where the person is clearly visible and facing the camera.
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-highlight text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h5 class="font-semibold text-gray-900 mb-2">Let Our System Find Similar Faces</h5>
              <p class="text-gray-700 text-sm leading-relaxed mb-2">
                After you've identified a few people, click the <strong>"Search Similar Faces"</strong> button at the top. 
                Our smart system will:
              </p>
              <ul class="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Search all your photos for similar faces</li>
                <li>• Automatically match faces it's confident about</li>
                <li>• Ask you to confirm faces it's not sure about</li>
              </ul>
              <p class="text-gray-700 text-sm mt-2 italic">
                💡 Tip: The more faces you identify first, the better the search works!
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-highlight text-white flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h5 class="font-semibold text-gray-900 mb-2">Review and Repeat</h5>
              <p class="text-gray-700 text-sm leading-relaxed mb-2">
                Review any faces the system wasn't sure about, then run "Search Similar Faces" again. 
                Each time you do this:
              </p>
              <ul class="text-sm text-gray-600 space-y-1 ml-4">
                <li>• The system gets smarter</li>
                <li>• More faces get automatically identified</li>
                <li>• Your collection becomes more organized</li>
              </ul>
              <p class="text-gray-700 text-sm mt-2 italic">
                💡 Tip: You can run the search multiple times as you identify more faces!
              </p>
            </div>
          </div>
        </div>

        <!-- Additional Tips -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <i class="pi pi-lightbulb text-yellow-600 text-xl flex-shrink-0 mt-0.5"></i>
            <div>
              <h5 class="font-semibold text-gray-900 mb-2">Helpful Tips</h5>
              <ul class="text-sm text-gray-700 space-y-1.5">
                <li>• <strong>Not sure about a face?</strong> Click "Skip for now" and come back to it later</li>
                <li>• <strong>Poor quality photo?</strong> Click "Skip Permanently" to hide it forever</li>
                <li>• <strong>Made a mistake?</strong> Click on a person's name to see and manage all their photos</li>
                <li>• <strong>Be patient:</strong> It may take a few rounds of searching to identify everyone</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Quick Start -->
        <div class="bg-gradient-to-r from-brand-highlight to-brand-secondary rounded-lg p-5 text-white">
          <h5 class="font-bold text-lg mb-2">Ready to Get Started?</h5>
          <p class="text-sm leading-relaxed">
            Just scroll down and click on any face you recognize. Give them a name and relationship 
            (like "Grandma" or "Uncle Bob"), then let our system do the rest!
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <button
            @click="showHelpModal = false"
            class="px-6 py-2 text-sm font-medium text-white bg-brand-highlight border-0 rounded hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-highlight"
          >
            Got it, let's start!
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Search Progress Dialog -->
    <Dialog
      v-model:visible="showSearchProgressDialog"
      modal
      :closable="false"
      :dismissableMask="false"
      header="Searching for Similar Faces"
      class="w-full max-w-lg mx-4"
    >
      <div class="p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-brand-accent to-brand-highlight rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-search text-white text-2xl animate-pulse"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Searching Your Photos</h3>
          <p class="text-gray-600">Finding faces that match the people you've identified...</p>
        </div>

        <!-- Progress Information -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-medium text-gray-700">Progress</span>
            <span class="text-sm font-bold text-gray-800">{{ searchProgress.current }} of {{ searchProgress.total }}</span>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div 
              class="bg-gradient-to-r from-brand-accent to-brand-highlight h-3 rounded-full transition-all duration-500 ease-out" 
              :style="{ width: searchProgress.total > 0 ? `${(searchProgress.current / searchProgress.total) * 100}%` : '0%' }"
            ></div>
          </div>
          
          <!-- Percentage -->
          <div class="text-center">
            <span class="text-lg font-bold text-brand-accent">
              {{ searchProgress.total > 0 ? Math.round((searchProgress.current / searchProgress.total) * 100) : 0 }}%
            </span>
          </div>
        </div>

        <!-- Results Summary -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-green-600">{{ searchProgress.autoAssigned }}</div>
            <div class="text-xs text-green-700 mt-1">Auto-Assigned</div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ searchProgress.needsReview }}</div>
            <div class="text-xs text-blue-700 mt-1">Need Review</div>
          </div>
        </div>

        <!-- Current Status -->
        <div class="text-center">
          <div v-if="!abortSearch" class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Searching face {{ searchProgress.current + 1 }}...</span>
          </div>
          <div v-else class="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-2 rounded-full text-sm">
            <i class="pi pi-pause-circle"></i>
            <span>Stopping after current face...</span>
          </div>
        </div>

        <!-- Abort Button -->
        <div class="mt-6 text-center">
          <button
            @click="abortSearch = true"
            :disabled="abortSearch"
            class="inline-flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="pi pi-stop-circle mr-2"></i>
            {{ abortSearch ? 'Stopping...' : 'Stop Search' }}
          </button>
          <p class="text-xs text-gray-500 mt-2">
            Search will stop after the current face completes
          </p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
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

// Get toast instance at component setup level
const toast = useToast();

// Modal states
const showCreatePersonModal = ref(false);
const showEditPersonModal = ref(false);
const showPersonGalleryModal = ref(false);
const showClearConfirmDialog = ref(false); // New state for confirmation dialog
const showHelpModal = ref(false);

// Search similar faces state
const isSearching = ref(false);
const showSearchProgressDialog = ref(false);
const searchProgress = ref({
  current: 0,
  total: 0,
  currentFace: null,
  autoAssigned: 0,
  needsReview: 0
});
const abortSearch = ref(false);

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
    
    // Remove the assigned face from the modal's array
    facesToAssign.value = facesToAssign.value.filter(face => face.id !== faceId);
    
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
    
    // Remove the assigned face from the modal's array
    facesToAssign.value = facesToAssign.value.filter(face => face.id !== faceId);
    
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

// Handle skipping face temporarily (for now)
const handleSkipFace = (faceId) => {
  console.log('⏭️ Skipping face temporarily:', faceId);
  // Just log - face will appear again later
};

// Handle skipping face permanently
const handleSkipFacePermanently = async (faceId) => {
  try {
    console.log('⏭️ Permanently skipping face:', faceId);
    
    // Get authentication token
    const supabaseClient = useNuxtApp().$supabase;
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    // Call API to skip face
    await $fetch('/api/ai/skip-face', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        faceId
      }
    });
    
    console.log('✅ Face permanently skipped');
    
    // Remove the skipped face from the modal's array
    facesToAssign.value = facesToAssign.value.filter(face => face.id !== faceId);
    
    // Refresh unassigned faces to remove the skipped face
    await fetchUnassignedFaces();
  } catch (error) {
    console.error('❌ Error skipping face:', error);
    throw error;
  }
};

// Search for similar faces using AWS Rekognition
const searchSimilarFaces = async () => {
  try {
    isSearching.value = true;
    abortSearch.value = false;
    
    // Initialize progress
    searchProgress.value = {
      current: 0,
      total: unassignedFaces.value.length,
      currentFace: null,
      autoAssigned: 0,
      needsReview: 0
    };
    
    // Show progress dialog
    showSearchProgressDialog.value = true;
    
    console.log('🔍 Starting similar face search for', unassignedFaces.value.length, 'faces');
    
    // Get authentication token
    const supabaseClient = useNuxtApp().$supabase;
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    // Process each unassigned face
    const facesNeedingUserInput = [];
    
    for (let i = 0; i < unassignedFaces.value.length; i++) {
      // Check if user aborted
      if (abortSearch.value) {
        console.log('🛑 Search aborted by user');
        break;
      }
      
      const face = unassignedFaces.value[i];
      
      // Update progress
      searchProgress.value.current = i + 1;
      searchProgress.value.currentFace = face;
      
      try {
        console.log(`🔍 Searching for matches for face ${face.id} (Rekognition ID: ${face.rekognition_face_id}) (${i + 1}/${unassignedFaces.value.length})`);
        
        // Call the search-face-matches endpoint to find similar faces
        // This searches Rekognition for matches to this already-indexed face
        const result = await $fetch('/api/ai/search-face-matches', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: {
            faceId: face.id,
            rekognitionFaceId: face.rekognition_face_id
          }
        });
        
        // Check if face was auto-assigned or needs user input
        if (result.autoAssigned && result.autoAssigned.length > 0) {
          searchProgress.value.autoAssigned += result.autoAssigned.length;
          console.log(`✅ Auto-assigned ${result.autoAssigned.length} face(s)`);
        }
        
        if (result.needsUserInput && result.needsUserInput.length > 0) {
          searchProgress.value.needsReview += result.needsUserInput.length;
          facesNeedingUserInput.push(...result.needsUserInput);
          console.log(`❓ ${result.needsUserInput.length} face(s) need user input`);
        }
      } catch (error) {
        console.error(`❌ Error searching face ${face.id}:`, error);
        // Continue with next face
      }
    }
    
    // Close progress dialog
    showSearchProgressDialog.value = false;
    
    const wasAborted = abortSearch.value;
    const processedCount = searchProgress.value.current;
    
    console.log(`${wasAborted ? '🛑 Search stopped' : '✅ Search complete'}: ${searchProgress.value.autoAssigned} auto-assigned, ${searchProgress.value.needsReview} need review (processed ${processedCount}/${unassignedFaces.value.length})`);
    
    // Refresh data
    await Promise.all([
      fetchPersonGroups(),
      fetchUnassignedFaces()
    ]);
    
    // If there are faces needing user input, open the assignment modal
    if (facesNeedingUserInput.length > 0) {
      facesToAssign.value = facesNeedingUserInput;
      showNewFaceAssignmentModal.value = true;
    }
    
    // Show result message
    if (toast) {
      if (wasAborted) {
        toast.add({
          severity: 'warn',
          summary: 'Search Stopped',
          detail: `Stopped after processing ${processedCount} face(s). ${searchProgress.value.autoAssigned} auto-assigned, ${searchProgress.value.needsReview} need your review.`,
          life: 5000
        });
      } else if (searchProgress.value.autoAssigned > 0) {
        // Some were auto-assigned
        toast.add({
          severity: 'success',
          summary: 'Search Complete',
          detail: `${searchProgress.value.autoAssigned} face(s) auto-assigned! ${searchProgress.value.needsReview > 0 ? `${searchProgress.value.needsReview} need your review.` : ''}`,
          life: 5000
        });
      } else if (searchProgress.value.needsReview > 0) {
        // Found matches but need confirmation
        toast.add({
          severity: 'info',
          summary: 'Matches Found',
          detail: `Found ${searchProgress.value.needsReview} potential match(es) that need your confirmation.`,
          life: 5000
        });
      } else {
        // No matches at all - likely no faces assigned yet
        toast.add({
          severity: 'info',
          summary: 'No Matches Found',
          detail: personGroups.value.length === 0 
            ? 'Please assign a few faces to people first, then search again.' 
            : 'No similar faces found in your collection yet.',
          life: 6000
        });
      }
    }
  } catch (error) {
    console.error('❌ Error searching similar faces:', error);
    
    // Close progress dialog on error
    showSearchProgressDialog.value = false;
    
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Search Failed',
        detail: 'Failed to search for similar faces. Please try again.',
        life: 3000
      });
    }
  } finally {
    isSearching.value = false;
    abortSearch.value = false;
    
    // Reset progress after a delay
    setTimeout(() => {
      searchProgress.value = {
        current: 0,
        total: 0,
        currentFace: null,
        autoAssigned: 0,
        needsReview: 0
      };
    }, 1000);
  }
};
</script>
