import { Lightbulb } from 'lucide-vue-next'

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
          // Primary - Material Dark Grey palette
          primary: '#212121',           // Very dark charcoal grey (Grey 900)
          'primary-light': '#616161',   // Medium grey (Grey 700)
          'primary-dark': '#424242',    // Dark charcoal grey (Grey 800)
          'primary-hover': '#424242',   // Dark charcoal grey on hover
          'primary-contrast': '#FFFFFF', // Pure white text on primary
          
          // Secondary - Material Teal
          secondary: '#00796B',         // Dark teal/cyan green (Teal 700)
          'secondary-light': '#26A69A', // Medium teal/aqua (Teal 400)
          'secondary-dark': '#00695C',  // Very dark teal (Teal 800)
          'secondary-hover': '#00695C', // Very dark teal on hover
          'secondary-contrast': '#FFFFFF', // Pure white text on secondary
          
          // Tertiary - Material Purple
          tertiary: '#7B1FA2',          // Deep purple (Purple 700)
          'tertiary-light': '#AB47BC',  // Medium bright purple (Purple 400)
          'tertiary-dark': '#6A1B9A',   // Very dark purple (Purple 800)
          
          // Surface System
          background: '#FAFAFA',        // Very light grey, almost white (Grey 50)
          surface: '#FFFFFF',           // Pure white
          'surface-variant': '#F5F5F5', // Very light grey (Grey 100)
          'surface-hover': '#F5F5F5',   // Very light grey on hover
          'surface-border': '#E0E0E0',  // Light grey border (Grey 300)
          
          // Legacy aliases for compatibility
          header: '#1976D2',            // Medium blue (Blue 700) - maps to primary
          navigation: '#F5F5F5',        // Very light grey - maps to surface-variant
          highlight: '#E91E63',         // Vibrant pink (Pink 500)
          accent: '#FB8C00',            // Bright orange (Orange 600)
          'accent-light': '#FFB74D',    // Light peachy orange (Orange 300)
          card: '#FFFFFF',              // Pure white
          
          // Text System
          'text-primary': '#212121',    // Very dark charcoal grey (Grey 900)
          'text-secondary': '#757575',  // Medium grey (Grey 600)
          'text-disabled': '#9E9E9E',   // Light grey (Grey 500)
          'text-hint': '#BDBDBD',       // Very light grey (Grey 400)
          'text-color': '#212121',      // Very dark charcoal grey - legacy alias
          'text-muted': '#757575',      // Medium grey - legacy alias
          
          // Semantic Colors
          error: '#D32F2F',             // Dark red (Red 700)
          'error-light': '#EF5350',     // Medium bright red (Red 400)
          'error-dark': '#C62828',      // Very dark red (Red 800)
          
          warning: '#F57C00',           // Dark orange (Orange 700)
          'warning-light': '#FF9800',   // Bright orange (Orange 500)
          'warning-dark': '#E65100',    // Very dark orange/burnt orange (Orange 900)
          
          success: '#388E3C',           // Dark green (Green 700)
          'success-light': '#66BB6A',   // Medium bright green (Green 400)
          'success-dark': '#2E7D32',    // Very dark green (Green 800)
          
          info: '#0288D1',              // Medium blue (Light Blue 700)
          'info-light': '#29B6F6',      // Bright sky blue (Light Blue 400)
          'info-dark': '#01579B',       // Very dark blue (Light Blue 900)
          
          // Action Colors
          flash: '#E53935',             // Vibrant red (Red 600)
          
          // Dialog System
          'dialog-cancel': '#9E9E9E',          // Light grey (Grey 500)
          'dialog-cancel-hover': '#757575',    // Medium grey on hover (Grey 600)
          'dialog-edit': '#1976D2',            // Medium blue (Blue 700)
          'dialog-edit-hover': '#1565C0',      // Dark blue on hover (Blue 800)
          'dialog-save': '#388E3C',            // Dark green (Green 700)
          'dialog-save-hover': '#2E7D32',      // Very dark green on hover (Green 800)
          'dialog-delete': '#D32F2F',          // Dark red (Red 700)
          'dialog-delete-hover': '#C62828',    // Very dark red on hover (Red 800)
          'dialog-primary': '#1976D2',         // Medium blue (Blue 700)
          'dialog-primary-hover': '#1565C0',   // Dark blue on hover (Blue 800)
          'dialog-secondary': '#00796B',       // Dark teal/cyan green (Teal 700)
          'dialog-secondary-hover': '#00695C', // Very dark teal on hover (Teal 800)
          
          // Info/Help Button System
          'info-letter': '#16A34A',            // Medium green (Green 600) for "i" icon
          'info-outline': '#16A34A',           // Medium green (Green 600) for border
        },
        
        // Simplified primary scale for direct use
        primary: {
          DEFAULT: '#1976D2',   // Medium blue (Blue 700)
          50: '#E3F2FD',        // Very pale blue, almost white (Blue 50)
          100: '#BBDEFB',       // Pale sky blue (Blue 100)
          200: '#90CAF9',       // Light sky blue (Blue 200)
          300: '#64B5F6',       // Light blue (Blue 300)
          400: '#42A5F5',       // Medium bright blue (Blue 400)
          500: '#2196F3',       // Bright blue (Blue 500)
          600: '#1E88E5',       // Medium blue, slightly darker (Blue 600)
          700: '#1976D2',       // Medium blue (Blue 700)
          800: '#1565C0',       // Dark blue (Blue 800)
          900: '#0D47A1',       // Very dark blue (Blue 900)
          hover: '#1565C0',     // Dark blue on hover - alias for 800
        },
        
        // Surface scale
        surface: {
          DEFAULT: '#FFFFFF',   // Pure white
          card: '#FFFFFF',      // Pure white for cards
          variant: '#F5F5F5',   // Very light grey (Grey 100)
          hover: '#F5F5F5',     // Very light grey on hover (Grey 100)
          border: '#E0E0E0',    // Light grey for borders (Grey 300)
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