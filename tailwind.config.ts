import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream:          '#FEFAF3',
        beige:          '#F2E8D0',
        'brown-light':  '#C8906A',
        'brown-medium': '#8B5E3C',
        'brown-dark':   '#4A2C14',
        earth:          '#A67C52',
        'dark-bg':      '#130800',
        'dark-card':    '#1E0F05',
        'gold':         '#D4A054',
        'gold-light':   '#E8C080',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Playfair Display', 'serif'],
        body:    ['var(--font-body)',    'Inter',            'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
