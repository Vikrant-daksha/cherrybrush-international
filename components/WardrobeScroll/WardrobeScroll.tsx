'use client';

import dynamic from 'next/dynamic';

// Dynamically import the heavy WebGL components to prevent Server-Side Rendering (SSR) crashes
const WardrobeScrollCanvas = dynamic(() => import('./WardrobeScrollCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      height: '520px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: '#6b4f3a', 
      fontFamily: 'system-ui',
      background: '#fafaf7',
      borderRadius: '16px'
    }}>
      <div style={{ fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
        Initializing Showcase...
      </div>
    </div>
  ),
});

interface Product {
  name: string;
  price: string;
  image?: string;
}

interface WardrobeScrollProps {
  products: Product[];
  title?: string;
  headerText?: string;
}

export default function WardrobeScroll({
  products,
  title,
  headerText,
}: WardrobeScrollProps) {
  return (
    <WardrobeScrollCanvas
      products={products}
      title={title}
      headerText={headerText}
    />
  );
}
