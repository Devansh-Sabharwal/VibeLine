/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': 'linear-gradient(225deg, #17254A 0%, #151226 40%, #431F54 100%);',
      },
      fontFamily: {
        anta: ['Anta', 'sans-serif'], // Register the Anta font
      },
    },
  },
  plugins: [],
}
//background-image: linear-gradient( 135deg, #FF7AF5 10%, #513162 100%);