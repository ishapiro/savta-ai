import { defineNuxtPlugin } from 'nuxt/app'
import { Wand2, Sparkles, Zap, Star, Sparkle, Moon, Sun, Heart, Gem, Crown, Images, MessageSquare, CheckCircle, Info, ArrowRight, Gift, Calendar, AlertCircle, Layers, FileText, Palette, Circle, Grid3x3, FileEdit, MessageCircle, Trash2, X, Clock, Check, Download, File, RefreshCw, Loader2, Lightbulb, AlertTriangle, File as FilePdf, Grid3x3 as ThLarge, CalendarPlus, Table, MessageCircle as Comment, Bolt, Image, Info as InfoCircle, X as Times, RefreshCw as Refresh, CheckCircle2, Sparkles as SparklesIcon } from 'lucide-vue-next'

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
  
  // Register additional icons for memory books dialog
  nuxtApp.vueApp.component('Gift', Gift)
  nuxtApp.vueApp.component('Calendar', Calendar)
  nuxtApp.vueApp.component('AlertCircle', AlertCircle)
  nuxtApp.vueApp.component('Layers', Layers)
  nuxtApp.vueApp.component('FileText', FileText)
  nuxtApp.vueApp.component('Palette', Palette)
  nuxtApp.vueApp.component('Circle', Circle)
  nuxtApp.vueApp.component('Grid3x3', Grid3x3)
  nuxtApp.vueApp.component('FileEdit', FileEdit)
  nuxtApp.vueApp.component('MessageCircle', MessageCircle)
  nuxtApp.vueApp.component('Trash2', Trash2)
  nuxtApp.vueApp.component('X', X)
  nuxtApp.vueApp.component('Clock', Clock)
  nuxtApp.vueApp.component('Check', Check)
  
  // Register additional icons for PrimeVue replacement
  nuxtApp.vueApp.component('Download', Download)
  nuxtApp.vueApp.component('File', File)
  nuxtApp.vueApp.component('RefreshCw', RefreshCw)
  nuxtApp.vueApp.component('Loader2', Loader2)
  nuxtApp.vueApp.component('Lightbulb', Lightbulb)
  nuxtApp.vueApp.component('AlertTriangle', AlertTriangle)
  nuxtApp.vueApp.component('FilePdf', FilePdf)
  nuxtApp.vueApp.component('ThLarge', ThLarge)
  nuxtApp.vueApp.component('CalendarPlus', CalendarPlus)
  nuxtApp.vueApp.component('Table', Table)
  nuxtApp.vueApp.component('Comment', Comment)
  nuxtApp.vueApp.component('Bolt', Bolt)
  nuxtApp.vueApp.component('Image', Image)
  nuxtApp.vueApp.component('InfoCircle', InfoCircle)
  nuxtApp.vueApp.component('Times', Times)
  nuxtApp.vueApp.component('Refresh', Refresh)
  nuxtApp.vueApp.component('CheckCircle2', CheckCircle2)
  nuxtApp.vueApp.component('SparklesIcon', SparklesIcon)
}) 