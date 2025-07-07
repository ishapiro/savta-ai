<template>
  <div class="min-h-screen surface-ground p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-color mb-2">Admin Dashboard</h1>
        <p class="text-color-secondary">Manage users, roles, and system administration.</p>
      </div>

      <!-- Admin Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-users text-primary text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Total Users</p>
                <p class="text-lg font-semibold text-color">{{ stats.totalUsers }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-check text-success text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Active Users</p>
                <p class="text-lg font-semibold text-color">{{ stats.activeUsers }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-book text-primary text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Memory Books</p>
                <p class="text-lg font-semibold text-color">{{ stats.totalBooks }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <i class="pi pi-image text-warning text-sm"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-color-secondary">Total Assets</p>
                <p class="text-lg font-semibold text-color">{{ stats.totalAssets }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Admin Tabs -->
      <Card>
        <template #content>
          <TabView v-model:activeIndex="activeTabIndex" class="w-full">
            <TabPanel header="👥 Users">
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-color">User Management</h2>
                  <div class="flex items-center space-x-4">
                    <InputText
                      v-model="userSearch"
                      placeholder="Search users..."
                      class="w-64"
                    />
                    <Dropdown
                      v-model="roleFilter"
                      :options="roleOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="All Roles"
                      class="w-32"
                    />
                  </div>
                </div>

                <!-- Users Table -->
                <DataTable
                  :value="filteredUsers"
                  :paginator="true"
                  :rows="10"
                  :rowsPerPageOptions="[5, 10, 20, 50]"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                  responsiveLayout="scroll"
                  class="p-datatable-sm"
                >
                  <Column field="name" header="User" sortable>
                    <template #body="{ data }">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span class="text-primary font-medium">
                              {{ data.first_name ? data.first_name.charAt(0) : data.email.charAt(0).toUpperCase() }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-color">
                            {{ data.first_name }} {{ data.last_name }}
                          </div>
                          <div class="text-sm text-color-secondary">{{ data.email }}</div>
                        </div>
                      </div>
                    </template>
                  </Column>

                  <Column field="role" header="Role" sortable>
                    <template #body="{ data }">
                      <Dropdown
                        v-model="data.role"
                        :options="userRoleOptions"
                        optionLabel="label"
                        optionValue="value"
                        @change="updateUserRole(data.user_id, data.role)"
                        class="w-24"
                      />
                    </template>
                  </Column>

                  <Column field="subscription_type" header="Subscription" sortable>
                    <template #body="{ data }">
                      <Tag
                        :value="data.subscription_type"
                        :severity="data.subscription_type === 'premium' ? 'primary' : 'secondary'"
                      />
                    </template>
                  </Column>

                  <Column field="deleted" header="Status" sortable>
                    <template #body="{ data }">
                      <Tag
                        :value="data.deleted ? 'Deleted' : 'Active'"
                        :severity="data.deleted ? 'danger' : 'success'"
                      />
                    </template>
                  </Column>

                  <Column field="created_at" header="Created" sortable>
                    <template #body="{ data }">
                      <span class="text-sm text-color-secondary">{{ formatDate(data.created_at) }}</span>
                    </template>
                  </Column>

                  <Column header="Actions">
                    <template #body="{ data }">
                      <div class="flex items-center space-x-2">
                        <Button
                          v-if="!data.deleted"
                          icon="pi pi-trash"
                          severity="danger"
                          size="small"
                          @click="deleteUser(data.user_id)"
                        />
                        <Button
                          v-else
                          icon="pi pi-refresh"
                          severity="success"
                          size="small"
                          @click="restoreUser(data.user_id)"
                        />
                        <Button
                          icon="pi pi-eye"
                          severity="info"
                          size="small"
                          @click="viewUserDetails(data)"
                        />
                      </div>
                    </template>
                  </Column>
                </DataTable>
              </div>
            </TabPanel>

            <TabPanel header="⚙️ System">
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- System Info -->
                  <Card>
                    <template #title>
                      <h3 class="text-lg font-semibold text-color">System Information</h3>
                    </template>
                    <template #content>
                      <div class="space-y-3">
                        <div class="flex justify-between">
                          <span class="text-sm text-color-secondary">Version:</span>
                          <span class="text-sm text-color">1.0.0</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-sm text-color-secondary">Environment:</span>
                          <span class="text-sm text-color">{{ systemInfo.environment }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-sm text-color-secondary">Database:</span>
                          <span class="text-sm text-color">{{ systemInfo.database }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-sm text-color-secondary">Storage:</span>
                          <span class="text-sm text-color">{{ systemInfo.storage }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <!-- Quick Actions -->
                  <Card>
                    <template #title>
                      <h3 class="text-lg font-semibold text-color">Quick Actions</h3>
                    </template>
                    <template #content>
                      <div class="space-y-3">
                        <Button
                          label="Clear Cache"
                          icon="pi pi-refresh"
                          severity="secondary"
                          @click="clearCache"
                        />
                        <Button
                          label="Backup Database"
                          icon="pi pi-download"
                          severity="info"
                          @click="backupDatabase"
                        />
                        <Button
                          label="Generate Report"
                          icon="pi pi-file-pdf"
                          @click="generateReport"
                        />
                      </div>
                    </template>
                  </Card>
                </div>

                <!-- Activity Log -->
                <Card>
                  <template #title>
                    <h3 class="text-lg font-semibold text-color">Recent Activity</h3>
                  </template>
                  <template #content>
                    <DataTable
                      :value="activityLog"
                      :paginator="true"
                      :rows="5"
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} activities"
                      responsiveLayout="scroll"
                      class="p-datatable-sm"
                    >
                      <Column field="timestamp" header="Time" sortable>
                        <template #body="{ data }">
                          <span class="text-sm text-color-secondary">{{ formatDate(data.timestamp) }}</span>
                        </template>
                      </Column>

                      <Column field="user_email" header="User" sortable>
                        <template #body="{ data }">
                          <span class="text-sm text-color">{{ data.user_email }}</span>
                        </template>
                      </Column>

                      <Column field="action" header="Action" sortable>
                        <template #body="{ data }">
                          <span class="text-sm text-color">{{ data.action }}</span>
                        </template>
                      </Column>

                      <Column field="details" header="Details">
                        <template #body="{ data }">
                          <span class="text-sm text-color-secondary">{{ data.details }}</span>
                        </template>
                      </Column>
                    </DataTable>
                  </template>
                </Card>
              </div>
            </TabPanel>
          </TabView>
        </template>
      </Card>
    </div>

    <!-- User Details Modal -->
    <Dialog
      v-model:visible="showUserModal"
      modal
      header="User Details"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedUser" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-color mb-1">Name</label>
            <p class="text-sm text-color-secondary">{{ selectedUser.first_name }} {{ selectedUser.last_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-1">Email</label>
            <p class="text-sm text-color-secondary">{{ selectedUser.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-1">Role</label>
            <Tag
              :value="selectedUser.role"
              :severity="getRoleSeverity(selectedUser.role)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-1">Subscription</label>
            <Tag
              :value="selectedUser.subscription_type"
              :severity="selectedUser.subscription_type === 'premium' ? 'primary' : 'secondary'"
            />
          </div>
        </div>

        <div v-if="selectedUser.family">
          <label class="block text-sm font-medium text-color mb-1">Family</label>
          <p class="text-sm text-color-secondary">{{ selectedUser.family.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-color mb-1">Created</label>
          <p class="text-sm text-color-secondary">{{ formatDate(selectedUser.created_at) }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <Button
            label="Close"
            severity="secondary"
            @click="showUserModal = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'admin']
})

const { $toast } = useNuxtApp()
const db = useDatabase()

// Reactive data
const activeTabIndex = ref(0)
const users = ref([])
const activityLog = ref([])
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalBooks: 0,
  totalAssets: 0
})

// User management
const userSearch = ref('')
const roleFilter = ref('all')
const showUserModal = ref(false)
const selectedUser = ref(null)

// System info
const systemInfo = ref({
  environment: 'development',
  database: 'Supabase',
  storage: 'Supabase Storage'
})

// Options
const roleOptions = ref([
  { label: 'All Roles', value: 'all' },
  { label: 'Users', value: 'user' },
  { label: 'Editors', value: 'editor' },
  { label: 'Admins', value: 'admin' }
])

const userRoleOptions = ref([
  { label: 'User', value: 'user' },
  { label: 'Editor', value: 'editor' },
  { label: 'Admin', value: 'admin' }
])

// Computed properties
const filteredUsers = computed(() => {
  let filtered = [...users.value]

  // Apply search filter
  if (userSearch.value) {
    const search = userSearch.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.first_name?.toLowerCase().includes(search) ||
      user.last_name?.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }

  // Apply role filter
  if (roleFilter.value !== 'all') {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  return filtered
})

// Load data
onMounted(async () => {
  await loadUsers()
  await loadStats()
  await loadActivityLog()
})

// Load users
const loadUsers = async () => {
  try {
    const allUsers = await db.admin.getUsers()
    users.value = allUsers
  } catch (error) {
    console.error('Error loading users:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users',
      life: 3000
    })
  }
}

// Load stats
const loadStats = async () => {
  try {
    const adminStats = await db.admin.getStats()
    stats.value = adminStats
  } catch (error) {
    console.error('Error loading stats:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load statistics',
      life: 3000
    })
  }
}

// Load activity log
const loadActivityLog = async () => {
  try {
    const log = await db.admin.getActivityLog()
    activityLog.value = log
  } catch (error) {
    console.error('Error loading activity log:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load activity log',
      life: 3000
    })
  }
}

// Update user role
const updateUserRole = async (userId, newRole) => {
  try {
    await db.admin.updateUserRole(userId, newRole)
    
    $toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'User role updated successfully',
      life: 2000
    })

    // Reload users
    await loadUsers()
  } catch (error) {
    console.error('Error updating user role:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update user role',
      life: 3000
    })
  }
}

// Delete user
const deleteUser = async (userId) => {
  try {
    await db.admin.deleteUser(userId)
    
    $toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'User deleted successfully',
      life: 2000
    })

    // Reload users and stats
    await loadUsers()
    await loadStats()
  } catch (error) {
    console.error('Error deleting user:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete user',
      life: 3000
    })
  }
}

// Restore user
const restoreUser = async (userId) => {
  try {
    await db.admin.restoreUser(userId)
    
    $toast.add({
      severity: 'success',
      summary: 'Restored',
      detail: 'User restored successfully',
      life: 2000
    })

    // Reload users and stats
    await loadUsers()
    await loadStats()
  } catch (error) {
    console.error('Error restoring user:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to restore user',
      life: 3000
    })
  }
}

// View user details
const viewUserDetails = (user) => {
  selectedUser.value = user
  showUserModal.value = true
}

// System actions
const clearCache = async () => {
  try {
    await db.admin.clearCache()
    
    $toast.add({
      severity: 'success',
      summary: 'Cache Cleared',
      detail: 'System cache cleared successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to clear cache',
      life: 3000
    })
  }
}

const backupDatabase = async () => {
  try {
    await db.admin.backupDatabase()
    
    $toast.add({
      severity: 'success',
      summary: 'Backup Created',
      detail: 'Database backup created successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create backup',
      life: 3000
    })
  }
}

const generateReport = async () => {
  try {
    await db.admin.generateReport()
    
    $toast.add({
      severity: 'success',
      summary: 'Report Generated',
      detail: 'System report generated successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error generating report:', error)
    $toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate report',
      life: 3000
    })
  }
}

// Helper functions
const getRoleSeverity = (role) => {
  const severityMap = {
    'user': 'secondary',
    'editor': 'info',
    'admin': 'danger'
  }
  return severityMap[role] || 'secondary'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Unknown date'
  }
}
</script> 