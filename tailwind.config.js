module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2563eb',
          DEFAULT: '#1d4ed8',
          dark: '#026ec7'
        },
        secondary: {
          light: '#a855f7',
          DEFAULT: '#9333ea',
          dark: '#7e22ce'
        },
        background: {
          light: '#fcf1e1',
          DEFAULT: '#1e293b',
          dark: '#0f172a'
        },
        surface: {
          light: '#ffffff',
          DEFAULT: '#334155',
          dark: '#1e293b'
        },
        text: {
          light: '#1e293b',
          DEFAULT: '#f8fafc',
          dark: '#f1f5f9'
        },
        accent: {
          light: '#3b82f6',
          DEFAULT: '#2563eb',
          dark: '#1d4ed8'
        }
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light", "dark"],
  },
}
