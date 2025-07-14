/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          darkest: '#03045E',
          dark: '#0A4B70',
          medium: '#0077B6',
          DEFAULT: '#00B4D8',
          light: '#90E0EF',
          lightest: '#CAF0F8',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light: '#FFD6D6',
        },
        algae: {
          DEFAULT: '#4CAF50',
          light: '#C8E6C9',
        },
        warning: {
          DEFAULT: '#FFC107',
          light: '#FFF8E1',
        },
        danger: {
          DEFAULT: '#F44336',
          light: '#FFEBEE',
        },
        success: {
          DEFAULT: '#4CAF50',
          light: '#E8F5E9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'wave': 'wave 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      boxShadow: {
        'ocean': '0 4px 14px 0 rgba(0, 180, 216, 0.2)',
      },
    },
  },
  plugins: [],
}