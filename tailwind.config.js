/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    'node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Color System
        brand: {
          // Primary - Material Blue
          primary: '#1976D2',           // Material Blue 700
          'primary-light': '#42A5F5',   // Material Blue 400
          'primary-dark': '#1565C0',    // Material Blue 800
          'primary-hover': '#1565C0',   // Darker on hover
          'primary-contrast': '#FFFFFF', // White text on primary
          
          // Secondary - Material Teal
          secondary: '#00796B',         // Material Teal 700
          'secondary-light': '#26A69A', // Material Teal 400
          'secondary-dark': '#00695C',  // Material Teal 800
          'secondary-hover': '#00695C', // Darker on hover
          'secondary-contrast': '#FFFFFF', // White text on secondary
          
          // Tertiary - Material Purple
          tertiary: '#7B1FA2',          // Material Purple 700
          'tertiary-light': '#AB47BC',  // Material Purple 400
          'tertiary-dark': '#6A1B9A',   // Material Purple 800
          
          // Surface System
          background: '#FAFAFA',        // Material Grey 50
          surface: '#FFFFFF',           // Pure white
          'surface-variant': '#F5F5F5', // Material Grey 100
          'surface-hover': '#F5F5F5',   // Light gray on hover
          'surface-border': '#E0E0E0',  // Material Grey 300
          
          // Legacy aliases for compatibility
          header: '#1976D2',            // Maps to primary
          navigation: '#F5F5F5',        // Maps to surface-variant
          highlight: '#00796B',         // Maps to secondary
          accent: '#FB8C00',            // Material Orange 600
          'accent-light': '#FFB74D',    // Material Orange 300
          card: '#FFFFFF',              // Pure white
          
          // Text System
          'text-primary': '#212121',    // Material Grey 900
          'text-secondary': '#757575',  // Material Grey 600
          'text-disabled': '#9E9E9E',   // Material Grey 500
          'text-hint': '#BDBDBD',       // Material Grey 400
          'text-color': '#212121',      // Legacy alias
          'text-muted': '#757575',      // Legacy alias
          
          // Semantic Colors
          error: '#D32F2F',             // Material Red 700
          'error-light': '#EF5350',     // Material Red 400
          'error-dark': '#C62828',      // Material Red 800
          
          warning: '#F57C00',           // Material Orange 700
          'warning-light': '#FF9800',   // Material Orange 500
          'warning-dark': '#E65100',    // Material Orange 900
          
          success: '#388E3C',           // Material Green 700
          'success-light': '#66BB6A',   // Material Green 400
          'success-dark': '#2E7D32',    // Material Green 800
          
          info: '#0288D1',              // Material Light Blue 700
          'info-light': '#29B6F6',      // Material Light Blue 400
          'info-dark': '#01579B',       // Material Light Blue 900
          
          // Action Colors
          flash: '#1976D2',             // Primary blue
          
          // Dialog System
          'dialog-cancel': '#9E9E9E',          // Material Grey 500
          'dialog-cancel-hover': '#757575',    // Material Grey 600
          'dialog-edit': '#1976D2',            // Primary
          'dialog-edit-hover': '#1565C0',      // Primary dark
          'dialog-save': '#388E3C',            // Success
          'dialog-save-hover': '#2E7D32',      // Success dark
          'dialog-delete': '#D32F2F',          // Error
          'dialog-delete-hover': '#C62828',    // Error dark
          'dialog-primary': '#1976D2',         // Primary
          'dialog-primary-hover': '#1565C0',   // Primary dark
          'dialog-secondary': '#00796B',       // Secondary
          'dialog-secondary-hover': '#00695C', // Secondary dark
        },
        
        // Simplified primary scale for direct use
        primary: {
          DEFAULT: '#1976D2',   // Material Blue 700
          50: '#E3F2FD',        // Material Blue 50
          100: '#BBDEFB',       // Material Blue 100
          200: '#90CAF9',       // Material Blue 200
          300: '#64B5F6',       // Material Blue 300
          400: '#42A5F5',       // Material Blue 400
          500: '#2196F3',       // Material Blue 500
          600: '#1E88E5',       // Material Blue 600
          700: '#1976D2',       // Material Blue 700
          800: '#1565C0',       // Material Blue 800
          900: '#0D47A1',       // Material Blue 900
          hover: '#1565C0',     // Alias for hover state (800)
        },
        
        // Surface scale
        surface: {
          DEFAULT: '#FFFFFF',   // White
          card: '#FFFFFF',      // White cards
          variant: '#F5F5F5',   // Grey 100
          hover: '#F5F5F5',     // Grey 100
          border: '#E0E0E0',    // Grey 300
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
      },
      fontSize: {
        base: ['1rem', { lineHeight: '1.5' }],       // 16px - Material Design base
        h1: ['2.5rem', { lineHeight: '1.2', fontWeight: '400' }],  // 40px
        h2: ['2rem', { lineHeight: '1.3', fontWeight: '400' }],    // 32px
        h3: ['1.5rem', { lineHeight: '1.4', fontWeight: '400' }],  // 24px
        h4: ['1.25rem', { lineHeight: '1.5', fontWeight: '500' }], // 20px
        h5: ['1rem', { lineHeight: '1.5', fontWeight: '500' }],    // 16px
        h6: ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }], // 14px
      },
      boxShadow: {
        // Material Design Elevation System
        'elevation-1': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'elevation-2': '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        'elevation-3': '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
        'elevation-4': '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
        'elevation-5': '0 20px 40px rgba(0,0,0,0.2)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#212121', // Material Grey 900
            a: {
              color: '#1976D2', // Material Blue 700
              textDecoration: 'none',
              '&:hover': {
                color: '#1565C0', // Material Blue 800
                textDecoration: 'underline',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
  // Ensure Tailwind classes take precedence over PrimeVue styles
  important: true,
} 