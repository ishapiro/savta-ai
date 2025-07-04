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
        primary: {
          DEFAULT: 'var(--primary-color)',
          hover: 'var(--primary-hover-color)',
          active: 'var(--primary-active-color)',
          contrast: 'var(--primary-contrast-color)'
        },
        surface: {
          DEFAULT: 'var(--surface-ground)',
          section: 'var(--surface-section)',
          card: 'var(--surface-card)',
          hover: 'var(--surface-hover)',
          border: 'var(--surface-border)',
          highlight: 'var(--surface-hover)',
          text: 'var(--text-color)',
          'text-secondary': 'var(--text-color-secondary)',
          'text-muted': 'var(--text-color-secondary)'
        },
        lara: {
          50:  '#f6f3fc',
          100: '#e7dbfa',
          200: '#d0b7f5',
          300: '#b18af0',
          400: '#995ae9',
          500: '#7e22ce',
          600: '#6b21a8',
          700: '#581c87',
          800: '#3b0764',
          900: '#2e0854',
          DEFAULT: '#7e22ce',
          'color-text': '#ffffff',
          'surface-0': '#ffffff',
          'surface-50': '#f8f9fa',
          'surface-100': '#f4f4f5',
          'surface-200': '#e4e4e7',
          'surface-300': '#d4d4d8',
          'surface-400': '#a1a1aa',
          'surface-500': '#71717a',
          'surface-600': '#52525b',
          'surface-700': '#3f3f46',
          'surface-800': '#27272a',
          'surface-900': '#18181b',
          'surface-950': '#09090b',
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--text-color)',
            a: {
              color: 'var(--primary-color)',
              '&:hover': {
                color: 'var(--primary-hover-color)',
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
    require('@tailwindcss/line-clamp'),
  ],
  // Ensure Tailwind classes take precedence over PrimeVue styles
  important: true,
  // Configure the order of CSS layers
  corePlugins: {
    preflight: false,
  },
} 