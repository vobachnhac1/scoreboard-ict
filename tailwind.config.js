module.exports = {
  purge: ['./app/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  content: ['./app/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', //Blue
        secondary: '#6b7280', //Gray
        danger: '#dc2626', //Red
        warning: '#f59e0b', //Yellow,
        success: '#16a34a', //Green
      },
    },
  },
  variants: {
    extend: {}
  },
  plugins: [require('@tailwindcss/forms')]
};
