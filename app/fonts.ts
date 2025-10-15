import { Inter, Cairo, Amiri } from 'next/font/google';

// Optimize Inter font - used for English text
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

// Optimize Cairo font - primary Arabic font
export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
  weight: ['300', '400', '500', '600', '700'],
});

// Optimize Amiri font - decorative Arabic font
export const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri',
  display: 'swap',
  preload: false, // Not used frequently
  fallback: ['serif'],
  weight: ['400', '700'],
});

// Font class names to apply to html element
export const fontVariables = `${inter.variable} ${cairo.variable} ${amiri.variable}`;
