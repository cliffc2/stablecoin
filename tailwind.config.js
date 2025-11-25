// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hkgov-blue': '#003882',
        'hkgov-red': '#DE2910',
      },
    },
  },
  plugins: [],
}
