module.exports = {
  purge: ['./app/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  content: ['./app/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: [require('@tailwindcss/forms')]
};
