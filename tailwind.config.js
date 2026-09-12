/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eink: {
          bg: '#f4f4f0',
          card: '#ebeae4',
          border: '#18181c',
          text: '#0d0d0f',
          subtext: '#4a4943',
          accent: '#2a2925',
          highlight: '#ffffff',
        },
        noir: {
          bg: '#0d0d0f',
          card: '#16161a',
          border: '#33333e',
          text: '#f4f4f0',
          subtext: '#9a9aa6',
          accent: '#e4e4e0',
          highlight: '#22222a',
        }
      },
      fontFamily: {
        serif: ['Bookerly', 'Newsreader', 'Georgia', 'serif'],
        pixel: ['"Pixelify Sans"', '"Press Start 2P"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'pixel-sm': '2px 2px 0px 0px currentColor',
        'pixel': '4px 4px 0px 0px currentColor',
        'pixel-lg': '6px 6px 0px 0px currentColor',
        'pixel-inset': 'inset 2px 2px 0px 0px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'blink': 'blink 1s steps(1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
