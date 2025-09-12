import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ViewToggle from '~/components/ViewToggle.vue'

// Mock lucide-vue-next
vi.mock('lucide-vue-next', () => ({
  Sparkles: {
    name: 'Sparkles',
    template: '<div data-testid="sparkles-icon">Sparkles</div>'
  }
}))

describe('ViewToggle', () => {
  it('should render with correct initial state', () => {
    const wrapper = mount(ViewToggle, {
      props: {
        activeView: 'cards'
      }
    })

    expect(wrapper.find('[data-testid="toggle-cards"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="toggle-books"]').exists()).toBe(true)
  })

  it('should show cards as active when activeView is cards', () => {
    const wrapper = mount(ViewToggle, {
      props: {
        activeView: 'cards'
      }
    })

    const cardsButton = wrapper.find('[data-testid="toggle-cards"]')
    const booksButton = wrapper.find('[data-testid="toggle-books"]')

    expect(cardsButton.classes()).toContain('bg-brand-secondary')
    expect(cardsButton.classes()).toContain('text-white')
    expect(booksButton.classes()).toContain('text-brand-text-muted')
    expect(booksButton.classes()).not.toContain('bg-brand-highlight')
  })

  it('should show books as active when activeView is books', () => {
    const wrapper = mount(ViewToggle, {
      props: {
        activeView: 'books'
      }
    })

    const cardsButton = wrapper.find('[data-testid="toggle-cards"]')
    const booksButton = wrapper.find('[data-testid="toggle-books"]')

    expect(booksButton.classes()).toContain('bg-brand-highlight')
    expect(booksButton.classes()).toContain('text-white')
    expect(cardsButton.classes()).toContain('text-brand-text-muted')
    expect(cardsButton.classes()).not.toContain('bg-brand-secondary')
  })

  it('should emit update:activeView when cards button is clicked', async () => {
    const wrapper = mount(ViewToggle, {
      props: {
        activeView: 'books'
      }
    })

    const cardsButton = wrapper.find('[data-testid="toggle-cards"]')
    await cardsButton.trigger('click')

    expect(wrapper.emitted('update:activeView')).toBeTruthy()
    expect(wrapper.emitted('update:activeView')[0]).toEqual(['cards'])
  })

  it('should emit update:activeView when books button is clicked', async () => {
    const wrapper = mount(ViewToggle, {
      props: {
        activeView: 'cards'
      }
    })

    const booksButton = wrapper.find('[data-testid="toggle-books"]')
    await booksButton.trigger('click')

    expect(wrapper.emitted('update:activeView')).toBeTruthy()
    expect(wrapper.emitted('update:activeView')[0]).toEqual(['books'])
  })

  it('should show full text on larger screens and abbreviated text on smaller screens', () => {
    const wrapper = mount(ViewToggle, {
      props: {
        activeView: 'cards'
      }
    })

    const cardsButton = wrapper.find('[data-testid="toggle-cards"]')
    const booksButton = wrapper.find('[data-testid="toggle-books"]')

    // Check for responsive text classes
    expect(cardsButton.find('.hidden.xs\\:inline').exists()).toBe(true)
    expect(cardsButton.find('.xs\\:hidden').exists()).toBe(true)
    expect(booksButton.find('.hidden.xs\\:inline').exists()).toBe(true)
    expect(booksButton.find('.xs\\:hidden').exists()).toBe(true)
  })

  it('should validate activeView prop correctly', () => {
    const wrapper = mount(ViewToggle, {
      props: {
        activeView: 'cards'
      }
    })

    expect(wrapper.vm.$options.props.activeView.validator('cards')).toBe(true)
    expect(wrapper.vm.$options.props.activeView.validator('books')).toBe(true)
    expect(wrapper.vm.$options.props.activeView.validator('invalid')).toBe(false)
  })

  it('should have proper accessibility attributes', () => {
    const wrapper = mount(ViewToggle, {
      props: {
        activeView: 'cards'
      }
    })

    const cardsButton = wrapper.find('[data-testid="toggle-cards"]')
    const booksButton = wrapper.find('[data-testid="toggle-books"]')

    expect(cardsButton.attributes('data-testid')).toBe('toggle-cards')
    expect(booksButton.attributes('data-testid')).toBe('toggle-books')
  })

  it('should apply correct transition classes', () => {
    const wrapper = mount(ViewToggle, {
      props: {
        activeView: 'cards'
      }
    })

    const cardsButton = wrapper.find('[data-testid="toggle-cards"]')
    const booksButton = wrapper.find('[data-testid="toggle-books"]')

    expect(cardsButton.classes()).toContain('transition-all')
    expect(cardsButton.classes()).toContain('duration-200')
    expect(booksButton.classes()).toContain('transition-all')
    expect(booksButton.classes()).toContain('duration-200')
  })
})
