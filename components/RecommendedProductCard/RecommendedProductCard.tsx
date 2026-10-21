"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { FaCartShopping, FaXmark } from "react-icons/fa6";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { slugify } from "@/lib/slug";

export interface ColorSwatch {
  hex: string;
  label?: string;
}

export interface RecommendedProductCardProps {
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(Math.max(rating - (star - 1), 0), 1);
        return (
          <svg
            key={star}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="flex-shrink-0"
          >
            <defs>
              <linearGradient
                id={`star-fill-${star}`}
                x1="0"
                x2="1"
                y1="0"
                y2="0"
              >
                <stop offset={`${fill * 100}%`} stopColor="#c88389" />
                <stop offset={`${fill * 100}%`} stopColor="#e8d9c0" />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={`url(#star-fill-${star})`}
              stroke="#c88389"
              strokeWidth="1"
            />
          </svg>
        );
      })}
    </div>
  );
}

export default function RecommendedProductCard(
  props: RecommendedProductCardProps,
) {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [wishlisted, setWishlisted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const target = props.product || props;
  const prodId = target._id || target.id || props._id || props.id || "";
  const prodName = target.name || props.name || "Press-On Nails";
  const prodSlug = target.slug || (prodName ? slugify(prodName) : prodId);
  const prodCollection = target.collection || props.collection || "";
  const prodDescription = target.description || props.description || "";
  const prodBadge = target.badge || props.badge;
  const prodRating = target.rating ?? props.rating ?? 5;
  const prodReviewCount = target.reviewCount ?? props.reviewCount ?? 0;

  const rawPrice = target.price ?? props.price ?? 150;
  const displayedPrice = formatPrice(rawPrice);

  const prodImg =
    (target.images && target.images[0]) ||
    target.imageSrc ||
    target.image ||
    props.imageSrc ||
    "/product.png";

  const targetColors = target.colors || props.colors || [];
  const validColors = targetColors.filter(
    (c: any) =>
      c && (c.hex?.trim?.() || c.label?.trim?.() || c.color?.trim?.()),
  );

  const targetShapes = target.shapes || props.shapes || [];
  const availableShapes = targetShapes.filter(
    (s: any) => typeof s === "string" && s.trim().length > 0,
  );

  const targetLengths = target.lengths || props.lengths || [];
  const availableLengths = targetLengths.filter(
    (l: any) => typeof l === "string" && l.trim().length > 0,
  );

  const targetSizes = target.sizes || props.sizes || [];
  const availableSizes = targetSizes.filter(
    (sz: any) => typeof sz === "string" && sz.trim().length > 0,
  );

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

  const cardHref =
    props.href || (prodSlug ? `/collection/${prodSlug}` : "/collection");

  const handleOpenAddToCartModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      price: parseFloat(String(rawPrice).replace(/[^0-9.]/g, "")) || 0,
      image: prodImg,
      collection: prodCollection,
      color: finalShade,
      shade: finalShade,
      shape: finalShape,
      length: finalLength,
      size: finalSize,
      quantity: 1,
    });
    setIsModalOpen(false);
    props.onAddToBag?.();
  };

  const imageContent = (
    <div className="relative w-full aspect-square overflow-hidden bg-[#fdf0f2] border-b border-b-[#f0c5d2] rounded-xl flex-shrink-0">
      <Image
        src={prodImg}
        alt={props.imageAlt || prodName}
        fill
        loading="eager"
        priority
        sizes="(max-width: 768px) 100vw, 20vw"
        className="object-cover transition-transform duration-500 hover:scale-105"
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setWishlisted(!wishlisted);
          props.onWishlist?.();
        }}
        className="absolute top-2 right-2 w-9 h-9 rounded-full border border-[#e8c0c8]/60 bg-white/70 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-[#c88389]/60 shadow-sm z-10"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={wishlisted ? "#c88389" : "none"}
          stroke="#c88389"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );

  return (
    <>
      <div
        className="flex flex-col rounded-2xl border border-[#f0c5d2] shadow-[0_8px_40px_rgba(160,100,120,0.10)] hover:shadow-[0_16px_56px_rgba(160,100,120,0.18)] transition-all duration-300 w-full h-full bg-white overflow-hidden p-2"
        style={{ backdropFilter: "blur(8px)" }}
      >
        {/* ── Product Image ── */}
        {cardHref ? (
          <Link href={cardHref} className="block">
            {imageContent}
          </Link>
        ) : (
          imageContent
        )}

        {/* ── Content Details ── */}
        <div className="flex-1 flex flex-col justify-between px-4 py-4 bg-white">
          <div>
            {cardHref ? (
              <Link
                href={cardHref}
                className="hover:opacity-80 transition-opacity block truncate"
              >
                <p className="font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-[#c88389] mb-1.5 truncate">
                  {prodCollection}
                </p>
              </Link>
            ) : (
              <p className="font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-[#c88389] mb-1.5 truncate">
                {prodCollection}
              </p>
            )}

            {cardHref ? (
              <Link href={cardHref} className="block group/title">
                <h2 className="text-lg md:text-xl font-medium tracking-wider text-[#3d2b1f] uppercase leading-snug line-clamp-2 group-hover/title:text-[#c88389] transition-colors">
                  {prodName}
                </h2>
              </Link>
            ) : (
              <h2 className="text-lg md:text-xl font-medium tracking-wider text-[#3d2b1f] uppercase leading-snug line-clamp-2">
                {prodName}
              </h2>
            )}

            <div className="text-[12px] my-3 line-clamp-2">{prodDescription}</div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl md:text-2xl font-semibold text-[#3d2b1f] tracking-wide">
              {displayedPrice}
            </span>
          </div>

          {/* Add to Cart Button */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleOpenAddToCartModal}
              className="flex-1 py-3 rounded-xl flex items-center justify-center border border-[#e8c0c8]/70 hover:border-[#c88389]/60 bg-white/70 backdrop-blur-sm transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
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
                className="w-3.5 h-3.5 mr-2 text-[#c88389]"
              >
                <path d="M16 10a4 4 0 0 1-8 0"></path>
                <path d="M3.103 6.034h17.794"></path>
                <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path>
              </svg>
              <span className="text-sm font-medium text-[#c88389]">
                Add to Cart
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
         ADD TO CART QUICK-VIEW OVERLAY (PORTAL TO DOCUMENT.BODY)
      ══════════════════════════════════════════════ */}
      {isModalOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
          >
            <div
              className="bg-white w-full sm:max-w-4xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
                {/* ── Left: Large Product Image ── */}
                <div className="relative w-full sm:w-[50%] aspect-[4/3] sm:aspect-auto flex-shrink-0 bg-[#fdf0f2]">
                  <Image
                    src={prodImg}
                    alt={prodName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 280px"
                  />
                  {prodBadge && (
                    <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-[#c87a8a] text-white px-2.5 py-1 rounded-full shadow">
                      {prodBadge}
                    </span>
                  )}
                </div>

                {/* ── Right: Details & Selectors ── */}
                <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6 sm:px-7 sm:pt-7 sm:pb-7 flex flex-col gap-5 relative">
                  {/* Close */}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#fdf0f2] hover:bg-[#f5d5dc] text-[#c87a8a] flex items-center justify-center transition-colors z-10 cursor-pointer"
                  >
                    <FaXmark className="w-3.5 h-3.5" />
                  </button>

                  {/* Collection · Name · Rating · Price */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#c88389] mb-1">
                      {prodCollection}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-medium text-[#3d2b1f] uppercase leading-snug pr-10 line-clamp-2">
                      {prodName}
                    </h3>
                    {prodReviewCount > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <StarRating rating={prodRating} />
                        <span className="text-[11px] text-[#8a7060]">
                          {prodRating.toFixed(1)} ({prodReviewCount})
                        </span>
                      </div>
                    )}
                    <p className="text-2xl font-semibold text-[#3d2b1f] mt-2">
                      {displayedPrice}
                    </p>
                  </div>

                  {/* ── Selectors ── */}
                  <div className="space-y-4 flex-1">
                    {availableShapes.length > 0 && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#a0604a] mb-2">
                          Shape
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

                    {availableLengths.length > 0 && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#a0604a] mb-2">
                          Length
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

                    {availableSizes.length > 0 && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#a0604a] mb-2">
                          Size
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

                  {/* ── CTA ── */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmAddToCart}
                      className="w-full py-3.5 rounded-xl bg-[#c87a8a] hover:bg-[#b56878] active:scale-[0.98] text-white font-semibold text-sm uppercase tracking-wider shadow-[0_6px_20px_rgba(200,122,138,0.35)] hover:shadow-[0_8px_28px_rgba(200,122,138,0.45)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FaCartShopping className="w-4 h-4" />
                      Add to Cart
                    </button>
                    {cardHref && (
                      <Link
                        href={cardHref}
                        className="block text-center text-[12px] text-[#8a7060] hover:text-[#3d2b1f] underline-offset-2 hover:underline transition-colors"
                        onClick={() => setIsModalOpen(false)}
                      >
                        View full details →
                      </Link>
                    )}
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
