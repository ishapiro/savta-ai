import { vi } from 'vitest'

// Mock global objects
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

// Mock window and navigator
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
})

Object.defineProperty(navigator, 'share', {
  writable: true,
  configurable: true,
  value: undefined
})

Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  configurable: true,
  value: {
    writeText: vi.fn().mockResolvedValue()
  }
})

// Mock URL methods
window.URL.createObjectURL = vi.fn(() => 'blob:url')
window.URL.revokeObjectURL = vi.fn()

// Mock fetch
global.fetch = vi.fn()

// Mock DOM methods
document.createElement = vi.fn(() => ({
  href: '',
  download: '',
  click: vi.fn()
}))

document.body.appendChild = vi.fn()
document.body.removeChild = vi.fn()

// Mock process
process.client = true
