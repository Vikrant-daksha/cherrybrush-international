"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";

export interface SizeChartModalProps {
  open: boolean;
  onClose: () => void;
}

const SizeChartModal: React.FC<SizeChartModalProps> = ({ open, onClose }) => {
  // Close on Escape key press & prevent background scrolling
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md transition-all duration-200 animate-in fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-white/95 backdrop-blur-md border border-[#e8c0c8]/70 rounded-3xl p-4 sm:p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col items-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#f0c5d2]/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c25d65]" />
            <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#3d2b1f]">
              Nail Size Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size chart modal"
            className="p-1.5 rounded-full text-neutral-400 hover:text-[#c25d65] hover:bg-[#fdf0f2] transition-colors focus:outline-none"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative w-full max-h-[75vh] overflow-y-auto rounded-2xl flex items-center justify-center bg-[#fdf0f2]/40 p-2 border border-[#f0c5d2]/30">
          <Image
            src="/sizing-chart.jpeg"
            alt="CherryBrush Nail Sizing Chart"
            width={600}
            height={600}
            className="w-full h-auto object-contain rounded-xl shadow-xs"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
