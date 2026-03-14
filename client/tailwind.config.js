/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a2238",
        secondary: "#9daaf2",
        accent1: "#ff6a3d",
        accent2: "#f4db7d",
      },
      fontFamily: {
        bricolage: ["'Bricolage Grotesque'", "sans-serif"],
        jost: ["Jost", "sans-serif"],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
