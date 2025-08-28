<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-brand-primary">Analytics Dashboard</h1>
        <p class="text-brand-primary/70">Enhanced User Analytics & Geolocation</p>
      </div>
      
      <!-- Time Range Selector -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-brand-primary">Time Range:</label>
          <button 
            @click="showInfoDialog('timeRange')"
            class="text-brand-primary/60 hover:text-brand-primary transition-colors"
            title="Learn more about time ranges"
          >
            <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
          </button>
        </div>
        <Dropdown
          v-model="selectedTimeRange"
          :options="timeRangeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select Time Range"
          class="w-45 time-range-dropdown"
          @change="loadAnalytics"
        />
      </div>
    </div>

    <!-- Funnel Report Component -->
    <FunnelReport />

    <!-- Analytics Info Banner -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="pi pi-info-circle text-blue-600 text-lg" title="Ask Savta"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Analytics Overview</h3>
          <div class="mt-2 text-sm text-blue-700">
            <p class="mb-2">This dashboard shows comprehensive user analytics including:</p>
            <ul class="list-disc list-inside space-y-1 ml-2">
              <li><strong>User Engagement:</strong> Time on page, scroll depth, and interaction rates</li>
              <li><strong>Geographic Data:</strong> User locations using IP geolocation (privacy-protected)</li>
              <li><strong>Technical Analytics:</strong> Device types, browsers, and screen resolutions</li>
              <li><strong>Marketing Attribution:</strong> Traffic sources, UTM parameters, and referrer analysis</li>
            </ul>
            <p class="mt-2 text-xs">💡 <strong>Tip:</strong> Hover over any metric or section title for detailed explanations!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <ProgressSpinner />
      <span class="ml-3 text-brand-primary">Loading analytics data...</span>
    </div>

    <!-- Analytics Content -->
    <div v-else-if="analyticsData" class="space-y-6">
      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-4 unique-users-card">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <i class="pi pi-users text-blue-600"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-brand-primary/70">Unique Users</p>
                <p class="text-2xl font-bold text-brand-primary">{{ analyticsData.overview.uniqueUsers }}</p>
              </div>
            </div>
            <button 
              @click="showInfoDialog('uniqueUsers')"
              class="text-brand-primary/60 hover:text-brand-primary transition-colors"
              title="Learn more about unique users"
            >
              <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4 page-views-card">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <i class="pi pi-eye text-green-600"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-brand-primary/70">Page Views</p>
                <p class="text-2xl font-bold text-brand-primary">{{ analyticsData.overview.totalPageViews }}</p>
              </div>
            </div>
            <button 
              @click="showInfoDialog('pageViews')"
              class="text-brand-primary/60 hover:text-brand-primary transition-colors"
              title="Learn more about page views"
            >
              <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4 session-duration-card">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg">
                <i class="pi pi-clock text-purple-600"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-brand-primary/70">Avg. Session Duration</p>
                <p class="text-2xl font-bold text-brand-primary">{{ formatDuration(analyticsData.overview.averageSessionDuration) }}</p>
              </div>
            </div>
            <button 
              @click="showInfoDialog('sessionDuration')"
              class="text-brand-primary/60 hover:text-brand-primary transition-colors"
              title="Learn more about session duration"
            >
              <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-4 engagement-score-card">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="p-2 bg-orange-100 rounded-lg">
                <i class="pi pi-chart-line text-orange-600"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-brand-primary/70">Engagement Score</p>
                <p class="text-2xl font-bold text-brand-primary">{{ Math.round(analyticsData.overview.averageScrollDepth) }}%</p>
              </div>
            </div>
            <button 
              @click="showInfoDialog('engagementScore')"
              class="text-brand-primary/60 hover:text-brand-primary transition-colors"
              title="Learn more about engagement score"
            >
              <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Detailed Metrics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Pages -->
        <div class="bg-white rounded-lg shadow p-6 top-pages-section">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-brand-primary">Top Pages by Views</h3>
            <button 
              @click="showInfoDialog('topPages')"
              class="text-brand-primary/60 hover:text-brand-primary transition-colors"
              title="Learn more about top pages"
            >
              <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
            </button>
          </div>
          <div class="space-y-3">
            <div 
              v-for="(views, page) in sortedTopPages" 
              :key="page"
              class="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <span class="text-sm text-brand-primary truncate flex-1">{{ page }}</span>
              <span class="text-sm font-medium text-brand-primary/70">{{ views }} views</span>
            </div>
          </div>
        </div>

        <!-- Geographic Distribution -->
        <div class="bg-white rounded-lg shadow p-6 geographic-section">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-brand-primary">Geographic Distribution</h3>
            <button 
              @click="showInfoDialog('geographic')"
              class="text-brand-primary/60 hover:text-brand-primary transition-colors"
              title="Learn more about geographic data"
            >
              <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
            </button>
          </div>
          <div class="space-y-3">
            <div 
              v-for="(count, country) in sortedCountries" 
              :key="country"
              class="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <span class="text-sm text-brand-primary">{{ country || 'Unknown' }}</span>
              <span class="text-sm font-medium text-brand-primary/70">{{ count }} visits</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Engagement Analysis -->
      <div class="bg-white rounded-lg shadow p-6 engagement-analysis-section">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-brand-primary">Page Engagement Analysis</h3>
          <button 
            @click="showInfoDialog('engagementAnalysis')"
            class="text-brand-primary/60 hover:text-brand-primary transition-colors"
            title="Learn more about engagement analysis"
          >
            <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
          </button>
        </div>
        <DataTable
          :value="analyticsData.userEngagement.engagementScores"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          class="p-datatable-sm"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="text-sm text-brand-primary/70">Page performance metrics</span>
              <i class="pi pi-question-circle text-brand-primary/50 engagement-table-help cursor-help" title="This table shows detailed engagement metrics for each page. Sort by any column to identify your best and worst performing content."></i>
            </div>
          </template>
          <Column field="page" header="Page" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary" title="The specific page URL that users visited">{{ data.page }}</span>
            </template>
          </Column>
          
          <Column field="score" header="Engagement Score" sortable>
            <template #body="{ data }">
              <div class="flex items-center">
                <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full" 
                    :style="{ width: data.score + '%' }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-brand-primary" title="Composite engagement score (0-100%) based on time on page, scroll depth, and interaction rates. Higher scores indicate better user engagement.">{{ data.score }}%</span>
              </div>
            </template>
          </Column>
          
          <Column field="views" header="Views" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70" title="Total number of times this page was viewed, including repeat visits by the same user">{{ data.views }}</span>
            </template>
          </Column>
          
          <Column field="avgTime" header="Avg. Time" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70" title="Average time users spend on this page before navigating away or closing the browser">{{ formatDuration(data.avgTime) }}</span>
            </template>
          </Column>
          
          <Column field="avgScroll" header="Avg. Scroll" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70" title="Average percentage of the page that users scroll through. 100% means users scroll to the bottom of the page">{{ Math.round(data.avgScroll) }}%</span>
            </template>
          </Column>
          
          <Column field="exitRate" header="Exit Rate" sortable>
            <template #body="{ data }">
              <span class="text-sm text-brand-primary/70" title="Percentage of users who leave your site from this page. Lower exit rates typically indicate better content engagement">{{ Math.round(data.exitRate * 100) }}%</span>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Technical Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Device Types -->
        <div class="bg-white rounded-lg shadow p-6 device-types-section">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-brand-primary">Device Types</h3>
            <button 
              @click="showInfoDialog('deviceTypes')"
              class="text-brand-primary/60 hover:text-brand-primary transition-colors"
              title="Learn more about device types"
            >
              <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
            </button>
          </div>
          <div class="space-y-3">
            <div 
              v-for="(count, device) in sortedDevices" 
              :key="device"
              class="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <span class="text-sm text-brand-primary capitalize">{{ device }}</span>
              <span class="text-sm font-medium text-brand-primary/70">{{ count }} users</span>
            </div>
          </div>
        </div>

        <!-- Browsers -->
        <div class="bg-white rounded-lg shadow p-6 browsers-section">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-brand-primary">Browsers</h3>
            <button 
              @click="showInfoDialog('browsers')"
              class="text-brand-primary/60 hover:text-brand-primary transition-colors"
              title="Learn more about browsers"
            >
              <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
            </button>
          </div>
          <div class="space-y-3">
            <div 
              v-for="(count, browser) in sortedBrowsers" 
              :key="browser"
              class="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <span class="text-sm text-brand-primary">{{ browser }}</span>
              <span class="text-sm font-medium text-brand-primary/70">{{ count }} users</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Marketing Analytics -->
      <div class="bg-white rounded-lg shadow p-6 marketing-analytics-section">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-brand-primary">Marketing Analytics</h3>
          <button 
            @click="showInfoDialog('marketingAnalytics')"
            class="text-brand-primary/60 hover:text-brand-primary transition-colors"
            title="Learn more about marketing analytics"
          >
            <i class="pi pi-info-circle text-sm" title="Ask Savta"></i>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Referrers -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-md font-medium text-brand-primary">Top Referrers</h4>
              <button 
                @click="showInfoDialog('referrers')"
                class="text-brand-primary/60 hover:text-brand-primary transition-colors"
                title="Learn more about referrers"
              >
                <i class="pi pi-info-circle text-xs" title="Ask Savta"></i>
              </button>
            </div>
            <div class="space-y-2">
              <div 
                v-for="(count, referrer) in sortedReferrers" 
                :key="referrer"
                class="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span class="text-sm text-brand-primary truncate">{{ referrer || 'Direct' }}</span>
                <span class="text-sm font-medium text-brand-primary/70">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- UTM Sources -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-md font-medium text-brand-primary">UTM Sources</h4>
              <button 
                @click="showInfoDialog('utmSources')"
                class="text-brand-primary/60 hover:text-brand-primary transition-colors"
                title="Learn more about UTM sources"
              >
                <i class="pi pi-info-circle text-xs" title="Ask Savta"></i>
              </button>
            </div>
            <div class="space-y-2">
              <div 
                v-for="(count, source) in sortedUTMSources" 
                :key="source"
                class="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span class="text-sm text-brand-primary">{{ source || 'No UTM' }}</span>
                <span class="text-sm font-medium text-brand-primary/70">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <i class="pi pi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
      <p class="text-brand-primary">Error loading analytics data: {{ error }}</p>
      <Button 
        label="Retry" 
        @click="loadAnalytics"
        class="mt-4"
      />
    </div>

    <!-- Information Dialog -->
    <Dialog 
      v-model:visible="showInfoDialogVisible" 
      :modal="true"
      :closable="true"
      :closeOnEscape="true"
      class="max-w-md"
      :style="{ top: '20px' }"
    >
      <template #header>
        <h3 class="text-lg font-semibold text-brand-primary">{{ currentInfoDialog.title }}</h3>
      </template>
      
      <div class="space-y-4">
        <div v-html="currentInfoDialog.content"></div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  middleware: ['admin']
})

// PrimeVue components are registered globally in plugins/primevue.ts

// Reactive data
const loading = ref(true)
const error = ref(null)
const analyticsData = ref(null)
const selectedTimeRange = ref('7d')



// Information dialog
const showInfoDialogVisible = ref(false)
const currentInfoDialog = ref({ title: '', content: '' })

// Information dialog content
const infoDialogContent = {
  timeRange: {
    title: 'Time Range Selection',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this controls:</strong> The time period for all analytics data displayed on this dashboard.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Data collection:</strong> Analytics are collected in real-time and include:
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Page visits and user sessions</li>
        <li>Engagement metrics (scroll depth, time on page)</li>
        <li>Geographic information (country, region, city)</li>
        <li>Technical data (device types, browsers)</li>
        <li>Marketing attribution (UTM parameters, referrers)</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Privacy:</strong> All data is anonymized and IP addresses are hashed for privacy protection.
      </p>
    `
  },
  uniqueUsers: {
    title: 'Unique Users',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Definition:</strong> The number of distinct users who visited your site during the selected time period.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>How it's calculated:</strong> Each user is counted only once, regardless of how many times they visit or how many pages they view.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Why it matters:</strong> This metric shows your actual audience size and helps you understand:
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>How many people are discovering your site</li>
        <li>Your potential customer base size</li>
        <li>Growth trends over time</li>
        <li>Marketing campaign effectiveness</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> Compare this with page views to understand how engaged your users are.
      </p>
    `
  },
  pageViews: {
    title: 'Page Views',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Definition:</strong> Total number of page views across all users during the selected time period.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>How it's calculated:</strong> This includes repeated visits to the same page by the same user, so it's always equal to or greater than unique users.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Why it matters:</strong> Higher numbers indicate more content consumption and can show:
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Which content is most popular</li>
        <li>How much time users spend exploring your site</li>
        <li>Content engagement levels</li>
        <li>Site navigation patterns</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> A high page views to unique users ratio indicates engaged users who explore multiple pages.
      </p>
    `
  },
  sessionDuration: {
    title: 'Average Session Duration',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Definition:</strong> Average time users spend on your site per session.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>How it's calculated:</strong> Total time spent across all sessions divided by the number of sessions.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Why it matters:</strong> Longer sessions typically indicate:
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Higher engagement and interest in your content</li>
        <li>Users finding value in your site</li>
        <li>Better user experience</li>
        <li>Higher likelihood of conversion</li>
      </ul>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What's good:</strong> Session duration varies by industry, but generally:
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2">
        <li>1-2 minutes: Basic engagement</li>
        <li>2-5 minutes: Good engagement</li>
        <li>5+ minutes: Excellent engagement</li>
      </ul>
    `
  },
  engagementScore: {
    title: 'Engagement Score',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Definition:</strong> A composite score based on multiple engagement factors.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>How it's calculated:</strong> The score combines:
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li><strong>Scroll Depth (30%):</strong> How far users scroll through pages</li>
        <li><strong>Time on Page (20%):</strong> How long users stay on each page</li>
        <li><strong>Interaction Rate (30%):</strong> Clicks, keypresses, and touch events</li>
        <li><strong>Exit Rate (20%):</strong> How often users leave vs. continue browsing</li>
      </ul>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Score ranges:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>0-25%: Low engagement</li>
        <li>26-50%: Moderate engagement</li>
        <li>51-75%: Good engagement</li>
        <li>76-100%: Excellent engagement</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> Use this score to identify your most engaging content and optimize underperforming pages.
      </p>
    `
  },
  topPages: {
    title: 'Top Pages by Views',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this shows:</strong> The most visited pages on your site during the selected time period.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Why it matters:</strong> This helps identify which content is most popular and engaging for your users.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>How to use this data:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Identify your most valuable content</li>
        <li>Understand user interests and preferences</li>
        <li>Optimize underperforming pages</li>
        <li>Plan content strategy and priorities</li>
        <li>Improve site navigation and user flow</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> Combine this with engagement metrics to see not just which pages get traffic, but which ones truly engage users.
      </p>
    `
  },
  geographic: {
    title: 'Geographic Distribution',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this shows:</strong> Where your users are located globally, based on IP geolocation data.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Data collection:</strong> Geographic information is collected using:
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
                        <li>IP address geolocation (MapBox API)</li>
        <li>Privacy-protected data (IPs are hashed)</li>
        <li>Country, region, and city-level data</li>
      </ul>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>How to use this data:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Plan targeted marketing campaigns</li>
        <li>Optimize content for specific regions</li>
        <li>Understand your global audience reach</li>
        <li>Identify new market opportunities</li>
        <li>Localize your website and content</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Privacy note:</strong> All geographic data is anonymized and collected in compliance with privacy regulations.
      </p>
    `
  },
  engagementAnalysis: {
    title: 'Page Engagement Analysis',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this shows:</strong> Detailed analysis of how users interact with each page on your site.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Key metrics explained:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li><strong>Engagement Score:</strong> Composite score (0-100%) based on multiple factors</li>
        <li><strong>Views:</strong> Total number of times each page was visited</li>
        <li><strong>Avg. Time:</strong> Average time users spend on each page</li>
        <li><strong>Avg. Scroll:</strong> Average percentage of page content users scroll through</li>
        <li><strong>Exit Rate:</strong> Percentage of users who leave your site from each page</li>
      </ul>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>How to use this data:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Identify your best and worst performing pages</li>
        <li>Optimize content for better engagement</li>
        <li>Improve user experience and navigation</li>
        <li>Plan content updates and improvements</li>
        <li>Understand user behavior patterns</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> Sort by different columns to identify specific areas for improvement.
      </p>
    `
  },
  deviceTypes: {
    title: 'Device Types',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this shows:</strong> Types of devices your users are using to access your site.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Device categories:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li><strong>Desktop:</strong> Traditional computers and laptops</li>
        <li><strong>Mobile:</strong> Smartphones and mobile phones</li>
        <li><strong>Tablet:</strong> iPads, Android tablets, and similar devices</li>
        <li><strong>Other:</strong> Smart TVs, gaming consoles, etc.</li>
      </ul>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Why this matters:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Optimize your site for the most common devices</li>
        <li>Ensure responsive design works properly</li>
        <li>Plan mobile-first or desktop-first strategies</li>
        <li>Understand user preferences and behavior</li>
        <li>Improve loading times for specific devices</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> If mobile usage is high, prioritize mobile optimization and touch-friendly interfaces.
      </p>
    `
  },
  browsers: {
    title: 'Browsers',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this shows:</strong> Web browsers used by your visitors to access your site.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Common browsers:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li><strong>Chrome:</strong> Google's browser (most popular)</li>
        <li><strong>Safari:</strong> Apple's browser (iOS/macOS)</li>
        <li><strong>Firefox:</strong> Mozilla's open-source browser</li>
        <li><strong>Edge:</strong> Microsoft's modern browser</li>
        <li><strong>Others:</strong> Opera, Brave, and niche browsers</li>
      </ul>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Why this matters:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Ensure cross-browser compatibility</li>
        <li>Identify and fix browser-specific issues</li>
        <li>Optimize for your most common browsers</li>
        <li>Test new features on relevant browsers</li>
        <li>Plan browser support strategies</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> Focus testing efforts on browsers that represent the majority of your users.
      </p>
    `
  },
  marketingAnalytics: {
    title: 'Marketing Analytics',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this shows:</strong> Marketing performance data showing where your traffic comes from.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Key components:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li><strong>Top Referrers:</strong> Websites that link to your site</li>
        <li><strong>UTM Sources:</strong> Campaign tracking parameters</li>
        <li><strong>Direct Traffic:</strong> Users typing your URL directly</li>
        <li><strong>Organic Search:</strong> Traffic from search engines</li>
      </ul>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>How to use this data:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Measure campaign effectiveness</li>
        <li>Identify your most valuable traffic sources</li>
        <li>Optimize marketing spend allocation</li>
        <li>Build relationships with high-performing referrers</li>
        <li>Plan future marketing strategies</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> Combine this with conversion data to understand not just traffic volume, but quality.
      </p>
    `
  },
  referrers: {
    title: 'Top Referrers',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this shows:</strong> Websites that link to your site and send traffic.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Referrer types:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li><strong>Direct:</strong> Users typing your URL directly or using bookmarks</li>
        <li><strong>Social Media:</strong> Facebook, Twitter, LinkedIn, etc.</li>
        <li><strong>Search Engines:</strong> Google, Bing, Yahoo, etc.</li>
        <li><strong>Other Websites:</strong> Blogs, news sites, partner sites</li>
        <li><strong>Email:</strong> Links in email campaigns</li>
      </ul>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>Why this matters:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Identify your most valuable traffic sources</li>
        <li>Build relationships with high-performing referrers</li>
        <li>Optimize your content for specific platforms</li>
        <li>Plan outreach and partnership strategies</li>
        <li>Understand brand awareness and reach</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> Focus on referrers that bring engaged users, not just high volume.
      </p>
    `
  },
  utmSources: {
    title: 'UTM Sources',
    content: `
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>What this shows:</strong> UTM parameters track the effectiveness of marketing campaigns.
      </p>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>UTM parameters explained:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li><strong>utm_source:</strong> Where the traffic comes from (Google, Facebook, etc.)</li>
        <li><strong>utm_medium:</strong> Marketing medium (cpc, social, email, etc.)</li>
        <li><strong>utm_campaign:</strong> Specific campaign name or identifier</li>
        <li><strong>utm_term:</strong> Keywords for paid search campaigns</li>
        <li><strong>utm_content:</strong> Specific content version or ad copy</li>
      </ul>
      <p class="text-sm text-brand-primary/80 mb-3">
        <strong>How to use this data:</strong>
      </p>
      <ul class="text-sm text-brand-primary/80 list-disc list-inside space-y-1 ml-2 mb-3">
        <li>Measure campaign performance and ROI</li>
        <li>Compare different marketing channels</li>
        <li>Optimize ad spend allocation</li>
        <li>Test different campaign strategies</li>
        <li>Identify your most effective marketing tactics</li>
      </ul>
      <p class="text-sm text-brand-primary/80">
        <strong>Tip:</strong> Always use UTM parameters for paid campaigns to track their effectiveness.
      </p>
    `
  }
}

// Time range options
const timeRangeOptions = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last Year', value: '1y' }
]



// Computed properties for sorted data
const sortedTopPages = computed(() => {
  if (!analyticsData.value?.userEngagement?.topPages) return {}
  return Object.fromEntries(
    Object.entries(analyticsData.value.userEngagement.topPages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  )
})

const sortedCountries = computed(() => {
  if (!analyticsData.value?.geographic?.countries) return {}
  return Object.fromEntries(
    Object.entries(analyticsData.value.geographic.countries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  )
})

const sortedDevices = computed(() => {
  if (!analyticsData.value?.technical?.devices) return {}
  return Object.fromEntries(
    Object.entries(analyticsData.value.technical.devices)
      .sort(([,a], [,b]) => b - a)
  )
})

const sortedBrowsers = computed(() => {
  if (!analyticsData.value?.technical?.browsers) return {}
  return Object.fromEntries(
    Object.entries(analyticsData.value.technical.browsers)
      .sort(([,a], [,b]) => b - a)
  )
})

const sortedReferrers = computed(() => {
  if (!analyticsData.value?.marketing?.referrers) return {}
  return Object.fromEntries(
    Object.entries(analyticsData.value.marketing.referrers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  )
})

const sortedUTMSources = computed(() => {
  if (!analyticsData.value?.marketing?.utmSources) return {}
  return Object.fromEntries(
    Object.entries(analyticsData.value.marketing.utmSources)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  )
})

// Show information dialog
const showInfoDialog = (type) => {
  if (infoDialogContent[type]) {
    currentInfoDialog.value = infoDialogContent[type]
    showInfoDialogVisible.value = true
  }
}

// Load analytics data
const loadAnalytics = async () => {
  loading.value = true
  error.value = null
  
  try {
    const supabase = useNuxtApp().$supabase
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    
    const res = await fetch(`/api/admin/analytics-dashboard?timeRange=${selectedTimeRange.value}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch analytics data')
    }
    
    const result = await res.json()
    analyticsData.value = result.analytics
  } catch (err) {
    console.error('Error loading analytics:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Format duration in seconds to readable format
const formatDuration = (seconds) => {
  if (!seconds || seconds < 60) {
    return `${Math.round(seconds || 0)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

// Load data on mount
onMounted(() => {
  loadAnalytics()
})
</script>
