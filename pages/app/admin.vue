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
                  <Button
                    icon="pi pi-trash"
                    label="Trash"
                    @click="openMemoryBooksTrash"
                    class="bg-brand-accent hover:bg-brand-accent/80 text-white border-0 px-3 py-2"
                    title="View trashed memory books"
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
                <Column field="ai_supplemental_prompt" header="Supplemental Prompt" sortable style="min-width: 200px; max-width: 400px;">
                  <template #body="{ data }">
                    <div class="truncate" :title="data.ai_supplemental_prompt">
                      {{ data.ai_supplemental_prompt || 'No prompt' }}
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
                      <Button
                        icon="pi pi-trash"
                        class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-2 py-1 text-xs"
                        @click="confirmDeleteBook(data)"
                        title="Trash"
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
              class="bg-brand-dialog-edit border-0 w-auto rounded px-6 py-2 shadow"
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

        <!-- System Utilities Tab -->
        <TabPanel header="🔧 System Utilities">
          <div class="space-y-6">
            <!-- Thumbnail Backfill Utility -->
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-brand-primary mb-2">Thumbnail Backfill</h3>
                  <p class="text-sm text-brand-primary/70">
                    Generate thumbnails for photos that don't have them yet. Thumbnails improve UI performance by loading 400px WebP images (~30KB) instead of full-resolution photos (2MB+).
                  </p>
                </div>
              </div>

              <!-- Stats Display -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-brand-navigation/10 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-brand-primary">{{ thumbnailStats.totalPhotos }}</div>
                  <div class="text-sm text-brand-primary/70">Total Photos</div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">{{ thumbnailStats.withThumbnails }}</div>
                  <div class="text-sm text-gray-600">With Thumbnails</div>
                </div>
                <div class="bg-orange-50 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-orange-600">{{ thumbnailStats.withoutThumbnails }}</div>
                  <div class="text-sm text-gray-600">Missing Thumbnails</div>
                </div>
              </div>

              <!-- Control Panel -->
              <div class="flex flex-wrap items-center gap-3 mb-4">
                <Button
                  label="Check Status"
                  icon="pi pi-refresh"
                  @click="loadThumbnailStats"
                  :loading="loadingThumbnailStats"
                  :disabled="backfillRunning"
                  class="bg-brand-dialog-edit border-0 w-auto rounded px-6 py-2 shadow"
                />
                <Button
                  v-if="!backfillRunning"
                  label="Generate"
                  icon="pi pi-image"
                  @click="startThumbnailBackfill"
                  :disabled="thumbnailStats.withoutThumbnails === 0"
                  class="bg-brand-dialog-edit border-0 w-auto rounded px-6 py-2 shadow"
                />
                <Button
                  v-else
                  :label="backfillStopping ? 'Stopping...' : 'Stop'"
                  icon="pi pi-times"
                  @click="stopThumbnailBackfill"
                  :disabled="backfillStopping"
                  class="bg-red-600 hover:bg-red-700 text-white border-0 w-auto rounded px-6 py-2 shadow"
                />
                <div class="flex items-center gap-2">
                  <label for="backfillBatchSize" class="text-sm text-brand-primary/70 whitespace-nowrap">Batch size:</label>
                  <InputNumber
                    id="backfillBatchSize"
                    v-model="backfillBatchSize"
                    :min="1"
                    :max="50"
                    :step="5"
                    showButtons
                    buttonLayout="horizontal"
                    style="width: 120px"
                    :disabled="backfillRunning"
                  />
                </div>
              </div>

              <!-- Progress Display -->
              <div v-if="backfillProgress.show" class="mt-4 p-4 bg-brand-navigation/10 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-brand-primary">Processing Thumbnails...</span>
                  <span class="text-sm text-brand-primary/70">{{ backfillProgress.processed }} / {{ backfillProgress.total }}</span>
                </div>
                <ProgressBar :value="backfillProgress.percentage" class="mb-2" />
                <div class="text-xs text-brand-primary/70 mb-2">
                  ✅ {{ backfillProgress.succeeded }} succeeded &nbsp;|&nbsp;
                  ❌ {{ backfillProgress.failed }} failed &nbsp;|&nbsp;
                  ⏭️ {{ backfillProgress.skipped }} skipped
                </div>
                <div v-if="backfillRunning && backfillProgress.currentPhoto > 0 && backfillProgress.currentPhoto <= backfillProgress.total" class="text-xs text-brand-primary/60 mb-2 flex items-center gap-2">
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>Processing batch starting at photo {{ backfillProgress.currentPhoto }}...</span>
                </div>
                <div v-if="backfillProgress.message" class="text-sm text-brand-primary">
                  {{ backfillProgress.message }}
                </div>
              </div>

              <!-- Info Box -->
              <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-white border border-brand-info-outline flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="pi pi-info-circle text-brand-info-letter font-bold text-sm"></i>
                  </div>
                  <div class="text-sm text-blue-900">
                    <strong>How it works:</strong> This utility generates 400px wide WebP thumbnails for photos that don't have them.
                    Full-resolution images are preserved for PDF generation. The process is safe and can be run multiple times.
                    <br><br>
                    <strong>Performance impact:</strong> Thumbnails reduce page load times by ~67x (30KB vs 2MB per photo).
                  </div>
                </div>
              </div>
            </div>

            <!-- Rekognition Collections Backfill Utility -->
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-brand-primary mb-2">Face Recognition Backfill</h3>
                  <p class="text-sm text-brand-primary/70">
                    Reindex all photos with AWS Rekognition Collections for face detection and automatic matching. 
                    This is a one-time migration to populate face data for existing photos.
                  </p>
                </div>
              </div>

              <!-- Stats Display -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-brand-navigation/10 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-brand-primary">{{ rekognitionStats.totalUsers }}</div>
                  <div class="text-sm text-brand-primary/70">Total Users</div>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600">{{ rekognitionStats.totalAssets }}</div>
                  <div class="text-sm text-gray-600">Total Photos</div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">{{ rekognitionStats.processed }}</div>
                  <div class="text-sm text-gray-600">Processed</div>
                </div>
                <div class="bg-orange-50 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-orange-600">{{ rekognitionStats.pending }}</div>
                  <div class="text-sm text-gray-600">Pending</div>
                </div>
              </div>

              <!-- Control Panel -->
              <div class="flex flex-wrap items-center gap-3 mb-4">
                <Button
                  label="Check Status"
                  icon="pi pi-refresh"
                  @click="loadRekognitionStats"
                  :loading="loadingRekognitionStats"
                  :disabled="rekognitionBackfillRunning"
                  class="bg-brand-dialog-edit border-0 w-auto rounded px-6 py-2 shadow"
                />
                <Button
                  v-if="!rekognitionBackfillRunning"
                  label="Preview (Dry Run)"
                  icon="pi pi-eye"
                  @click="startRekognitionBackfill(true)"
                  :disabled="rekognitionStats.pending === 0"
                  class="bg-blue-600 hover:bg-blue-700 text-white border-0 w-auto rounded px-6 py-2 shadow"
                />
                <Button
                  v-if="!rekognitionBackfillRunning"
                  label="Start Backfill"
                  icon="pi pi-sync"
                  @click="confirmRekognitionBackfill"
                  :disabled="rekognitionStats.pending === 0"
                  class="bg-brand-dialog-edit border-0 w-auto rounded px-6 py-2 shadow"
                />
                <Button
                  v-else
                  :label="rekognitionBackfillStopping ? 'Stopping...' : 'Stop'"
                  icon="pi pi-times"
                  @click="stopRekognitionBackfill"
                  :disabled="rekognitionBackfillStopping"
                  class="bg-red-600 hover:bg-red-700 text-white border-0 w-auto rounded px-6 py-2 shadow"
                />
              </div>

              <!-- Progress Display -->
              <div v-if="rekognitionProgress.show" class="mt-4 p-4 bg-brand-navigation/10 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-brand-primary">
                    {{ rekognitionProgress.isDryRun ? 'Preview Mode (No Changes)' : 'Processing Face Recognition...' }}
                  </span>
                  <span class="text-sm text-brand-primary/70">
                    {{ rekognitionProgress.processed }} / {{ rekognitionProgress.total }}
                  </span>
                </div>
                <ProgressBar :value="rekognitionProgress.percentage" class="mb-2" />
                <div class="text-xs text-brand-primary/70 mb-2">
                  ✅ {{ rekognitionProgress.successful }} successful &nbsp;|&nbsp;
                  ❌ {{ rekognitionProgress.failed }} failed &nbsp;|&nbsp;
                  👥 {{ rekognitionProgress.facesDetected }} faces detected &nbsp;|&nbsp;
                  🤖 {{ rekognitionProgress.autoAssigned }} auto-assigned
                </div>
                <div v-if="rekognitionBackfillRunning" class="text-xs text-brand-primary/60 mb-2 flex items-center gap-2">
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>{{ rekognitionProgress.currentAsset || 'Processing...' }}</span>
                </div>
                <div v-if="rekognitionProgress.message" class="text-sm text-brand-primary">
                  {{ rekognitionProgress.message }}
                </div>
              </div>

              <!-- Cost Estimate -->
              <div v-if="rekognitionStats.pending > 0" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-white border border-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="pi pi-dollar text-yellow-600 font-bold text-sm"></i>
                  </div>
                  <div class="text-sm text-yellow-900">
                    <strong>Estimated AWS Cost:</strong> ~${{ estimatedRekognitionCost.toFixed(2) }}
                    <br>
                    <span class="text-xs">
                      ({{ rekognitionStats.pending }} photos × $0.001 IndexFaces + ~{{ rekognitionStats.pending * 2 }} faces × $0.001 SearchFaces)
                    </span>
                  </div>
                </div>
              </div>

              <!-- Info Box -->
              <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-white border border-brand-info-outline flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="pi pi-info-circle text-brand-info-letter font-bold text-sm"></i>
                  </div>
                  <div class="text-sm text-blue-900">
                    <strong>How it works:</strong> This utility indexes all photos using AWS Rekognition Collections (IndexFaces + SearchFaces).
                    Faces with ≥95% similarity are auto-assigned. Faces with 80-94% similarity or no matches are flagged for user review.
                    <br><br>
                    <strong>One-time cost:</strong> AWS charges $0.001 per IndexFaces call and $0.001 per SearchFaces call.
                    After backfill, only new uploads incur costs. This process is safe and idempotent (can be run multiple times).
                    <br><br>
                    <strong>Preview mode:</strong> Use "Preview (Dry Run)" to see what would be processed without making changes or incurring AWS costs.
                  </div>
                </div>
              </div>

              <!-- Documentation Link -->
              <div class="mt-4">
                <a 
                  href="https://github.com/yourusername/savta-ai/blob/main/docs/BACKFILL_REKOGNITION_COLLECTIONS.md" 
                  target="_blank"
                  class="text-sm text-brand-secondary hover:underline inline-flex items-center gap-1"
                >
                  <i class="pi pi-external-link text-xs"></i>
                  View full documentation
                </a>
              </div>
            </div>
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
                <div class="w-5 h-5 rounded-full bg-white border border-brand-info-outline flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i class="pi pi-info-circle text-brand-info-letter font-bold" style="font-size: 0.7rem;" title="Ask Savta"></i>
                </div>
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
        <div class="flex flex-col sm:flex-row justify-end gap-2">
          <Button
            label="CANCEL"
            icon="pi pi-times"
            @click="cancelDeleteUser"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-white border-0 w-full sm:w-auto px-3 py-2 text-sm font-medium tracking-wider rounded shadow-elevation-2 hover:shadow-elevation-3"
            :disabled="deletingUser"
          />
          <Button
            label="PERMANENTLY DELETE USER"
            icon="pi pi-times"
            @click="deleteUser"
            class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 w-full sm:w-auto px-3 py-2 text-sm font-medium tracking-wider rounded shadow-elevation-2 hover:shadow-elevation-3"
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
                  <div v-if="backupToRestore.original_uuid" class="mt-2 p-2 bg-brand-surface-50 rounded border border-brand-surface-200">
                    <div class="text-xs font-semibold text-brand-primary mb-1">Original User ID:</div>
                    <div class="text-xs font-mono text-brand-primary/70 break-all">
                      {{ backupToRestore.original_uuid }}
                    </div>
                  </div>
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
                  <div v-if="backupToRestore.original_uuid" class="mt-2 p-2 bg-brand-surface-50 rounded border border-brand-surface-200">
                    <div class="text-xs font-semibold text-brand-primary mb-1">Original User ID:</div>
                    <div class="text-xs font-mono text-brand-primary/70 break-all">
                      {{ backupToRestore.original_uuid }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p class="text-sm text-brand-primary/70">
              This will restore all user data including profile, assets, memory books, and storage files.
            </p>
            
            <div v-if="backupToRestore.original_uuid" class="mt-3 p-3 bg-brand-surface-50 rounded-lg border border-brand-surface-200">
              <div class="text-sm font-semibold text-brand-primary mb-2">Restoration Details:</div>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-brand-primary/70">Original User ID:</span>
                  <span class="font-mono text-brand-primary">{{ backupToRestore.original_uuid }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-brand-primary/70">Original Email:</span>
                  <span class="text-brand-primary">{{ backupToRestore.original_email || backupToRestore.summary?.user_email }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-brand-primary/70">Backup Created:</span>
                  <span class="text-brand-primary">{{ formatDate(backupToRestore.created_at) }}</span>
                </div>
              </div>
            </div>
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

    <!-- Backup Details Dialog -->
    <Dialog
      v-model:visible="showBackupDetailsDialog"
      modal
      header="Backup Details"
      :style="{ width: '90vw', maxWidth: '1200px', height: '90vh' }"
      :maximizable="true"
      :resizable="true"
    >
      <div v-if="selectedBackupForDetails" class="h-full flex flex-col space-y-4">
        <!-- Basic Information -->
        <div class="bg-brand-surface-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-brand-primary mb-3">Basic Information</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="font-medium">Backup ID:</span> <span class="font-mono">{{ selectedBackupForDetails.id }}</span></div>
            <div><span class="font-medium">Status:</span> <Tag :value="selectedBackupForDetails.status" :severity="selectedBackupForDetails.status === 'completed' ? 'success' : 'warning'" /></div>
            <div><span class="font-medium">Created At:</span> {{ formatDate(selectedBackupForDetails.created_at) }}</div>
            <div><span class="font-medium">Updated At:</span> {{ formatDate(selectedBackupForDetails.updated_at) }}</div>
            <div><span class="font-medium">Original UUID:</span> <span class="font-mono">{{ selectedBackupForDetails.original_uuid || 'Not set' }}</span></div>
            <div><span class="font-medium">Original Email:</span> {{ selectedBackupForDetails.original_email || 'Not set' }}</div>
          </div>
        </div>

        <!-- User Information -->
        <div class="bg-brand-surface-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-brand-primary mb-3">User Information</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="font-medium">Target User ID:</span> <span class="font-mono">{{ selectedBackupForDetails.user_id || 'Not set' }}</span></div>
            <div><span class="font-medium">Target User Email:</span> {{ selectedBackupForDetails.target_user?.email || selectedBackupForDetails.summary?.user_email || 'Unknown' }}</div>
            <div><span class="font-medium">Created By:</span> {{ selectedBackupForDetails.created_by_user?.email || 'Unknown' }}</div>
            <div><span class="font-medium">Created By ID:</span> <span class="font-mono">{{ selectedBackupForDetails.created_by || 'Unknown' }}</span></div>
          </div>
        </div>

        <!-- Backup Summary -->
        <div class="bg-brand-surface-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-brand-primary mb-3">Backup Summary</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="font-medium">Total Records:</span> {{ selectedBackupForDetails.summary?.total_records || 0 }}</div>
            <div><span class="font-medium">Total Files:</span> {{ selectedBackupForDetails.summary?.total_files || 0 }}</div>
            <div><span class="font-medium">Backup Size:</span> {{ Math.round((selectedBackupForDetails.summary?.backup_size_estimate || 0) / 1024) }} KB</div>
            <div><span class="font-medium">User Email:</span> {{ selectedBackupForDetails.summary?.user_email || 'Unknown' }}</div>
          </div>
        </div>

        <!-- Backup Metadata -->
        <div class="bg-brand-surface-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-brand-primary mb-3">Backup Metadata</h3>
          <div class="bg-brand-surface-100 p-3 rounded border">
            <pre class="text-xs text-brand-primary/70 overflow-auto max-h-40">{{ JSON.stringify(selectedBackupForDetails.backup_data?.metadata || {}, null, 2) }}</pre>
          </div>
        </div>

        <!-- Backup Data Structure -->
        <div class="bg-brand-surface-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-brand-primary mb-3">Backup Data Structure</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="font-medium">User Profile:</span> {{ selectedBackupForDetails.backup_data?.user_profile ? 'Present' : 'Missing' }}</div>
            <div><span class="font-medium">Auth User:</span> {{ selectedBackupForDetails.backup_data?.auth_user ? 'Present' : 'Missing' }}</div>
            <div><span class="font-medium">Families:</span> {{ selectedBackupForDetails.backup_data?.families?.length || 0 }} records</div>
            <div><span class="font-medium">Assets:</span> {{ selectedBackupForDetails.backup_data?.assets?.length || 0 }} records</div>
            <div><span class="font-medium">Memory Books:</span> {{ selectedBackupForDetails.backup_data?.memory_books?.length || 0 }} records</div>
            <div><span class="font-medium">PDF Status:</span> {{ selectedBackupForDetails.backup_data?.pdf_status?.length || 0 }} records</div>
            <div><span class="font-medium">Activity Logs:</span> {{ selectedBackupForDetails.backup_data?.activity_logs?.length || 0 }} records</div>
            <div><span class="font-medium">Email Events:</span> {{ selectedBackupForDetails.backup_data?.email_events?.length || 0 }} records</div>
            <div><span class="font-medium">Storage Files:</span> {{ selectedBackupForDetails.backup_data?.storage_files?.length || 0 }} files</div>
          </div>
        </div>

        <!-- Full Backup Data (Collapsible) -->
        <div class="bg-brand-surface-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-brand-primary mb-3">Full Backup Data (JSON)</h3>
          <div class="bg-brand-surface-100 p-3 rounded border">
            <pre class="text-xs text-brand-primary/70 overflow-auto max-h-96">{{ JSON.stringify(selectedBackupForDetails.backup_data || {}, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <Button
            label="Close"
            icon="pi pi-times"
            @click="closeBackupDetailsDialog"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-4 py-2"
          />
        </div>
      </template>
    </Dialog>

    <!-- Backup Progress Dialog -->
    <Dialog
      v-model:visible="showBackupProgressDialog"
      modal
      header="Backup Progress"
      :style="{ width: '500px' }"
      :closable="false"
      :closeOnEscape="false"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-brand-primary-100 flex items-center justify-center">
              <i class="pi pi-download text-brand-primary text-xl"></i>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-brand-primary">Creating User Backup</h3>
            <p class="text-sm text-brand-primary/70">{{ backupProgress.userEmail }}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-brand-primary/70">Progress</span>
            <span class="text-brand-primary font-medium">{{ backupProgress.currentStepNumber }} / {{ backupProgress.totalSteps }}</span>
          </div>
          <div class="w-full bg-brand-surface-100 rounded-full h-2">
            <div 
              class="bg-brand-primary h-2 rounded-full transition-all duration-300 ease-out"
              :style="{ width: `${(backupProgress.currentStepNumber / backupProgress.totalSteps) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Current Step -->
        <div class="bg-brand-surface-50 p-3 rounded-lg">
          <div class="flex items-center gap-2">
            <i 
              :class="[
                backupProgress.isRunning ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle',
                backupProgress.isRunning ? 'text-brand-primary' : 'text-brand-success'
              ]"
            ></i>
            <span class="text-sm text-brand-primary">{{ backupProgress.currentStep }}</span>
          </div>
        </div>

        <!-- Progress Steps -->
        <div class="space-y-2">
          <div class="text-xs font-medium text-brand-primary/70 mb-2">Backup Steps:</div>
          <div class="space-y-1 text-xs">
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-brand-success" v-if="backupProgress.currentStepNumber >= 1"></i>
              <i class="pi pi-circle text-brand-primary/30" v-else></i>
              <span :class="backupProgress.currentStepNumber >= 1 ? 'text-brand-primary' : 'text-brand-primary/50'">Initialize backup process</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-brand-success" v-if="backupProgress.currentStepNumber >= 2"></i>
              <i class="pi pi-circle text-brand-primary/30" v-else></i>
              <span :class="backupProgress.currentStepNumber >= 2 ? 'text-brand-primary' : 'text-brand-primary/50'">Fetch user profile</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-brand-success" v-if="backupProgress.currentStepNumber >= 3"></i>
              <i class="pi pi-circle text-brand-primary/30" v-else></i>
              <span :class="backupProgress.currentStepNumber >= 3 ? 'text-brand-primary' : 'text-brand-primary/50'">Collect user data</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-brand-success" v-if="backupProgress.currentStepNumber >= 4"></i>
              <i class="pi pi-circle text-brand-primary/30" v-else></i>
              <span :class="backupProgress.currentStepNumber >= 4 ? 'text-brand-primary' : 'text-brand-primary/50'">Backup storage files</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-brand-success" v-if="backupProgress.currentStepNumber >= 5"></i>
              <i class="pi pi-circle text-brand-primary/30" v-else></i>
              <span :class="backupProgress.currentStepNumber >= 5 ? 'text-brand-primary' : 'text-brand-primary/50'">Create backup record</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-brand-success" v-if="backupProgress.currentStepNumber >= 6"></i>
              <i class="pi pi-circle text-brand-primary/30" v-else></i>
              <span :class="backupProgress.currentStepNumber >= 6 ? 'text-brand-primary' : 'text-brand-primary/50'">Validate backup data</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-brand-success" v-if="backupProgress.currentStepNumber >= 7"></i>
              <i class="pi pi-circle text-brand-primary/30" v-else></i>
              <span :class="backupProgress.currentStepNumber >= 7 ? 'text-brand-primary' : 'text-brand-primary/50'">Finalize backup</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-brand-success" v-if="backupProgress.currentStepNumber >= 8"></i>
              <i class="pi pi-circle text-brand-primary/30" v-else></i>
              <span :class="backupProgress.currentStepNumber >= 8 ? 'text-brand-primary' : 'text-brand-primary/50'">Backup completed</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <Button
            v-if="!backupProgress.isRunning"
            label="Close"
            icon="pi pi-times"
            @click="closeBackupProgressDialog"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-4 py-2"
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

    <!-- Delete Memory Book Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteBookConfirmDialog"
      modal
      header="Trash Memory Book"
      :style="{ width: '30rem' }"
      class="rounded-lg shadow-2xl"
    >
      <div class="py-4">
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p class="text-sm text-yellow-700">
            Are you sure you want to move the memory book <strong>"{{ bookToDelete?.ai_supplemental_prompt || 'No prompt' }}"</strong> to trash?
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            @click="cancelDeleteBook"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
          />
          <Button
            label="Trash"
            class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-3 py-1 text-xs"
            @click="deleteBookConfirmed"
            :loading="deletingBook"
          />
        </div>
      </template>
    </Dialog>

    <!-- Memory Books Trash Dialog -->
    <Dialog
      v-model:visible="showMemoryBooksTrashDialog"
      modal
      header="Memory Books Trash"
      :style="{ width: '90vw', maxWidth: '1200px' }"
      class="rounded-lg shadow-2xl"
    >
      <div v-if="selectedUser" class="mb-4 p-3 bg-brand-surface-100 rounded-lg">
        <div class="font-semibold text-brand-primary">
          Trashed Memory Books for: <span class="text-brand-secondary">{{ selectedUser.email }}</span>
        </div>
        <div class="text-sm text-brand-primary/70 mt-1">
          {{ deletedMemoryBooks.length }} book{{ deletedMemoryBooks.length !== 1 ? 's' : '' }} in trash
        </div>
      </div>

      <div v-if="loadingDeletedBooks" class="flex justify-center items-center py-12">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-3xl mb-4 text-brand-highlight"></i>
          <p class="text-base text-brand-text-muted">Loading trashed memory books...</p>
        </div>
      </div>

      <div v-else-if="deletedMemoryBooks.length > 0">
        <DataTable
          :value="deletedMemoryBooks"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          class="p-datatable-sm text-sm"
        >
          <Column field="ai_supplemental_prompt" header="Supplemental Prompt" sortable style="min-width: 200px; max-width: 400px;">
            <template #body="{ data }">
              <div class="truncate" :title="data.ai_supplemental_prompt">
                {{ data.ai_supplemental_prompt || 'No prompt' }}
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

          <Column field="deleted_at" header="Deleted" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70">{{ formatDate(data.deleted_at) }}</span>
            </template>
          </Column>

          <Column header="Actions">
            <template #body="{ data }">
              <div class="flex items-center space-x-2">
                <Button
                  icon="pi pi-eye"
                  class="bg-brand-dialog-secondary hover:bg-brand-dialog-secondary-hover text-brand-primary border-0 px-2 py-1 text-xs"
                  @click="viewBook(data)"
                  title="View Details"
                />
                <Button
                  icon="pi pi-trash"
                  label="Delete"
                  class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-2 py-1 text-xs"
                  @click="confirmPermanentDeleteBook(data)"
                  title="Permanently Delete"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <div v-else class="text-center py-12">
        <i class="pi pi-trash text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-lg font-semibold text-brand-primary/70 mb-2">Trash is Empty</h3>
        <p class="text-sm text-brand-primary/50">No deleted memory books found for this user.</p>
      </div>

      <template #footer>
        <div class="flex justify-between items-center gap-3">
          <Button
            v-if="deletedMemoryBooks.length > 0"
            label="Empty Trash"
            icon="pi pi-trash"
            @click="confirmEmptyTrash"
            class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-4 py-2 rounded-lg transition-colors duration-200"
            title="Permanently delete all trashed books for this user"
          />
          <div class="flex gap-2 ml-auto">
            <Button
              label="Refresh"
              icon="pi pi-refresh"
              @click="loadDeletedMemoryBooks(selectedUser.user_id)"
              class="bg-blue-500 hover:bg-blue-600 text-white border-0 px-4 py-2 rounded-lg transition-colors duration-200"
            />
            <Button
              label="Close"
              icon="pi pi-times"
              @click="showMemoryBooksTrashDialog = false"
              class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-4 py-2 rounded-lg transition-colors duration-200"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Permanent Delete Memory Book Confirmation Dialog -->
    <Dialog
      v-model:visible="showPermanentDeleteBookConfirmDialog"
      modal
      header="Permanently Delete Memory Book"
      :style="{ width: '30rem' }"
      class="rounded-lg shadow-2xl"
    >
      <div class="py-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p class="text-sm text-red-700 mb-2">
            <strong>⚠️ WARNING:</strong> This action cannot be undone!
          </p>
          <p class="text-sm text-red-700">
            Are you sure you want to <strong>permanently delete</strong> the memory book 
            <strong>"{{ bookToPermanentDelete?.ai_supplemental_prompt || 'No prompt' }}"</strong>?
          </p>
        </div>
        <p class="text-xs text-brand-primary/70">
          This will remove the book from the database completely.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            @click="cancelPermanentDeleteBook"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
          />
          <Button
            label="Permanently Delete"
            class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-3 py-1 text-xs"
            @click="permanentDeleteBookConfirmed"
            :loading="deletingBookPermanently"
          />
        </div>
      </template>
    </Dialog>

    <!-- Empty Trash Confirmation Dialog -->
    <Dialog
      v-model:visible="showEmptyTrashConfirmDialog"
      modal
      header="Empty Memory Books Trash"
      :style="{ width: '30rem' }"
      class="rounded-lg shadow-2xl"
    >
      <div class="py-4">
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p class="text-sm text-red-700 mb-2">
            <strong>⚠️ WARNING:</strong> This action cannot be undone!
          </p>
          <p class="text-sm text-red-700">
            Are you sure you want to <strong>permanently delete ALL {{ deletedMemoryBooks.length }}</strong> trashed memory books 
            for user <strong>{{ selectedUser?.email }}</strong>?
          </p>
        </div>
        <p class="text-xs text-brand-primary/70">
          This will remove all trashed books from the database completely.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            @click="cancelEmptyTrash"
            class="bg-brand-dialog-cancel hover:bg-brand-dialog-cancel-hover text-brand-primary border-0 px-3 py-1 text-xs"
          />
          <Button
            label="Empty Trash"
            class="bg-brand-dialog-delete hover:bg-brand-dialog-delete-hover text-white border-0 px-3 py-1 text-xs"
            @click="emptyTrashConfirmed"
            :loading="emptyingTrash"
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
const showBackupDetailsDialog = ref(false)
const selectedBackupForDetails = ref(null)
const showBackupProgressDialog = ref(false)
const backupProgress = ref({
  isRunning: false,
  currentStep: '',
  totalSteps: 0,
  currentStepNumber: 0,
  userEmail: '',
  userId: ''
})

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

// Delete memory book variables
const showDeleteBookConfirmDialog = ref(false)
const bookToDelete = ref(null)
const deletingBook = ref(false)

// Memory books trash variables
const showMemoryBooksTrashDialog = ref(false)
const deletedMemoryBooks = ref([])
const loadingDeletedBooks = ref(false)
const showPermanentDeleteBookConfirmDialog = ref(false)
const bookToPermanentDelete = ref(null)
const deletingBookPermanently = ref(false)
const showEmptyTrashConfirmDialog = ref(false)
const emptyingTrash = ref(false)

// Thumbnail backfill variables
const thumbnailStats = ref({
  totalPhotos: 0,
  withThumbnails: 0,
  withoutThumbnails: 0
})
const loadingThumbnailStats = ref(false)
const backfillRunning = ref(false)
const backfillStopping = ref(false)
const backfillBatchSize = ref(20)
const backfillProgress = ref({
  show: false,
  processed: 0,
  total: 0,
  succeeded: 0,
  failed: 0,
  skipped: 0,
  percentage: 0,
  message: '',
  currentPhoto: 0
})

// Rekognition Collections backfill variables
const rekognitionStats = ref({
  totalUsers: 0,
  totalAssets: 0,
  processed: 0,
  pending: 0
})
const loadingRekognitionStats = ref(false)
const rekognitionBackfillRunning = ref(false)
const rekognitionBackfillStopping = ref(false)
const rekognitionProgress = ref({
  show: false,
  processed: 0,
  total: 0,
  successful: 0,
  failed: 0,
  facesDetected: 0,
  autoAssigned: 0,
  percentage: 0,
  message: '',
  currentAsset: '',
  isDryRun: false
})

const estimatedRekognitionCost = computed(() => {
  // IndexFaces: $0.001 per photo
  // SearchFaces: ~$0.001 per face (avg 2 faces per photo)
  const indexCost = rekognitionStats.value.pending * 0.001
  const searchCost = rekognitionStats.value.pending * 2 * 0.001
  return indexCost + searchCost
})

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

  // Get user email for display
  let userEmail = 'Unknown'
  try {
    const user = users.value.find(u => u.user_id === userId)
    userEmail = user?.email || 'Unknown'
  } catch (e) {
    console.log('Could not find user email, using default')
  }

  // Initialize progress
  backupProgress.value = {
    isRunning: true,
    currentStep: 'Initializing backup...',
    totalSteps: 8,
    currentStepNumber: 0,
    userEmail: userEmail,
    userId: userId
  }
  showBackupProgressDialog.value = true

  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    // Update progress - Starting backup
    backupProgress.value.currentStep = 'Starting backup process...'
    backupProgress.value.currentStepNumber = 1

    const res = await fetch(`/api/users/backup/${userId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Failed to backup user')
    }

    const result = await res.json()

    // Update progress - Completed
    backupProgress.value.currentStep = 'Backup completed successfully!'
    backupProgress.value.currentStepNumber = backupProgress.value.totalSteps

    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Backup Completed',
      detail: `Successfully backed up user: ${result.summary.user_email}`,
      life: 5000
    })

    // Close progress dialog after a short delay
    setTimeout(() => {
      showBackupProgressDialog.value = false
      backupProgress.value.isRunning = false
    }, 1500)

  } catch (error) {
    console.error('Backup error:', error)
    
    // Update progress - Error
    backupProgress.value.currentStep = 'Backup failed!'
    
    toast.add({
      severity: 'error',
      summary: 'Backup Failed',
      detail: error.message || 'Failed to backup user',
      life: 5000
    })

    // Close progress dialog after a short delay
    setTimeout(() => {
      showBackupProgressDialog.value = false
      backupProgress.value.isRunning = false
    }, 2000)
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
  selectedBackupForDetails.value = backup
  showBackupDetailsDialog.value = true
}

const closeBackupDetailsDialog = () => {
  showBackupDetailsDialog.value = false
  selectedBackupForDetails.value = null
}

const closeBackupProgressDialog = () => {
  showBackupProgressDialog.value = false
  backupProgress.value.isRunning = false
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
      original_uuid: backup.original_uuid,
      original_email: backup.original_email,
      user_id: backup.user_id,
      fullBackup: backup
    })

    // Extract user information from backup data
    const userEmail = backup.summary?.user_email || backup.original_email
    const userId = backup.original_uuid || backup.user_id || backup.backup_data?.metadata?.target_user_id

    console.log('Checking for user:', { userEmail, userId })

    // Check by email and user ID
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
    
    // Also check Supabase Auth directly for more accurate results
    let authUserExists = false
    if (userId) {
      try {
        const authRes = await fetch(`/api/users/${userId}/auth-check`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        if (authRes.ok) {
          const authData = await authRes.json()
          authUserExists = authData.exists
          console.log('Auth check result:', { authData, authUserExists })
        }
      } catch (authError) {
        console.log('Auth check failed:', authError)
      }
    }
    
    userExists.value = emailExists || userIdExists || authUserExists
    
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

// Delete Memory Book Functions
const confirmDeleteBook = (book) => {
  bookToDelete.value = book
  showDeleteBookConfirmDialog.value = true
}

const cancelDeleteBook = () => {
  showDeleteBookConfirmDialog.value = false
  bookToDelete.value = null
}

const deleteBookConfirmed = async () => {
  if (!bookToDelete.value) return

  deletingBook.value = true
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Soft delete the memory book
    const { error } = await supabase
      .from('memory_books')
      .update({ 
        deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', bookToDelete.value.id)

    if (error) {
      throw new Error(error.message || 'Failed to delete memory book')
    }

    toast.add({
      severity: 'success',
      summary: 'Memory Book Trashed',
      detail: `Successfully moved "${bookToDelete.value.ai_supplemental_prompt || 'No prompt'}" to trash`,
      life: 3000
    })

    // Close dialog and reset
    showDeleteBookConfirmDialog.value = false
    bookToDelete.value = null

    // Reload books for the selected user
    if (selectedUser.value && selectedUser.value.user_id) {
      await loadUserBooks(selectedUser.value.user_id)
    }

  } catch (error) {
    console.error('❌ Delete memory book error:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: error.message || 'Failed to delete memory book',
      life: 5000
    })
  } finally {
    deletingBook.value = false
  }
}

// Memory Books Trash Functions
const openMemoryBooksTrash = async () => {
  if (!selectedUser.value || !selectedUser.value.user_id) return
  
  showMemoryBooksTrashDialog.value = true
  await loadDeletedMemoryBooks(selectedUser.value.user_id)
}

const loadDeletedMemoryBooks = async (userId) => {
  if (!userId) return
  
  loadingDeletedBooks.value = true
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Get deleted memory books for the specific user
    const { data, error } = await supabase
      .from('memory_books')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted', true)
      .order('deleted_at', { ascending: false })

    if (error) {
      throw new Error(error.message || 'Failed to load deleted memory books')
    }

    deletedMemoryBooks.value = data || []
    
  } catch (error) {
    console.error('❌ Error loading deleted memory books:', error)
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: error.message || 'Failed to load deleted memory books',
      life: 5000
    })
    deletedMemoryBooks.value = []
  } finally {
    loadingDeletedBooks.value = false
  }
}

// Permanent delete single book
const confirmPermanentDeleteBook = (book) => {
  bookToPermanentDelete.value = book
  showPermanentDeleteBookConfirmDialog.value = true
}

const cancelPermanentDeleteBook = () => {
  showPermanentDeleteBookConfirmDialog.value = false
  bookToPermanentDelete.value = null
}

const permanentDeleteBookConfirmed = async () => {
  if (!bookToPermanentDelete.value) return

  deletingBookPermanently.value = true
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    // Double-check the book is deleted and belongs to the selected user
    const bookToDeleteId = bookToPermanentDelete.value.id
    const userId = selectedUser.value.user_id

    // Verify it's a deleted book for this user
    const { data: verifyBook, error: verifyError } = await supabase
      .from('memory_books')
      .select('id, user_id, deleted')
      .eq('id', bookToDeleteId)
      .eq('user_id', userId)
      .eq('deleted', true)
      .single()

    if (verifyError || !verifyBook) {
      throw new Error('Book not found or not marked for deletion')
    }

    // Permanently delete the memory book
    const { error } = await supabase
      .from('memory_books')
      .delete()
      .eq('id', bookToDeleteId)
      .eq('user_id', userId)
      .eq('deleted', true)

    if (error) {
      throw new Error(error.message || 'Failed to permanently delete memory book')
    }

    toast.add({
      severity: 'success',
      summary: 'Permanently Deleted',
      detail: `Successfully deleted "${bookToPermanentDelete.value.ai_supplemental_prompt || 'No prompt'}"`,
      life: 3000
    })

    // Close dialog and reset
    showPermanentDeleteBookConfirmDialog.value = false
    bookToPermanentDelete.value = null

    // Reload deleted books
    await loadDeletedMemoryBooks(userId)

  } catch (error) {
    console.error('❌ Permanent delete memory book error:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: error.message || 'Failed to permanently delete memory book',
      life: 5000
    })
  } finally {
    deletingBookPermanently.value = false
  }
}

// Empty trash (delete all trashed books for user)
const confirmEmptyTrash = () => {
  showEmptyTrashConfirmDialog.value = true
}

const cancelEmptyTrash = () => {
  showEmptyTrashConfirmDialog.value = false
}

const emptyTrashConfirmed = async () => {
  if (!selectedUser.value || !selectedUser.value.user_id) return

  emptyingTrash.value = true
  try {
    const config = useRuntimeConfig()
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey || config.public.supabaseKey
    )

    const userId = selectedUser.value.user_id

    // Permanently delete ALL deleted memory books for this user
    const { error } = await supabase
      .from('memory_books')
      .delete()
      .eq('user_id', userId)
      .eq('deleted', true)

    if (error) {
      throw new Error(error.message || 'Failed to empty trash')
    }

    const deletedCount = deletedMemoryBooks.value.length

    toast.add({
      severity: 'success',
      summary: 'Trash Emptied',
      detail: `Successfully deleted ${deletedCount} memory book${deletedCount !== 1 ? 's' : ''} for ${selectedUser.value.email}`,
      life: 5000
    })

    // Close dialogs and reset
    showEmptyTrashConfirmDialog.value = false
    
    // Reload deleted books (should be empty now)
    await loadDeletedMemoryBooks(userId)

  } catch (error) {
    console.error('❌ Empty trash error:', error)
    toast.add({
      severity: 'error',
      summary: 'Empty Trash Failed',
      detail: error.message || 'Failed to empty trash',
      life: 5000
    })
  } finally {
    emptyingTrash.value = false
  }
}

// Thumbnail backfill functions
const loadThumbnailStats = async () => {
  try {
    loadingThumbnailStats.value = true
    
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    
    if (!accessToken) {
      throw new Error('No access token available')
    }
    
    // Query stats using susql-like query
    const statsQuery = `
      SELECT 
        COUNT(*) as total_photos,
        COUNT(thumbnail_url) FILTER (WHERE thumbnail_url IS NOT NULL) as with_thumbnails,
        COUNT(*) FILTER (WHERE thumbnail_url IS NULL) as without_thumbnails
      FROM assets
      WHERE deleted = false AND type = 'photo'
    `
    
    const { data, error } = await supabase.rpc('execute_sql', { query: statsQuery })
    
    if (error) {
      // Fallback: query directly
      const { data: allPhotos, error: photosError } = await supabase
        .from('assets')
        .select('id, thumbnail_url')
        .eq('type', 'photo')
        .eq('deleted', false)
      
      if (photosError) throw photosError
      
      thumbnailStats.value = {
        totalPhotos: allPhotos.length,
        withThumbnails: allPhotos.filter(p => p.thumbnail_url).length,
        withoutThumbnails: allPhotos.filter(p => !p.thumbnail_url).length
      }
    } else if (data && data.length > 0) {
      thumbnailStats.value = {
        totalPhotos: parseInt(data[0].total_photos || 0),
        withThumbnails: parseInt(data[0].with_thumbnails || 0),
        withoutThumbnails: parseInt(data[0].without_thumbnails || 0)
      }
    }
    
    console.log('📊 Thumbnail stats:', thumbnailStats.value)
    
  } catch (error) {
    console.error('❌ Failed to load thumbnail stats:', error)
    toast.add({
      severity: 'error',
      summary: 'Stats Load Failed',
      detail: error.message || 'Failed to load thumbnail statistics',
      life: 5000
    })
  } finally {
    loadingThumbnailStats.value = false
  }
}

const stopThumbnailBackfill = () => {
  backfillStopping.value = true
  backfillProgress.value.message = '⏹️ Stopping after current batch...'
  backfillProgress.value.currentPhoto = 0  // Hide spinner
}

const startThumbnailBackfill = async () => {
  try {
    backfillRunning.value = true
    backfillStopping.value = false
    backfillProgress.value = {
      show: true,
      processed: 0,
      total: thumbnailStats.value.withoutThumbnails,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      percentage: 0,
      message: 'Starting thumbnail generation...',
      currentPhoto: 0
    }
    
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    
    if (!accessToken) {
      throw new Error('No access token available')
    }
    
    let totalProcessed = 0
    let totalSucceeded = 0
    let totalFailed = 0
    let totalSkipped = 0
    const targetCount = thumbnailStats.value.withoutThumbnails
    
    // Process in batches until all are done or stopped
    while (totalProcessed < targetCount && !backfillStopping.value) {
      const batchNumber = Math.floor(totalProcessed / backfillBatchSize.value) + 1
      console.log(`🔄 Starting batch ${batchNumber}...`)
      
      // Update current photo indicator at start of batch
      backfillProgress.value.currentPhoto = totalProcessed + 1
      
      const response = await $fetch('/api/admin/backfill-thumbnails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: {
          limit: backfillBatchSize.value
        }
      })
      
      if (response.success) {
        totalProcessed += response.processed
        totalSucceeded += response.succeeded
        totalFailed += response.failed
        totalSkipped += response.skipped
        
        backfillProgress.value = {
          show: true,
          processed: totalProcessed,
          total: targetCount,
          succeeded: totalSucceeded,
          failed: totalFailed,
          skipped: totalSkipped,
          percentage: Math.round((totalProcessed / targetCount) * 100),
          message: backfillStopping.value ? '⏹️ Stopping after current batch...' : (response.message || `Processing batch...`),
          currentPhoto: 0  // Reset after batch completes
        }
        
        console.log(`✅ Batch complete: ${response.processed} processed, ${response.succeeded} succeeded`)
        
        // If no more assets to process, break
        if (response.processed === 0) {
          break
        }
        
        // Check if stop was requested
        if (backfillStopping.value) {
          backfillProgress.value.message = `⏹️ Stopped. Processed ${totalSucceeded} of ${targetCount} thumbnails.`
          
          toast.add({
            severity: 'info',
            summary: 'Backfill Stopped',
            detail: `Generated ${totalSucceeded} thumbnails before stopping. ${totalFailed} failed, ${totalSkipped} skipped.`,
            life: 8000
          })
          
          break
        }
      } else {
        throw new Error(response.message || 'Backfill failed')
      }
      
      // Small delay between batches to prevent overwhelming the server
      if (totalProcessed < targetCount && !backfillStopping.value) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    // Only show complete message if we weren't stopped
    if (!backfillStopping.value) {
      backfillProgress.value.message = `✅ Complete! ${totalSucceeded} thumbnails generated successfully.`
      
      toast.add({
        severity: 'success',
        summary: 'Thumbnail Backfill Complete',
        detail: `Generated ${totalSucceeded} thumbnails. ${totalFailed} failed, ${totalSkipped} skipped.`,
        life: 8000
      })
    }
    
    // Reload stats
    await loadThumbnailStats()
    
  } catch (error) {
    console.error('❌ Thumbnail backfill failed:', error)
    backfillProgress.value.message = `❌ Error: ${error.message}`
    toast.add({
      severity: 'error',
      summary: 'Backfill Failed',
      detail: error.message || 'Failed to generate thumbnails',
      life: 5000
    })
  } finally {
    backfillRunning.value = false
    backfillStopping.value = false
  }
}

// Rekognition Collections backfill functions
const loadRekognitionStats = async () => {
  try {
    loadingRekognitionStats.value = true
    
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    
    if (!accessToken) {
      throw new Error('No access token available')
    }
    
    // Query total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('deleted', false)
    
    // Query total image assets
    const { count: totalAssets } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .eq('deleted', false)
      .eq('approved', true)
      .like('mime_type', 'image/%')
      .not('storage_url', 'is', null)
    
    // Query processed assets (those with face detection data)
    const { count: processedAssets } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .eq('deleted', false)
      .eq('approved', true)
      .like('mime_type', 'image/%')
      .not('storage_url', 'is', null)
      .not('face_detection_data', 'is', null)
    
    rekognitionStats.value = {
      totalUsers: totalUsers || 0,
      totalAssets: totalAssets || 0,
      processed: processedAssets || 0,
      pending: (totalAssets || 0) - (processedAssets || 0)
    }
    
  } catch (error) {
    console.error('❌ Load Rekognition stats error:', error)
    toast.add({
      severity: 'error',
      summary: 'Load Stats Failed',
      detail: error.message || 'Failed to load Rekognition stats',
      life: 5000
    })
  } finally {
    loadingRekognitionStats.value = false
  }
}

const confirmRekognitionBackfill = () => {
  const confirmed = confirm(
    `This will reindex ${rekognitionStats.value.pending} photos with AWS Rekognition Collections.\n\n` +
    `Estimated cost: ~$${estimatedRekognitionCost.value.toFixed(2)}\n\n` +
    `This process:\n` +
    `• Calls IndexFaces for each photo ($0.001 each)\n` +
    `• Calls SearchFaces for each detected face ($0.001 each)\n` +
    `• Auto-assigns faces with ≥95% similarity\n` +
    `• Flags lower confidence faces for user review\n\n` +
    `Are you sure you want to continue?`
  )
  
  if (confirmed) {
    startRekognitionBackfill(false)
  }
}

const startRekognitionBackfill = async (dryRun = false) => {
  try {
    rekognitionBackfillRunning.value = true
    rekognitionBackfillStopping.value = false
    
    rekognitionProgress.value = {
      show: true,
      processed: 0,
      total: 0,
      successful: 0,
      failed: 0,
      facesDetected: 0,
      autoAssigned: 0,
      percentage: 0,
      message: dryRun ? 'Starting preview (no changes will be made)...' : 'Starting backfill...',
      currentAsset: '',
      isDryRun: dryRun
    }
    
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    
    if (!accessToken) {
      throw new Error('No access token available')
    }
    
    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('deleted', false)
    
    if (usersError) throw usersError
    
    // Process each user
    for (const user of users || []) {
      if (rekognitionBackfillStopping.value) {
        rekognitionProgress.value.message = '⏹️ Stopped by user'
        break
      }
      
      // Fetch user's assets
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('id, storage_url, file_name')
        .eq('user_id', user.user_id)
        .eq('deleted', false)
        .eq('approved', true)
        .like('mime_type', 'image/%')
        .not('storage_url', 'is', null)
      
      if (assetsError) {
        console.error(`Error fetching assets for user ${user.email}:`, assetsError)
        continue
      }
      
      rekognitionProgress.value.total += (assets || []).length
      
      // Process each asset
      for (const asset of assets || []) {
        if (rekognitionBackfillStopping.value) {
          break
        }
        
        rekognitionProgress.value.currentAsset = `${user.email}: ${asset.file_name}`
        
        if (dryRun) {
          // In dry run mode, just increment counters
          rekognitionProgress.value.processed++
          rekognitionProgress.value.successful++
          rekognitionProgress.value.percentage = Math.round((rekognitionProgress.value.processed / rekognitionProgress.value.total) * 100)
          await new Promise(resolve => setTimeout(resolve, 10)) // Small delay for UI
          continue
        }
        
        try {
          // Call the index-face-rekognition endpoint
          const response = await $fetch('/api/ai/index-face-rekognition', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-User-Id': user.user_id
            },
            body: {
              imageUrl: asset.storage_url,
              assetId: asset.id,
              reprocessOptions: { faces: true }
            }
          })
          
          rekognitionProgress.value.successful++
          rekognitionProgress.value.facesDetected += response.facesDetected || 0
          rekognitionProgress.value.autoAssigned += response.autoAssigned?.length || 0
          
        } catch (error) {
          console.error(`Error processing asset ${asset.id}:`, error)
          rekognitionProgress.value.failed++
        }
        
        rekognitionProgress.value.processed++
        rekognitionProgress.value.percentage = Math.round((rekognitionProgress.value.processed / rekognitionProgress.value.total) * 100)
      }
    }
    
    // Completion message
    if (rekognitionBackfillStopping.value) {
      rekognitionProgress.value.message = `⏹️ Stopped. Processed ${rekognitionProgress.value.processed}/${rekognitionProgress.value.total} photos.`
    } else if (dryRun) {
      rekognitionProgress.value.message = `✅ Preview complete. Would process ${rekognitionProgress.value.total} photos across ${users.length} users.`
    } else {
      rekognitionProgress.value.message = `✅ Backfill complete! Processed ${rekognitionProgress.value.successful} photos, detected ${rekognitionProgress.value.facesDetected} faces, auto-assigned ${rekognitionProgress.value.autoAssigned}.`
      
      // Show success toast
      toast.add({
        severity: 'success',
        summary: 'Face Recognition Backfill Complete',
        detail: `Processed ${rekognitionProgress.value.successful} photos, detected ${rekognitionProgress.value.facesDetected} faces`,
        life: 10000
      })
    }
    
    // Reload stats
    await loadRekognitionStats()
    
  } catch (error) {
    console.error('❌ Rekognition backfill error:', error)
    rekognitionProgress.value.message = `❌ Error: ${error.message}`
    
    toast.add({
      severity: 'error',
      summary: 'Backfill Failed',
      detail: error.message || 'Face recognition backfill failed',
      life: 5000
    })
  } finally {
    rekognitionBackfillRunning.value = false
    rekognitionBackfillStopping.value = false
  }
}

const stopRekognitionBackfill = () => {
  rekognitionBackfillStopping.value = true
  rekognitionProgress.value.message = '⏹️ Stopping after current photo...'
}

// Load thumbnail stats on mount
onMounted(() => {
  loadThumbnailStats()
  loadRekognitionStats()
})
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