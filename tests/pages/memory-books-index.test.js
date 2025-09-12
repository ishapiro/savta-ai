import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import MemoryBooksIndex from '~/pages/app/memory-books/index.vue'

// Mock the composables
vi.mock('~/composables/useMemoryStudio', () => ({
  useMemoryStudio: () => ({
    memoryCards: { value: [] },
    memoryBooksOnly: { value: [] },
    totalCardsPages: { value: 1 },
    totalBooksPages: { value: 1 },
    paginatedMemoryCards: { value: [] },
    paginatedMemoryBooks: { value: [] },
    currentCardsPage: { value: 1 },
    currentBooksPage: { value: 1 },
    cardsPerPage: { value: 12 },
    booksPerPage: { value: 12 },
    loadMemoryBooks: vi.fn()
  })
}))

vi.mock('~/composables/useMemoryStudioUI', () => ({
  useMemoryStudioUI: () => ({
    activeView: { value: 'cards' },
    showCreateModal: { value: false },
    showSuccessDialog: { value: false },
    showProgressDialog: { value: false },
    showApprovalDialog: { value: false },
    showDeleteDialog: { value: false },
    showMemoryBooksInfoBubble: { value: false },
    showMagicMemoryDialog: { value: false },
    creatingBook: { value: false },
    currentProgress: { value: 0 },
    currentProgressMessage: { value: '' },
    pendingApprovalBookId: { value: null },
    bookToDelete: { value: null },
    closeCreateModal: vi.fn(),
    resetCreateModal: vi.fn()
  })
}))

vi.mock('~/composables/useMemoryBookOperations', () => ({
  useMemoryBookOperations: () => ({
    createMemoryBook: vi.fn(),
    approveBook: vi.fn(),
    unapproveBook: vi.fn(),
    deleteBook: vi.fn(),
    viewBookDetails: vi.fn(),
    viewPDF: vi.fn()
  })
}))

// Mock the components
vi.mock('~/components/ViewToggle.vue', () => ({
  default: {
    name: 'ViewToggle',
    template: '<div data-testid="view-toggle">View Toggle</div>',
    props: ['activeView'],
    emits: ['update:activeView']
  }
}))

vi.mock('~/components/MemoryStudioHero.vue', () => ({
  default: {
    name: 'MemoryStudioHero',
    template: '<div data-testid="memory-studio-hero">Hero Section</div>',
    props: ['activeView'],
    emits: ['create-card', 'create-book']
  }
}))

vi.mock('~/components/MemoryStudioPagination.vue', () => ({
  default: {
    name: 'MemoryStudioPagination',
    template: '<div data-testid="memory-studio-pagination">Pagination</div>',
    props: ['currentPage', 'totalPages', 'totalItems', 'itemsPerPage', 'activeView'],
    emits: ['previous-page', 'next-page', 'go-to-page']
  }
}))

vi.mock('~/components/MemoryStudioEmptyState.vue', () => ({
  default: {
    name: 'MemoryStudioEmptyState',
    template: '<div data-testid="memory-studio-empty-state">Empty State</div>',
    props: ['activeView'],
    emits: ['create-card', 'create-book']
  }
}))

vi.mock('~/components/MemoryCard.vue', () => ({
  default: {
    name: 'MemoryCard',
    template: '<div data-testid="memory-card">Memory Card</div>',
    props: ['card'],
    emits: ['generate', 'approve', 'unapprove', 'download', 'view-details']
  }
}))

vi.mock('~/components/MemoryBook.vue', () => ({
  default: {
    name: 'MemoryBook',
    template: '<div data-testid="memory-book">Memory Book</div>',
    props: ['book'],
    emits: ['generate', 'approve', 'unapprove', 'view', 'edit', 'delete']
  }
}))

// Mock PrimeVue components
vi.mock('primevue/dialog', () => ({
  default: {
    name: 'Dialog',
    template: '<div data-testid="dialog"><slot /></div>',
    props: ['visible', 'modal', 'closable', 'dismissableMask'],
    emits: ['update:visible']
  }
}))

vi.mock('primevue/progressbar', () => ({
  default: {
    name: 'ProgressBar',
    template: '<div data-testid="progress-bar">Progress Bar</div>',
    props: ['value', 'showValue']
  }
}))

// Mock MemoryBookDialog
vi.mock('~/components/MemoryBookDialog.vue', () => ({
  default: {
    name: 'MemoryBookDialog',
    template: '<div data-testid="memory-book-dialog">Memory Book Dialog</div>',
    props: ['visible', 'isEditing', 'initialData', 'loading'],
    emits: ['close', 'create']
  }
}))

describe('MemoryBooksIndex', () => {
  let router
  let wrapper

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/app/memory-books', component: MemoryBooksIndex },
        { path: '/app/trash', component: { template: '<div>Trash</div>' } }
      ]
    })

    wrapper = mount(MemoryBooksIndex, {
      global: {
        plugins: [router],
        stubs: {
          'router-link': true
        }
      }
    })
  })

  it('should render the main container', () => {
    expect(wrapper.find('.min-h-screen.bg-brand-background').exists()).toBe(true)
  })

  it('should render the header with title and info button', () => {
    expect(wrapper.find('h1').text()).toBe('Memory Studio')
    expect(wrapper.find('[data-testid="info-button"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="trash-button"]').exists()).toBe(true)
  })

  it('should render the view toggle component', () => {
    expect(wrapper.find('[data-testid="view-toggle"]').exists()).toBe(true)
  })

  it('should render the hero section', () => {
    expect(wrapper.find('[data-testid="memory-studio-hero"]').exists()).toBe(true)
  })

  it('should render the listing section with correct title for cards view', () => {
    expect(wrapper.find('h2').text()).toBe('Your Memory Cards')
  })

  it('should show loading state when loading', async () => {
    const { useMemoryStudio } = await import('~/composables/useMemoryStudio')
    useMemoryStudio.mockReturnValue({
      memoryCards: { value: [] },
      memoryBooksOnly: { value: [] },
      totalCardsPages: { value: 1 },
      totalBooksPages: { value: 1 },
      paginatedMemoryCards: { value: [] },
      paginatedMemoryBooks: { value: [] },
      currentCardsPage: { value: 1 },
      currentBooksPage: { value: 1 },
      cardsPerPage: { value: 12 },
      booksPerPage: { value: 12 },
      loadMemoryBooks: vi.fn(),
      loadingMemoryBooks: { value: true }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.pi-spin.pi-spinner').exists()).toBe(true)
  })

  it('should show empty state when no items', async () => {
    const { useMemoryStudio } = await import('~/composables/useMemoryStudio')
    useMemoryStudio.mockReturnValue({
      memoryCards: { value: [] },
      memoryBooksOnly: { value: [] },
      totalCardsPages: { value: 1 },
      totalBooksPages: { value: 1 },
      paginatedMemoryCards: { value: [] },
      paginatedMemoryBooks: { value: [] },
      currentCardsPage: { value: 1 },
      currentBooksPage: { value: 1 },
      cardsPerPage: { value: 12 },
      booksPerPage: { value: 12 },
      loadMemoryBooks: vi.fn(),
      loadingMemoryBooks: { value: false }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="memory-studio-empty-state"]').exists()).toBe(true)
  })

  it('should render memory cards when in cards view', async () => {
    const mockCards = [
      { id: 'card-1', format: 'card', ai_supplemental_prompt: 'Test Card 1' },
      { id: 'card-2', format: 'card', ai_supplemental_prompt: 'Test Card 2' }
    ]

    const { useMemoryStudio } = await import('~/composables/useMemoryStudio')
    useMemoryStudio.mockReturnValue({
      memoryCards: { value: mockCards },
      memoryBooksOnly: { value: [] },
      totalCardsPages: { value: 1 },
      totalBooksPages: { value: 1 },
      paginatedMemoryCards: { value: mockCards },
      paginatedMemoryBooks: { value: [] },
      currentCardsPage: { value: 1 },
      currentBooksPage: { value: 1 },
      cardsPerPage: { value: 12 },
      booksPerPage: { value: 12 },
      loadMemoryBooks: vi.fn(),
      loadingMemoryBooks: { value: false }
    })

    await wrapper.vm.$nextTick()
    const memoryCards = wrapper.findAll('[data-testid="memory-card"]')
    expect(memoryCards).toHaveLength(2)
  })

  it('should render memory books when in books view', async () => {
    const mockBooks = [
      { id: 'book-1', format: 'book', ai_supplemental_prompt: 'Test Book 1' },
      { id: 'book-2', format: 'book', ai_supplemental_prompt: 'Test Book 2' }
    ]

    const { useMemoryStudio } = await import('~/composables/useMemoryStudio')
    const { useMemoryStudioUI } = await import('~/composables/useMemoryStudioUI')
    
    useMemoryStudio.mockReturnValue({
      memoryCards: { value: [] },
      memoryBooksOnly: { value: mockBooks },
      totalCardsPages: { value: 1 },
      totalBooksPages: { value: 1 },
      paginatedMemoryCards: { value: [] },
      paginatedMemoryBooks: { value: mockBooks },
      currentCardsPage: { value: 1 },
      currentBooksPage: { value: 1 },
      cardsPerPage: { value: 12 },
      booksPerPage: { value: 12 },
      loadMemoryBooks: vi.fn(),
      loadingMemoryBooks: { value: false }
    })

    useMemoryStudioUI.mockReturnValue({
      activeView: { value: 'books' },
      showCreateModal: { value: false },
      showSuccessDialog: { value: false },
      showProgressDialog: { value: false },
      showApprovalDialog: { value: false },
      showDeleteDialog: { value: false },
      showMemoryBooksInfoBubble: { value: false },
      showMagicMemoryDialog: { value: false },
      creatingBook: { value: false },
      currentProgress: { value: 0 },
      currentProgressMessage: { value: '' },
      pendingApprovalBookId: { value: null },
      bookToDelete: { value: null },
      closeCreateModal: vi.fn(),
      resetCreateModal: vi.fn()
    })

    await wrapper.vm.$nextTick()
    const memoryBooks = wrapper.findAll('[data-testid="memory-book"]')
    expect(memoryBooks).toHaveLength(2)
  })

  it('should render pagination when items exceed per page limit', async () => {
    const mockCards = Array.from({ length: 15 }, (_, i) => ({
      id: `card-${i}`,
      format: 'card',
      ai_supplemental_prompt: `Test Card ${i}`
    }))

    const { useMemoryStudio } = await import('~/composables/useMemoryStudio')
    useMemoryStudio.mockReturnValue({
      memoryCards: { value: mockCards },
      memoryBooksOnly: { value: [] },
      totalCardsPages: { value: 2 },
      totalBooksPages: { value: 1 },
      paginatedMemoryCards: { value: mockCards.slice(0, 12) },
      paginatedMemoryBooks: { value: [] },
      currentCardsPage: { value: 1 },
      currentBooksPage: { value: 1 },
      cardsPerPage: { value: 12 },
      booksPerPage: { value: 12 },
      loadMemoryBooks: vi.fn(),
      loadingMemoryBooks: { value: false }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="memory-studio-pagination"]').exists()).toBe(true)
  })

  it('should navigate to trash when trash button is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push')
    const trashButton = wrapper.find('[data-testid="trash-button"]')
    
    await trashButton.trigger('click')
    
    expect(pushSpy).toHaveBeenCalledWith('/app/trash')
  })

  it('should show info dialog when info button is clicked', async () => {
    const { useMemoryStudioUI } = await import('~/composables/useMemoryStudioUI')
    const mockUI = {
      activeView: { value: 'cards' },
      showCreateModal: { value: false },
      showSuccessDialog: { value: false },
      showProgressDialog: { value: false },
      showApprovalDialog: { value: false },
      showDeleteDialog: { value: false },
      showMemoryBooksInfoBubble: { value: false },
      showMagicMemoryDialog: { value: false },
      creatingBook: { value: false },
      currentProgress: { value: 0 },
      currentProgressMessage: { value: '' },
      pendingApprovalBookId: { value: null },
      bookToDelete: { value: null },
      closeCreateModal: vi.fn(),
      resetCreateModal: vi.fn()
    }
    
    useMemoryStudioUI.mockReturnValue(mockUI)
    
    const infoButton = wrapper.find('[data-testid="info-button"]')
    await infoButton.trigger('click')
    
    expect(mockUI.showMemoryBooksInfoBubble.value).toBe(true)
  })

  it('should handle view change correctly', async () => {
    const { useMemoryStudioUI } = await import('~/composables/useMemoryStudioUI')
    const mockUI = {
      activeView: { value: 'cards' },
      showCreateModal: { value: false },
      showSuccessDialog: { value: false },
      showProgressDialog: { value: false },
      showApprovalDialog: { value: false },
      showDeleteDialog: { value: false },
      showMemoryBooksInfoBubble: { value: false },
      showMagicMemoryDialog: { value: false },
      creatingBook: { value: false },
      currentProgress: { value: 0 },
      currentProgressMessage: { value: '' },
      pendingApprovalBookId: { value: null },
      bookToDelete: { value: null },
      closeCreateModal: vi.fn(),
      resetCreateModal: vi.fn()
    }
    
    useMemoryStudioUI.mockReturnValue(mockUI)
    
    await wrapper.vm.onViewChange('books')
    
    expect(mockUI.activeView.value).toBe('books')
  })

  it('should handle pagination correctly', async () => {
    const { useMemoryStudio } = await import('~/composables/useMemoryStudio')
    const mockStudio = {
      memoryCards: { value: [] },
      memoryBooksOnly: { value: [] },
      totalCardsPages: { value: 2 },
      totalBooksPages: { value: 1 },
      paginatedMemoryCards: { value: [] },
      paginatedMemoryBooks: { value: [] },
      currentCardsPage: { value: 1 },
      currentBooksPage: { value: 1 },
      cardsPerPage: { value: 12 },
      booksPerPage: { value: 12 },
      loadMemoryBooks: vi.fn(),
      loadingMemoryBooks: { value: false }
    }
    
    useMemoryStudio.mockReturnValue(mockStudio)
    
    await wrapper.vm.onNextPage()
    expect(mockStudio.currentCardsPage.value).toBe(2)
    
    await wrapper.vm.onPreviousPage()
    expect(mockStudio.currentCardsPage.value).toBe(1)
    
    await wrapper.vm.onGoToPage(2)
    expect(mockStudio.currentCardsPage.value).toBe(2)
  })
})
