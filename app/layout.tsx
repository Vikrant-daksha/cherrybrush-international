import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import '@/app/globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CherryBrush — Artisan Press-On Nails',
  description:
    'Discover our curated collection of handcrafted press-on nails and nail art. New arrivals, trending styles, and top-rated sets — beautifully displayed in our signature wardrobe.',
  keywords: ['press on nails', 'nail art', 'nail sets', 'false nails', 'CherryBrush', 'artisan nails'],
  openGraph: {
    title: 'CherryBrush — Artisan Press-On Nails',
    description: 'Handcrafted press-on nail art, curated with love.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
