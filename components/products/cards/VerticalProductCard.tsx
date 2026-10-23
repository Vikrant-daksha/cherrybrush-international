"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { FaCartShopping, FaXmark } from "react-icons/fa6";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { getCloudinaryThumbnail } from "@/lib/imageLoader";
import { slugify } from "@/lib/slug";

export interface ColorSwatch {
  hex: string;
  label?: string;
}

export interface VerticalProductCardProps {
  id?: string;
  _id?: string;
  slug?: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
  name?: string;
  collection?: string;
  style?: string;
  description?: string;
  price?: string | number;
  originalPrice?: number;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  colors?: ColorSwatch[];
  extraColorsCount?: number;
  shapes?: string[];
  lengths?: string[];
  sizes?: string[];
  packageType?: string;
  accentColor?: string;
  onAddToBag?: () => void;
  onWishlist?: () => void;
  onQuickView?: () => void;
  product?: any;
}

const DEFAULT_SHAPES = ["Almond", "Coffin", "Square", "Round"];
const DEFAULT_LENGTHS = ["Short", "Medium", "Long"];
const DEFAULT_SIZES = ["XS", "S", "M", "L"];

export default function VerticalProductCard(props: VerticalProductCardProps) {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Swipe-down-to-close gesture state for mobile (< md)
  const [dragY, setDragY] = useState(0);
  const [isPastThreshold, setIsPastThreshold] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const SWIPE_THRESHOLD = 90;

  // Smooth exit animation handler
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setDragY(0);
      setIsPastThreshold(false);
      setIsDragging(false);
    }, 300);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable gesture on mobile screens (< 768px / md)
    if (typeof window !== "undefined" && window.innerWidth >= 768) return;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      !isDragging ||
      (typeof window !== "undefined" && window.innerWidth >= 768)
    )
      return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      // Swiping downwards
      setDragY(deltaY);
      setIsPastThreshold(deltaY >= SWIPE_THRESHOLD);
    } else {
      setDragY(0);
      setIsPastThreshold(false);
    }
  };

  const handleTouchEnd = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) return;
    setIsDragging(false);
    if (dragY >= SWIPE_THRESHOLD) {
      closeModal();
    } else {
      setDragY(0);
      setIsPastThreshold(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Support both flat props and nested `product` object
  const target = props.product || props;
  const prodId = target._id || target.id || props._id || props.id || "";
  const prodName = target.name || props.name || "Press-On Nails";
  const prodSlug = target.slug || (prodName ? slugify(prodName) : prodId);
  const prodCollection =
    target.collection || props.collection || "Press-On Set";
  const prodBadge = target.badge || props.badge;

  // Resolve numeric price
  const rawPrice = target.price ?? props.price ?? 150;
  const prodPrice =
    typeof rawPrice === "number"
      ? rawPrice
      : parseFloat(String(rawPrice).replace(/[^0-9.]/g, "")) || 0;
  const prodOriginalPrice =
    target.originalPrice || props.originalPrice || Math.round(prodPrice * 1.18);

  // Resolve image URL
  const prodImg =
    (target.images && target.images[0]) ||
    target.imageSrc ||
    target.image ||
    props.imageSrc ||
    "/product.png";

  const productHref =
    props.href || (prodSlug ? `/collection/${prodSlug}` : "/collection");

  // Resolve variants
  const targetColors = target.colors || props.colors || [];
  const validColors = targetColors.filter(
    (c: any) =>
      c && (c.hex?.trim?.() || c.label?.trim?.() || c.color?.trim?.()),
  );

  const targetShapes = target.shapes || props.shapes;
  const availableShapes =
    targetShapes && targetShapes.length > 0
      ? targetShapes.filter(
          (s: any) => typeof s === "string" && s.trim().length > 0,
        )
      : DEFAULT_SHAPES;

  const targetLengths = target.lengths || props.lengths;
  const availableLengths =
    targetLengths && targetLengths.length > 0
      ? targetLengths.filter(
          (l: any) => typeof l === "string" && l.trim().length > 0,
        )
      : DEFAULT_LENGTHS;

  const targetSizes = target.sizes || props.sizes;
  const availableSizes =
    targetSizes && targetSizes.length > 0
      ? targetSizes.filter(
          (sz: any) => typeof sz === "string" && sz.trim().length > 0,
        )
      : DEFAULT_SIZES;

  const [selectedColor] = useState(
    validColors[0]?.label || validColors[0]?.hex || "",
  );

  const [popupShape, setPopupShape] = useState<string>(
    () => availableShapes[0] || "",
  );
  const [popupLength, setPopupLength] = useState<string>(
    () => availableLengths[0] || "",
  );
  const [popupSize, setPopupSize] = useState<string>(
    () => availableSizes[0] || "",
  );
  const [popupShade, setPopupShade] = useState<string>(
    selectedColor || validColors[0]?.label || validColors[0]?.hex || "",
  );

  useEffect(() => {
    if (!popupShape && availableShapes[0]) setPopupShape(availableShapes[0]);
    if (!popupLength && availableLengths[0])
      setPopupLength(availableLengths[0]);
    if (!popupSize && availableSizes[0]) setPopupSize(availableSizes[0]);
  }, [
    availableShapes,
    availableLengths,
    availableSizes,
    popupShape,
    popupLength,
    popupSize,
  ]);

  const handleOpenQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragY(0);
    setIsPastThreshold(false);
    setIsDragging(false);
    setPopupShape((prev) => prev || availableShapes[0] || "");
    setPopupLength((prev) => prev || availableLengths[0] || "");
    setPopupSize((prev) => prev || availableSizes[0] || "");
    setPopupShade(
      popupShade ||
        selectedColor ||
        validColors[0]?.label ||
        validColors[0]?.hex ||
        "",
    );
    setIsModalOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
    });
  };

  const handleConfirmAddToCart = () => {
    const finalShade =
      popupShade ||
      selectedColor ||
      validColors[0]?.label ||
      validColors[0]?.hex ||
      undefined;
    const finalShape = popupShape || availableShapes[0] || undefined;
    const finalLength = popupLength || availableLengths[0] || undefined;
    const finalSize = popupSize || availableSizes[0] || undefined;

    addToCart({
      productId: prodId || prodSlug,
      name: prodName,
      price: prodPrice,
      image: prodImg,
      collection: prodCollection,
      color: finalShade,
      shade: finalShade,
      shape: finalShape,
      length: finalLength,
      size: finalSize,
      quantity: 1,
    });
    closeModal();
    props.onAddToBag?.();
  };

  return (
    <>
      <div
        className="group relative flex flex-col bg-white rounded-[20px] overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 w-full"
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.06) 0px 1px 4px 0px, rgba(0, 0, 0, 0.04) 0px 0px 0px 1px",
        }}
      >
        <Link
          className="relative block overflow-hidden bg-zinc-50 shrink-0"
          href={productHref}
          style={{ aspectRatio: "10/13" }}
        >
          <Image
            src={getCloudinaryThumbnail(prodImg, 400, 533)}
            unoptimized
            alt={prodName}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Bestseller Badge (Commented out) */}
          {/*
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-2.5 h-2.5 fill-amber-400 text-amber-400"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
              </svg>
              Bestseller
            </span>
          </div>
          */}

          {/* Quick Add overlay button on hover */}
          <div className="absolute inset-x-3 bottom-5 z-10 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
            <button
              type="button"
              onClick={handleOpenQuickAdd}
              className="flex-1 h-10 rounded-xl bg-white/95 backdrop-blur-sm text-zinc-900 text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 hover:bg-white transition-colors shadow-sm cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M16 10a4 4 0 0 1-8 0"></path>
                <path d="M3.103 6.034h17.794"></path>
                <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path>
              </svg>
              Quick Add
            </button>
          </div>
        </Link>

        <div className="px-4 pt-3.5 pb-4 flex flex-col gap-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            {prodCollection}
          </p>
          <Link className="block" href={productHref}>
            <h3 className="text-[15px] font-semibold text-zinc-900 leading-snug line-clamp-1 hover:text-[#c88389] transition-colors">
              {prodName}
            </h3>
          </Link>

          {/* ── RATINGS (Commented out until comments/reviews system is implemented) ── */}
          {/*
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-[2px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="relative w-[11px] h-[11px]">
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute inset-0 w-full h-full fill-amber-400"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </span>
              ))}
            </div>
            <span className="text-[11px] font-semibold text-zinc-700">
              {props.rating || 4.8}
            </span>
            <span className="text-[10px] text-zinc-400">
              ({props.reviewCount || 196})
            </span>
          </div>
          */}

          {/* ── PRICE & DISCOUNT ── */}
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="text-[15px] font-bold text-zinc-900 tracking-tight">
              {formatPrice(prodPrice)}
            </span>

            {/* ── PERCENTAGE OFF & STRIKETHROUGH (Commented out until specific product discounts are implemented) ── */}
            {/*
            <span className="text-sm text-zinc-400 line-through font-medium">
              {formatPrice(prodOriginalPrice)}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md leading-none">
              15% off
            </span>
            */}
          </div>

          {/* ── FREE DELIVERY & IN STOCK (Commented out for future implementation) ── */}
          {/*
          <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
            <svg
              className="w-3 h-3 text-emerald-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12l5 5L20 7"></path>
            </svg>
            Free delivery · In stock
          </p>
          */}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
         QUICK ADD MODAL OVERLAY (PORTAL TO DOCUMENT.BODY)
      ══════════════════════════════════════════════ */}
      {isModalOpen &&
        mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ease-out ${
              isModalVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
          >
            <div
              className={`bg-white w-full md:max-w-4xl md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col will-change-transform transition-all duration-300 ease-out ${
                isModalVisible
                  ? "translate-y-0 md:opacity-100 md:scale-100"
                  : "translate-y-full md:opacity-0 md:scale-95"
              }`}
              onClick={(e) => e.stopPropagation()}
              style={{
                transform:
                  isDragging && dragY > 0
                    ? `translateY(${dragY}px)`
                    : undefined,
                transition: isDragging ? "none" : undefined,
              }}
            >
              {/* ── Mobile-Only Stretched Swipe Handle (< md) ── */}
              <div
                className="md:hidden w-full flex flex-col items-center justify-center pt-2 pb-2 bg-[#fdf0f2] border-b border-[#f0cdd6]/60 cursor-grab active:cursor-grabbing select-none touch-none shrink-0"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onClick={closeModal}
                role="button"
                aria-label="Swipe down or tap to close"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-150 ${
                    isPastThreshold
                      ? "w-20 bg-[#c87a8a] scale-110 shadow-sm ring-2 ring-[#c87a8a]/30"
                      : dragY > 15
                        ? "w-14 bg-[#d89ba6]"
                        : "w-10 bg-[#e0b5be] hover:bg-[#c87a8a]"
                  }`}
                />
              </div>

              <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
                {/* ── Left: Large Product Image ── */}
                <div
                  className="relative w-full md:w-[50%] aspect-[1/1] md:aspect-auto flex-shrink-0 bg-[#fdf0f2]"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  <Image
                    src={getCloudinaryThumbnail(prodImg, 800, 800)}
                    alt={prodName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  {prodBadge && (
                    <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-[#c87a8a] text-white px-2.5 py-1 rounded-full shadow">
                      {prodBadge}
                    </span>
                  )}
                </div>

                {/* ── Right: Details & Selectors ── */}
                <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6 md:px-7 md:pt-7 md:pb-7 flex flex-col gap-5 relative">
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#fdf0f2] hover:bg-[#f5d5dc] text-[#c87a8a] flex items-center justify-center transition-colors z-10 cursor-pointer"
                    title="Close"
                  >
                    <FaXmark className="w-3.5 h-3.5" />
                  </button>

                  {/* Collection · Name · Price */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#c88389] mb-1">
                      {prodCollection}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-medium text-[#3d2b1f] uppercase leading-snug pr-10 line-clamp-2">
                      {prodName}
                    </h3>

                    <p className="text-2xl font-semibold text-[#3d2b1f] mt-2">
                      {formatPrice(prodPrice)}
                    </p>
                  </div>

                  {/* ── Variant Selectors ── */}
                  <div className="space-y-4 flex-1">
                    {/* Shape Selector */}
                    {availableShapes.length > 0 && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#a0604a] mb-2">
                          Shape
                          {popupShape && (
                            <span className="normal-case font-normal text-[#3d2b1f] ml-1">
                              — {popupShape}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableShapes.map((shape: string) => {
                            const isSelected = popupShape === shape;
                            return (
                              <button
                                key={shape}
                                type="button"
                                onClick={() =>
                                  setPopupShape(isSelected ? "" : shape)
                                }
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border-2 transition-all duration-150 cursor-pointer ${
                                  isSelected
                                    ? "bg-[#c87a8a] border-[#c87a8a] text-white shadow-sm"
                                    : "bg-white border-[#edd8de] text-[#7a6054] hover:border-[#c87a8a] hover:text-[#a0485a]"
                                }`}
                              >
                                {shape}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Length Selector */}
                    {availableLengths.length > 0 && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#a0604a] mb-2">
                          Length
                          {popupLength && (
                            <span className="normal-case font-normal text-[#3d2b1f] ml-1">
                              — {popupLength}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableLengths.map((len: string) => {
                            const isSelected = popupLength === len;
                            return (
                              <button
                                key={len}
                                type="button"
                                onClick={() =>
                                  setPopupLength(isSelected ? "" : len)
                                }
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border-2 transition-all duration-150 cursor-pointer ${
                                  isSelected
                                    ? "bg-[#c87a8a] border-[#c87a8a] text-white shadow-sm"
                                    : "bg-white border-[#edd8de] text-[#7a6054] hover:border-[#c87a8a] hover:text-[#a0485a]"
                                }`}
                              >
                                {len}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Size Selector */}
                    {availableSizes.length > 0 && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#a0604a] mb-2">
                          Size
                          {popupSize && (
                            <span className="normal-case font-normal text-[#3d2b1f] ml-1">
                              — {popupSize}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.map((sz: string) => {
                            const isSelected = popupSize === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() =>
                                  setPopupSize(isSelected ? "" : sz)
                                }
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium border-2 transition-all duration-150 cursor-pointer ${
                                  isSelected
                                    ? "bg-[#c87a8a] border-[#c87a8a] text-white shadow-sm"
                                    : "bg-white border-[#edd8de] text-[#7a6054] hover:border-[#c87a8a] hover:text-[#a0485a]"
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Shade / Color Selector */}
                    {validColors.length > 0 && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#a0604a] mb-2">
                          Shade
                          {popupShade && (
                            <span className="normal-case font-normal text-[#3d2b1f] ml-1">
                              — {popupShade}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2.5">
                          {validColors.map((color: any, i: number) => {
                            const colorKey = color.label || color.hex;
                            const isSelected = popupShade === colorKey;
                            return (
                              <button
                                key={i}
                                type="button"
                                title={color.label || color.hex}
                                onClick={() => setPopupShade(colorKey)}
                                className={`w-7 h-7 rounded-full border-2 shadow-sm transition-all hover:scale-110 cursor-pointer ${
                                  isSelected
                                    ? "border-[#c25d65] ring-2 ring-[#c88389]/50 scale-110"
                                    : "border-[#edd8de] hover:border-[#c88389]"
                                }`}
                                style={{ backgroundColor: color.hex }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Actions: Add to Cart & Full Details Link ── */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmAddToCart}
                      className="w-full py-3.5 rounded-xl bg-[#c87a8a] hover:bg-[#b56878] active:scale-[0.98] text-white font-semibold text-sm uppercase tracking-wider shadow-[0_6px_20px_rgba(200,122,138,0.35)] hover:shadow-[0_8px_28px_rgba(200,122,138,0.45)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FaCartShopping className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <Link
                      href={productHref}
                      className="block text-center text-[12px] text-[#8a7060] hover:text-[#3d2b1f] underline-offset-2 hover:underline transition-colors"
                      onClick={closeModal}
                    >
                      View full details →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
