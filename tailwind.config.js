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
        gold: {
          50:  '#fefdf0',
          100: '#fdf8d0',
          200: '#faf099',
          300: '#f5e162',
          400: '#eeca34',
          500: '#d9ab18',
          600: '#b88510',
          700: '#8f6110',
          800: '#764e14',
          900: '#644115',
          950: '#3a2107',
        },
      },
    },
  },
  plugins: [],
};
