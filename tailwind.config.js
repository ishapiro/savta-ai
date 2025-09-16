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
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out',
        'fade-in-down': 'fadeInDown 1s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeInDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-20px)'
          }
        },
        glow: {
          '0%': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
          },
          '100%': {
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.3)'
          }
        },
      },
      colors: {
        brand: {
          // Primary Brand Identity - Bright & Welcoming
          header: '#9F1239',        // Sophisticated burgundy-rose (was #FF6B9D vibrant coral-pink)
          background: '#FEFCF8',    // Bright warm white (was #F9F6F2 cream)
          primary: '#2D3748',       // Modern charcoal #2D3748 (was #333333 dark gray)
          'primary-hover-color': '#4A5568',    // Modern hover state
          'primary-active-color': '#2D3748',   // Active state
          'primary-contrast-color': '#FFFFFF', // White text
          secondary: '#1E3A8A',     // Navy blue #1E3A8A (was #3B82F6 warm blue)
          
          // Navigation & UI Elements
          navigation: '#F1F5F9',    // Cool light gray (was #e4e4e7)
          highlight: '#41706C',     // Teal #41706C(was Emerald green  #10B981)
          accent: '#D97706',        // Sophisticated amber (was #F59E0B bright golden amber)
          'accent-light': '#FDE68A',          // Rich yellow (was #FEF3C7 very light yellow)
          card: '#FFFFFF',          // Pure white (was #F6E7D8 tan)
          
          // Surface System - Clean & Modern
          'surface-ground': '#FEFCF8',         // Bright warm white
          'surface-section': '#FFFFFF',        // Pure white
          'surface-card': '#FFFFFF',           // Pure white
          'surface-hover': '#F8FAFC',          // Subtle hover
          'surface-border': '#E2E8F0',        // Modern border
          
          // Text System - High Contrast & Readable
          'text-color': '#2D3748',            // Modern charcoal
          'text-color-secondary': '#1E3A8A',  // Navy blue
          'text-muted': '#64748B',            // Modern muted gray
          
          // Dialog System - Enhanced & Playful
          'dialog-cancel': 'rgba(100, 116, 139, 0.2)',      // Modern cancel
          'dialog-cancel-hover': 'rgba(100, 116, 139, 0.4)', // Hover state
          'dialog-edit': '#1E3A8A',           // Navy blue
          'dialog-edit-hover': '#1E40AF',     // Darker navy blue
          'dialog-save': '#41706C',           // Teal
          'dialog-save-hover': '#2D4A47',     // Darker teal
          'dialog-delete': '#9F1239',         // Sophisticated burgundy-rose (was #FF6B9D vibrant coral)
          'dialog-delete-hover': '#7F0D2E',   // Darker burgundy-rose (was #EC4899 darker coral)
          'dialog-primary': '#1E3A8A',        // Navy blue
          'dialog-primary-hover': '#1E40AF',  // Darker navy blue
          'dialog-secondary': '#FDE68A',      // Rich yellow (was #FEF3C7 soft yellow)
          'dialog-secondary-hover': '#FCD34D', // Darker yellow (was #FDE68A)
          
          // Modern Accent Colors
          'flash': '#1E3A8A',                 // Navy blue
          'success': '#41706C',               // Teal
          'warning': '#D97706',                // Sophisticated amber (was #F59E0B bright golden amber)
          'error': '#DC2626',                 // Sophisticated red (was #EF4444 bright red)
          'info': '#1E3A8A',                  // Navy blue
        },
        primary: {
          DEFAULT: '#2D3748', // brand.primary - Modern charcoal
          hover: '#4A5568', // brand.primary-hover-color - Modern hover state
          active: '#2D3748', // brand.primary-active-color - Active state
          contrast: '#FFFFFF' // brand.primary-contrast-color - White text
        },
        surface: {
          DEFAULT: '#FEFCF8', // brand.surface-ground - Bright warm white
          section: '#FFFFFF', // brand.surface-section - Pure white
          card: '#FFFFFF', // brand.surface-card - Pure white
          hover: '#F8FAFC', // brand.surface-hover - Subtle hover
          border: '#E2E8F0', // brand.surface-border - Modern border
          highlight: '#F8FAFC', // brand.surface-hover - Subtle hover
          text: '#2D3748', // brand.text-color - Modern charcoal
          'text-secondary': '#1E3A8A', // brand.text-color-secondary - Navy blue
          'text-muted': '#64748B' // brand.text-color-secondary - Modern muted gray
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
      },
      fontSize: {
        base: ['0.9375rem', { lineHeight: '1.5' }], // 15px (1pt smaller than default 16px)
        h1: ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }], // 40px
        h2: ['2rem', { lineHeight: '1.3', fontWeight: '600' }],    // 32px
        h3: ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],  // 24px
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#2D3748', // brand.text-color - Modern charcoal
            a: {
              color: '#2D3748', // brand.primary - Modern charcoal
              '&:hover': {
                color: '#4A5568', // brand.primary-hover-color - Modern hover state
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