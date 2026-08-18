"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CiBookmark } from "react-icons/ci";
import { FaCartShopping } from "react-icons/fa6";

export interface ColorSwatch {
  hex: string;
  label?: string;
}

export interface NailProductCardProps {
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
  accentColor?: string; // hex for buttons/accents, defaults to rose pink
  size?: "sm" | "md" | "lg"; // Pre-configured sizing presets
  className?: string; // Custom size/layout overrides (e.g. "w-[700px] h-[400px]")
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

const SIZE_CONFIGS = {
  sm: {
    card: "max-w-2xl md:h-[390px]",
    title: "text-2xl md:text-3xl",
    padding: "p-4 md:p-5",
    desc: "line-clamp-2 text-xs md:text-sm mt-2",
    featuresGap: "mt-3 pt-2.5 gap-3",
    pillIcon: "w-6 h-6",
    iconSize: "11",
  },
  md: {
    card: "max-w-3xl md:h-[450px]",
    title: "text-2xl md:text-3xl pr-12",
    padding: "p-5 md:p-6",
    desc: "line-clamp-2 md:line-clamp-3 text-sm mt-1",
    featuresGap: "mt-4 pt-3.5 gap-4",
    pillIcon: "w-7 h-7",
    iconSize: "13",
  },
  lg: {
    card: "max-w-4xl md:h-[500px]",
    title: "text-3xl md:text-[2.6rem]",
    padding: "p-6 md:p-7",
    desc: "line-clamp-3 text-sm md:text-base mt-4",
    featuresGap: "mt-5 pt-4 gap-5",
    pillIcon: "w-8 h-8",
    iconSize: "14",
  },
};

export default function NailProductCard({
  imageSrc,
  imageAlt = "Nail product",
  name,
  collection,
  style,
  description,
  price,
  badge,
  rating = 4.5,
  reviewCount,
  colors = [],
  extraColorsCount = 0,
  accentColor = "#c88389",
  size = "md",
  className = "",
  onAddToBag,
  onWishlist,
  onQuickView,
}: NailProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const config = SIZE_CONFIGS[size];

  return (
    <div
      className={`flex flex-col md:flex-row bg-white/90 rounded-2xl overflow-hidden border border-[#f0e0e5]/60 shadow-[0_8px_40px_rgba(160,100,120,0.10)] hover:shadow-[0_16px_56px_rgba(160,100,120,0.18)] transition-all duration-300 w-full ${config.card} ${className}`}
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* ── Left: Image Panel ── */}
      <div className="relative flex-shrink-0 w-full md:w-[48%] h-64 md:h-full bg-[#fdf0f2] flex flex-col justify-between">
        {/* Wishlist Button on image on mobile or as badge */}
        <button
          onClick={() => {
            setWishlisted(!wishlisted);
            onWishlist?.();
          }}
          className="absolute top-5 left-5 z-20 w-8 h-8 rounded-full border border-[#e8c0c8]/60 bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-[#c88389]/60 shadow-sm"
          aria-label="Save to wishlist"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={wishlisted ? "#c88389" : "none"}
            stroke="#c88389"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Product Image Wrapper */}
        <div className="w-full flex-1 p-3 min-h-0">
          <div className="relative w-full h-full border border-[#eeb9c9] overflow-hidden rounded-xl group bg-white/40">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Color Swatches */}
        {colors.length > 0 && (
          <div className="flex items-center justify-center gap-2 px-3 pb-3 flex-shrink-0">
            {colors.map((color, i) => (
              <button
                key={i}
                title={color.label}
                className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-[#eeb9c9] shadow-sm transition-transform hover:scale-110 focus:scale-110 focus:border-[#f08caa] focus:border-2"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {extraColorsCount > 0 && (
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#f0e0e5] border border-white shadow-sm flex items-center justify-center">
                <span className="font-sans text-[10px] font-semibold text-[#a0604a]">
                  +{extraColorsCount}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Details Panel ── */}
      <div
        className={`flex-1 flex flex-col justify-between ${config.padding} relative overflow-hidden`}
      >
        {/* Wishlist button */}

        {/* Header: Collection + Name + Style */}
        <div className="">
          <div className="flex justify-between items-center w-full mb-1">
            <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-[#c88389]">
              {collection}
            </p>
            <button
              onClick={() => {
                setWishlisted(!wishlisted);
                onWishlist?.();
              }}
              className="flex items-center justify-between w-fit px-3.5 h-8 rounded-full border text-[0.65rem] uppercase font-semibold text-[#3d2b1f] border-[#e8c0c8]/60 bg-white/70 backdrop-blur-sm gap-1.5 transition-all hover:scale-105 hover:border-[#c88389]/60 shadow-sm"
            >
              <span>Wishlist</span>
              <CiBookmark className="w-3.5 h-3.5 mb-[1px]" />
            </button>
          </div>
          <h2
            className={`font-serif ${config.title} font-normal tracking-wider text-[#3d2b1f] uppercase leading-tight`}
          >
            {name}
          </h2>
        </div>

        {/* Description (line-clamped to prevent overflowing fixed heights) */}
        <p
          className={`font-sans text-[#6b4f3a]/80 leading-relaxed ${config.desc}`}
        >
          {description}
        </p>

        {/* Feature Pills */}
        <div className={`${config.featuresGap} pb-16`}></div>

        {/* Price + Rating */}
        <div className="flex items-center justify-between mt-3 pt-2">
          <span className="font-serif text-2xl md:text-3xl font-normal text-[#3d2b1f] tracking-wide">
            {price}
          </span>
          <div className="flex items-center gap-2">
            {/* <StarRating rating={rating} />
            {reviewCount !== undefined && (
              <span className="font-sans text-xs text-[#a88a6a]">
                ({reviewCount.toLocaleString()})
              </span>
            )} */}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={onAddToBag}
            className="flex-1 py-3.5 rounded-xl flex items-center justify-center rounded-xl border border-[#e8c0c8]/70 hover:border-[#c88389]/60 bg-white/70 backdrop-blur-sm transition-all hover:scale-105 shadow-sm"
          >
            <FaCartShopping className="w-5 h-5 mr-3 text-[#c88389]" />
            <span className="text-[#c88389]">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
