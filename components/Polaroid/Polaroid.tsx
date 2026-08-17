"use client";

import React from "react";

interface PolaroidProps {
  imageSrc: string;
  imageAlt?: string;
  caption?: string;
  className?: string;
  rotate?: "left-soft" | "left-hard" | "right-soft" | "right-hard" | "none";
}

export default function Polaroid({
  imageSrc,
  imageAlt = "Polaroid photograph",
  caption,
  className = "",
  rotate = "none",
}: PolaroidProps) {
  // Map rotation props to Tailwind rotation classes
  const rotationClasses = {
    "left-soft": "-rotate-3 hover:rotate-0",
    "left-hard": "-rotate-5 hover:-rotate-1",
    "right-soft": "rotate-3 hover:rotate-0",
    "right-hard": "rotate-5 hover:rotate-1",
    none: "rotate-0",
  };

  const shadowClasses =
    "shadow-[0_12px_24px_rgba(61,43,31,0.25)] hover:shadow-[0_20px_40px_rgba(61,43,31,0.38)] border border-[#ebdccb]/50";

  return (
    <div
      className={`
        inline-block
        transition-all duration-300 ease-out
        hover:-translate-y-2
        ${rotationClasses[rotate]}
        ${shadowClasses}
        ${className}
      `}
    >
      <div className="bg-[#f0f0f0] p-2 pb-8">
        {/* Inner Image (Square Ratio) */}
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 border border-black/[0.03] shadow-inner">
          {imageSrc.startsWith("/") || imageSrc.startsWith("http") ? (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm italic">
              Image Placeholder
            </div>
          )}
        </div>

        {/* Caption sitting in the wider bottom border */}
        {caption && (
          <div className="mt-4 text-center select-none px-2">
            <p className="font-serif italic text-lg md:text-xl text-[#3d2b1f]/80 leading-snug tracking-wide">
              {caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

