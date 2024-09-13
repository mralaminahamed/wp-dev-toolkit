/** @type {import('tailwindcss').Config} */
module.exports = {
  important: '#wp-dev-toolkit-app',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
