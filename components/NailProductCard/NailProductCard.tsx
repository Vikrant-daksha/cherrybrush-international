"use client";

import React, { useState } from "react";
import Image from "next/image";

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
  onAddToBag,
  onWishlist,
  onQuickView,
}: NailProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <div
      className="flex flex-col md:flex-row bg-white/90 rounded-2xl overflow-hidden border border-[#f0e0e5]/60 shadow-[0_8px_40px_rgba(160,100,120,0.10)] hover:shadow-[0_16px_56px_rgba(160,100,120,0.18)] transition-all duration-300 max-w-3xl w-full"
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* ── Left: Image Panel ── */}
      <div className="relative flex-shrink-0 w-full md:w-[52%] bg-[#fdf0f2] flex flex-col">
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-[#e8c0c8]/60 rounded-full px-3 py-1.5 shadow-sm">
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-[#a0604a]">
              {badge}
            </span>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c88389"
              strokeWidth="2.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        )}

        {/* Product Image */}
        <div
          className="relative w-full aspect-square overflow-hidden group"
          onMouseEnter={() => setShowQuickView(true)}
          onMouseLeave={() => setShowQuickView(false)}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Quick View overlay */}
          <div
            className={`absolute inset-0 bg-[#3d2b1f]/10 flex items-end justify-center pb-5 transition-opacity duration-300 ${
              showQuickView ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={onQuickView}
              className="flex flex-col items-center gap-1 bg-white/80 backdrop-blur-sm border border-[#e8c0c8]/60 rounded-full px-4 py-2 shadow-md"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c88389"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              </svg>
              <span className="font-sans text-[9px] font-bold tracking-widest uppercase text-[#a0604a] leading-none">
                Quick
                <br />
                View
              </span>
            </button>
          </div>
        </div>

        {/* Color Swatches */}
        {colors.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-3">
            {colors.map((color, i) => (
              <button
                key={i}
                title={color.label}
                className="w-7 h-7 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 focus:scale-110"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {extraColorsCount > 0 && (
              <div className="w-7 h-7 rounded-full bg-[#f0e0e5] border-2 border-white shadow-sm flex items-center justify-center">
                <span className="font-sans text-[10px] font-semibold text-[#a0604a]">
                  +{extraColorsCount}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Details Panel ── */}
      <div className="flex-1 flex flex-col justify-between px-6 py-6 relative">
        {/* Wishlist button */}
        <button
          onClick={() => {
            setWishlisted(!wishlisted);
            onWishlist?.();
          }}
          className="absolute top-5 right-5 w-9 h-9 rounded-full border border-[#e8c0c8]/60 bg-white/70 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-[#c88389]/60 shadow-sm"
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

        {/* Collection + Name */}
        <div>
          <p className="font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-[#c88389] mb-1.5">
            {collection}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-wider text-[#3d2b1f] uppercase leading-tight">
            {name}
          </h2>
          {style && (
            <p className="font-sans text-sm text-[#c88389] font-medium mt-1 tracking-wide">
              {style}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="font-sans text-sm text-[#6b4f3a]/80 leading-relaxed mt-4">
          {description}
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-[#f0e0e5]/70">
          {[
            { icon: "clock", label: "10 MIN", sub: "APPLICATION" },
            { icon: "refresh", label: "REUSABLE", sub: "UP TO 2 WEEKS" },
            { icon: "leaf", label: "NON-TOXIC", sub: "SAFE ON NAILS" },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-[#e8c0c8]/70 flex items-center justify-center flex-shrink-0">
                {icon === "clock" && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c88389"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                )}
                {icon === "refresh" && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c88389"
                    strokeWidth="2"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                )}
                {icon === "leaf" && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c88389"
                    strokeWidth="2"
                  >
                    <path d="M17 8C8 10 5.9 16.17 3.82 19.41a.5.5 0 0 0 .76.64C6.14 18.45 8 17 8 17c0 2 1 4 3 5 5-3 6-7 5-11" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-sans text-[9px] font-bold tracking-widest text-[#3d2b1f] uppercase leading-none">
                  {label}
                </p>
                <p className="font-sans text-[9px] tracking-wider text-[#a88a6a] uppercase leading-none mt-0.5">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Price + Rating */}
        <div className="flex items-center justify-between mt-5">
          <span className="font-serif text-3xl font-normal text-[#3d2b1f] tracking-wide">
            {price}
          </span>
          <div className="flex items-center gap-2">
            <StarRating rating={rating} />
            {reviewCount !== undefined && (
              <span className="font-sans text-xs text-[#a88a6a]">
                ({reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={onAddToBag}
            className="flex-1 py-3.5 rounded-xl font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-white transition-all duration-300 hover:brightness-90 active:scale-95 shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            Add to Bag
          </button>
          <button className="w-[52px] h-[52px] flex-shrink-0 flex items-center justify-center rounded-xl border border-[#e8c0c8]/70 hover:border-[#c88389]/60 bg-white/70 backdrop-blur-sm transition-all hover:scale-105 shadow-sm">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c88389"
              strokeWidth="1.8"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
              <line x1="12" y1="12" x2="12" y2="18" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
