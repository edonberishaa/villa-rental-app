/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // This is important for React TypeScript
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: "#0ea5e9" // Customize as you want
        }
      }
    }
  },
  plugins: [],
}
