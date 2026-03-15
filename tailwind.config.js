module.exports = {
  purge: ['./app/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  content: ['./app/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', //Blue
        secondary: '#6b7280', //Gray
        danger: '#dc2626', //Red
        warning: '#f59e0b', //Yellow,
        success: '#16a34a', //Green
      },
      backgroundColor: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#2d2d2d',
        'dark-tertiary': '#3a3a3a',
      },
      textColor: {
        'dark-primary': '#e5e5e5',
        'dark-secondary': '#b3b3b3',
      },
      borderColor: {
        'dark-primary': '#404040',
        'dark-secondary': '#525252',
      },
    },
  },
  variants: {
    extend: {}
  },
  plugins: [require('@tailwindcss/forms')]
};
