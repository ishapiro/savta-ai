<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Analytics Test Page</h1>
    
    <div class="space-y-4">
      <div class="p-4 bg-gray-100 rounded">
        <h2 class="font-semibold mb-2">Current Session Info:</h2>
        <p><strong>Session ID:</strong> {{ sessionId || 'Not initialized' }}</p>
        <p><strong>Current Page:</strong> {{ $route.path }}</p>
      </div>
      
      <div class="p-4 bg-blue-100 rounded">
        <h2 class="font-semibold mb-2">Test Actions:</h2>
        <button 
          @click="testCustomEvent" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
        >
          Test Custom Event
        </button>
        <button 
          @click="testPageVisit" 
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
        >
          Test Page Visit
        </button>
        <button 
          @click="flushEvents" 
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Force Flush Events
        </button>
      </div>
      
      <div class="p-4 bg-yellow-100 rounded">
        <h2 class="font-semibold mb-2">Instructions:</h2>
        <ol class="list-decimal list-inside space-y-1">
          <li>Open browser console (F12)</li>
          <li>Look for messages starting with "🔍 Analytics:"</li>
          <li>Click the test buttons above</li>
          <li>Navigate to other pages to see page visit tracking</li>
          <li>Check the database to see if events are being recorded</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
const { trackEvent, trackPageVisit, flushEvents, sessionId } = useAnalytics()

const testCustomEvent = () => {
  console.log('🔍 Test: Triggering custom event')
  trackEvent('test_custom_event', {
    test_data: 'This is a test event',
    timestamp: new Date().toISOString()
  })
}

const testPageVisit = () => {
  console.log('🔍 Test: Triggering page visit')
  trackPageVisit('/test-analytics')
}
</script>
