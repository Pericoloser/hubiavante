/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        iavante: {
          50:  '#eef4ff',
          100: '#dce9ff',
          200: '#b2d4ff',
          300: '#76b5ff',
          400: '#338bff',
          500: '#0062e6',
          600: '#004db8',
          700: '#003a8a',
          800: '#002a63',
          900: '#001940',
          950: '#000d24'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
