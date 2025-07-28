<template>
  <div class="h-screen w-full bg-brand-background overflow-hidden">
    <div class="w-full h-full flex flex-col">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 p-3 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-brand-primary mb-1">Layout Editor</h1>
            <p class="text-brand-primary/70 text-xs">Design and customize memory book layouts.</p>
          </div>
          <Button
            icon="pi pi-arrow-left"
            label="Back to Admin"
            class="mb-4"
            size="small"
            @click="router.push('/app/admin')"
          />
        </div>
      </div>

      <!-- Layout Editor Component -->
      <div class="flex-1 bg-white overflow-hidden">
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