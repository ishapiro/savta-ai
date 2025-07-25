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
          header: '#D16D84', // H1 - raspberry
          background: '#F9F6F2', // cream
          primary: '#333333', // text - darker gray was #5A5752
          secondary: '#6E4B63', // H2 - plum
          navigation: ' #e4e4e7;', // light grey
          highlight: '#41706C', // H3 - darker teal -- was #7BAAA7
          accent: '#F1B8B8', // H4 - blush
          warm: '#F4E4D6', // warm cream color
          card: '#F6E7D8', // light tan
          'dialog-cancel': 'rgba(130, 130, 130, 0.44)', 
          'dialog-edit': '#6E4B63', // same as secondary
          'dialog-save': '#41706C', // darker teal  -- was #7BAAA7
          'dialog-delete': '#D16D84', // raspberry
          'flash': '#3B82F6', // blue
        },
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
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Nunito"', 'sans-serif'],
      },
      fontSize: {
        h1: ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }], // 40px
        h2: ['2rem', { lineHeight: '1.3', fontWeight: '600' }],    // 32px
        h3: ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],  // 24px
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
} 