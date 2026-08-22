"use client";

import React from "react";
import Image from "next/image";

interface PolaroidProps {
  imageSrc: string;
  imageAlt?: string;
  caption?: string;
  className?: string;
  rotate?: "left-soft" | "left-hard" | "right-soft" | "right-hard" | "none";
  shadow?: "soft" | "medium" | "hard" | "floating";
}

export default function Polaroid({
  imageSrc,
  imageAlt = "Polaroid snapshot",
  caption,
  className = "",
  rotate = "none",
  shadow = "medium",
}: PolaroidProps) {
  // Rotation presets
  const rotationClasses = {
    "left-soft": "-rotate-1 md:-rotate-2",
    "left-hard": "-rotate-3 md:-rotate-4",
    "right-soft": "rotate-1 md:rotate-2",
    "right-hard": "rotate-3 md:rotate-4",
    none: "rotate-0",
  };

  // Shadow presets
  const shadowClasses = {
    soft: "shadow-md hover:shadow-lg",
    medium: "shadow-xl hover:shadow-2xl",
    hard: "shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]",
    floating: "shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.25)]",
  }[shadow];

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
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              loading="eager"
              priority
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-contain transition-transform duration-500 hover:scale-105"
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

