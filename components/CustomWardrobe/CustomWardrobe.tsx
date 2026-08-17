'use client';

import dynamic from 'next/dynamic';
import styles from './CustomWardrobe.module.css';

// Dynamically load 3D Canvas component without SSR
const Wardrobe3D = dynamic(() => import('./Wardrobe3D'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingPlaceholder}>
      <div className={styles.spinner} />
      <p>Initializing 3D Studio...</p>
    </div>
  ),
});

export default function CustomWardrobe() {
  return <Wardrobe3D />;
}