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
          link:       'var(--tg-theme-link-color, #2563eb)',
          button:     'var(--tg-theme-button-color, #2563eb)',
          buttonText: 'var(--tg-theme-button-text-color, #ffffff)',
        },
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config
