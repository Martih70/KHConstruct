/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'khc-primary': '#2C5F8D',      // Professional Blue
        'khc-secondary': '#4A7BA7',    // Lighter Blue
        'khc-accent': '#E67E22',       // Construction Orange
        'khc-neutral': '#34495E',      // Dark Gray
        'khc-light': '#ECF0F1',        // Light Gray
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
