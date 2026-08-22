"use client";

import React, { useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface DragScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function DragScrollContainer({
  children,
  className = "",
  style = {},
}: DragScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Instant smooth slide to center next/previous item
  const centerCard = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    const itemWidth = children[0].offsetWidth + 24; // Width + 24px gap
    const currentCardIndex = Math.round(container.scrollLeft / itemWidth);
    const nextIndex =
      direction === "right" ? currentCardIndex + 1 : currentCardIndex - 1;

    const targetPos = Math.max(0, nextIndex * itemWidth);

    container.scrollTo({
      left: targetPos,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (!containerRef.current) return;

    isDraggingRef.current = false;
    setIsMouseDown(true);
    startXRef.current = e.clientX;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isMouseDown || !containerRef.current) return;

    const diff = Math.abs(e.clientX - startXRef.current);
    if (diff > 6) {
      isDraggingRef.current = true;
    }

    if (isDraggingRef.current) {
      e.preventDefault();
      const walk = (e.clientX - startXRef.current) * 1.4;
      containerRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const handlePointerUp = () => {
    setIsMouseDown(false);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = false;
    }
  };

  return (
    <div className="relative group/carousel w-full">
      {/* ── Left Arrow ── */}
      <button
        type="button"
        onClick={() => centerCard("left")}
        aria-label="Center previous item"
        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full border border-[#e8c0c8] bg-white/90 backdrop-blur-md shadow-xl text-[#3d2b1f] flex items-center justify-center transition-all duration-300 focus:outline-none opacity-90 group-hover/carousel:opacity-100 hover:bg-[#c88389] hover:text-white hover:border-[#c88389] hover:scale-110 active:scale-95"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>

      {/* ── Scrollable Track Container ── */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`select-none overflow-x-auto ${
          isMouseDown ? "cursor-grabbing" : "cursor-grab"
        } ${className}`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitUserSelect: "none",
          ...style,
        }}
      >
        {children}
      </div>

      {/* ── Right Arrow ── */}
      <button
        type="button"
        onClick={() => centerCard("right")}
        aria-label="Center next item"
        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full border border-[#e8c0c8] bg-white/90 backdrop-blur-md shadow-xl text-[#3d2b1f] flex items-center justify-center transition-all duration-300 focus:outline-none opacity-90 group-hover/carousel:opacity-100 hover:bg-[#c88389] hover:text-white hover:border-[#c88389] hover:scale-110 active:scale-95"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
