'use client';

import styles from './ProductCard.module.css';
import { Product } from '@/lib/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className={styles.card} style={{ '--accent': product.accentColor, '--bg': product.bgColor } as React.CSSProperties}>
      <div className={styles.imageBox}>
        <span className={styles.emoji}>{product.emoji}</span>
        {product.tag && <span className={styles.tag}>{product.tag}</span>}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{product.name}</p>
        <p className={styles.price}>{product.price}</p>
      </div>
    </div>
  );
}
