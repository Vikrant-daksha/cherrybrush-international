'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '#shop',         label: 'Shop' },
  { href: '#new-arrivals', label: 'New Arrivals' },
  { href: '#trending',     label: 'Trending' },
  { href: '#about',        label: 'About' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="CherryBrush Home">
          <span className={styles.logoIcon}>🍒</span>
          <span className={styles.logoBrand}>
            Cherry<span className={styles.logoAccent}>Brush</span>
          </span>
        </Link>

        {/* Links */}
        <ul className={styles.links}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.iconBtn} aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button className={styles.cartBtn} aria-label="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className={styles.cartCount}>0</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
