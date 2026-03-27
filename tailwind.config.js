export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#a04100',
        'primary-container': '#ff6b00',
        'on-primary': '#ffffff',
        surface: '#fcf9f8',
        'surface-container-low': '#f6f3f2',
        'surface-container': '#f0edec',
        'surface-container-high': '#ebe7e7',
        'surface-container-highest': '#e5e2e1',
        'surface-container-lowest': '#ffffff',
        'on-surface': '#1c1b1b',
        'on-surface-variant': '#5a4136',
        outline: '#8e7164',
        'outline-variant': '#e2bfb0',
        'inverse-surface': '#313030',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
