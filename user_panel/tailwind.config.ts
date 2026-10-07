import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tg: {
          bg:         'var(--tg-theme-bg-color, #ffffff)',
          secondary:  'var(--tg-theme-secondary-bg-color, #f4f4f5)',
          text:       'var(--tg-theme-text-color, #111827)',
          hint:       'var(--tg-theme-hint-color, #9ca3af)',
          link:       'var(--tg-theme-link-color, #667eea)',
          button:     'var(--tg-theme-button-color, #667eea)',
          buttonText: 'var(--tg-theme-button-text-color, #ffffff)',
        },
        primary: {
          50:  '#f5f7ff',
          100: '#ebf0ff',
          200: '#dce4ff',
          300: '#bac8ff',
          400: '#94a6ff',
          500: '#667eea',
          600: '#5568d3',
          700: '#4854b8',
          800: '#3d4495',
          900: '#353a78',
        },
        accent: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        dental: {
          mint: '#4ade80',
          blue: '#60a5fa',
          purple: '#a78bfa',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(102, 126, 234, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config
