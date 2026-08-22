import type { Metadata } from 'next';
import '@/app/globals.css';
import Navbar from '@/components/Navbar/Navbar';

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

import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer/CartDrawer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative">
        <CartProvider>
          <Navbar />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
