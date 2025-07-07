import { defineNuxtPlugin } from 'nuxt/app'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Breadcrumb from 'primevue/breadcrumb'

export default defineNuxtPlugin((nuxtApp) => {
  // Install PrimeVue with minimal configuration for v3
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: true,
    inputStyle: 'filled'
  })
  
  // Register services
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.use(ConfirmationService)
  
  // Register components globally
  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('InputText', InputText)
  nuxtApp.vueApp.component('Dialog', Dialog)
  nuxtApp.vueApp.component('Toast', Toast)
  nuxtApp.vueApp.component('Breadcrumb', Breadcrumb)
}) 