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
          600: '#55c57a', // Primary green (main green)
          700: '#2e864b', // Hover dark green
          800: '#1e40af', 
          1000: '#444',   // Header background
        },
        green: {
          light: '#7dd56f',
          main: '#55c57a',
          dark: '#28b485',
        },
        grey: {
          light: '#f7f7f7',
          main: '#777',
          dark: '#333',
          100: '#bbb',
          200: '#999',
          300: '#eee',
          400: '#f2f2f2',
          500: '#ccc',
          600: '#888',
        },
        orange: {
            main: '#ff7730',
        }
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
      borderRadius: {
        '3px': '3px',
      },
      boxShadow: {
        'card': '0 1.5rem 4rem rgba(0, 0, 0, 0.1)',
        'header': '0 1.2rem 2.4rem rgba(0, 0, 0, 0.03)',
        'btn': '0 1rem 2rem rgba(0, 0, 0, 0.15)',
        'btn-active': '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
      },
      spacing: {
        'side-nav': '32rem',
      }
    },
  },
  plugins: [],
}

