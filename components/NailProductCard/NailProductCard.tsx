"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiBookmark } from "react-icons/ci";
import { FaCartShopping } from "react-icons/fa6";
import NailShapeIcon from "../NailShapeIcon/NailShapeIcon";

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
  accentColor?: string; // hex for buttons/accents, defaults to rose pink
  size?: "sm" | "md" | "lg"; // Pre-configured card sizing presets
  className?: string; // Custom size/layout overrides
  // ── Product variant options ──
  shapes?: string[]; // e.g. ["Oval", "Almond", "Coffin", "Square", "Stiletto"]
  lengths?: string[]; // e.g. ["Short", "Medium", "Long", "Extra Long"]
  nailSizes?: string[]; // e.g. ["XS", "S", "M", "L", "XL"]
  packageType?: string;
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
    card: "max-w-xl aspect-[1.65/1]",
    title: "text-xs sm:text-sm md:text-xl",
    padding: "p-2 sm:p-3 md:p-4",
    desc: "hidden xs:line-clamp-1 sm:line-clamp-2 text-[10px] sm:text-xs",
    price: "text-sm sm:text-lg md:text-2xl",
    btn: "py-1.5 sm:py-2 md:py-2.5 text-[10px] sm:text-xs",
    btnIcon: "w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2",
    swatch: "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5",
  },
  md: {
    card: "max-w-3xl aspect-[1.65/1]",
    title: "text-sm xs:text-sm sm:text-lg md:text-2xl",
    padding: "p-2.5 sm:p-4 md:p-5 lg:p-6",
    desc: "hidden xs:line-clamp-1 sm:line-clamp-2 text-[10px] sm:text-xs md:text-sm",
    price: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
    btn: "py-2.5 sm:py-2.5 md:py-3 text-[10px] sm:text-xs md:text-sm",
    btnIcon: "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2.5",
    swatch: "w-5 h-5 sm:w-4 sm:h-4 md:w-6 md:h-6",
  },
  lg: {
    card: "max-w-4xl aspect-[1.65/1]",
    title: "text-sm sm:text-xl md:text-3xl",
    padding: "p-3 sm:p-5 md:p-6 lg:p-7",
    desc: "hidden xs:line-clamp-2 sm:line-clamp-3 text-[10px] sm:text-xs md:text-base",
    price: "text-base sm:text-2xl md:text-3xl",
    btn: "py-2 sm:py-3 md:py-3.5 text-[11px] sm:text-xs md:text-sm",
    btnIcon: "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-3",
    swatch: "w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7",
  },
};

export default function NailProductCard({
  href,
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
  shapes = [],
  lengths = [],
  nailSizes = [],
  packageType,
  onAddToBag,
  onWishlist,
  onQuickView,
}: NailProductCardProps) {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const [selectedShape, setSelectedShape] = useState(shapes[0] ?? "");
  const [selectedLength, setSelectedLength] = useState(lengths[0] ?? "");
  const [selectedNailSize, setSelectedNailSize] = useState(nailSizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(
    colors[0]?.label || colors[0]?.hex || "",
  );
  const [shapeDropdownOpen, setShapeDropdownOpen] = useState(false);
  const [lengthDropdownOpen, setLengthDropdownOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const config = SIZE_CONFIGS[size];

  const getDynamicHref = (baseHref?: string) => {
    if (!baseHref) return "";
    const params = new URLSearchParams();
    if (selectedShape) params.set("shape", selectedShape);
    if (selectedLength) params.set("length", selectedLength);
    if (selectedNailSize) params.set("size", selectedNailSize);
    if (selectedColor) params.set("shade", selectedColor);
    const queryString = params.toString();
    return queryString ? `${baseHref}?${queryString}` : baseHref;
  };
  const cardHref = getDynamicHref(href);

  const imageContent = (
    <div className="relative w-full h-full border border-[#eeb9c9] overflow-hidden rounded-lg sm:rounded-xl group bg-white/40">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        loading="eager"
        priority
        sizes="(max-width: 768px) 45vw, 350px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );

  return (
    <div
      className={`flex flex-row bg-white/90 rounded-2xl overflow-hidden border border-[#f0e0e5]/60 shadow-[0_8px_40px_rgba(160,100,120,0.10)] hover:shadow-[0_16px_56px_rgba(160,100,120,0.18)] transition-all duration-300 w-full h-full aspect-[1.65/1] ${className}`}
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* ── Left: Image Panel ── */}
      <div className="relative flex-shrink-0 w-[50%] sm:w-[46%] md:w-[48%] h-full bg-[#fdf0f2] flex flex-col justify-between p-1.5 sm:p-2.5 md:p-3">
        {/* Wishlist Button on image */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWishlisted(!wishlisted);
            onWishlist?.();
          }}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#e8c0c8]/60 bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-[#c88389]/60 shadow-sm"
          aria-label="Save to wishlist"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={wishlisted ? "#c88389" : "none"}
            stroke="#c88389"
            strokeWidth="2"
            className="sm:w-3.5 sm:h-3.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Product Image Wrapper */}
        <div className="w-full flex-1 min-h-0">
          {cardHref ? (
            <Link href={cardHref} className="block w-full h-full">
              {imageContent}
            </Link>
          ) : (
            imageContent
          )}
        </div>
      </div>

      {/* ── Right: Details Panel ── */}
      <div
        className={`flex-1 min-w-0 flex flex-col justify-between ${config.padding} relative overflow-hidden h-full`}
      >
        {/* Header: Collection + Name + Description */}
        <div className="min-w-0">
          <div className="flex justify-between items-center w-full mb-0.5 sm:mb-1">
            {cardHref ? (
              <Link
                href={cardHref}
                className="hover:opacity-80 transition-opacity truncate"
              >
                <p className="font-sans text-[12px] sm:text-[10px] md:text-[14px] font-semibold tracking-[0.14em] uppercase text-[#c88389] truncate">
                  {collection}
                </p>
              </Link>
            ) : (
              <p className="font-sans text-[12px] sm:text-[10px] md:text-[14px] font-semibold tracking-[0.14em] uppercase text-[#c88389] truncate">
                {collection}
              </p>
            )}
          </div>

          {cardHref ? (
            <Link href={cardHref} className="block group/title">
              <h2
                className={`font-serif ${config.title} font-normal tracking-wider text-[#3d2b1f] uppercase leading-tight line-clamp-1 sm:line-clamp-2 group-hover/title:text-[#c88389] transition-colors`}
              >
                {name}
              </h2>
            </Link>
          ) : (
            <h2
              className={`font-serif ${config.title} font-normal tracking-wider text-[#3d2b1f] uppercase leading-tight line-clamp-1 sm:line-clamp-2`}
            >
              {name}
            </h2>
          )}

          {/* Description - clipped or hidden on tiny screens to preserve strict rectangle */}
          <p
            className={`font-sans text-[#6b4f3a]/80 leading-snug sm:leading-relaxed ${config.desc} mt-0.5 sm:mt-1`}
          >
            {description}
          </p>
        </div>

        <div className="my-3">
          <div className="text-xs text-[#c25d65] uppercase tracking-widest">
            Shades
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

        {/* ── Product Variant Selectors (Dynamic Columns) ── */}
        {(() => {
          const hasShapes = shapes && shapes.length > 0;
          const hasLengths = lengths && lengths.length > 0;
          const hasSizes = nailSizes && nailSizes.length > 0;
          const activeCount =
            (hasShapes ? 1 : 0) + (hasLengths ? 1 : 0) + (hasSizes ? 1 : 0);

          if (activeCount === 0) return null;

          return (
            <div
              className={`grid gap-3 sm:gap-4 items-center ${
                activeCount === 3
                  ? "grid-cols-3"
                  : activeCount === 2
                    ? "grid-cols-2"
                    : "grid-cols-1 max-w-[200px]"
              }`}
            >
              {/* Shape — custom dropdown */}
              {hasShapes && (
                <div className="relative">
                  <div className="my-1 text-xs text-[#c25d65] uppercase tracking-widest">
                    Shape
                  </div>
                  {/* Trigger */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShapeDropdownOpen((o) => !o);
                      setLengthDropdownOpen(false);
                      setSizeDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-1 px-2 py-1.5 border border-[#e8c0c8] rounded bg-white text-[12px] text-[#3d2b1f] cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      {selectedShape && (
                        <NailShapeIcon
                          type={
                            selectedShape.toLowerCase() as
                              | "oval"
                              | "square"
                              | "stiletto"
                              | "almond"
                          }
                          isSelected={true}
                          width={15}
                          height={15}
                          stroke={3}
                        />
                      )}
                      <span className="truncate max-w-fit">
                        {selectedShape}
                      </span>
                    </span>
                    {/* Chevron */}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#c88389"
                      strokeWidth="2.5"
                      className={`transition-transform duration-200 flex-shrink-0 ${
                        shapeDropdownOpen ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  {shapeDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShapeDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-0.5 z-50 w-full min-w-25 bg-white border border-[#e8c0c8] rounded shadow-md overflow-hidden">
                        {shapes.map((s) => {
                          const isActive = selectedShape === s;
                          return (
                            <button
                              key={s}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedShape(s);
                                setShapeDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-1.5 px-2 py-1.5 tracking-wider text-[12px] text-left transition-colors
                                ${
                                  isActive
                                    ? "bg-[#fdf0f2] text-[#c25d65]"
                                    : "text-[#3d2b1f] hover:bg-[#fdf0f2]/60"
                                }`}
                            >
                              <NailShapeIcon
                                type={
                                  s.toLowerCase() as
                                    | "oval"
                                    | "square"
                                    | "stiletto"
                                    | "almond"
                                }
                                isSelected={isActive}
                                width={15}
                                height={15}
                                stroke={3}
                              />
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Length — custom dropdown */}
              {hasLengths && (
                <div className="relative">
                  <div className="my-1 text-xs text-[#c25d65] uppercase tracking-widest">
                    Length
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLengthDropdownOpen((o) => !o);
                      setShapeDropdownOpen(false);
                      setSizeDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-1 px-2 py-1.5 border border-[#e8c0c8] rounded bg-white text-[12px] text-[#3d2b1f] cursor-pointer select-none"
                  >
                    <span className="truncate">
                      {selectedLength || "Select"}
                    </span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#c88389"
                      strokeWidth="2.5"
                      className={`transition-transform duration-200 flex-shrink-0 ${
                        lengthDropdownOpen ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {lengthDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setLengthDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-0.5 z-50 w-full min-w-25 bg-white border border-[#e8c0c8] rounded shadow-md overflow-hidden">
                        {lengths.map((l) => {
                          const isActive = selectedLength === l;
                          return (
                            <button
                              key={l}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedLength(l);
                                setLengthDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-1.5 px-2 py-1.5 tracking-wider text-[12px] text-left transition-colors
                                ${
                                  isActive
                                    ? "bg-[#fdf0f2] text-[#c25d65]"
                                    : "text-[#3d2b1f] hover:bg-[#fdf0f2]/60"
                                }`}
                            >
                              {l}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Nail Size — custom dropdown */}
              {hasSizes && (
                <div className="relative">
                  <div className="my-1 text-xs text-[#c25d65] uppercase tracking-widest">
                    Size
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSizeDropdownOpen((o) => !o);
                      setShapeDropdownOpen(false);
                      setLengthDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-1 px-2 py-1.5 border border-[#e8c0c8] rounded bg-white text-[12px] text-[#3d2b1f] cursor-pointer select-none"
                  >
                    <span className="truncate">
                      {selectedNailSize || "Select"}
                    </span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#c88389"
                      strokeWidth="2.5"
                      className={`transition-transform duration-200 flex-shrink-0 ${
                        sizeDropdownOpen ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {sizeDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setSizeDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full mt-0.5 z-50 w-full min-w-25 bg-white border border-[#e8c0c8] rounded shadow-md overflow-hidden">
                        {nailSizes.map((sz) => {
                          const isActive = selectedNailSize === sz;
                          return (
                            <button
                              key={sz}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedNailSize(sz);
                                setSizeDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-1.5 px-2 py-1.5 tracking-wider text-[12px] text-left transition-colors
                                ${
                                  isActive
                                    ? "bg-[#fdf0f2] text-[#c25d65]"
                                    : "text-[#3d2b1f] hover:bg-[#fdf0f2]/60"
                                }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Extra Info (Material + Included Items) ── */}
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          {/* Material pill — conditionally rendered */}
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

          {/* Included items — tooltip on hover/click, floats above, zero layout cost */}
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
              What&apos;s Included {packageType}
            </button>

            {/* Floating tooltip — absolutely positioned, never shifts layout */}
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

        {/* Price & CTA */}
        <div className="min-w-0 pt-1">
          <div className="flex items-center justify-between mb-1 sm:mb-2 md:mb-3">
            <span
              className={`font-serif ${config.price} font-normal text-[#3d2b1f] tracking-wide leading-none`}
            >
              {price}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart({
                  productId: name,
                  name: name,
                  price: parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0,
                  image: imageSrc,
                  collection: collection,
                  shape: selectedShape,
                  length: selectedLength,
                  size: selectedNailSize,
                  color:
                    selectedColor || colors?.[0]?.label || colors?.[0]?.hex,
                  shade:
                    selectedColor || colors?.[0]?.label || colors?.[0]?.hex,
                  quantity: 1,
                });
                onAddToBag?.();
              }}
              className={`flex-1 ${config.btn} rounded-sm sm:rounded-xl flex items-center justify-center border border-[#e8c0c8]/70 hover:border-[#c88389]/60 bg-white/70 backdrop-blur-sm transition-all hover:scale-[1.02] shadow-sm`}
            >
              <FaCartShopping className={`${config.btnIcon} text-[#c88389]`} />
              <span className="text-[#c88389] font-medium leading-none">
                Add to Cart
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
