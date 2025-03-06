/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/*.liquid',
    './templates/*.liquid',
    './sections/*.liquid',
    './snippets/*.liquid',
    './assets/*.{js,jsx,ts,tsx}',
    './assets/*.liquid'  // Add this line to include Liquid files in assets
  ],
  theme: {
    extend:
    {
      colors:
      {
        cardBorder: '#E8E8E8',
        cardBrand: '#111111',
        cardProductName: '#0A4874',
      },
    },
  },
  plugins: [],
}

