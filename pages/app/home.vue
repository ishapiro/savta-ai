<template>
  <div class="min-h-screen flex flex-col bg-brand-background">
    <!-- Hero Section -->
    <div class="w-full px-4 sm:px-6 lg:px-8 pt-2 pb-8 text-center">
      <div class="max-w-3xl mx-auto">
        <h1 class="font-extrabold text-brand-primary mb-4 tracking-tight leading-tight text-center">
          <span class="block text-2xl sm:text-4xl lg:text-7xl mb-2">Turn photos into</span>
          <span class="block text-2xl sm:text-4xl lg:text-5xl text-brand-secondary mb-2">beautiful memory cards</span>
          <span class="block text-2xl sm:text-4xl lg:text-5xl text-brand-header">— automatically.</span>
        </h1>
      </div>
      <h2 class="italic text-base sm:text-lg lg:text-xl text-brand-primary font-medium mb-6 leading-snug">
        No more dragging photos into layouts. Our AI picks your best moments,<br />
        writes captions, and designs beautiful cards for you.<br />
        Just upload and we'll mail them to your loved ones or share them digitally.
      </h2>
      <Button
        label="GETTING STARTED"
        class="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-dark text-white px-8 py-4 text-lg font-semibold uppercase tracking-wider rounded shadow-elevation-2 hover:shadow-elevation-3 mb-3 border-0"
        @click="openMagicMemoryDialog('quick')"
      />
      <div class="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-brand-primary mb-2">
        <span class="flex items-center gap-1">
          <span>Takes under 3 minutes. Pinky promise</span>
          <span class="text-yellow-500 pl-1">🤞</span>
        </span>
      </div>
    </div>

    <!-- Value Props / Features -->
    <div class="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 mb-10">
      <div class="bg-brand-highlight/10 rounded-xl p-4 flex items-start gap-3">
        <span class="text-2xl">📱</span>
        <div>
          <h3 class="font-semibold text-brand-primary mb-2">Photos scattered everywhere?</h3>
          <p class="text-sm sm:text-base text-brand-primary/80 leading-relaxed">
            We'll find your best moments from your phone, computer, and social media — no organizing required.
          </p>
        </div>
      </div>
      <div class="bg-brand-secondary/10 rounded-xl p-4 flex items-start gap-3">
        <span class="text-2xl">✨</span>
        <div>
          <h3 class="font-semibold text-brand-primary mb-2">AI does the heavy lifting</h3>
          <p class="text-sm sm:text-base text-brand-primary/80 leading-relaxed">
            Our AI picks your best photos, writes heartwarming captions, and designs beautiful layouts — all automatically.
          </p>
        </div>
      </div>
      <div class="bg-brand-accent/20 rounded-xl p-4 flex items-start gap-3 col-span-1 sm:col-span-2">
        <div class="flex flex-col gap-2 w-full">
          <h3 class="font-semibold text-brand-primary text-lg mb-1">How it works:</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="flex items-center gap-3">
              <span class="text-brand-header text-lg">🎯</span>
              <span class="text-sm sm:text-base text-brand-primary/80">I intelligently select your best photos based on your story prompt</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-brand-header text-lg">✍️</span>
              <span class="text-sm sm:text-base text-brand-primary/80">I write personalized, heartwarming captions that tell your story</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-brand-header text-lg">🎨</span>
              <span class="text-sm sm:text-base text-brand-primary/80">I automatically design beautiful memory cards and books based on themes you select</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-brand-header text-lg">📤</span>
              <span class="text-sm sm:text-base text-brand-primary/80">Share digitally or I'll print and mail them for you</span>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-brand-accent/30">
            <p class="text-xs text-brand-primary/70 italic">
              Unlike traditional photo services, I do the creative work for you—no design skills needed 
              and no dragging and dropping photos into a layout.
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'

definePageMeta({
  layout: 'home-page'
})

// Enhanced flow: Check if user is authenticated, then check for approved photos
const openMagicMemoryDialog = async (buttonType = 'quick') => {
  const { useSupabaseUser } = await import('~/composables/useSupabase')
  const user = useSupabaseUser()
  
  if (!user.value) {
    localStorage.setItem('auth_origin', 'home')
    await navigateTo('/app/signup')
  } else {
    try {
      const { useDatabase } = await import('~/composables/useDatabase')
      const db = useDatabase()
      // Check for memory books
      const books = await db.memoryBooks.getMemoryBooks()
      console.log('books', books)
      if (books && books.length > 0) {
        await navigateTo('/app/memory-books')
      } else {
        // No memory books, navigate to memory books page (will auto-handle dialog)
        await navigateTo('/app/memory-books')
      }
    } catch (error) {
      // Fallback: navigate to memory books page if error
      await navigateTo('/app/memory-books')
    }
  }
}

onMounted(async () => {
  const { useSupabaseUser } = await import('~/composables/useSupabase')
  const user = useSupabaseUser()
  if (user.value) {
    const authOrigin = localStorage.getItem('auth_origin')
    if (authOrigin === 'home') {
      try {
        const { useDatabase } = await import('~/composables/useDatabase')
        const db = useDatabase()
        const assets = await db.assets.getAssets({ approved: true })
        const hasApprovedPhotos = assets && assets.length > 0
        localStorage.removeItem('auth_origin')
        if (hasApprovedPhotos) {
          await navigateTo('/app/memory-books')
        } else {
          await navigateTo('/app/memory-books')
        }
      } catch (error) {
        localStorage.removeItem('auth_origin')
      }
    }
  }
})
</script> 