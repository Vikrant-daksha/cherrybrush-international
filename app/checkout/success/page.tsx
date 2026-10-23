"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { getCloudinaryThumbnail } from "@/lib/imageLoader";
import {
  FiCheck,
  FiPackage,
  FiTruck,
  FiCreditCard,
  FiMapPin,
  FiMail,
  FiPhone,
  FiCopy,
  FiChevronLeft,
  FiAlertTriangle,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";

type AnimationPhase = "checking" | "morphing" | "revealed" | "failed-revealed";

/**
 * High-performance vector badge that morphs smoothly:
 * 1. Rotating open arc while verifying ->
 * 2. Snaps into closed full circle ring ->
 * 3. Animated Checkmark (✓) or Cross (✕) drawn via SVG stroke-dashoffset
 */
function MorphingBadge({
  status,
  isMorphed,
  className = "",
}: {
  status: "checking" | "success" | "failed";
  isMorphed: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center select-none ${className}`}
    >
      {/* Soft ambient glow when verified */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
          isMorphed && status === "success"
            ? "shadow-[0_0_35px_rgba(200,131,137,0.35)] scale-105"
            : isMorphed && status === "failed"
            ? "shadow-[0_0_35px_rgba(225,29,72,0.25)] scale-105"
            : ""
        }`}
      />

      <svg
        viewBox="0 0 80 80"
        className={`w-full h-full relative z-10 transition-transform duration-600 ease-out ${
          status === "checking" && !isMorphed ? "animate-spin" : ""
        }`}
        style={{
          animationDuration: "1.15s",
          animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Translucent background disc */}
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="rgba(255, 255, 255, 0.7)"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="3.5"
        />

        {/* Dynamic morphing circle track */}
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="#c88389"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="214"
          strokeDashoffset={status === "checking" && !isMorphed ? 145 : 0}
          className="transition-all duration-500 ease-out origin-center"
          transform="rotate(-90 40 40)"
        />

        {/* Animated Checkmark Path (✓) */}
        {(status === "success" || status === "checking") && (
          <path
            d="M 26 42 L 35 51 L 55 31"
            fill="none"
            stroke="#c88389"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="50"
            strokeDashoffset={status === "success" && isMorphed ? 0 : 50}
            className="transition-all duration-500 ease-out"
            style={{
              transitionDelay: isMorphed ? "150ms" : "0ms",
              opacity: status === "success" && isMorphed ? 1 : 0,
            }}
          />
        )}

        {/* Animated Cross Path (✕) - Stroke 1 */}
        {status === "failed" && (
          <>
            <path
              d="M 28 28 L 52 52"
              fill="none"
              stroke="#c88389"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="40"
              strokeDashoffset={isMorphed ? 0 : 40}
              className="transition-all duration-400 ease-out"
              style={{
                transitionDelay: isMorphed ? "120ms" : "0ms",
                opacity: isMorphed ? 1 : 0,
              }}
            />
            {/* Animated Cross Path (✕) - Stroke 2 */}
            <path
              d="M 52 28 L 28 52"
              fill="none"
              stroke="#c88389"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="40"
              strokeDashoffset={isMorphed ? 0 : 40}
              className="transition-all duration-400 ease-out"
              style={{
                transitionDelay: isMorphed ? "220ms" : "0ms",
                opacity: isMorphed ? 1 : 0,
              }}
            />
          </>
        )}
      </svg>
    </div>
  );
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // PayPal Order ID
  const orderNumberParam = searchParams.get("orderNumber");
  const isFailedParam =
    searchParams.get("failed") === "true" ||
    searchParams.get("status") === "failed";
  const customErrorParam = searchParams.get("error");

  const { clearCart } = useCart();
  const { formatPrice } = useCurrency();

  // Animation orchestration state (morphing + sliding)
  const [animationPhase, setAnimationPhase] =
    useState<AnimationPhase>("checking");
  const [isMorphed, setIsMorphed] = useState(false);
  const [statusResult, setStatusResult] = useState<"success" | "failed" | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const hasCapturedRef = useRef(false);

  useEffect(() => {
    // Security Guard: If no token, no orderNumber, and not an explicit failure, redirect away from success page
    if (!token && !orderNumberParam && !isFailedParam) {
      router.replace("/checkout");
      return;
    }

    let active = true;
    const startTime = Date.now();
    const minCheckingDuration = 1000; // Pacing guard for checking state

    async function processPayment() {
      let resolvedSuccess = false;
      let resolvedOrder: any = null;
      let resolvedError: string | null = null;

      // 1. Direct preview of failed state
      if (isFailedParam) {
        resolvedSuccess = false;
        resolvedError = customErrorParam || "Payment was not completed.";
      }
      // 2. Verified Order lookup via orderNumber
      else if (!token && orderNumberParam) {
        try {
          const res = await fetch(`/api/orders/${orderNumberParam}`);
          const data = await res.json();
          if (data.success && data.order) {
            resolvedSuccess = true;
            resolvedOrder = data.order;
            clearCart();
            localStorage.removeItem("active_order_number");
          } else {
            resolvedSuccess = false;
            resolvedError = data.error || "Order not found. Invalid token or reference.";
          }
        } catch (e: any) {
          resolvedSuccess = false;
          resolvedError = e.message || "Failed to load order information.";
        }
      }
      // 3. Live PayPal capture via token
      else if (token) {
        if (hasCapturedRef.current) return;
        hasCapturedRef.current = true;
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
          resolvedSuccess = true;
          resolvedOrder = data.order;
          clearCart();
          localStorage.removeItem("active_order_number");
        } catch (err: any) {
          resolvedSuccess = false;
          resolvedError = err.message || "Payment was not completed.";
        }
      }

      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, minCheckingDuration - elapsed);

      setTimeout(() => {
        if (!active) return;

        if (resolvedSuccess && resolvedOrder) {
          setOrderData(resolvedOrder);
          setStatusResult("success");
          setAnimationPhase("morphing");
          setIsMorphed(true);

          // After morph completes, transition directly to revealed with sliding content
          setTimeout(() => {
            if (!active) return;
            setAnimationPhase("revealed");
          }, 850);
        } else {
          setError(resolvedError || "Payment was not completed.");
          setStatusResult("failed");
          setAnimationPhase("morphing");
          setIsMorphed(true);

          setTimeout(() => {
            if (!active) return;
            setAnimationPhase("failed-revealed");
          }, 600);
        }
      }, delay);
    }

    processPayment();

    return () => {
      active = false;
    };
  }, [token, orderNumberParam, isFailedParam, customErrorParam, router, clearCart]);

  const handleCopyOrderNumber = () => {
    if (!orderData?.orderNumber) return;
    navigator.clipboard.writeText(orderData.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shipping = orderData?.shippingAddress;
  const pricing = orderData?.pricing;
  const payment = orderData?.payment;
  const orderDate = orderData?.createdAt
    ? new Date(orderData.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Just now";

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      {/* ── 1. Centered Payment Checking / Morphing State (Translucent Card) ── */}
      {(animationPhase === "checking" || animationPhase === "morphing") && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 transition-all duration-500">
          <div className="w-full max-w-sm sm:max-w-md p-8 sm:p-10 rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/60 shadow-[0_20px_50px_rgba(200,131,137,0.15)] text-center animate-in fade-in zoom-in-95 duration-400">
            {/* Center Morphing Badge */}
            <div className="flex items-center justify-center mx-auto mb-6">
              <MorphingBadge
                status={statusResult || "checking"}
                isMorphed={isMorphed}
              />
            </div>

            {/* Dynamic Status Text */}
            <div className="space-y-1.5 transition-all duration-300">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900">
                {statusResult === "success" && isMorphed
                  ? "Payment Confirmed!"
                  : statusResult === "failed" && isMorphed
                  ? "Payment Incomplete"
                  : "Checking Payment Status..."}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                {statusResult === "success" && isMorphed
                  ? "Finalizing your order confirmation..."
                  : "Please do not refresh or close this page."}
              </p>
            </div>

            {/* Ambient Loading Dots */}
            {animationPhase === "checking" && (
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c88389] animate-pulse" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#c88389] animate-pulse"
                  style={{ animationDelay: "200ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#c88389] animate-pulse"
                  style={{ animationDelay: "400ms" }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 2. Centered Failed State (Slides in place in center) ── */}
      {animationPhase === "failed-revealed" && (
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md mx-auto p-8 sm:p-10 rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/60 shadow-[0_25px_60px_rgba(200,131,137,0.2)] text-center animate-in fade-in zoom-in-95 duration-500">
            {/* Centered Morphing Cross Icon */}
            <div className="flex items-center justify-center mx-auto mb-6">
              <MorphingBadge status="failed" isMorphed={true} />
            </div>

            {/* Error Content Slides Up Smoothly in Center */}
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#c88389] font-medium tracking-tight mb-3">
                Oops!
                <br />
                Something Went Wrong.
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto leading-relaxed mb-6">
                We couldn’t complete your order at this time. Please try again or
                reach out if the issue persists.
              </p>

              {/* Error Details Inset Box */}
              <div className="w-full mb-8 p-4 sm:p-5 rounded-2xl bg-white/45 backdrop-blur-md border border-white/60 flex items-center gap-4 text-left shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-md border border-pink-200/60 flex items-center justify-center shrink-0 text-[#c88389] shadow-2xs">
                  <FiAlertTriangle className="w-5 h-5" />
                </div>
                <div className="h-8 w-[1px] bg-[#eec9cc] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Error Message
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 break-words">
                    {error || "Payment was not completed."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#c88389]/90 hover:bg-[#b57278] active:scale-[0.99] text-white text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg backdrop-blur-xs"
                >
                  <span>Try Again</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>

                <div>
                  <Link
                    href="/"
                    className="inline-block text-xs font-semibold text-gray-600 hover:text-black transition-colors py-1"
                  >
                    Return to Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Success View: Hero Confirmation + Sliding Order Details Grid ── */}
      {orderData && (
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 transition-opacity duration-500 ${
            animationPhase === "revealed"
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* ── Hero Confirmation Header: Slides Down Smoothly ── */}
          <div
            className={`text-center max-w-2xl mx-auto mb-10 pt-4 transition-all duration-700 ease-out ${
              animationPhase === "revealed"
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-6"
            }`}
          >
            {/* Morphed Checkmark Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-5">
              <MorphingBadge status="success" isMorphed={true} />
            </div>

            {/* Success Heading & Subtext */}
            <h1 className="font-serif text-3xl sm:text-4xl text-[#c88389] font-semibold tracking-tight mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-sm sm:text-base text-[#c88389] font-medium">
              Thank you for Ordering from US!
            </p>
          </div>

          {/* ── Order Details Grid: Slides up from below into place ── */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-3 gap-8 items-start transition-all duration-700 ease-out delay-150 ${
              animationPhase === "revealed"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-16"
            }`}
          >
            {/* ── Left Column (2 Cols): Shipping Info & Order Items ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: User & Shipping Information */}
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/60 shadow-[0_10px_35px_rgba(200,131,137,0.08)]">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-pink-100/50">
                  <FiMapPin className="w-5 h-5 text-[#3d2b1f]" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Shipping Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  {/* Recipient Details */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Customer Details
                    </p>
                    <div className="space-y-1 text-gray-800">
                      <p className="font-semibold text-gray-900 text-base">
                        {shipping?.fullName || orderData.customer?.name}
                      </p>
                      {(shipping?.email || orderData.customer?.email) && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FiMail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>
                            {shipping?.email || orderData.customer?.email}
                          </span>
                        </div>
                      )}
                      {(shipping?.phone || orderData.customer?.phone) && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FiPhone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>
                            {shipping?.phone || orderData.customer?.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Delivery Address
                    </p>
                    <div className="space-y-0.5 text-gray-700 text-xs sm:text-sm">
                      <p className="font-medium text-gray-900">
                        {shipping?.addressLine1}
                      </p>
                      {shipping?.addressLine2 && (
                        <p>{shipping?.addressLine2}</p>
                      )}
                      <p>
                        {[shipping?.city, shipping?.state, shipping?.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p className="font-semibold text-gray-900 pt-0.5">
                        {shipping?.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Purchased Items & Financial Summary */}
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/60 shadow-[0_10px_35px_rgba(200,131,137,0.08)]">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-pink-100/50">
                  <div className="flex items-center gap-2.5">
                    <FiPackage className="w-5 h-5 text-[#3d2b1f]" />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      Purchased Items
                    </h2>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-md border border-pink-200/60 text-[#c88389]">
                    {orderData.items?.length || 0}{" "}
                    {orderData.items?.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items Box */}
                <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 divide-y divide-pink-100/40 max-h-96 overflow-y-auto">
                  {orderData.items?.map((item: any, idx: number) => {
                    const thumbUrl = item.image
                      ? getCloudinaryThumbnail(item.image, 160, 160)
                      : "/sample.webp";
                    const variantDetails = [
                      item.size && `Size: ${item.size}`,
                      item.shape && `Shape: ${item.shape}`,
                      item.length && `Length: ${item.length}`,
                      (item.shade || item.color) &&
                        `Shade: ${item.shade || item.color}`,
                    ]
                      .filter(Boolean)
                      .join(" · ");

                    return (
                      <div
                        key={idx}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/60 backdrop-blur-md border border-white/70 overflow-hidden shrink-0 shadow-2xs">
                          <Image
                            src={thumbUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details & Variants */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          {variantDetails && (
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {variantDetails}
                            </p>
                          )}
                          <div className="inline-flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                            <span>Qty:</span>
                            <span className="font-semibold text-gray-900">
                              {item.quantity}
                            </span>
                            <span className="text-gray-400">×</span>
                            <span>{formatPrice(item.price)}</span>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right text-xs sm:text-sm font-semibold text-gray-900 shrink-0">
                          {formatPrice(
                            item.subtotal || item.price * item.quantity
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Summary */}
                <div className="mt-6 pt-5 border-t border-pink-100/50 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(pricing?.itemsSubtotal || 0)}
                    </span>
                  </div>

                  {Number(pricing?.discount) > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                      <span>
                        Discount{" "}
                        {pricing?.couponCode ? `(${pricing.couponCode})` : ""}
                      </span>
                      <span>-{formatPrice(pricing.discount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {Number(pricing?.shippingFee) === 0
                        ? "FREE"
                        : formatPrice(pricing?.shippingFee || 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Estimated Tax</span>
                    <span className="font-medium text-gray-900">
                      {Number(pricing?.tax) > 0
                        ? formatPrice(pricing.tax)
                        : "$0.00"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-pink-100/60 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-gray-900">
                        Total Paid
                      </span>
                      <p className="text-[11px] text-gray-400">
                        Including taxes & shipping
                      </p>
                    </div>
                    <span className="text-xl sm:text-2xl font-extrabold text-[#c88389]">
                      {formatPrice(pricing?.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column (1 Col): Order Meta & Courier Info ── */}
            <div className="lg:col-span-1 space-y-6">
              {/* Card 1: Order Details */}
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/60 shadow-[0_10px_35px_rgba(200,131,137,0.08)] space-y-5">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 pb-3 border-b border-pink-100/50">
                  Order Details
                </h2>

                {/* Order Number Highlight */}
                <div className="p-3.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Order Number
                    </p>
                    <p className="text-sm sm:text-base font-mono font-bold text-gray-900">
                      #{orderData.orderNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyOrderNumber}
                    className="p-2 rounded-lg bg-white/60 backdrop-blur-md border border-white/70 text-gray-600 hover:text-black hover:border-pink-300 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-xs"
                    title="Copy Order Number"
                    aria-label="Copy Order Number"
                  >
                    {copied ? (
                      <>
                        <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] text-emerald-600 font-medium">
                          Copied
                        </span>
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-3.5 h-3.5 text-[#c88389]" />
                        <span className="text-[11px] font-medium">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Metadata List */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-1.5 border-b border-pink-100/30">
                    <span className="text-gray-500">Order Date</span>
                    <span className="font-medium text-gray-900">
                      {orderDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-pink-100/30">
                    <span className="text-gray-500">Payment Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50/80 backdrop-blur-md text-emerald-700 font-bold text-xs uppercase tracking-wider border border-emerald-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {payment?.status === "completed" ||
                      orderData.orderStatus === "paid"
                        ? "Paid"
                        : payment?.status || "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-pink-100/30">
                    <span className="text-gray-500">Payment Provider</span>
                    <span className="font-semibold text-gray-900 capitalize flex items-center gap-1.5">
                      <FiCreditCard className="w-3.5 h-3.5 text-[#c88389]" />
                      {payment?.provider || "PayPal"}
                    </span>
                  </div>

                  {payment?.paypalCaptureId && (
                    <div className="flex items-center justify-between py-1.5 border-b border-pink-100/30">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-mono text-[11px] font-medium text-gray-700 truncate max-w-[150px]">
                        {payment.paypalCaptureId}
                      </span>
                    </div>
                  )}

                  {payment?.paypalPayerEmail && (
                    <div className="flex items-center justify-between py-1.5 border-b border-pink-100/30">
                      <span className="text-gray-500">Payer Account</span>
                      <span className="text-xs text-gray-700 truncate max-w-[150px]">
                        {payment.paypalPayerEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Courier Details */}
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/60 shadow-[0_10px_35px_rgba(200,131,137,0.08)] space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-pink-100/50">
                  <FiTruck className="w-5 h-5 text-[#3d2b1f]" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Shipping Method
                  </h2>
                </div>

                <div className="p-3.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Estimated Delivery
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-[#3d2b1f]">
                      3 – 5 Business Days
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/60 backdrop-blur-md border border-white/70 flex items-center justify-center text-[#c88389] shadow-2xs">
                    <FiTruck className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  <p className="font-semibold text-gray-800">
                    Standard Insured Delivery
                  </p>
                  <p className="text-gray-500 leading-relaxed text-[11px]">
                    Tracking details and courier updates will be sent directly
                    to your email as soon as your handcrafted set is dispatched.
                  </p>
                </div>
              </div>

              {/* Navigation & Support */}
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-[0_10px_35px_rgba(200,131,137,0.08)] space-y-3">
                <Link
                  href="/collection"
                  className="w-full py-3.5 px-4 rounded-xl bg-black/85 hover:bg-black text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 backdrop-blur-xs"
                >
                  <FiShoppingBag className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>

                <Link
                  href="/"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 text-gray-700 hover:bg-white/70 text-xs font-semibold transition-colors flex items-center justify-center"
                >
                  Return to Home
                </Link>

                <p className="text-center text-[11px] text-gray-400 pt-1">
                  Have questions? Reach us at{" "}
                  <a
                    href="mailto:support@cherrybrush.com"
                    className="underline hover:text-black font-medium"
                  >
                    support@cherrybrush.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="relative min-h-screen text-gray-900 overflow-x-hidden">
      {/* ── Fixed Pink Satin Fabric Background ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        <Image
          src="/checkout-bg.jpg"
          alt="Pink Silk Fabric Background"
          fill
          priority
          quality={95}
          className="object-cover object-center"
        />
        {/* Soft crystalline warm veil to let satin show through with optimal contrast */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]" />
      </div>

      {/* ── Translucent Top Header Bar ── */}
      <header className="sticky top-0 z-40 w-full bg-white/50 backdrop-blur-md border-b border-white/40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-black transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
            <span>Return to Store</span>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center"
            aria-label="Cherrybrush Home"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-xs border border-white/60 transition-transform hover:scale-105">
              <Image
                src="/logo.jpeg"
                alt="Cherrybrush Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main>
        <Suspense
          fallback={
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
              <div className="max-w-md w-full mx-auto p-8 bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-xl text-center">
                <div className="w-12 h-12 border-3 border-[#c88389] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Loading receipt...
                </h2>
              </div>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
