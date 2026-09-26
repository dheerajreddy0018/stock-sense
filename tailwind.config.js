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
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        slate: {
          850: '#151f32',
          925: '#0b1120',
          950: '#060a12',
        },
        accent: {
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          indigo: '#6366f1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(34, 197, 94, 0.3)',
        'glow-accent': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'glow-danger': '0 0 20px -5px rgba(244, 63, 94, 0.3)',
      },
    },
  },
  plugins: [],
}
