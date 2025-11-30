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
          50: '#e5fad4',
          100: '#c8f699',
          200: '#b3df88',
          300: '#a0c779',
          400: '#8bae69',
          500: '#79975b',
          600: '#67824d',
          700: '#566c40',
          800: '#455833',
          900: '#354426',
        },
      },
    },
  },
  plugins: [],
}



