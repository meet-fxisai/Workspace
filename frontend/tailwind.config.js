/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
}
