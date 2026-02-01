/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'piggy-pink': '#FF69B4',
        'piggy-blue': '#4A90E2',
        'piggy-green': '#7ED321',
        'piggy-orange': '#F5A623',
        'piggy-cream': '#FFF8DC',
      }
    },
  },
  plugins: [],
}