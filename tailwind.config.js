/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx,css}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        btnColorPrimary: "#1C22AA",
        btnColorSecondary: "#FDA03A",
        btnColorDanger:"#e11d48",
        baseColor: "#F1F4F9", //Color base gris para el body
        colorPrimary: "#1C22AA", //Color azul principal
        colorSecondary: "#FDA03A", //Color naranja secundario
        colorDanger: "#e11d48", // Color rojo
      },
      fontFamily: {
        sans: ['Noto', 'ui-sans-serif', 'system-ui'],// Inter como fuente principal
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

