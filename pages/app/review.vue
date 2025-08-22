<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex-1 flex items-center gap-2 sm:gap-3">
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-primary">Review Family Photos</h1>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition-colors focus:outline-none flex-shrink-0 min-h-[44px] sm:min-h-0"
            v-tooltip.top="'How to review family photos'"
            @click="showHelpModal = true"
            aria-label="Information about reviewing family photos"
          >
            <i class="pi pi-info text-lg text-brand-highlight"></i>
          </button>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
          <button
            v-if="stats.pending > 0"
            class="flex items-center justify-center gap-2 bg-brand-highlight hover:bg-brand-highlight/80 text-white font-bold rounded-full px-4 sm:px-6 py-3 text-sm sm:text-lg shadow transition-all duration-200 w-full sm:w-auto min-h-[48px] sm:min-h-0"
            @click="approveAllPending"
            :disabled="approvingAll"
          >
            <i class="pi pi-check text-lg sm:text-2xl" :class="{ 'animate-spin': approvingAll }"></i>
            <span class="hidden sm:inline">Approve All Photos ({{ stats.pending }})</span>
            <span class="sm:hidden">Approve All</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-4 sm:px-6 py-3 text-sm sm:text-lg shadow transition-all duration-200 w-full sm:w-auto min-h-[48px] sm:min-h-0"
            @click="showRerunAIDialog = true"
            :disabled="rerunningAI"
          >
            <i class="pi pi-refresh text-lg sm:text-2xl" :class="{ 'animate-spin': rerunningAI }"></i>
            <span class="hidden sm:inline">Rerun AI</span>
            <span class="sm:hidden">Rerun AI</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 bg-brand-header hover:bg-brand-secondary text-white font-bold rounded-full px-4 sm:px-8 py-3 text-sm sm:text-lg shadow transition-all duration-200 w-full sm:w-auto min-h-[48px] sm:min-h-0"
            @click="navigateTo('/app/deleted-memories')"
          >
            <i class="pi pi-trash text-lg sm:text-2xl animate-bounce"></i>
            <span class="hidden sm:inline">Deleted Photos</span>
            <span class="sm:hidden">Deleted</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow p-4 sm:p-4 flex flex-col items-center">
          <i class="pi pi-image text-brand-secondary text-2xl mb-2"></i>
          <div class="text-sm text-brand-primary/70">All Photos</div>
          <div class="text-xl font-bold text-brand-primary">{{ stats.total }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 sm:p-4 flex flex-col items-center">
          <i class="pi pi-clock text-yellow-500 text-2xl mb-2"></i>
          <div class="text-sm text-brand-primary/70">Need Review</div>
          <div class="text-xl font-bold text-brand-primary">{{ stats.pending }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 sm:p-4 flex flex-col items-center">
          <i class="pi pi-check text-brand-highlight text-2xl mb-2"></i>
          <div class="text-sm text-brand-primary/70">Approved</div>
          <div class="text-xl font-bold text-brand-primary">{{ stats.approved }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 sm:p-4 flex flex-col items-center">
          <i class="pi pi-book text-brand-secondary text-2xl mb-2"></i>
          <div class="text-sm text-brand-primary/70">Ready for Cards</div>
          <div class="text-xl font-bold text-brand-primary">{{ stats.readyForBook }}</div>
        </div>
      </div>

      <!-- Filters -->
      <Card class="mb-8">
        <template #content>
          <div class="flex flex-col sm:flex-wrap items-start sm:items-center gap-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-2 w-full sm:w-auto">
              <label class="text-sm font-medium text-brand-primary">Filter:</label>
              <Dropdown
                v-model="activeFilter"
                :options="filterOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Filter"
                class="w-full sm:w-60"
              />
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-2 w-full sm:w-auto">
              <label class="text-sm font-medium text-brand-primary">Type:</label>
              <Dropdown
                v-model="typeFilter"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Type"
                class="w-full sm:w-60"
              />
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-2 w-full sm:w-auto">
              <label class="text-sm font-medium text-brand-primary">Sort:</label>
              <Dropdown
                v-model="sortBy"
                :options="sortOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Sort"
                class="w-full sm:w-60"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Memory Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <div
          v-for="asset in filteredAssets"
          :key="asset.id"
          class="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-shadow border border-gray-100 flex flex-col justify-between"
        >
          <!-- Photo Section - Fixed Height -->
          <div class="rounded-t-xl sm:rounded-t-2xl overflow-hidden bg-gray-100 h-[120px] sm:h-[160px] flex-shrink-0">
            <div class="w-full h-full flex items-center justify-center">
              <img
                v-if="asset.storage_url"
                :src="asset.storage_url"
                :alt="asset.user_caption || 'Family photo'"
                class="max-w-full max-h-full object-contain"
              />
              <i v-else class="pi pi-image text-xl sm:text-2xl text-gray-400"></i>
            </div>
          </div>

          <!-- Action Bar - Fixed at Bottom -->
          <div class="rounded-b-xl sm:rounded-b-2xl bg-brand-navigation px-3 sm:px-4 py-3 sm:py-3 flex items-center justify-between gap-3 sm:gap-4 border-t border-brand-primary/20" style="flex-shrink: 0; margin-top: auto;">
            <div class="flex items-center gap-3 sm:gap-3 flex-1 justify-center">
              <div class="flex flex-col items-center cursor-pointer group" @click="openDetailsDialog(asset)" v-tooltip.top="'Details'">
                <button class="bg-brand-dialog-edit text-white w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full min-h-[40px] sm:min-h-0">
                  <i class="pi pi-info-circle text-base sm:text-lg"></i>
                </button>
                <span class="text-xs sm:text-[10px] text-brand-secondary mt-1 sm:mt-0.5">Details</span>
              </div>
              <div v-if="!asset.approved" class="flex flex-col items-center cursor-pointer group" @click="approveAsset(asset.id)" v-tooltip.top="'Approve'">
                <button class="bg-brand-dialog-save text-white w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full min-h-[40px] sm:min-h-0">
                  <i class="pi pi-check text-base sm:text-lg"></i>
                </button>
                <span class="text-xs sm:text-[10px] text-brand-highlight mt-1 sm:mt-0.5">Approve</span>
              </div>
              <div class="flex flex-col items-center cursor-pointer group" @click="openEditDialog(asset)" v-tooltip.top="'Edit'">
                <button class="bg-brand-dialog-edit text-white w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full min-h-[40px] sm:min-h-0">
                  <i class="pi pi-pencil text-base sm:text-lg"></i>
                </button>
                <span class="text-xs sm:text-[10px] text-brand-secondary mt-1 sm:mt-0.5">Edit</span>
              </div>
              <div class="flex flex-col items-center cursor-pointer group" @click="deleteAsset(asset.id)" v-tooltip.top="'Trash'">
                <button class="bg-brand-dialog-delete text-white w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full min-h-[40px] sm:min-h-0">
                  <i class="pi pi-trash text-base sm:text-lg"></i>
                </button>
                <span class="text-xs sm:text-[10px] text-red-700 mt-1 sm:mt-0.5">Trash</span>
              </div>
            </div>
            <div>
              <span v-if="!asset.approved && !asset.rejected" class="inline-block px-3 sm:px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 font-semibold text-xs shadow">Pending</span>
              <span v-else-if="asset.approved" class="inline-block px-3 sm:px-3 py-1 rounded-full bg-brand-highlight/20 text-brand-highlight font-semibold text-xs shadow">Approved</span>
              <span v-else-if="asset.rejected" class="inline-block px-3 sm:px-3 py-1 rounded-full bg-red-200 text-red-800 font-semibold text-xs shadow">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Asset Dialog -->
      <Dialog
        v-model:visible="showEditDialog"
        modal
        :closable="true"
        :dismissableMask="true"
        header="Edit Asset"
        class="w-full max-w-4xl mx-4"
      >
        <div v-if="editingAsset" class="space-y-6">
          <!-- Asset Preview -->
          <div class="flex flex-col lg:flex-row gap-6">
            <div class="w-full lg:w-1/3">
              <div class="bg-brand-navigation/20 rounded-lg p-4">
                <img
                  v-if="editingAsset.storage_url"
                  :src="editingAsset.storage_url"
                  :alt="editingAsset.user_caption || 'Family photo'"
                  class="w-full h-48 lg:h-64 object-contain rounded"
                />
                <i v-else class="pi pi-image text-4xl text-brand-primary/40 flex items-center justify-center h-48 lg:h-64"></i>
              </div>
            </div>
            
            <div class="w-full lg:w-2/3 space-y-6 sm:space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-semibold text-brand-primary mb-2">Title</label>
                <InputText
                  v-model="editingAsset.title"
                  placeholder="Add a title for this memory"
                  class="w-full py-3 sm:py-2 text-base"
                />
              </div>

              <!-- User Caption -->
              <div>
                <label class="block text-sm font-semibold text-brand-primary mb-2">Your Caption</label>
                <Textarea
                  v-model="editingAsset.user_caption"
                  placeholder="Add your caption"
                  class="w-full py-3 sm:py-2 text-base"
                  rows="3"
                />
              </div>

              <!-- Custom Tags -->
              <div>
                <label class="block text-sm font-semibold text-brand-primary mb-2">Custom Tags</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <Chip
                    v-for="tag in editingAsset.user_tags || []"
                    :key="tag"
                    :label="tag"
                    class="bg-brand-highlight/20 text-brand-highlight"
                    removable
                    @remove="removeUserTag(tag)"
                  />
                </div>
                <AutoComplete
                  v-model="newTag"
                  :suggestions="tagSuggestions"
                  @complete="searchTags"
                  placeholder="Add a tag"
                  class="w-full py-3 sm:py-2 text-base"
                  @keydown.enter="addUserTag"
                />
              </div>

              <!-- Custom People/Objects -->
              <div>
                <label class="block text-sm font-semibold text-brand-primary mb-2">People/Objects</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <Chip
                    v-for="person in editingAsset.user_people || []"
                    :key="person"
                    :label="person"
                    class="bg-brand-accent/20 text-brand-accent"
                    removable
                    @remove="removeUserPerson(person)"
                  />
                </div>
                <AutoComplete
                  v-model="newPerson"
                  :suggestions="peopleSuggestions"
                  @complete="searchPeople"
                  placeholder="Add a person or object"
                  class="w-full py-3 sm:py-2 text-base"
                  @keydown.enter="addUserPerson"
                />
              </div>

              <!-- AI Caption (read-only) -->
              <div v-if="editingAsset.ai_caption">
                <label class="block text-sm font-semibold text-brand-primary mb-2">AI Caption</label>
                <div class="italic text-sm text-brand-primary/70 bg-brand-navigation/20 rounded p-3">
                  "{{ editingAsset.ai_caption }}"
                </div>
              </div>

              <!-- AI Description (read-only) -->
              <div v-if="editingAsset.ai_description">
                <label class="block text-sm font-semibold text-brand-primary mb-2">AI Description</label>
                <div class="text-sm text-brand-primary/80 bg-brand-navigation/20 rounded p-3 border-l-4 border-brand-primary/30">
                  {{ editingAsset.ai_description }}
                </div>
              </div>

              <!-- AI Tags (read-only) -->
              <div v-if="editingAsset.tags && editingAsset.tags.length > 0">
                <label class="block text-sm font-semibold text-brand-primary mb-2">AI Tags</label>
                <div class="flex flex-wrap gap-2">
                  <Chip
                    v-for="tag in editingAsset.tags"
                    :key="tag"
                    :label="tag"
                    class="bg-brand-primary/10 text-brand-primary"
                  />
                </div>
              </div>

              <!-- AI People (read-only) -->
              <div v-if="editingAsset.people_detected && editingAsset.people_detected.length > 0">
                <label class="block text-sm font-semibold text-brand-primary mb-2">AI People/Objects</label>
                <div class="flex flex-wrap gap-2">
                  <Chip
                    v-for="person in editingAsset.people_detected"
                    :key="person"
                    :label="person"
                    class="bg-brand-primary/10 text-brand-primary"
                  />
                </div>
              </div>

              <!-- Location Data (read-only) -->
              <div>
                <label class="block text-sm font-semibold text-brand-primary mb-2">Location Data</label>
                <div class="space-y-2">
                  <!-- Comprehensive Location -->
                  <div v-if="editingAsset.location">
                    <label class="block text-xs font-medium text-brand-primary/70 mb-1">Full Location</label>
                    <div class="text-sm text-brand-primary bg-brand-navigation/20 rounded p-2 border border-brand-primary/20">
                      {{ editingAsset.location }}
                    </div>
                  </div>
                  
                  <!-- Individual Location Components -->
                  <div v-if="editingAsset.city || editingAsset.state || editingAsset.country || editingAsset.zip_code">
                    <label class="block text-xs font-medium text-brand-primary/70 mb-1">Location Components</label>
                    <div class="grid grid-cols-2 gap-2">
                      <div v-if="editingAsset.city">
                        <label class="block text-xs text-brand-primary/60">City</label>
                        <div class="text-sm text-brand-primary bg-brand-highlight/10 rounded p-2">{{ editingAsset.city }}</div>
                      </div>
                      <div v-if="editingAsset.state">
                        <label class="block text-xs text-brand-primary/60">State/Province</label>
                        <div class="text-sm text-brand-primary bg-brand-secondary/10 rounded p-2">{{ editingAsset.state }}</div>
                      </div>
                      <div v-if="editingAsset.country">
                        <label class="block text-xs text-brand-primary/60">Country</label>
                        <div class="text-sm text-brand-primary bg-brand-header/10 rounded p-2">{{ editingAsset.country }}</div>
                      </div>
                      <div v-if="editingAsset.zip_code">
                        <label class="block text-xs text-brand-primary/60">ZIP/Postal Code</label>
                        <div class="text-sm text-brand-primary bg-brand-accent/10 rounded p-2">{{ editingAsset.zip_code }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- No Location Data Message -->
                  <div v-if="!editingAsset.location && !editingAsset.city && !editingAsset.state && !editingAsset.country && !editingAsset.zip_code">
                    <div class="text-sm text-brand-primary/50 italic bg-brand-navigation/20 rounded p-2 border border-brand-primary/20">
                      <i class="pi pi-map-marker text-brand-primary/40 mr-1"></i>
                      No location data available
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                @click="unapproveAsset"
                :disabled="!editingAsset.approved"
                class="bg-brand-dialog-cancel text-white px-6 py-2 rounded transition-all focus:outline-none border-0 hover:bg-brand-dialog-cancel/80 w-full sm:w-auto"
              >
                <i class="pi pi-times text-xl"></i>
                Unapprove
              </button>
              <button
                @click="rerunAI"
                :disabled="aiProcessing"
                class="bg-brand-dialog-edit text-white px-6 py-2 rounded transition-all focus:outline-none border-0 hover:bg-brand-secondary/80 w-full sm:w-auto"
              >
                <i class="pi pi-refresh text-xl" :class="{ 'animate-spin': aiProcessing }"></i>
                Rerun AI
              </button>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full sm:w-auto">
              <button
                @click="showEditDialog = false"
                class="bg-brand-dialog-cancel text-white px-6 py-3 sm:py-2 rounded transition-all focus:outline-none border-0 hover:bg-brand-dialog-cancel/80 w-full sm:w-auto min-h-[48px] sm:min-h-0"
              >
                <i class="pi pi-times text-xl"></i>
                Cancel
              </button>
              <button
                @click="saveAssetChanges"
                class="bg-brand-dialog-save text-white px-6 py-3 sm:py-2 rounded transition-all focus:outline-none border-0 hover:bg-brand-header/80 w-full sm:w-auto min-h-[48px] sm:min-h-0"
              >
                <i class="pi pi-check text-xl"></i>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      <!-- Details Dialog -->
      <Dialog v-model:visible="showDetailsDialog" modal :closable="true" :dismissableMask="true" header="Memory Details" :class="['details-dialog', 'w-full', 'max-w-2xl', 'mx-4']">
        <div v-if="detailsAsset" class="space-y-4">
          <div class="flex flex-col items-center">
            <img v-if="detailsAsset.storage_url" :src="detailsAsset.storage_url" :alt="detailsAsset.user_caption || 'Family photo'" class="w-full max-w-xs rounded-xl mb-4" />
            <i v-else class="pi pi-image text-4xl text-brand-primary/40 flex items-center justify-center h-48"></i>
          </div>
          <div v-if="detailsAsset.ai_caption">
            <label class="block text-sm font-semibold text-brand-primary mb-1">AI Caption</label>
            <div class="italic text-sm text-brand-primary/70 bg-brand-navigation/20 rounded p-2 border border-brand-primary/20">"{{ detailsAsset.ai_caption }}"</div>
          </div>
          <div v-if="detailsAsset.ai_description">
            <label class="block text-sm font-semibold text-brand-primary mb-1">AI Description</label>
            <div class="text-sm text-brand-primary/80 bg-brand-navigation/20 rounded p-2 border-l-4 border-brand-primary/30">
              {{ detailsAsset.ai_description }}
            </div>
          </div>
          <div v-if="(detailsAsset.tags && detailsAsset.tags.length > 0) || (detailsAsset.user_tags && detailsAsset.user_tags.length > 0)">
            <label class="block text-sm font-semibold text-brand-primary mb-1">Tags</label>
            <div class="flex flex-wrap gap-1">
              <Chip v-for="tag in detailsAsset.tags || []" :key="`ai-${tag}`" :label="tag" class="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1" />
              <Chip v-for="tag in detailsAsset.user_tags || []" :key="`user-${tag}`" :label="tag" class="text-xs bg-brand-highlight/20 text-brand-highlight px-2 py-1" />
            </div>
          </div>
          <div v-if="(detailsAsset.people_detected && detailsAsset.people_detected.length > 0) || (detailsAsset.user_people && detailsAsset.user_people.length > 0)">
            <label class="block text-sm font-semibold text-brand-primary mb-1">People/Objects</label>
            <div class="flex flex-wrap gap-1">
              <Chip v-for="person in detailsAsset.people_detected || []" :key="`ai-${person}`" :label="person" class="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1" />
              <Chip v-for="person in detailsAsset.user_people || []" :key="`user-${person}`" :label="person" class="text-xs bg-brand-accent/20 text-brand-accent px-2 py-1" />
            </div>
          </div>
          <div v-if="detailsAsset.location || detailsAsset.city || detailsAsset.state || detailsAsset.country || detailsAsset.zip_code">
            <label class="block text-sm font-semibold text-brand-primary mb-1">Location</label>
            <div class="flex flex-wrap gap-1">
              <!-- Show comprehensive location if available -->
              <Chip v-if="detailsAsset.location" :label="detailsAsset.location" class="text-xs bg-brand-highlight/20 text-brand-highlight px-2 py-1" />
              <!-- Show individual location components -->
              <template v-else>
                <Chip v-if="detailsAsset.city" :label="detailsAsset.city" class="text-xs bg-brand-highlight/20 text-brand-highlight px-2 py-1" />
                <Chip v-if="detailsAsset.state" :label="detailsAsset.state" class="text-xs bg-brand-secondary/20 text-brand-secondary px-2 py-1" />
                <Chip v-if="detailsAsset.country" :label="detailsAsset.country" class="text-xs bg-brand-header/20 text-brand-header px-2 py-1" />
                <Chip v-if="detailsAsset.zip_code" :label="detailsAsset.zip_code" class="text-xs bg-brand-accent/20 text-brand-accent px-2 py-1" />
              </template>
            </div>
          </div>
          <!-- Show message when no location data is available -->
          <div v-else>
            <label class="block text-sm font-semibold text-brand-primary mb-1">Location</label>
            <div class="text-sm text-brand-primary/50 italic bg-brand-navigation/20 rounded p-2 border border-brand-primary/20">
              <i class="pi pi-map-marker text-brand-primary/40 mr-1"></i>
              No location data available
            </div>
          </div>
        </div>
      </Dialog>

      <!-- Help Modal -->
      <Dialog
        v-model:visible="showHelpModal"
        modal
        :closable="true"
        :dismissableMask="true"
        header="✨ Your Special Review Workshop ✨"
        class="w-full max-w-3xl"
      >
        <div class="space-y-6">
          <!-- Welcome Section -->
          <div class="bg-gradient-to-r from-brand-secondary/10 via-brand-header/10 to-brand-highlight/10 rounded-2xl p-6 border border-brand-secondary/30">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-brand-secondary/20 to-brand-header/20 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-star text-brand-secondary text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-brand-primary mb-1">Welcome to Your Memory Review Workshop! ⭐</h3>
                <p class="text-brand-primary/70">This is where you become the curator of your special memories - approve, edit, and organize your precious moments!</p>
              </div>
            </div>
          </div>

          <!-- Stats Cards Section -->
          <div class="bg-gradient-to-r from-brand-highlight/10 to-brand-secondary/10 rounded-2xl p-6 border border-brand-highlight/30">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-brand-highlight/20 to-brand-secondary/20 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-chart-bar text-brand-highlight text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-brand-primary mb-1">📊 Your Memory Collection Stats</h3>
                <p class="text-brand-primary/70">Track your special memory collection with these helpful statistics!</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-4 border border-brand-highlight/30">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-image text-brand-secondary"></i>
                  <span class="font-semibold text-brand-primary">Total Special Moments</span>
                </div>
                <p class="text-sm text-brand-primary/70">All your uploaded moments waiting to be organized</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-brand-highlight/30">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-clock text-yellow-500"></i>
                  <span class="font-semibold text-brand-primary">Awaiting Your Approval</span>
                </div>
                                  <p class="text-sm text-brand-primary/70">Moments waiting for your special approval</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-brand-highlight/30">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-check text-brand-highlight"></i>
                  <span class="font-semibold text-brand-primary">Approved</span>
                </div>
                                  <p class="text-sm text-brand-primary/70">Memories ready to join your special memory books</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-brand-highlight/30">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-book text-brand-secondary"></i>
                  <span class="font-semibold text-brand-primary">Ready for Special Books</span>
                </div>
                <p class="text-sm text-brand-primary/70">Can be included in your beautiful memory collections</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons Section -->
          <div class="bg-gradient-to-r from-brand-highlight/10 to-brand-accent/10 rounded-2xl p-6 border border-brand-highlight/30">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-brand-highlight/20 to-brand-accent/20 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-magic text-brand-highlight text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-brand-primary mb-1">✨ Moment Special Actions</h3>
                <p class="text-brand-primary/70">Apply your special touch to each memory moment with these helpful actions!</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-white rounded-xl p-4 border border-brand-highlight/30">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-check text-brand-highlight text-lg"></i>
                  <span class="font-semibold text-brand-primary">Approve</span>
                </div>
                                  <p class="text-sm text-brand-primary/70">Approve this memory moment to join your Savta Special Memory collection</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-brand-highlight/30">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-pencil text-brand-secondary text-lg"></i>
                  <span class="font-semibold text-brand-primary">Edit</span>
                </div>
                <p class="text-sm text-brand-primary/70">Refine captions, tags, and people to make your memory perfect</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-brand-highlight/30">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-trash text-red-500 text-lg"></i>
                  <span class="font-semibold text-brand-primary">Delete</span>
                </div>
                <p class="text-sm text-brand-primary/70">Send to the trash (can be restored later)</p>
              </div>
            </div>
          </div>

          <!-- Status Tags Section -->
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-tags text-amber-600 text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">🔮 Moment Status Guide</h3>
                <p class="text-gray-600">Each moment has its own special status - here's what they mean!</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-white rounded-xl p-4 border border-amber-100">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <i class="pi pi-clock text-amber-600 text-xs"></i>
                  </div>
                  <span class="font-semibold text-gray-800">Pending</span>
                </div>
                                  <p class="text-sm text-gray-600">New moment awaiting your special review and blessing</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-amber-100">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <i class="pi pi-check text-green-600 text-xs"></i>
                  </div>
                  <span class="font-semibold text-gray-800">Approved</span>
                </div>
                                  <p class="text-sm text-gray-600">Moment approved and ready for special memory books</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-amber-100">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <i class="pi pi-times text-red-600 text-xs"></i>
                  </div>
                  <span class="font-semibold text-gray-800">Rejected</span>
                </div>
                <p class="text-sm text-gray-600">Moments excluded from books but kept in your collection</p>
              </div>
            </div>
          </div>

          <!-- Page Actions Section -->
          <div class="bg-gradient-to-r from-brand-navigation to-brand-warm rounded-2xl p-6 border border-brand-highlight">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-brand-navigation to-brand-warm rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-rocket text-brand-secondary text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">🚀 Powerful Page Actions</h3>
                <p class="text-gray-600">Unleash the full power of your memory workshop with these special tools!</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-4 border border-pink-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-book text-brand-header"></i>
                  <span class="font-semibold text-gray-800">Compose Special Memory</span>
                </div>
                <p class="text-sm text-gray-600">Create a beautiful memory book from your approved special moments</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-pink-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-trash text-brand-secondary"></i>
                  <span class="font-semibold text-gray-800">View Deleted Memories</span>
                </div>
                                  <p class="text-sm text-gray-600">Visit the memory vault to restore forgotten special moments</p>
              </div>
            </div>
          </div>

          <!-- Tips Section -->
          <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-lightbulb text-indigo-600 text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">🌟 Special Tips & Tricks</h3>
                <p class="text-gray-600">Master the art of memory curation with these helpful tips!</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-4 border border-indigo-100">
                <h4 class="font-semibold text-gray-800 mb-2">🎯 Quick Actions:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                                      <li>• Hover over icons to see helpful tooltips</li>
                  <li>• Use filters to find specific memories</li>
                  <li>• Edit captions by clicking on them</li>
                                      <li>• Deleted memories can be restored</li>
                </ul>
              </div>
              <div class="bg-white rounded-xl p-4 border border-indigo-100">
                <h4 class="font-semibold text-gray-800 mb-2">✨ Pro Tips:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                                      <li>• Only approved memories join special books</li>
                  <li>• Use tags to organize your collection</li>
                  <li>• Add people names for better organization</li>
                                      <li>• Review regularly to keep your memories flowing</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="bg-gradient-to-r from-brand-highlight/10 to-brand-secondary/10 rounded-2xl p-6 border border-brand-highlight/30 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-brand-highlight/20 to-brand-secondary/20 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <i class="pi pi-star text-brand-highlight text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-brand-primary mb-2">⭐ Ready to Curate Your Special Memories?</h3>
            <p class="text-brand-primary/70 mb-4">Start reviewing and organizing your precious memory moments!</p>
            <button
              class="bg-gradient-to-r from-brand-highlight to-brand-secondary hover:from-brand-highlight/80 hover:to-brand-secondary/80 text-white font-bold rounded-full px-8 py-3 text-base shadow-lg transition-all duration-200 transform hover:scale-105"
              @click="showHelpModal = false"
            >
              <i class="pi pi-check mr-2"></i>
              Let's Start Reviewing!
            </button>
          </div>
        </div>
      </Dialog>

      <!-- Rerun AI Dialog -->
      <Dialog v-model:visible="showRerunAIDialog" modal :closable="true" :dismissableMask="true" header="Rerun AI Processing" class="w-full max-w-md mx-4">
        <div class="p-4">
          <div class="mb-4">
            <i class="pi pi-exclamation-triangle text-orange-500 text-2xl mb-2"></i>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Rerun AI on All Photos</h3>
            <p class="text-gray-600 mb-4">
              This will reprocess all photos with the latest AI analysis, including improved location detection and caption generation.
            </p>
            <p class="text-sm text-gray-500 mb-4">
              <strong>Estimated time:</strong> About 10 seconds per image. You have {{ stats.total }} photos to process.
            </p>
          </div>

          <div class="flex justify-end gap-2">
            <button
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              @click="showRerunAIDialog = false"
              :disabled="rerunningAI"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
              @click="rerunAIOnAllPhotos"
              :disabled="rerunningAI"
            >
              <i class="pi pi-refresh mr-2" :class="{ 'animate-spin': rerunningAI }"></i>
              Start Processing
            </button>
          </div>
        </div>
      </Dialog>

      <!-- AI Processing Progress Dialog -->
      <Dialog 
        v-model:visible="showProgressDialog" 
        modal 
        :closable="false" 
        :dismissableMask="false" 
        header="AI Processing Progress" 
        class="w-full max-w-lg mx-4"
      >
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-refresh text-orange-600 text-2xl animate-spin"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Processing Photos with AI</h3>
            <p class="text-gray-600">Please wait while we reprocess your photos with the latest AI analysis...</p>
          </div>

          <!-- Progress Information -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center mb-3">
              <span class="text-sm font-medium text-gray-700">Progress</span>
              <span class="text-sm font-bold text-gray-800">{{ rerunProgress.current }} of {{ rerunProgress.total }}</span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                class="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out" 
                :style="{ width: `${(rerunProgress.current / rerunProgress.total) * 100}%` }"
              ></div>
            </div>
            
            <!-- Percentage -->
            <div class="text-center">
              <span class="text-lg font-bold text-orange-600">
                {{ Math.round((rerunProgress.current / rerunProgress.total) * 100) }}%
              </span>
            </div>
          </div>

          <!-- Current Photo Info -->
          <div v-if="rerunProgress.currentAsset" class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <img 
                  v-if="rerunProgress.currentAsset.storage_url" 
                  :src="rerunProgress.currentAsset.storage_url" 
                  :alt="rerunProgress.currentAsset.user_caption || 'Photo'"
                  class="w-full h-full object-cover rounded"
                />
                <i v-else class="pi pi-image text-gray-400"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">
                  {{ rerunProgress.currentAsset.user_caption || 'Processing photo...' }}
                </p>
                <p class="text-xs text-gray-500">
                  Photo {{ rerunProgress.current }} of {{ rerunProgress.total }}
                </p>
              </div>
            </div>
          </div>

          <!-- Estimated Time Remaining -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              <i class="pi pi-clock text-gray-400 mr-1"></i>
              Estimated time remaining: {{ estimatedTimeRemaining }}
            </p>
          </div>

          <!-- Processing Status -->
          <div class="mt-4 text-center">
            <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm">
              <i class="pi pi-cog animate-spin"></i>
              <span>AI Analysis in Progress...</span>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default'
})

import { useToast } from 'primevue/usetoast'

const toast = useToast()
const db = useDatabase()

// Reactive data
const assets = ref([])
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  readyForBook: 0
})
const showHelpModal = ref(false)
const showRerunAIDialog = ref(false)
const showProgressDialog = ref(false)
const rerunningAI = ref(false)
const rerunProgress = ref({
  current: 0,
  total: 0,
  currentAsset: null
})
const startTime = ref(null)

// Edit dialog data
const showEditDialog = ref(false)
const editingAsset = ref(null)
const newTag = ref('')
const newPerson = ref('')
const tagSuggestions = ref([])
const peopleSuggestions = ref([])
const aiProcessing = ref(false)
const approvingAll = ref(false)

// Details dialog data
const showDetailsDialog = ref(false)
const detailsAsset = ref(null)

// Filters
const activeFilter = ref('all')
const typeFilter = ref('all')
const sortBy = ref('newest')

// Filter options
const filterOptions = ref([
  { label: 'All Assets', value: 'all' },
  { label: 'Pending Review', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
])

const typeOptions = ref([
  { label: 'All Types', value: 'all' },
  { label: 'Photos', value: 'photo' },
  { label: 'Stories', value: 'text' }
])

const sortOptions = ref([
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'By Type', value: 'type' }
])

// Computed properties
const filteredAssets = computed(() => {
  let filtered = [...assets.value]

  // Apply status filter
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(asset => {
      if (activeFilter.value === 'pending') return !asset.approved
      if (activeFilter.value === 'approved') return asset.approved
      if (activeFilter.value === 'rejected') return asset.rejected
      return true
    })
  }

  // Apply type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(asset => asset.type === typeFilter.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (sortBy.value === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at)
    } else if (sortBy.value === 'type') {
      return a.type.localeCompare(b.type)
    }
    return 0
  })

  return filtered
})

// Estimated time remaining
const estimatedTimeRemaining = computed(() => {
  if (!startTime.value || rerunProgress.value.current === 0) {
    return 'Calculating...'
  }
  
  const elapsed = Date.now() - startTime.value
  const avgTimePerPhoto = elapsed / rerunProgress.value.current
  const remainingPhotos = rerunProgress.value.total - rerunProgress.value.current
  const estimatedRemaining = avgTimePerPhoto * remainingPhotos
  
  if (estimatedRemaining < 60000) { // Less than 1 minute
    return `${Math.ceil(estimatedRemaining / 1000)} seconds`
  } else if (estimatedRemaining < 3600000) { // Less than 1 hour
    return `${Math.ceil(estimatedRemaining / 60000)} minutes`
  } else {
    const hours = Math.floor(estimatedRemaining / 3600000)
    const minutes = Math.ceil((estimatedRemaining % 3600000) / 60000)
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
})

// Load assets and stats
onMounted(async () => {
  await loadAssets()
  calculateStats()
})

// Load assets
const loadAssets = async () => {
  try {
    const userAssets = await db.assets.getAssets()
    assets.value = userAssets
  } catch (error) {
    console.error('Error loading assets:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load assets',
        life: 3000
      })
    }
  }
}

// Calculate stats
const calculateStats = () => {
  stats.value = {
    total: assets.value.length,
    pending: assets.value.filter(a => !a.approved && !a.rejected).length,
    approved: assets.value.filter(a => a.approved && !a.deleted).length,
    readyForBook: assets.value.filter(a => a.approved && !a.deleted).length
  }
}

// Update asset caption
const updateAssetCaption = async (assetId, caption) => {
  try {
    await db.assets.updateAsset(assetId, { user_caption: caption })
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Caption updated successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error updating caption:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update caption',
        life: 3000
      })
    }
  }
}

// Approve asset
const approveAsset = async (assetId) => {
  try {
    await db.assets.approveAsset(assetId, true)
    // Update local state
    const asset = assets.value.find(a => a.id === assetId)
    if (asset) {
      asset.approved = true
      asset.rejected = false
    }
    calculateStats()
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Approved',
        detail: 'Asset approved successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error approving asset:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to approve asset',
        life: 3000
      })
    }
  }
}

// Approve all pending assets
const approveAllPending = async () => {
  try {
    approvingAll.value = true
    
    // Get all pending assets
    const pendingAssets = assets.value.filter(a => !a.approved && !a.rejected)
    
    if (pendingAssets.length === 0) {
      if (toast) {
        toast.add({
          severity: 'warn',
          summary: 'No Pending Assets',
          detail: 'No assets are pending approval',
          life: 3000
        })
      }
      return
    }
    
    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to approve all ${pendingAssets.length} pending assets?`)
    if (!confirmed) {
      return
    }
    
    // Approve all pending assets
    const approvalPromises = pendingAssets.map(asset => 
      db.assets.approveAsset(asset.id, true)
    )
    
    await Promise.all(approvalPromises)
    
    // Update local state
    pendingAssets.forEach(asset => {
      asset.approved = true
      asset.rejected = false
    })
    
    calculateStats()
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'All Approved',
        detail: `Successfully approved ${pendingAssets.length} assets`,
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error approving all assets:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to approve all assets',
        life: 3000
      })
    }
  } finally {
    approvingAll.value = false
  }
}

// Reject asset
const rejectAsset = async (assetId) => {
  try {
    await db.assets.updateAsset(assetId, { approved: false, rejected: true })
    
    // Update local state
    const asset = assets.value.find(a => a.id === assetId)
    if (asset) {
      asset.approved = false
      asset.rejected = true
    }
    
    calculateStats()
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Rejected',
        detail: 'Asset rejected',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error rejecting asset:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reject asset',
        life: 3000
      })
    }
  }
}

// Delete asset
const deleteAsset = async (assetId) => {
  try {
    await db.assets.deleteAsset(assetId)
    
    // Update local state
    assets.value = assets.value.filter(a => a.id !== assetId)
    
    calculateStats()
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Asset deleted successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error deleting asset:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete asset',
        life: 3000
      })
    }
  }
}

// Generate memory book
const generateMemoryBook = async () => {
  try {
    const approvedAssets = assets.value.filter(a => a.approved)
    
    if (approvedAssets.length === 0) {
      if (toast) {
        toast.add({
          severity: 'warn',
          summary: 'No Assets',
          detail: 'No approved assets to include in memory book',
          life: 3000
        })
      }
      return
    }

    // Navigate to memory books page with pre-selected assets
    await navigateTo('/app/memory-books', {
      query: {
        assets: approvedAssets.map(a => a.id).join(',')
      }
    })
    
  } catch (error) {
    console.error('Error generating memory book:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate memory book',
        life: 3000
      })
    }
  }
}

// Edit dialog functions
const openEditDialog = async (asset) => {
  editingAsset.value = { ...asset }
  showEditDialog.value = true
  newTag.value = ''
  newPerson.value = ''
  
  // Preload suggestions for better UX
  try {
    const allTags = await db.assets.getAllTags()
    const allPeople = await db.assets.getAllPeople()
    tagSuggestions.value = allTags
    peopleSuggestions.value = allPeople
  } catch (error) {
    console.error('Error preloading suggestions:', error)
  }
}

const addUserTag = () => {
  if (newTag.value.trim() && !editingAsset.value.user_tags?.includes(newTag.value.trim())) {
    if (!editingAsset.value.user_tags) {
      editingAsset.value.user_tags = []
    }
    editingAsset.value.user_tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeUserTag = (tag) => {
  editingAsset.value.user_tags = editingAsset.value.user_tags.filter(t => t !== tag)
}

const addUserPerson = () => {
  if (newPerson.value.trim() && !editingAsset.value.user_people?.includes(newPerson.value.trim())) {
    if (!editingAsset.value.user_people) {
      editingAsset.value.user_people = []
    }
    editingAsset.value.user_people.push(newPerson.value.trim())
    newPerson.value = ''
  }
}

const removeUserPerson = (person) => {
  editingAsset.value.user_people = editingAsset.value.user_people.filter(p => p !== person)
}

const searchTags = async (event) => {
  try {
    const allTags = await db.assets.getAllTags()
    if (event.query.trim() === '') {
      // Show all tags when input is empty
      tagSuggestions.value = allTags
    } else {
      // Filter tags based on query
      tagSuggestions.value = allTags.filter(tag => 
        tag.toLowerCase().includes(event.query.toLowerCase())
      )
    }
  } catch (error) {
    console.error('Error searching tags:', error)
    tagSuggestions.value = []
  }
}

const searchPeople = async (event) => {
  try {
    const allPeople = await db.assets.getAllPeople()
    if (event.query.trim() === '') {
      // Show all people when input is empty
      peopleSuggestions.value = allPeople
    } else {
      // Filter people based on query
      peopleSuggestions.value = allPeople.filter(person => 
        person.toLowerCase().includes(event.query.toLowerCase())
      )
    }
  } catch (error) {
    console.error('Error searching people:', error)
    peopleSuggestions.value = []
  }
}

const saveAssetChanges = async () => {
  try {
    const updates = {
      title: editingAsset.value.title,
      user_caption: editingAsset.value.user_caption,
      user_tags: editingAsset.value.user_tags || [],
      user_people: editingAsset.value.user_people || []
    }
    
    await db.assets.updateAsset(editingAsset.value.id, updates)
    
    // Update local state
    const asset = assets.value.find(a => a.id === editingAsset.value.id)
    if (asset) {
      Object.assign(asset, updates)
    }
    
    showEditDialog.value = false
    editingAsset.value = null
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Saved',
        detail: 'Asset updated successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error saving asset changes:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save changes',
        life: 3000
      })
    }
  }
}

const unapproveAsset = async () => {
  try {
    await db.assets.approveAsset(editingAsset.value.id, false)
    
    // Update local state
    const asset = assets.value.find(a => a.id === editingAsset.value.id)
    if (asset) {
      asset.approved = false
    }
    editingAsset.value.approved = false
    
    calculateStats()
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'Unapproved',
        detail: 'Asset unapproved',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error unapproving asset:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to unapprove asset',
        life: 3000
      })
    }
  }
}

const rerunAI = async () => {
  try {
    aiProcessing.value = true
    
    const result = await db.assets.rerunAI(editingAsset.value.id)
    
    // Get the updated asset directly from the database
    const { data: updatedAsset, error } = await useNuxtApp().$supabase
      .from('assets')
      .select('*')
      .eq('id', editingAsset.value.id)
      .single()
    
    if (error) {
      throw new Error(`Failed to fetch updated asset: ${error.message}`)
    }
    
    if (updatedAsset) {
      // Update local state
      const localAsset = assets.value.find(a => a.id === editingAsset.value.id)
      if (localAsset) {
        Object.assign(localAsset, updatedAsset)
      }
      
      // Update editing asset
      Object.assign(editingAsset.value, updatedAsset)
    }
    
    calculateStats()
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'AI Updated',
        detail: 'AI analysis completed successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error rerunning AI:', error)
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to rerun AI analysis',
        life: 3000
      })
    }
  } finally {
    aiProcessing.value = false
  }
}

const rerunAIOnAllPhotos = async () => {
  try {
    rerunningAI.value = true
    showRerunAIDialog.value = false
    showProgressDialog.value = true
    
    // Initialize progress and start time
    rerunProgress.value = {
      current: 0,
      total: assets.value.length,
      currentAsset: null
    }
    startTime.value = Date.now()
    
    // Process each asset sequentially
    for (let i = 0; i < assets.value.length; i++) {
      const asset = assets.value[i]
      rerunProgress.value.current = i + 1
      rerunProgress.value.currentAsset = asset
      
      try {
        console.log(`Processing asset ${i + 1}/${assets.value.length}: ${asset.id}`)
        
        // Call the rerun AI endpoint
        const result = await db.assets.rerunAI(asset.id)
        
        // Get the updated asset from the database
        const { data: updatedAsset, error } = await useNuxtApp().$supabase
          .from('assets')
          .select('*')
          .eq('id', asset.id)
          .single()
        
        if (error) {
          console.warn(`Failed to fetch updated asset ${asset.id}:`, error)
          continue
        }
        
        if (updatedAsset) {
          // Update local state
          const localAsset = assets.value.find(a => a.id === asset.id)
          if (localAsset) {
            Object.assign(localAsset, updatedAsset)
          }
        }
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`Error processing asset ${asset.id}:`, error)
        // Continue with next asset even if one fails
      }
    }
    
    // Recalculate stats after all processing is done
    calculateStats()
    
    // Close progress dialog
    showProgressDialog.value = false
    
    if (toast) {
      toast.add({
        severity: 'success',
        summary: 'AI Processing Complete',
        detail: `Successfully reprocessed ${assets.value.length} photos with AI`,
        life: 3000
      })
    }
    
  } catch (error) {
    console.error('Error in bulk AI processing:', error)
    
    // Close progress dialog on error
    showProgressDialog.value = false
    
    if (toast) {
      toast.add({
        severity: 'error',
        summary: 'Processing Error',
        detail: 'Some photos may not have been processed correctly',
        life: 3000
      })
    }
  } finally {
    rerunningAI.value = false
    rerunProgress.value = {
      current: 0,
      total: 0,
      currentAsset: null
    }
    startTime.value = null
  }
}

// Details dialog functions
function openDetailsDialog(asset) {
  detailsAsset.value = asset
  showDetailsDialog.value = true
}

// Helper function to extract image name from storage URL
const getImageName = (storageUrl) => {
  if (!storageUrl) return null
  
  try {
    // Extract filename from URL
    const url = new URL(storageUrl)
    const pathParts = url.pathname.split('/')
    const filename = pathParts[pathParts.length - 1]
    
    // Remove timestamp prefix if present (format: timestamp-filename)
    const timestampRegex = /^\d+-/
    return filename.replace(timestampRegex, '')
  } catch (error) {
    console.error('Error parsing storage URL:', error)
    return null
  }
}

// Watch for changes to recalculate stats
watch(assets, calculateStats, { deep: true })
</script> 

<style scoped>
.details-dialog {
  /* Fullscreen on mobile, max width on desktop */
  @media (max-width: 640px) {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
}
</style> 