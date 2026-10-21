"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { FiTrash2, FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import { getCloudinaryThumbnail } from "@/lib/imageLoader";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    shippingMethods,
    selectedShippingMethod,
    setSelectedShippingMethod,
    shippingFee,
  } = useCart();
  const { formatPrice } = useCurrency();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountRate, setCouponDiscountRate] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Dynamic shipping calculation driven by MongoDB
  const discount = Math.round(totalPrice * couponDiscountRate);
  const isFreeShipping =
    appliedCoupon === "FREESHIP" || (selectedShippingMethod?.isFree ?? false);
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

  return (
    <div className="h-full pt-15 bg-[#fafaf7] py-12 px-4 sm:px-6 lg:px-8 text-[#3d2b1f]">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-8 mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8a7060] hover:text-[#c88389] transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between border-b border-[#f0e0e5] pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-[#3d2b1f]">
              Shopping Bag ({totalItems})
            </h1>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-[#8a7060] hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#f0e0e5] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#fdf0f2] border border-[#e8c0c8] flex items-center justify-center text-2xl text-[#c88389] mx-auto mb-4">
              <FiShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#3d2b1f] mb-2">
              Your bag is empty
            </h2>
            <p className="text-sm text-[#6b4f3a]/70 mb-6 max-w-sm mx-auto">
              You haven't added any handcrafted press-on sets to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-xl bg-[#c88389] hover:bg-[#b57278] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#f0e0e5] p-6 shadow-xs divide-y divide-[#f5e6e8]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="py-5 first:pt-0 last:pb-0 flex gap-4"
                >
                  <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-[#e8c0c8] bg-[#fdf0f2] shrink-0">
                    <Image
                      src={getCloudinaryThumbnail(item.image, 240, 240)}
                      unoptimized
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-[#3d2b1f] line-clamp-1">
                          {item.name}
                        </h3>
                        <span className="font-bold text-base text-[#3d2b1f] shrink-0">
                          {formatPrice(item.price * item.quantity)}
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

                      <div className="mt-1 font-bold text-sm text-[#3d2b1f]">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="inline-flex items-center border border-[#e8c0c8] rounded-xl bg-white px-1 py-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center text-xs font-semibold text-[#3d2b1f] hover:bg-[#fdf0f2] rounded-lg transition-colors cursor-pointer"
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
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#f0e0e5] p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#3d2b1f]">
                Order Summary
              </h2>

              {/* Coupon input */}
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
                      if (e.key === "Enter") handleApplyCoupon();
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
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Shipping Method Selector from Database */}
              {shippingMethods.length > 1 && items.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#8a7060]">
                    <span>Shipping Method:</span>
                    {selectedShippingMethod?.estimatedDelivery?.label && (
                      <span className="text-[10px] text-[#c88389]">
                        {selectedShippingMethod.estimatedDelivery.label}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {shippingMethods.map((method) => {
                      const isSelected =
                        selectedShippingMethod?.id === method.id;
                      const methodCost =
                        method.isFree || appliedCoupon === "FREESHIP"
                          ? 0
                          : method.price;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedShippingMethod(method)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#c88389] bg-[#fdf0f2] shadow-xs"
                              : "border-[#e8c0c8]/60 bg-white hover:border-[#c88389]/60"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-[#3d2b1f]">
                            <span className="truncate pr-1">{method.name}</span>
                            <span
                              className={`shrink-0 ${
                                methodCost === 0
                                  ? "text-[#c88389] font-bold"
                                  : "text-[#3d2b1f]"
                              }`}
                            >
                              {methodCost === 0
                                ? "FREE"
                                : formatPrice(methodCost)}
                            </span>
                          </div>
                          {method.carrier && (
                            <p className="text-[10px] text-[#8a7060]/75 truncate mt-0.5">
                              {method.carrier}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cost breakdown */}
              <div className="space-y-2 pt-2 text-xs text-[#6b4f3a]">
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
                  <span>
                    Shipping
                    {selectedShippingMethod
                      ? ` (${selectedShippingMethod.name})`
                      : ""}
                  </span>
                  <span className="font-semibold text-sm text-[#3d2b1f]">
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#f0e0e5] pt-2" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-[#3d2b1f]">
                  Total
                </span>
                <span className="font-bold text-xl text-[#3d2b1f]">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 rounded-xl bg-[#3d2b1f] hover:bg-[#281b13] active:scale-[0.99] text-white text-sm font-bold tracking-wide shadow-md transition-all flex items-center justify-center cursor-pointer"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
