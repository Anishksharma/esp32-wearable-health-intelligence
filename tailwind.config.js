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
        obsidian: {
          bg: '#0B0B0A',
          sidebar: '#10100E',
          card: '#171714',
          elevated: '#20201B',
          border: '#34342B',
          borderLight: '#47473B',
          borderDark: '#23231D',
          muted: '#6B6B5F',
        },
        primary: {
          DEFAULT: '#FF8A24',
          hover: '#FF9B42',
          active: '#E67616',
          dim: 'rgba(255, 138, 36, 0.15)',
        },
        secondary: {
          DEFAULT: '#B6F23A',
          hover: '#C4F558',
          dim: 'rgba(182, 242, 58, 0.15)',
        },
        healthy: {
          DEFAULT: '#54E38E',
          dim: 'rgba(84, 227, 142, 0.15)',
        },
        warning: {
          DEFAULT: '#FFB547',
          dim: 'rgba(255, 181, 71, 0.15)',
        },
        critical: {
          DEFAULT: '#FF4545',
          dim: 'rgba(255, 69, 69, 0.15)',
        },
        emergency: {
          DEFAULT: '#FF1744',
          dim: 'rgba(255, 23, 68, 0.15)',
        },
        text: {
          primary: '#F4F1E9',
          secondary: '#A6A69A',
          muted: '#6B6B5F',
        }
      },
      fontFamily: {
        display: ['Syne', 'Bebas Neue', 'sans-serif'],
        heading: ['Bebas Neue', 'Syne', 'sans-serif'],
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        'obsidian-glow': '0 0 20px -5px rgba(255, 138, 36, 0.25)',
        'obsidian-glow-sm': '0 0 10px -2px rgba(255, 138, 36, 0.18)',
        'lime-glow': '0 0 20px -5px rgba(182, 242, 58, 0.25)',
        'critical-glow': '0 0 20px -5px rgba(255, 69, 69, 0.35)',
      },
    },
  },
  plugins: [],
}
