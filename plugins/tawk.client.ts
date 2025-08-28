export default defineNuxtPlugin(() => {
    if (process.client) {
      const s = document.createElement('script')
      s.async = true
      s.src = "https://embed.tawk.to/68b0b8e025fd78192a53c58d/1j3p54b8c"
      s.charset = 'UTF-8'
      s.setAttribute('crossorigin', '*')
      document.body.appendChild(s)
    }
  })