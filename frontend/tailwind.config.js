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
          DEFAULT: '#800020', // Deep maroon
          light: '#a61c3a',
          dark: '#5a0015',
        },
        secondary: {
          DEFAULT: '#FFD700', // Gold
          light: '#ffea70',
          dark: '#ccac00',
        },
        accent: {
          DEFAULT: '#FFFDD0', // Cream
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
