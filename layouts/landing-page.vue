<template>
  <div class="min-h-screen flex flex-col bg-brand-background shadow-sm border-b border-gray-200 relative overflow-hidden">
    <!-- Add Google Fonts -->
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    </Head>
    <!-- Animated background elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute top-20 left-20 w-32 h-32 bg-brand-header/20 rounded-full blur-xl animate-pulse-slow"></div>
      <div class="absolute top-40 right-32 w-24 h-24 bg-brand-secondary/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/3 w-40 h-40 bg-brand-accent/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-20 w-20 h-20 bg-brand-highlight/20 rounded-full blur-xl animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 w-full max-w-2xl mx-auto flex-1 flex items-center justify-center">
      <NuxtPage />
    </div>
  </div>
</template> 