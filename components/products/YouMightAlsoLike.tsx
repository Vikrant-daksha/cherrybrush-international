"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import VerticalProductCard from "./cards/VerticalProductCard";

export interface YouMightAlsoLikeProps {
  /** ID or list of product IDs to exclude from recommendations (e.g. currently viewed or in-cart items) */
  excludeIds?: string | string[];
  /** Optional slug to exclude */
  excludeSlug?: string;
  /** Optional collection name to filter or prioritize (e.g., "Almond", "Classic") */
  collection?: string;
  /** Maximum number of recommendation items to display (default: 4) */
  limit?: number;
  /** Visual variant: "product" for detailed presentation with header/subtitle/link, "cart" for compact checkout-style */
  variant?: "product" | "cart" | "default";
  /** Custom heading title (default: "You Might Also Like") */
  title?: string;
  /** Custom subtitle (e.g. "Handcrafted Suggestions") */
  subtitle?: string;
  /** Whether to show "View All Sets →" link (default: true for product variant) */
  showViewAll?: boolean;
  /** Optional additional CSS classes for the container */
  className?: string;
}

export default function YouMightAlsoLike({
  excludeIds,
  excludeSlug,
  collection,
  limit = 4,
  variant = "default",
  title = "You Might Also Like",
  subtitle = "Handcrafted Suggestions",
  showViewAll,
  className = "",
}: YouMightAlsoLikeProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecommendations() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const json = await res.json();

        if (json.success && Array.isArray(json.products) && isMounted) {
          // Normalize exclusions into a Set for O(1) lookup
          const excludeSet = new Set<string>();
          if (excludeIds) {
            if (Array.isArray(excludeIds)) {
              excludeIds.forEach((id) => id && excludeSet.add(String(id)));
            } else {
              excludeSet.add(String(excludeIds));
            }
          }
          if (excludeSlug) {
            excludeSet.add(String(excludeSlug));
          }

          // Filter out excluded items
          let filtered = json.products.filter((p: any) => {
            const pId = String(p._id || p.id || "");
            const pSlug = String(p.slug || "");
            return !excludeSet.has(pId) && !excludeSet.has(pSlug);
          });

          // If a preferred collection was supplied, prioritize items matching it
          if (collection) {
            const sameCollection = filtered.filter(
              (p: any) =>
                p.collection?.toLowerCase() === collection.toLowerCase()
            );
            const others = filtered.filter(
              (p: any) =>
                p.collection?.toLowerCase() !== collection.toLowerCase()
            );
            filtered = [...sameCollection, ...others];
          }

          setProducts(filtered.slice(0, limit));
        }
      } catch (err) {
        console.error("YouMightAlsoLike fetch error:", err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, [
    Array.isArray(excludeIds) ? excludeIds.join(",") : excludeIds,
    excludeSlug,
    collection,
    limit,
  ]);

  // If loading has finished and no live products were found, don't show an empty awkward section
  if (!loading && products.length === 0) {
    return null;
  }

  // ── Render Cart Variant ──
  if (variant === "cart") {
    return (
      <section
        className={`mt-14 pt-10 border-t border-zinc-200 ${className}`}
        aria-label="Recommended Products"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-zinc-900 tracking-tight">
            {title}
          </h3>
          {(showViewAll ?? false) && (
            <Link
              href="/collection"
              className="text-xs font-semibold text-zinc-500 hover:text-black transition-colors"
            >
              View All →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: limit }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-zinc-100 aspect-[3/4] animate-pulse border border-zinc-200/60"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p._id} className="w-full h-full">
                <VerticalProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // ── Render Product Page / Default Variant ──
  const isProductVariant = variant === "product" || variant === "default";
  const shouldShowLink = showViewAll ?? isProductVariant;

  return (
    <section
      className={`w-full px-4 sm:px-6 md:w-[85%] mx-auto pt-16 pb-12 border-t border-[#f0e0e5] mt-16 ${className}`}
      aria-label="Recommended Products"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
        <div>
          {subtitle && (
            <span className="text-xs font-bold uppercase tracking-widest text-[#c88389]">
              {subtitle}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-light text-[#3d2b1f] mt-1">
            {title}
          </h2>
        </div>
        {shouldShowLink && (
          <Link
            href="/collection"
            className="text-xs font-bold uppercase tracking-wider text-[#8a7060] hover:text-[#c88389] transition-colors"
          >
            View All Sets →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-gray-100 aspect-[3/4] animate-pulse border border-gray-200/50"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p._id} className="w-full h-full">
              <VerticalProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
