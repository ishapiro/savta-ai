export default defineNuxtPlugin(() => {
  if (!process.client) return

  const w = window as any
  w.Tawk_API = w.Tawk_API ?? {}
  w.Tawk_LoadStart = new Date()

  // Hide the built-in launcher once loaded; we’ll use our own button.
  let resolveReady!: () => void
  const ready = new Promise<void>((res) => (resolveReady = res))

  const prevOnLoad = w.Tawk_API.onLoad
  w.Tawk_API.onLoad = () => {
    try { w.Tawk_API.hideWidget?.() } catch {}
    prevOnLoad?.()
    resolveReady()
  }

  // Inject once
  if (!document.getElementById('tawk-embed')) {
    const s = document.createElement('script')
    s.id = 'tawk-embed'
    s.async = true
    s.src = 'https://embed.tawk.to/68b0b8e025fd78192a53c58d/1j3p54b8c'
    s.charset = 'UTF-8'
    s.crossOrigin = '*'
    document.body.appendChild(s)
  }

  return {
    provide: {
      tawk: {
        ready, // Promise<void>
        open: () => w.Tawk_API?.maximize?.(),
        toggle: () => w.Tawk_API?.toggle?.(),
        show: () => w.Tawk_API?.showWidget?.(),
        hide: () => w.Tawk_API?.hideWidget?.()
      }
    }
  }
})
