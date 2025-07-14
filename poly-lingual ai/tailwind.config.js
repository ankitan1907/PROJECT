/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary color with shades
        blue: {
          50: '#ebf5ff',
          100: '#d9ecff',
          200: '#b3d4ff',
          300: '#80b8ff',
          400: '#4d96ff',
          500: '#3b82f6', // Main primary color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Secondary color with shades
        purple: {
          50: '#f6f5ff',
          100: '#edebfe',
          200: '#dcd7fe',
          300: '#cabffd',
          400: '#ac94fa',
          500: '#8b5cf6', // Main secondary color
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Accent color with shades
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899', // Main accent color
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        // Dark mode foundations
        gray: {
          950: '#0A0A16', // Darkest - for backgrounds
          900: '#121224', // For components
          850: '#1A1A2E', // Lighter components
          800: '#212136', // Borders and separators
          700: '#313142', // Light borders
          600: '#434356', // Disabled elements
          500: '#57576B', // Disabled text
          400: '#767689', // Secondary text
          300: '#9797A8', // Primary text
          200: '#BABAD1', // High contrast text
          100: '#DEDDF4', // Highest contrast text
          50: '#F8F8FC', // Pure white text
        }
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 5px rgba(59, 130, 246, 0.5)',
        'glow': '0 0 10px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-xl': '0 0 20px rgba(59, 130, 246, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};