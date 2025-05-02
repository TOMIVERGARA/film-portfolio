/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Quicksand", "sans-serif"], // Fuente principal (por defecto)
      accent: ["Playfair", "serif"], // Fuente de acento (personalizada)
    },
  },
  plugins: [],
};
