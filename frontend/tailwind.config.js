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
          DEFAULT: '#8B3A3A', // Royal Maroon from reference
          light: '#A34B4B',
          dark: '#6B2C2C',
        },
        secondary: {
          DEFAULT: '#D4AF37', // Primary Gold from reference
          light: '#E5C45B',
          dark: '#B5952F',
        },
        accent: {
          DEFAULT: '#F9F7F4', // Light gray from reference
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
