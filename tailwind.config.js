/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'school-navy': '#1A237E',
        'band-gold': '#FFD700',
        'victory-red': '#C62828',
        'field-green': '#2E7D32',
        'silver-gray': '#9E9E9E',
      },
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 