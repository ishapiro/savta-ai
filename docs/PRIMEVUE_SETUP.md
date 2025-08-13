# PrimeVue Setup Documentation

## Overview

This project uses a **manual PrimeVue integration** rather than Nuxt modules. This approach provides better control and avoids module conflicts.

## ⚠️ Important Warnings

**DO NOT install these packages:**
- `@nuxtjs/primevue`
- `primevue/nuxt`
- Any other Nuxt PrimeVue modules

**DO NOT add to nuxt.config.ts:**
```typescript
// ❌ WRONG - Don't do this
modules: [
  'primevue/nuxt'  // This will break the setup
]
```

## ✅ Current Setup

### 1. Manual Plugin (`plugins/primevue.ts`)
- Registers all PrimeVue components manually
- Configures PrimeVue with custom settings
- Handles tooltip directive registration

### 2. CSS Imports (`nuxt.config.ts`)
```typescript
css: [
  'primevue/resources/themes/lara-light-purple/theme.css',
  'primevue/resources/primevue.css',
  'primeicons/primeicons.css',
  '@/assets/css/main.css'
]
```

### 3. Build Configuration
```typescript
build: {
  transpile: ['primevue']
}
```

## 🔧 Troubleshooting

### If you see component errors:
1. **Check `plugins/primevue.ts`** - Ensure the component is registered
2. **Check component imports** - Verify the import path is correct
3. **Run cleanup script** - `./scripts/cleanup.sh`
4. **Restart dev server** - `npm run dev`

### Common Error Messages:
```
[Vue warn]: Failed to resolve component: Dropdown
[Vue warn]: Failed to resolve directive: tooltip
```

**Solution:** Add the missing component to `plugins/primevue.ts`

## 📝 Adding New Components

To add a new PrimeVue component:

1. **Import the component:**
```typescript
import NewComponent from 'primevue/newcomponent'
```

2. **Add to components object:**
```typescript
const components = {
  // ... existing components
  NewComponent
}
```

3. **Register automatically:**
```typescript
Object.entries(components).forEach(([name, component]) => {
  nuxtApp.vueApp.component(name, component)
})
```

## 🎯 Why Manual Setup?

- **Better control** over component registration
- **No module conflicts** with other Nuxt modules
- **Easier debugging** - all setup in one file
- **Custom configuration** without module limitations
- **Direct access** to PrimeVue features

## 📚 Related Files

- `plugins/primevue.ts` - Main PrimeVue configuration
- `nuxt.config.ts` - CSS imports and build settings
- `README.md` - Project overview with PrimeVue notes 