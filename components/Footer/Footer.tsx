import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 inline-block align-middle mr-2 border border-[#6b4f3a]/10">
            <Image
              src="/logo.jpeg"
              alt="CherryBrush Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className={styles.logoBrand}>
            Cherry<span className={styles.logoAccent}>Brush</span>
          </span>
        </div>
        <p className={styles.tagline}>
          Artisan press-on nails, crafted with love.
        </p>
        <div className={styles.links}>
          <a href="#shop" className={styles.link}>Shop</a>
          <a href="#new-arrivals" className={styles.link}>New Arrivals</a>
          <a href="#trending" className={styles.link}>Trending</a>
          <a href="#about" className={styles.link}>About</a>
        </div>
        <p className={styles.copy}>© {new Date().getFullYear()} CherryBrush. All rights reserved.</p>
      </div>
    </footer>
  );
}
