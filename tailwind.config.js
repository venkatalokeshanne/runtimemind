/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          0: '#f7f7f5',
          50: '#f2f1ee',
          100: '#e7e5df',
          200: '#d8d6cf',
          900: '#0f172a',
          950: '#0b1220',
        },
        neutral: {
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        primary: {
          50: '#eef3ff',
          100: '#dbe7ff',
          200: '#b7d0ff',
          300: '#91b7ff',
          400: '#6696ff',
          500: '#4f8bff',
          600: '#2f6bdf',
          700: '#1f53ba',
          800: '#1b4493',
          900: '#14326b',
        },
        accent: {
          100: '#e9fbf5',
          200: '#c9f3e5',
          400: '#7ad2ae',
          600: '#45b68d',
          800: '#2c8a67',
        },
        surface: {
          0: '#ffffff',
          50: '#fbfbfa',
          100: '#f5f4f2',
          200: '#eceae6',
          900: '#0f172a',
          950: '#0b1220',
        },
        border: {
          light: '#e5e7eb',
          subtle: '#d1d5db',
          dark: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        soft: '0 10px 35px rgba(15, 23, 42, 0.08)',
        card: '0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl: '14px',
      },
      maxWidth: {
        prose: '70ch',
      },
    },
  },
  plugins: [],
};
