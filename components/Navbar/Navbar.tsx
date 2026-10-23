"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { getCloudinaryThumbnail } from "@/lib/imageLoader";
import {
  FiSearch,
  FiX,
  FiArrowRight,
  FiUser,
  FiPackage,
  FiLogOut,
  FiShield,
} from "react-icons/fi";

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

export default function Navbar({ className = "" }: NavbarProps) {
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
  const { formatPrice } = useCurrency();
  const { user, mongoUser, logout, openAuthModal } = useAuth();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.photoURL]);

  const isAdminRoute = pathname?.startsWith("/admin");

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const isCheckoutRoute = pathname?.startsWith("/checkout");

  if (isAdminRoute || isCheckoutRoute) {
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
          ? "bg-white/40 backdrop-blur-md border-b border-black/10 py-3 "
          : "bg-[#fdf0f2]/10 border-b border-[#c25d65]/10 py-4 md:py-4"
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between relative min-h-[44px]">
        {searchOpen ? (
          /* ── Full-Width Search Header (Prevents ANY element overflow on mobile & iPad) ── */
          <div className="w-full flex items-center gap-2 sm:gap-4 animate-in fade-in zoom-in-95 duration-150 py-0.5">
            <div className="flex-1 p-1 flex items-center bg-white text-neutral-800 rounded-full px-3.5 py-1.5 sm:py-2 shadow-md border border-[#e8c0c8]">
              <FiSearch className="w-4 h-4 text-[#c88389] mr-2 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search press-on nails, styles, collections..."
                className="bg-transparent border-none text-xs sm:text-sm text-[#3d2b1f] placeholder:text-neutral-400 focus:outline-none w-full"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedQuery("");
                  }}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#c25d65] hover:text-[#3d2b1f] px-2 py-1.5 transition-colors cursor-pointer shrink-0"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {/* ── Brand Logo ── */}
            <Link
              href="/"
              className="group flex items-center gap-2.5 focus:outline-none shrink-0"
            >
              <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-sm transition-transform duration-300 flex-shrink-0">
                <Image
                  src="/logo.jpeg"
                  alt="Cherrybrush Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>

            {/* ── Desktop Navigation Links (Visible on lg 1024px+; hidden on 768px iPad Mini to prevent text wrapping) ── */}
            <nav
              aria-label="Main Navigation"
              className="hidden lg:flex items-center gap-6 lg:gap-8 xl:gap-10 whitespace-nowrap"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-[11px] lg:text-xs font-semibold tracking-[0.16em] uppercase transition-all duration-200 hover:text-[#c25d65] relative py-1 ${
                      isActive ? "text-[#c25d65]" : "text-[#c25d65]/60"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#c25d65] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right Icons (Search, Account, Bag, Menu) ── */}
            <div className="flex items-center gap-3 sm:gap-5 text-[#c25d65]/60 relative shrink-0">
              {/* Search Trigger Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open Search"
                className="p-1.5 hover:text-[#c25d65] transition-transform duration-200 hover:scale-110 focus:outline-none cursor-pointer"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Account Icon / Dropdown */}
              <div className="relative" ref={accountDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      setAccountDropdownOpen(!accountDropdownOpen);
                    } else {
                      openAuthModal("signin");
                    }
                  }}
                  aria-label={user ? "Account Menu" : "Sign In / Register"}
                  className="p-1.5 hover:text-[#c25d65] transition-transform duration-200 hover:scale-110 focus:outline-none flex items-center justify-center cursor-pointer"
                >
                  {user ? (
                    <div className="w-6 h-6 rounded-full bg-[#fdf0f2] border border-[#c88389] text-[#c88389] text-xs font-bold flex items-center justify-center overflow-hidden">
                      {user.photoURL && !avatarError ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {(user.displayName ||
                            user.email ||
                            "U")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  ) : (
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
                  )}
                </button>

                {/* Authenticated User Dropdown Menu */}
                {user && accountDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-[#f0e0e5] p-2 text-neutral-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#f5e6e8]">
                      <p className="text-xs font-bold text-[#3d2b1f] truncate">
                        {user.displayName || "Customer"}
                      </p>
                      <p className="text-[11px] text-[#8a7060] truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#3d2b1f] hover:bg-[#faf5f6] hover:text-[#c88389] rounded-xl transition-colors"
                      >
                        <FiUser className="w-3.5 h-3.5 text-[#c88389]" />
                        <span>Profile Settings</span>
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#3d2b1f] hover:bg-[#faf5f6] hover:text-[#c88389] rounded-xl transition-colors"
                      >
                        <FiPackage className="w-3.5 h-3.5 text-[#c88389]" />
                        <span>View Orders</span>
                      </Link>

                      {mongoUser?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#c88389] hover:bg-[#fdf0f2] rounded-xl transition-colors"
                        >
                          <FiShield className="w-3.5 h-3.5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#f5e6e8]">
                      <button
                        type="button"
                        onClick={async () => {
                          setAccountDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <FiLogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Bag Icon */}
              <button
                type="button"
                onClick={toggleCart}
                aria-label="Shopping Bag"
                className="p-1.5 hover:text-[#c25d65] transition-transform duration-200 hover:scale-110 focus:outline-none relative"
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
                  <span className="absolute px-1.5 py-px -top-1.5 -right-1 bg-[#c25d65] text-white text-center text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                className="lg:hidden p-1.5 hover:text-[#c25d65] focus:outline-none cursor-pointer"
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
          </>
        )}
      </div>

      {/* ── Search Suggestions Container (Full-width, below header, ZERO overflow!) ── */}
      {searchOpen &&
        (debouncedQuery.trim().length > 0 || suggestions.length > 0) && (
          <div className="w-full bg-white/95 backdrop-blur-2xl border-b border-[#e8c0c8] shadow-2xl text-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
              {suggestions.length > 0 ? (
                <div className="divide-y divide-neutral-100 max-h-[60vh] overflow-y-auto">
                  {suggestions.map((p) => (
                    <Link
                      key={p._id}
                      href={`/collection/${p.slug || p._id}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchInput("");
                      }}
                      className="flex items-center gap-3.5 p-3 hover:bg-[#fafaf7] rounded-xl transition-colors group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#fdf0f2] flex-shrink-0 border border-[#f0c5d2]">
                        <Image
                          src={getCloudinaryThumbnail(p.images?.[0], 100, 100)}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold tracking-wider text-[#c88389] uppercase truncate">
                          {p.collection}
                        </p>
                        <h4 className="text-xs sm:text-sm font-medium text-[#3d2b1f] uppercase truncate group-hover:text-[#c88389] transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs font-bold text-[#3d2b1f] mt-0.5">
                          {formatPrice(p.price)}
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
                  className="mt-2 w-full p-3 rounded-xl bg-[#fdf0f2] hover:bg-[#f0e0e5] text-[#c88389] text-[11px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors border border-[#e8c0c8]/60 cursor-pointer"
                >
                  <span>View all matching products</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      {/* Mobile Menu Drawer (Visible up to lg 1024px, including 768px iPad Mini) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-[#e8c0c8] shadow-2xl px-6 py-5 mt-3 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between text-xs font-semibold tracking-[0.2em] uppercase py-3 transition-colors border-b border-[#f0e0e5]/60 ${
                    isActive
                      ? "text-[#c25d65]"
                      : "text-[#3d2b1f] hover:text-[#c25d65]"
                  }`}
                >
                  <span>{link.label}</span>
                  <FiArrowRight
                    className={`w-3.5 h-3.5 ${isActive ? "text-[#c25d65]" : "text-neutral-300"}`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Mobile Auth Button */}
          <div className="pt-2">
            {user ? (
              <div className="bg-[#fdf0f2] border border-[#e8c0c8] rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#c88389] text-[#c88389] text-xs font-bold flex items-center justify-center overflow-hidden">
                    {user.photoURL && !avatarError ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {(user.displayName ||
                          user.email ||
                          "U")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#3d2b1f] truncate">
                      {user.displayName || "Customer"}
                    </p>
                    <p className="text-[11px] text-[#8a7060] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center rounded-xl bg-white border border-[#e8c0c8] text-[#3d2b1f] text-xs font-semibold hover:bg-[#faf5f6] transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center rounded-xl bg-[#c88389] text-white text-xs font-semibold hover:bg-[#b57278] transition-colors shadow-xs"
                  >
                    My Orders
                  </Link>
                </div>

                {mongoUser?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center rounded-xl bg-white border border-[#c88389] text-[#c88389] text-xs font-bold transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer text-center"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("signin");
                }}
                className="w-full py-3 rounded-xl bg-[#c88389] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b57278] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <FiUser className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
