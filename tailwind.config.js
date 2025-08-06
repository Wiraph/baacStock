/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Prompt"', '"Roboto"', '"Helvetica Neue"', 'sans-serif'],
        'prompt': ['"Prompt"', 'sans-serif'],
        'roboto': ['"Roboto"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), 
  ],
};
