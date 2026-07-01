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
        background: "#0c160a",
        "surface-bright": "#313c2e",
        "on-primary": "#003907",
        "secondary-container": "#00e3fd",
        primary: "#ebffe2",
        "on-secondary": "#00363d",
        "primary-fixed": "#72ff70",
        "on-surface-variant": "#b9ccb2",
        secondary: "#bdf4ff",
        "outline-variant": "#3b4b37",
        "primary-fixed-dim": "#00e639",
        surface: "#0c160a",
        "secondary-fixed-dim": "#00daf3",
        "on-surface": "#dae6d2",
        "primary-container": "#00ff41",
        error: "#ffb4ab",
        outline: "#84967e",
        "surface-variant": "#2d382a",
        "surface-container-highest": "#2d382a",
        "tertiary-fixed-dim": "#e7bf99",
      },
      fontFamily: {
        "body-md": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "data-point": ["Inter", "sans-serif"],
        "mono-label": ["Inter", "monospace"],
      },
    },
  },
  plugins: [],
}
