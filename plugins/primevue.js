import { defineNuxtPlugin } from 'nuxt/app'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Breadcrumb from 'primevue/breadcrumb'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    unstyled: false,
    ripple: true,
    inputStyle: 'filled',
    pt: {
      card: {
        root: { class: 'bg-white shadow-md rounded-lg' },
        content: { class: 'p-6' }
      },
      button: {
        root: { class: 'bg-primary-600 hover:bg-primary-700 text-white' }
      },
      inputtext: {
        root: { class: 'w-full' }
      },
      password: {
        root: { class: 'w-full' }
      },
      breadcrumb: {
        root: { class: 'bg-transparent border-none shadow-none' }
      }
    }
  })
  
  // Register components globally
  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('Card', Card)
  nuxtApp.vueApp.component('InputText', InputText)
  nuxtApp.vueApp.component('Password', Password)
  nuxtApp.vueApp.component('Checkbox', Checkbox)
  nuxtApp.vueApp.component('Dialog', Dialog)
  nuxtApp.vueApp.component('Breadcrumb', Breadcrumb)
}) 