/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pilzno Synagogue brand colors
        primary: {
          DEFAULT: '#6A1B9A',
          light: '#9C4DCC',
          dark: '#4A148C',
        },
        secondary: {
          DEFAULT: '#FFA726',
          light: '#FFD95B',
          dark: '#F57C00',
        },
        success: {
          DEFAULT: '#43A047',
          light: '#66BB6A',
          dark: '#2E7D32',
        },
      },
    },
  },
  plugins: [],
  // Important: Disable Tailwind's base styles to work with Material-UI
  corePlugins: {
    preflight: false, // Disable Tailwind's base/reset styles to avoid conflicts with MUI
  },
}

