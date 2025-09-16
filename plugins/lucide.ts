import { defineNuxtPlugin } from 'nuxt/app'
import { Wand2, Sparkles, Zap, Star, Sparkle, Moon, Sun, Heart, Gem, Crown, Images, MessageSquare, CheckCircle, Info, ArrowRight } from 'lucide-vue-next'

export default defineNuxtPlugin((nuxtApp: any) => {
  // Register magic-themed Lucide icons globally
  nuxtApp.vueApp.component('Wand2', Wand2)
  nuxtApp.vueApp.component('Sparkles', Sparkles)
  nuxtApp.vueApp.component('Zap', Zap)
  nuxtApp.vueApp.component('Star', Star)
  nuxtApp.vueApp.component('Sparkle', Sparkle)
  nuxtApp.vueApp.component('Moon', Moon)
  nuxtApp.vueApp.component('Sun', Sun)
  nuxtApp.vueApp.component('Heart', Heart)
  nuxtApp.vueApp.component('Gem', Gem)
  nuxtApp.vueApp.component('Crown', Crown)

  // Register commonly used UI icons
  nuxtApp.vueApp.component('Images', Images)
  nuxtApp.vueApp.component('MessageSquare', MessageSquare)
  nuxtApp.vueApp.component('CheckCircle', CheckCircle)
  nuxtApp.vueApp.component('Info', Info)
  nuxtApp.vueApp.component('ArrowRight', ArrowRight)
}) 