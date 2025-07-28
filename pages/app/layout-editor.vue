<template>
  <div class="min-h-screen bg-brand-background p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-brand-primary mb-2">Layout Editor</h1>
            <p class="text-brand-primary/70">Design and customize memory book layouts.</p>
          </div>
          <Button
            label="Back to Editor"
            icon="pi pi-arrow-left"
            severity="secondary"
            @click="router.push('/app/editor')"
          />
        </div>
      </div>

      <!-- Layout Editor Component -->
      <div class="bg-white p-6 rounded-lg shadow">
        <LayoutEditor @save="handleSave" />
      </div>
    </div>
  </div>
</template>

<script setup>
// Set the layout for this page
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'editor']
})

import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()

// Debug logging
console.log('[Layout Editor Page] Page is loading')
console.log('[Layout Editor Page] Current route:', useRoute().path)

onMounted(() => {
  console.log('[Layout Editor Page] Page mounted successfully')
})

function handleSave(layoutJson) {
  console.log('Saved layout:', layoutJson)
  
  // Show success message
  toast.add({
    severity: 'success',
    summary: 'Layout Saved',
    detail: 'Layout configuration saved successfully',
    life: 3000
  })
  
  // TODO: Save to server, file, or localStorage
  // You can implement the actual saving logic here
  // For now, we'll just log it to console
  console.log('Layout JSON:', JSON.stringify(layoutJson, null, 2))
}
</script> 