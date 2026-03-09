/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7f7f7', // Light background
          100: '#7dd56f', // Light green
          200: '#55c57a', // Main green
          300: '#28b485', // Dark green
          400: '#777',    // Text gray
          500: '#333',    // Darker gray
          600: '#55c57a', // Primary action color (matches main green)
          700: '#2e864b', // Hover action color
          800: '#1e40af', 
          900: '#1e3a8a', 
        },
        green: {
          light: '#7dd56f',
          main: '#55c57a',
          dark: '#28b485',
        }
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

