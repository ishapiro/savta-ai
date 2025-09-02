<template>
  <div class="fixed inset-0 z-60 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-brand-primary bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 sm:px-6 py-4 border-b border-brand-highlight/20">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                              <div class="w-6 h-6 sm:w-8 sm:h-8 bg-brand-accent rounded-full flex items-center justify-center">
                  <i class="pi pi-user text-brand-secondary text-sm sm:text-base"></i>
                </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  Photo of {{ person?.display_name || person?.name }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ formatDate(face?.created_at) }}
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
          <!-- Photo -->
                      <div class="mb-4">
              <div class="aspect-square bg-brand-card rounded-lg overflow-hidden">
              <img
                v-if="face?.asset_url"
                :src="face.asset_url"
                :alt="`Photo of ${person?.display_name || person?.name}`"
                class="w-full h-full object-cover"
              />
                                <div v-else class="w-full h-full flex items-center justify-center">
                    <i class="pi pi-image text-brand-primary/40 text-3xl sm:text-4xl"></i>
                  </div>
            </div>
          </div>

          <!-- Face Details -->
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Detection Confidence:</span>
                <span class="ml-2 text-gray-900">{{ Math.round((face?.confidence || 0) * 100) }}%</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Assignment Confidence:</span>
                <span class="ml-2 text-gray-900">{{ Math.round((face?.assignment_confidence || 0) * 100) }}%</span>
              </div>
            </div>

            <div v-if="face?.age_range" class="text-sm">
              <span class="font-medium text-gray-700">Age Range:</span>
              <span class="ml-2 text-gray-900">{{ face.age_range.Low }}-{{ face.age_range.High }} years</span>
            </div>

            <div v-if="face?.gender" class="text-sm">
              <span class="font-medium text-gray-700">Gender:</span>
              <span class="ml-2 text-gray-900">{{ face.gender.Value }} ({{ Math.round(face.gender.Confidence) }}% confidence)</span>
            </div>

            <div v-if="face?.emotions && face.emotions.length > 0" class="text-sm">
              <span class="font-medium text-gray-700">Emotions:</span>
              <div class="mt-1 space-y-1">
                <div
                  v-for="emotion in face.emotions.slice(0, 3)"
                  :key="emotion.Type"
                  class="flex justify-between"
                >
                  <span class="text-gray-600">{{ emotion.Type }}:</span>
                  <span class="text-gray-900">{{ Math.round(emotion.Confidence) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-brand-background px-4 sm:px-6 py-3 border-t border-brand-highlight/20">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-500">
              Face ID: {{ face?.id?.substring(0, 8) }}...
            </div>
            <div class="flex space-x-2">
                              <button
                  @click="downloadPhoto"
                  class="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-bold rounded-full border border-brand-primary/20 text-brand-primary bg-white hover:bg-brand-accent/10 transition-all duration-200"
                >
                <i class="pi pi-download mr-1"></i>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Using PrimeVue icons instead of Heroicons

// Props
const props = defineProps({
  face: {
    type: Object,
    required: true
  },
  person: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['close']);

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Download photo
const downloadPhoto = () => {
  if (!props.face?.asset_url) return;
  
  const link = document.createElement('a');
  link.href = props.face.asset_url;
  link.download = `${props.person.name || 'person'}-photo-${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
