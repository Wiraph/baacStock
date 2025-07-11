/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // หากคุณใช้ plugin typography
  ],
};
