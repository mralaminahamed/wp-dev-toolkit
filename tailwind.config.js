/** @type {import('tailwindcss').Config} */
module.exports = {
  important: '#wp-dev-toolkit-app',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  prefix: 'wdt-',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6fc',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2271b1', // WP Admin primary color
          600: '#135e96', // WP Admin darker primary
          700: '#0a4b78',
          800: '#074973',
          900: '#033f63',
        },
        secondary: {
          50: '#f9fafb',
          100: '#f0f0f1', // WP Admin secondary
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        danger: {
          500: '#d63638', // WP Admin error/danger color
        },
        success: {
          500: '#00a32a', // WP Admin success color
        },
        warning: {
          500: '#dba617', // WP Admin warning color
        },
        info: {
          500: '#72aee6', // WP Admin info color
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen-Sans',
          'Ubuntu',
          'Cantarell',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: ['Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        wp: '0 1px 1px rgba(0, 0, 0, 0.04)',
        'wp-hover': '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        wp: '20px', // WP standard spacing
      },
      borderRadius: {
        wp: '4px', // WP standard border radius
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
  safelist: [
    'wdt-bg-danger-500',
    'wdt-bg-success-500',
    'wdt-bg-warning-500',
    'wdt-bg-info-500',
    'wdt-text-danger-500',
    'wdt-text-success-500',
    'wdt-text-warning-500',
    'wdt-text-info-500',
  ],
};
