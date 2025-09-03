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
          background: '#F9F6F2', // cream #F9F6F2
          primary: '#333333', // text - darker gray was #5A5752
          secondary: '#6E4B63', // H2 - plum
          navigation: '#e4e4e7', // light grey
          highlight: '#41706C', // H3 - darker teal -- was #7BAAA7
          accent: '#F1B8B8', // H4 - blush
          warm: '#F4E4D6', // warm cream color #F4E4D6
          card: '#F6E7D8', // light tan
          primary: '#333333', // text - darker gray was #5A5752
          'primary-hover-color': '#4A4742', // darker gray was #5A5752
          'primary-active-color': '#3A3732', // even darker gray was #3A3732
          'primary-contrast-color': '#ffffff', // white
          'surface-ground': '#F9F6F2', // cream
          'surface-section': '#ffffff', // white
          'surface-card': '#ffffff', // white
          'surface-hover': '#f4f4f5', // light grey
          'surface-border': '#e4e4e7', // light grey
          'text-color': '#333333', // text - darker gray was #5A5752
          'text-color-secondary': '#6E4B63', // H2 - plum
          'text-muted': '#6E4B63', // H2 - plum
          'dialog-cancel': 'rgba(130, 130, 130, 0.44)', 
          'dialog-cancel-hover': 'rgba(100, 100, 100, 0.6)',
          'dialog-edit': '#6E4B63', // same as secondary
          'dialog-edit-hover': '#5A3F52', // darker plum
          'dialog-save': '#41706C', // darker teal  -- was #7BAAA7
          'dialog-save-hover': '#355A57', // darker teal
          'dialog-delete': '#D16D84', // raspberry #B85A6F
          'dialog-delete-hover': '#B85A6F', // darker raspberry #B85A6F
          'dialog-primary': '#6E4B63', // plum - for primary actions #6E4B63
          'dialog-primary-hover': '#5A3F52', // darker plum
          'dialog-secondary': '#F4E4D6', // warm cream - for secondary actions
          'dialog-secondary-hover': '#E8D4C2', // darker warm cream
          'flash': '#4A90E2', // compatible blue that works with brand palette
        },
        primary: {
          DEFAULT: '#333333', // brand.primary
          hover: '#4A4742', // brand.primary-hover-color
          active: '#3A3732', // brand.primary-active-color
          contrast: '#ffffff' // brand.primary-contrast-color
        },
        surface: {
          DEFAULT: '#F9F6F2', // brand.surface-ground
          section: '#ffffff', // brand.surface-section
          card: '#ffffff', // brand.surface-card
          hover: '#f4f4f5', // brand.surface-hover
          border: '#e4e4e7', // brand.surface-border
          highlight: '#f4f4f5', // brand.surface-hover
          text: '#333333', // brand.text-color
          'text-secondary': '#6E4B63', // brand.text-color-secondary
          'text-muted': '#6E4B63' // brand.text-color-secondary
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
            color: '#333333', // brand.text-color
            a: {
              color: '#333333', // brand.primary
              '&:hover': {
                color: '#4A4742', // brand.primary-hover-color
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