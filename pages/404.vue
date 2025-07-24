<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h1 class="text-5xl font-bold text-purple-700 mb-4">404</h1>
    <p class="text-lg text-gray-600 mb-8">Page Not Found</p>
    <Button label="Go Home" class="bg-purple-600 hover:bg-purple-700 text-white border-0" @click="() => navigateTo('/')" />
  </div>
</template>

<script setup>
</script> 