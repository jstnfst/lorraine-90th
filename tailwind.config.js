/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        lavender: {
          50:  '#F9F5FF',
          100: '#EFE5FF',
          200: '#DCC8F8',
          300: '#C4A5D9',
          400: '#A67BC4',
          500: '#8B5E9E',
          600: '#6E4A87',
          700: '#573A71',
          800: '#3D2156',
          900: '#2E1540',
          950: '#1C0B2C',
        },
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
      },
    },
  },
  plugins: [],
};
