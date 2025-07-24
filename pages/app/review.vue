<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex-1 flex items-center gap-2 sm:gap-3">
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-primary">Manage your Moments (Photos and Posts)</h1>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition-colors focus:outline-none flex-shrink-0"
            v-tooltip.top="'How to use this page'"
            @click="showHelpModal = true"
            aria-label="Information about review page"
          >
            <i class="pi pi-info text-lg text-brand-highlight"></i>
          </button>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button
            v-if="stats.pending > 0"
            class="flex items-center justify-center gap-2 bg-brand-highlight hover:bg-brand-highlight/80 text-white font-bold rounded-full px-4 sm:px-6 py-3 text-sm sm:text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="approveAllPending"
            :disabled="approvingAll"
          >
            <i class="pi pi-check text-lg sm:text-2xl" :class="{ 'animate-spin': approvingAll }"></i>
            <span class="hidden sm:inline">Approve All ({{ stats.pending }})</span>
            <span class="sm:hidden">Approve All</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 bg-brand-header hover:bg-brand-secondary text-white font-bold rounded-full px-4 sm:px-8 py-3 text-sm sm:text-lg shadow transition-all duration-200 w-full sm:w-auto"
            @click="navigateTo('/app/deleted-memories')"
          >
            <i class="pi pi-trash text-lg sm:text-2xl animate-bounce"></i>
            <span class="hidden sm:inline">Trash</span>
            <span class="sm:hidden">Trash</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-image text-brand-secondary text-2xl mb-2"></i>
          <div class="text-sm text-brand-primary/70">Total</div>
          <div class="text-xl font-bold text-brand-primary">{{ stats.total }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-clock text-yellow-500 text-2xl mb-2"></i>
          <div class="text-sm text-brand-primary/70">Pending</div>
          <div class="text-xl font-bold text-brand-primary">{{ stats.pending }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-check text-brand-highlight text-2xl mb-2"></i>
          <div class="text-sm text-brand-primary/70">Approved</div>
          <div class="text-xl font-bold text-brand-primary">{{ stats.approved }}</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
          <i class="pi pi-book text-brand-secondary text-2xl mb-2"></i>
          <div class="text-sm text-brand-primary/70">Ready for Book</div>
          <div class="text-xl font-bold text-brand-primary">{{ stats.readyForBook }}</div>
        </div>
      </div>

      <!-- Filters -->
      <Card class="mb-8">
        <template #content>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-brand-primary">Filter:</label>
              <Dropdown
                v-model="activeFilter"
                :options="filterOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Filter"
                class="w-60"
              />
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-brand-primary">Type:</label>
              <Dropdown
                v-model="typeFilter"
                :options="typeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Type"
                class="w-60"
              />
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-brand-primary">Sort:</label>
              <Dropdown
                v-model="sortBy"
                :options="sortOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Sort"
                class="w-60"
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
          class="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-shadow border border-gray-100 h-[500px] sm:h-[600px]"
          style="display: flex; flex-direction: column;"
        >
          <!-- Photo Section - Fixed Height -->
          <div class="rounded-t-xl sm:rounded-t-2xl overflow-hidden bg-gray-100 h-[150px] sm:h-[200px]" style="flex-shrink: 0;">
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

          <!-- Content Section - Flexible Height -->
          <div class="flex-1 p-2 sm:p-3 overflow-y-auto" style="min-height: 0;">
            <!-- Title -->
            <!-- <div class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Title</label>
              <div class="text-xs sm:text-sm font-medium text-gray-900 bg-yellow-50 rounded p-1.5 sm:p-2 border border-yellow-200">
                {{ asset.title || getImageName(asset.storage_url) || 'Untitled' }}
              </div>
            </div> -->

            <!-- User Caption -->
            <!-- <div class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Your Caption</label>
              <div v-if="asset.user_caption && asset.user_caption !== getImageName(asset.storage_url)" class="text-xs sm:text-sm text-gray-900 bg-blue-50 rounded p-1.5 sm:p-2 border border-blue-200">
                {{ asset.user_caption }}
              </div>
              <div v-else class="text-xs sm:text-sm text-gray-400 italic bg-gray-50 rounded p-1.5 sm:p-2 border border-gray-200">
                No caption added
              </div>
            </div> -->

            <!-- AI Caption -->
            <div v-if="asset.ai_caption" class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-brand-primary mb-1">AI Caption</label>
              <div class="italic text-xs sm:text-sm text-brand-primary/70 bg-brand-navigation/20 rounded p-1.5 sm:p-2 border border-brand-primary/20">"{{ asset.ai_caption }}"</div>
            </div>

            <!-- Tags -->
            <div v-if="(asset.tags && asset.tags.length > 0) || (asset.user_tags && asset.user_tags.length > 0)" class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-brand-primary mb-1">Tags</label>
              <div class="flex flex-wrap gap-1">
                <Chip
                  v-for="tag in asset.tags || []"
                  :key="`ai-${tag}`"
                  :label="tag"
                  class="text-xs bg-brand-primary/10 text-brand-primary px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
                <Chip
                  v-for="tag in asset.user_tags || []"
                  :key="`user-${tag}`"
                  :label="tag"
                  class="text-xs bg-brand-highlight/20 text-brand-highlight px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
              </div>
            </div>

            <!-- People Detected -->
            <div v-if="(asset.people_detected && asset.people_detected.length > 0) || (asset.user_people && asset.user_people.length > 0)" class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-brand-primary mb-1">People/Objects</label>
              <div class="flex flex-wrap gap-1">
                <Chip
                  v-for="person in asset.people_detected || []"
                  :key="`ai-${person}`"
                  :label="person"
                  class="text-xs bg-brand-primary/10 text-brand-primary px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
                <Chip
                  v-for="person in asset.user_people || []"
                  :key="`user-${person}`"
                  :label="person"
                  class="text-xs bg-brand-accent/20 text-brand-accent px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
              </div>
            </div>

            <!-- Location -->
            <div v-if="asset.city || asset.state || asset.country" class="mb-2">
              <label class="block text-xs sm:text-sm font-semibold text-brand-primary mb-1">Location</label>
              <div class="flex flex-wrap gap-1">
                <Chip
                  v-if="asset.city"
                  :label="asset.city"
                  class="text-xs bg-brand-highlight/20 text-brand-highlight px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
                <Chip
                  v-if="asset.state"
                  :label="asset.state"
                  class="text-xs bg-brand-secondary/20 text-brand-secondary px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
                <Chip
                  v-if="asset.country"
                  :label="asset.country"
                  class="text-xs bg-brand-header/20 text-brand-header px-1.5 sm:px-2 py-0.5 sm:py-1"
                />
              </div>
            </div>
          </div>

          <!-- Action Bar - Fixed at Bottom -->
          <div class="rounded-b-xl sm:rounded-b-2xl bg-gradient-to-r from-brand-highlight/20 via-brand-accent/20 to-brand-secondary/20 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 border-t border-brand-primary/20 h-[70px] sm:h-[80px]" style="flex-shrink: 0;">
            <div class="flex items-center gap-2 sm:gap-4 flex-1 justify-center">
              <div v-if="!asset.approved" class="flex flex-col items-center cursor-pointer group" @click="approveAsset(asset.id)" v-tooltip.top="'Approve'">
                <i class="pi pi-check text-2xl sm:text-3xl text-brand-highlight group-hover:scale-125 transition-transform"></i>
                <span class="text-xs text-brand-highlight mt-0.5 sm:mt-1">Approve</span>
              </div>
              <div class="flex flex-col items-center cursor-pointer group" @click="openEditDialog(asset)" v-tooltip.top="'Edit'">
                <i class="pi pi-pencil text-2xl sm:text-3xl text-brand-secondary group-hover:scale-125 transition-transform"></i>
                <span class="text-xs text-brand-secondary mt-0.5 sm:mt-1">Edit</span>
              </div>
                                <div class="flex flex-col items-center cursor-pointer group" @click="deleteAsset(asset.id)" v-tooltip.top="'Trash'">
                    <i class="pi pi-trash text-2xl sm:text-3xl text-red-500 group-hover:scale-125 transition-transform"></i>
                    <span class="text-xs text-red-700 mt-0.5 sm:mt-1">Trash</span>
                  </div>
            </div>
            <div>
              <span v-if="!asset.approved && !asset.rejected" class="inline-block px-2 sm:px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 font-semibold text-xs shadow">Pending</span>
              <span v-else-if="asset.approved" class="inline-block px-2 sm:px-3 py-1 rounded-full bg-brand-highlight/20 text-brand-highlight font-semibold text-xs shadow">Approved</span>
              <span v-else-if="asset.rejected" class="inline-block px-2 sm:px-3 py-1 rounded-full bg-red-200 text-red-800 font-semibold text-xs shadow">Rejected</span>
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
            
            <div class="w-full lg:w-2/3 space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-semibold text-brand-primary mb-2">Title</label>
                <InputText
                  v-model="editingAsset.title"
                  placeholder="Add a title for this memory"
                  class="w-full"
                />
              </div>

              <!-- User Caption -->
              <div>
                <label class="block text-sm font-semibold text-brand-primary mb-2">Your Caption</label>
                <Textarea
                  v-model="editingAsset.user_caption"
                  placeholder="Add your caption"
                  class="w-full"
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
                  class="w-full"
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
                  class="w-full"
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
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                @click="unapproveAsset"
                :disabled="!editingAsset.approved"
                class="flex items-center justify-center gap-2 bg-brand-primary/20 hover:bg-brand-primary/30 disabled:bg-brand-primary/10 disabled:cursor-not-allowed text-brand-primary font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
              >
                <i class="pi pi-times text-xl"></i>
                Unapprove
              </button>
              <button
                @click="rerunAI"
                :disabled="aiProcessing"
                class="flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-secondary/80 disabled:bg-brand-secondary/50 disabled:cursor-not-allowed text-white font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
              >
                <i class="pi pi-refresh text-xl" :class="{ 'animate-spin': aiProcessing }"></i>
                Rerun AI
              </button>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                @click="showEditDialog = false"
                class="flex items-center justify-center gap-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
              >
                <i class="pi pi-times text-xl"></i>
                Cancel
              </button>
              <button
                @click="saveAssetChanges"
                class="flex items-center justify-center gap-2 bg-brand-highlight hover:bg-brand-highlight/80 text-white font-bold rounded-full px-6 py-3 text-lg shadow transition-all duration-200 w-full sm:w-auto"
              >
                <i class="pi pi-check text-xl"></i>
                Save Changes
              </button>
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
          <div class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                <i class="pi pi-rocket text-pink-600 text-lg"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">🚀 Powerful Page Actions</h3>
                <p class="text-gray-600">Unleash the full power of your memory workshop with these special tools!</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-4 border border-pink-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-book text-purple-500"></i>
                  <span class="font-semibold text-gray-800">Compose Special Memory</span>
                </div>
                <p class="text-sm text-gray-600">Create a beautiful memory book from your approved special moments</p>
              </div>
              <div class="bg-white rounded-xl p-4 border border-pink-100">
                <div class="flex items-center gap-2 mb-2">
                  <i class="pi pi-trash text-pink-500"></i>
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
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default'
})

const { $toast } = useNuxtApp()
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

// Edit dialog data
const showEditDialog = ref(false)
const editingAsset = ref(null)
const newTag = ref('')
const newPerson = ref('')
const tagSuggestions = ref([])
const peopleSuggestions = ref([])
const aiProcessing = ref(false)
const approvingAll = ref(false)

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
    if ($toast && $toast.add) {
      $toast.add({
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
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Caption updated successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error updating caption:', error)
    if ($toast && $toast.add) {
      $toast.add({
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
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Approved',
        detail: 'Asset approved successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error approving asset:', error)
    if ($toast && $toast.add) {
      $toast.add({
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
      if ($toast && $toast.add) {
        $toast.add({
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
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'All Approved',
        detail: `Successfully approved ${pendingAssets.length} assets`,
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error approving all assets:', error)
    if ($toast && $toast.add) {
      $toast.add({
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
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Rejected',
        detail: 'Asset rejected',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error rejecting asset:', error)
    if ($toast && $toast.add) {
      $toast.add({
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
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Asset deleted successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error deleting asset:', error)
    if ($toast && $toast.add) {
      $toast.add({
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
      if ($toast && $toast.add) {
        $toast.add({
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
    if ($toast && $toast.add) {
      $toast.add({
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
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Saved',
        detail: 'Asset updated successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error saving asset changes:', error)
    if ($toast && $toast.add) {
      $toast.add({
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
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'Unapproved',
        detail: 'Asset unapproved',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error unapproving asset:', error)
    if ($toast && $toast.add) {
      $toast.add({
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
    
    if ($toast && $toast.add) {
      $toast.add({
        severity: 'success',
        summary: 'AI Updated',
        detail: 'AI analysis completed successfully',
        life: 2000
      })
    }
  } catch (error) {
    console.error('Error rerunning AI:', error)
    if ($toast && $toast.add) {
      $toast.add({
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