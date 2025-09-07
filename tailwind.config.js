// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      keyframes: {
        breathing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.9' },
        },
        flash: {
          '0%, 100%': { color: '#00f6e6' },
          '50%': { color: '#ffffff' },
        },
        starLoop: {
          '0%': { transform: 'translate(0,0) rotate(0deg)' },
          '25%': { transform: 'translate(20%,10%) rotate(90deg)' },
          '50%': { transform: 'translate(0%,20%) rotate(180deg)' },
          '75%': { transform: 'translate(-20%,10%) rotate(270deg)' },
          '100%': { transform: 'translate(0,0) rotate(360deg)' },
        },
        starLoop2: {
          '0%': { transform: 'translate(0,0) rotate(0deg)' },
          '25%': { transform: 'translate(-15%,-10%) rotate(90deg)' },
          '50%': { transform: 'translate(0%,15%) rotate(180deg)' },
          '75%': { transform: 'translate(15%,-10%) rotate(270deg)' },
          '100%': { transform: 'translate(0,0) rotate(360deg)' },
        },
        auraBounce: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.3)', opacity: '0.6' },
        },
      },
      animation: {
        breathing: 'breathing 0.6s ease-in-out infinite',
        flash: 'flash 0.6s infinite',
        starLoop: 'starLoop 5s linear infinite',
        starLoop2: 'starLoop2 7s linear infinite',
        auraBounce: 'auraBounce 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
