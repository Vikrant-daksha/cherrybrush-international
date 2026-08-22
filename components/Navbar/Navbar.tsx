"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { FiSearch, FiX, FiArrowRight } from "react-icons/fi";

export interface NavbarProps {
  brandName?: string;
  className?: string;
}

interface ProductSuggestion {
  _id: string;
  name: string;
  slug?: string;
  collection: string;
  price: number;
  images: string[];
  style?: string;
}

export default function Navbar({
  brandName = "CHERRYBRUSH",
  className = "",
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search Overlay States
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allProducts, setAllProducts] = useState<ProductSuggestion[]>([]);

  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, toggleCart } = useCart();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAdminRoute = pathname?.startsWith("/admin");

  // Handle navbar background blur on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch product list for quick live suggestions
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      } catch (err) {
        console.error("Navbar search product fetch error:", err);
      }
    }
    loadProducts();
  }, []);

  // 400ms Debounce Effect for Navbar Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Focus input when search bar opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchInput("");
      setDebouncedQuery("");
    }
  }, [searchOpen]);

  // Filter 4 max live suggestions
  const suggestions = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return [];
    return allProducts
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.collection?.toLowerCase().includes(q) ||
          p.style?.toLowerCase().includes(q),
      )
      .slice(0, 4); // Max 4 items
  }, [allProducts, debouncedQuery]);

  const handleSearchSubmit = () => {
    if (searchInput.trim()) {
      const query = searchInput.trim();
      setSearchOpen(false);
      setSearchInput("");
      setDebouncedQuery("");
      router.push(`/collection?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  if (isAdminRoute) {
    return null;
  }

  const navLinks = [
    { label: "SHOP", href: "/" },
    { label: "COLLECTIONS", href: "/collection" },
    { label: "BEST SELLERS", href: "/#best-sellers" },
    { label: "ABOUT", href: "/#about" },
    { label: "HOW TO APPLY", href: "/#how-to-apply" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-black/20 backdrop-blur-md border-b border-white/10 py-4 shadow-lg"
          : "bg-[#d87c8e]/40 backdrop-blur-sm border-b border-white/10 py-5 md:py-6"
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between relative">
        {/* ── Brand Logo ── */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus:outline-none"
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm border border-white/20 transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
            <Image
              src="/logo.jpeg"
              alt="Cherrybrush Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span
            className="text-xl sm:text-2xl font-normal tracking-[0.2em] text-white uppercase transition-transform duration-300 group-hover:scale-105"
            style={{
              fontFamily:
                'var(--font-cormorant, "Cormorant Garamond", Georgia, serif)',
            }}
          >
            {brandName}
          </span>
        </Link>

        {/* ── Desktop Navigation Links ── */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-7 lg:gap-10"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[11px] lg:text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-200 hover:text-[#f8cad4] relative py-1  ${
                  isActive ? "text-[#f8cad4] font-bold" : "text-white/95"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#f8cad4] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right Icons (Search, Account, Bag) ── */}
        <div className="flex items-center gap-4 sm:gap-5 text-white relative">
          {/* ── Search Icon Button / Expandable Input ── */}
          <div className="relative">
            {!searchOpen ? (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open Search"
                className="p-1.5 hover:text-[#f8cad4] transition-transform duration-200 hover:scale-110 focus:outline-none"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center bg-white text-neutral-800 rounded-full px-3 py-1.5 shadow-xl border border-[#e8c0c8] animate-in fade-in zoom-in-95 duration-200">
                <FiSearch className="w-4 h-4 text-[#c88389] mr-2 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products..."
                  className="bg-transparent border-none text-xs text-[#3d2b1f] placeholder:text-neutral-400 focus:outline-none w-36 sm:w-56"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors ml-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── 400ms Debounced 4-Max Dropdown Suggestions ── */}
            {searchOpen &&
              (debouncedQuery.trim().length > 0 || suggestions.length > 0) && (
                <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden text-neutral-800 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-[#fdf0f2]/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c88389]">
                    Live Suggestions (Max 4)
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Press Enter to search all
                  </span>
                </div> */}

                  {suggestions.length > 0 ? (
                    <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                      {suggestions.map((p) => (
                        <Link
                          key={p._id}
                          href={`/collection/${p.slug || p._id}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchInput("");
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-[#fafaf7] transition-colors group"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#fdf0f2] flex-shrink-0 border border-[#f0c5d2]">
                            <Image
                              src={p.images?.[0] || "/product.png"}
                              alt={p.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold tracking-wider text-[#c88389] uppercase truncate">
                              {p.collection}
                            </p>
                            <h4 className="text-xs font-serif font-normal text-[#3d2b1f] uppercase truncate group-hover:text-[#c88389] transition-colors">
                              {p.name}
                            </h4>
                            <p className="text-xs font-bold text-[#3d2b1f] mt-0.5">
                              ₹{p.price}
                            </p>
                          </div>
                          <FiArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#c88389] group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-neutral-500">
                      No products found matching "{debouncedQuery}".
                    </div>
                  )}

                  {/* Footer link: Search all on All Products Page */}
                  {searchInput.trim() && (
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full p-3 bg-[#fdf0f2] hover:bg-[#f0e0e5] text-[#c88389] text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors border-t border-[#e8c0c8]/60"
                    >
                      <span>View all matching products</span>
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
          </div>

          {/* Account Icon */}
          <Link
            href="/admin/login"
            aria-label="Account"
            className="p-1.5 hover:text-[#f8cad4] transition-transform duration-200 hover:scale-110 focus:outline-none"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          {/* Shopping Bag Icon */}
          <button
            type="button"
            onClick={toggleCart}
            aria-label="Shopping Bag"
            className="p-1.5 hover:text-[#f8cad4] transition-transform duration-200 hover:scale-110 focus:outline-none relative"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#c88389] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="md:hidden p-1.5 hover:text-[#f8cad4] focus:outline-none"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4 transition-all">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold tracking-[0.2em] uppercase text-white hover:text-[#f8cad4] py-1.5 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
