<template>
  <div class="min-h-screen surface-ground p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-color mb-2">Editor Dashboard</h1>
        <p class="text-color-secondary">Manage themes and review user submissions.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <i class="pi pi-image text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Assets</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pendingAssets }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <i class="pi pi-check-circle text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Reviewed Assets</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.reviewedAssets }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <i class="pi pi-book text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Memory Books</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.memoryBooks }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-orange-100 text-orange-600">
              <i class="pi pi-palette text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Themes</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeThemes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <TabView v-model:activeIndex="activeTabIndex">
        <!-- Asset Review Tab -->
        <TabPanel header="Asset Review">
          <!-- Asset Review Instructions and Filter -->
          <div class="mb-4">
            <div class="mb-2 text-sm text-gray-700 font-medium">
              To review assets, you must select a user by their email address below.
            </div>
            <div class="flex items-center gap-4">
              <AutoComplete
                id="user-search"
                v-model="selectedUser"
                :suggestions="userSuggestions"
                @complete="searchUsers"
                optionLabel="email"
                :optionDisabled="option => !option.user_id"
                placeholder="Type to search users..."
                class="w-80"
                inputClass="w-full h-11 px-4 py-2 text-base rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                :dropdown="true"
                :forceSelection="true"
                field="email"
                :itemTemplate="user => `${user.email?.split('@')[0] || ''} (${user.first_name || ''} ${user.last_name || ''})`"
              />
              <div class="flex items-center gap-2">
                <input type="checkbox" v-model="showOnlyUnapprovedUsers" id="showOnlyUnapprovedUsers" />
                <label for="showOnlyUnapprovedUsers" class="text-sm text-gray-700">Show only users with unapproved assets</label>
              </div>
            </div>
          </div>

          <!-- User Summary Header -->
          <div v-if="selectedUser && selectedUser.user_id" class="mb-4 p-4 bg-surface-100 rounded-lg flex flex-col sm:flex-row sm:items-center gap-2">
            <div class="font-semibold text-color">User: <span class="text-primary">{{ selectedUser.email }}</span></div>
            <div class="text-sm text-gray-700">Total Assets: <span class="font-bold">{{ userAssetStats.total }}</span></div>
            <div class="text-sm text-gray-700">Approved Assets: <span class="font-bold">{{ userAssetStats.approved }}</span></div>
          </div>

          <!-- Assets Data Table (only if user selected) -->
          <div v-if="selectedUser && selectedUser.user_id">
            <DataTable
              :value="filteredAssets"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} assets"
              responsiveLayout="scroll"
              class="p-datatable-sm"
            >
              <Column field="type" header="Type" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="data.type"
                    :severity="data.type === 'photo' ? 'primary' : 'secondary'"
                  />
                </template>
              </Column>

              <Column field="title" header="Title" sortable>
                <template #body="{ data }">
                  <div class="max-w-xs truncate" :title="data.title">
                    {{ data.title || 'Untitled' }}
                  </div>
                </template>
              </Column>

              <Column field="ai_caption" header="AI Caption">
                <template #body="{ data }">
                  <div class="max-w-xs truncate" :title="data.ai_caption">
                    {{ data.ai_caption || 'No caption' }}
                  </div>
                </template>
              </Column>

              <Column field="approved" header="Status" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="data.approved ? 'Approved' : 'Pending'"
                    :severity="data.approved ? 'success' : 'warning'"
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
                      v-if="!data.approved"
                      icon="pi pi-check"
                      severity="success"
                      size="small"
                      @click="approveAsset(data.id)"
                    />
                    <Button
                      v-if="!data.approved"
                      icon="pi pi-times"
                      severity="danger"
                      size="small"
                      @click="rejectAsset(data.id)"
                    />
                    <Button
                      icon="pi pi-eye"
                      severity="info"
                      size="small"
                      @click="viewAsset(data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- No User Selected Message -->
          <div v-else class="text-center py-8">
            <i class="pi pi-users text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">Select a user above to review their assets.</p>
          </div>
        </TabPanel>

        <!-- Memory Books Tab -->
        <TabPanel header="Memory Books">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-color">Memory Books</h3>
              <div class="flex items-center space-x-4">
                <InputText
                  v-model="bookSearch"
                  placeholder="Search books..."
                  class="w-64"
                />
                <Dropdown
                  v-model="bookStatusFilter"
                  :options="bookStatusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Status"
                  class="w-32"
                />
              </div>
            </div>

            <!-- Memory Books Data Table -->
            <DataTable
              :value="filteredBooks"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} books"
              responsiveLayout="scroll"
              class="p-datatable-sm"
            >
              <Column field="title" header="Title" sortable>
                <template #body="{ data }">
                  <div class="max-w-xs truncate" :title="data.title">
                    {{ data.title || 'Untitled' }}
                  </div>
                </template>
              </Column>

              <Column field="status" header="Status" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="getBookStatusText(data.status)"
                    :severity="getBookStatusSeverity(data.status)"
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
                      v-if="data.status === 'ready'"
                      icon="pi pi-download"
                      severity="info"
                      size="small"
                      @click="downloadBook(data)"
                    />
                    <Button
                      v-if="data.status === 'draft'"
                      icon="pi pi-play"
                      severity="success"
                      size="small"
                      @click="generateBook(data)"
                    />
                    <Button
                      icon="pi pi-eye"
                      severity="info"
                      size="small"
                      @click="viewBook(data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>

        <!-- Themes Tab -->
        <TabPanel header="Themes">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-color">Manage Themes</h3>
              <div class="flex items-center gap-4">
                <!-- Show Deleted Themes Toggle -->
                <div class="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="showDeletedThemes" 
                    v-model="showDeletedThemes"
                    @change="loadDeletedThemes"
                    class="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 rounded ring-2 ring-gray-500 focus:ring-green-500 focus:ring-2 checked:bg-green-50 checked:border-green-500"
                  />
                  <label for="showDeletedThemes" class="text-sm text-gray-700 cursor-pointer">Show deleted themes</label>
                </div>
                <Button
                  label="Create New Theme"
                  icon="pi pi-plus"
                  @click="showCreateThemeModal = true"
                />
              </div>
            </div>

            <!-- Active/Inactive Themes Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="theme in themes"
                :key="theme.id"
                class="bg-white p-4 rounded-lg shadow border relative"
                :class="{ 'opacity-75 border-gray-300': !theme.is_active, 'border-green-200': theme.is_active }"
              >
                <!-- Delete Icon for Admin Users -->
                <button
                  v-if="userProfile && userProfile.role === 'admin'"
                  @click="deleteTheme(theme.id)"
                  class="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Theme"
                >
                  <i class="pi pi-trash text-sm"></i>
                </button>
                
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-color">{{ theme.name }}</h4>
                  <Tag
                    :value="theme.is_active ? 'Active' : 'Inactive'"
                    :severity="theme.is_active ? 'success' : 'secondary'"
                  />
                </div>
                <p class="text-sm text-color-secondary mb-3">{{ theme.description || 'No description' }}</p>
                <div class="flex items-center space-x-2">
                  <Button
                    v-if="!theme.is_active"
                    label="Activate"
                    severity="success"
                    size="small"
                    class="text-xs px-2 py-1"
                    @click="activateTheme(theme.id)"
                  />
                  <Button
                    v-else
                    label="Deactivate"
                    severity="warning"
                    size="small"
                    class="text-xs px-2 py-1"
                    @click="deactivateTheme(theme.id)"
                  />
                </div>
              </div>
            </div>

            <!-- Deleted Themes Grid -->
            <div v-if="showDeletedThemes && deletedThemes.length > 0" class="space-y-4">
              <h4 class="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Deleted Themes</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="theme in deletedThemes"
                  :key="theme.id"
                  class="bg-gray-50 p-4 rounded-lg shadow border border-red-200 relative opacity-75"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-600">{{ theme.name }}</h4>
                    <Tag
                      value="Deleted"
                      severity="danger"
                    />
                  </div>
                  <p class="text-sm text-gray-500 mb-3">{{ theme.description || 'No description' }}</p>
                  <div class="flex items-center space-x-2">
                    <Button
                      v-if="userProfile && userProfile.role === 'admin'"
                      label="Restore"
                      severity="success"
                      size="small"
                      class="text-xs px-2 py-1"
                      @click="restoreTheme(theme.id)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- No Themes Message -->
            <div v-if="themes.length === 0 && (!showDeletedThemes || deletedThemes.length === 0)" class="text-center py-8">
              <i class="pi pi-palette text-4xl text-gray-400 mb-4"></i>
              <p class="text-gray-600">No themes found. Create your first theme to get started.</p>
            </div>
          </div>
        </TabPanel>

        <!-- Users Tab (Admin Only) -->
        <TabPanel 
          header="👥 Users" 
          :disabled="!(userProfile && userProfile.role === 'admin')"
        >
          <div v-if="userProfile && userProfile.role === 'admin'" class="space-y-6">
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
                <!-- Show Deleted Users Toggle -->
                <div class="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="showDeletedUsers" 
                    v-model="showDeletedUsers"
                    @change="loadDeletedUsers"
                    class="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 rounded ring-2 ring-gray-500 focus:ring-green-500 focus:ring-2 checked:bg-green-50 checked:border-green-500"
                  />
                  <label for="showDeletedUsers" class="text-sm text-gray-700 cursor-pointer">Show deleted users</label>
                </div>
              </div>
            </div>

            <!-- Users Table -->
            <DataTable
              :value="users"
              :paginator="true"
              :rows="userRows"
              :rowsPerPageOptions="[5, 10, 20, 50]"
              :totalRecords="totalUsers"
              :loading="loadingUsers"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              :rowKey="row => row.user_id"
              :lazy="true"
              @sort="onUserSort"
              @page="onUserPage"
            >
              <Column field="email" header="Email" sortable>
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

              <Column field="first_name" header="First Name" sortable>
                <template #body="{ data }">
                  {{ data.first_name }}
                </template>
              </Column>

              <Column field="last_name" header="Last Name" sortable>
                <template #body="{ data }">
                  {{ data.last_name }}
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
                    class="w-40"
                  />
                </template>
              </Column>

              <Column field="subscription_type" header="Subscription Type" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="data.subscription_type"
                    :severity="data.subscription_type === 'premium' ? 'primary' : 'secondary'"
                  />
                </template>
              </Column>

              <Column field="deleted" header="Disabled" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="data.deleted ? 'Disabled' : 'Active'"
                    :severity="data.deleted ? 'danger' : 'success'"
                  />
                </template>
              </Column>

              <Column field="created_at" header="Created At" sortable>
                <template #body="{ data }">
                  <span class="text-sm text-color-secondary">{{ formatDateOnlyDate(data.created_at) }}</span>
                </template>
              </Column>

              <Column header="Actions">
                <template #body="{ data }">
                  <div class="flex items-center space-x-2">
                    <Button
                      v-if="!data.deleted"
                      icon="pi pi-ban"
                      severity="warning"
                      size="small"
                      @click="disableUser(data.user_id)"
                      title="Disable User"
                    />
                    <Button
                      v-else
                      icon="pi pi-refresh"
                      severity="success"
                      size="small"
                      @click="restoreUser(data.user_id)"
                      title="Restore User"
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

            <!-- Deleted Users Section -->
            <div v-if="showDeletedUsers && deletedUsers.length > 0" class="mt-8 space-y-4">
              <h3 class="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Deleted Users</h3>
              <DataTable
                :value="deletedUsers"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} deleted users"
                responsiveLayout="scroll"
                class="p-datatable-sm"
              >
                <Column field="name" header="User" sortable>
                  <template #body="{ data }">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span class="text-gray-500 font-medium">
                            {{ data.first_name ? data.first_name.charAt(0) : data.email.charAt(0).toUpperCase() }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-600">
                          {{ data.first_name }} {{ data.last_name }}
                        </div>
                        <div class="text-sm text-gray-500">{{ data.email }}</div>
                      </div>
                    </div>
                  </template>
                </Column>

                <Column field="role" header="Role" sortable>
                  <template #body="{ data }">
                    <Tag
                      :value="data.role"
                      :severity="getRoleSeverity(data.role)"
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

                <Column field="created_at" header="Created" sortable>
                  <template #body="{ data }">
                    <span class="text-sm text-color-secondary">{{ formatDateOnlyDate(data.created_at) }}</span>
                  </template>
                </Column>

                <Column header="Actions">
                  <template #body="{ data }">
                    <div class="flex items-center space-x-2">
                      <Button
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
          </div>

          <!-- Access Denied Message -->
          <div v-else class="text-center py-8">
            <i class="pi pi-lock text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">Admin access required to view user management.</p>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <!-- Create Theme Modal -->
    <Dialog
      v-model:visible="showCreateThemeModal"
      modal
      header="Create New Theme"
      :style="{ width: '500px' }"
    >
      <div class="space-y-4">
        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Theme Name</label>
          <InputText
            v-model="newTheme.name"
            placeholder="Enter theme name"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Description</label>
          <Textarea
            v-model="newTheme.description"
            placeholder="Enter theme description"
            rows="3"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Preview Image URL</label>
          <InputText
            v-model="newTheme.preview_image_url"
            placeholder="Paste preview image URL"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Background Color</label>
            <InputText
              v-model="newTheme.background_color"
              placeholder="#fffbe9"
              class="w-full"
            />
          </div>
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Background Opacity</label>
            <InputText
              v-model.number="newTheme.background_opacity"
              type="number"
              min="0"
              max="100"
              placeholder="100"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Header Font</label>
            <InputText
              v-model="newTheme.header_font"
              placeholder="e.g., 'Times New Roman'"
              class="w-full"
            />
          </div>
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Body Font</label>
            <InputText
              v-model="newTheme.body_font"
              placeholder="e.g., Arial"
              class="w-full"
            />
          </div>
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Signature Font</label>
          <InputText
            v-model="newTheme.signature_font"
            placeholder="e.g., 'Brush Script MT'"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Header Font Color</label>
            <InputText
              v-model="newTheme.header_font_color"
              placeholder="#000000"
              class="w-full"
            />
          </div>
          <div class="field">
            <label class="block text-sm font-medium text-color mb-1">Body Font Color</label>
            <InputText
              v-model="newTheme.body_font_color"
              placeholder="#333333"
              class="w-full"
            />
          </div>
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Signature Font Color</label>
          <InputText
            v-model="newTheme.signature_font_color"
            placeholder="#666666"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-color mb-1">Layout Config (JSON)</label>
          <Textarea
            v-model="newTheme.layout_config"
            placeholder='{"example": "JSON configuration"}'
            rows="3"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            severity="secondary"
            @click="showCreateThemeModal = false"
          />
          <Button
            label="Create Theme"
            :loading="creatingTheme"
            @click="createTheme"
          />
        </div>
      </template>
    </Dialog>

    <!-- User Details Modal -->
    <Dialog
      v-model:visible="showUserModal"
      modal
      header="User Details"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedUserForDetails" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-color mb-1">Name</label>
            <p class="text-sm text-color-secondary">{{ selectedUserForDetails.first_name }} {{ selectedUserForDetails.last_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-1">Email</label>
            <p class="text-sm text-color-secondary">{{ selectedUserForDetails.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-1">Role</label>
            <Tag
              :value="selectedUserForDetails.role"
              :severity="getRoleSeverity(selectedUserForDetails.role)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-1">Subscription</label>
            <Tag
              :value="selectedUserForDetails.subscription_type"
              :severity="selectedUserForDetails.subscription_type === 'premium' ? 'primary' : 'secondary'"
            />
          </div>
        </div>

        <div v-if="selectedUserForDetails.family">
          <label class="block text-sm font-medium text-color mb-1">Family</label>
          <p class="text-sm text-color-secondary">{{ selectedUserForDetails.family.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-color mb-1">Created</label>
          <p class="text-sm text-color-secondary">{{ formatDate(selectedUserForDetails.created_at) }}</p>
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
  middleware: ['auth', 'editor']
})

import { useToast } from 'primevue/usetoast'

const db = useDatabase()
const toast = useToast()

// User profile for admin checks
const userProfile = ref(null)

// Router and user selection
const router = useRouter()
const selectedUser = ref(null)
const userSuggestions = ref([])
const showOnlyUnapprovedUsers = ref(true)

// Reactive data
const activeTabIndex = ref(0)
const assets = ref([])
const books = ref([])
const themes = ref([])
const stats = ref({
  pendingAssets: 0,
  reviewedAssets: 0,
  memoryBooks: 0,
  activeThemes: 0
})

// Filters
const assetSearch = ref('')
const assetStatusFilter = ref('all')
const bookSearch = ref('')
const bookStatusFilter = ref('all')

// Theme management
const showCreateThemeModal = ref(false)
const creatingTheme = ref(false)
const showDeletedThemes = ref(false)
const deletedThemes = ref([])
const newTheme = ref({
  name: '',
  description: '',
  preview_image_url: '',
  is_active: true,
  background_color: '#fffbe9',
  background_opacity: 100,
  header_font: '',
  body_font: '',
  signature_font: '',
  header_font_color: '',
  body_font_color: '',
  signature_font_color: '',
  layout_config: ''
})

// User management variables
const users = ref([])
const userSearch = ref('')
const roleFilter = ref('all')
const showUserModal = ref(false)
const selectedUserForDetails = ref(null)
const showDeletedUsers = ref(false)
const deletedUsers = ref([])

// User management options
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

// Computed properties for user management
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

const userAssetStats = computed(() => {
  if (!selectedUser.value || !selectedUser.value.user_id) return { total: 0, approved: 0 }
  const userAssets = assets.value.filter(a => a.user_id === selectedUser.value.user_id)
  return {
    total: userAssets.length,
    approved: userAssets.filter(a => a.approved).length
  }
})

const userBookStats = computed(() => {
  if (!selectedUser.value || !selectedUser.value.user_id) return { total: 0, approved: 0 }
  const userBooks = books.value.filter(b => b.user_id === selectedUser.value.user_id)
  return {
    total: userBooks.length,
    approved: userBooks.filter(b => b.status === 'approved').length
  }
})

// Update searchUsers to respect showOnlyUnapprovedUsers
async function searchUsers(event) {
  const q = event.query?.trim()
  if (!q) {
    userSuggestions.value = []
    return
  }
  try {
    let url = `/api/users/search?q=${encodeURIComponent(q)}`
    if (showOnlyUnapprovedUsers.value) {
      url += '&unapprovedOnly=true'
    }
    const res = await fetch(url)
    userSuggestions.value = await res.json()
  } catch (e) {
    userSuggestions.value = []
  }
}

// Load assets for selected user
const loadUserAssets = async (userId) => {
  try {
    const res = await fetch(`/api/users/${userId}/assets`)
    if (!res.ok) {
      throw new Error('Failed to fetch user assets')
    }
    const userAssets = await res.json()
    assets.value = userAssets
  } catch (error) {
    console.error('Error loading user assets:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load user assets',
      life: 3000
    })
    assets.value = []
  }
}

// Load memory books for selected user
const loadUserBooks = async (userId) => {
  try {
    const res = await fetch(`/api/users/${userId}/memory-books`)
    if (!res.ok) {
      throw new Error('Failed to fetch user memory books')
    }
    const userBooks = await res.json()
    books.value = userBooks
  } catch (error) {
    console.error('Error loading user memory books:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load user memory books',
      life: 3000
    })
    books.value = []
  }
}

// Watch for user selection
watch(selectedUser, async (newUser) => {
  if (newUser && newUser.user_id) {
    console.log('[User Selected] Loading data for user:', newUser.email, 'ID:', newUser.user_id)
    // Load data based on active tab
    if (activeTabIndex.value === 0) {
      // Asset Review tab
      await loadUserAssets(newUser.user_id)
    } else if (activeTabIndex.value === 1) {
      // Memory Books tab
      await loadUserBooks(newUser.user_id)
    }
  } else {
    assets.value = []
    books.value = []
  }
})

// Watch for tab changes to load appropriate data
watch(activeTabIndex, async (newIndex) => {
  console.log('[Tab Change] activeTabIndex:', newIndex)
  if (selectedUser.value && selectedUser.value.user_id) {
    if (newIndex === 0) {
      // Asset Review tab
      console.log('[Tab Change] Asset Review tab activated, loading user assets')
      await loadUserAssets(selectedUser.value.user_id)
    } else if (newIndex === 1) {
      // Memory Books tab
      console.log('[Tab Change] Memory Books tab activated, loading user books')
      await loadUserBooks(selectedUser.value.user_id)
    }
  }
})

// Options
const statusOptions = ref([
  { label: 'All Status', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
])

const bookStatusOptions = ref([
  { label: 'All Status', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Ready', value: 'ready' },
  { label: 'Approved', value: 'approved' }
])

// Computed properties
const filteredAssets = computed(() => {
  if (!selectedUser.value || !selectedUser.value.user_id) return []
  let filtered = [...assets.value]

  // Apply search filter
  if (assetSearch.value) {
    const search = assetSearch.value.toLowerCase()
    filtered = filtered.filter(asset => 
      asset.user_caption?.toLowerCase().includes(search) ||
      asset.ai_caption?.toLowerCase().includes(search)
    )
  }

  // Apply status filter
  if (assetStatusFilter.value !== 'all') {
    filtered = filtered.filter(asset => {
      if (assetStatusFilter.value === 'pending') return !asset.approved
      if (assetStatusFilter.value === 'approved') return asset.approved
      if (assetStatusFilter.value === 'rejected') return asset.rejected
      return true
    })
  }

  return filtered
})

const filteredBooks = computed(() => {
  if (!selectedUser.value || !selectedUser.value.user_id) return []
  let filtered = [...books.value]

  // Apply search filter
  if (bookSearch.value) {
    const search = bookSearch.value.toLowerCase()
    filtered = filtered.filter(book => 
      book.title?.toLowerCase().includes(search)
    )
  }

  // Apply status filter
  if (bookStatusFilter.value !== 'all') {
    filtered = filtered.filter(book => book.status === bookStatusFilter.value)
  }

  return filtered
})

// Load data
onMounted(async () => {

  await loadThemes()
  await loadStats()
  await loadUserProfile() // Load user profile for admin checks
  
  // Display role-based toast after profile is loaded
  if (userProfile.value) {
    const role = userProfile.value.role
    if (role === 'admin' || role === 'editor') {
      const roleText = role === 'admin' ? 'Administrator' : 'Editor'
      const severity = role === 'admin' ? 'danger' : 'warning'
      
      toast.add({
        severity: severity,
        summary: `Welcome, ${roleText}!`,
        detail: `You have ${role} privileges and can manage themes, review assets, and ${role === 'admin' ? 'manage users' : 'approve content'}.`,
        life: 10000 // 10 seconds
      })
    }
  }

  // Check for tab query parameter and set active tab
  const route = useRoute()
  if (route.query.tab) {
    const tabIndex = parseInt(route.query.tab)
    if (tabIndex >= 0 && tabIndex <= 3) { // Updated to include Users tab (index 3)
      activeTabIndex.value = tabIndex
    }
  }
  
  // Check for userId query parameter and restore selected user
  if (route.query.userId) {
    const userId = route.query.userId
    try {
      // Fetch user info by ID to restore the selected user
      const res = await fetch(`/api/users/${userId}/info`)
      if (res.ok) {
        const userInfo = await res.json()
        selectedUser.value = userInfo
        console.log('Restored selected user:', userInfo.email)
      }
    } catch (error) {
      console.error('Error restoring user:', error)
    }
  }
  
  // Load users if admin
  if (userProfile.value && userProfile.value.role === 'admin') {
    await loadUsers()
  }
})

// Watch for tab changes to load users when Users tab is selected
watch(activeTabIndex, async (newIndex) => {
  console.log('[Tab Change] activeTabIndex:', newIndex)
  
  // If Users tab is selected (index 3) and user is admin, load users
  if (newIndex === 3 && userProfile.value && userProfile.value.role === 'admin') {
    console.log('[Tab Change] Loading users for admin user')
    await loadUsers()
  }
})

// Load themes
const loadThemes = async () => {
  try {
    const allThemes = await db.editor.getThemes()
    themes.value = allThemes
  } catch (error) {
    console.error('Error loading themes:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load themes',
      life: 3000
    })
  }
}

// Load deleted themes
const loadDeletedThemes = async () => {
  try {
    const deleted = await db.editor.getDeletedThemes()
    deletedThemes.value = deleted
  } catch (error) {
    console.error('Error loading deleted themes:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load deleted themes',
      life: 3000
    })
  }
}

// Load stats
const loadStats = async () => {
  try {
    const editorStats = await db.editor.getStats()
    stats.value = editorStats
  } catch (error) {
    console.error('Error loading stats:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load statistics',
      life: 3000
    })
  }
}

// Load user profile
const loadUserProfile = async () => {
  try {
    userProfile.value = await db.getCurrentProfile()
    console.log('[loadUserProfile] User profile loaded:', userProfile.value)
    console.log('[loadUserProfile] User role:', userProfile.value?.role)
  } catch (error) {
    console.error('Error loading user profile:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load user profile',
      life: 3000
    })
  }
}

// Load users
const userSortField = ref('created_at')
const userSortOrder = ref(-1) // -1 for desc, 1 for asc
const userPage = ref(1)
const userRows = ref(10)
const totalUsers = ref(0)
const loadingUsers = ref(false)

const onUserSort = async (event) => {
  userSortField.value = event.sortField
  userSortOrder.value = event.sortOrder
  await loadUsers()
}

const onUserPage = async (event) => {
  userPage.value = event.page + 1 // PrimeVue pages are 0-based
  userRows.value = event.rows
  await loadUsers()
}

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const sortOrderParam = userSortOrder.value === 1 ? 'asc' : 'desc'
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    const res = await fetch(`/api/users/all?sortField=${userSortField.value}&sortOrder=${sortOrderParam}&page=${userPage.value}&rows=${userRows.value}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    const result = await res.json()
    users.value = result.data
    totalUsers.value = result.totalCount
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users',
      life: 3000
    })
  } finally {
    loadingUsers.value = false
  }
}

// Load deleted users
const loadDeletedUsers = async () => {
  if (!showDeletedUsers.value) {
    deletedUsers.value = []
    return
  }
  
  try {
    const deletedUsersData = await db.admin.getDeletedUsers()
    deletedUsers.value = deletedUsersData
  } catch (error) {
    console.error('Error loading deleted users:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load deleted users',
      life: 3000
    })
  }
}

// Update user role
const updateUserRole = async (userId, newRole) => {
  try {
    await db.admin.updateUserRole(userId, newRole)
    
    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'User role updated successfully',
      life: 2000
    })

    // Reload users
    await loadUsers()
  } catch (error) {
    console.error('Error updating user role:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update user role',
      life: 3000
    })
  }
}

// Disable user
const disableUser = async (userId) => {
  try {
    const res = await fetch(`/api/users/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
    if (!res.ok) throw new Error('Failed to disable user')
    toast.add({
      severity: 'success',
      summary: 'User Disabled',
      detail: 'The user has been disabled.',
      life: 3000
    })
    // Optionally refresh users list
    await loadUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to disable user',
      life: 3000
    })
  }
}

// Restore user
const restoreUser = async (userId) => {
  try {
    const res = await fetch(`/api/users/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
    if (!res.ok) throw new Error('Failed to restore user')
    toast.add({
      severity: 'success',
      summary: 'User Restored',
      detail: 'The user has been restored.',
      life: 3000
    })
    await loadUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to restore user',
      life: 3000
    })
  }
}

// View user details
const viewUserDetails = (user) => {
  selectedUserForDetails.value = user
  showUserModal.value = true
}

// Asset actions
const approveAsset = async (assetId) => {
  try {
    await db.editor.approveAsset(assetId)
    
    toast.add({
      severity: 'success',
      summary: 'Approved',
      detail: 'Asset approved successfully',
      life: 2000
    })

    // Reload assets for current user and stats
    if (selectedUser.value?.user_id) {
      await loadUserAssets(selectedUser.value.user_id)
    }
    await loadStats()
  } catch (error) {
    console.error('Error approving asset:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to approve asset',
      life: 3000
    })
  }
}

const rejectAsset = async (assetId) => {
  try {
    await db.editor.rejectAsset(assetId)
    
    toast.add({
      severity: 'success',
      summary: 'Rejected',
      detail: 'Asset rejected',
      life: 2000
    })

    // Reload assets for current user and stats
    if (selectedUser.value?.user_id) {
      await loadUserAssets(selectedUser.value.user_id)
    }
    await loadStats()
  } catch (error) {
    console.error('Error rejecting asset:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to reject asset',
      life: 3000
    })
  }
}

// Book actions
const downloadBook = async (book) => {
  try {
    const pdfUrl = await db.editor.downloadBook(book.id)
    
    // Create download link
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `memory-book-${book.id.slice(-6)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.add({
      severity: 'success',
      summary: 'Downloaded',
      detail: 'Book downloaded successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error downloading book:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to download book',
      life: 3000
    })
  }
}

const generateBook = async (book) => {
  try {
    await db.editor.generateBook(book.id)
    
    toast.add({
      severity: 'success',
      summary: 'Generated',
      detail: 'Book generated successfully',
      life: 3000
    })

    // Reload books for current user
    if (selectedUser.value?.user_id) {
      await loadUserBooks(selectedUser.value.user_id)
    }
  } catch (error) {
    console.error('Error generating book:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate book',
      life: 3000
    })
  }
}

const viewBook = (book) => {
  const queryParams = { userId: selectedUser.value?.user_id }
  router.push({ path: `/app/memory-books/${book.id}`, query: queryParams })
}

// Theme actions
const createTheme = async () => {
  
  if (!newTheme.value.name) {
    return
  }

  // Check if theme name already exists
  const existingTheme = themes.value.find(theme => 
    theme.name.toLowerCase() === newTheme.value.name.toLowerCase()
  )
  
  if (existingTheme) {
    toast.add({
      severity: 'error',
      summary: 'Duplicate Name',
      detail: 'A theme with this name already exists. Please choose a different name.',
      life: 5000
    })
    return
  }

  creatingTheme.value = true

  try {
    const themeToSave = { ...newTheme.value }
    
    if (themeToSave.layout_config && typeof themeToSave.layout_config === 'string') {
      try {
        themeToSave.layout_config = JSON.parse(themeToSave.layout_config)
      } catch (e) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Layout config must be valid JSON',
          life: 3000
        })
        creatingTheme.value = false
        return
      }
    }
    
    const createdTheme = await db.editor.createTheme(themeToSave)
    
    toast.add({
      severity: 'success',
      summary: 'Created',
      detail: 'Theme created successfully',
      life: 3000
    })
    
    // Reset form and close modal
    newTheme.value = {
      name: '',
      description: '',
      preview_image_url: '',
      is_active: true,
      background_color: '#fffbe9',
      background_opacity: 100,
      header_font: '',
      body_font: '',
      signature_font: '',
      header_font_color: '',
      body_font_color: '',
      signature_font_color: '',
      layout_config: ''
    }
    showCreateThemeModal.value = false
    
    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('Error creating theme:', error)
    
    // Handle specific error types
    let errorMessage = 'Failed to create theme'
    
    if (error.code === '23505' && error.message.includes('themes_name_key')) {
      errorMessage = 'A theme with this name already exists. Please choose a different name.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    creatingTheme.value = false
  }
}

const activateTheme = async (themeId) => {
  try {
    await db.editor.activateTheme(themeId)
    
    toast.add({
      severity: 'success',
      summary: 'Activated',
      detail: 'Theme activated successfully',
      life: 2000
    })

    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('Error activating theme:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to activate theme',
      life: 3000
    })
  }
}

const deactivateTheme = async (themeId) => {
  try {
    await db.editor.deactivateTheme(themeId)
    
    toast.add({
      severity: 'success',
      summary: 'Deactivated',
      detail: 'Theme deactivated successfully',
      life: 2000
    })

    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('Error deactivating theme:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to deactivate theme',
      life: 3000
    })
  }
}

const deleteTheme = async (themeId) => {
  if (!confirm('Are you sure you want to delete this theme?')) {
    return
  }
  try {
    await db.editor.deleteTheme(themeId)
    if (toast && toast.add) {
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Theme deleted successfully',
        life: 3000
      })
    }
    await loadThemes()
    if (showDeletedThemes.value) {
      await loadDeletedThemes()
    }
  } catch (error) {
    console.error('Error deleting theme:', error)
    if (toast && toast.add) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete theme',
        life: 3000
      })
    }
  }
}

const restoreTheme = async (themeId) => {
  if (!confirm('Are you sure you want to restore this theme?')) {
    return
  }
  try {
    await db.editor.restoreTheme(themeId)
    toast.add({
      severity: 'success',
      summary: 'Restored',
      detail: 'Theme restored successfully',
      life: 3000
    })
    await loadThemes()
    await loadDeletedThemes()
  } catch (error) {
    console.error('Error restoring theme:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to restore theme',
      life: 3000
    })
  }
}

// Helper functions
const getBookStatusText = (status) => {
  const statusMap = {
    'draft': 'Draft',
    'ready': 'Ready',
    'approved': 'Approved',
    'archived': 'Archived'
  }
  return statusMap[status] || status
}

const getBookStatusSeverity = (status) => {
  const severityMap = {
    'draft': 'warning',
    'ready': 'info',
    'approved': 'success',
    'archived': 'secondary'
  }
  return severityMap[status] || 'info'
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

const formatDateOnlyDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    return 'Unknown date'
  }
}

const getRoleSeverity = (role) => {
  const severityMap = {
    'user': 'secondary',
    'editor': 'info',
    'admin': 'danger'
  }
  return severityMap[role] || 'secondary'
}
</script> 