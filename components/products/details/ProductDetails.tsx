"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import SizeChartModal from "@/components/SizeChartModal/SizeChartModal";
import NailShapeIcon from "../icons/NailShapeIcon";
import YouMightAlsoLike from "../YouMightAlsoLike";
import { useCurrency } from "@/context/CurrencyContext";

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
  _id?: string;
  slug?: string;
  name: string;
  subtitle: string;
  collection?: string;
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
  style: string; // Optional for existing products
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
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();

  // Filter and normalize incoming variants to avoid ghost or empty strings
  const validShapes = (product.shapes || [])
    .map((s: any) => {
      if (typeof s === "string") {
        const trimmed = s.trim();
        return {
          id: trimmed.toLowerCase(),
          name: trimmed,
          shapeType: trimmed.toLowerCase(),
        };
      }
      return s;
    })
    .filter((s: any) => s && (s.name?.trim?.() || s.id?.trim?.()));

  const validLengths = (product.lengths || [])
    .map((l: any) => {
      if (typeof l === "string") return l.trim();
      return l?.name || l?.label || l?.value || "";
    })
    .filter((l: string) => typeof l === "string" && l.length > 0);

  const validSizes = (product.sizes || [])
    .map((sz: any) => {
      if (typeof sz === "string") return sz.trim();
      return sz?.name || sz?.label || sz?.value || "";
    })
    .filter((sz: string) => typeof sz === "string" && sz.length > 0);

  const validColors = (product.colors || [])
    .map((c: any, i: number) => {
      if (typeof c === "string") {
        return { id: `c-${i}`, name: c, color: c };
      }
      const colorHex = c.hex || c.color || "#c88389";
      const colorName = c.label || c.name || c.shade || colorHex;
      return {
        id: c.id || `c-${i}`,
        name: colorName,
        color: colorHex,
      };
    })
    .filter((c: any) => c && (c.color?.trim?.() || c.name?.trim?.()));

  // Use product data directly with strictly validated variants
  const data: Partial<ProductData> = {
    ...product,
    shapes: validShapes,
    lengths: validLengths,
    sizes: validSizes,
    colors: validColors,
  };

  const urlShape = searchParams?.get("shape");
  const urlLength = searchParams?.get("length");
  const urlSize = searchParams?.get("size");
  const urlShade = searchParams?.get("shade") || searchParams?.get("color");

  // Case-insensitive resolution so ?shape=Almond and ?shape=almond both match correctly
  const resolvedShape =
    validShapes.find(
      (s) =>
        s.id.toLowerCase() === urlShape?.toLowerCase() ||
        s.name.toLowerCase() === urlShape?.toLowerCase(),
    )?.id ||
    validShapes[0]?.id ||
    "";

  const resolvedLength =
    validLengths.find((l) => l.toLowerCase() === urlLength?.toLowerCase()) ||
    validLengths[0] ||
    "";

  const resolvedSize =
    validSizes.find((sz) => sz.toLowerCase() === urlSize?.toLowerCase()) ||
    validSizes[0] ||
    "";

  const resolvedColor =
    validColors.find(
      (c) =>
        c.name?.toLowerCase() === urlShade?.toLowerCase() ||
        c.color?.toLowerCase() === urlShade?.toLowerCase() ||
        c.id?.toLowerCase() === urlShade?.toLowerCase(),
    )?.name ||
    validColors.find(
      (c) =>
        c.name?.toLowerCase() === urlShade?.toLowerCase() ||
        c.color?.toLowerCase() === urlShade?.toLowerCase() ||
        c.id?.toLowerCase() === urlShade?.toLowerCase(),
    )?.color ||
    urlShade ||
    validColors[0]?.name ||
    validColors[0]?.color ||
    validColors[0]?.id ||
    "";

  // State Management
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedShape, setSelectedShape] = useState<string>(resolvedShape);
  const [selectedLength, setSelectedLength] = useState<string>(resolvedLength);
  const [selectedSize, setSelectedSize] = useState<string>(resolvedSize);
  const [selectedColor, setSelectedColor] = useState<string>(resolvedColor);
  const [sizeChartModal, setSizeChartModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showExtraInfo, setShowExtraInfo] = useState(false);

  // Mobile Peaking Carousel State & Handlers
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const totalImages = data.images?.length || 1;

  const scrollToMobileImage = (idx: number) => {
    if (mobileScrollRef.current) {
      const container = mobileScrollRef.current;
      const card = container.children[idx] as HTMLElement;
      if (card) {
        card.scrollIntoView({
          behavior: "smooth",
          inline: "start",
          block: "nearest",
        });
      }
    }
  };

  const handlePrevImage = () => {
    const newIdx =
      selectedImageIndex > 0 ? selectedImageIndex - 1 : totalImages - 1;
    setSelectedImageIndex(newIdx);
    scrollToMobileImage(newIdx);
  };

  const handleNextImage = () => {
    const newIdx =
      selectedImageIndex < totalImages - 1 ? selectedImageIndex + 1 : 0;
    setSelectedImageIndex(newIdx);
    scrollToMobileImage(newIdx);
  };

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth * 0.82;
    if (itemWidth > 0) {
      const newIdx = Math.round(scrollLeft / itemWidth);
      if (
        newIdx >= 0 &&
        newIdx < totalImages &&
        newIdx !== selectedImageIndex
      ) {
        setSelectedImageIndex(newIdx);
      }
    }
  };

  // Handlers
  const handleWishlistClick = () => {
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    onWishlistToggle?.(nextState);
  };

  const handleAddToBag = () => {
    setIsAdding(true);
    addToCart({
      productId: data._id || data.id || data.slug || data.name || "product",
      name: data.name || "Press-On Nail Set",
      price:
        typeof data.price === "number"
          ? data.price
          : parseFloat(String(data.price || 0)) || 0,
      image:
        data.images?.[selectedImageIndex] || data.images?.[0] || "/product.png",
      collection: data.subtitle,
      shape:
        selectedShape ||
        validShapes[0]?.name ||
        validShapes[0]?.id ||
        undefined,
      length: selectedLength || validLengths[0] || undefined,
      size: selectedSize || validSizes[0] || undefined,
      color:
        selectedColor ||
        validColors[0]?.name ||
        validColors[0]?.color ||
        undefined,
      shade:
        selectedColor ||
        validColors[0]?.name ||
        validColors[0]?.color ||
        undefined,
      quantity: quantity,
    });

    onAddToBag?.({
      product: data,
      shape: selectedShape,
      length: selectedLength,
      size: selectedSize,
      quantity: quantity,
    });
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleBuyNow = () => {
    window.alert(
      `Proceeding to checkout with ${quantity}x ${data.name || "Press-On Nail Set"}!`,
    );
  };

  return (
    <main
      className={`w-full min-h-[95vh] bg-white text-[#3d2b1f] flex flex-col justify-start items-center px-4 sm:px-6 lg:px-12 pt-24 md:pt-28 pb-10 ${className}`}
      style={{
        fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)',
      }}
    >
      <SizeChartModal
        open={sizeChartModal}
        onClose={() => setSizeChartModal(false)}
      />

      {/* ── BREADCRUMB NAVIGATION ── */}
      <nav
        aria-label="Breadcrumb"
        className="w-full px-4 sm:px-6 lg:px-12 md:w-[85%] lg:w-[80%] mb-5 flex items-center gap-1.5 text-[11px] sm:text-xs tracking-wide"
        style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
      >
        <a
          href="/"
          className="text-[#b07886] hover:text-[#8a4a5a] transition-colors duration-150 hover:underline underline-offset-2"
        >
          Home
        </a>
        <span className="text-[#d4a8b2] select-none">/</span>
        <a
          href="/collection"
          className="text-[#b07886] hover:text-[#8a4a5a] transition-colors duration-150 hover:underline underline-offset-2"
        >
          Collection
        </a>
        {data.collection && (
          <>
            <span className="text-[#d4a8b2] select-none">/</span>
            <a
              href={`/collection?filter=${encodeURIComponent(data.collection)}`}
              className="text-[#b07886] hover:text-[#8a4a5a] transition-colors duration-150 hover:underline underline-offset-2 capitalize"
            >
              {data.collection}
            </a>
          </>
        )}
        {data.name && (
          <>
            <span className="text-[#d4a8b2] select-none">/</span>
            <span className="text-[#3d2b1f] font-medium truncate max-w-[160px] sm:max-w-xs">
              {data.name}
            </span>
          </>
        )}
      </nav>

      <div className="w-full px-4 sm:px-6 md:w-[85%] lg:w-[75%] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* ═════════════════════════════════════════════════════════════
            LEFT COLUMN: MEDIA GALLERY
        ══════════════════════════════════════════════════════════════ */}

        {/* ── MOBILE GALLERY (< sm): Peaking Carousel (15-20% 2nd image peek) + < 1 / 4 > Counter ── */}
        <section
          aria-label="Product Media Gallery Mobile"
          className="lg:hidden w-full flex flex-col gap-3"
        >
          {/* Peaking Carousel Track (-mx-4 so it bleeds to edges, px-4 for left indent) */}
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="-mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {data.images?.map((imgSrc, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className="relative w-[100%] shrink-0 aspect-[1/1] rounded-3xl overflow-hidden bg-[#faedf0] border border-[#f0cdd6] shadow-sm snap-start"
              >
                <Image
                  src={imgSrc}
                  alt={`${data.name} image ${idx + 1}`}
                  unoptimized
                  fill
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                  sizes="85vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* < 1 / 4 > Counter Bar Below the Image */}
          {totalImages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handlePrevImage}
                className="w-8 h-8 rounded-full border border-[#edd8de] bg-white text-[#7a6054] hover:text-[#c87a8a] hover:bg-[#faedf0] active:scale-90 transition-all flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Previous image"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <span className="text-xs font-semibold tracking-wider text-[#3d2b1f] px-3.5 py-1 rounded-full bg-white border border-[#edd8de] shadow-xs select-none">
                {selectedImageIndex + 1} / {totalImages}
              </span>

              <button
                type="button"
                onClick={handleNextImage}
                className="w-8 h-8 rounded-full border border-[#edd8de] bg-white text-[#7a6054] hover:text-[#c87a8a] hover:bg-[#faedf0] active:scale-90 transition-all flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Next image"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </section>

        {/* ── DESKTOP/TABLET GALLERY (hidden on mobile, visible on sm+): Vertical Thumbnails + Main Image ── */}
        <section
          aria-label="Product Media Gallery Desktop"
          className="hidden lg:flex lg:col-span-6 flex-row gap-4 md:gap-5 w-full items-start"
        >
          {/* Vertical Thumbnail Strip */}
          <div className="flex flex-col gap-3 shrink-0 w-20 md:w-24">
            {data.images?.map((imgSrc, idx) => {
              const isCurrent = selectedImageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-[#f9eef1] focus:outline-none cursor-pointer ${
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
          <div className="relative flex-1 w-full aspect-[3/4] md:aspect-square rounded-3xl overflow-hidden bg-[#faedf0] border border-[#f0cdd6] shadow-[0_12px_45px_rgba(180,110,130,0.12)]">
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
              className="object-cover transition-all duration-500"
            />
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            RIGHT COLUMN: PRODUCT DETAILS & VARIANT CONTROLS
        ══════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Product Information and Customization"
          className="lg:col-span-6 flex flex-col justify-start space-y-4 lg:pl-4"
        >
          {/* Header: Title, Subtitle, Rating & Price */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-wide text-[#3d2b1f] uppercase leading-none">
              {data.name}
            </h1>

            {/* Price */}
            <div className="pt-2">
              <span className="text-3xl sm:text-4xl font-semibold text-[#3d2b1f] tracking-tight">
                {formatPrice(data.price ?? 0)}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm md:text-[15px] text-[#6d554a] leading-relaxed pt-1 line-clamp-3 max-w-lg">
              {data.description}
            </p>
          </div>

          {data.colors && data.colors.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h2 className="text-sm font-bold tracking-[0.02em] text-[#a0604a]">
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
                      className={`w-6 h-6 md:w-10 md:h-10 rounded-full border-2 shadow-sm transition-all focus:outline-none ${
                        isSelected
                          ? "border-[#c25d65]"
                          : "border-2 border-[#edd8de] hover:border-[#c88389]"
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
            <div className="space-y-2.5 pt-1">
              <h2 className="text-sm font-bold tracking-[0.02em] text-[#a0604a]">
                Shape
              </h2>
              <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
                {data.shapes.map((shape) => {
                  const isSelected =
                    selectedShape?.toLowerCase() === shape.id?.toLowerCase() ||
                    selectedShape?.toLowerCase() === shape.name?.toLowerCase();
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setSelectedShape(shape.id)}
                      className={`group flex flex-col items-center justify-between py-2 px-2.5 sm:px-3 min-w-[58px] sm:min-w-18 h-20 rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
                        isSelected
                          ? "border-[#c87a8a] bg-[#c87a8a] shadow-md"
                          : "border-[#edd8de] bg-white/60 hover:border-[#c87a8a] hover:bg-[#faedf0]"
                      }`}
                    >
                      <div className="h-10 flex items-center justify-center">
                        <NailShapeIcon
                          type={shape.shapeType}
                          isSelected={isSelected}
                          selectedOnDark={isSelected}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-medium tracking-tight transition-colors ${
                          isSelected
                            ? "text-white"
                            : "text-[#7a6054] group-hover:text-[#a0485a]"
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
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold tracking-[0.02em] text-[#a0604a]">
                Length
              </h2>
              <div className="flex items-center gap-2 sm:gap-3">
                {data.lengths.map((len) => {
                  const isSelected =
                    selectedLength?.toLowerCase() === len?.toLowerCase();
                  return (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSelectedLength(len)}
                      className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border-2 focus:outline-none ${
                        isSelected
                          ? "border-[#c87a8a] bg-[#c87a8a] text-white shadow-md"
                          : "border-[#edd8de] bg-white/60 text-[#7a6054] hover:border-[#c87a8a] hover:text-[#a0485a] "
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
            <div className="space-y-2.5">
              <div className="flex items-center justify-between max-w-lg">
                <h2 className="text-sm font-bold tracking-[0.02em] text-[#a0604a]">
                  Size
                </h2>
                <div className="ml-auto">
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

              <div className="flex items-center gap-2 sm:gap-3">
                {data.sizes.map((size) => {
                  const isSelected =
                    selectedSize?.toLowerCase() === size?.toLowerCase();
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 border-2 focus:outline-none ${
                        isSelected
                          ? "border-[#c87a8a] bg-[#c87a8a] text-white shadow-md"
                          : "border-[#edd8de] bg-white/60 text-[#7a6054] hover:border-[#c87a8a] hover:text-[#a0485a]"
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
            </div>
          )}

          {/* {data?.packageType && ( */}
          <div className=" pt-3 flex items-center gap-5">
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

          {/* ── 4. CTA BUTTONS: COUNTER, ADD TO CART & BUY NOW ── */}
          <div className="w-full max-w-xl  flex items-center gap-2 sm:gap-3 pt-2">
            {/* Quantity Counter */}
            <div className="flex items-center justify-between border-2 border-[#edd8de] rounded-xl h-12 sm:h-14 bg-white/80 shrink-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-7 h-full sm:w-8 sm:h-full flex items-center justify-center text-[#7a6054] hover:text-[#d87c8e] hover:bg-[#faedf0] active:scale-90 transition-all font-bold text-base sm:text-lg select-none"
              >
                −
              </button>
              <span className="text-xs sm:text-sm font-bold text-[#3d2b1f] px-2 select-none text-center min-w-[20px]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-7 h-full sm:w-8 sm:h-full flex items-center justify-center text-[#7a6054] hover:text-[#d87c8e] hover:bg-[#faedf0] active:scale-90 transition-all font-bold text-base sm:text-lg select-none"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={isAdding}
              className="flex-1 h-12 sm:h-14 bg-[#d87c8e] hover:bg-[#c96c7e] active:scale-[0.98] text-white font-semibold px-2 sm:px-4 rounded-xl tracking-[0.06em] sm:tracking-[0.1em] uppercase text-[11px] sm:text-xs md:text-sm transition-all duration-300 shadow-[0_6px_20px_rgba(216,124,142,0.3)] hover:shadow-[0_10px_25px_rgba(216,124,142,0.42)] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isAdding ? "ADDING..." : "ADD TO CART"}</span>
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 h-12 sm:h-14 bg-[#3d2b1f] hover:bg-[#251a13] active:scale-[0.98] text-white font-semibold px-2 sm:px-4 rounded-xl tracking-[0.06em] sm:tracking-[0.1em] uppercase text-[11px] sm:text-xs md:text-sm transition-all duration-300 shadow-[0_6px_20px_rgba(61,43,31,0.2)] hover:shadow-[0_10px_25px_rgba(61,43,31,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>BUY NOW</span>
            </button>
          </div>
        </section>
      </div>

      {/* ── You Might Also Like Section ── */}
      <YouMightAlsoLike
        variant="product"
        excludeIds={[data.id || "", data._id || ""].filter(Boolean)}
        excludeSlug={data.slug}
        collection={data.collection}
        limit={4}
      />
    </main>
  );
}
