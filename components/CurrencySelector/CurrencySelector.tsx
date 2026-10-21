"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyInfo } from "@/lib/currencies";

const PAGE_SIZE = 25;

export default function CurrencySelector() {
  const {
    selectedCurrency,
    setSelectedCurrency,
    availableCurrencies,
    isModalOpen,
    setIsModalOpen,
    toggleModal,
  } = useCurrency();

  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Focus search input when modal opens and reset pagination
  useEffect(() => {
    if (isModalOpen) {
      setVisibleCount(PAGE_SIZE);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setVisibleCount(PAGE_SIZE);
    }
  }, [isModalOpen]);

  // Reset pagination when searching
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [searchQuery]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, setIsModalOpen]);

  // Filter currencies dynamically based on search query
  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableCurrencies;

    return availableCurrencies.filter((curr) => {
      return (
        curr.code.toLowerCase().includes(q) ||
        curr.name.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, availableCurrencies]);

  // Slice paginated items so only visibleCount rows exist in DOM
  const paginatedCurrencies = useMemo(() => {
    return filteredCurrencies.slice(0, visibleCount);
  }, [filteredCurrencies, visibleCount]);

  const hasMore = visibleCount < filteredCurrencies.length;

  // Infinite scroll trigger via IntersectionObserver
  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + PAGE_SIZE, filteredCurrencies.length),
    );
  }, [filteredCurrencies.length]);

  useEffect(() => {
    if (!isModalOpen || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "150px", // Pre-fetch before user hits the very bottom
        threshold: 0.1,
      },
    );

    const target = sentinelRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [isModalOpen, hasMore, loadMore]);

  const handleSelect = (currency: CurrencyInfo) => {
    setSelectedCurrency(currency);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          FLOATING CIRCULAR TRIGGER BUTTON (BOTTOM RIGHT)
      ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
        <button
          type="button"
          onClick={toggleModal}
          aria-label={`Select currency: currently ${selectedCurrency.code}`}
          title={`Currency: ${selectedCurrency.code} (${selectedCurrency.name}) — Click to change`}
          className="group relative w-14 h-14 rounded-full bg-white/95 backdrop-blur-md border-2 border-[#edd8de] hover:border-[#c88389] shadow-[0_8px_30px_rgba(200,131,137,0.3)] hover:shadow-[0_12px_35px_rgba(200,131,137,0.45)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#c88389]/25"
        >
          {/* Circular Flag */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-black/10 shadow-sm flex items-center justify-center bg-gray-50 group-hover:scale-110 transition-transform duration-300">
            <img
              src={`https://flagcdn.com/w80/${selectedCurrency.countryCode.toLowerCase()}.png`}
              alt={selectedCurrency.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Mini Currency Code Badge */}
          <span className="absolute -bottom-0.5 px-1.5 py-0.5 rounded-full bg-[#3d2b1f] text-[9px] font-bold text-white tracking-wider uppercase scale-90 group-hover:bg-[#c88389] transition-colors shadow">
            {selectedCurrency.code}
          </span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          CURRENCY SELECTION MODAL (MATCHING REFERENCE UI)
      ══════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end  justify-center sm:justify-end sm:p-6 bg-black/35 backdrop-blur-[2px] transition-opacity duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Card Container */}
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[380px] max-h-[85vh] sm:max-h-[600px] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 sm:mr-4 sm:mb-16"
          >
            {/* Header: Back Arrow + Title */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-black transition-colors focus:outline-none cursor-pointer"
                aria-label="Back"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                Choose a currency
              </h3>
            </div>

            {/* Search Input Box */}
            <div className="px-4 py-3 bg-[#f8f9fa] border-b border-gray-100 shrink-0">
              <div className="relative flex items-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8e8e93"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3.5 pointer-events-none"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#c88389] focus:ring-2 focus:ring-[#c88389]/15 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Paginated & Lazy-Loaded Currencies List */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto divide-y divide-gray-50 py-1 max-h-[460px] overscroll-contain will-change-scroll"
            >
              {filteredCurrencies.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No currencies match &quot;{searchQuery}&quot;
                </div>
              ) : (
                <>
                  {paginatedCurrencies.map((currency) => {
                    const isSelected = selectedCurrency.code === currency.code;
                    return (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => handleSelect(currency)}
                        style={{
                          contentVisibility: "auto",
                          containIntrinsicSize: "0 60px",
                        }}
                        className={`w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors duration-150 group cursor-pointer ${
                          isSelected
                            ? "bg-[#faf7f8]"
                            : "hover:bg-gray-50/80 active:bg-gray-100/60"
                        }`}
                      >
                        {/* Left: Flag + Code & Name */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Circular Flag with skeleton/fallback */}
                          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-black/10 shadow-sm flex-shrink-0 bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                            <img
                              src={`https://flagcdn.com/w80/${currency.countryCode.toLowerCase()}.png`}
                              alt={currency.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>

                          {/* Labels */}
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900 leading-tight">
                              {currency.code}
                            </p>
                            <p className="text-xs text-gray-500 truncate leading-normal">
                              {currency.name}
                            </p>
                          </div>
                        </div>

                        {/* Right: Green Checkmark if Selected */}
                        {isSelected && (
                          <div className="flex-shrink-0 pl-2">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="animate-in fade-in zoom-in-75 duration-150"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Sentinel element to trigger next page load on scroll */}
                  {hasMore && (
                    <div
                      ref={sentinelRef}
                      className="py-3 flex items-center justify-center text-xs text-gray-400 gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c88389]/60 animate-ping" />
                      Loading more currencies...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
