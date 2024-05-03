/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Define your color palette for both light and dark mode
        light: {
          primary: '#ff0000', // Example color
          // Add more colors as needed
        },
        dark: {
          primary: '#00ff00', // Example color
          // Add more colors as needed
        },
      },
    },
  },
  plugins: [],
}

