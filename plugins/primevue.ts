import { defineNuxtPlugin } from 'nuxt/app'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Breadcrumb from 'primevue/breadcrumb'
import Card from 'primevue/card'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Textarea from 'primevue/textarea'
import Chip from 'primevue/chip'
import Tag from 'primevue/tag'
import Password from 'primevue/password'

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
  nuxtApp.vueApp.component('Card', Card)
  nuxtApp.vueApp.component('TabView', TabView)
  nuxtApp.vueApp.component('TabPanel', TabPanel)
  nuxtApp.vueApp.component('Textarea', Textarea)
  nuxtApp.vueApp.component('Chip', Chip)
  nuxtApp.vueApp.component('Tag', Tag)
  nuxtApp.vueApp.component('Password', Password)
}) 