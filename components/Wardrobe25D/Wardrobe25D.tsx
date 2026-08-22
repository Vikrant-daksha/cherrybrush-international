"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./Wardrobe25D.module.css";

interface Product {
  name: string;
  price: string;
  image: string;
}

const PRODUCTS_COL1: Product[] = [
  { name: "Velvet Oud", price: "$180", image: "/product.png" },
  { name: "Gold Leather", price: "$240", image: "/product.png" },
  { name: "Silk Jasmine", price: "$160", image: "/product.png" },
];

const PRODUCTS_COL2: Product[] = [
  { name: "Sandalwood Rose", price: "$195", image: "/product.png" },
  { name: "Amber Iris", price: "$210", image: "/product.png" },
  { name: "Noir Neroli", price: "$175", image: "/product.png" },
];

const PRODUCTS_COL3: Product[] = [
  { name: "Royal Patchouli", price: "$225", image: "/product.png" },
  { name: "Ivory Musk", price: "$150", image: "/product.png" },
];

const BADGES = [
  {
    title: "SALON QUALITY",
    sub: "Premium finish that lasts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 12 2" />
      </svg>
    ),
  },
  {
    title: "REUSABLE",
    sub: "Wear, remove, & reuse",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </svg>
    ),
  },
  {
    title: "EASY APPLICATION",
    sub: "Apply in 10 minutes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "SAFE FORMULA",
    sub: "Gentle on natural nails",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "WORLDWIDE SHIPPING",
    sub: "Fast & reliable delivery",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export default function Wardrobe25D() {
  const [selectedProduct, setSelectedProduct] = useState<{
    name: string;
    price: string;
    type?: string;
  } | null>(null);

  const handleSelect = (product: { name: string; price: string; type?: string }) => {
    setSelectedProduct(product);
  };

  return (
    <div className={styles.wardrobeWrapper}>
      {/* ── Main Cabinet Structure ── */}
      <div className={styles.cabinetFrame}>
        <div className={styles.gridContainer}>
          
          {/* ════ COLUMN 0: QUIZ & COMPLETE KIT ════ */}
          <div className={styles.column}>
            {/* Top: Find Your Perfect Set */}
            <div className={`${styles.compartment} ${styles.compTall}`}>
              <div className={styles.ledBarContainer}>
                <div className={styles.ledCap} />
                <div className={styles.ledBar} />
                <div className={styles.ledCap} />
              </div>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>
                  FIND YOUR
                  <br />
                  PERFECT SET
                </h3>
                <p className={styles.featureSub}>
                  Different moods.
                  <br />
                  Endless possibilities.
                </p>
                <button
                  className={styles.featureBtn}
                  onClick={() => handleSelect({ name: "Find Your Perfect Set", price: "Free Quiz", type: "quiz" })}
                >
                  TAKE THE QUIZ →
                </button>
              </div>
            </div>

            {/* Bottom: The Complete Kit */}
            <div className={`${styles.compartment} ${styles.compTall}`}>
              <div className={styles.ledBarContainer}>
                <div className={styles.ledCap} />
                <div className={styles.ledBar} />
                <div className={styles.ledCap} />
              </div>
              <div className={styles.featureCard}>
                <h3 className={styles.featureTitle}>THE COMPLETE KIT</h3>
                <p className={styles.featureSub}>Everything you need for the perfect application.</p>
                <span className={styles.featurePrice}>₹599</span>
                
                <Image
                  src="/complete-kit.png"
                  alt="The Complete Kit"
                  width={180}
                  height={140}
                  className={styles.featureKitImage}
                />

                <button
                  className={styles.featureBtn}
                  onClick={() => handleSelect({ name: "The Complete Kit", price: "₹599", type: "kit" })}
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>

          {/* ════ COLUMN 1: MIDDLE LEFT SHELVES ════ */}
          <div className={styles.column}>
            {PRODUCTS_COL1.map((item, idx) => (
              <div key={idx} className={`${styles.compartment} ${styles.compMedium}`}>
                <div className={styles.ledBarContainer}>
                  <div className={styles.ledCap} />
                  <div className={styles.ledBar} />
                  <div className={styles.ledCap} />
                </div>

                {/* 2.5D Slanted Product Tray */}
                <div className={styles.trayArea}>
                  <div
                    className={styles.tiltedProductBox}
                    onClick={() => handleSelect({ name: item.name, price: item.price })}
                  >
                    <Image src={item.image} alt={item.name} width={160} height={160} className={styles.productImage} />
                  </div>
                </div>

                {/* Shelf & Plate */}
                <div className={styles.shelfBase}>
                  <div className={styles.shelfTopVeneer} />
                  <div className={styles.labelPlate}>
                    <div className={styles.labelMeta}>
                      <span className={styles.productName}>{item.name}</span>
                      <span className={styles.productPrice}>{item.price}</span>
                    </div>
                    <button
                      className={styles.cartBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect({ name: item.name, price: item.price });
                      }}
                      title="Add to cart"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ════ COLUMN 2: MIDDLE RIGHT SHELVES ════ */}
          <div className={styles.column}>
            {PRODUCTS_COL2.map((item, idx) => (
              <div key={idx} className={`${styles.compartment} ${styles.compMedium}`}>
                <div className={styles.ledBarContainer}>
                  <div className={styles.ledCap} />
                  <div className={styles.ledBar} />
                  <div className={styles.ledCap} />
                </div>

                <div className={styles.trayArea}>
                  <div
                    className={styles.tiltedProductBox}
                    onClick={() => handleSelect({ name: item.name, price: item.price })}
                  >
                    <Image src={item.image} alt={item.name} width={160} height={160} className={styles.productImage} />
                  </div>
                </div>

                <div className={styles.shelfBase}>
                  <div className={styles.shelfTopVeneer} />
                  <div className={styles.labelPlate}>
                    <div className={styles.labelMeta}>
                      <span className={styles.productName}>{item.name}</span>
                      <span className={styles.productPrice}>{item.price}</span>
                    </div>
                    <button
                      className={styles.cartBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect({ name: item.name, price: item.price });
                      }}
                      title="Add to cart"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ════ COLUMN 3: STATUS SHELVES & TOP DRAWER ════ */}
          <div className={styles.column}>
            {/* Top Drawer */}
            <div className={`${styles.compartment} ${styles.compShort}`}>
              <div className={styles.drawerFace}>
                <div className={styles.goldHandle} />
              </div>
            </div>

            {/* Row 1: Best Seller */}
            <div className={`${styles.compartment} ${styles.compLarge}`}>
              <div className={styles.ledBarContainer}>
                <div className={styles.ledCap} />
                <div className={styles.ledBar} />
                <div className={styles.ledCap} />
              </div>

              <div className={styles.statusPlate}>
                <span className={styles.statusPlateText}>BEST SELLER</span>
              </div>

              <div className={styles.trayArea}>
                <div
                  className={styles.tiltedProductBox}
                  onClick={() => handleSelect({ name: PRODUCTS_COL3[0].name, price: PRODUCTS_COL3[0].price })}
                >
                  <Image src={PRODUCTS_COL3[0].image} alt={PRODUCTS_COL3[0].name} width={160} height={160} className={styles.productImage} />
                </div>
              </div>

              <div className={styles.shelfBase}>
                <div className={styles.shelfTopVeneer} />
                <div className={styles.labelPlate}>
                  <div className={styles.labelMeta}>
                    <span className={styles.productName}>{PRODUCTS_COL3[0].name}</span>
                    <span className={styles.productPrice}>{PRODUCTS_COL3[0].price}</span>
                  </div>
                  <button
                    className={styles.cartBtn}
                    onClick={() => handleSelect({ name: PRODUCTS_COL3[0].name, price: PRODUCTS_COL3[0].price })}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Trending Now */}
            <div className={`${styles.compartment} ${styles.compLarge}`}>
              <div className={styles.ledBarContainer}>
                <div className={styles.ledCap} />
                <div className={styles.ledBar} />
                <div className={styles.ledCap} />
              </div>

              <div className={styles.statusPlate}>
                <span className={styles.statusPlateText}>TRENDING NOW</span>
              </div>

              <div className={styles.trayArea}>
                <div
                  className={styles.tiltedProductBox}
                  onClick={() => handleSelect({ name: PRODUCTS_COL3[1].name, price: PRODUCTS_COL3[1].price })}
                >
                  <Image src={PRODUCTS_COL3[1].image} alt={PRODUCTS_COL3[1].name} width={160} height={160} className={styles.productImage} />
                </div>
              </div>

              <div className={styles.shelfBase}>
                <div className={styles.shelfTopVeneer} />
                <div className={styles.labelPlate}>
                  <div className={styles.labelMeta}>
                    <span className={styles.productName}>{PRODUCTS_COL3[1].name}</span>
                    <span className={styles.productPrice}>{PRODUCTS_COL3[1].price}</span>
                  </div>
                  <button
                    className={styles.cartBtn}
                    onClick={() => handleSelect({ name: PRODUCTS_COL3[1].name, price: PRODUCTS_COL3[1].price })}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Brand Values Banner ── */}
        <div className={styles.bottomPanel}>
          {BADGES.map((badge, idx) => (
            <div key={idx} className={styles.badgeItem}>
              <div className={styles.badgeIconCircle}>{badge.icon}</div>
              <div className={styles.badgeMeta}>
                <span className={styles.badgeTitle}>{badge.title}</span>
                <span className={styles.badgeSub}>{badge.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Selection Toast ── */}
      {selectedProduct && (
        <div className={styles.selectionToast}>
          <div>
            <div className={styles.toastTitle}>{selectedProduct.name}</div>
            <div className={styles.toastPrice}>{selectedProduct.price}</div>
          </div>
          <button
            className={styles.toastActionBtn}
            onClick={() => setSelectedProduct(null)}
          >
            {selectedProduct.type === "quiz" ? "Start Quiz" : "Add to Bag"}
          </button>
          <button
            className={styles.toastCloseBtn}
            onClick={() => setSelectedProduct(null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
