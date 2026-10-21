"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { FiCheckCircle, FiPackage, FiArrowRight, FiAlertCircle } from "react-icons/fi";

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // PayPal Order ID
  const { clearCart } = useCart();
  const { formatPrice } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const hasCapturedRef = React.useRef(false);

  useEffect(() => {
    // Strict single-flight execution guard
    if (hasCapturedRef.current) return;
    hasCapturedRef.current = true;

    async function capturePayment() {
      if (!token) {
        const orderNumber = searchParams.get("orderNumber");
        if (orderNumber) {
          try {
            const res = await fetch(`/api/orders/${orderNumber}`);
            const data = await res.json();
            if (data.success && data.order) {
              setOrderData(data.order);
              clearCart();
              localStorage.removeItem("active_order_number");
            }
          } catch (e) {
            console.error("Fetch order error:", e);
          }
        }
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paypalOrderId: token }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to finalize PayPal capture.");
        }

        setOrderData(data.order);
        clearCart();
        localStorage.removeItem("active_order_number");
      } catch (err: any) {
        console.error("Capture error:", err);
        setError(err.message || "Failed to confirm payment.");
      } finally {
        setLoading(false);
      }
    }

    capturePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
        <div className="w-12 h-12 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Finalizing your order...</h2>
        <p className="text-xs text-gray-500">Please do not refresh or close this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-2xl border border-red-200 shadow-sm text-center">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Verification Issue</h2>
        <p className="text-xs text-gray-600 mb-6">{error}</p>
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
        >
          Return to Checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/90 shadow-sm text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5">
          <FiCheckCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Thank you for your order!
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ve received your order and are preparing your handcrafted press-on nails.
        </p>

        {orderData?.orderNumber && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-semibold text-gray-700 mb-8">
            <FiPackage className="w-4 h-4 text-gray-400" />
            <span>Order Reference: {orderData.orderNumber}</span>
          </div>
        )}

        {/* Order Details snapshot review */}
        {orderData && (
          <div className="text-left bg-gray-50/80 rounded-2xl p-5 border border-gray-100 mb-8 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-gray-200/60 pb-2 font-medium">
              <span className="text-gray-500">Recipient</span>
              <span className="text-gray-900 font-semibold">{orderData.customer?.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2 font-medium">
              <span className="text-gray-500">Shipping To</span>
              <span className="text-gray-900 text-right">
                {orderData.shippingAddress?.addressLine1}, {orderData.shippingAddress?.city},{" "}
                {orderData.shippingAddress?.country}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2 font-medium">
              <span className="text-gray-500">Payment Status</span>
              <span className="text-emerald-600 font-bold uppercase tracking-wide">
                {orderData.payment?.status} (PayPal)
              </span>
            </div>

            {/* Ordered Items with Variants */}
            {orderData.items && orderData.items.length > 0 && (
              <div className="border-b border-gray-200/60 pb-3 pt-1 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Items Ordered ({orderData.items.length})
                </p>
                <div className="space-y-2">
                  {orderData.items.map((item: any, iIdx: number) => (
                    <div key={iIdx} className="flex justify-between items-start text-xs gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.quantity}x {item.name}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {[
                            item.length && `Length: ${item.length}`,
                            (item.shade || item.color) && `Shade: ${item.shade || item.color}`,
                            item.shape && `Shape: ${item.shape}`,
                            item.size && `Size: ${item.size}`,
                          ]
                            .filter(Boolean)
                            .map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex px-1.5 py-0.2 rounded bg-gray-200/60 text-gray-700 text-[10px]"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      </div>
                      <span className="font-medium text-gray-800 shrink-0">
                        {formatPrice(item.subtotal || item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-1 text-sm font-bold">
              <span>Total Paid</span>
              <span className="text-gray-900">
                {formatPrice(orderData.pricing?.totalAmount || 0)}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
          >
            <span>Back to Home</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/collection"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-black">
            <span>← Store Home</span>
          </Link>
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-gray-100">
            <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" priority />
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="text-center py-24 text-sm text-gray-400">Loading receipt...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
