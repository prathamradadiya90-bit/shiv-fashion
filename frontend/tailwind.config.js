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
          DEFAULT: '#7A2222', // Deep Maroon from screenshots
          light: '#942D2D',
          dark: '#591616',
        },
        secondary: {
          DEFAULT: '#C59D5F', // Gold from screenshots
          light: '#DAB882',
          dark: '#A67F47',
        },
        accent: {
          DEFAULT: '#FAF8F5', // Warm Cream from screenshots
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
