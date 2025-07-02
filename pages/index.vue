<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-32 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-20 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 w-full max-w-2xl mx-auto flex-1 flex items-center justify-center">
      <div class="coming-soon-card text-center">
        <div class="mb-8 animate-fade-in-down">
          <div class="w-24 h-24 bg-white mx-auto mb-6 rounded-full flex items-center justify-center floating-element">
            <img src="/savta-pink.png" alt="savta.ai Logo" class="h-14 w-auto" />
          </div>
          <h1 class="text-2xl md:text-3xl font-semibold text-white mb-2">Savta AI</h1>
          <p class="text-gray-300 text-lg">The Future of AI-Powered Solutions</p>
        </div>
        <div class="mb-8 animate-fade-in-up" style="animation-delay: 0.3s;">
          <h2 class="animated-text mb-4">Coming Soon</h2>
          <p class="text-xl md:text-2xl text-gray-300 mb-6">Something amazing is brewing...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No logic needed for static coming soon page
</script> 