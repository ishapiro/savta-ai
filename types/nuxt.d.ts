declare module '#app' {
  interface NuxtApp {
    $supabase: any
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $supabase: any
  }
}

export {} 