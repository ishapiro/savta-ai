/**
 * MANUAL PRIMEVUE SETUP
 * 
 * This is a MANUAL PrimeVue integration using a custom plugin.
 * DO NOT replace this with @nuxtjs/primevue or primevue/nuxt modules.
 * 
 * This setup provides:
 * - Manual component registration for better control
 * - Custom configuration without module conflicts
 * - Direct access to PrimeVue features
 * 
 * If you see PrimeVue component errors, check this plugin first.
 * Do not attempt to install Nuxt PrimeVue modules.
 */

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
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Tooltip from 'primevue/tooltip'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'

export default defineNuxtPlugin((nuxtApp) => {
  // Install PrimeVue with configuration
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: true,
    inputStyle: 'filled'
  })
  
  // Register services
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.use(ConfirmationService)

  // In PrimeVue 3.x, toast is used via useToast() composable
  // We don't need to provide it globally
  
  // Register components globally
  const components = {
    Button,
    InputText,
    Dialog,
    Toast,
    Breadcrumb,
    Card,
    TabView,
    TabPanel,
    Textarea,
    Chip,
    Tag,
    Password,
    Dropdown,
    MultiSelect,
    InputNumber,
    Checkbox
  }
  
  // Register all components
  Object.entries(components).forEach(([name, component]) => {
    nuxtApp.vueApp.component(name, component)
  })
  
  // Register directives
  nuxtApp.vueApp.directive('tooltip', Tooltip)
}) 