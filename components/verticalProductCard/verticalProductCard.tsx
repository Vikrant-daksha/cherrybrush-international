"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { FaCartShopping, FaXmark } from "react-icons/fa6";
import { useCart } from "@/context/CartContext";

export interface ColorSwatch {
  hex: string;
  label?: string;
}

export interface NailProductCardProps {
  href?: string;
  imageSrc: string;
  imageAlt?: string;
  name: string;
  collection: string;
  style?: string; // e.g. "Glitter Ombre"
  description: string;
  price: string;
  badge?: string; // e.g. "BEST SELLER"
  rating?: number; // 0–5, supports halves
  reviewCount?: number;
  colors?: ColorSwatch[];
  extraColorsCount?: number; // e.g. 2 for "+2"
  shapes?: string[];
  lengths?: string[];
  sizes?: string[];
  packageType?: string;
  accentColor?: string;
  onAddToBag?: () => void;
  onWishlist?: () => void;
  onQuickView?: () => void;
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

const DEFAULT_SHAPES = ["Almond", "Coffin", "Square", "Oval", "Stiletto"];
const DEFAULT_LENGTHS = ["Short", "Medium", "Long"];
const DEFAULT_SIZES = ["XS", "S", "M", "L", "Custom"];

export default function VerticalProductCard({
  href,
  imageSrc,
  imageAlt = "Nail Product",
  name,
  collection,
  style: styleLabel,
  description,
  price,
  badge,
  rating = 5,
  reviewCount = 0,
  colors = [],
  extraColorsCount = 0,
  shapes = DEFAULT_SHAPES,
  lengths = DEFAULT_LENGTHS,
  sizes = DEFAULT_SIZES,
  packageType = "",
  accentColor = "#c88389",
  onAddToBag,
  onWishlist,
  onQuickView,
}: NailProductCardProps) {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedColor, setSelectedColor] = useState(
    colors[0]?.label || colors[0]?.hex || "",
  );

  // Popup overlay option selection states
  const availableShapes = shapes && shapes.length > 0 ? shapes : DEFAULT_SHAPES;
  const availableLengths =
    lengths && lengths.length > 0 ? lengths : DEFAULT_LENGTHS;
  const availableSizes = sizes && sizes.length > 0 ? sizes : DEFAULT_SIZES;

  const [popupShape, setPopupShape] = useState<string>("");
  const [popupLength, setPopupLength] = useState<string>("");
  const [popupSize, setPopupSize] = useState<string>("");
  const [popupShade, setPopupShade] = useState<string>(
    selectedColor || colors[0]?.label || colors[0]?.hex || "",
  );

  const getDynamicHref = (baseHref?: string) => {
    if (!baseHref) return "";
    const params = new URLSearchParams();
    if (selectedColor) params.set("shade", selectedColor);
    const queryString = params.toString();
    return queryString ? `${baseHref}?${queryString}` : baseHref;
  };
  const cardHref = getDynamicHref(href);

  const handleOpenAddToCartModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupShade(selectedColor || colors[0]?.label || colors[0]?.hex || "");
    setIsModalOpen(true);
  };

  const handleConfirmAddToCart = () => {
    addToCart({
      productId: name,
      name: name,
      price: parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0,
      image: imageSrc,
      collection: collection,
      color:
        popupShade || selectedColor || colors?.[0]?.label || colors?.[0]?.hex,
      shade:
        popupShade || selectedColor || colors?.[0]?.label || colors?.[0]?.hex,
      shape: popupShape || undefined,
      length: popupLength || undefined,
      size: popupSize || undefined,
      quantity: 1,
    });
    setIsModalOpen(false);
    onAddToBag?.();
  };

  const imageContent = (
    <div className="relative w-full aspect-square overflow-hidden bg-[#fdf0f2] border-b border-b-[#f0c5d2] rounded-xl flex-shrink-0">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        loading="eager"
        priority
        sizes="(max-width: 768px) 100vw, 20vw"
        className="object-cover transition-transform duration-500 hover:scale-105"
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setWishlisted(!wishlisted);
          onWishlist?.();
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
                  {collection}
                </p>
              </Link>
            ) : (
              <p className="font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-[#c88389] mb-1.5 truncate">
                {collection}
              </p>
            )}

            {cardHref ? (
              <Link href={cardHref} className="block group/title">
                <h2 className="font-serif text-lg md:text-xl font-normal tracking-wider text-[#3d2b1f] uppercase leading-snug line-clamp-2 group-hover/title:text-[#c88389] transition-colors">
                  {name}
                </h2>
              </Link>
            ) : (
              <h2 className="font-serif text-lg md:text-xl font-normal tracking-wider text-[#3d2b1f] uppercase leading-snug line-clamp-2">
                {name}
              </h2>
            )}

            <div className="text-[12px] my-3 line-clamp-2">{description}</div>

            <div className="uppercase text-[10px] tracking-widest font-semibold text-[#d4747c]">
              Shades{" "}
            </div>
            <div className="min-h-9 flex items-center">
              {colors.length > 0 && (
                <div className="flex items-center gap-3 py-2">
                  {colors.slice(0, 3).map((color, i) => {
                    const colorKey = color.label || color.hex;
                    const isSelected = selectedColor === colorKey;
                    return (
                      <button
                        key={i}
                        title={color.label || color.hex}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedColor(colorKey);
                        }}
                        className={`w-6 h-6 rounded-full border shadow-sm transition-all hover:scale-110 ${
                          isSelected
                            ? "ring-2 ring-[#c88389] border-[#c25d65] scale-105"
                            : "border-[#eeb9c9] hover:border-[#c88389]"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    );
                  })}
                  {extraColorsCount > 0 && (
                    <div className="w-6 h-6 rounded-full bg-[#f0e0e5] border-2 border-white shadow-sm flex items-center justify-center">
                      <span className="font-sans text-[10px] font-semibold text-[#a0604a]">
                        +{extraColorsCount}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-2">
            <span className="font-serif text-2xl font-normal text-[#3d2b1f] tracking-wide">
              {price}
            </span>
          </div>

          {/* Add to Cart Button */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleOpenAddToCartModal}
              className="flex-1 py-3 rounded-xl flex items-center justify-center border border-[#e8c0c8]/70 hover:border-[#c88389]/60 bg-white/70 backdrop-blur-sm transition-all hover:scale-[1.02] shadow-sm"
            >
              <FaCartShopping className="w-4 h-4 mr-2 text-[#c88389]" />
              <span className="text-sm font-medium text-[#c88389]">
                Add to Cart
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
         ADD TO CART POPUP OVERLAY MODAL (PORTAL TO DOCUMENT.BODY)
      ══════════════════════════════════════════════ */}
      {isModalOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
              >
                <FaXmark className="w-5 h-5" />
              </button>

              {/* Modal Title & Product Summary */}
              <div className="flex items-center gap-4 border-b border-neutral-100 pb-4 mb-5">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#fdf0f2] flex-shrink-0 border border-[#f0c5d2]">
                  <Image
                    src={imageSrc}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-semibold tracking-widest uppercase text-[#c88389]">
                    {collection}
                  </p>
                  <h3 className="font-serif text-lg font-normal text-[#3d2b1f] uppercase leading-tight line-clamp-1">
                    {name}
                  </h3>
                  <p className="font-serif text-lg font-semibold text-[#3d2b1f] mt-0.5">
                    {price}
                  </p>
                </div>
              </div>

              {/* Option Selection Form */}
              <div className="space-y-5">
                {/* ── 1. Shape Selection ── */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0604a] mb-2">
                    Select Shape{" "}
                    {!popupShape && (
                      <span className="text-[#c88389] font-normal lowercase">
                        (optional)
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableShapes.map((shape) => {
                      const isSelected = popupShape === shape;
                      return (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => setPopupShape(isSelected ? "" : shape)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? "bg-[#c88389] text-white border-[#c88389] shadow-sm"
                              : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-[#c88389]"
                          }`}
                        >
                          {shape}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── 2. Length Selection ── */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0604a] mb-2">
                    Select Length{" "}
                    {!popupLength && (
                      <span className="text-[#c88389] font-normal lowercase">
                        (optional)
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableLengths.map((len) => {
                      const isSelected = popupLength === len;
                      return (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setPopupLength(isSelected ? "" : len)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? "bg-[#c88389] text-white border-[#c88389] shadow-sm"
                              : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-[#c88389]"
                          }`}
                        >
                          {len}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── 3. Size Selection ── */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0604a] mb-2">
                    Select Size{" "}
                    {!popupSize && (
                      <span className="text-[#c88389] font-normal lowercase">
                        (optional)
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sz) => {
                      const isSelected = popupSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setPopupSize(isSelected ? "" : sz)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? "bg-[#c88389] text-white border-[#c88389] shadow-sm"
                              : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-[#c88389]"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── 4. Shade Selection ── */}
                {colors.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0604a] mb-2">
                      Select Shade:{" "}
                      <span className="text-[#3d2b1f] font-normal">
                        {popupShade}
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      {colors.map((color, i) => {
                        const colorKey = color.label || color.hex;
                        const isSelected = popupShade === colorKey;
                        return (
                          <button
                            key={i}
                            type="button"
                            title={color.label || color.hex}
                            onClick={() => setPopupShade(colorKey)}
                            className={`w-8 h-8 rounded-full border shadow-sm transition-all hover:scale-110 ${
                              isSelected
                                ? "ring-2 ring-[#c88389] border-[#c25d65] scale-110"
                                : "border-[#eeb9c9] hover:border-[#c88389]"
                            }`}
                            style={{ backgroundColor: color.hex }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {packageType && packageType !== "" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0604a] mb-2">
                      Select Package Type:{" "}
                      <span className="text-[#3d2b1f] font-normal">
                        {packageType}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* ── 2 Bottom CTA Buttons: Cancel & Add ── */}
              <div className="flex items-center gap-3 mt-8 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-semibold text-sm transition-all active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToCart}
                  className="flex-1 py-3.5 rounded-xl bg-[#c88389] hover:bg-[#b57379] text-white font-semibold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <FaCartShopping className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
