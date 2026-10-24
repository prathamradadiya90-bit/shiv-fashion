/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#374151',
          700: '#1F2937',
          800: '#111827',
          900: '#0B0F17',
          DEFAULT: '#000000', // Pure Onyx Black
          light: '#262626',
          dark: '#000000',
          deep: '#000000',
        },
        secondary: {
          50: '#FFFFFF',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          DEFAULT: '#18181B', // Sleek Graphite / Charcoal
          light: '#52525B',
          dark: '#09090B',
          rich: '#000000',
          shimmer: '#E4E4E7',
        },
        accent: {
          DEFAULT: '#F8F9FA', // Crisp Off-White / Pearl
          warm: '#F4F4F5',
          light: '#FFFFFF',
          dark: '#E4E4E7',
        },
        velvet: {
          DEFAULT: '#0A0A0A', // Noir Black
          dark: '#000000',
        },
        emerald: {
          DEFAULT: '#27272A',
          dark: '#18181B',
        }
      },
      fontFamily: {
        display: ['Cinzel', 'Cormorant Garamond', 'serif'],
        heading: ['Cormorant Garamond', 'Playfair Display', 'serif'],
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Jost', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(0, 0, 0, 0.15)',
        'gold-glow-lg': '0 0 35px rgba(0, 0, 0, 0.25)',
        'royal': '0 10px 30px -10px rgba(0, 0, 0, 0.25)',
        'noir': '0 20px 40px -15px rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
