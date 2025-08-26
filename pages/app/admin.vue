<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-brand-primary mb-2">Admin Dashboard</h1>
        <p class="text-brand-primary/70">Manage themes and review user submissions.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-brand-highlight/20 text-brand-highlight">
              <i class="pi pi-image text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-brand-primary/70">Pending Assets</p>
              <p class="text-2xl font-bold text-brand-primary">{{ stats.pendingAssets }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-brand-header/20 text-brand-header">
              <i class="pi pi-check-circle text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-brand-primary/70">Reviewed Assets</p>
              <p class="text-2xl font-bold text-brand-primary">{{ stats.reviewedAssets }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-brand-secondary/20 text-brand-secondary">
              <i class="pi pi-book text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-brand-primary/70">Memory Books</p>
              <p class="text-2xl font-bold text-brand-primary">{{ stats.memoryBooks }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-brand-accent/20 text-brand-accent">
              <i class="pi pi-palette text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-brand-primary/70">Active Themes</p>
              <p class="text-2xl font-bold text-brand-primary">{{ stats.activeThemes }}</p>
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
            <div class="mb-2 text-sm text-brand-primary/70 font-medium">
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
                inputClass="w-full h-11 px-4 py-2 text-base rounded-lg border border-brand-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                :dropdown="true"
                :forceSelection="true"
                field="email"
                :itemTemplate="user => `${user.email?.split('@')[0] || ''} (${user.first_name || ''} ${user.last_name || ''})`"
              />
              <div class="flex items-center gap-2">
                <div class="relative">
                  <input 
                    type="checkbox" 
                    v-model="showOnlyUnapprovedUsers" 
                    id="showOnlyUnapprovedUsers"
                    class="w-4 h-4 text-brand-primary bg-white border-2 border-brand-primary/30 rounded transition-all duration-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary checked:bg-brand-primary checked:border-brand-primary hover:border-brand-primary/50"
                  />
                  <div 
                    v-if="showOnlyUnapprovedUsers"
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <label for="showOnlyUnapprovedUsers" class="text-sm text-brand-primary/70 cursor-pointer select-none">Show only users with unapproved assets</label>
              </div>
            </div>
          </div>

          <!-- User Summary Header -->
          <div v-if="selectedUser && selectedUser.user_id" class="mb-4 p-4 bg-brand-surface-100 rounded-lg flex flex-col sm:flex-row sm:items-center gap-2">
            <div class="font-semibold text-brand-primary">User: <span class="text-brand-primary">{{ selectedUser.email }}</span></div>
            <div class="text-sm text-brand-primary/70">Total Assets: <span class="font-bold">{{ userAssetStats.total }}</span></div>
            <div class="text-sm text-brand-primary/70">Approved Assets: <span class="font-bold">{{ userAssetStats.approved }}</span></div>
          </div>

                      <!-- Assets Data Table (only if user selected) -->
            <div v-if="selectedUser && selectedUser.user_id" class="max-w-7xl mx-auto">
              <DataTable
                :value="filteredAssets"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} assets"
                responsiveLayout="scroll"
                class="p-datatable-sm text-sm"
                style="font-size: 0.875rem;"
              >
              <Column field="type" header="Type" sortable>
                <template #body="{ data }">
                  <Tag
                    :value="data.type"
                    :severity="data.type === 'photo' ? 'primary' : 'secondary'"
                  />
                </template>
              </Column>

              <Column field="title" header="Title" sortable style="min-width: 150px; max-width: 200px;">
                <template #body="{ data }">
                  <div class="truncate" :title="data.title">
                    {{ data.title || 'Untitled' }}
                  </div>
                </template>
              </Column>

              <Column field="ai_caption" header="AI Caption" style="min-width: 200px; max-width: 300px;">
                <template #body="{ data }">
                  <div class="truncate" :title="data.ai_caption">
                    {{ data.ai_caption || 'No caption' }}
                  </div>
                </template>
              </Column>

              <Column field="ai_description" header="AI Description" style="min-width: 200px; max-width: 300px;">
                <template #body="{ data }">
                  <div class="truncate" :title="data.ai_description">
                    {{ data.ai_description || 'No description' }}
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
                  <span class="text-sm text-brand-primary/70">{{ formatDate(data.created_at) }}</span>
                </template>
              </Column>

              <Column header="Actions">
                <template #body="{ data }">
                  <div class="flex items-center space-x-2">
                    <Button
                      v-if="!data.approved"
                      icon="pi pi-check"
                      class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-2 py-1 text-xs"
                      @click="approveAsset(data.id)"
                    />
                    <Button
                      v-if="!data.approved"
                      icon="pi pi-times"
                      class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-2 py-1 text-xs"
                      @click="rejectAsset(data.id)"
                    />
                    <Button
                      icon="pi pi-eye"
                      class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
                      @click="viewAsset(data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- No User Selected Message -->
          <div v-else class="text-center py-8">
            <i class="pi pi-users text-4xl text-brand-primary/40 mb-4"></i>
            <p class="text-brand-primary/70">Select a user above to review their assets.</p>
          </div>
        </TabPanel>

        <!-- Memory Books Tab -->
        <TabPanel header="Memory Books">
          <div class="space-y-4">
            <!-- Memory Books Instructions and Filter -->
            <div class="mb-4">
              <div class="mb-2 text-sm text-brand-primary/70 font-medium">
                To view memory books, you must select a user by their email address below.
              </div>
              <div class="flex items-center gap-4">
                <AutoComplete
                  id="memory-books-user-search"
                  v-model="selectedUser"
                  :suggestions="userSuggestions"
                  @complete="searchUsers"
                  optionLabel="email"
                  :optionDisabled="option => !option.user_id"
                  placeholder="Type to search users..."
                  class="w-80"
                  inputClass="w-full h-11 px-4 py-2 text-base rounded-lg border border-brand-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  :dropdown="true"
                  :forceSelection="true"
                  field="email"
                  :itemTemplate="user => `${user.email?.split('@')[0] || ''} (${user.first_name || ''} ${user.last_name || ''})`"
                />
              </div>
            </div>

            <!-- User Summary Header -->
            <div v-if="selectedUser && selectedUser.user_id" class="mb-4 p-4 bg-brand-surface-100 rounded-lg flex flex-col sm:flex-row sm:items-center gap-2">
              <div class="font-semibold text-brand-primary">User: <span class="text-brand-primary">{{ selectedUser.email }}</span></div>
              <div class="text-sm text-brand-primary/70">Total Memory Books: <span class="font-bold">{{ userBookStats.total }}</span></div>
            </div>



            <!-- Memory Books Content -->
            <div v-if="selectedUser && selectedUser.user_id">
              <!-- Memory Books Controls -->
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-brand-primary">Memory Books</h3>
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
                class="p-datatable-sm text-sm"
                style="font-size: 0.875rem;"
              >
                <Column field="title" header="Title" sortable style="min-width: 200px; max-width: 400px;">
                  <template #body="{ data }">
                    <div class="truncate" :title="data.title">
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
                    <span class="text-sm text-brand-primary/70">{{ formatDate(data.created_at) }}</span>
                  </template>
                </Column>

                <Column header="Actions">
                  <template #body="{ data }">
                    <div class="flex items-center space-x-2">
                      <Button
                        v-if="data.status === 'ready'"
                        icon="pi pi-download"
                        class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
                        @click="downloadBook(data)"
                      />
                      <Button
                        v-if="data.status === 'draft'"
                        icon="pi pi-play"
                        class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-2 py-1 text-xs"
                        @click="generateBook(data)"
                      />
                      <Button
                        icon="pi pi-eye"
                        class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
                        @click="viewBook(data)"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>

            <!-- No User Selected Message -->
            <div v-else class="text-center py-8">
              <i class="pi pi-book text-4xl text-brand-primary/40 mb-4"></i>
              <p class="text-brand-primary/70">Select a user above to view their memory books.</p>
            </div>
          </div>
        </TabPanel>

        <!-- Themes Tab -->
        <TabPanel header="Themes">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-brand-primary">Manage Themes</h3>
              <div class="flex items-center gap-4">
                <!-- Show Deleted Themes Toggle -->
                <div class="flex items-center gap-2">
                  <div class="relative">
                    <input 
                      type="checkbox" 
                      id="showDeletedThemes" 
                      v-model="showDeletedThemes"
                      @change="loadDeletedThemes"
                      class="w-4 h-4 text-brand-primary bg-white border-2 border-brand-primary/30 rounded transition-all duration-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary checked:bg-brand-primary checked:border-brand-primary hover:border-brand-primary/50"
                    />
                    <div 
                      v-if="showDeletedThemes"
                      class="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <label for="showDeletedThemes" class="text-sm text-brand-primary/70 cursor-pointer select-none">Display Trash</label>
                </div>

                <Button
                  label="Create New Theme"
                  icon="pi pi-plus"
                  @click="showCreateThemeModal = true"
                  class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-3 py-2"
                />
                <Button
                  label="Edit Layout Defaults"
                  icon="pi pi-palette"
                  @click="showLayoutDefaultsModal = true"
                  class="bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white border-0 px-3 py-2"
                />
              </div>
            </div>

            <!-- Active/Inactive Themes Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="theme in themes"
                :key="theme.id"
                class="bg-white p-4 rounded-lg shadow border relative"
                :class="{ 'opacity-75 border-brand-primary/30': !theme.is_active, 'border-brand-success': theme.is_active }"
              >

                
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-brand-primary">{{ theme.name }}</h4>
                  <Tag
                    :value="theme.is_active ? 'Active' : 'Inactive'"
                    :severity="theme.is_active ? 'success' : 'secondary'"
                  />
                </div>
                <p class="text-sm text-brand-primary/70 mb-3">{{ theme.description || 'No description' }}</p>
                <div class="flex items-center space-x-2">
                  <Button
                    label="Edit"
                    class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 text-xs px-2 py-1"
                    @click="editTheme(theme)"
                  />
                  <Button
                    label="Duplicate"
                    class="bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white border-0 text-xs px-2 py-1"
                    @click="duplicateTheme(theme)"
                  />
                  <Button
                    v-if="!theme.is_active"
                    label="Activate"
                    class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 text-xs px-2 py-1"
                    @click="activateTheme(theme.id)"
                  />
                  <Button
                    v-else
                    label="Deactivate"
                    class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 text-xs px-2 py-1"
                    @click="deactivateTheme(theme.id)"
                  />
                  <Button
                    v-if="userProfile && userProfile.role === 'admin'"
                    label="Trash"
                    class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 text-xs px-2 py-1"
                    @click="confirmDeleteTheme(theme)"
                  />
                </div>
              </div>
            </div>

            <!-- Trash Themes Grid -->
            <div v-if="showDeletedThemes && deletedThemes.length > 0" class="space-y-4">
              <h4 class="text-lg font-semibold text-brand-primary/70 border-b border-brand-primary/20 pb-2">Trash</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="theme in deletedThemes"
                  :key="theme.id"
                  class="bg-brand-gray-50 p-4 rounded-lg shadow border border-brand-red-200 relative opacity-75"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-brand-primary/70">{{ theme.name }}</h4>
                    <Tag
                      value="Deleted"
                      severity="danger"
                    />
                  </div>
                  <p class="text-sm text-brand-primary/70 mb-3">{{ theme.description || 'No description' }}</p>
                  <div class="flex items-center space-x-2">
                    <Button
                      label="Duplicate"
                      class="bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white border-0 text-xs px-2 py-1"
                      @click="duplicateTheme(theme)"
                    />
                    <Button
                      v-if="userProfile && userProfile.role === 'admin'"
                      label="Restore"
                      class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 text-xs px-2 py-1"
                      @click="restoreTheme(theme.id)"
                    />
                    <Button
                      v-if="userProfile && userProfile.role === 'admin'"
                      label="Permanent Delete"
                      class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 text-xs px-2 py-1"
                      @click="confirmPermanentDeleteTheme(theme)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- No Themes Message -->
            <div v-if="themes.length === 0 && (!showDeletedThemes || deletedThemes.length === 0)" class="text-center py-8">
              <i class="pi pi-palette text-4xl text-brand-primary/40 mb-4"></i>
              <p class="text-brand-primary/70">No themes found. Create your first theme to get started.</p>
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
              <h2 class="text-xl font-semibold text-brand-primary">User Management</h2>
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
                <!-- Trash Button -->
                <Button
                  label="Trash"
                  icon="pi pi-trash"
                  @click="showTrashDialog = true; loadDeletedUsers()"
                  class="bg-gray-600 hover:bg-gray-700 text-white border-0 px-3 py-2"
                  title="View disabled users"
                />
                <!-- View Backups Button -->
                <Button
                  label="View Backups"
                  icon="pi pi-list"
                  @click="showViewBackupsModal = true; loadBackups()"
                  class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-3 py-2"
                />
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
                      <div class="h-10 w-10 rounded-full bg-brand-primary-100 flex items-center justify-center">
                        <span class="text-brand-primary font-medium">
                          {{ data.first_name ? data.first_name.charAt(0) : data.email.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-brand-primary">
                        {{ data.first_name }} {{ data.last_name }}
                      </div>
                      <div class="text-sm text-brand-primary/70">{{ data.email }}</div>
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
                  <span class="text-sm text-brand-primary/70">{{ formatDateOnlyDate(data.created_at) }}</span>
                </template>
              </Column>

              <Column header="Actions">
                <template #body="{ data }">
                  <div class="flex items-center space-x-2">
                    <Button
                      v-if="!data.deleted"
                      icon="pi pi-trash"
                      class="bg-red-600 hover:bg-red-700 text-white border-0 px-2 py-1 text-xs"
                      @click="disableUser(data.user_id)"
                      title="Disable User"
                    />
                    <Button
                      v-else
                      icon="pi pi-refresh"
                      class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-2 py-1 text-xs"
                      @click="restoreUser(data.user_id)"
                      title="Restore User"
                    />
                    <Button
                      icon="pi pi-eye"
                      class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
                      @click="viewUserDetails(data)"
                    />
                    <Button
                      icon="pi pi-download"
                      class="bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white border-0 px-2 py-1 text-xs"
                      @click="backupUser(data.user_id)"
                      title="Backup User"
                    />

                  </div>
                </template>
              </Column>
            </DataTable>


          </div>

          <!-- Access Denied Message -->
          <div v-else class="text-center py-8">
            <i class="pi pi-lock text-4xl text-brand-primary/40 mb-4"></i>
            <p class="text-brand-primary/70">Admin access required to view user management.</p>
          </div>
        </TabPanel>

        <!-- Activity Tab -->
        <TabPanel header="📊 Activity">
          <div class="mb-4">
            <Button
              label="View Analytics Analysis Dashboard"
              icon="pi pi-chart-line"
              class="bg-brand-dialog-edit border-0 w-auto rounded-full px-6 py-2 shadow"
              @click="navigateTo('/app/analytics-dashboard')"
            />
          </div>
          <div class="space-y-6">
            <!-- Activity Type Toggle -->
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-brand-primary">Raw System Activity</h2>
              <div class="flex items-center space-x-4">
                <div class="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="activityTypeSystem" 
                    v-model="activityType" 
                    value="system"
                    class="w-4 h-4 text-brand-primary"
                  />
                  <label for="activityTypeSystem" class="text-sm text-brand-primary/70 cursor-pointer">Raw System Activity</label>
                </div>
                <div class="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="activityTypeEmail" 
                    v-model="activityType" 
                    value="email"
                    class="w-4 h-4 text-brand-primary"
                  />
                  <label for="activityTypeEmail" class="text-sm text-brand-primary/70 cursor-pointer">Email Activity</label>
                </div>
              </div>
            </div>

            <!-- User Filter -->
            <div class="flex items-center gap-4">
              <AutoComplete
                v-model="selectedActivityUser"
                :suggestions="userSuggestions"
                @complete="searchUsers"
                optionLabel="email"
                :optionDisabled="option => !option.user_id"
                placeholder="Filter by user (optional)..."
                class="w-80"
                inputClass="w-full h-11 px-4 py-2 text-base rounded-lg border border-brand-primary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                :dropdown="true"
                :forceSelection="true"
                field="email"
                :itemTemplate="user => `${user.email?.split('@')[0] || ''} (${user.first_name || ''} ${user.last_name || ''})`"
              />
              <Button
                v-if="selectedActivityUser"
                label="Clear Filter"
                icon="pi pi-times"
                @click="selectedActivityUser = null; loadActivityData()"
                class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-2"
              />
            </div>

            <!-- Email Activity Filters (only show for email activity) -->
            <div v-if="activityType === 'email'" class="flex items-center gap-4">
              <InputText
                v-model="emailFilter"
                placeholder="Filter by email address..."
                class="w-64"
              />
              <Dropdown
                v-model="emailEventTypeFilter"
                :options="emailEventTypeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="All Event Types"
                class="w-48"
              />
            </div>

            <!-- Activity Data Table -->
            <DataTable
              :value="activityData"
              :paginator="true"
              :rows="activityRows"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              :totalRecords="totalActivityRecords"
              :loading="loadingActivity"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} activities"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              :rowKey="row => row.id"
              :lazy="true"
              @page="onActivityPage"
            >
              <!-- System Activity Columns -->
              <template v-if="activityType === 'system'">
                <Column field="action" header="Action" sortable>
                  <template #body="{ data }">
                    <div class="max-w-xs truncate" :title="data.action || 'No action'">
                      <Tag
                        :value="formatActivityAction(data.action)"
                        :severity="getActivitySeverity(data.action)"
                      />
                    </div>
                  </template>
                </Column>

                <Column field="user" header="User" sortable>
                  <template #body="{ data }">
                    <div v-if="data.profiles && data.profiles.email" class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-brand-primary-100 flex items-center justify-center">
                          <span class="text-brand-primary font-medium text-sm">
                            {{ data.profiles.first_name ? data.profiles.first_name.charAt(0) : (data.profiles.email ? data.profiles.email.charAt(0).toUpperCase() : '?') }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-brand-primary">
                          {{ data.profiles.first_name || '' }} {{ data.profiles.last_name || '' }}
                        </div>
                        <div class="text-sm text-brand-primary/70">{{ data.profiles.email || 'No email' }}</div>
                      </div>
                    </div>
                    <div v-else class="text-sm text-brand-primary/50">System</div>
                  </template>
                </Column>

                <Column field="details" header="Details">
                  <template #body="{ data }">
                    <div class="max-w-xs truncate" :title="JSON.stringify(data.details)">
                      {{ formatActivityDetails(data.details) }}
                    </div>
                  </template>
                </Column>

                <Column field="created_at" header="Timestamp" sortable>
                  <template #body="{ data }">
                    <span class="text-sm text-brand-primary/70">{{ formatDate(data.created_at) }}</span>
                  </template>
                </Column>

                <Column header="Actions">
                  <template #body="{ data }">
                    <Button
                      icon="pi pi-eye"
                      class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
                      @click="viewActivityDetails(data)"
                      title="View Details"
                    />
                  </template>
                </Column>
              </template>

              <!-- Email Activity Columns -->
              <template v-else>
                <Column field="event_type" header="Event Type" sortable>
                  <template #body="{ data }">
                    <Tag
                      :value="data.event_type || 'Unknown'"
                      :severity="getEmailEventSeverity(data.event_type)"
                    />
                  </template>
                </Column>

                <Column field="email" header="Email" sortable>
                  <template #body="{ data }">
                    <div class="max-w-xs truncate" :title="data.email || 'No email'">
                      {{ data.email || 'No email' }}
                    </div>
                  </template>
                </Column>

                <Column field="user" header="User" sortable>
                  <template #body="{ data }">
                    <div v-if="data.profiles && data.profiles.email" class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8">
                        <div class="h-8 w-8 rounded-full bg-brand-primary-100 flex items-center justify-center">
                          <span class="text-brand-primary font-medium text-sm">
                            {{ data.profiles.first_name ? data.profiles.first_name.charAt(0) : (data.profiles.email ? data.profiles.email.charAt(0).toUpperCase() : '?') }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-brand-primary">
                          {{ data.profiles.first_name || '' }} {{ data.profiles.last_name || '' }}
                        </div>
                        <div class="text-sm text-brand-primary/70">{{ data.profiles.email || 'No email' }}</div>
                      </div>
                    </div>
                    <div v-else class="text-sm text-brand-primary/50">No user</div>
                  </template>
                </Column>

                <Column field="message_id" header="Message ID">
                  <template #body="{ data }">
                    <div class="max-w-xs truncate" :title="data.message_id">
                      {{ data.message_id || '—' }}
                    </div>
                  </template>
                </Column>

                <Column field="timestamp" header="Timestamp" sortable>
                  <template #body="{ data }">
                    <span class="text-sm text-brand-primary/70">{{ formatDate(data.timestamp) }}</span>
                  </template>
                </Column>

                <Column header="Actions">
                  <template #body="{ data }">
                    <Button
                      icon="pi pi-eye"
                      class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
                      @click="viewEmailDetails(data)"
                      title="View Details"
                    />
                  </template>
                </Column>
              </template>
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <!-- Create Theme Modal -->
    <Dialog
      v-model:visible="showCreateThemeModal"
      modal
      header="Create New Theme"
      :style="{ width: '800px' }"
    >
      <div class="space-y-3">
        <!-- Basic Theme Info -->
        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label class="block text-xs font-medium text-brand-primary mb-1">Theme Name</label>
            <InputText
              v-model="newTheme.name"
              placeholder="Enter theme name"
              class="w-full text-xs"
            />
          </div>
          <div class="field">
            <label class="block text-xs font-medium text-brand-primary mb-1">Preview Image URL</label>
            <InputText
              v-model="newTheme.preview_image_url"
              placeholder="Paste preview image URL"
              class="w-full text-xs"
            />
          </div>
        </div>

        <div class="field">
          <label class="block text-xs font-medium text-brand-primary mb-1">Description</label>
          <Textarea
            v-model="newTheme.description"
            placeholder="Enter theme description"
            rows="1"
            class="w-full text-xs"
          />
        </div>

        <!-- Background Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Background</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Color</label>
              <div class="flex gap-2">
                <ColorPicker
                  v-model="newTheme.background_color"
                  :default-color="newTheme.background_color || '#fffbe9'"
                  class="w-8 h-8"
                />
                <InputText
                  v-model="newTheme.background_color"
                  placeholder="#fffbe9"
                  class="flex-1 text-xs"
                />
              </div>
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Opacity</label>
              <InputText
                v-model.number="newTheme.background_opacity"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                class="w-full text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Font Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Fonts</h4>
          <div class="grid grid-cols-3 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Header</label>
              <Dropdown
                v-model="newTheme.header_font"
                :options="fontOptions"
                option-label="label"
                option-value="value"
                placeholder="Select header font"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Body</label>
              <Dropdown
                v-model="newTheme.body_font"
                :options="fontOptions"
                option-label="label"
                option-value="value"
                placeholder="Select body font"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Signature</label>
              <Dropdown
                v-model="newTheme.signature_font"
                :options="fontOptions"
                option-label="label"
                option-value="value"
                placeholder="Select signature font"
                class="w-full text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Font Colors -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Font Colors</h4>
          <div class="grid grid-cols-3 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Header</label>
              <div class="flex gap-2">
                <ColorPicker
                  v-model="newTheme.header_font_color"
                  :default-color="newTheme.header_font_color || '#000000'"
                  class="w-8 h-8"
                />
                <InputText
                  v-model="newTheme.header_font_color"
                  placeholder="#000000"
                  class="flex-1 text-xs"
                />
              </div>
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Body</label>
              <div class="flex gap-2">
                <ColorPicker
                  v-model="newTheme.body_font_color"
                  :default-color="newTheme.body_font_color || '#333333'"
                  class="w-8 h-8"
                />
                <InputText
                  v-model="newTheme.body_font_color"
                  placeholder="#333333"
                  class="flex-1 text-xs"
                />
              </div>
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Signature</label>
              <div class="flex gap-2">
                <ColorPicker
                  v-model="newTheme.signature_font_color"
                  :default-color="newTheme.signature_font_color || '#666666'"
                  class="w-8 h-8"
                />
                <InputText
                  v-model="newTheme.signature_font_color"
                  placeholder="#666666"
                  class="flex-1 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Size and Shape Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Size & Shape</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Size</label>
              <Dropdown
                v-model="newTheme.size"
                :options="sizeOptions"
                option-label="label"
                option-value="value"
                placeholder="Select size"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Rounded Corners</label>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <input 
                    type="checkbox" 
                    v-model="newTheme.rounded"
                    class="w-4 h-4 text-brand-primary bg-white border-2 border-brand-primary/30 rounded transition-all duration-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary checked:bg-brand-primary checked:border-brand-primary hover:border-brand-primary/50"
                  />
                  <div 
                    v-if="newTheme.rounded"
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <label class="text-xs text-brand-primary/70 cursor-pointer select-none">
                  Use rounded corners for memory shapes
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Border Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Border Settings</h4>
          <div class="grid grid-cols-3 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Photo Border (pixels)</label>
              <InputText
                v-model.number="newTheme.photo_border"
                type="number"
                min="0"
                max="50"
                placeholder="0"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Page Border (pixels)</label>
              <InputText
                v-model.number="newTheme.page_border"
                type="number"
                min="0"
                max="50"
                placeholder="0"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Page Border Offset (mm)</label>
              <InputText
                v-model.number="newTheme.page_border_offset"
                type="number"
                min="0"
                max="50"
                placeholder="5"
                class="w-full text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Card Wizard Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Card Wizard Settings</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Default for Card Wizard</label>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <input 
                    type="checkbox" 
                    v-model="newTheme.card_default"
                    @change="handleCardDefaultChange(true)"
                    class="w-4 h-4 text-brand-primary bg-white border-2 border-brand-primary/30 rounded transition-all duration-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary checked:bg-brand-primary checked:border-brand-primary hover:border-brand-primary/50"
                  />
                  <div 
                    v-if="newTheme.card_default"
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <label class="text-xs text-brand-primary/70 cursor-pointer select-none">
                  Set as default layout for magic card wizard
                </label>
              </div>
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Show in Card Wizard</label>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <input 
                    type="checkbox" 
                    v-model="newTheme.card_wizard"
                    class="w-4 h-4 text-brand-primary bg-white border-2 border-brand-primary/30 rounded transition-all duration-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary checked:bg-brand-primary checked:border-brand-primary hover:border-brand-primary/50"
                  />
                  <div 
                    v-if="newTheme.card_wizard"
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <label class="text-xs text-brand-primary/70 cursor-pointer select-none">
                  Display this layout in the card wizard
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Layout Configuration -->
        <div class="border-t border-gray-200 pt-2">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-semibold text-brand-primary">Layout Configuration</h4>
            <Button
              label="Layout Editor"
              icon="pi pi-palette"
              class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
              @click="openLayoutEditorForTheme"
            />
          </div>
          <Textarea
            v-model="newTheme.layout_config"
            placeholder='{"example": "JSON configuration"}'
            rows="2"
            class="w-full text-xs"
          />
        </div>
      </div>

                    <template #footer>
                <div class="flex justify-end gap-2">
                  <Button
                    label="Cancel"
                    class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
                    @click="showCreateThemeModal = false"
                  />
                  <Button
                    label="Create Theme"
                    :loading="creatingTheme"
                    class="bg-brand-dialog-primary hover:bg-brand-dialog-primary-hover text-white border-0 px-3 py-1 text-xs"
                    @click="() => { console.log('[BUTTON] Create Theme clicked, dialog visible:', showCreateThemeModal.value); createTheme(); }"
                  />
                </div>
              </template>
    </Dialog>

    <!-- Edit Theme Modal -->
    <Dialog
      v-model:visible="showEditThemeModal"
      modal
      header="Edit Theme"
      :style="{ width: '800px' }"
    >
      <div class="space-y-3">
        <!-- Basic Theme Info -->
        <div class="grid grid-cols-2 gap-3">
          <div class="field">
            <label class="block text-xs font-medium text-brand-primary mb-1">Theme Name</label>
            <InputText
              v-model="editingTheme.name"
              placeholder="Enter theme name"
              class="w-full text-xs"
            />
          </div>
          <div class="field">
            <label class="block text-xs font-medium text-brand-primary mb-1">Preview Image URL</label>
            <InputText
              v-model="editingTheme.preview_image_url"
              placeholder="Paste preview image URL"
              class="w-full text-xs"
            />
          </div>
        </div>

        <div class="field">
          <label class="block text-xs font-medium text-brand-primary mb-1">Description</label>
          <Textarea
            v-model="editingTheme.description"
            placeholder="Enter theme description"
            rows="1"
            class="w-full text-xs"
          />
        </div>

        <!-- Background Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Background</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Color</label>
              <div class="flex gap-2">
                <ColorPicker
                  v-model="editingTheme.background_color"
                  :default-color="editingTheme.background_color || '#fffbe9'"
                  class="w-8 h-8"
                />
                <InputText
                  v-model="editingTheme.background_color"
                  placeholder="#fffbe9"
                  class="flex-1 text-xs"
                />
              </div>
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Opacity</label>
              <InputText
                v-model.number="editingTheme.background_opacity"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                class="w-full text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Font Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Fonts</h4>
          <div class="grid grid-cols-3 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Header</label>
              <Dropdown
                v-model="editingTheme.header_font"
                :options="fontOptions"
                option-label="label"
                option-value="value"
                placeholder="Select header font"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Body</label>
              <Dropdown
                v-model="editingTheme.body_font"
                :options="fontOptions"
                option-label="label"
                option-value="value"
                placeholder="Select body font"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Signature</label>
              <Dropdown
                v-model="editingTheme.signature_font"
                :options="fontOptions"
                option-label="label"
                option-value="value"
                placeholder="Select signature font"
                class="w-full text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Font Colors -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Font Colors</h4>
          <div class="grid grid-cols-3 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Header</label>
              <div class="flex gap-2">
                <ColorPicker
                  v-model="editingTheme.header_font_color"
                  :default-color="editingTheme.header_font_color || '#000000'"
                  class="w-8 h-8"
                />
                <InputText
                  v-model="editingTheme.header_font_color"
                  placeholder="#000000"
                  class="flex-1 text-xs"
                />
              </div>
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Body</label>
              <div class="flex gap-2">
                <ColorPicker
                  v-model="editingTheme.body_font_color"
                  :default-color="editingTheme.body_font_color || '#333333'"
                  class="w-8 h-8"
                />
                <InputText
                  v-model="editingTheme.body_font_color"
                  placeholder="#333333"
                  class="flex-1 text-xs"
                />
              </div>
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Signature</label>
              <div class="flex gap-2">
                <ColorPicker
                  v-model="editingTheme.signature_font_color"
                  :default-color="editingTheme.signature_font_color || '#666666'"
                  class="w-8 h-8"
                />
                <InputText
                  v-model="editingTheme.signature_font_color"
                  placeholder="#666666"
                  class="flex-1 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Size and Shape Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Size & Shape</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Size</label>
              <Dropdown
                v-model="editingTheme.size"
                :options="sizeOptions"
                option-label="label"
                option-value="value"
                placeholder="Select size"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Rounded Corners</label>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <input 
                    type="checkbox" 
                    v-model="editingTheme.rounded"
                    class="w-4 h-4 text-brand-primary bg-white border-2 border-brand-primary/30 rounded transition-all duration-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary checked:bg-brand-primary checked:border-brand-primary hover:border-brand-primary/50"
                  />
                  <div 
                    v-if="editingTheme.rounded"
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <label class="text-xs text-brand-primary/70 cursor-pointer select-none">
                  Use rounded corners for memory shapes
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Border Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Border Settings</h4>
          <div class="grid grid-cols-3 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Photo Border (pixels)</label>
              <InputText
                v-model.number="editingTheme.photo_border"
                type="number"
                min="0"
                max="50"
                placeholder="0"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Page Border (pixels)</label>
              <InputText
                v-model.number="editingTheme.page_border"
                type="number"
                min="0"
                max="50"
                placeholder="0"
                class="w-full text-xs"
              />
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Page Border Offset (mm)</label>
              <InputText
                v-model.number="editingTheme.page_border_offset"
                type="number"
                min="0"
                max="50"
                placeholder="5"
                class="w-full text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Card Wizard Settings -->
        <div class="border-t border-gray-200 pt-2">
          <h4 class="text-xs font-semibold text-brand-primary mb-2">Card Wizard Settings</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Default for Card Wizard</label>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <input 
                    type="checkbox" 
                    v-model="editingTheme.card_default"
                    @change="handleCardDefaultChange(false)"
                    class="w-4 h-4 text-brand-primary bg-white border-2 border-brand-primary/30 rounded transition-all duration-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary checked:bg-brand-primary checked:border-brand-primary hover:border-brand-primary/50"
                  />
                  <div 
                    v-if="editingTheme.card_default"
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <label class="text-xs text-brand-primary/70 cursor-pointer select-none">
                  Set as default layout for magic card wizard
                </label>
              </div>
            </div>
            <div class="field">
              <label class="block text-xs font-medium text-brand-primary mb-1">Show in Card Wizard</label>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <input 
                    type="checkbox" 
                    v-model="editingTheme.card_wizard"
                    class="w-4 h-4 text-brand-primary bg-white border-2 border-brand-primary/30 rounded transition-all duration-200 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary checked:bg-brand-primary checked:border-brand-primary hover:border-brand-primary/50"
                  />
                  <div 
                    v-if="editingTheme.card_wizard"
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <label class="text-xs text-brand-primary/70 cursor-pointer select-none">
                  Display this layout in the card wizard
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Layout Configuration -->
        <div class="border-t border-gray-200 pt-2">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-semibold text-brand-primary">Layout Configuration</h4>
            <Button
              label="Layout Editor"
              icon="pi pi-palette"
              class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
              @click="openLayoutEditorForEditTheme"
            />
          </div>
          <Textarea
            v-model="editingTheme.layout_config"
            placeholder='{"example": "JSON configuration"}'
            rows="2"
            class="w-full text-xs"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
            @click="showEditThemeModal = false"
          />
          <Button
            label="Update Theme"
            :loading="updatingTheme"
            class="bg-brand-dialog-primary hover:bg-brand-dialog-primary-hover text-white border-0 px-3 py-1 text-xs"
            @click="updateTheme"
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
            <label class="block text-sm font-medium text-brand-primary mb-1">User ID</label>
            <p class="text-sm text-brand-primary/70">{{ selectedUserForDetails.user_id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Email</label>
            <p class="text-sm text-brand-primary/70">{{ selectedUserForDetails.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">First Name</label>
            <p class="text-sm text-brand-primary/70">{{ selectedUserForDetails.first_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Last Name</label>
            <p class="text-sm text-brand-primary/70">{{ selectedUserForDetails.last_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Phone</label>
            <p class="text-sm text-brand-primary/70">{{ selectedUserForDetails.phone || '—' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Address</label>
            <p class="text-sm text-brand-primary/70">{{ selectedUserForDetails.address || '—' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Role</label>
            <Tag :value="selectedUserForDetails.role" :severity="getRoleSeverity(selectedUserForDetails.role)" />
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Subscription</label>
            <Tag :value="selectedUserForDetails.subscription_type" :severity="selectedUserForDetails.subscription_type === 'premium' ? 'primary' : 'secondary'" />
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Created At</label>
            <p class="text-sm text-brand-primary/70">{{ formatDate(selectedUserForDetails.created_at) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Updated At</label>
            <p class="text-sm text-brand-primary/70">{{ formatDate(selectedUserForDetails.updated_at) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Disabled</label>
            <Tag :value="selectedUserForDetails.deleted ? 'Disabled' : 'Active'" :severity="selectedUserForDetails.deleted ? 'danger' : 'success'" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Total Assets</label>
            <p class="text-sm text-brand-primary/70">{{ userAssetsCount }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Total Memory Books</label>
            <p class="text-sm text-brand-primary/70">{{ userBooksCount }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <Button
            label="Close"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
            @click="showUserModal = false"
          />
        </div>
      </template>
    </Dialog>

    <!-- Layout Editor Dialog -->
    <Dialog
      v-model:visible="showLayoutEditorDialog"
      modal
      header="Layout Editor"
      :style="{ width: '80vw', height: '80vh' }"
      :maximizable="true"
      :resizable="true"
      class="layout-editor-dialog"
    >
      <div class="h-full">
        <LayoutEditor 
          :initial-layout="getInitialLayout()"
          :size="getCurrentThemeSize()"
          :edit-defaults-mode="getCurrentEditDefaultsMode()"
          @save="handleLayoutSave" 
        />
      </div>
    </Dialog>

    <!-- Layout Defaults Modal -->
    <Dialog
      v-model:visible="showLayoutDefaultsModal"
      modal
      header="Edit Layout Defaults"
      :style="{ width: '600px' }"
    >
      <div class="space-y-4">
        <div class="mb-4">
          <p class="text-sm text-brand-primary/70 mb-3">
            Select a layout default to edit. Changes will be saved to the default layouts file.
          </p>
          
          <!-- Password Protection -->
          <div v-if="!isEditDefaultsMode" class="space-y-3">
            <div class="field">
              <label class="block text-sm font-medium text-brand-primary mb-1">Password</label>
              <Password
                v-model="password"
                :feedback="false"
                placeholder="Enter password"
                class="w-full"
                @keyup.enter="checkPassword"
              />
              <small v-if="passwordError" class="text-red-600 text-xs">{{ passwordError }}</small>
            </div>
            <div class="flex gap-2">
              <Button
                label="Continue"
                @click="checkPassword"
                class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-3 py-1 text-xs"
              />
              <Button
                label="Cancel"
                @click="cancelPassword"
                class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
              />
            </div>
          </div>

          <!-- Layout Selection (only show after password) -->
          <div v-if="isEditDefaultsMode" class="space-y-3">
            <div class="field">
              <label class="block text-sm font-medium text-brand-primary mb-1">Select Layout Default</label>
              <Dropdown
                v-model="selectedLayoutDefault"
                :options="layoutDefaultOptions"
                option-label="label"
                option-value="value"
                placeholder="Choose a layout default..."
                class="w-full"
              />
            </div>
            
            <div v-if="selectedLayoutDefault" class="text-sm text-brand-primary/70">
              <p><strong>Size:</strong> {{ selectedLayoutDefault }}</p>
              <p><strong>Name:</strong> {{ getLayoutDefaultName(selectedLayoutDefault) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            v-if="isEditDefaultsMode && selectedLayoutDefault"
            label="Edit Layout"
            @click="openLayoutEditorForDefault"
            class="bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white border-0 px-3 py-1 text-xs"
          />
          <Button
            label="Close"
            @click="closeLayoutDefaultsModal"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
          />
        </div>
      </template>
    </Dialog>

    <!-- Move to Trash Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteConfirmDialog"
      modal
      header="Move Theme to Trash"
      :style="{ width: '400px' }"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <i class="pi pi-exclamation-triangle text-amber-500 text-xl"></i>
          <div>
            <p class="text-sm text-brand-primary/70">
              Are you sure you want to move the theme <strong>"{{ themeToDelete?.name }}"</strong> to trash?
            </p>
            <p class="text-xs text-brand-primary/50 mt-1">
              The theme will be moved to trash and can be restored later.
            </p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
            @click="showDeleteConfirmDialog = false"
          />
          <Button
            label="Move to Trash"
            class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-3 py-1 text-xs"
            @click="deleteThemeConfirmed"
          />
        </div>
      </template>
    </Dialog>

    <!-- Permanent Delete Theme Confirmation Dialog -->
    <Dialog
      v-model:visible="showPermanentDeleteConfirmDialog"
      modal
      header="Confirm Permanent Delete"
      :style="{ width: '400px' }"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
          <div>
            <p class="text-sm text-brand-primary/70">
              Are you sure you want to <strong>permanently delete</strong> the theme <strong>"{{ themeToPermanentDelete?.name }}"</strong>?
            </p>
            <p class="text-xs text-red-500 mt-1 font-medium">
              ⚠️ WARNING: This action cannot be undone. The theme will be permanently removed from the database.
            </p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
            @click="showPermanentDeleteConfirmDialog = false"
          />
          <Button
            label="Permanently Delete"
            class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-3 py-1 text-xs"
            @click="permanentDeleteThemeConfirmed"
          />
        </div>
      </template>
    </Dialog>

    <!-- Card Default Warning Dialog -->
    <Dialog
      v-model:visible="showCardDefaultWarningDialog"
      modal
      header="Card Default Warning"
      :style="{ width: '500px' }"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <i class="pi pi-exclamation-triangle text-amber-500 text-xl"></i>
          <div>
            <p class="text-sm text-brand-primary/70">
              <strong>Important:</strong> Only one theme can be set as the default for the magic card wizard.
            </p>
            <p class="text-xs text-brand-primary/50 mt-2">
              If you set this theme as the default, any other theme currently set as default will be automatically unchecked.
            </p>
            <p class="text-xs text-amber-600 mt-1 font-medium">
              ⚠️ This field is required for the magic card wizard to function properly.
            </p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
            @click="showCardDefaultWarningDialog = false"
          />
          <Button
            label="Set as Default"
            class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-3 py-1 text-xs"
            @click="confirmCardDefaultChange"
          />
        </div>
      </template>
    </Dialog>

    <!-- Activity Details Dialog -->
    <Dialog
      v-model:visible="showActivityDetailsDialog"
      modal
      header="Activity Details"
      :style="{ width: '800px' }"
    >
      <div v-if="selectedActivityItem" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">ID</label>
            <p class="text-sm text-brand-primary/70 font-mono">{{ selectedActivityItem.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Action</label>
            <div class="flex items-center gap-2">
              <Tag
                :value="formatActivityAction(selectedActivityItem.action)"
                :severity="getActivitySeverity(selectedActivityItem.action)"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">User ID</label>
            <p class="text-sm text-brand-primary/70 font-mono">{{ selectedActivityItem.user_id || 'System' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Timestamp</label>
            <p class="text-sm text-brand-primary/70">{{ formatDate(selectedActivityItem.timestamp) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Created At</label>
            <p class="text-sm text-brand-primary/70">{{ formatDate(selectedActivityItem.created_at) }}</p>
          </div>
        </div>

        <!-- User Profile Information -->
        <div v-if="selectedActivityItem.profiles" class="border-t border-gray-200 pt-4">
          <h4 class="text-sm font-semibold text-brand-primary mb-3">User Profile</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-1">Name</label>
              <p class="text-sm text-brand-primary/70">{{ selectedActivityItem.profiles.first_name }} {{ selectedActivityItem.profiles.last_name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-1">Email</label>
              <p class="text-sm text-brand-primary/70">{{ selectedActivityItem.profiles.email }}</p>
            </div>
          </div>
        </div>

        <!-- Details JSON -->
        <div class="border-t border-gray-200 pt-4">
          <h4 class="text-sm font-semibold text-brand-primary mb-3">Details</h4>
          <div class="bg-gray-50 p-4 rounded-lg">
            <pre class="text-sm text-brand-primary/70 whitespace-pre-wrap font-mono">{{ formatJsonForDisplay(selectedActivityItem.details) }}</pre>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end">
          <Button
            label="Close"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
            @click="showActivityDetailsDialog = false"
          />
        </div>
      </template>
    </Dialog>

    <!-- Email Details Dialog -->
    <Dialog
      v-model:visible="showEmailDetailsDialog"
      modal
      header="Email Event Details"
      :style="{ width: '800px' }"
    >
      <div v-if="selectedEmailItem" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">ID</label>
            <p class="text-sm text-brand-primary/70 font-mono">{{ selectedEmailItem.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Event Type</label>
            <div class="flex items-center gap-2">
              <Tag
                :value="selectedEmailItem.event_type"
                :severity="getEmailEventSeverity(selectedEmailItem.event_type)"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Email</label>
            <p class="text-sm text-brand-primary/70">{{ selectedEmailItem.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">User ID</label>
            <p class="text-sm text-brand-primary/70 font-mono">{{ selectedEmailItem.user_id || 'No user' }}</p>
          </div>
                          <div class="col-span-2">
                  <label class="block text-sm font-medium text-brand-primary mb-1">Message ID</label>
                  <p class="text-sm text-brand-primary/70 font-mono break-all">{{ selectedEmailItem.message_id || '—' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-brand-primary mb-1">SendGrid Event ID</label>
                  <p class="text-sm text-brand-primary/70 font-mono break-all">{{ selectedEmailItem.sendgrid_event_id || '—' }}</p>
                </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Timestamp</label>
            <p class="text-sm text-brand-primary/70">{{ formatDate(selectedEmailItem.timestamp) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-brand-primary mb-1">Created At</label>
            <p class="text-sm text-brand-primary/70">{{ formatDate(selectedEmailItem.created_at) }}</p>
          </div>
        </div>

        <!-- User Profile Information -->
        <div v-if="selectedEmailItem.profiles" class="border-t border-gray-200 pt-4">
          <h4 class="text-sm font-semibold text-brand-primary mb-3">User Profile</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-1">Name</label>
              <p class="text-sm text-brand-primary/70">{{ selectedEmailItem.profiles.first_name }} {{ selectedEmailItem.profiles.last_name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-primary mb-1">Email</label>
              <p class="text-sm text-brand-primary/70">{{ selectedEmailItem.profiles.email }}</p>
            </div>
          </div>
        </div>

        <!-- Event Data JSON -->
        <div class="border-t border-gray-200 pt-4">
          <h4 class="text-sm font-semibold text-brand-primary mb-3">Event Data</h4>
          <div class="bg-gray-50 p-4 rounded-lg">
            <pre class="text-sm text-brand-primary/70 whitespace-pre-wrap font-mono">{{ formatJsonForDisplay(selectedEmailItem.event_data) }}</pre>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end">
          <Button
            label="Close"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
            @click="showEmailDetailsDialog = false"
          />
        </div>
      </template>
    </Dialog>



    <!-- View Backups Modal -->
    <Dialog
      v-model:visible="showViewBackupsModal"
      modal
      header="User Backups"
      :style="{ width: '90vw', maxWidth: '1200px' }"
    >
      <div class="space-y-4">
        <!-- Backups Table -->
        <DataTable
          :value="backups"
          :paginator="true"
          :rows="backupRows"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          :totalRecords="totalBackups"
          :loading="loadingBackups"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} backups"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          :rowKey="row => row.id"
          :lazy="true"
          @page="onBackupPage"
        >
          <Column field="target_user.email" header="User" sortable>
            <template #body="{ data }">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <div class="h-8 w-8 rounded-full bg-brand-primary-100 flex items-center justify-center">
                    <span class="text-brand-primary font-medium text-sm">
                      {{ data.target_user?.first_name ? data.target_user.first_name.charAt(0) : (data.target_user?.email ? data.target_user.email.charAt(0).toUpperCase() : '?') }}
                    </span>
                  </div>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-brand-primary">
                    {{ data.target_user?.first_name || '' }} {{ data.target_user?.last_name || '' }}
                  </div>
                  <div class="text-sm text-brand-primary/70">{{ data.target_user?.email || 'Unknown' }}</div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="status" header="Status" sortable>
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="data.status === 'completed' ? 'success' : data.status === 'failed' ? 'danger' : 'warning'"
              />
            </template>
          </Column>

          <Column field="summary.total_records" header="Records" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70">{{ data.summary?.total_records || 0 }}</span>
            </template>
          </Column>

          <Column field="summary.total_files" header="Files" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70">{{ data.summary?.total_files || 0 }}</span>
            </template>
          </Column>

          <Column field="summary.backup_size_estimate" header="Size" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70">{{ Math.round((data.summary?.backup_size_estimate || 0) / 1024) }} KB</span>
            </template>
          </Column>

          <Column field="created_by_user.email" header="Created By" sortable>
            <template #body="{ data }">
              <div class="text-sm text-brand-primary/70">{{ data.created_by_user?.email || 'Unknown' }}</div>
            </template>
          </Column>

          <Column field="created_at" header="Created" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70">{{ formatDate(data.created_at) }}</span>
            </template>
          </Column>

          <Column header="Actions">
            <template #body="{ data }">
              <div class="flex items-center space-x-2">
                <Button
                  icon="pi pi-eye"
                  class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
                  @click="viewBackupDetails(data)"
                  title="View Details"
                />
                <Button
                  icon="pi pi-undo"
                  class="bg-blue-500 hover:bg-blue-600 text-white border-0 px-2 py-1 text-xs"
                  @click="confirmRestoreBackup(data)"
                  title="Restore Backup"
                />
                <Button
                  icon="pi pi-download"
                  class="bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white border-0 px-2 py-1 text-xs"
                  @click="downloadBackup(data)"
                  title="Download Backup"
                />
                <Button
                  icon="pi pi-trash"
                  class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-2 py-1 text-xs"
                  @click="confirmDeleteBackup(data)"
                  title="Delete Backup"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- No Backups Message -->
        <div v-if="!loadingBackups && backups.length === 0" class="text-center py-8">
          <i class="pi pi-database text-4xl text-brand-primary/40 mb-4"></i>
          <p class="text-brand-primary/70">No backups found.</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Close"
            icon="pi pi-times"
            @click="closeViewBackupsModal"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-2"
          />
        </div>
      </template>
    </Dialog>

    <!-- Delete Backup Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteBackupConfirmDialog"
      modal
      header="Delete Backup"
      :style="{ width: '500px' }"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-exclamation-triangle text-brand-warning text-xl mt-1"></i>
          <div>
            <h3 class="font-semibold text-brand-primary mb-2">Are you sure you want to delete this backup?</h3>
            <p class="text-sm text-brand-primary/70 mb-3">
              This will permanently delete:
            </p>
            <ul class="list-disc list-inside text-sm text-brand-primary/70 space-y-1 mb-3">
              <li>The backup record from the database</li>
              <li>All backup files from storage</li>
              <li>All metadata and file references</li>
            </ul>
            <div v-if="backupToDelete" class="bg-brand-surface-100 p-3 rounded-lg">
              <p class="text-sm font-medium text-brand-primary">
                User: {{ backupToDelete.summary?.user_email }}
              </p>
              <p class="text-sm text-brand-primary/70">
                Records: {{ backupToDelete.summary?.total_records }} | 
                Files: {{ backupToDelete.summary?.total_files }} | 
                Created: {{ formatDate(backupToDelete.created_at) }}
              </p>
            </div>
            <p class="text-sm text-brand-warning font-medium mt-3">
              This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="cancelDeleteBackup"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-2"
            :disabled="deletingBackup"
          />
          <Button
            label="Delete Backup"
            icon="pi pi-trash"
            @click="deleteBackup"
            class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-3 py-2"
            :loading="deletingBackup"
            :disabled="deletingBackup"
          />
        </div>
      </template>
    </Dialog>

    <!-- Delete User Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteUserConfirmDialog"
      modal
      header="Permanently Delete User"
      :style="{ width: '600px' }"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-exclamation-triangle text-red-500 text-xl mt-1"></i>
          <div>
            <h3 class="font-semibold text-brand-primary mb-2">Are you sure you want to permanently delete this user?</h3>
            <div v-if="userToDelete" class="bg-brand-surface-100 p-3 rounded-lg mb-3">
              <p class="text-sm font-medium text-brand-primary">
                User: {{ userToDelete.email }}
              </p>
              <p class="text-sm text-brand-primary/70">
                Name: {{ userToDelete.first_name }} {{ userToDelete.last_name }}
              </p>
              <p class="text-sm text-brand-primary/70">
                Role: {{ userToDelete.role }} | Subscription: {{ userToDelete.subscription_type }}
              </p>
            </div>
            
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
              <div class="flex items-start gap-2">
                <i class="pi pi-exclamation-triangle text-red-500 mt-0.5"></i>
                <div class="text-sm">
                  <strong class="text-red-600">⚠️ WARNING: This action will permanently delete:</strong>
                  <ul class="list-disc list-inside mt-1 ml-2 text-brand-primary/70">
                    <li>User's profile and account</li>
                    <li>All uploaded assets (photos, text)</li>
                    <li>All memory books and PDFs</li>
                    <li>Family information</li>
                    <li>Activity logs and email events</li>
                    <li>All storage files</li>
                    <li>Supabase authentication account</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
              <div class="flex items-start gap-2">
                <i class="pi pi-info-circle text-blue-500 mt-0.5"></i>
                <div class="text-sm">
                  <strong class="text-blue-600">✅ Safety Measure:</strong>
                  <p class="text-brand-primary/70 mt-1">
                    A complete backup will be created automatically before deletion, 
                    allowing you to restore the user if needed.
                  </p>
                </div>
              </div>
            </div>
            
            <p class="text-sm text-red-600 font-medium">
              This action cannot be undone. The user will be permanently removed from the system.
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="cancelDeleteUser"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-2 text-sm"
            :disabled="deletingUser"
          />
          <Button
            label="Permanently Delete User"
            icon="pi pi-times"
            @click="deleteUser"
            class="bg-red-800 hover:bg-red-900 text-white border-0 px-3 py-2 text-sm"
            :loading="deletingUser"
            :disabled="deletingUser"
          />
        </div>
      </template>
    </Dialog>

    <!-- Restore Backup Confirmation Dialog -->
    <Dialog
      v-model:visible="showRestoreBackupConfirmDialog"
      modal
      header="Restore Backup"
      :style="{ width: '600px' }"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <i class="pi pi-undo text-brand-success text-xl mt-1"></i>
          <div>
            <h3 class="font-semibold text-brand-primary mb-2">Restore User Backup</h3>
            <div v-if="backupToRestore" class="bg-brand-surface-100 p-3 rounded-lg mb-3">
              <p class="text-sm font-medium text-brand-primary">
                User: {{ backupToRestore.summary?.user_email }}
              </p>
              <p class="text-sm text-brand-primary/70">
                Records: {{ backupToRestore.summary?.total_records }} | 
                Files: {{ backupToRestore.summary?.total_files }} | 
                Created: {{ formatDate(backupToRestore.created_at) }}
              </p>
            </div>
            
            <div v-if="userExists" class="p-3 bg-brand-warning/10 border border-brand-warning/20 rounded-lg mb-3">
              <div class="flex items-start gap-2">
                <i class="pi pi-exclamation-triangle text-brand-warning mt-0.5"></i>
                <div class="text-sm">
                  <strong class="text-brand-warning">User Already Exists:</strong>
                  <p class="text-brand-primary/70 mt-1">
                    A user with this email already exists in the system. 
                    Restoring this backup will overwrite their existing data.
                  </p>
                </div>
              </div>
            </div>
            
            <div v-else class="p-3 bg-brand-success/10 border border-brand-success/20 rounded-lg mb-3">
              <div class="flex items-start gap-2">
                <i class="pi pi-check-circle text-brand-success mt-0.5"></i>
                <div class="text-sm">
                  <strong class="text-brand-success">New User:</strong>
                  <p class="text-brand-primary/70 mt-1">
                    This user does not exist in the system. 
                    A new user account will be created with the backup data.
                  </p>
                </div>
              </div>
            </div>
            
            <p class="text-sm text-brand-primary/70">
              This will restore all user data including profile, assets, memory books, and storage files.
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="cancelRestoreBackup"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-2 text-sm"
            :disabled="restoringBackup"
          />
          <Button
            :label="userExists ? 'Overwrite User' : 'Create User'"
            icon="pi pi-undo"
            @click="restoreBackup"
            class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-3 py-2 text-sm"
            :loading="restoringBackup"
            :disabled="restoringBackup"
          />
        </div>
      </template>
    </Dialog>

    <!-- Asset View Modal -->
    <Dialog
      v-model:visible="showAssetModal"
      modal
      header="View Asset"
      :style="{ width: '90vw', maxWidth: '1400px', height: '90vh' }"
      :maximizable="true"
      :resizable="true"
    >
      <div v-if="selectedAsset" class="h-full flex flex-col">
        <!-- Compact Header Info -->
        <div class="flex items-center justify-between mb-4 p-3 bg-brand-surface-50 rounded-lg">
          <div class="flex items-center gap-4">
            <Tag
              :value="selectedAsset.type"
              :severity="selectedAsset.type === 'photo' ? 'primary' : 'secondary'"
            />
            <Tag
              :value="selectedAsset.approved ? 'Approved' : 'Pending'"
              :severity="selectedAsset.approved ? 'success' : 'warning'"
            />
            <span class="text-sm text-brand-primary/70">
              {{ formatDate(selectedAsset.created_at) }}
            </span>
          </div>
          <div class="text-sm text-brand-primary/70 font-mono">
            ID: {{ selectedAsset.id.slice(-8) }}
          </div>
        </div>

        <!-- Full URL Display -->
        <div v-if="selectedAsset.storage_url" class="mb-4 p-3 bg-brand-surface-100 rounded-lg">
          <div class="text-xs font-semibold text-brand-primary mb-1">Image URL:</div>
          <div class="text-xs text-brand-primary/70 font-mono break-all">
            {{ selectedAsset.storage_url }}
          </div>
        </div>

        <!-- All Asset Fields for Debugging -->
        <div class="mb-4 p-3 bg-brand-surface-100 rounded-lg">
          <div class="text-xs font-semibold text-brand-primary mb-2">All Asset Fields:</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="font-medium">ID:</span> <span class="font-mono">{{ selectedAsset.id }}</span></div>
            <div><span class="font-medium">User ID:</span> <span class="font-mono">{{ selectedAsset.user_id }}</span></div>
            <div><span class="font-medium">Type:</span> {{ selectedAsset.type }}</div>
            <div><span class="font-medium">Title:</span> {{ selectedAsset.title || 'null' }}</div>
            <div><span class="font-medium">Storage URL:</span> <span class="font-mono break-all">{{ selectedAsset.storage_url || 'null' }}</span></div>
            <div><span class="font-medium">User Caption:</span> {{ selectedAsset.user_caption || 'null' }}</div>
            <div><span class="font-medium">AI Caption:</span> {{ selectedAsset.ai_caption || 'null' }}</div>
            <div><span class="font-medium">AI Description:</span> {{ selectedAsset.ai_description || 'null' }}</div>
            <div><span class="font-medium">Tags:</span> {{ selectedAsset.tags?.join(', ') || '[]' }}</div>
            <div><span class="font-medium">User Tags:</span> {{ selectedAsset.user_tags?.join(', ') || '[]' }}</div>
            <div><span class="font-medium">People Detected:</span> {{ selectedAsset.people_detected || '[]' }}</div>
            <div><span class="font-medium">User People:</span> {{ selectedAsset.user_people || '[]' }}</div>
            <div><span class="font-medium">Width:</span> {{ selectedAsset.width || 'null' }}</div>
            <div><span class="font-medium">Height:</span> {{ selectedAsset.height || 'null' }}</div>
            <div><span class="font-medium">Orientation:</span> {{ selectedAsset.orientation || 'null' }}</div>
            <div><span class="font-medium">Location:</span> {{ selectedAsset.location || 'null' }}</div>
            <div><span class="font-medium">City:</span> {{ selectedAsset.city || 'null' }}</div>
            <div><span class="font-medium">State:</span> {{ selectedAsset.state || 'null' }}</div>
            <div><span class="font-medium">Country:</span> {{ selectedAsset.country || 'null' }}</div>
            <div><span class="font-medium">Zip Code:</span> {{ selectedAsset.zip_code || 'null' }}</div>
            <div><span class="font-medium">Asset Date:</span> {{ selectedAsset.asset_date ? formatDate(selectedAsset.asset_date) : 'null' }}</div>
            <div><span class="font-medium">AI Processed:</span> {{ selectedAsset.ai_processed ? 'true' : 'false' }}</div>
            <div><span class="font-medium">Approved:</span> {{ selectedAsset.approved ? 'true' : 'false' }}</div>
            <div><span class="font-medium">Rejected:</span> {{ selectedAsset.rejected ? 'true' : 'false' }}</div>
            <div><span class="font-medium">Fingerprint:</span> <span class="font-mono">{{ selectedAsset.fingerprint || 'null' }}</span></div>
            <div><span class="font-medium">Created At:</span> {{ formatDate(selectedAsset.created_at) }}</div>
            <div><span class="font-medium">Updated At:</span> {{ formatDate(selectedAsset.updated_at) }}</div>
            <div><span class="font-medium">Deleted:</span> {{ selectedAsset.deleted ? 'true' : 'false' }}</div>
          </div>
        </div>

        <!-- Compact Text Content (if text asset) -->
        <div v-if="selectedAsset.type === 'text'" class="mb-4 space-y-2">
          <div v-if="selectedAsset.user_caption" class="bg-brand-surface-100 p-3 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">User Caption</div>
            <div class="text-sm text-brand-primary/70">{{ selectedAsset.user_caption }}</div>
          </div>
          
          <div v-if="selectedAsset.ai_caption" class="bg-brand-surface-100 p-3 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">AI Caption</div>
            <div class="text-sm text-brand-primary/70">{{ selectedAsset.ai_caption }}</div>
          </div>
          
          <div v-if="selectedAsset.ai_description" class="bg-brand-surface-100 p-3 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">AI Description</div>
            <div class="text-sm text-brand-primary/70">{{ selectedAsset.ai_description }}</div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col">
          <!-- Asset Title (if exists) -->
          <div v-if="selectedAsset.title" class="mb-3">
            <h3 class="text-lg font-semibold text-brand-primary">{{ selectedAsset.title }}</h3>
          </div>

          <!-- Supabase Storage Image Display -->
          <div class="flex-1 flex items-center justify-center bg-brand-surface-50 rounded-lg p-4">
            <div v-if="selectedAsset.storage_url" class="text-center">
              <img 
                :src="selectedAsset.storage_url" 
                :alt="selectedAsset.title || 'Asset image'"
                class="max-w-full object-contain rounded-lg shadow-lg"
                @error="handleImageError"
                style="max-width: 600px; max-height: 400px;"
              />
              <div class="mt-3 text-sm text-brand-primary/70">
                <a 
                  :href="selectedAsset.storage_url" 
                  target="_blank" 
                  class="underline hover:text-brand-primary"
                >
                  Open in new tab
                </a>
              </div>
            </div>
            <div v-else class="text-center text-brand-primary/50">
              <i class="pi pi-image text-4xl mb-2"></i>
              <p>No image available</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <!-- Approve/Unapprove Buttons -->
          <div class="flex gap-2">
            <Button
              v-if="!selectedAsset?.approved"
              label="Approve Asset"
              icon="pi pi-check"
              @click="approveAssetFromModal"
              class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-3 py-2 text-sm"
            />
            <Button
              v-if="selectedAsset?.approved"
              label="Unapprove Asset"
              icon="pi pi-times"
              @click="unapproveAssetFromModal"
              class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-2 text-sm"
            />
          </div>
          
          <!-- Close Button -->
          <Button
            label="Close"
            icon="pi pi-times"
            @click="showAssetModal = false"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-2 text-sm"
          />
        </div>
      </template>
    </Dialog>

    <!-- Memory Book View Modal -->
    <Dialog
      v-model:visible="showMemoryBookModal"
      modal
      header="View Memory Book"
      :style="{ width: '90vw', maxWidth: '1400px', height: '90vh' }"
      :maximizable="true"
      :resizable="true"
    >
      <div v-if="selectedMemoryBook" class="h-full flex flex-col">
        <!-- Compact Header Info -->
        <div class="flex items-center justify-between mb-4 p-3 bg-brand-surface-50 rounded-lg">
          <div class="flex items-center gap-4">
            <Tag
              :value="selectedMemoryBook.format"
              :severity="selectedMemoryBook.format === 'book' ? 'primary' : 'secondary'"
            />
            <Tag
              :value="selectedMemoryBook.status"
              :severity="getBookStatusSeverity(selectedMemoryBook.status)"
            />
            <span class="text-sm text-brand-primary/70">
              {{ formatDate(selectedMemoryBook.created_at) }}
            </span>
          </div>
          <div class="text-sm text-brand-primary/70 font-mono">
            ID: {{ selectedMemoryBook.id.slice(-8) }}
          </div>
        </div>

        <!-- All Memory Book Fields for Debugging -->
        <div class="mb-4 p-3 bg-brand-surface-100 rounded-lg overflow-auto max-h-96">
          <div class="text-xs font-semibold text-brand-primary mb-2">All Memory Book Fields:</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="font-medium">ID:</span> <span class="font-mono">{{ selectedMemoryBook.id }}</span></div>
            <div><span class="font-medium">User ID:</span> <span class="font-mono">{{ selectedMemoryBook.user_id }}</span></div>
            <div><span class="font-medium">Format:</span> {{ selectedMemoryBook.format }}</div>
            <div><span class="font-medium">Status:</span> {{ selectedMemoryBook.status }}</div>
            <div><span class="font-medium">UI:</span> {{ selectedMemoryBook.ui }}</div>
            <div><span class="font-medium">Page Count:</span> {{ selectedMemoryBook.page_count || 'null' }}</div>
            <div><span class="font-medium">Grid Layout:</span> {{ selectedMemoryBook.grid_layout }}</div>
            <div><span class="font-medium">Memory Shape:</span> {{ selectedMemoryBook.memory_shape }}</div>
            <div><span class="font-medium">Print Size:</span> {{ selectedMemoryBook.print_size }}</div>
            <div><span class="font-medium">Quality:</span> {{ selectedMemoryBook.quality || 'null' }}</div>
            <div><span class="font-medium">Medium:</span> {{ selectedMemoryBook.medium || 'null' }}</div>
            <div><span class="font-medium">Theme ID:</span> <span class="font-mono">{{ selectedMemoryBook.theme_id || 'null' }}</span></div>
            <div><span class="font-medium">Layout Type:</span> {{ selectedMemoryBook.layout_type || 'null' }}</div>
            <div><span class="font-medium">Output:</span> {{ selectedMemoryBook.output }}</div>
            <div><span class="font-medium">Memory Event:</span> {{ selectedMemoryBook.memory_event || 'null' }}</div>
            <div><span class="font-medium">Include Captions:</span> {{ selectedMemoryBook.include_captions ? 'true' : 'false' }}</div>
            <div><span class="font-medium">Include Tags:</span> {{ selectedMemoryBook.include_tags ? 'true' : 'false' }}</div>
            <div><span class="font-medium">AI Background:</span> {{ selectedMemoryBook.ai_background ? 'true' : 'false' }}</div>
            <div><span class="font-medium">Auto Enhance:</span> {{ selectedMemoryBook.auto_enhance ? 'true' : 'false' }}</div>
            <div><span class="font-medium">Created At:</span> {{ formatDate(selectedMemoryBook.created_at) }}</div>
            <div><span class="font-medium">Updated At:</span> {{ formatDate(selectedMemoryBook.updated_at) }}</div>
            <div><span class="font-medium">Generated At:</span> {{ selectedMemoryBook.generated_at ? formatDate(selectedMemoryBook.generated_at) : 'null' }}</div>
            <div><span class="font-medium">Approved At:</span> {{ selectedMemoryBook.approved_at ? formatDate(selectedMemoryBook.approved_at) : 'null' }}</div>
            <div><span class="font-medium">Distributed At:</span> {{ selectedMemoryBook.distributed_at ? formatDate(selectedMemoryBook.distributed_at) : 'null' }}</div>
            <div><span class="font-medium">Deleted:</span> {{ selectedMemoryBook.deleted ? 'true' : 'false' }}</div>
            <div><span class="font-medium">Deleted At:</span> {{ selectedMemoryBook.deleted_at ? formatDate(selectedMemoryBook.deleted_at) : 'null' }}</div>
          </div>
        </div>

        <!-- URLs Section -->
        <div class="mb-4 space-y-2">
          <div v-if="selectedMemoryBook.pdf_url" class="p-3 bg-brand-surface-100 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">PDF URL:</div>
            <div class="text-xs text-brand-primary/70 font-mono break-all">
              {{ selectedMemoryBook.pdf_url }}
            </div>
          </div>
          <div v-if="selectedMemoryBook.background_url" class="p-3 bg-brand-surface-100 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">Background URL:</div>
            <div class="text-xs text-brand-primary/70 font-mono break-all">
              {{ selectedMemoryBook.background_url }}
            </div>
          </div>
        </div>

        <!-- Text Content Section -->
        <div class="mb-4 space-y-2">
          <div v-if="selectedMemoryBook.ai_supplemental_prompt" class="p-3 bg-brand-surface-100 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">AI Supplemental Prompt:</div>
            <div class="text-sm text-brand-primary/70">{{ selectedMemoryBook.ai_supplemental_prompt }}</div>
          </div>
          
          <div v-if="selectedMemoryBook.magic_story" class="p-3 bg-brand-surface-100 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">Magic Story:</div>
            <div class="text-sm text-brand-primary/70">{{ selectedMemoryBook.magic_story }}</div>
          </div>
          
          <div v-if="selectedMemoryBook.ai_photo_selection_reasoning" class="p-3 bg-brand-surface-100 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">AI Photo Selection Reasoning:</div>
            <div class="text-sm text-brand-primary/70">{{ selectedMemoryBook.ai_photo_selection_reasoning }}</div>
          </div>
          
          <div v-if="selectedMemoryBook.review_notes" class="p-3 bg-brand-surface-100 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">Review Notes:</div>
            <div class="text-sm text-brand-primary/70">{{ selectedMemoryBook.review_notes }}</div>
          </div>
        </div>

        <!-- Arrays Section -->
        <div class="mb-4 space-y-2">
          <div v-if="selectedMemoryBook.created_from_assets?.length" class="p-3 bg-brand-surface-100 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">Created From Assets ({{ selectedMemoryBook.created_from_assets.length }}):</div>
            <div class="text-xs text-brand-primary/70 font-mono">
              {{ selectedMemoryBook.created_from_assets.join(', ') }}
            </div>
          </div>
          
          <div v-if="selectedMemoryBook.photo_selection_pool?.length" class="p-3 bg-brand-surface-100 rounded-lg">
            <div class="text-xs font-semibold text-brand-primary mb-1">Photo Selection Pool ({{ selectedMemoryBook.photo_selection_pool.length }}):</div>
            <div class="text-xs text-brand-primary/70 font-mono">
              {{ selectedMemoryBook.photo_selection_pool.join(', ') }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <!-- Action Buttons -->
          <div class="flex gap-2">
            <Button
              v-if="selectedMemoryBook?.pdf_url"
              label="View PDF"
              icon="pi pi-eye"
              @click="viewMemoryBookPDF"
              class="px-3 py-2 text-sm"
            />
            <Button
              v-if="selectedMemoryBook?.status === 'draft'"
              label="Generate Book"
              icon="pi pi-play"
              @click="generateBookFromModal"
              class="px-3 py-2 text-sm"
            />
          </div>
          
          <!-- Close Button -->
          <Button
            label="Close"
            icon="pi pi-times"
            @click="showMemoryBookModal = false"
            class="px-3 py-2 text-sm"
          />
        </div>
      </template>
    </Dialog>

    <!-- Trash Dialog -->
    <Dialog
      v-model:visible="showTrashDialog"
      modal
      header="User Trash"
      :style="{ width: '90vw', maxWidth: '1200px' }"
    >
      <div class="space-y-4">
        <!-- Trash Header -->
        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <i class="pi pi-trash text-2xl text-gray-600"></i>
          <div>
            <h3 class="text-lg font-semibold text-brand-primary">User Trash</h3>
            <p class="text-sm text-brand-primary/70">Manage disabled users and permanently delete them if needed.</p>
          </div>
        </div>

        <!-- Disabled Users Table -->
        <div v-if="deletedUsers.length > 0">
          <DataTable
            :value="deletedUsers"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} disabled users"
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
                    <div class="text-sm font-medium text-brand-primary/70">
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
                <span class="text-sm text-brand-primary/70">{{ formatDateOnlyDate(data.created_at) }}</span>
              </template>
            </Column>

            <Column header="Actions">
              <template #body="{ data }">
                <div class="flex items-center space-x-2">
                  <Button
                    icon="pi pi-refresh"
                    class="bg-brand-dialog-save hover:bg-brand-dialog-save-hover text-white border-0 px-2 py-1 text-xs"
                    @click="restoreUser(data.user_id)"
                    title="Restore User"
                  />
                  <Button
                    icon="pi pi-eye"
                    class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
                    @click="viewUserDetails(data)"
                    title="View Details"
                  />
                  <Button
                    icon="pi pi-download"
                    class="bg-brand-dialog-edit hover:bg-brand-dialog-edit-hover text-white border-0 px-2 py-1 text-xs"
                    @click="backupUser(data.user_id)"
                    title="Backup User"
                  />
                  <Button
                    v-if="data.user_id !== userProfile?.user_id"
                    icon="pi pi-times"
                    class="bg-red-800 hover:bg-red-900 text-white border-0 px-2 py-1 text-xs"
                    @click="confirmDeleteUser(data)"
                    title="Permanently Delete User"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Empty Trash Message -->
        <div v-else class="text-center py-12">
          <i class="pi pi-trash text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-lg font-semibold text-brand-primary/70 mb-2">Trash is Empty</h3>
          <p class="text-sm text-brand-primary/50">No disabled users found.</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center gap-3">
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            @click="loadDeletedUsers()"
            class="bg-blue-500 hover:bg-blue-600 text-white border-0 px-4 py-2 rounded-lg transition-colors duration-200"
            title="Refresh disabled users list"
          />
          <div class="flex">
            <Button
              label="Close"
              icon="pi pi-times"
              @click="showTrashDialog = false"
              class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-4 py-2 rounded-lg transition-colors duration-200"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  middleware: ['admin']
})

import { useToast } from 'primevue/usetoast'

const db = useDatabase()
const toast = useToast()
const supabase = useNuxtApp().$supabase

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
const showEditThemeModal = ref(false)
const showDeleteConfirmDialog = ref(false)
const showPermanentDeleteConfirmDialog = ref(false)
const showCardDefaultWarningDialog = ref(false)
const themeToDelete = ref(null)
const themeToPermanentDelete = ref(null)
const pendingCardDefaultChange = ref({ isNewTheme: false, value: false })
const creatingTheme = ref(false)
const updatingTheme = ref(false)
const showDeletedThemes = ref(false)
const deletedThemes = ref([])
const showLayoutEditorDialog = ref(false)
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
  layout_config: '',
  rounded: false,
  size: '8.5x11',
  card_default: false,
  card_wizard: false,
  photo_border: 0,
  page_border: 0,
  page_border_offset: 5,
  editDefaultsMode: false
})
const editingTheme = ref({
  id: '',
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
  layout_config: '',
  rounded: false,
  size: '8.5x11',
  card_default: false,
  card_wizard: false,
  photo_border: 0,
  page_border: 0,
  page_border_offset: 5,
  editDefaultsMode: false
})

// Font options for EBGaramond fonts
const fontOptions = ref([
  { label: 'EB Garamond Regular', value: 'EB Garamond' },
  { label: 'EB Garamond Italic', value: 'EB Garamond Italic' },
  { label: 'EB Garamond Medium', value: 'EB Garamond Medium' },
  { label: 'EB Garamond Medium Italic', value: 'EB Garamond Medium Italic' },
  { label: 'EB Garamond SemiBold', value: 'EB Garamond SemiBold' },
  { label: 'EB Garamond SemiBold Italic', value: 'EB Garamond SemiBold Italic' },
  { label: 'EB Garamond Bold', value: 'EB Garamond Bold' },
  { label: 'EB Garamond Bold Italic', value: 'EB Garamond Bold Italic' },
  { label: 'EB Garamond ExtraBold', value: 'EB Garamond ExtraBold' },
  { label: 'EB Garamond ExtraBold Italic', value: 'EB Garamond ExtraBold Italic' }
])

// Size options for themes
  const sizeOptions = ref([
    { label: '4x6 inches (Portrait)', value: '4x6' },
    { label: '6x4 inches (Landscape)', value: '6x4' },
    { label: '5x3 inches (Landscape)', value: '5x3' },
  { label: '5x7 inches (Portrait)', value: '5x7' },
  { label: '7x5 inches (Landscape)', value: '7x5' },
  { label: '8x10 inches (Portrait)', value: '8x10' },
  { label: '10x8 inches (Landscape)', value: '10x8' },
  { label: '8.5x11 inches (Letter Portrait)', value: '8.5x11' },
  { label: '11x8.5 inches (Letter Landscape)', value: '11x8.5' },
  { label: '11x14 inches (Portrait)', value: '11x14' },
  { label: '14x11 inches (Landscape)', value: '14x11' },
  { label: '12x12 inches (Square)', value: '12x12' }
])

// User management variables
const users = ref([])
const userSearch = ref('')
const roleFilter = ref('all')
const showUserModal = ref(false)
const selectedUserForDetails = ref(null)

const showViewBackupsModal = ref(false)
const backups = ref([])
const loadingBackups = ref(false)
const backupPage = ref(1)
const backupRows = ref(10)
const totalBackups = ref(0)
const showDeleteBackupConfirmDialog = ref(false)
const backupToDelete = ref(null)
const deletingBackup = ref(false)

// Restore backup variables
const showRestoreBackupConfirmDialog = ref(false)
const backupToRestore = ref(null)
const restoringBackup = ref(false)
const userExists = ref(false)
const showTrashDialog = ref(false)
const deletedUsers = ref([])

// Delete user variables
const showDeleteUserConfirmDialog = ref(false)
const userToDelete = ref(null)
const deletingUser = ref(false)

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

// Activity management variables
const activityType = ref('system') // 'system' or 'email'
const selectedActivityUser = ref(null)
const activityData = ref([])
const activityPage = ref(1)
const activityRows = ref(50)
const totalActivityRecords = ref(0)
const loadingActivity = ref(false)
const emailFilter = ref('')
const emailEventTypeFilter = ref('all')

// Detail dialog variables
const showActivityDetailsDialog = ref(false)
const showEmailDetailsDialog = ref(false)
const selectedActivityItem = ref(null)
const selectedEmailItem = ref(null)

// Email event type options
const emailEventTypeOptions = ref([
  { label: 'All Event Types', value: 'all' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Opened', value: 'opened' },
  { label: 'Clicked', value: 'clicked' },
  { label: 'Bounced', value: 'bounced' },
  { label: 'Dropped', value: 'dropped' }
])

// Layout Defaults Modal
const showLayoutDefaultsModal = ref(false)
const isEditDefaultsMode = ref(false)
const password = ref('')
const passwordError = ref('')
const selectedLayoutDefault = ref(null)

// Layout default options
  const layoutDefaultOptions = ref([
    { label: '4x6 inches - Small Portrait Layout', value: '4x6' },
    { label: '6x4 inches - Small Landscape Layout', value: '6x4' },
    { label: '5x3 inches - Small Landscape Layout', value: '5x3' },
  { label: '5x7 inches - Medium Portrait Layout', value: '5x7' },
  { label: '7x5 inches - Medium Landscape Layout', value: '7x5' },
  { label: '8x10 inches - Large Portrait Layout', value: '8x10' },
  { label: '10x8 inches - Large Landscape Layout', value: '10x8' },
  { label: '8.5x11 inches - Letter Portrait Layout', value: '8.5x11' },
  { label: '11x8.5 inches - Letter Landscape Layout', value: '11x8.5' },
  { label: '11x14 inches - Extra Large Portrait Layout', value: '11x14' },
  { label: '14x11 inches - Extra Large Landscape Layout', value: '14x11' },
  { label: '12x12 inches - Square Layout', value: '12x12' }
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
      asset.ai_caption?.toLowerCase().includes(search) ||
      asset.ai_description?.toLowerCase().includes(search)
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
              book.ai_supplemental_prompt?.toLowerCase().includes(search)
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
  console.log('[Admin Page] onMounted started')
  
  // Check authentication on client side
  const user = useSupabaseUser()
  if (!user.value) {
    console.log('[Admin Page] No authenticated user, redirecting to login')
    await navigateTo('/app/login')
    return
  }
  
  console.log('[Admin Page] User authenticated, loading data...')

  try {
    console.log('[Admin Page] Loading themes...')
    await loadThemes()
    console.log('[Admin Page] Themes loaded')
    
    console.log('[Admin Page] Loading stats...')
    await loadStats()
    console.log('[Admin Page] Stats loaded')
    
    console.log('[Admin Page] Loading user profile...')
    await loadUserProfile() // Load user profile for admin checks
    console.log('[Admin Page] User profile loaded')
    
    console.log('[Admin Page] All data loaded successfully')
  } catch (error) {
    console.error('[Admin Page] Error loading data:', error)
    // Continue loading even if there's an error
  }
  
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
    if (tabIndex >= 0 && tabIndex <= 4) { // Updated to include Activity tab (index 4)
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
  
  // If Activity tab is selected (index 4) and user is admin, load activity data
  if (newIndex === 4 && userProfile.value && userProfile.value.role === 'admin') {
    console.log('[Tab Change] Loading activity data for admin user')
    await loadActivityData()
  }
})

// Watch for newTheme size changes
watch(() => newTheme.value.size, (newSize) => {
  console.log('[newTheme] Size changed to:', newSize)
})

// Watch for editingTheme size changes
watch(() => editingTheme.value.size, (newSize) => {
  console.log('[editingTheme] Size changed to:', newSize)
})

// Watch for activity type changes
watch(activityType, async (newType) => {
  console.log('[Activity] Type changed to:', newType)
  activityPage.value = 1 // Reset to first page
  await loadActivityData()
})

// Watch for activity user filter changes
watch(selectedActivityUser, async (newUser) => {
  console.log('[Activity] User filter changed:', newUser?.email)
  activityPage.value = 1 // Reset to first page
  await loadActivityData()
})

// Watch for email filters
watch([emailFilter, emailEventTypeFilter], async () => {
  if (activityType.value === 'email') {
    console.log('[Activity] Email filters changed')
    activityPage.value = 1 // Reset to first page
    await loadActivityData()
  }
})

// Watch for trash dialog to refresh data when opened
watch(showTrashDialog, async (isOpen) => {
  if (isOpen) {
    await loadDeletedUsers()
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

// Load disabled users
const loadDeletedUsers = async () => {
  try {
    const deletedUsersData = await db.admin.getDeletedUsers()
    deletedUsers.value = deletedUsersData
  } catch (error) {
    console.error('Error loading disabled users:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load disabled users',
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

// Activity management functions
const loadActivityData = async () => {
  loadingActivity.value = true
  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    
    let url = activityType.value === 'system' 
      ? `/api/admin/activity?page=${activityPage.value}&rows=${activityRows.value}`
      : `/api/admin/email-activity?page=${activityPage.value}&rows=${activityRows.value}`
    
    // Add filters
    if (selectedActivityUser.value?.user_id) {
      url += `&userId=${selectedActivityUser.value.user_id}`
    }
    if (activityType.value === 'email') {
      if (emailFilter.value) {
        url += `&email=${encodeURIComponent(emailFilter.value)}`
      }
      if (emailEventTypeFilter.value !== 'all') {
        url += `&eventType=${emailEventTypeFilter.value}`
      }
    }
    
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch activity data')
    }
    
    const result = await res.json()
    // Ensure data is an array and filter out any null/undefined items
    activityData.value = Array.isArray(result.data) ? result.data.filter(item => item !== null && item !== undefined) : []
    totalActivityRecords.value = result.totalCount || 0
  } catch (error) {
    console.error('Error loading activity data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load activity data',
      life: 3000
    })
    activityData.value = []
    totalActivityRecords.value = 0
  } finally {
    loadingActivity.value = false
  }
}

const onActivityPage = async (event) => {
  activityPage.value = event.page + 1 // PrimeVue pages are 0-based
  activityRows.value = event.rows
  await loadActivityData()
}

// Activity formatting functions
const formatActivityAction = (action) => {
  // Handle null/undefined action
  if (!action) return 'Unknown Action'
  
  const actionMap = {
    'asset_uploaded': 'Asset Uploaded',
    'asset_approved': 'Asset Approved',
    'asset_rejected': 'Asset Rejected',
    'memory_book_created': 'Memory Book Created',
    'memory_book_generated': 'Memory Book Generated',
    'user_registered': 'User Registered',
    'user_role_updated': 'User Role Updated',
    'user_disabled': 'User Disabled',
    'user_restored': 'User Restored',
    'theme_created': 'Theme Created',
    'theme_updated': 'Theme Updated',
    'theme_deleted': 'Theme Deleted',
    'page_visit': 'Page Visit',
    'session_start': 'Session Start'
  }
  return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getActivitySeverity = (action) => {
  // Handle null/undefined action
  if (!action) return 'info'
  
  const severityMap = {
    'asset_uploaded': 'info',
    'asset_approved': 'success',
    'asset_rejected': 'danger',
    'memory_book_created': 'info',
    'memory_book_generated': 'success',
    'user_registered': 'info',
    'user_role_updated': 'warning',
    'user_disabled': 'danger',
    'user_restored': 'success',
    'theme_created': 'info',
    'theme_updated': 'warning',
    'theme_deleted': 'danger',
    'page_visit': 'info',
    'session_start': 'info'
  }
  return severityMap[action] || 'info'
}

const formatActivityDetails = (details) => {
  if (!details || typeof details !== 'object') return 'No details'
  
  try {
    const detailStrings = []
    for (const [key, value] of Object.entries(details)) {
      if (value !== null && value !== undefined) {
        detailStrings.push(`${key}: ${value}`)
      }
    }
    return detailStrings.join(', ') || 'No details'
  } catch (error) {
    return 'Error parsing details'
  }
}

const getEmailEventSeverity = (eventType) => {
  // Handle null/undefined eventType
  if (!eventType) return 'info'
  
  const severityMap = {
    'delivered': 'success',
    'opened': 'info',
    'clicked': 'primary',
    'bounced': 'danger',
    'dropped': 'danger'
  }
  return severityMap[eventType] || 'info'
}

// Detail view functions
const viewActivityDetails = (item) => {
  selectedActivityItem.value = item
  showActivityDetailsDialog.value = true
}

const viewEmailDetails = (item) => {
  selectedEmailItem.value = item
  showEmailDetailsDialog.value = true
}

// JSON formatting function
const formatJsonForDisplay = (jsonData) => {
  if (!jsonData) return 'No data'
  
  try {
    // If it's already a string, try to parse it
    if (typeof jsonData === 'string') {
      const parsed = JSON.parse(jsonData)
      return JSON.stringify(parsed, null, 2)
    }
    
    // If it's already an object, stringify it with formatting
    if (typeof jsonData === 'object') {
      return JSON.stringify(jsonData, null, 2)
    }
    
    return String(jsonData)
  } catch (error) {
    // If parsing fails, return as string
    return String(jsonData)
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
    
    // Reload users list
    await loadUsers()
    
    // Refresh trash dialog if it's open
    if (showTrashDialog.value) {
      await loadDeletedUsers()
    }
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
const userAssetsCount = ref(0)
const userBooksCount = ref(0)

const viewUserDetails = async (user) => {
  selectedUserForDetails.value = user
  showUserModal.value = true
  // Fetch asset and memory book counts for this user from the server
  if (user && user.user_id) {
    try {
      // Fetch asset count from server
      const assetRes = await fetch(`/api/users/${user.user_id}/assets?count=1`)
      const assetData = await assetRes.json()
      userAssetsCount.value = assetData?.count ?? 0
    } catch (e) {
      userAssetsCount.value = 0
    }
    try {
      // Fetch memory book count from server
      const bookRes = await fetch(`/api/users/${user.user_id}/memory-books?count=1`)
      const bookData = await bookRes.json()
      userBooksCount.value = bookData?.count ?? 0
    } catch (e) {
      userBooksCount.value = 0
    }
  } else {
    userAssetsCount.value = 0
    userBooksCount.value = 0
  }
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

// Asset viewing modal
const showAssetModal = ref(false)
const selectedAsset = ref(null)

// Memory book viewing modal
const showMemoryBookModal = ref(false)
const selectedMemoryBook = ref(null)

// Asset actions
const viewAsset = (asset) => {
  selectedAsset.value = asset
  showAssetModal.value = true
}

// Handle image loading errors
const handleImageError = (event) => {
  console.error('Error loading image:', event)
  toast.add({
    severity: 'error',
    summary: 'Image Error',
    detail: 'Failed to load image. The image may have been deleted or is inaccessible.',
    life: 5000
  })
}

// Approve asset from modal
const approveAssetFromModal = async () => {
  if (!selectedAsset.value) return
  
  try {
    await approveAsset(selectedAsset.value.id)
    
    // Update the selected asset's approved status
    selectedAsset.value.approved = true
    selectedAsset.value.rejected = false
    
    // Update the asset in the main assets list
    const assetIndex = assets.value.findIndex(a => a.id === selectedAsset.value.id)
    if (assetIndex !== -1) {
      assets.value[assetIndex].approved = true
      assets.value[assetIndex].rejected = false
    }
    
    toast.add({
      severity: 'success',
      summary: 'Approved',
      detail: 'Asset approved successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error approving asset from modal:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to approve asset',
      life: 3000
    })
  }
}

// Unapprove asset from modal
const unapproveAssetFromModal = async () => {
  if (!selectedAsset.value) return
  
  try {
    // Update the asset in the database
    const { data, error } = await supabase
      .from('assets')
      .update({ approved: false })
      .eq('id', selectedAsset.value.id)
      .select()
    
    if (error) throw error
    
    // Update the selected asset's approved status
    selectedAsset.value.approved = false
    
    // Update the asset in the main assets list
    const assetIndex = assets.value.findIndex(a => a.id === selectedAsset.value.id)
    if (assetIndex !== -1) {
      assets.value[assetIndex].approved = false
    }
    
    toast.add({
      severity: 'success',
      summary: 'Unapproved',
      detail: 'Asset unapproved successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error unapproving asset from modal:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to unapprove asset',
      life: 3000
    })
  }
}

// View memory book PDF
const viewMemoryBookPDF = () => {
  if (!selectedMemoryBook.value?.pdf_url) return
  
  // Open PDF in new tab
  window.open(selectedMemoryBook.value.pdf_url, '_blank')
}

// Generate book from modal
const generateBookFromModal = async () => {
  if (!selectedMemoryBook.value) return
  
  try {
    await generateBook(selectedMemoryBook.value)
    
    // Update the selected memory book's status
    selectedMemoryBook.value.status = 'ready'
    
    // Update the memory book in the main books list
    const bookIndex = books.value.findIndex(b => b.id === selectedMemoryBook.value.id)
    if (bookIndex !== -1) {
      books.value[bookIndex].status = 'ready'
    }
    
    toast.add({
      severity: 'success',
      summary: 'Generated',
      detail: 'Memory book generated successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Error generating book from modal:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to generate memory book',
      life: 3000
    })
  }
}

// Book actions
const downloadBook = async (book) => {
  try {
    const pdfUrl = await db.editor.downloadMemoryBook(book.id)
    
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
  selectedMemoryBook.value = book
  showMemoryBookModal.value = true
}

// Theme actions
const createTheme = async () => {
  console.log('[CREATE THEME] ===== FUNCTION CALLED =====')
  console.log('[CREATE THEME] Starting theme creation...')
  console.log('[CREATE THEME] Theme data:', newTheme.value)
  
  if (!newTheme.value.name) {
    console.log('[CREATE THEME] No theme name provided')
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Theme name is required',
      life: 3000
    })
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
    console.log('[CREATE THEME] Theme to save:', themeToSave)
    
    if (themeToSave.layout_config && typeof themeToSave.layout_config === 'string') {
      try {
        themeToSave.layout_config = JSON.parse(themeToSave.layout_config)
        console.log('[CREATE THEME] Parsed layout config:', themeToSave.layout_config)
      } catch (e) {
        console.error('[CREATE THEME] JSON parse error:', e)
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
    
    console.log('[CREATE THEME] Calling database createTheme...')
    const createdTheme = await db.editor.createTheme(themeToSave)
    console.log('[CREATE THEME] Database response:', createdTheme)
    
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
      layout_config: '',
      rounded: false,
      size: '8.5x11',
      card_default: false,
      card_wizard: false,
      photo_border: 0,
      page_border: 0,
      page_border_offset: 5,
      editDefaultsMode: false
    }
    showCreateThemeModal.value = false
    
    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('[CREATE THEME] Error creating theme:', error)
    
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
    console.log('[CREATE THEME] Theme creation completed')
  }
}

const editTheme = (theme) => {
  console.log('[EDIT THEME] Opening edit modal for theme:', theme)
  
  // Copy theme data to editing form
  editingTheme.value = {
    id: theme.id,
    name: theme.name || '',
    description: theme.description || '',
    preview_image_url: theme.preview_image_url || '',
    is_active: theme.is_active,
    background_color: theme.background_color || '#fffbe9',
    background_opacity: theme.background_opacity || 100,
    header_font: theme.header_font || '',
    body_font: theme.body_font || '',
    signature_font: theme.signature_font || '',
    header_font_color: theme.header_font_color || '',
    body_font_color: theme.body_font_color || '',
    signature_font_color: theme.signature_font_color || '',
    layout_config: typeof theme.layout_config === 'object' ? JSON.stringify(theme.layout_config, null, 2) : (theme.layout_config || ''),
    rounded: theme.rounded || false,
    size: theme.size || '8.5x11',
    card_default: theme.card_default || false,
    card_wizard: theme.card_wizard || false,
    photo_border: theme.photo_border || 0,
    page_border: theme.page_border || 0,
    page_border_offset: theme.page_border_offset || 5,
    editDefaultsMode: false
  }
  
  showEditThemeModal.value = true
}

// Card default change handling functions
const handleCardDefaultChange = (isNewTheme) => {
  const currentValue = isNewTheme ? newTheme.value.card_default : editingTheme.value.card_default
  
  if (!currentValue) {
    // If trying to set as default, show warning dialog
    pendingCardDefaultChange.value = { isNewTheme, value: true }
    showCardDefaultWarningDialog.value = true
  } else {
    // If trying to unset as default, just do it
    if (isNewTheme) {
      newTheme.value.card_default = false
    } else {
      editingTheme.value.card_default = false
    }
  }
}

const confirmCardDefaultChange = async () => {
  const { isNewTheme, value } = pendingCardDefaultChange.value
  
  try {
    // First, unset any existing default themes
    const existingDefaultThemes = themes.value.filter(theme => theme.card_default)
    for (const theme of existingDefaultThemes) {
      await db.editor.updateTheme(theme.id, { ...theme, card_default: false })
    }
    
    // Then set the new default
    if (isNewTheme) {
      newTheme.value.card_default = value
    } else {
      editingTheme.value.card_default = value
    }
    
    // Reload themes to reflect changes
    await loadThemes()
    
    toast.add({
      severity: 'success',
      summary: 'Default Updated',
      detail: 'Card wizard default theme has been updated',
      life: 3000
    })
  } catch (error) {
    console.error('Error updating card default:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update card wizard default',
      life: 3000
    })
  } finally {
    showCardDefaultWarningDialog.value = false
    pendingCardDefaultChange.value = { isNewTheme: false, value: false }
  }
}

const updateTheme = async () => {
  console.log('[UPDATE THEME] ===== FUNCTION CALLED =====')
  console.log('[UPDATE THEME] Starting theme update...')
  console.log('[UPDATE THEME] Theme data:', editingTheme.value)
  
  if (!editingTheme.value.name) {
    console.log('[UPDATE THEME] No theme name provided')
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Theme name is required',
      life: 3000
    })
    return
  }

  // Check if theme name already exists (excluding current theme)
  const existingTheme = themes.value.find(theme => 
    theme.id !== editingTheme.value.id && 
    theme.name.toLowerCase() === editingTheme.value.name.toLowerCase()
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

  updatingTheme.value = true

  try {
    const themeToUpdate = { ...editingTheme.value }
    console.log('[UPDATE THEME] Theme to update:', themeToUpdate)
    
    if (themeToUpdate.layout_config && typeof themeToUpdate.layout_config === 'string') {
      try {
        themeToUpdate.layout_config = JSON.parse(themeToUpdate.layout_config)
        console.log('[UPDATE THEME] Parsed layout config:', themeToUpdate.layout_config)
      } catch (e) {
        console.error('[UPDATE THEME] JSON parse error:', e)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Layout config must be valid JSON',
          life: 3000
        })
        updatingTheme.value = false
        return
      }
    }
    
    console.log('[UPDATE THEME] Calling database updateTheme...')
    const updatedTheme = await db.editor.updateTheme(themeToUpdate.id, themeToUpdate)
    console.log('[UPDATE THEME] Database response:', updatedTheme)
    
    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Theme updated successfully',
      life: 3000
    })
    
    // Close modal
    showEditThemeModal.value = false
    
    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('[UPDATE THEME] Error updating theme:', error)
    
    // Handle specific error types
    let errorMessage = 'Failed to update theme'
    
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
    updatingTheme.value = false
    console.log('[UPDATE THEME] Theme update completed')
  }
}

const openLayoutEditorForEditTheme = () => {
  console.log('[Layout Editor] Opening layout editor for editing theme')
  showLayoutEditorDialog.value = true
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

const confirmDeleteTheme = (theme) => {
  themeToDelete.value = theme
  showDeleteConfirmDialog.value = true
}

const confirmPermanentDeleteTheme = (theme) => {
  themeToPermanentDelete.value = theme
  showPermanentDeleteConfirmDialog.value = true
}

const duplicateTheme = async (theme) => {
  try {
    // Create a copy of the theme with " - copy" suffix
    const duplicatedTheme = {
      name: theme.name + ' - copy',
      description: theme.description,
      preview_image_url: theme.preview_image_url,
      is_active: false, // Duplicated themes start as inactive
      background_color: theme.background_color,
      background_opacity: theme.background_opacity,
      header_font: theme.header_font,
      body_font: theme.body_font,
      signature_font: theme.signature_font,
      header_font_color: theme.header_font_color,
      body_font_color: theme.body_font_color,
      signature_font_color: theme.signature_font_color,
      layout_config: theme.layout_config,
      rounded: theme.rounded,
      size: theme.size
    }
    
    // Check if the duplicated name already exists
    const existingTheme = themes.value.find(t => 
      t.name.toLowerCase() === duplicatedTheme.name.toLowerCase()
    )
    
    if (existingTheme) {
      toast.add({
        severity: 'error',
        summary: 'Duplicate Name',
        detail: 'A theme with this name already exists. Please rename the original theme first.',
        life: 5000
      })
      return
    }
    
    // Create the duplicated theme
    const createdTheme = await db.editor.createTheme(duplicatedTheme)
    
    toast.add({
      severity: 'success',
      summary: 'Duplicated',
      detail: 'Theme duplicated successfully',
      life: 3000
    })
    
    // Reload themes
    await loadThemes()
  } catch (error) {
    console.error('Error duplicating theme:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to duplicate theme',
      life: 3000
    })
  }
}

const deleteThemeConfirmed = async () => {
  if (!themeToDelete.value) return
  
  try {
    await db.editor.deleteTheme(themeToDelete.value.id)
    toast.add({
      severity: 'success',
      summary: 'Moved to Trash',
      detail: 'Theme moved to trash successfully',
      life: 3000
    })
    await loadThemes()
    if (showDeletedThemes.value) {
      await loadDeletedThemes()
    }
  } catch (error) {
    console.error('Error deleting theme:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to move theme to trash',
      life: 3000
    })
  } finally {
    showDeleteConfirmDialog.value = false
    themeToDelete.value = null
  }
}

const permanentDeleteThemeConfirmed = async () => {
  if (!themeToPermanentDelete.value) return
  
  try {
    await db.editor.permanentDeleteTheme(themeToPermanentDelete.value.id)
    toast.add({
      severity: 'success',
      summary: 'Permanently Deleted',
      detail: 'Theme has been permanently removed from the database',
      life: 3000
    })
    await loadThemes()
    if (showDeletedThemes.value) {
      await loadDeletedThemes()
    }
  } catch (error) {
    console.error('Error permanently deleting theme:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to permanently delete theme',
      life: 3000
    })
  } finally {
    showPermanentDeleteConfirmDialog.value = false
    themeToPermanentDelete.value = null
  }
}

const deleteTheme = async (themeId) => {
  if (!confirm('Are you sure you want to delete this theme?')) {
    return
  }
  try {
    await db.editor.deleteTheme(themeId)
    if (toast) {
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
    if (toast) {
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

// Layout Editor functions
const openLayoutEditor = () => {
  console.log('[Layout Editor] Button clicked, opening layout editor dialog')
  showLayoutEditorDialog.value = true
}

const openLayoutEditorForTheme = () => {
  console.log('[Layout Editor] Opening layout editor for theme')
  console.log('[Layout Editor] Current newTheme size:', newTheme.value.size)
  console.log('[Layout Editor] Current newTheme layout_config:', newTheme.value.layout_config)
  showLayoutEditorDialog.value = true
}

const getCurrentThemeSize = () => {
  // If we're editing a theme, use the editing theme's size
  if (showEditThemeModal.value && editingTheme.value.id) {
    console.log('[getCurrentThemeSize] Editing theme size:', editingTheme.value.size)
    return editingTheme.value.size || '8.5x11'
  }
  // Otherwise use the new theme's size
  console.log('[getCurrentThemeSize] New theme size:', newTheme.value.size)
  return newTheme.value.size || '8.5x11'
}

const getCurrentEditDefaultsMode = () => {
  // If we're editing a theme, use the editing theme's editDefaultsMode
  if (showEditThemeModal.value && editingTheme.value.id) {
    return editingTheme.value.editDefaultsMode || false
  }
  // Otherwise use the new theme's editDefaultsMode
  return newTheme.value.editDefaultsMode || false
}

const getInitialLayout = () => {
  // If we're editing a theme, use the editing theme's layout config
  if (showEditThemeModal.value && editingTheme.value.id) {
    const layoutConfig = editingTheme.value.layout_config
    if (!layoutConfig) {
      return null
    }
    
    try {
      // If it's already an object, return it
      if (typeof layoutConfig === 'object') {
        return layoutConfig
      }
      
      // If it's a string, parse it
      if (typeof layoutConfig === 'string') {
        return JSON.parse(layoutConfig)
      }
      
      return null
    } catch (error) {
      console.error('[Layout Editor] Error parsing layout config:', error)
      return null
    }
  }
  
  // Otherwise use the new theme's layout config
  if (!newTheme.value.layout_config) {
    return null
  }
  
  try {
    // If it's already an object, return it
    if (typeof newTheme.value.layout_config === 'object') {
      return newTheme.value.layout_config
    }
    
    // If it's a string, parse it
    if (typeof newTheme.value.layout_config === 'string') {
      return JSON.parse(newTheme.value.layout_config)
    }
    
    return null
  } catch (error) {
    console.error('[Layout Editor] Error parsing layout config:', error)
    return null
  }
}

const saveLayoutToTheme = () => {
  // This function will be called when the user clicks "Save Layout" button
  // It will trigger the layout editor to save the current layout to the theme
  if (showLayoutEditorDialog.value) {
    // If layout editor is open, we need to trigger a save
    // For now, we'll just show a message
    toast.add({
      severity: 'info',
      summary: 'Save Layout',
      detail: 'Please use the Save Layout button in the Layout Editor dialog',
      life: 3000
    })
  } else {
    // If layout editor is not open, we can save the current layout_config
    if (newTheme.value.layout_config) {
      toast.add({
        severity: 'success',
        summary: 'Layout Saved',
        detail: 'Layout configuration saved to theme',
        life: 3000
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'No Layout',
        detail: 'Please use the Layout Editor to create a layout first',
        life: 3000
      })
    }
  }
}

const handleLayoutSave = (layoutJson) => {
  console.log('Saved layout:', layoutJson)
  
  // If editing defaults, the save is handled by the LayoutEditor component
  if (getCurrentEditDefaultsMode()) {
    toast.add({
      severity: 'success',
      summary: 'Default Saved',
      detail: 'Default layout saved successfully',
      life: 3000
    })
  } else {
    // If editing a theme, save the layout JSON to the correct theme's layout_config field
    if (showEditThemeModal.value && editingTheme.value.id) {
      editingTheme.value.layout_config = JSON.stringify(layoutJson, null, 2)
    } else {
      newTheme.value.layout_config = JSON.stringify(layoutJson, null, 2)
    }
    
    toast.add({
      severity: 'success',
      summary: 'Layout Saved',
      detail: 'Layout configuration saved to theme',
      life: 3000
    })
  }
  
  // Close the dialog after saving
  showLayoutEditorDialog.value = false
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

// Layout Defaults Functions
const checkPassword = () => {
  if (password.value === 'edventions') {
    isEditDefaultsMode.value = true
    password.value = ''
    passwordError.value = ''
  } else {
    passwordError.value = 'Incorrect password. Please try again.'
  }
}

const cancelPassword = () => {
  showLayoutDefaultsModal.value = false
  isEditDefaultsMode.value = false
  password.value = ''
  passwordError.value = ''
  selectedLayoutDefault.value = null
}

const closeLayoutDefaultsModal = () => {
  showLayoutDefaultsModal.value = false
  isEditDefaultsMode.value = false
  password.value = ''
  passwordError.value = ''
  selectedLayoutDefault.value = null
}

  const getLayoutDefaultName = (size) => {
    const layoutNames = {
      '4x6': 'Small Portrait Layout',
      '6x4': 'Small Landscape Layout',
      '5x3': 'Small Landscape Layout',
    '5x7': 'Medium Portrait Layout',
    '7x5': 'Medium Landscape Layout',
    '8x10': 'Large Portrait Layout',
    '10x8': 'Large Landscape Layout',
    '8.5x11': '8.5x11 Portrait Layout',
    '11x8.5': 'Letter Landscape Layout',
    '11x14': 'Extra Large Portrait Layout',
    '14x11': 'Extra Large Landscape Layout',
    '12x12': 'Square Layout'
  }
  return layoutNames[size] || 'Unknown Layout'
}

const openLayoutEditorForDefault = () => {
  if (!selectedLayoutDefault.value) return
  
  // Set the theme size to the selected layout default
  newTheme.value.size = selectedLayoutDefault.value
  newTheme.value.editDefaultsMode = true
  
  // Close the layout defaults modal
  showLayoutDefaultsModal.value = false
  isEditDefaultsMode.value = false
  password.value = ''
  passwordError.value = ''
  selectedLayoutDefault.value = null
  
  // Open the layout editor dialog
  showLayoutEditorDialog.value = true
}



// Backup User Functions
const backupUser = async (userId) => {
  if (!userId) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No user ID provided',
      life: 3000
    })
    return
  }

  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    const res = await fetch(`/api/users/backup/${userId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to backup user')
    }

    const result = await res.json()

    toast.add({
      severity: 'success',
      summary: 'Backup Completed',
      detail: `Successfully backed up user: ${result.summary.user_email}`,
      life: 5000
    })

  } catch (error) {
    console.error('Backup error:', error)
    toast.add({
      severity: 'error',
      summary: 'Backup Failed',
      detail: error.message || 'Failed to backup user',
      life: 5000
    })
  }
}



// Load backups
const loadBackups = async () => {
  loadingBackups.value = true
  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    
    const res = await fetch(`/api/users/backups?page=${backupPage.value}&rows=${backupRows.value}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    if (!res.ok) {
      throw new Error('Failed to load backups')
    }
    
    const result = await res.json()
    backups.value = result.data
    totalBackups.value = result.totalCount
  } catch (error) {
    console.error('Error loading backups:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load backups',
      life: 3000
    })
  } finally {
    loadingBackups.value = false
  }
}

const onBackupPage = async (event) => {
  backupPage.value = event.page + 1 // PrimeVue pages are 0-based
  backupRows.value = event.rows
  await loadBackups()
}

const closeViewBackupsModal = () => {
  showViewBackupsModal.value = false
  backups.value = []
  totalBackups.value = 0
}

const viewBackupDetails = (backup) => {
  // TODO: Implement backup details view
  console.log('View backup details:', backup)
  toast.add({
    severity: 'info',
    summary: 'Not Implemented',
    detail: 'Backup details view will be implemented soon',
    life: 3000
  })
}

const downloadBackup = (backup) => {
  // TODO: Implement backup download
  console.log('Download backup:', backup)
  toast.add({
    severity: 'info',
    summary: 'Not Implemented',
    detail: 'Backup download will be implemented soon',
    life: 3000
  })
}

const confirmDeleteBackup = (backup) => {
  backupToDelete.value = backup
  showDeleteBackupConfirmDialog.value = true
}

const deleteBackup = async () => {
  if (!backupToDelete.value) return

  deletingBackup.value = true
  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    const res = await fetch(`/api/users/backups/${backupToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to delete backup')
    }

    const result = await res.json()

    toast.add({
      severity: 'success',
      summary: 'Backup Deleted',
      detail: `Successfully deleted backup for user: ${backupToDelete.value.summary?.user_email}`,
      life: 5000
    })

    // Refresh the backups list
    await loadBackups()

  } catch (error) {
    console.error('Delete backup error:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: error.message || 'Failed to delete backup',
      life: 5000
    })
  } finally {
    deletingBackup.value = false
    showDeleteBackupConfirmDialog.value = false
    backupToDelete.value = null
  }
}

const cancelDeleteBackup = () => {
  showDeleteBackupConfirmDialog.value = false
  backupToDelete.value = null
}

// Restore backup functions
const confirmRestoreBackup = async (backup) => {
  backupToRestore.value = backup
  
  // Check if user already exists by both email and user ID
  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    console.log('Backup data for user detection:', {
      summary: backup.summary,
      backup_data: backup.backup_data,
      metadata: backup.backup_data?.metadata,
      fullBackup: backup
    })

    // The backup data structure seems to be different than expected
    // Let's check if the user ID is in the summary or directly in the backup object
    const userEmail = backup.summary?.user_email
    const userId = backup.user_id || backup.target_user_id || backup.summary?.user_id

    console.log('Checking for user:', { userEmail, userId })

    // Check by email
    const emailRes = await fetch(`/api/users/search?email=${encodeURIComponent(userEmail)}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    // Check by user ID (only if we have a valid user ID)
    let userIdRes = null
    if (userId) {
      userIdRes = await fetch(`/api/users/${userId}/info`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
    }

    console.log('API responses:', {
      emailResStatus: emailRes.status,
      userIdResStatus: userIdRes ? userIdRes.status : 'No user ID available'
    })

    // User exists if either email or user ID check returns a result
    let emailExists = false
    let userIdExists = false

    if (emailRes.ok) {
      const emailUsers = await emailRes.json()
      emailExists = emailUsers && emailUsers.length > 0
      console.log('Email check result:', { emailUsers, emailExists })
    }

    if (userIdRes && userIdRes.ok) {
      const userData = await userIdRes.json()
      userIdExists = !!userData
      console.log('User ID check result:', { userData, userIdExists })
    } else {
      console.log('User ID check skipped - no valid user ID available')
    }
    
    userExists.value = emailExists || userIdExists
    
    console.log(`Final user existence check:`, {
      userEmail,
      userId,
      emailExists,
      userIdExists,
      userExists: userExists.value
    })
  } catch (error) {
    console.error('Error checking if user exists:', error)
    userExists.value = false
  }
  
  showRestoreBackupConfirmDialog.value = true
}

const restoreBackup = async () => {
  if (!backupToRestore.value) return

  restoringBackup.value = true
  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    const res = await fetch(`/api/users/backup-restore`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        backupId: backupToRestore.value.id,
        overwrite: userExists.value
      })
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to restore backup')
    }

    const result = await res.json()

    toast.add({
      severity: 'success',
      summary: 'Backup Restored',
      detail: `Successfully restored backup for user: ${backupToRestore.value.summary?.user_email}`,
      life: 5000
    })

  } catch (error) {
    console.error('Restore backup error:', error)
    toast.add({
      severity: 'error',
      summary: 'Restore Failed',
      detail: error.message || 'Failed to restore backup',
      life: 5000
    })
  } finally {
    restoringBackup.value = false
    showRestoreBackupConfirmDialog.value = false
    backupToRestore.value = null
    userExists.value = false
  }
}

const cancelRestoreBackup = () => {
  showRestoreBackupConfirmDialog.value = false
  backupToRestore.value = null
  userExists.value = false
}

// Delete User Functions
const confirmDeleteUser = (user) => {
  userToDelete.value = user
  showDeleteUserConfirmDialog.value = true
}

const cancelDeleteUser = () => {
  showDeleteUserConfirmDialog.value = false
  userToDelete.value = null
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  deletingUser.value = true
  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    const res = await fetch(`/api/users/delete/${userToDelete.value.user_id}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to delete user')
    }

    const result = await res.json()

    toast.add({
      severity: 'success',
      summary: 'User Permanently Deleted',
      detail: `Successfully permanently deleted user: ${userToDelete.value.email}. Backup created: ${result.backup_id}`,
      life: 5000
    })

    // Close dialog and reset
    showDeleteUserConfirmDialog.value = false
    userToDelete.value = null

    // Reload users list
    await loadUsers()
    
    // Refresh trash dialog if it's open
    if (showTrashDialog.value) {
      await loadDeletedUsers()
    }

  } catch (error) {
    console.error('Delete user error:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: error.message || 'Failed to delete user',
      life: 5000
    })
  } finally {
    deletingUser.value = false
  }
}
</script>

<style scoped>
.layout-editor-dialog {
  z-index: 9999 !important;
}

.layout-editor-dialog :deep(.p-dialog) {
  z-index: 9999 !important;
}

.layout-editor-dialog :deep(.p-dialog-mask) {
  z-index: 9998 !important;
}
</style> 