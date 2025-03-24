import localFont from 'next/font/local';

// Import Vazir font family
export const vazir = localFont({
  src: [
    {
      path: './Vazir-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './Vazir-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './Vazir.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './Vazir-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './Vazir-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-vazir',
});

// Import Geist font family for monospace elements
export const geistMono = localFont({
  src: './GeistMonoVF.woff',
  display: 'swap',
  variable: '--font-geist-mono',
});

// Import Geist font family (optional, as main font is Vazir)
export const geist = localFont({
  src: './GeistVF.woff',
  display: 'swap',
  variable: '--font-geist',
}); 