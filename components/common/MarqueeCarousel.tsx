"use client";

import React, { useRef, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface MarqueeCarouselProps {
  children: React.ReactNode;
  speed?: number; // Continuous speed in px/frame
  className?: string;
}

export default function MarqueeCarousel({
  children,
  speed = 0.8,
  className = "",
}: MarqueeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isCentering, setIsCentering] = useState(false);

  // State refs for smooth physics animation
  const currentSpeedRef = useRef(speed);
  const targetSpeedRef = useRef(speed);
  const scrollPosRef = useRef(0);
  const targetPosRef = useRef<number | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const childrenArray = React.Children.toArray(children);
  const shouldAutoScroll = childrenArray.length > 3;

  // Update target speed smoothly on hover state changes
  useEffect(() => {
    if (!shouldAutoScroll) return;
    if (!targetPosRef.current && !isCentering) {
      targetSpeedRef.current = isHovered ? 0 : speed;
    }
  }, [isHovered, speed, isCentering, shouldAutoScroll]);

  useEffect(() => {
    if (!shouldAutoScroll) return;

    const track = trackRef.current;
    if (!track) return;

    const animate = () => {
      // 1. If an arrow click requested centering a specific card
      if (targetPosRef.current !== null) {
        const diff = targetPosRef.current - scrollPosRef.current;
        if (Math.abs(diff) > 0.5) {
          // Snappy 0.14 lerp damp factor for smooth gliding
          scrollPosRef.current += diff * 0.14;
        } else {
          // Snap exact position and hold in center for 600ms
          scrollPosRef.current = targetPosRef.current;
          targetPosRef.current = null;
          targetSpeedRef.current = 0;

          if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
          holdTimerRef.current = setTimeout(() => {
            setIsCentering(false);
            targetSpeedRef.current = isHovered ? 0 : speed;
          }, 600);
        }
      } else {
        // 2. Continuous marquee motion with smooth lerp deceleration on hover
        currentSpeedRef.current +=
          (targetSpeedRef.current - currentSpeedRef.current) * 0.08;

        if (Math.abs(currentSpeedRef.current) > 0.001) {
          scrollPosRef.current += currentSpeedRef.current;
        }
      }

      // Infinite seamless 360° modulo wrap: exactly half of the 2x duplicated track width
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0) {
        if (scrollPosRef.current >= halfWidth) {
          scrollPosRef.current -= halfWidth;
          if (targetPosRef.current !== null) {
            targetPosRef.current -= halfWidth;
          }
        } else if (scrollPosRef.current < 0) {
          scrollPosRef.current += halfWidth;
          if (targetPosRef.current !== null) {
            targetPosRef.current += halfWidth;
          }
        }
      }

      track.style.transform = `translate3d(-${scrollPosRef.current}px, 0, 0)`;
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, [speed, isHovered, shouldAutoScroll]);

  // Handle previous/next navigation
  const handleNav = (direction: "left" | "right") => {
    if (shouldAutoScroll) {
      const track = trackRef.current;
      if (!track || !track.children || track.children.length === 0) return;

      const firstItem = track.children[0] as HTMLElement;
      if (!firstItem) return;

      const itemWidth = firstItem.offsetWidth + 24; // Width + 24px flex gap
      const currentCardIndex = Math.round(scrollPosRef.current / itemWidth);

      const nextIndex =
        direction === "right" ? currentCardIndex + 1 : currentCardIndex - 1;

      setIsCentering(true);
      targetPosRef.current = nextIndex * itemWidth;
    } else if (containerRef.current) {
      const firstChild = trackRef.current?.children[0] as HTMLElement | undefined;
      const step = firstChild ? firstChild.offsetWidth + 24 : 400;
      containerRef.current.scrollBy({
        left: direction === "right" ? step : -step,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group/marquee w-full ${
        shouldAutoScroll ? "overflow-hidden" : "overflow-x-auto scrollbar-none"
      } py-2 ${className}`}
      style={
        !shouldAutoScroll
          ? { scrollbarWidth: "none", msOverflowStyle: "none" }
          : undefined
      }
    >
      {/* ── Left Arrow: Only when there's more than 1 item ── */}
      {childrenArray.length > 1 && (
        <button
          type="button"
          onClick={() => handleNav("left")}
          aria-label="Previous item"
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full border border-[#e8c0c8] bg-white/90 backdrop-blur-md shadow-xl text-[#3d2b1f] flex items-center justify-center transition-all duration-300 focus:outline-none opacity-90 group-hover/marquee:opacity-100 hover:bg-[#c88389] hover:text-white hover:border-[#c88389] hover:scale-110 active:scale-95"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* ── Track: Duplicated only when auto-scrolling with > 3 items ── */}
      <div
        ref={trackRef}
        className={`flex gap-6 ${
          shouldAutoScroll
            ? "w-max will-change-transform"
            : "w-max min-w-full justify-start"
        }`}
        style={shouldAutoScroll ? { transform: "translate3d(0, 0, 0)" } : undefined}
      >
        {childrenArray.map((child, idx) => (
          <React.Fragment key={`set1-${idx}`}>{child}</React.Fragment>
        ))}
        {shouldAutoScroll &&
          childrenArray.map((child, idx) => (
            <React.Fragment key={`set2-${idx}`}>{child}</React.Fragment>
          ))}
      </div>

      {/* ── Right Arrow: Only when there's more than 1 item ── */}
      {childrenArray.length > 1 && (
        <button
          type="button"
          onClick={() => handleNav("right")}
          aria-label="Next item"
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full border border-[#e8c0c8] bg-white/90 backdrop-blur-md shadow-xl text-[#3d2b1f] flex items-center justify-center transition-all duration-300 focus:outline-none opacity-90 group-hover/marquee:opacity-100 hover:bg-[#c88389] hover:text-white hover:border-[#c88389] hover:scale-110 active:scale-95"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
