/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C2410C',
        primaryDark: '#7C2D12',
        secondary: '#FEF3C7',
        surface: '#FFFBEB',
        accent: '#166534',
        warning: '#CA8A04',
        danger: '#B91C1C',
        text: '#1C1917',
        muted: '#78716C',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Poppins"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
