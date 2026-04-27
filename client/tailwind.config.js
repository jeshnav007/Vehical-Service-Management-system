/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        accent: "#06b6d4",
        darkbg: "#0f172a",
        lightbg: "#f8fafc"
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.15)"
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.5rem"
      },
      backdropBlur: {
        xs: "2px"
      }
    },
  },
  plugins: [],
}
