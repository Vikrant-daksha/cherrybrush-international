"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Polaroid from "@/components/Polaroid/Polaroid";
import NailProductCard from "@/components/NailProductCard/NailProductCard";
import VerticalProductCard from "@/components/verticalProductCard/verticalProductCard";
import ChooseYourMood from "@/components/discover/ChooseYourMood";
import HowToApply from "@/components/discover/HowToApply";
import LovedByGirls from "@/components/discover/LovedByGirls";
import FAQ from "@/components/discover/FAQ";

interface ProductItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  collection: string;
  images: string[];
  sizes?: string[];
  colors?: { hex: string; label?: string }[];
  shapes?: string[];
  style?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

// Fallback demo products if MongoDB is empty
const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    _id: "demo-1",
    images: ["/product.png"],
    name: "Rose Champagne",
    collection: "Rose Collection",
    style: "Glitter Ombre",
    description:
      "A soft blush ombre with shimmer details for an effortlessly elegant look.",
    price: 799,
    badge: "BEST SELLER",
    rating: 4.5,
    reviewCount: 1250,
    colors: [
      { hex: "#e8a0b0", label: "Rose Pink" },
      { hex: "#f5e6d0", label: "Champagne" },
      { hex: "#d4b896", label: "Warm Nude" },
      { hex: "#c09090", label: "Mauve" },
    ],
  },
  {
    _id: "demo-2",
    images: ["/complete-kit.png"],
    name: "Cherry Blossom",
    collection: "Spring Collection",
    style: "Soft Matte",
    description:
      "Delicate petals in matte blush — minimal, dreamy, and made to last.",
    price: 649,
    badge: "NEW",
    rating: 4,
    reviewCount: 380,
    colors: [
      { hex: "#f5c5c5", label: "Blush" },
      { hex: "#f0d5d5", label: "Petal" },
    ],
  },
  {
    _id: "demo-3",
    images: ["/wardrobe.png"],
    name: "Velvet Noir",
    collection: "Evening Collection",
    style: "Deep Shimmer",
    description:
      "A rich, dark shimmer for evenings that demand attention and sophistication.",
    price: 899,
    rating: 5,
    reviewCount: 620,
    colors: [
      { hex: "#3d2b1f", label: "Noir" },
      { hex: "#6b4f3a", label: "Walnut" },
      { hex: "#a88a6a", label: "Taupe" },
    ],
  },
];

const Home = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time products from MongoDB
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (
          data.success &&
          Array.isArray(data.products) &&
          data.products.length > 0
        ) {
          setProducts(data.products);
        } else {
          // Use fallback demo items if database has no products yet
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (error) {
        console.error("Error loading products from MongoDB:", error);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <>
      {/* ── Hero Section ── */}
      <div
        id="hero-section"
        className="relative w-full min-h-[85vh] md:h-[85vh] select-none overflow-hidden flex flex-col md:flex-row"
      >
        <div className="flex gap-4 justify-around py-2 px-4 bg-neutral-900/80 text-white text-xs uppercase tracking-widest absolute top-4 left-4 z-50 rounded-lg">
          <Link href="/3dwood" className="hover:text-[#c88389]">
            Design with actual 3d
          </Link>
          <Link href="/" className="hover:text-[#c88389]">
            Design without 3d
          </Link>
        </div>

        {/* Text and Button Container */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 text-white z-10 relative py-12 md:py-0">
          <h1 className="font-serif text-5xl md:text-8xl font-light leading-[1.12]">
            <div className="-mb-4">Made to</div>
            <div className="-mb-4">Match</div>
            <div className="-mb-4">Every</div>
            <div className="-mb-4">Version</div>
            <div className="-mb-4">of You.</div>
          </h1>

          <p className="font-sans text-md md:text-xl text-white/90 tracking-wide mt-8 leading-relaxed font-normal">
            Effortless nails.
            <br />
            Endless compliments.
          </p>

          <div className="flex flex-row flex-wrap gap-4 mt-8">
            <button className="px-6 py-3.5 bg-[#c88389] hover:bg-[#b57379] text-white uppercase text-[14px] tracking-[0.08em] font-semibold transition-all duration-300 shadow-md">
              Shop Collection
            </button>
            <button className="px-6 py-3.5 border border-white/30 hover:border-white/60 hover:bg-white/10 text-white uppercase text-[14px] tracking-[0.08em] font-semibold transition-all duration-300">
              Find Your Set
            </button>
          </div>
        </div>

        {/* Polaroid Container */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center z-10 relative">
          <img
            src="sample_processed.png"
            alt="Hero Background"
            className="absolute object-contain h-full right-42 top-24 z-10 filter drop-shadow-[0_20px_45px_rgba(61,43,31,0.42)]"
          />
          <div className="absolute top-32 right-48 z-0">
            <Polaroid
              imageSrc="/product.png"
              imageAlt="Signature Cherry Brush Nail Set"
              caption="Cherry Satin"
              rotate="left-hard"
              className="w-78"
            />
          </div>
          <div className="absolute bottom-14 right-40 z-4">
            <Polaroid
              imageSrc="/product.png"
              imageAlt="Signature Cherry Brush Nail Set"
              caption="Cherry Satin"
              rotate="right-soft"
              className="w-78"
            />
          </div>
        </div>
      </div>

      <section>
        <ChooseYourMood />
      </section>

      {/* ── Horizontal Product Showcase (MongoDB Dynamic) ── */}
      <section className="py-16 bg-[#fafaf7] overflow-hidden">
        <div className="px-8 md:px-16 mb-8 flex items-end justify-between">
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#c88389] font-semibold mb-1">
              Handcrafted with love
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-[#3d2b1f] tracking-wide">
              Featured Sets
            </h2>
          </div>
          <button className="font-sans text-xs tracking-widest uppercase text-[#a88a6a] hover:text-[#3d2b1f] transition-colors border-b border-[#a88a6a]/40 hover:border-[#3d2b1f]/40 pb-0.5">
            View All
          </button>
        </div>

        {/* Dynamic Scroll Container */}
        <div
          className="flex gap-6 overflow-x-auto pb-4 px-8 md:px-16"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading
            ? // Skeleton Loader
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[min(740px,90vw)] h-[440px] rounded-2xl bg-white/60 animate-pulse border border-[#f0e0e5]/60"
                />
              ))
            : products.map((p) => (
                <div key={p._id} className="flex-shrink-0 w-[min(740px,90vw)]">
                  <NailProductCard
                    imageSrc={p.images?.[0] || "/product.png"}
                    name={p.name}
                    collection={p.collection}
                    style={p?.style}
                    description={p.description}
                    price={`₹${p.price}`}
                    badge={p?.badge}
                    rating={p?.rating ?? 4.5}
                    reviewCount={p?.reviewCount ?? 0}
                    colors={p.colors || []}
                    extraColorsCount={
                      (p.colors?.length || 0) > 4
                        ? (p.colors?.length || 0) - 4
                        : 0
                    }
                  />
                </div>
              ))}
        </div>
      </section>

      {/* ── Vertical Grid / Featured Sets Section (MongoDB Dynamic) ── */}
      <section className="py-12 bg-white">
        <div className="px-8 md:px-16 mb-8 flex items-end justify-between">
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#c88389] font-semibold mb-1">
              Popular Picks
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-[#3d2b1f] tracking-wide">
              Trending Designs
            </h2>
          </div>
          <button className="font-sans text-xs tracking-widest uppercase text-[#a88a6a] hover:text-[#3d2b1f] transition-colors border-b border-[#a88a6a]/40 hover:border-[#3d2b1f]/40 pb-0.5">
            Explore All
          </button>
        </div>

        <div
          className="flex gap-6 overflow-x-auto pb-4 px-8 md:px-16"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-72 h-96 rounded-2xl bg-neutral-100 animate-pulse flex-shrink-0"
                />
              ))
            : products.map((p) => (
                <VerticalProductCard
                  key={p._id}
                  imageSrc={p.images?.[0] || "/product.png"}
                  imageAlt={p.name}
                  name={p.name}
                  collection={p.collection}
                  style={p?.style}
                  description={p.description}
                  price={`₹${p.price}`}
                  badge={p?.badge}
                  rating={p?.rating ?? 5}
                  reviewCount={p?.reviewCount ?? 0}
                  colors={p.colors || []}
                  extraColorsCount={
                    (p.colors?.length || 0) > 2
                      ? (p.colors?.length || 0) - 2
                      : 0
                  }
                />
              ))}
        </div>
      </section>

      {/* ── Additional Sections ── */}
      <section>
        <HowToApply />
      </section>
      <section>
        <LovedByGirls />
      </section>
      <section>
        <FAQ />
      </section>
    </>
  );
};

export default Home;
