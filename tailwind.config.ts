import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#E6F0FB',
          100: '#B5D4F4',
          400: '#378ADD',
          500: '#4A90D9',
          600: '#185FA5',
          700: '#1a2332',
        },
        orange: {
          500: '#FF6B35',
          600: '#e55a26',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
export default config
