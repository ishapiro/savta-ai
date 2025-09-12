import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MemoryCard from '~/components/MemoryCard.vue'

// Mock lucide-vue-next
vi.mock('lucide-vue-next', () => ({
  Wand2: {
    name: 'Wand2',
    template: '<div data-testid="wand-icon">Wand2</div>'
  },
  Sparkle: {
    name: 'Sparkle',
    template: '<div data-testid="sparkle-icon">Sparkle</div>'
  }
}))

// Mock the composable
vi.mock('~/composables/useMemoryStudio', () => ({
  useMemoryStudio: () => ({
    getFirstAssetThumbnail: vi.fn(() => 'thumbnail-url'),
    formatDate: vi.fn(() => 'Dec 25, 2023'),
    getStatusText: vi.fn((status) => status),
    getStatusBadgeClass: vi.fn(() => 'bg-amber-50 text-amber-700'),
    getStatusIcon: vi.fn(() => 'pi pi-pencil')
  })
}))

describe('MemoryCard', () => {
  const mockCard = {
    id: 'card-1',
    ai_supplemental_prompt: 'Test Memory Card',
    status: 'draft',
    created_at: '2023-12-25T10:30:00Z',
    created_from_assets: ['asset-1', 'asset-2'],
    magic_story: null,
    review_notes: null
  }

  it('should render with correct props', () => {
    const wrapper = mount(MemoryCard, {
      props: {
        card: mockCard
      }
    })

    expect(wrapper.find('.bg-brand-secondary').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Memory Card')
  })

  it('should display magic story when available', () => {
    const cardWithStory = {
      ...mockCard,
      magic_story: 'This is a magic story about the memory card.'
    }

    const wrapper = mount(MemoryCard, {
      props: {
        card: cardWithStory
      }
    })

    expect(wrapper.text()).toContain('This is a magic story about the memory card.')
    expect(wrapper.find('[data-testid="sparkle-icon"]').exists()).toBe(true)
  })

  it('should display photo thumbnail when no magic story', () => {
    const wrapper = mount(MemoryCard, {
      props: {
        card: mockCard
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('thumbnail-url')
    expect(img.attributes('alt')).toBe('Test Memory Card')
  })

  it('should display correct status badge', () => {
    const wrapper = mount(MemoryCard, {
      props: {
        card: mockCard
      }
    })

    const statusBadge = wrapper.find('.inline-flex.items-center.gap-1')
    expect(statusBadge.exists()).toBe(true)
    expect(statusBadge.classes()).toContain('bg-amber-50')
  })

  it('should display creation date and photo count', () => {
    const wrapper = mount(MemoryCard, {
      props: {
        card: mockCard
      }
    })

    expect(wrapper.text()).toContain('Dec 25, 2023')
    expect(wrapper.text()).toContain('2')
  })

  it('should display review notes when available', () => {
    const cardWithNotes = {
      ...mockCard,
      review_notes: 'These are review notes for the card.'
    }

    const wrapper = mount(MemoryCard, {
      props: {
        card: cardWithNotes
      }
    })

    expect(wrapper.text()).toContain('These are review notes for the card.')
  })

  describe('action buttons', () => {
    it('should show compose button for draft status', () => {
      const wrapper = mount(MemoryCard, {
        props: {
          card: { ...mockCard, status: 'draft' }
        }
      })

      const composeButton = wrapper.find('[data-testid="compose-button"]')
      expect(composeButton.exists()).toBe(true)
      expect(composeButton.text()).toContain('Compose')
    })

    it('should show "Create Story" button when magic story exists', () => {
      const cardWithStory = {
        ...mockCard,
        status: 'draft',
        magic_story: 'Test story'
      }

      const wrapper = mount(MemoryCard, {
        props: {
          card: cardWithStory
        }
      })

      const composeButton = wrapper.find('[data-testid="compose-button"]')
      expect(composeButton.text()).toContain('Create Story')
    })

    it('should show approve button for ready status', () => {
      const wrapper = mount(MemoryCard, {
        props: {
          card: { ...mockCard, status: 'ready' }
        }
      })

      const approveButton = wrapper.find('[data-testid="approve-button"]')
      expect(approveButton.exists()).toBe(true)
      expect(approveButton.text()).toContain('Print and Mail')
    })

    it('should show unapprove button for approved status', () => {
      const wrapper = mount(MemoryCard, {
        props: {
          card: { ...mockCard, status: 'approved' }
        }
      })

      const unapproveButton = wrapper.find('[data-testid="unapprove-button"]')
      expect(unapproveButton.exists()).toBe(true)
      expect(unapproveButton.text()).toContain('Unapprove')
    })

    it('should show processing button for background_ready status', () => {
      const wrapper = mount(MemoryCard, {
        props: {
          card: { ...mockCard, status: 'background_ready' }
        }
      })

      const processingButton = wrapper.find('[data-testid="recreate-button"]')
      expect(processingButton.exists()).toBe(true)
      expect(processingButton.text()).toContain('Processing')
      expect(processingButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('events', () => {
    it('should emit generate event when compose button is clicked', async () => {
      const wrapper = mount(MemoryCard, {
        props: {
          card: { ...mockCard, status: 'draft' }
        }
      })

      const composeButton = wrapper.find('[data-testid="compose-button"]')
      await composeButton.trigger('click')

      expect(wrapper.emitted('generate')).toBeTruthy()
      expect(wrapper.emitted('generate')[0]).toEqual([mockCard])
    })

    it('should emit approve event when approve button is clicked', async () => {
      const wrapper = mount(MemoryCard, {
        props: {
          card: { ...mockCard, status: 'ready' }
        }
      })

      const approveButton = wrapper.find('[data-testid="approve-button"]')
      await approveButton.trigger('click')

      expect(wrapper.emitted('approve')).toBeTruthy()
      expect(wrapper.emitted('approve')[0]).toEqual(['card-1'])
    })

    it('should emit unapprove event when unapprove button is clicked', async () => {
      const wrapper = mount(MemoryCard, {
        props: {
          card: { ...mockCard, status: 'approved' }
        }
      })

      const unapproveButton = wrapper.find('[data-testid="unapprove-button"]')
      await unapproveButton.trigger('click')

      expect(wrapper.emitted('unapprove')).toBeTruthy()
      expect(wrapper.emitted('unapprove')[0]).toEqual(['card-1'])
    })

    it('should emit download event when view button is clicked', async () => {
      const wrapper = mount(MemoryCard, {
        props: {
          card: mockCard
        }
      })

      const viewButton = wrapper.find('[data-testid="view-button"]')
      await viewButton.trigger('click')

      expect(wrapper.emitted('download')).toBeTruthy()
      expect(wrapper.emitted('download')[0]).toEqual([mockCard])
    })

    it('should emit view-details event when details button is clicked', async () => {
      const wrapper = mount(MemoryCard, {
        props: {
          card: mockCard
        }
      })

      const detailsButton = wrapper.find('[data-testid="details-button"]')
      await detailsButton.trigger('click')

      expect(wrapper.emitted('view-details')).toBeTruthy()
      expect(wrapper.emitted('view-details')[0]).toEqual([mockCard])
    })
  })

  it('should truncate long prompts in title', () => {
    const cardWithLongPrompt = {
      ...mockCard,
      ai_supplemental_prompt: 'This is a very long prompt that should be truncated when it exceeds 25 characters'
    }

    const wrapper = mount(MemoryCard, {
      props: {
        card: cardWithLongPrompt
      }
    })

    expect(wrapper.text()).toContain('This is a very long pro...')
  })

  it('should use default title when no prompt provided', () => {
    const cardWithoutPrompt = {
      ...mockCard,
      ai_supplemental_prompt: null
    }

    const wrapper = mount(MemoryCard, {
      props: {
        card: cardWithoutPrompt
      }
    })

    expect(wrapper.text()).toContain('Memory Card')
  })

  it('should apply correct styling classes', () => {
    const wrapper = mount(MemoryCard, {
      props: {
        card: mockCard
      }
    })

    expect(wrapper.find('.bg-white.rounded-xl.shadow-sm').exists()).toBe(true)
    expect(wrapper.find('.bg-brand-secondary').exists()).toBe(true)
    expect(wrapper.find('.border.border-brand-surface-border').exists()).toBe(true)
  })
})
