"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VerticalProductCard from "@/components/verticalProductCard/verticalProductCard";
import { FiSearch, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

interface ProductItem {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  collection: string;
  images: string[];
  lengths?: string[];
  sizes?: string[];
  colors?: { hex: string; label?: string }[];
  shapes?: string[];
  style?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  packageType?: string;
}

const ITEMS_PER_PAGE = 20; // 5 columns x 4 rows

function CollectionContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync URL search query if it changes
  useEffect(() => {
    if (initialQuery) {
      setSearchInput(initialQuery);
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // 400ms Debounce Effect on Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  // Fetch products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Error fetching products for collection page:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Unique collections for filter pills
  const collectionsList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.collection) set.add(p.collection);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter products by 400ms Debounced Search Query & Collection filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCollection =
        selectedCollection === "All" || p.collection === selectedCollection;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name?.toLowerCase().includes(query) ||
        p.collection?.toLowerCase().includes(query) ||
        p.style?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query);

      return matchesCollection && matchesSearch;
    });
  }, [products, searchQuery, selectedCollection]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCollection]);

  // Pagination calculation
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-6 md:px-12 lg:px-16 max-w-[1700px] mx-auto w-full">
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#e8c0c8]/40">
          <div>
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#c88389] font-bold mb-1">
              Handcrafted Press-On Nails
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-[#3d2b1f] tracking-wide">
              All Collections
            </h1>
            <p className="font-sans text-xs text-[#8a7060] mt-1">
              Showing {filteredProducts.length} unique designs
            </p>
          </div>

          {/* ── 400ms Debounced Search Bar Input ── */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c88389]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, style, or shade..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-[#e8c0c8] bg-white text-xs text-[#3d2b1f] placeholder:text-[#8a7060]/50 shadow-sm focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Collection Filter Pills ── */}
        {collectionsList.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {collectionsList.map((col) => {
              const isActive = selectedCollection === col;
              return (
                <button
                  key={col}
                  onClick={() => setSelectedCollection(col)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-[#c88389] text-white shadow-md"
                      : "bg-white text-[#6b4f3a] border border-[#e8c0c8]/60 hover:border-[#c88389]"
                  }`}
                >
                  {col}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Loading Skeleton ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-full aspect-[1/1.4] bg-neutral-200/60 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* ── Empty State ── */
          <div className="text-center py-24 bg-white rounded-3xl border border-[#e8c0c8]/40 p-8 shadow-xs my-8">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="font-serif text-2xl font-normal text-[#3d2b1f]">
              No Products Found
            </h3>
            <p className="font-sans text-xs text-[#8a7060] mt-1 max-w-sm mx-auto">
              We couldn't find any press-on nail set matching "
              {searchQuery || searchInput}". Try searching with a different term
              or clearing your search filter.
            </p>
            <button
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setSelectedCollection("All");
              }}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[#c88389] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#b57379] transition-all shadow-md"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <>
            {/* ── 5-Column x 4-Row Product Grid (20 items max per page) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentProducts.map((p) => (
                <div key={p._id} className="w-full block">
                  <VerticalProductCard
                    href={`/collection/${p.slug || p._id}`}
                    imageSrc={p.images?.[0] || "/product.png"}
                    imageAlt={p.name}
                    name={p.name}
                    collection={p.collection}
                    style={p.style}
                    description={p.description}
                    shapes={p.shapes}
                    lengths={p.lengths}
                    sizes={p.sizes}
                    price={`₹${p.price}`}
                    badge={p.badge}
                    rating={p.rating ?? 5}
                    reviewCount={p.reviewCount ?? 0}
                    packageType={p.packageType}
                    colors={p.colors || []}
                    extraColorsCount={
                      (p.colors?.length || 0) > 2
                        ? (p.colors?.length || 0) - 2
                        : 0
                    }
                  />
                </div>
              ))}
            </div>

            {/* ── Pagination Controls ── */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-[#e8c0c8]/40">
                <p className="font-sans text-xs text-[#8a7060]">
                  Showing{" "}
                  <span className="font-bold text-[#3d2b1f]">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-[#3d2b1f]">
                    {Math.min(
                      startIndex + ITEMS_PER_PAGE,
                      filteredProducts.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-[#3d2b1f]">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>

                <div className="flex items-center gap-2">
                  {/* Previous Page Button */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className="p-2.5 rounded-xl border border-[#e8c0c8] bg-white text-[#3d2b1f] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c88389] hover:text-white hover:border-[#c88389] transition-all shadow-xs"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Number Pills */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => {
                      const isCurrent = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            isCurrent
                              ? "bg-[#c88389] text-white border border-[#c88389]"
                              : "bg-white text-[#3d2b1f] border border-[#e8c0c8] hover:border-[#c88389]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}

                  {/* Next Page Button */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="p-2.5 rounded-xl border border-[#e8c0c8] bg-white text-[#3d2b1f] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c88389] hover:text-white hover:border-[#c88389] transition-all shadow-xs"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf7]" />}>
      <CollectionContent />
    </Suspense>
  );
}
