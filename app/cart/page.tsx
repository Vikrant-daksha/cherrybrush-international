"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { getCloudinaryThumbnail } from "@/lib/imageLoader";
import { YouMightAlsoLike } from "@/components/products";
import { slugify } from "@/lib/slug";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToCart,
    totalPrice,
    totalItems,
    shippingMethods,
    selectedShippingMethod,
    setSelectedShippingMethod,
    shippingFee,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
    setCouponError,
    isApplyingCoupon,
  } = useCart();
  const { formatPrice } = useCurrency();

  const [couponCode, setCouponCode] = useState("");

  // Dynamic shipping and discount calculations
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const isFreeShipping =
    appliedCoupon?.isFreeShipping || (selectedShippingMethod?.isFree ?? false);
  const currentShippingCost =
    items.length === 0
      ? 0
      : isFreeShipping
        ? 0
        : selectedShippingMethod
          ? selectedShippingMethod.price
          : shippingFee;
  const shipping = currentShippingCost;
  const finalTotal = Math.max(0, totalPrice - discount + shipping);

  const cartEmpty = items.length === 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode);
    if (res.success) {
      setCouponCode("");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
  };

  return (
    <main className="flex-1 min-h-screen bg-zinc-50/50 pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-zinc-900">
            Shopping Cart{" "}
            <span className="text-zinc-400 font-normal text-base">
              ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
          </h1>
          {!cartEmpty && (
            <button
              onClick={clearCart}
              className="text-sm text-zinc-500 hover:text-red-500 transition-colors font-medium cursor-pointer"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartEmpty ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center my-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mb-1">
              Your cart is empty
            </h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
              Looks like you haven&apos;t added any handcrafted press-on sets to
              your cart yet.
            </p>
            <Link
              href="/collection"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-all active:scale-95"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Grid: 2 Columns on Left (Items), 1 Column on Right (Summary) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const itemSlug = item.name
                  ? slugify(item.name)
                  : item.productId;
                const itemHref = itemSlug
                  ? `/collection/${itemSlug}`
                  : "/collection";

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white rounded-2xl border border-zinc-200 hover:shadow-md transition-all duration-200"
                  >
                    <Link className="shrink-0" href={itemHref}>
                      <div className="relative w-24 h-24 sm:w-30 sm:h-30 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200">
                        <Image
                          src={getCloudinaryThumbnail(item.image, 240, 240)}
                          unoptimized
                          alt={item.name}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            className="text-sm font-semibold text-zinc-900 hover:text-[#c88389] transition-colors line-clamp-2"
                            href={itemHref}
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {item.collection && (
                              <span className="text-xs text-zinc-500">
                                {item.collection}
                              </span>
                            )}
                          </div>
                          {/* Mobile: Clean 2-line variant text without pills (< md) */}
                          <div className="md:hidden mt-2 space-y-0.5 text-xs text-[#6b4f3a]/85 leading-tight">
                            {(item.size || item.length) && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.size && (
                                  <span>
                                    Size:{" "}
                                    <span className="font-semibold text-zinc-900">
                                      {item.size}
                                    </span>
                                  </span>
                                )}
                                {item.size && item.length && (
                                  <span className="text-zinc-300">·</span>
                                )}
                                {item.length && (
                                  <span>
                                    Length:{" "}
                                    <span className="font-semibold text-zinc-900">
                                      {item.length}
                                    </span>
                                  </span>
                                )}
                              </div>
                            )}
                            {(item.shape || item.color || item.shade) && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.shape && (
                                  <span>
                                    Shape:{" "}
                                    <span className="font-semibold text-zinc-900">
                                      {item.shape}
                                    </span>
                                  </span>
                                )}
                                {item.shape && (item.color || item.shade) && (
                                  <span className="text-zinc-300">·</span>
                                )}
                                {(item.color || item.shade) && (
                                  <span className="inline-flex items-center gap-1">
                                    Shade:
                                    {(item.color || item.shade)?.startsWith(
                                      "#",
                                    ) && (
                                      <span
                                        className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 shrink-0"
                                        style={{
                                          backgroundColor:
                                            item.color || item.shade,
                                        }}
                                      />
                                    )}
                                    <span className="font-semibold text-zinc-900">
                                      {item.color || item.shade}
                                    </span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Desktop: Original Pills (md+) */}
                          <div className="hidden md:flex items-center gap-2 mt-3 flex-wrap tracking-wider">
                            {item.size && (
                              <span className="text-[10px] px-2 py-0.5 bg-[#c87a8a] text-white rounded-sm font-semibold">
                                Size: {item.size}
                              </span>
                            )}
                            {item.length && (
                              <span className="text-[10px] px-2 py-0.5 bg-[#c87a8a] text-white rounded-sm font-semibold">
                                Length: {item.length}
                              </span>
                            )}
                            {item.shape && (
                              <span className="text-[10px] px-2 py-0.5 bg-[#c87a8a] text-white rounded-sm font-semibold">
                                Shape: {item.shape}
                              </span>
                            )}
                            {(item.color || item.shade) && (
                              <span className="text-[10px] px-2 py-0.5 bg-[#c87a8a] text-white rounded-sm font-semibold inline-flex items-center gap-1">
                                {(item.color || item.shade)?.startsWith(
                                  "#",
                                ) && (
                                  <span
                                    className="w-2 h-2 rounded-full inline-block border border-black/10 shrink-0"
                                    style={{
                                      backgroundColor: item.color || item.shade,
                                    }}
                                  />
                                )}
                                Color: {item.color || item.shade}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                          aria-label="Remove"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M9 6V4h6v2"></path>
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Stepper */}
                        <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden h-9 bg-white">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-9 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          <span className="w-9 text-center text-sm font-medium text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-9 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-zinc-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-2">
                <Link
                  className="text-sm text-zinc-900 hover:text-[#c88389] font-medium flex items-center gap-1.5 transition-colors"
                  href="/collection"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary & Assurances */}
            <div className="space-y-4">
              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
                <h2 className="text-base font-semibold text-zinc-900 mb-4">
                  Order Summary
                </h2>

                <div className="flex gap-2 mb-4">
                  <input
                    placeholder="Coupon code"
                    className="flex-1 py-2 px-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all uppercase"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponError) setCouponError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyCoupon();
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium px-4 py-2 text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>

                {couponError && (
                  <p className="text-xs text-red-500 mb-3 -mt-2 pl-1">
                    {couponError}
                  </p>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-800 mb-3 -mt-2">
                    <span className="font-medium">
                      ✓ Coupon <strong>{appliedCoupon.code}</strong> applied!
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-zinc-400 hover:text-red-500 font-bold ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Shipping Method Selector if multiple options */}
                {shippingMethods.length > 1 && (
                  <div className="space-y-2 mb-4 pt-2 border-t border-zinc-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                      <span>Shipping Method:</span>
                      {selectedShippingMethod?.estimatedDelivery?.label && (
                        <span className="text-[11px] text-zinc-500">
                          {selectedShippingMethod.estimatedDelivery.label}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {shippingMethods.map((method) => {
                        const isSelected =
                          selectedShippingMethod?.id === method.id;
                        const methodCost =
                          method.isFree || appliedCoupon?.isFreeShipping
                            ? 0
                            : method.price;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedShippingMethod(method)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-zinc-900 bg-zinc-50 shadow-xs"
                                : "border-zinc-200 bg-white hover:border-zinc-300"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-medium text-zinc-900">
                              <span className="truncate pr-1">
                                {method.name}
                              </span>
                              <span
                                className={`shrink-0 ${
                                  methodCost === 0
                                    ? "text-green-600 font-bold"
                                    : "text-zinc-900"
                                }`}
                              >
                                {methodCost === 0
                                  ? "FREE"
                                  : formatPrice(methodCost)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 text-sm border-t border-zinc-200 pt-4">
                  <div className="flex justify-between text-zinc-500">
                    <span>
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium text-zinc-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span className="font-medium">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-500">
                    <span>Shipping</span>
                    <span className="font-medium text-zinc-900">
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-base text-zinc-900 pt-2 border-t border-zinc-200">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full mt-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  Proceed to Checkout
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* You Might Also Like Section */}
        <YouMightAlsoLike
          variant="cart"
          excludeIds={items.map((i) => i.productId || i.id)}
          limit={4}
        />
      </div>
    </main>
  );
}
