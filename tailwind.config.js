/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f7f8fa',
          100: '#eef0f4',
          200: '#e0e4ec',
          300: '#c3cad9',
          400: '#96a0b5',
          500: '#6b768e',
          600: '#515c74',
          700: '#3f485d',
          800: '#2b3244',
          900: '#171a26',
          950: '#0d0f18',
        },
        brand: {
          50: '#eef3ff',
          100: '#dce6ff',
          200: '#c0d1ff',
          300: '#96b1ff',
          400: '#6488ff',
          500: '#3d5fff',
          600: '#2440f0',
          700: '#1c31d6',
          800: '#1c2cab',
          900: '#1d2c86',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)',
        soft: '0 2px 8px -2px rgba(16,24,40,.08), 0 4px 16px -4px rgba(16,24,40,.06)',
        lift: '0 12px 32px -12px rgba(16,24,40,.18), 0 4px 12px -4px rgba(16,24,40,.08)',
        pop: '0 24px 64px -16px rgba(16,24,40,.28), 0 8px 24px -8px rgba(16,24,40,.12)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .2s cubic-bezier(.16,1,.3,1)',
        'scale-in': 'scale-in .14s cubic-bezier(.16,1,.3,1)',
        'slide-up': 'slide-up .28s cubic-bezier(.16,1,.3,1)',
      },
    },
  },
  plugins: [],
};
