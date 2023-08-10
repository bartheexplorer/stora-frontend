/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'stratos': {
          '50': '#f2f2f5',
          '100': '#e6e6ec',
          '200': '#c0c0cf',
          '300': '#9a9ab2',
          '400': '#4f4f79',
          '500': '#03033f',
          '600': '#030339',
          '700': '#02022f',
          '800': '#020226',
          '900': '#01011f'
        },
        'stora': {
          '50': '#faf5ff',
          '100': '#f2e9fe',
          '200': '#e8d6fe',
          '300': '#d6b7fb',
          '400': '#bd88f8',
          '500': '#a35bf1',
          '600': '#8e3ae3',
          '700': '#7928c8',
          '800': '#6726a3',
          '900': '#552084', // warna utama
          '950': '#380a61',
        },
        'storano': {
          '50': '#FFF4DC',
          '100': '#FEEDC8',
          '200': '#FEE0A0',
          '300': '#FDD277',
          '400': '#FDC54F',
          '500': '#FCB827',
          '600': '#E89F03',
          '700': '#B07902',
          '800': '#795302',
          '900': '#422D01',
          '950': '#261A01'
        },
      },
      keyframes: {
        hide: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        slideIn: {
          from: { transform: 'translateX(calc(100% + var(--viewport-padding)))' },
          to: { transform: 'translateX(0)' },
        },
        swipeOut: {
          from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
          to: { transform: 'translateX(calc(100% + var(--viewport-padding)))' },
        },
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        contentShow: {
          from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        hide: 'hide 100ms ease-in',
        slideIn: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        swipeOut: 'swipeOut 100ms ease-out',
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
