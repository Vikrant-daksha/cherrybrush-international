"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { FiTrash2 } from "react-icons/fi";
import { CiShoppingTag } from "react-icons/ci";
import { getCloudinaryThumbnail } from "@/lib/imageLoader";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const { formatPrice } = useCurrency();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountRate, setCouponDiscountRate] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  // Shipping & discount calculations
  const discount = Math.round(totalPrice * couponDiscountRate);
  const baseShipping = 99; // Standard flat shipping
  const isFreeShipping = appliedCoupon === "FREESHIP" || totalPrice >= 999;
  const shipping = items.length === 0 ? 0 : isFreeShipping ? 0 : baseShipping;
  const finalTotal = Math.max(0, totalPrice - discount + shipping);

  const handleApplyCoupon = () => {
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) return;

    if (
      trimmed === "CHERRY10" ||
      trimmed === "WELCOME10" ||
      trimmed === "SAVE10"
    ) {
      setAppliedCoupon(trimmed);
      setCouponDiscountRate(0.1);
      setCouponError(null);
      setCouponCode("");
    } else if (trimmed === "CHERRY20" || trimmed === "SAVE20") {
      setAppliedCoupon(trimmed);
      setCouponDiscountRate(0.2);
      setCouponError(null);
      setCouponCode("");
    } else if (trimmed === "FREESHIP") {
      setAppliedCoupon(trimmed);
      setCouponDiscountRate(0);
      setCouponError(null);
      setCouponCode("");
    } else {
      // Default demo coupon gives 10%
      setAppliedCoupon(trimmed);
      setCouponDiscountRate(0.1);
      setCouponError(null);
      setCouponCode("");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountRate(0);
    setCouponError(null);
  };

  const handleViewFullCart = () => {
    setIsCartOpen(false);
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col text-[#3d2b1f] animate-slide-left">
          {/* ── Drawer Header ── */}
          <div className="p-5 border-b border-[#f0e0e5] flex items-center justify-between bg-[#faf5f6]">
            <div className="flex items-center gap-2">
              <CiShoppingTag className="w-6 h-6 text-[#c88389]" />
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#3d2b1f]">
                Your Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white border border-[#e8c0c8] text-[#3d2b1f] flex items-center justify-center font-bold text-sm hover:bg-[#c88389] hover:text-white hover:border-[#c88389] transition-all cursor-pointer"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>

          {/* ── Cart Items List ── */}
          <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-[#f5e6e8]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#fdf0f2] border border-[#e8c0c8] flex items-center justify-center text-2xl text-[#c88389]">
                  🛍️
                </div>
                <div>
                  <p className="text-lg font-normal text-[#3d2b1f]">
                    Your bag is empty
                  </p>
                  <p className="text-xs text-[#6b4f3a]/60 mt-1">
                    Discover our handcrafted press-on sets.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#c88389] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b57278] transition-all shadow-sm cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-2 last:pb-2 flex gap-3.5"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-30 sm:h-30 rounded-2xl overflow-hidden border border-[#e8c0c8] bg-[#fdf0f2] shrink-0">
                    <Image
                      src={getCloudinaryThumbnail(item.image, 240, 240)}
                      unoptimized
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 80px, 120px"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div>
                      {/* Top Row: Title & Total Line Price */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#3d2b1f] line-clamp-1">
                          {item.name}
                        </h3>
                        <span className="font-bold text-sm sm:text-base text-[#3d2b1f] shrink-0">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>

                      {/* Attributes: Line 1 = Size & Length | Line 2 = Shape & Color */}
                      <div className="mt-1 space-y-0.5 text-xs text-[#6b4f3a]/80">
                        {/* 1st Line: Size and Length */}
                        {(item.size || item.length) && (
                          <div className="flex items-center gap-1.5 leading-tight">
                            {item.size && (
                              <span>
                                Size:{" "}
                                <span className="font-semibold text-[#3d2b1f]">
                                  {item.size}
                                </span>
                              </span>
                            )}
                            {item.size && item.length && (
                              <span className="text-[#dcc9a8]">·</span>
                            )}
                            {item.length && (
                              <span>
                                Length:{" "}
                                <span className="font-semibold text-[#3d2b1f]">
                                  {item.length}
                                </span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* 2nd Line: Shape and Color */}
                        {(item.shape || item.shade || item.color) && (
                          <div className="flex items-center gap-1.5 leading-tight">
                            {item.shape && (
                              <span>
                                Shape:{" "}
                                <span className="font-semibold text-[#3d2b1f]">
                                  {item.shape}
                                </span>
                              </span>
                            )}
                            {item.shape && (item.shade || item.color) && (
                              <span className="text-[#dcc9a8]">·</span>
                            )}
                            {(item.shade || item.color) && (
                              <span className="inline-flex items-center gap-1">
                                Color:
                                {(item.shade || item.color)?.startsWith("#") ? (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 shrink-0"
                                    style={{
                                      backgroundColor: item.shade || item.color,
                                    }}
                                  />
                                ) : null}
                                <span className="font-semibold text-[#3d2b1f]">
                                  {(item.shade || item.color)?.startsWith("#")
                                    ? item.shade || item.color
                                    : item.shade || item.color}
                                </span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div className="mt-1 font-bold text-sm text-[#3d2b1f]">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Quantity Controls & Red Trash Icon */}
                    <div className="flex items-center gap-2.5 mt-1">
                      {/* Quantity Selector Pill */}
                      <div className="inline-flex items-center border border-[#e8c0c8] rounded-xl bg-white px-1 py-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-xs font-semibold text-[#3d2b1f] hover:bg-[#fdf0f2] rounded-lg transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-[#3d2b1f]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-xs font-semibold text-[#3d2b1f] hover:bg-[#fdf0f2] rounded-lg transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Red Trash Bin Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Side Cart Bottom / Summary ── */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#f0e0e5] bg-[#faf5f6] space-y-3.5">
              {/* Coupon Code Input & Apply Button */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponError) setCouponError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="Coupon code"
                    className="flex-1 bg-white border border-[#e8c0c8] rounded-xl px-3.5 py-2.5 text-xs text-[#3d2b1f] placeholder-[#a88a6a]/60 focus:outline-none focus:border-[#c88389] transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-5 py-2.5 rounded-xl border border-[#e8c0c8] bg-white text-xs font-semibold text-[#3d2b1f] hover:bg-[#c88389] hover:text-white hover:border-[#c88389] active:scale-95 transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-red-500 pl-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-[#fdf0f2] border border-[#e8c0c8] rounded-lg px-2.5 py-1 text-[11px] text-[#3d2b1f]">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#c88389] font-bold">✓</span>
                      Coupon{" "}
                      <strong className="font-semibold text-[#c88389]">
                        {appliedCoupon}
                      </strong>{" "}
                      applied!
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-[#8a7060] hover:text-red-500 font-bold ml-2 cursor-pointer"
                      title="Remove coupon"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-1 text-xs text-[#6b4f3a]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-sm text-[#3d2b1f]">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between text-[#c88389]">
                    <span>Discount ({appliedCoupon})</span>
                    <span className="font-semibold text-sm">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-sm text-[#3d2b1f]">
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              {/* Divider Line */}
              <div className="border-t border-[#f0e0e5] pt-1" />

              {/* Total Row */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-[#3d2b1f]">
                  Total
                </span>
                <span className="font-bold text-xl text-[#3d2b1f]">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {/* Primary Button: Checkout · Total */}
                <button
                  type="button"
                  onClick={() =>
                    alert(`Proceeding to checkout with total ${formatPrice(finalTotal)}`)
                  }
                  className="w-full py-3.5 rounded-xl bg-[#3d2b1f] hover:bg-[#281b13] active:scale-[0.99] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all flex items-center justify-center cursor-pointer"
                >
                  <span>Checkout · {formatPrice(finalTotal)}</span>
                </button>

                {/* Secondary Button: View Full Cart */}
                <button
                  type="button"
                  onClick={handleViewFullCart}
                  className="w-full py-3 rounded-xl border border-[#e8c0c8] bg-white hover:bg-[#faf5f6] hover:border-[#c88389] active:scale-[0.99] text-[#3d2b1f] text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center justify-center cursor-pointer"
                >
                  <span>View Full Cart</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
