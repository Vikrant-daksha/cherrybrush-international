import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logoIcon}>🍒</span>
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
