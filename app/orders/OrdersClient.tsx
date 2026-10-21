"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  FiPackage,
  FiSearch,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
  FiChevronRight,
  FiMapPin,
  FiRefreshCw,
  FiAlertCircle,
  FiExternalLink,
  FiX,
  FiUser,
} from "react-icons/fi";

export default function OrdersClient() {
  const { user, mongoUser, loading: authLoading, openAuthModal } = useAuth();
  const { formatPrice } = useCurrency();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchUserOrders = async () => {
    if (!user && !mongoUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const email = user?.email || mongoUser?.email || "";
      const userId = mongoUser?.id || user?.uid || "";

      let url = `/api/user/orders?status=${activeTab}`;
      if (searchQuery.trim()) {
        url += `&query=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url, {
        headers: {
          "x-user-email": email,
          "x-user-id": userId,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load orders");
      }

      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Order fetch error:", err);
      setError(err.message || "An error occurred while fetching your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUserOrders();
    }
  }, [user, mongoUser, authLoading, activeTab]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.items?.some((i: any) => i.name?.toLowerCase().includes(q))
    );
  }, [orders, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fdfaf8] text-[#3d2b1f] font-sans antialiased pb-24">
      {/* ── Sticky Top Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#ebdcd5] shadow-2xs">
        <Navbar brandName="Cherrybrush" className="h-20" />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center gap-2 text-xs text-[#a0604a]/80 mb-3">
          <Link href="/" className="hover:text-[#c88389] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-[#c88389] transition-colors">
            Account
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#3d2b1f]">My Orders</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#3d2b1f]">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-[#7a6054] mt-1">
              Track fulfillment status, review past purchases, and inspect item variant specifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#ebdcd5] text-xs font-semibold text-[#3d2b1f] hover:bg-[#faf5f6] hover:text-[#c88389] transition-all shadow-2xs"
            >
              <FiUser className="w-3.5 h-3.5" />
              <span>Profile Settings</span>
            </Link>
            <Link
              href="/collection"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c88389] text-white text-xs font-semibold hover:bg-[#b57278] transition-all shadow-2xs"
            >
              <FiShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Collection</span>
            </Link>
          </div>
        </div>

        {/* ── NOT SIGNED IN STATE ── */}
        {!authLoading && !user && !mongoUser && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#ebdcd5] text-center shadow-xs max-w-lg mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#fdf0f2] border border-[#f0c5d2] text-[#c88389] flex items-center justify-center mx-auto text-2xl">
              <FiPackage className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-normal text-[#3d2b1f]">
              Sign in to view your orders
            </h2>
            <p className="text-xs sm:text-sm text-[#7a6054]">
              Your orders are securely tied to your registered account. Please sign in or create an account to view and track your purchases.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="px-6 py-2.5 rounded-xl bg-[#3d2b1f] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              Sign In to Your Account
            </button>
          </div>
        )}

        {/* ── LOGGED IN CONTENT ── */}
        {(user || mongoUser) && (
          <div className="space-y-6">
            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#ebdcd5] shadow-2xs">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-[#fbf7f5] rounded-xl border border-[#f0e4df]">
                {[
                  { id: "all", label: "All Orders" },
                  { id: "pending", label: "Processing" },
                  { id: "shipped", label: "Shipped" },
                  { id: "delivered", label: "Delivered" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#3d2b1f] text-white shadow-2xs"
                        : "text-[#6b4f3a] hover:text-[#3d2b1f] hover:bg-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0604a]/50" />
                <input
                  type="text"
                  placeholder="Search by order # or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ebdcd5] bg-white placeholder:text-[#a0604a]/40 text-[#3d2b1f] focus:outline-none focus:ring-1 focus:ring-[#c88389]"
                />
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={fetchUserOrders}
                  className="font-bold underline hover:no-underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-3xl bg-white border border-[#ebdcd5] animate-pulse p-6"
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredOrders.length === 0 && (
              <div className="bg-white rounded-3xl p-12 border border-[#ebdcd5] text-center shadow-xs space-y-4 my-8">
                <div className="w-16 h-16 rounded-full bg-[#fdf0f2] border border-[#f0c5d2] text-[#c88389] flex items-center justify-center mx-auto text-2xl">
                  🛍️
                </div>
                <h3 className="text-lg font-serif font-normal text-[#3d2b1f]">
                  No orders found
                </h3>
                <p className="text-xs text-[#7a6054] max-w-sm mx-auto">
                  {searchQuery
                    ? `No orders matching "${searchQuery}". Try searching with a different term.`
                    : "You haven't placed any orders with this status yet."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/collection"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#c88389] hover:bg-[#b57278] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                  >
                    <span>Browse Luxury Sets</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Orders Cards List */}
            {!loading && filteredOrders.length > 0 && (
              <div className="space-y-5">
                {filteredOrders.map((order) => {
                  const isPaid =
                    order.payment?.status === "completed" ||
                    order.orderStatus === "paid";
                  const orderDate = new Date(
                    order.createdAt
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-3xl border border-[#ebdcd5] shadow-xs overflow-hidden transition-all hover:border-[#dfc3be]"
                    >
                      {/* Card Header */}
                      <div className="p-4 sm:p-5 bg-[#faf5f6] border-b border-[#ebdcd5]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono font-bold text-[#3d2b1f] text-sm">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[#8a7060] flex items-center gap-1">
                            <FiClock className="w-3.5 h-3.5 text-[#a0604a]" />
                            {orderDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Payment status badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {order.payment?.status === "completed"
                              ? "Paid"
                              : "Payment Pending"}
                          </span>

                          {/* Fulfillment status badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.orderStatus === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.orderStatus === "shipped"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : order.orderStatus === "cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Card Body: Items List */}
                      <div className="p-4 sm:p-6 divide-y divide-[#f5e6e8]">
                        {order.items?.map((item: any, iIdx: number) => (
                          <div
                            key={iIdx}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                          >
                            {/* Left: Thumbnail & Details */}
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#fdf0f2] border border-[#ebdcd5] shrink-0">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                                    💅
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-semibold text-xs sm:text-sm text-[#3d2b1f] truncate">
                                  {item.name}
                                </h4>
                                <p className="text-[11px] text-[#8a7060] mt-0.5">
                                  Qty: {item.quantity} × {order.pricing?.currency}{" "}
                                  {Number(item.price).toFixed(2)}
                                </p>

                                {/* ── Variant Badges: Length, Shade, Shape, Size ── */}
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  {[
                                    item.length && `Length: ${item.length}`,
                                    (item.shade || item.color) &&
                                      `Shade: ${item.shade || item.color}`,
                                    item.shape && `Shape: ${item.shape}`,
                                    item.size && `Size: ${item.size}`,
                                  ]
                                    .filter(Boolean)
                                    .map((badge, bIdx) => (
                                      <span
                                        key={bIdx}
                                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#faf5f6] border border-[#f0c5d2]/80 text-[#3d2b1f] text-[10px] font-medium"
                                      >
                                        {badge}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>

                            {/* Right: Line Subtotal */}
                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs sm:text-sm text-[#3d2b1f]">
                                {order.pricing?.currency}{" "}
                                {Number(
                                  item.subtotal || item.price * item.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Card Footer: Summary & Actions */}
                      <div className="p-4 sm:p-5 bg-[#faf5f6]/50 border-t border-[#ebdcd5]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="text-[#7a6054] text-[11px] space-y-0.5">
                          <p>
                            Shipping to:{" "}
                            <span className="font-semibold text-[#3d2b1f]">
                              {order.shippingAddress?.fullName}
                            </span>{" "}
                            ({order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.country})
                          </p>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right mr-2">
                            <span className="text-[10px] text-[#8a7060] uppercase tracking-wider block">
                              Total Amount
                            </span>
                            <span className="font-bold text-sm sm:text-base text-[#3d2b1f]">
                              {order.pricing?.currency}{" "}
                              {Number(order.pricing?.totalAmount || 0).toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#ebdcd5] text-[#3d2b1f] hover:bg-[#c88389] hover:text-white hover:border-[#c88389] text-xs font-semibold transition-all cursor-pointer"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Order Receipt Modal ── */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#ebdcd5] shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#f5e6e8] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-normal text-[#3d2b1f]">
                    Order Receipt
                  </h3>
                  <p className="text-xs font-mono text-[#8a7060]">
                    #{selectedOrder.orderNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-[#fdf0f2] text-[#3d2b1f] hover:bg-[#c88389] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Shipping Information */}
              <div className="p-4 rounded-2xl bg-[#faf5f6] border border-[#ebdcd5] text-xs space-y-1">
                <p className="font-bold text-[#3d2b1f] mb-1 flex items-center gap-1.5">
                  <FiTruck className="w-3.5 h-3.5 text-[#c88389]" />
                  <span>Delivery Address</span>
                </p>
                <p className="font-semibold">{selectedOrder.shippingAddress?.fullName}</p>
                <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                {selectedOrder.shippingAddress?.addressLine2 && (
                  <p>{selectedOrder.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state}{" "}
                  {selectedOrder.shippingAddress?.postalCode}
                </p>
                <p className="font-semibold text-[#8a7060]">
                  {selectedOrder.shippingAddress?.country}
                </p>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8a7060]">
                  Items Ordered
                </p>
                <div className="divide-y divide-[#f5e6e8]">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <div>
                        <p className="font-semibold text-[#3d2b1f]">
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
                            .map((t, tidx) => (
                              <span
                                key={tidx}
                                className="inline-flex px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 text-[10px]"
                              >
                                {t}
                              </span>
                            ))}
                        </div>
                      </div>
                      <span className="font-semibold text-[#3d2b1f] shrink-0">
                        {selectedOrder.pricing?.currency}{" "}
                        {Number(item.subtotal || item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-4 rounded-2xl bg-[#faf5f6] border border-[#ebdcd5] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8a7060]">Subtotal</span>
                  <span className="font-semibold">
                    {selectedOrder.pricing?.currency}{" "}
                    {Number(selectedOrder.pricing?.itemsSubtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a7060]">Shipping</span>
                  <span className="font-semibold">
                    {selectedOrder.pricing?.currency}{" "}
                    {Number(selectedOrder.pricing?.shippingFee || 0).toFixed(2)}
                  </span>
                </div>
                {selectedOrder.pricing?.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>
                      - {selectedOrder.pricing?.currency}{" "}
                      {Number(selectedOrder.pricing.discount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#ebdcd5] text-sm font-bold text-[#3d2b1f]">
                  <span>Total Paid</span>
                  <span>
                    {selectedOrder.pricing?.currency}{" "}
                    {Number(selectedOrder.pricing?.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-2.5 rounded-xl bg-[#3d2b1f] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
