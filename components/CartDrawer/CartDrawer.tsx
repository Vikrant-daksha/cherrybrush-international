"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CiTrash, CiShoppingTag } from "react-icons/ci";

export default function CartDrawer() {
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

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col text-[#3d2b1f] animate-slide-left">
          {/* ── Drawer Header ── */}
          <div className="p-5 border-b border-[#f0e0e5] flex items-center justify-between bg-[#faf5f6]">
            <div className="flex items-center gap-2">
              <CiShoppingTag className="w-6 h-6 text-[#c88389]" />
              <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-[#3d2b1f]">
                Your Cart ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white border border-[#e8c0c8] text-[#3d2b1f] flex items-center justify-center font-bold text-sm hover:bg-[#c88389] hover:text-white hover:border-[#c88389] transition-all"
            >
              ✕
            </button>
          </div>

          {/* ── Cart Items List ── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#f5e6e8]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#fdf0f2] border border-[#e8c0c8] flex items-center justify-center text-2xl text-[#c88389]">
                  🛍️
                </div>
                <div>
                  <p className="font-serif text-lg font-normal text-[#3d2b1f]">
                    Your bag is empty
                  </p>
                  <p className="text-xs text-[#6b4f3a]/60 mt-1">
                    Discover our handcrafted press-on sets.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#c88389] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b57278] transition-all shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#e8c0c8] bg-[#fdf0f2] flex-shrink-0">
                    <Image
                      src={item.image || "/product.png"}
                      unoptimized
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-sm font-bold uppercase tracking-wide text-[#3d2b1f] line-clamp-1">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#a0604a]/60 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <CiTrash className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant badges */}
                      <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-[#6b4f3a]">
                        {item.shape && (
                          <span className="px-1.5 py-0.5 rounded bg-[#fdf0f2] border border-[#e8c0c8]">
                            {item.shape}
                          </span>
                        )}
                        {item.length && (
                          <span className="px-1.5 py-0.5 rounded bg-[#fdf0f2] border border-[#e8c0c8]">
                            {item.length}
                          </span>
                        )}
                        {item.size && (
                          <span className="px-1.5 py-0.5 rounded bg-[#fdf0f2] border border-[#e8c0c8]">
                            {item.size}
                          </span>
                        )}
                        {(item.shade || item.color) && (
                          <span className="px-1.5 py-0.5 rounded bg-[#fdf0f2] border border-[#e8c0c8] flex items-center gap-1">
                            {(item.shade || item.color)?.startsWith("#") && (
                              <span
                                className="w-2 h-2 rounded-full inline-block border border-black/10"
                                style={{
                                  backgroundColor: item.shade || item.color,
                                }}
                              />
                            )}
                            {(item.shade || item.color)?.startsWith("#")
                              ? item.shade || item.color
                              : ` ${item.shade || item.color}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-serif font-bold text-sm text-[#3d2b1f]">
                        ₹{item.price * item.quantity}
                      </span>

                      <div className="flex items-center border border-[#e8c0c8] rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[#3d2b1f] hover:bg-[#fdf0f2] transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[#3d2b1f] hover:bg-[#fdf0f2] transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Footer / Summary ── */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#f0e0e5] bg-[#faf5f6] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[#6b4f3a]">Subtotal</span>
                <span className="font-serif text-xl font-bold text-[#3d2b1f]">
                  ₹{totalPrice}
                </span>
              </div>

              <p className="text-[11px] text-[#6b4f3a]/70">
                Taxes and shipping calculated at checkout.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => alert("Checkout flow initiated!")}
                  className="w-full py-3.5 rounded-xl bg-[#c88389] hover:bg-[#b57278] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-[0.18em] shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Checkout • ₹{totalPrice}</span>
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full py-2 text-[11px] text-[#a0604a]/70 hover:text-red-600 font-semibold transition-colors text-center"
                >
                  Clear Bag
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
