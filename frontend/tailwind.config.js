/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // New AyoRecuts Brown-based Palette
        primary: {
          50: '#fef7f0',
          100: '#fef0e0',
          200: '#fdddb6',
          300: '#fcc982',
          400: '#fab245',
          500: '#f59e0b',  // Main warm brown/amber
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        secondary: {
          50: '#f5f3f0',
          100: '#e8e1d9',
          200: '#d4c2b1',
          300: '#c0a085',
          400: '#ac7e5a',  // Rich brown
          500: '#8b5a3c',
          600: '#774832',
          700: '#5d3727',
          800: '#432819',
          900: '#2d1b10',
        },
        accent: {
          50: '#f0f9f5',
          100: '#dcf2e6',
          200: '#bbe4cf',
          300: '#86d1b1',
          400: '#4ade80',  // Fresh green
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        neutral: {
          50: '#faf9f7',
          100: '#f5f2ee',
          200: '#e8e1d9',
          300: '#d6cab8',
          400: '#c4b097',
          500: '#a69176',  // Warm neutral
          600: '#8b7355',
          700: '#6b5940',
          800: '#4a3f2f',
          900: '#2c241a',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
        'bounce-soft': 'bounce-soft 2s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'blob': 'blob 7s infinite',
        'tilt': 'tilt 10s infinite linear',
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spin 6s linear infinite reverse',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' },
          'to': { boxShadow: '0 0 30px rgba(251, 191, 36, 0.8)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          'from': { transform: 'translateY(100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          'from': { transform: 'translateY(-100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          'from': { transform: 'scale(0.9)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(139, 90, 60, 0.37)',
        'glass-inset': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
        'warm': '0 10px 25px -3px rgba(245, 158, 11, 0.4), 0 4px 6px -2px rgba(245, 158, 11, 0.3)',
        'warm-lg': '0 25px 50px -12px rgba(245, 158, 11, 0.5)',
        'inner-warm': 'inset 0 2px 4px 0 rgba(245, 158, 11, 0.1)',
      },
    },
  },
  plugins: [],
};