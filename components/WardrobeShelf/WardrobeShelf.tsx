'use client';

import styles from './WardrobeShelf.module.css';
import ProductCard from '@/components/ProductCard/ProductCard';
import { ShelfCategory } from '@/lib/products';

interface WardrobeShelfProps {
  category: ShelfCategory;
  index: number;
}

export default function WardrobeShelf({ category, index }: WardrobeShelfProps) {
  return (
    <div className={styles.shelfWrapper} style={{ '--delay': `${index * 0.12}s` } as React.CSSProperties}>
      {/* Hang tag label */}
      <div className={styles.hangTagContainer}>
        <div className={styles.string} />
        <div className={styles.hangTag}>
          <span className={styles.tagLabel}>{category.label}</span>
          <span className={styles.tagSub}>{category.sublabel}</span>
        </div>
      </div>

      {/* Shelf surface with products */}
      <div className={styles.shelfSurface}>
        <div className={styles.productsRow}>
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* Shelf plank bottom edge */}
        <div className={styles.shelfEdge} />
      </div>
    </div>
  );
}
