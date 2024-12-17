/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        btn_secondary: "#FDA03A",
        base_color: "#F1F4F9",
        primary: "#1C22AA", // Azul personalizado
        secondary: "#d1d5db", // Gris claro personalizado
        danger: "#e11d48", // Rojo personalizado
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Inter como fuente principal
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

