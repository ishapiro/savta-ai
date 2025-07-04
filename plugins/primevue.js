import { defineNuxtPlugin } from 'nuxt/app'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Breadcrumb from 'primevue/breadcrumb'

const buttonDefaults = {
  root: {
    class: [
      'bg-lara-500 hover:bg-lara-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition disabled:opacity-60 border border-lara-100',
    ]
  }
}

const dialogDefaults = {
  root: {
    class: [
      'bg-white rounded-2xl shadow-2xl border border-surface-200 p-0',
    ]
  },
  mask: {
    class: [
      'bg-black bg-opacity-50'
    ]
  },
  header: {
    class: [
      'rounded-t-2xl px-6 py-4 border-b border-surface-100 bg-white'
    ]
  },
  content: {
    class: [
      'px-6 py-4 bg-white rounded-b-2xl'
    ]
  },
  footer: {
    class: [
      'px-6 py-4 bg-white rounded-b-2xl border-t border-surface-100'
    ]
  },
  closeButton: {
    class: [
      'text-gray-400 hover:text-gray-600 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-lara-500'
    ]
  }
}

const cardDefaults = {
  root: {
    class: [
      'bg-white rounded-xl shadow-md border border-surface-100 p-6'
    ]
  },
  body: {
    class: [
      'p-0'
    ]
  },
  title: {
    class: [
      'text-lg font-bold text-gray-900 mb-2'
    ]
  },
  subtitle: {
    class: [
      'text-gray-500 mb-4'
    ]
  },
  content: {
    class: [
      'text-gray-700'
    ]
  },
  footer: {
    class: [
      'pt-4 mt-4 border-t border-surface-100'
    ]
  }
}

const toastDefaults = {
  root: {
    class: [
      'bg-white rounded-xl shadow-md border border-surface-100 p-4 flex items-center gap-3'
    ]
  },
  icon: {
    class: [
      'text-lara-500 text-xl mr-2'
    ]
  },
  message: {
    class: [
      'text-gray-800 flex-1'
    ]
  },
  closeButton: {
    class: [
      'text-gray-400 hover:text-gray-600 rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-lara-500'
    ]
  }
}

const inputTextDefaults = {
  root: {
    class: [
      'w-full border border-surface-200 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lara-500 focus:border-lara-500 transition'
    ]
  }
}

const passwordDefaults = {
  root: {
    class: [
      'w-full border border-surface-200 rounded-lg bg-white'
    ]
  },
  input: {
    class: [
      'w-full border-none bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 px-3 py-2'
    ]
  },
  panel: {
    class: [
      'bg-white border border-surface-200 rounded-lg shadow-lg p-4 z-50'
    ]
  },
  meter: {
    class: [
      'h-2 bg-gray-200 rounded-full overflow-hidden'
    ]
  },
  meterLabel: {
    class: [
      'text-xs text-gray-500 mt-1'
    ]
  },
  toggleButton: {
    class: [
      'text-gray-400 hover:text-gray-600 p-2 rounded transition'
    ]
  }
}

const checkboxDefaults = {
  root: {
    class: [
      'flex items-center'
    ]
  },
  box: {
    class: [
      'w-4 h-4 border border-surface-300 rounded bg-white text-lara-500 focus:ring-2 focus:ring-lara-500 focus:ring-offset-2 transition'
    ]
  },
  input: {
    class: [
      'sr-only'
    ]
  },
  icon: {
    class: [
      'text-white text-xs'
    ]
  },
  label: {
    class: [
      'ml-2 text-sm text-gray-700'
    ]
  }
}

const breadcrumbDefaults = {
  root: {
    class: [
      'flex items-center space-x-2 text-sm'
    ]
  },
  menu: {
    class: [
      'flex items-center space-x-2'
    ]
  },
  menuitem: {
    class: [
      'flex items-center'
    ]
  },
  action: {
    class: [
      'text-gray-500 hover:text-lara-500 transition no-underline outline-none focus:outline-none'
    ]
  },
  label: {
    class: [
      'text-gray-500 no-underline'
    ]
  },
  separator: {
    class: [
      'mx-1 text-gray-300'
    ]
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    unstyled: true,
    pt: {
      button: buttonDefaults,
      dialog: dialogDefaults,
      card: cardDefaults,
      toast: toastDefaults,
      inputtext: inputTextDefaults,
      password: passwordDefaults,
      checkbox: checkboxDefaults,
      breadcrumb: breadcrumbDefaults
    }
  })

  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('Card', Card)
  nuxtApp.vueApp.component('InputText', InputText)
  nuxtApp.vueApp.component('Password', Password)
  nuxtApp.vueApp.component('Checkbox', Checkbox)
  nuxtApp.vueApp.component('Dialog', Dialog)
  nuxtApp.vueApp.component('Breadcrumb', Breadcrumb)
}) 