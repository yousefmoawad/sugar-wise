/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- IMPORTANT: This enables your dark mode toggle
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // <--- This scans all your React files for styles
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}