/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff1f2",
          100: "#ffe0e3",
          200: "#ffc7cc",
          300: "#ffa0a9",
          400: "#ff6b78",
          500: "#f83b4d",
          600: "#e5192e",
          700: "#C41E3A",
          800: "#9f1239",
          900: "#881337",
        }
      }
    }
  },
  plugins: []
}
