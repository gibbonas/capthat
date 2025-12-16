/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'midnight-navy': '#0F172A',
        'electric-teal': '#2DD4BF',
        'soft-sand': '#F8FAFC',
        'accent-coral': '#FB7185',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


