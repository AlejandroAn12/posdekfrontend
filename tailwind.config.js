/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
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
      components: {
        'btn-primary': {
          padding: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          borderRadius: '0.375rem',
          borderWidth: '1px',
          '&:hover': {
            backgroundColor: 'var(--colorSecondary)',
            color: 'white',
          },
        },
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

