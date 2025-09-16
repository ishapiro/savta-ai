<template>
  <div class="min-h-screen bg-brand-background">
    <!-- Add Google Fonts -->
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=EB+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet">
    </Head>
    <!-- Header with just the logo -->
    <header class="bg-brand-background border-0 mt-5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-center items-center">
          <!-- Logo -->
          <div class="flex items-center">
              <SavtaIcon class="h-35 w-auto" />
              <span class="ml-5 text-2xl font-bold text-brand-header">Savta</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-brand-background border-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="text-center text-sm text-gray-500">
          <p>Made with love by Savta • Beta version - no warranty, no support</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// No additional setup needed
</script> 