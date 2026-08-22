"use client";

import React, { useState } from "react";
import Image from "next/image";
import SizeChartModal from "../SizeChartModal/SizeChartModal";
import NailShapeIcon from "../NailShapeIcon/NailShapeIcon";

// ── Types & Interfaces ──
export interface NailShape {
  id: string;
  name: string;
  shapeType: "oval" | "almond" | "coffin" | "square" | "stiletto" | string;
}

export interface NailColor {
  id: string;
  name: string;
  color: string;
}

export interface ProductFeature {
  id?: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ProductData {
  id?: string;
  name: string;
  subtitle: string;
  rating: number;
  reviewCount: number;
  price: number | string;
  originalPrice?: number | string;
  currency?: string;
  description: string;
  images: string[];
  colors?: NailColor[];
  shapes?: NailShape[];
  lengths?: string[];
  sizes?: string[];
  features?: ProductFeature[];
  packageType?: string;
}

export interface ProductPageProps {
  product?: Partial<ProductData>;
  onAddToBag?: (selection: {
    product: Partial<ProductData>;
    shape: string;
    length: string;
    size: string;
    quantity: number;
  }) => void;
  onWishlistToggle?: (isWishlisted: boolean) => void;
  className?: string;
}

// ── Default Trust Badges SVGs ──
const defaultFeatures: ProductFeature[] = [
  {
    id: "quality",
    label: "Salon quality",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    id: "reusable",
    label: "Reusable",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 21h5v-5" />
      </svg>
    ),
  },
  {
    id: "easy-apply",
    label: "Easy to apply",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 4 4 4" />
        <path d="m18 7-8.5 8.5a2.12 2.12 0 0 1-3 0 2.12 2.12 0 0 1 0-3L15 4z" />
        <path d="m3 21 3-3" />
        <path d="m19 19 2 2" />
        <path d="m5 5 2 2" />
      </svg>
    ),
  },
  {
    id: "gentle",
    label: "Gentle on nails",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9a9 9 0 0 1-9-9 9 9 0 0 1 9-9Z" />
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="3" strokeDasharray="2 2" />
      </svg>
    ),
  },
];

import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";

// ── Main Product Page Component ──
export default function ProductPage({
  product = {},
  onAddToBag,
  onWishlistToggle,
  className = "",
}: ProductPageProps) {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();

  // Use product data directly — no merging with defaults so ghost data never leaks in
  const data: Partial<ProductData> = {
    ...product,
    features: product.features || defaultFeatures, // trust badges are UI-only, always show
  };

  const urlShape = searchParams?.get("shape");
  const urlLength = searchParams?.get("length");
  const urlSize = searchParams?.get("size");
  const urlShade = searchParams?.get("shade") || searchParams?.get("color");

  // State Management
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedShape, setSelectedShape] = useState<string>(
    urlShape || data.shapes?.[1]?.id || data.shapes?.[0]?.id || "almond",
  );
  const [selectedLength, setSelectedLength] = useState<string>(
    urlLength || data.lengths?.[1] || data.lengths?.[0] || "Medium",
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    urlSize || data.sizes?.[2] || data.sizes?.[0] || "M",
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    urlShade ||
      data.colors?.[0]?.name ||
      data.colors?.[0]?.color ||
      data.colors?.[0]?.id ||
      "pink",
  );
  const [sizeChartModal, setSizeChartModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  // Handlers
  const handleWishlistClick = () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    onWishlistToggle?.(nextState);
  };

  const handleAddToBag = () => {
    setIsAdding(true);
    addToCart({
      productId: data.id || data.name || "product",
      name: data.name || "Press-On Nail Set",
      price:
        typeof data.price === "number"
          ? data.price
          : parseFloat(String(data.price || 0)) || 0,
      image:
        data.images?.[selectedImageIndex] || data.images?.[0] || "/product.png",
      collection: data.subtitle,
      shape: selectedShape,
      length: selectedLength,
      size: selectedSize,
      color: selectedColor,
      shade: selectedColor,
      quantity: 1,
    });

    onAddToBag?.({
      product: data,
      shape: selectedShape,
      length: selectedLength,
      size: selectedSize,
      quantity: 1,
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <main
      className={`w-full min-h-[95vh] bg-[#fdfaf8] text-[#3d2b1f] flex justify-center items-center mt-10 px-4 sm:px-6 lg:px-12 py-10 md:py-16 ${className}`}
      style={{
        fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)',
      }}
    >
      <SizeChartModal
        open={sizeChartModal}
        onClose={() => setSizeChartModal(false)}
      />
      <div className="w-[75%] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* ═════════════════════════════════════════════════════════════
            LEFT COLUMN: MEDIA GALLERY (Thumbnails + Hero Image)
        ══════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Product Media Gallery"
          className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4 md:gap-5 w-full items-start"
        >
          {/* Vertical Thumbnail Strip */}
          <div className="flex sm:flex-col gap-3 pb-2 sm:pb-0 shrink-0 w-full sm:w-20 md:w-24">
            {data.images?.map((imgSrc, idx) => {
              const isCurrent = selectedImageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-[#f9eef1] focus:outline-none ${
                    isCurrent
                      ? "border-[#d88998] shadow-md scale-[1.02] ring-2 ring-[#d88998]/30"
                      : "border-[#edd8de] hover:border-[#dfa3b0] opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`View thumbnail ${idx + 1}`}
                >
                  <Image
                    src={imgSrc}
                    alt={`${data.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>

          {/* Main Large Image Container */}
          <div className="relative flex-1 w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-square rounded-3xl overflow-hidden bg-[#faedf0] border border-[#f0cdd6] shadow-[0_12px_45px_rgba(180,110,130,0.12)]">
            <button
              type="button"
              onClick={handleWishlistClick}
              className="absolute top-2 right-2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#edd8de] bg-white hover:bg-[#faedf0] hover:border-[#d88998] flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 focus:outline-none hover:scale-105 active:scale-95"
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isWishlisted ? "#d87c8e" : "none"}
                stroke="#d87c8e"
                strokeWidth="1.8"
                className="transition-transform duration-200"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <Image
              src={
                data.images?.[selectedImageIndex] ||
                data.images?.[0] ||
                "/product.png"
              }
              alt={data.name || "Product Image"}
              unoptimized
              fill
              priority
              loading="eager"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-all duration-500 hover:scale-105"
            />
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            RIGHT COLUMN: PRODUCT DETAILS & VARIANT CONTROLS
        ══════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Product Information and Customization"
          className="lg:col-span-6 flex flex-col justify-start space-y-6 lg:pl-4"
        >
          {/* Header: Title, Subtitle, Rating & Price */}
          <div className="space-y-2">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-[#3d2b1f] uppercase leading-none"
              style={{
                fontFamily:
                  'var(--font-cormorant, "Cormorant Garamond", serif)',
                letterSpacing: "0.08em",
              }}
            >
              {data.name}
            </h1>

            {/* Price */}
            <div className="pt-2">
              <span
                className="text-3xl sm:text-4xl font-normal text-[#3d2b1f] tracking-tight"
                style={{
                  fontFamily:
                    'var(--font-cormorant, "Cormorant Garamond", serif)',
                }}
              >
                {data.currency || "₹"}
                {typeof data.price === "number"
                  ? data.price.toLocaleString()
                  : data.price}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm md:text-[15px] text-[#6d554a] leading-relaxed pt-1 pr-32 max-w-lg">
              {data.description}
            </p>
          </div>

          {data.colors && data.colors.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h2 className="text-xs font-extrabold tracking-[0.08em] uppercase text-[#a0604a]">
                Choose your Shade:{" "}
              </h2>
              <div className="flex items-center gap-4 pt-2">
                {data.colors?.map((color, i) => {
                  const colorVal = color.name || color.color || color.id;
                  const isSelected =
                    selectedColor === colorVal || selectedColor === color.color;
                  return (
                    <button
                      key={i}
                      type="button"
                      title={color.name || color.color}
                      onClick={() => setSelectedColor(colorVal)}
                      className={`w-6 h-6 md:w-10 md:h-10 rounded-full border shadow-sm transition-all hover:scale-110 focus:outline-none ${
                        isSelected
                          ? "ring-2 ring-[#c88389] border-[#c25d65] scale-105"
                          : "border-[#f08cca] hover:border-[#c88389]"
                      }`}
                      style={{ backgroundColor: color.color }}
                    />
                  );
                })}
                {data.colors?.length > 5 && (
                  <div className="w-6 h-6 md:w-10 md:h-10 rounded-full border border-[#f08cca] shadow-sm transition-transform flex items-center justify-center">
                    <span className="font-sans text-[10px] font-semibold text-[#a0604a]">
                      +{data.colors.length - 5}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 1. SHAPE SELECTOR ── */}
          {data.shapes && data.shapes.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h2 className="text-xs font-extrabold tracking-[0.08em] uppercase text-[#a0604a]">
                SHAPE
              </h2>
              <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
                {data.shapes.map((shape) => {
                  const isSelected = selectedShape === shape.id;
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setSelectedShape(shape.id)}
                      className={`flex flex-col items-center justify-between py-2 px-2.5 sm:px-3 min-w-[58px] sm:min-w-18 h-20 rounded-2xl border transition-all duration-200 focus:outline-none ${
                        isSelected
                          ? "border-[#d88998] bg-[#faedf0] shadow-sm ring-1 ring-[#d88998]/40"
                          : "border-[#edd8de] bg-white/60 hover:bg-white hover:border-[#dfa3b0]"
                      }`}
                    >
                      <div className="h-10 flex items-center justify-center">
                        <NailShapeIcon
                          type={shape.shapeType}
                          isSelected={isSelected}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-medium tracking-tight ${
                          isSelected
                            ? "text-[#a0485a] font-semibold"
                            : "text-[#7a6054]"
                        }`}
                      >
                        {shape.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 2. LENGTH SELECTOR ── */}
          {data.lengths && data.lengths.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <h2 className="text-xs font-extrabold tracking-[0.08em] uppercase text-[#a0604a]">
                LENGTH
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                {data.lengths.map((len) => {
                  const isSelected = selectedLength === len;
                  return (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSelectedLength(len)}
                      className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border focus:outline-none ${
                        isSelected
                          ? "border-[#d88998] bg-[#faedf0] text-[#a0485a] font-semibold shadow-xs"
                          : "border-[#edd8de] bg-white/60 text-[#7a6054] hover:bg-white hover:border-[#dfa3b0]"
                      }`}
                    >
                      {len}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 3. SIZE SELECTOR ── */}
          {data.sizes && data.sizes.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between max-w-xs">
                <h2 className="text-xs font-extrabold tracking-[0.08em] uppercase text-[#a0604a]">
                  SIZE
                </h2>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {data.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 border focus:outline-none ${
                        isSelected
                          ? "border-[#d88998] bg-[#faedf0] text-[#a0485a] font-semibold shadow-xs scale-105"
                          : "border-[#edd8de] bg-white/60 text-[#7a6054] hover:bg-white hover:border-[#dfa3b0]"
                      }`}
                    >
                      {size === "Custom" ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      ) : (
                        size
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="ml-1">
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] text-[#b07886] hover:text-[#904858] transition-colors underline-offset-2 hover:underline"
                  onClick={() => {
                    setSizeChartModal(!sizeChartModal);
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Size Guide</span>
                </button>
              </div>
            </div>
          )}

          {/* {data?.packageType && ( */}
          <div className=" pt-5 flex items-center gap-5">
            <span className="inline-flex items-center gap-1 text-[8px] md:text-[10px] font-semibold uppercase tracking-wider text-[#c25d65] bg-[#fdf0f2] border border-[#e8c0c8]/70 rounded-full px-2 py-0.5">
              <NailShapeIcon
                type="oval"
                isSelected={true}
                width={10}
                height={10}
                stroke={6}
              />
              NAIL MATERIAL: GEL
            </span>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowExtraInfo((v) => !v);
                }}
                onMouseEnter={() => setShowExtraInfo(true)}
                onMouseLeave={() => setShowExtraInfo(false)}
                className="inline-flex items-center gap-1 text-[8px] md:text-[10px] font-semibold uppercase tracking-wider text-[#c25d65] bg-[#fdf0f2] border border-[#e8c0c8]/70 rounded-full px-2 py-0.5 transition-colors hover:bg-[#f8dde2] hover:border-[#c25d65]/40"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="flex-shrink-0"
                >
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
                What&apos;s Included {data?.packageType}
              </button>
              {showExtraInfo && (
                <div
                  className="absolute bottom-full left-0 mb-1.5 z-50 w-max max-w-[180px] sm:max-w-[220px]"
                  onMouseEnter={() => setShowExtraInfo(true)}
                  onMouseLeave={() => setShowExtraInfo(false)}
                >
                  {/* Arrow */}
                  <div className="absolute -bottom-1 left-3 w-2 h-2 bg-white border-r border-b border-[#e8c0c8]/80 rotate-45" />
                  {/* Tooltip card */}
                  <div className="relative bg-white/95 backdrop-blur-sm border border-[#e8c0c8]/80 rounded-xl shadow-[0_8px_24px_rgba(160,100,120,0.18)] p-2">
                    <p className="text-[7px] uppercase tracking-widest text-[#c25d65]/60 font-semibold mb-1.5">
                      Included Items
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "Nail Glue",
                        "Adhesive Tabs",
                        "Buffer",
                        "Cuticle Stick",
                      ].map((item) => (
                        <span
                          key={item}
                          className="text-[7px] sm:text-[8px] uppercase tracking-wide text-[#9b4d5a] bg-[#fdf0f2] border border-[#e8c0c8]/80 rounded-full px-1.5 py-0.5 leading-none"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* )} */}

          {/* ── 4. CTA BUTTONS: ADD TO BAG & WISHLIST ── */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={isAdding}
              className="flex-1 bg-[#d87c8e] hover:bg-[#c96c7e] active:scale-[0.98] text-white font-medium py-3.5 sm:py-5 px-6 rounded-sm tracking-[0.14em] uppercase text-xs sm:text-sm transition-all duration-300 shadow-[0_8px_25px_rgba(216,124,142,0.35)] hover:shadow-[0_12px_32px_rgba(216,124,142,0.45)] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isAdding ? "ADDING TO CART..." : "ADD TO CART"}</span>
            </button>
          </div>

          {/* ── 5. TRUST BADGES / FEATURES ── */}
          {/* {data.features && data.features.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#f0d8df]/80">
              {data.features.map((feature, idx) => (
                <div
                  key={feature.id || idx}
                  className="flex flex-col items-center text-center space-y-1.5 text-[#916b73]"
                >
                  <div className="w-8 h-8 flex items-center justify-center text-[#c87a8a]">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] sm:text-xs font-normal tracking-wide text-[#70564c]">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          )} */}
        </section>
      </div>
    </main>
  );
}
