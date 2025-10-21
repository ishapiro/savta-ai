<template>
  <div>
    <!-- Funnel Report Section -->
    <div class="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6 funnel-report-section">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <i class="pi pi-chart-funnel text-white text-lg"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Conversion Funnel</h3>
            <p class="text-sm text-gray-600">Track user journey through key stages</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            @click="showInfoDialog('funnelReport')"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            title="Learn more about funnel reports"
          >
            <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
          </button>
          <Button
            label="View Full Funnel Report"
            icon="pi pi-external-link"
            class="bg-brand-dialog-edit border-0 w-auto rounded-full px-6 py-2 shadow"
            @click="showFunnelReport = true"
          />
        </div>
      </div>
      
      <!-- Quick Stats Preview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="bg-white rounded-lg p-3 border border-gray-200">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Total Users</div>
          <div class="text-lg font-bold text-gray-900">{{ previewData?.totalUsers || '0' }}</div>
        </div>
        <div class="bg-white rounded-lg p-3 border border-gray-200">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Conversion</div>
          <div class="text-lg font-bold text-green-600">{{ previewData?.overallConversion || '0' }}%</div>
        </div>
        <div class="bg-white rounded-lg p-3 border border-gray-200">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Bottleneck</div>
          <div class="text-lg font-bold text-orange-600">{{ previewData?.bottleneckStage || 'N/A' }}</div>
        </div>
        <div class="bg-white rounded-lg p-3 border border-gray-200">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Revenue</div>
          <div class="text-lg font-bold text-purple-600">{{ previewData?.revenuePotential || '$0' }}</div>
        </div>
      </div>
    </div>

    <!-- Funnel Report Dialog -->
    <Dialog 
      v-model:visible="showFunnelReport" 
      :modal="true"
      :closable="true"
      :closeOnEscape="true"
      class="max-w-6xl"
      :style="{ top: '20px' }"
    >
      <template #header>
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <i class="pi pi-chart-funnel text-white text-lg"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Conversion Funnel Report</h3>
            <p class="text-sm text-gray-600">Detailed analysis of user conversion journey</p>
          </div>
        </div>
      </template>
      
      <div class="space-y-6">
        <!-- Funnel Controls -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <div class="flex items-center space-x-3">
                <label class="text-sm font-semibold text-gray-700">Report Type:</label>
                <Dropdown
                  v-model="funnelReportType"
                  :options="funnelReportTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Report Type"
                  class="w-40"
                  @change="loadFunnelData"
                />
              </div>
              <div v-if="funnelReportType === 'user'" class="flex items-center space-x-3">
                <label class="text-sm font-semibold text-gray-700">User:</label>
                <AutoComplete
                  v-model="selectedFunnelUser"
                  :suggestions="funnelUserSuggestions"
                  @complete="searchFunnelUsers"
                  placeholder="Search for user..."
                  class="w-60"
                  @item-select="loadFunnelData"
                />
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <label class="text-sm font-semibold text-gray-700">Date Range:</label>
              <Dropdown
                v-model="funnelDateRange"
                :options="funnelDateRangeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Date Range"
                class="w-60"
                @change="loadFunnelData"
              />
            </div>
          </div>
        </div>

        <!-- Funnel Visualization -->
        <div v-if="funnelData" class="space-y-6">
          <!-- Header Stats -->
          <div class="text-center mb-8">
            <h4 class="text-2xl font-bold text-gray-900 mb-2">
              {{ funnelReportType === 'all' ? 'All Users' : `User: ${selectedFunnelUser?.email || 'Unknown'}` }} 
              <span class="text-gray-500 text-lg">
                ({{ funnelDateRangeOptions.find(opt => opt.value === funnelDateRange)?.label }})
              </span>
            </h4>
            <p class="text-gray-600 max-w-2xl mx-auto">
              Track how users progress through your conversion funnel. Each stage shows the number of users and conversion rate to the next stage.
            </p>
          </div>

          <!-- Visual Funnel -->
          <div class="bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 p-6 relative overflow-hidden">
            <!-- Funnel background pattern -->
            <div class="absolute inset-0 opacity-5">
              <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[400px] border-r-[400px] border-b-[600px] border-l-transparent border-r-transparent border-b-gray-300"></div>
            </div>
            <div class="space-y-4">
              <div 
                v-for="(stage, index) in funnelData.stages" 
                :key="stage.name"
                class="relative"
              >
                <!-- Funnel Stage -->
                <div class="relative overflow-hidden transition-all duration-500 mx-auto"
                     :style="{ 
                       width: getFunnelWidth(index, funnelData.stages.length),
                       maxWidth: '800px',
                       minWidth: '300px'
                     }"
                >
                  <!-- Debug info (temporary) -->
                  <div class="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl">
                    {{ getFunnelWidth(index, funnelData.stages.length) }}
                  </div>
                  <!-- Background gradient based on stage -->
                  <div 
                    class="absolute inset-0 rounded-lg opacity-10"
                    :class="getStageGradient(index)"
                  ></div>
                  
                  <!-- Stage content -->
                  <div class="relative flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 shadow-sm"
                       :style="{
                         boxShadow: `0 4px 6px -1px rgba(0, 0, 0, ${0.05 + (index * 0.02)})`
                       }"
                  >
                    <div class="flex items-center space-x-4">
                      <!-- Stage number with gradient -->
                      <div 
                        class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                        :class="getStageGradient(index)"
                      >
                        {{ index + 1 }}
                      </div>
                      
                      <!-- Stage info -->
                      <div class="flex-1">
                        <h5 class="text-lg font-semibold text-gray-900 mb-1">{{ stage.name }}</h5>
                        <p class="text-sm text-gray-600">{{ stage.description }}</p>
                        
                        <!-- Progress bar for conversion rate -->
                        <div class="mt-3">
                          <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Conversion Rate</span>
                            <span class="font-semibold">{{ stage.conversionRate }}%</span>
                          </div>
                          <div class="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              class="h-2 rounded-full transition-all duration-500"
                              :class="getConversionRateColor(stage.conversionRate)"
                              :style="{ width: `${Math.min(stage.conversionRate, 100)}%` }"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Stage metrics -->
                    <div class="text-right">
                      <div class="text-3xl font-bold text-gray-900 mb-1">{{ stage.count.toLocaleString() }}</div>
                      <div class="text-sm text-gray-500">users</div>
                    </div>
                  </div>
                </div>
                
                <!-- Connection arrow -->
                <div v-if="index < funnelData.stages.length - 1" class="flex justify-center my-4">
                  <div class="relative mx-auto"
                       :style="{ 
                         width: getFunnelWidth(index + 1, funnelData.stages.length),
                         maxWidth: '800px',
                         minWidth: '300px'
                       }"
                  >
                    <!-- Funnel-shaped connection -->
                    <div class="relative h-8">
                      <!-- Center line -->
                      <div class="absolute left-1/2 top-0 w-0.5 h-full bg-gradient-to-b from-gray-400 to-gray-500 transform -translate-x-1/2"></div>
                      <!-- Arrow -->
                      <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                        <i class="pi pi-chevron-down text-gray-500 text-lg"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Funnel Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-500 rounded-lg">
                  <i class="pi pi-users text-white"></i>
                </div>
                <div>
                  <div class="text-sm text-blue-600 font-medium">Overall Conversion</div>
                  <div class="text-2xl font-bold text-blue-900">{{ funnelData.overallConversion }}%</div>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-500 rounded-lg">
                  <i class="pi pi-chart-line text-white"></i>
                </div>
                <div>
                  <div class="text-sm text-green-600 font-medium">Total Users</div>
                  <div class="text-2xl font-bold text-green-900">{{ funnelData.totalUsers.toLocaleString() }}</div>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-orange-500 rounded-lg">
                  <i class="pi pi-exclamation-triangle text-white"></i>
                </div>
                <div>
                  <div class="text-sm text-orange-600 font-medium">Bottleneck</div>
                  <div class="text-lg font-bold text-orange-900">{{ funnelData.bottleneckStage }}</div>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-purple-500 rounded-lg">
                  <i class="pi pi-dollar text-white"></i>
                </div>
                <div>
                  <div class="text-sm text-purple-600 font-medium">Revenue Potential</div>
                  <div class="text-2xl font-bold text-purple-900">{{ funnelData.revenuePotential }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="funnelLoading" class="flex flex-col items-center justify-center py-12">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div class="mt-4 text-gray-600">Loading funnel data...</div>
        </div>

        <!-- Error State -->
        <div v-else-if="funnelError" class="text-center py-12">
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <h4 class="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h4>
            <p class="text-red-700">{{ funnelError }}</p>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Information Dialog -->
    <Dialog 
      v-model:visible="showInfoDialogVisible" 
      :modal="true"
      :closable="true"
      :closeOnEscape="true"
      class="max-w-md"
      :style="{ top: '20px' }"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-brand-primary">{{ currentInfoDialog.title }}</h3>
      </template>
      
      <div class="space-y-4">
        <div v-html="currentInfoDialog.content"></div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
// Reactive data
const showFunnelReport = ref(false)
const funnelLoading = ref(false)
const funnelError = ref(null)
const funnelData = ref(null)
const previewData = ref(null)
const funnelReportType = ref('all')
const selectedFunnelUser = ref(null)
const funnelDateRange = ref('30d')
const funnelUserSuggestions = ref([])

// Information dialog
const showInfoDialogVisible = ref(false)
const currentInfoDialog = ref({ title: '', content: '' })

// Funnel report options
const funnelReportTypeOptions = [
  { label: 'All Users', value: 'all' },
  { label: 'Single User', value: 'user' }
]

const funnelDateRangeOptions = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last Year', value: '1y' }
]

// Information dialog content
const infoDialogContent = {
  funnelReport: {
    title: 'Conversion Funnel Report',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this shows:</strong> A visual representation of how users progress through key stages of your application.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Funnel Stages:</strong>
      </p>
      <ol class="text-sm text-brand-primary/80 list-decimal list-inside space-y-1 ml-2 mb-3">
        <li><strong>Site Visit:</strong> Users who visited your site</li>
        <li><strong>Sign Up:</strong> Users who created an account</li>
        <li><strong>Asset Upload:</strong> Users who uploaded photos or videos</li>
        <li><strong>Memory Book Creation:</strong> Users who created memory books</li>
        <li><strong>Download/Share:</strong> Users who downloaded or shared their books</li>
      </ol>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Conversion Rate:</strong> The percentage of users who progress from one stage to the next. Lower rates indicate potential bottlenecks.
      </p>
      <p class="text-sm text-brand-primary/80">
        <strong>Use Cases:</strong> Identify where users drop off, optimize conversion points, and track improvements over time.
      </p>
    `
  }
}

// Helper functions for styling
const getStageGradient = (index) => {
  const gradients = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600', 
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-red-500 to-red-600'
  ]
  return `bg-gradient-to-r ${gradients[index % gradients.length]}`
}

const getConversionRateColor = (rate) => {
  if (rate >= 80) return 'bg-green-500'
  if (rate >= 60) return 'bg-blue-500'
  if (rate >= 40) return 'bg-yellow-500'
  if (rate >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

// Calculate funnel width based on stage index
const getFunnelWidth = (index, totalStages) => {
  if (!totalStages || totalStages === 0) return '100%'
  
  // Create a more pronounced funnel effect
  // Start at 100% and decrease more dramatically
  const baseWidth = 100 - (index * 20) // More dramatic decrease
  
  // Ensure minimum width for readability
  return `${Math.max(baseWidth, 35)}%`
}

// Show information dialog
const showInfoDialog = (type) => {
  if (infoDialogContent[type]) {
    currentInfoDialog.value = infoDialogContent[type]
    showInfoDialogVisible.value = true
  }
}

// Search users for autocomplete
const searchFunnelUsers = async (event) => {
  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    
    const res = await fetch(`/api/admin/users/search?q=${event.query}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    if (res.ok) {
      const result = await res.json()
      funnelUserSuggestions.value = result.users || []
    }
  } catch (error) {
    console.error('Error searching users:', error)
    funnelUserSuggestions.value = []
  }
}

// Load funnel data
const loadFunnelData = async () => {
  if (!funnelReportType.value || !funnelDateRange.value) return
  
  funnelLoading.value = true
  funnelError.value = null
  
  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    
    const params = new URLSearchParams({
      timeRange: funnelDateRange.value,
      reportType: funnelReportType.value
    })
    
    if (funnelReportType.value === 'user' && selectedFunnelUser.value?.id) {
      params.append('userId', selectedFunnelUser.value.id)
    }
    
    const res = await fetch(`/api/admin/funnel-report?${params}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch funnel data')
    }
    
    const result = await res.json()
    funnelData.value = result.funnelData
    previewData.value = result.funnelData // Store for preview
  } catch (err) {
    console.error('Error loading funnel data:', err)
    funnelError.value = err.message
  } finally {
    funnelLoading.value = false
  }
}

// Load initial data when dialog opens
watch(showFunnelReport, (newValue) => {
  if (newValue) {
    loadFunnelData()
  }
})

// Load preview data on component mount
onMounted(() => {
  loadFunnelData()
})
</script>

<style scoped>
.funnel-report-section {
  background: linear-gradient(135deg, theme('colors.brand.surface') 0%, theme('colors.brand.background') 100%);
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar for the dialog */
:deep(.p-dialog-content) {
  scrollbar-width: thin;
  scrollbar-color: theme('colors.brand.navigation') theme('colors.brand.surface-hover');
}

:deep(.p-dialog-content::-webkit-scrollbar) {
  width: 6px;
}

:deep(.p-dialog-content::-webkit-scrollbar-track) {
  background: theme('colors.brand.surface-hover');
  border-radius: 3px;
}

:deep(.p-dialog-content::-webkit-scrollbar-thumb) {
  background: theme('colors.brand.navigation');
  border-radius: 3px;
}

:deep(.p-dialog-content::-webkit-scrollbar-thumb:hover) {
  background: theme('colors.brand.secondary');
}
</style>

