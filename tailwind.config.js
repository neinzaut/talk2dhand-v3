/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/ui/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tw-animate-css'),
  ],
}
