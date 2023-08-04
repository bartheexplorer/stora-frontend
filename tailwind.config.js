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
          '50': '#fffaeb',
          '100': '#fff2c6',
          '200': '#fee489',
          '300': '#fecf4b',
          '400': '#fdba21', // warna utama
          '500': '#f79909',
          '600': '#db7204',
          '700': '#b64f07',
          '800': '#933d0d',
          '900': '#79320e',
          '950': '#461802',
        },
      },
    },
  },
  plugins: [],
}
