"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import { AdminPayload } from "@/lib/auth";
import { useCurrency } from "@/context/CurrencyContext";
import {
  FiPackage,
  FiSettings,
  FiUsers,
  FiShoppingBag,
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiTruck,
  FiDollarSign,
  FiClock,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiExternalLink,
  FiFilter,
  FiTag,
  FiPercent,
} from "react-icons/fi";

interface AdminDashboardClientProps {
  admin: AdminPayload;
  initialTab?: "orders" | "settings" | "users" | "products" | "coupons";
}

export default function AdminDashboardClient({
  admin,
  initialTab = "orders",
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "settings" | "users" | "products" | "coupons">(initialTab);
  const { storeBaseCurrency, setStoreBaseCurrency, availableCurrencies, formatPrice } = useCurrency();

  // ──────────────────────────────────────────────
  // 1. ORDERS STATE
  // ──────────────────────────────────────────────
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPagination, setOrderPagination] = useState({
    totalOrders: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 50,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchOrders = async (targetPage = orderPage) => {
    setLoadingOrders(true);
    setOrdersError("");
    try {
      let url = `/api/admin/orders?status=${orderStatusFilter}&page=${targetPage}&limit=50`;
      if (orderSearchQuery.trim()) {
        url += `&query=${encodeURIComponent(orderSearchQuery.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load orders");
      }
      setOrders(data.orders || []);
      if (data.pagination) {
        setOrderPagination(data.pagination);
      }
    } catch (err: any) {
      setOrdersError(err.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders(orderPage);
    }
  }, [activeTab, orderStatusFilter, orderPage]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order status");
      }
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ──────────────────────────────────────────────
  // 2. USERS STATE
  // ──────────────────────────────────────────────
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      let url = "/api/admin/users";
      if (userSearchQuery.trim()) {
        url += `?query=${encodeURIComponent(userSearchQuery.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load users");
      }
      setUsers(data.users || []);
    } catch (err: any) {
      setUsersError(err.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  // ──────────────────────────────────────────────
  // 3. STORE SETTINGS: BASE CURRENCY & SHIPPING
  // ──────────────────────────────────────────────
  const [adminBaseCurrency, setAdminBaseCurrency] = useState(storeBaseCurrency);
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currencyNotice, setCurrencyNotice] = useState<string | null>(null);

  useEffect(() => {
    if (storeBaseCurrency) {
      setAdminBaseCurrency(storeBaseCurrency);
    }
  }, [storeBaseCurrency]);

  const handleBaseCurrencyChange = async (newBase: string) => {
    setAdminBaseCurrency(newBase);
    setIsSavingCurrency(true);
    setCurrencyNotice(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseCurrency: newBase }),
      });
      const data = await res.json();
      if (data.success) {
        setStoreBaseCurrency(newBase);
        setCurrencyNotice(`✓ Store base currency set to ${newBase}`);
        setTimeout(() => setCurrencyNotice(null), 3000);
      } else {
        throw new Error(data.error || "Failed to update base currency");
      }
    } catch (err: any) {
      alert(`Failed to save base currency: ${err.message}`);
      setAdminBaseCurrency(storeBaseCurrency);
    } finally {
      setIsSavingCurrency(false);
    }
  };

  // Shipping Methods
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [editingShippingMethod, setEditingShippingMethod] = useState<any | null>(null);
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  // Form State for Shipping Method Modal
  const [shippingForm, setShippingForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    minDays: 3,
    maxDays: 5,
    unit: "business_days",
    freeShippingThreshold: "",
    regionType: "all",
    countries: "",
    carrier: "",
    isActive: true,
    isDefault: false,
    sortOrder: 0,
  });

  const fetchShippingMethods = async () => {
    setLoadingShipping(true);
    setShippingError("");
    try {
      const res = await fetch("/api/admin/shipping");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load shipping methods");
      }
      setShippingMethods(data.data || []);
    } catch (err: any) {
      setShippingError(err.message || "Failed to load shipping methods");
    } finally {
      setLoadingShipping(false);
    }
  };

  useEffect(() => {
    if (activeTab === "settings") {
      fetchShippingMethods();
    }
  }, [activeTab]);

  const openCreateShippingModal = () => {
    setEditingShippingMethod(null);
    setShippingForm({
      name: "",
      slug: "",
      description: "",
      price: 0,
      minDays: 3,
      maxDays: 5,
      unit: "business_days",
      freeShippingThreshold: "",
      regionType: "all",
      countries: "",
      carrier: "",
      isActive: true,
      isDefault: false,
      sortOrder: shippingMethods.length + 1,
    });
    setIsShippingModalOpen(true);
  };

  const openEditShippingModal = (method: any) => {
    setEditingShippingMethod(method);
    setShippingForm({
      name: method.name || "",
      slug: method.slug || "",
      description: method.description || "",
      price: method.price ?? 0,
      minDays: method.estimatedDays?.min ?? 3,
      maxDays: method.estimatedDays?.max ?? 5,
      unit: method.estimatedDays?.unit || "business_days",
      freeShippingThreshold:
        method.freeShippingThreshold !== null && method.freeShippingThreshold !== undefined
          ? String(method.freeShippingThreshold)
          : "",
      regionType: method.regions?.type || "all",
      countries: Array.isArray(method.regions?.countries)
        ? method.regions.countries.join(", ")
        : "",
      carrier: method.carrier || "",
      isActive: method.isActive ?? true,
      isDefault: method.isDefault ?? false,
      sortOrder: method.sortOrder ?? 0,
    });
    setIsShippingModalOpen(true);
  };

  const handleSaveShippingMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm.name.trim()) {
      alert("Please enter a shipping method name.");
      return;
    }

    setIsSavingShipping(true);
    try {
      const payload: any = {
        name: shippingForm.name.trim(),
        description: shippingForm.description.trim(),
        price: Number(shippingForm.price),
        currency: adminBaseCurrency,
        estimatedDays: {
          min: Number(shippingForm.minDays),
          max: Number(shippingForm.maxDays),
          unit: shippingForm.unit,
        },
        freeShippingThreshold:
          shippingForm.freeShippingThreshold.trim() !== ""
            ? Number(shippingForm.freeShippingThreshold)
            : null,
        regions: {
          type: shippingForm.regionType,
          countries: shippingForm.countries
            ? shippingForm.countries
                .split(",")
                .map((c) => c.trim().toUpperCase())
                .filter(Boolean)
            : [],
        },
        carrier: shippingForm.carrier.trim(),
        isActive: shippingForm.isActive,
        isDefault: shippingForm.isDefault,
        sortOrder: Number(shippingForm.sortOrder),
      };

      if (editingShippingMethod?._id) {
        payload._id = editingShippingMethod._id;
      }
      if (shippingForm.slug.trim()) {
        payload.slug = shippingForm.slug.trim();
      }

      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save shipping method");
      }

      setIsShippingModalOpen(false);
      fetchShippingMethods();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleDeleteShippingMethod = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete shipping method");
      }
      setShippingMethods((prev) => prev.filter((m) => m._id !== id));
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // ──────────────────────────────────────────────
  // 4. COUPONS STATE & HANDLERS
  // ──────────────────────────────────────────────
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponsError, setCouponsError] = useState("");
  const [couponSearchQuery, setCouponSearchQuery] = useState("");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  const initialCouponForm = {
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed" | "free_shipping",
    discountValue: 10,
    maxDiscountAmount: "",
    minCartTotal: "",
    minItemQuantity: "",
    applicableProductIds: "",
    requiredProductIds: "",
    maxUses: "",
    maxUsesPerUser: 1,
    startDate: "",
    endDate: "",
    isActive: true,
  };
  const [couponForm, setCouponForm] = useState(initialCouponForm);

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    setCouponsError("");
    try {
      let url = "/api/admin/coupons";
      if (couponSearchQuery.trim()) {
        url += `?query=${encodeURIComponent(couponSearchQuery.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load coupons");
      }
      setCoupons(data.coupons || []);
    } catch (err: any) {
      setCouponsError(err.message || "Failed to load coupons");
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (activeTab === "coupons") {
      fetchCoupons();
    }
  }, [activeTab]);

  const openCreateCouponModal = () => {
    setEditingCoupon(null);
    setCouponForm(initialCouponForm);
    setIsCouponModalOpen(true);
  };

  const openEditCouponModal = (c: any) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code || "",
      description: c.description || "",
      discountType: c.discountType || "percentage",
      discountValue: c.discountValue ?? 0,
      maxDiscountAmount: c.maxDiscountAmount ? String(c.maxDiscountAmount) : "",
      minCartTotal: c.minCartTotal ? String(c.minCartTotal) : "",
      minItemQuantity: c.minItemQuantity ? String(c.minItemQuantity) : "",
      applicableProductIds: (c.applicableProductIds || []).join(", "),
      requiredProductIds: (c.requiredProductIds || []).join(", "),
      maxUses: c.maxUses ? String(c.maxUses) : "",
      maxUsesPerUser: c.maxUsesPerUser ? Number(c.maxUsesPerUser) : 1,
      startDate: c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : "",
      endDate: c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : "",
      isActive: c.isActive !== false,
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      alert("Please enter a coupon code");
      return;
    }

    setIsSavingCoupon(true);
    try {
      const payload: any = {
        code: couponForm.code.trim().toUpperCase(),
        description: couponForm.description.trim() || undefined,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue) || 0,
        maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : undefined,
        minCartTotal: couponForm.minCartTotal ? Number(couponForm.minCartTotal) : 0,
        minItemQuantity: couponForm.minItemQuantity ? Number(couponForm.minItemQuantity) : 0,
        maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : undefined,
        maxUsesPerUser: Number(couponForm.maxUsesPerUser) || 1,
        applicableProductIds: couponForm.applicableProductIds
          ? couponForm.applicableProductIds.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        requiredProductIds: couponForm.requiredProductIds
          ? couponForm.requiredProductIds.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        startDate: couponForm.startDate ? new Date(couponForm.startDate) : undefined,
        endDate: couponForm.endDate ? new Date(couponForm.endDate) : undefined,
        isActive: Boolean(couponForm.isActive),
      };

      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon._id}`
        : "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save coupon");
      }

      setIsCouponModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      alert(`Error saving coupon: ${err.message}`);
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleToggleCouponActive = async (coupon: any) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to toggle status");
      }
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete coupon");
      }
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-[#3d2b1f] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* ── Top Header & Tab Navigation ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#ebdcd5] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#fce8ec] text-[#c25d65]">
                Admin Portal
              </span>
              <span className="text-xs text-neutral-500">Logged in as {admin.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3d2b1f]">
              Store Control Center
            </h1>
          </div>

          {/* Navigation Tabs (Mobile swipeable, desktop inline) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#ebdcd5] shadow-xs overflow-x-auto no-scrollbar max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "orders"
                  ? "bg-[#3d2b1f] text-white shadow-xs"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50"
              }`}
            >
              <FiPackage className="w-4 h-4" />
              <span>Orders</span>
              {orders.length > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  activeTab === "orders" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "users"
                  ? "bg-[#3d2b1f] text-white shadow-xs"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50"
              }`}
            >
              <FiUsers className="w-4 h-4" />
              <span>Users</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("coupons")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "coupons"
                  ? "bg-[#3d2b1f] text-white shadow-xs"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50"
              }`}
            >
              <FiTag className="w-4 h-4" />
              <span>Coupons</span>
              {coupons.length > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  activeTab === "coupons" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
                }`}>
                  {coupons.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "settings"
                  ? "bg-[#3d2b1f] text-white shadow-xs"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-50"
              }`}
            >
              <FiSettings className="w-4 h-4" />
              <span>Store Settings</span>
            </button>

            <Link
              href="/admin/products"
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all whitespace-nowrap shrink-0"
            >
              <FiShoppingBag className="w-4 h-4" />
              <span>Products</span>
              <FiExternalLink className="w-3 h-3 text-neutral-400" />
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TAB 1: ORDERS MANAGEMENT
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="mt-8 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ebdcd5] shadow-xs">
              <div className="relative flex-1 sm:max-w-xs">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by order #, name, or email..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setOrderPage(1);
                      fetchOrders(1);
                    }
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FiFilter className="w-4 h-4 text-neutral-500 hidden sm:block shrink-0" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                    setOrderPage(1);
                  }}
                  className="px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-white font-medium cursor-pointer focus:outline-none flex-1 sm:flex-initial"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  type="button"
                  onClick={() => fetchOrders(orderPage)}
                  className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0"
                  title="Refresh Orders"
                >
                  <FiRefreshCw className={`w-4 h-4 text-neutral-600 ${loadingOrders ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Orders Table & Cards */}
            {loadingOrders ? (
              <div className="py-20 text-center text-sm text-neutral-400">Loading customer orders...</div>
            ) : ordersError ? (
              <div className="p-6 rounded-2xl bg-red-50 text-red-700 text-sm">{ordersError}</div>
            ) : orders.length === 0 ? (
              <div className="py-20 bg-white rounded-2xl border border-dashed border-neutral-300 text-center p-8">
                <FiPackage className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <h3 className="text-base font-bold text-neutral-800">No Orders Found</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Customer orders placed via PayPal checkout will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* ── MOBILE / TABLET ORDERS CARD DECK (< lg) ── */}
                <div className="block lg:hidden space-y-3">
                  {orders.map((o) => {
                    const isPaid = o.payment?.status === "completed" || o.orderStatus === "paid";
                    return (
                      <div
                        key={o._id}
                        className="bg-white rounded-2xl border border-[#ebdcd5] p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono font-bold text-sm text-neutral-900 block">
                              #{o.orderNumber}
                            </span>
                            <span className="text-[11px] text-neutral-500">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 justify-end">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isPaid
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {o.payment?.status || "Pending"}
                            </span>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                o.orderStatus === "delivered"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : o.orderStatus === "shipped"
                                  ? "bg-blue-50 text-blue-700"
                                  : o.orderStatus === "cancelled"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-purple-50 text-purple-700"
                              }`}
                            >
                              {o.orderStatus}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-neutral-900">{o.customer?.name || "Customer"}</p>
                            <p className="text-[11px] text-neutral-500">{o.customer?.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-sm text-neutral-900">
                              {o.pricing?.currency || "USD"} {Number(o.pricing?.totalAmount || 0).toFixed(2)}
                            </p>
                            <p className="text-[11px] text-neutral-500">{o.items?.length || 0} items</p>
                          </div>
                        </div>

                        {o.items?.[0] && (
                          <div className="p-2.5 rounded-xl bg-[#fdfbf9] border border-neutral-100 text-[11px] text-neutral-600">
                            <p className="font-medium text-neutral-800 line-clamp-1">{o.items[0].name}</p>
                            <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                              {[
                                o.items[0].length && `${o.items[0].length}`,
                                (o.items[0].shade || o.items[0].color) && `${o.items[0].shade || o.items[0].color}`,
                                o.items[0].shape && `${o.items[0].shape}`,
                                o.items[0].size && `Sz: ${o.items[0].size}`,
                              ]
                                .filter(Boolean)
                                .join(" • ") || "Standard"}
                              {o.items.length > 1 && ` +${o.items.length - 1} more`}
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-black hover:text-white text-xs font-semibold text-center transition-all cursor-pointer"
                        >
                          View Details & Manage Status
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* ── DESKTOP ORDERS TABLE (lg+) ── */}
                <div className="hidden lg:block bg-white rounded-2xl border border-[#ebdcd5] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#fcf8f6] border-b border-[#ebdcd5] text-neutral-500 text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Order #</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Items</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4">Fulfillment</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {orders.map((o) => {
                          const isPaid = o.payment?.status === "completed" || o.orderStatus === "paid";
                          return (
                            <tr key={o._id} className="hover:bg-neutral-50/70 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                                #{o.orderNumber}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-semibold text-neutral-900">{o.customer?.name || "Customer"}</p>
                                <p className="text-[11px] text-neutral-500">{o.customer?.email}</p>
                              </td>
                              <td className="py-3.5 px-4 text-neutral-600">
                                <p className="font-semibold text-neutral-900">{o.items?.length || 0} items</p>
                                {o.items?.[0] && (
                                  <p className="text-[10px] text-neutral-500 truncate max-w-[170px] mt-0.5">
                                    {[
                                      o.items[0].length && `${o.items[0].length}`,
                                      (o.items[0].shade || o.items[0].color) && `${o.items[0].shade || o.items[0].color}`,
                                      o.items[0].shape && `${o.items[0].shape}`,
                                      o.items[0].size && `Sz: ${o.items[0].size}`,
                                    ]
                                      .filter(Boolean)
                                      .join(" • ") || "Standard"}
                                    {o.items.length > 1 && ` +${o.items.length - 1} more`}
                                  </p>
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-neutral-900">
                                {o.pricing?.currency || "USD"} {Number(o.pricing?.totalAmount || 0).toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isPaid
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}
                                >
                                  {o.payment?.status || "Pending"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    o.orderStatus === "delivered"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : o.orderStatus === "shipped"
                                      ? "bg-blue-50 text-blue-700"
                                      : o.orderStatus === "cancelled"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-purple-50 text-purple-700"
                                  }`}
                                >
                                  {o.orderStatus}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-[11px] text-neutral-500">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(o)}
                                  className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-black hover:text-white text-xs font-semibold transition-all cursor-pointer"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── PAGINATION BAR (50 orders per page) ── */}
                {orderPagination.totalOrders > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ebdcd5] shadow-xs text-xs sm:text-sm">
                    {/* Summary text */}
                    <div className="text-neutral-500 text-center sm:text-left">
                      Showing{" "}
                      <span className="font-bold text-neutral-900">
                        {Math.min((orderPage - 1) * 50 + 1, orderPagination.totalOrders)}
                      </span>
                      {" "}to{" "}
                      <span className="font-bold text-neutral-900">
                        {Math.min(orderPage * 50, orderPagination.totalOrders)}
                      </span>
                      {" "}of{" "}
                      <span className="font-bold text-neutral-900">{orderPagination.totalOrders}</span> orders
                    </div>

                    {/* Pagination buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        disabled={!orderPagination.hasPrevPage || loadingOrders}
                        onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title="Previous Page"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                        <span className="hidden xs:inline">Prev</span>
                      </button>

                      {/* Page indicator pill */}
                      <span className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 font-medium text-neutral-700 text-xs">
                        Page <strong className="text-neutral-900 font-bold">{orderPagination.currentPage}</strong> of{" "}
                        <strong className="text-neutral-900 font-bold">{orderPagination.totalPages}</strong>
                      </span>

                      <button
                        type="button"
                        disabled={!orderPagination.hasNextPage || loadingOrders}
                        onClick={() => setOrderPage((prev) => prev + 1)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title="Next Page"
                      >
                        <span className="hidden xs:inline">Next</span>
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col border border-neutral-200 shadow-2xl overflow-hidden">
                  {/* Sticky Modal Header */}
                  <div className="px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-neutral-100 shrink-0 bg-white">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#c25d65]">
                        Order Snapshot
                      </span>
                      <h2 className="text-xl font-extrabold text-neutral-900 font-mono">
                        #{selectedOrder.orderNumber}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black cursor-pointer"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
                    {/* Status Updater */}
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-neutral-700">Update Fulfillment Status</p>
                        <p className="text-[11px] text-neutral-500">Keep customer informed of packing and delivery</p>
                      </div>
                      <select
                        value={selectedOrder.orderStatus}
                        disabled={isUpdatingStatus}
                        onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                        className="px-3 py-2.5 text-xs font-bold rounded-xl border border-neutral-300 bg-white cursor-pointer w-full sm:w-auto"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Customer & Shipping Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl border border-neutral-100 bg-[#fdfbf9] space-y-1">
                        <p className="font-bold text-neutral-900 mb-1 flex items-center gap-1.5">
                          <FiUsers className="w-3.5 h-3.5 text-[#c25d65]" /> Customer Info
                        </p>
                        <p><strong className="text-neutral-500">Name:</strong> {selectedOrder.customer?.name}</p>
                        <p><strong className="text-neutral-500">Email:</strong> {selectedOrder.customer?.email}</p>
                        <p><strong className="text-neutral-500">Phone:</strong> {selectedOrder.customer?.phone || "—"}</p>
                      </div>

                      <div className="p-4 rounded-xl border border-neutral-100 bg-[#fdfbf9] space-y-1">
                        <p className="font-bold text-neutral-900 mb-1 flex items-center gap-1.5">
                          <FiTruck className="w-3.5 h-3.5 text-[#c25d65]" /> Shipping Address
                        </p>
                        <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                        {selectedOrder.shippingAddress?.addressLine2 && (
                          <p>{selectedOrder.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                        </p>
                        <p className="font-semibold text-neutral-800">{selectedOrder.shippingAddress?.country}</p>
                      </div>
                    </div>

                    {/* Items Ordered */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                        Ordered Products ({selectedOrder.items?.length || 0})
                      </h3>
                      <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
                        {selectedOrder.items?.map((item: any, idx: number) => (
                          <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                            <div className="flex items-start sm:items-center gap-3 min-w-0">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                                {item.image && (
                                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-neutral-900 truncate">{item.name}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {[
                                    item.length && `Length: ${item.length}`,
                                    (item.shade || item.color) && `Shade: ${item.shade || item.color}`,
                                    item.shape && `Shape: ${item.shape}`,
                                    item.size && `Size: ${item.size}`,
                                    item.style && `Style: ${item.style}`,
                                  ]
                                    .filter(Boolean)
                                    .map((badge, bIdx) => (
                                      <span
                                        key={bIdx}
                                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-medium border border-neutral-200/60"
                                      >
                                        {badge}
                                      </span>
                                    ))}
                                  {![item.length, item.shade, item.color, item.shape, item.size, item.style].some(Boolean) && (
                                    <span className="text-[10px] text-neutral-400 italic">Standard</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:block sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 shrink-0">
                              <p className="font-semibold text-neutral-900">
                                Qty: {item.quantity} × {selectedOrder.pricing?.currency} {Number(item.price).toFixed(2)}
                              </p>
                              <p className="text-[11px] text-neutral-500 font-bold">
                                Total: {selectedOrder.pricing?.currency} {Number(item.subtotal || item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Subtotal</span>
                        <span className="font-semibold">
                          {selectedOrder.pricing?.currency} {Number(selectedOrder.pricing?.itemsSubtotal || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Shipping</span>
                        <span className="font-semibold">
                          {selectedOrder.pricing?.currency} {Number(selectedOrder.pricing?.shippingFee || 0).toFixed(2)}
                        </span>
                      </div>
                      {selectedOrder.pricing?.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Discount</span>
                          <span>- {selectedOrder.pricing?.currency} {Number(selectedOrder.pricing.discount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-bold text-neutral-900">
                        <span>Total Amount</span>
                        <span>
                          {selectedOrder.pricing?.currency} {Number(selectedOrder.pricing?.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-end shrink-0 bg-white">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer text-center"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: USERS MANAGEMENT
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="mt-8 space-y-6">
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-2.5 sm:gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ebdcd5] shadow-xs">
              <div className="relative flex-1 sm:max-w-xs">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <button
                type="button"
                onClick={fetchUsers}
                className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0"
                title="Refresh Users"
              >
                <FiRefreshCw className={`w-4 h-4 text-neutral-600 ${loadingUsers ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Users Table & Cards */}
            {loadingUsers ? (
              <div className="py-20 text-center text-sm text-neutral-400">Loading registered users...</div>
            ) : usersError ? (
              <div className="p-6 rounded-2xl bg-red-50 text-red-700 text-sm">{usersError}</div>
            ) : users.length === 0 ? (
              <div className="py-20 bg-white rounded-2xl border border-dashed border-neutral-300 text-center p-8">
                <FiUsers className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <h3 className="text-base font-bold text-neutral-800">No Users Found</h3>
              </div>
            ) : (
              <>
                {/* ── MOBILE / TABLET USERS CARD DECK (< lg) ── */}
                <div className="block lg:hidden space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="bg-white rounded-2xl border border-[#ebdcd5] p-3.5 sm:p-4 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#fdf0f2] text-[#c88389] font-bold flex items-center justify-center text-xs shrink-0">
                            {(u.name || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-neutral-900 truncate">{u.name}</p>
                            <p className="text-[11px] text-neutral-500 truncate">{u.email}</p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-semibold">Phone</span>
                          <span className="font-mono text-neutral-700 text-[11px] truncate block">{u.phone || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-semibold">Orders Placed</span>
                          <span className="font-semibold text-neutral-900">{u.ordersCount} orders</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-neutral-50 flex items-center justify-between text-[11px] text-neutral-500">
                          <span>Joined Date</span>
                          <span className="font-medium text-neutral-700">{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── DESKTOP USERS TABLE (lg+) ── */}
                <div className="hidden lg:block bg-white rounded-2xl border border-[#ebdcd5] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#fcf8f6] border-b border-[#ebdcd5] text-neutral-500 text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Phone</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Orders Placed</th>
                          <th className="py-3 px-4">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-neutral-900 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#fdf0f2] text-[#c88389] font-bold flex items-center justify-center text-xs">
                                {(u.name || "U")[0].toUpperCase()}
                              </div>
                              <span>{u.name}</span>
                            </td>
                            <td className="py-3.5 px-4 text-neutral-600">{u.email}</td>
                            <td className="py-3.5 px-4 font-mono text-neutral-500">{u.phone}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  u.role === "admin"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-neutral-100 text-neutral-700"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-neutral-800">
                              {u.ordersCount} orders
                            </td>
                            <td className="py-3.5 px-4 text-[11px] text-neutral-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: STORE SETTINGS (BASE CURRENCY & SHIPPING METHODS)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="mt-8 space-y-10">
            {/* 1. Base Currency Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 border border-[#ebdcd5] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-5 h-5 text-[#c25d65]" />
                    <h2 className="text-lg font-bold text-neutral-900">Store Base Currency</h2>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    The master currency your product prices, shipping fees, and database records are priced in.
                  </p>
                </div>

                {currencyNotice && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                    {currencyNotice}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { code: "INR", name: "Indian Rupee", symbol: "₹" },
                  { code: "USD", name: "US Dollar", symbol: "$" },
                  { code: "EUR", name: "Euro", symbol: "€" },
                  { code: "GBP", name: "British Pound", symbol: "£" },
                  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
                  { code: "AUD", name: "Australian Dollar", symbol: "AU$" },
                  { code: "AED", name: "UAE Dirham", symbol: "AED" },
                ].map((curr) => {
                  const isSelected = adminBaseCurrency === curr.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      disabled={isSavingCurrency}
                      onClick={() => handleBaseCurrencyChange(curr.code)}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-[#c25d65] bg-[#fdf0f2] ring-2 ring-[#c25d65]/20 shadow-xs"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-bold text-neutral-900">{curr.code}</span>
                          <span className="text-xs text-neutral-500 font-semibold">({curr.symbol})</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{curr.name}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#c25d65] text-white flex items-center justify-center">
                          <FiCheck className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Shipping Methods Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 border border-[#ebdcd5] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FiTruck className="w-5 h-5 text-[#c25d65]" />
                    <h2 className="text-lg font-bold text-neutral-900">Shipping Methods & Rates</h2>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage delivery time, carrier rates, free shipping thresholds, and target countries.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateShippingModal}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3d2b1f] hover:bg-[#281b13] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs w-full sm:w-auto"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Shipping Method</span>
                </button>
              </div>

              {/* Shipping Table / Cards */}
              {loadingShipping ? (
                <div className="py-12 text-center text-sm text-neutral-400">Loading shipping methods...</div>
              ) : shippingError ? (
                <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs">{shippingError}</div>
              ) : shippingMethods.length === 0 ? (
                <div className="py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-center p-6">
                  <FiTruck className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                  <p className="text-sm font-bold text-neutral-800">No Shipping Methods Configured</p>
                  <p className="text-xs text-neutral-500 mt-1">Click above to add your first delivery rate.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {shippingMethods.map((m) => (
                    <div
                      key={m._id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        m.isActive
                          ? "bg-white border-neutral-200 shadow-xs hover:border-[#c25d65]/40"
                          : "bg-neutral-50 border-neutral-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-neutral-900 text-sm sm:text-base">{m.name}</h3>
                            {m.isDefault && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                Default
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                m.isActive ? "bg-emerald-50 text-emerald-700" : "bg-neutral-200 text-neutral-600"
                              }`}
                            >
                              {m.isActive ? "Active" : "Disabled"}
                            </span>
                          </div>
                          {m.description && <p className="text-xs text-neutral-500 mt-1">{m.description}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditShippingModal(m)}
                            className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-black cursor-pointer transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteShippingMethod(m._id, m.name)}
                            className="p-2 rounded-xl border border-neutral-200 hover:bg-red-50 text-neutral-400 hover:text-red-600 cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Details Pills */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-neutral-100 text-xs">
                        <div>
                          <span className="text-[11px] text-neutral-400 block">Shipping Price</span>
                          <span className="font-bold text-neutral-900 text-sm">
                            {m.price === 0 ? "FREE" : `${m.currency || adminBaseCurrency} ${Number(m.price).toFixed(2)}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-neutral-400 block">Delivery Time</span>
                          <span className="font-semibold text-neutral-800 flex items-center gap-1">
                            <FiClock className="w-3 h-3 text-neutral-400" />
                            {m.estimatedDays?.label || `${m.estimatedDays?.min}–${m.estimatedDays?.max} Days`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-neutral-400 block">Free Shipping Above</span>
                          <span className="font-semibold text-neutral-800">
                            {m.freeShippingThreshold ? `${m.currency || adminBaseCurrency} ${m.freeShippingThreshold}` : "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-neutral-400 block">Target Regions</span>
                          <span className="font-semibold text-neutral-800 capitalize flex items-center gap-1">
                            <FiMapPin className="w-3 h-3 text-neutral-400" />
                            {m.regions?.type || "All Countries"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal: Add / Edit Shipping Method */}
            {isShippingModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
                <form
                  onSubmit={handleSaveShippingMethod}
                  className="bg-white rounded-3xl max-w-lg w-full flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden border border-neutral-200 shadow-2xl"
                >
                  {/* Sticky Header */}
                  <div className="px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-neutral-100 shrink-0 bg-white">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#c25d65]">
                        Shipping Configuration
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                        {editingShippingMethod ? "Edit Shipping Method" : "Add Shipping Method"}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsShippingModalOpen(false)}
                      className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black cursor-pointer transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Scrollable Form Body */}
                  <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain text-xs sm:text-sm">
                    {/* Method Name */}
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Method Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Standard Delivery or Express Courier"
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    {/* Price & Free Shipping Threshold (2 cols) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Price ({adminBaseCurrency}) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0 for Free"
                          value={shippingForm.price}
                          onChange={(e) => setShippingForm({ ...shippingForm, price: Number(e.target.value) })}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Free Above Subtotal ({adminBaseCurrency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 1999 (optional)"
                          value={shippingForm.freeShippingThreshold}
                          onChange={(e) => setShippingForm({ ...shippingForm, freeShippingThreshold: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Delivery Time (Min & Max Days) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Min Days</label>
                        <input
                          type="number"
                          min="0"
                          value={shippingForm.minDays}
                          onChange={(e) => setShippingForm({ ...shippingForm, minDays: Number(e.target.value) })}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Max Days</label>
                        <input
                          type="number"
                          min="0"
                          value={shippingForm.maxDays}
                          onChange={(e) => setShippingForm({ ...shippingForm, maxDays: Number(e.target.value) })}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Unit</label>
                        <select
                          value={shippingForm.unit}
                          onChange={(e) => setShippingForm({ ...shippingForm, unit: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          <option value="business_days">Business Days</option>
                          <option value="days">Days</option>
                          <option value="hours">Hours</option>
                        </select>
                      </div>
                    </div>

                    {/* Carrier & Region Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Carrier / Partner</label>
                        <input
                          type="text"
                          placeholder="e.g. FedEx, DHL, BlueDart"
                          value={shippingForm.carrier}
                          onChange={(e) => setShippingForm({ ...shippingForm, carrier: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Region Type</label>
                        <select
                          value={shippingForm.regionType}
                          onChange={(e) => setShippingForm({ ...shippingForm, regionType: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          <option value="all">All Countries (Worldwide)</option>
                          <option value="domestic">Domestic Only (India)</option>
                          <option value="international">International Only</option>
                          <option value="custom">Custom Country List</option>
                        </select>
                      </div>
                    </div>

                    {shippingForm.regionType === "custom" && (
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Country Codes (Comma-separated ISO-2)
                        </label>
                        <input
                          type="text"
                          placeholder="US, CA, GB, AU"
                          value={shippingForm.countries}
                          onChange={(e) => setShippingForm({ ...shippingForm, countries: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">Short Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Reliable insured delivery with live tracking"
                        value={shippingForm.description}
                        onChange={(e) => setShippingForm({ ...shippingForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={shippingForm.isActive}
                          onChange={(e) => setShippingForm({ ...shippingForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-[#c25d65] focus:ring-0"
                        />
                        <span className="font-semibold text-neutral-800">Active</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={shippingForm.isDefault}
                          onChange={(e) => setShippingForm({ ...shippingForm, isDefault: e.target.checked })}
                          className="w-4 h-4 rounded text-[#c25d65] focus:ring-0"
                        />
                        <span className="font-semibold text-neutral-800">Set as Default</span>
                      </label>
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0 bg-white/95 backdrop-blur-xs">
                    <button
                      type="button"
                      onClick={() => setIsShippingModalOpen(false)}
                      className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingShipping}
                      className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-[#3d2b1f] hover:bg-[#281b13] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 text-center"
                    >
                      {isSavingShipping ? "Saving..." : editingShippingMethod ? "Update Method" : "Create Method"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: COUPONS MANAGEMENT
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "coupons" && (
          <div className="mt-8 space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ebdcd5] shadow-xs">
              <div className="relative flex-1 sm:max-w-xs">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search code or description..."
                  value={couponSearchQuery}
                  onChange={(e) => setCouponSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchCoupons()}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={fetchCoupons}
                  className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0"
                  title="Refresh Coupons"
                >
                  <FiRefreshCw className={`w-4 h-4 text-neutral-600 ${loadingCoupons ? "animate-spin" : ""}`} />
                </button>

                <button
                  type="button"
                  onClick={openCreateCouponModal}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3d2b1f] hover:bg-[#281b13] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer flex-1 sm:flex-initial"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>
            </div>

            {/* Coupons Table & Cards */}
            {loadingCoupons ? (
              <div className="py-20 text-center text-sm text-neutral-400">Loading coupons...</div>
            ) : couponsError ? (
              <div className="p-6 rounded-2xl bg-red-50 text-red-700 text-sm">{couponsError}</div>
            ) : coupons.length === 0 ? (
              <div className="py-20 bg-white rounded-2xl border border-dashed border-neutral-300 text-center p-8">
                <FiTag className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <h3 className="text-base font-bold text-neutral-800">No Coupons Yet</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Create discount codes for percentage off, fixed savings, specific products, or free shipping.
                </p>
                <button
                  type="button"
                  onClick={openCreateCouponModal}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3d2b1f] hover:bg-[#281b13] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create First Coupon</span>
                </button>
              </div>
            ) : (
              <>
                {/* ── MOBILE / TABLET COUPONS CARD DECK (< lg) ── */}
                <div className="block lg:hidden space-y-3">
                  {coupons.map((c) => {
                    const isExpired = c.endDate && new Date(c.endDate) < new Date();
                    const isScheduled = c.startDate && new Date(c.startDate) > new Date();

                    return (
                      <div
                        key={c._id}
                        className="bg-white rounded-2xl border border-[#ebdcd5] p-3.5 sm:p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="font-mono font-bold text-sm bg-neutral-100 px-2 py-0.5 rounded text-neutral-900 border border-neutral-200 inline-block">
                              {c.code}
                            </span>
                            {c.description && (
                              <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">{c.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCouponActive(c)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                              c.isActive && !isExpired
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.isActive && !isExpired ? "bg-emerald-500" : "bg-neutral-400"}`} />
                            {c.isActive ? (isExpired ? "Expired" : "Active") : "Inactive"}
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Discount</span>
                            <span className="font-extrabold text-[#c25d65] text-sm">
                              {c.discountType === "percentage"
                                ? `${c.discountValue}% OFF`
                                : c.discountType === "fixed"
                                ? `${storeBaseCurrency} ${c.discountValue} OFF`
                                : "Free Shipping"}
                            </span>
                            {c.discountType === "percentage" && c.maxDiscountAmount && (
                              <p className="text-[10px] text-neutral-500">
                                Capped at {storeBaseCurrency} {c.maxDiscountAmount}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Uses</span>
                            <span className="font-bold text-neutral-800">{c.usedCount || 0} / {c.maxUses || "∞"}</span>
                            <p className="text-[10px] text-neutral-500">Max {c.maxUsesPerUser || 1}/user</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-neutral-500 pt-1">
                          <span>
                            {c.endDate ? (
                              <span className={isExpired ? "text-red-500 font-semibold" : ""}>
                                Exp: {new Date(c.endDate).toLocaleDateString()}
                              </span>
                            ) : (
                              "Never expires"
                            )}
                            {isScheduled && (
                              <span className="text-amber-600 font-medium ml-2">Starts {new Date(c.startDate).toLocaleDateString()}</span>
                            )}
                          </span>
                          {c.minCartTotal > 0 && (
                            <span className="font-medium text-neutral-700">Min Cart: {storeBaseCurrency} {c.minCartTotal}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => openEditCouponModal(c)}
                            className="py-2.5 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c._id, c.code)}
                            className="py-2.5 px-3 rounded-xl border border-neutral-200 hover:bg-red-50 text-neutral-600 hover:text-red-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── DESKTOP COUPONS TABLE (lg+) ── */}
                <div className="hidden lg:block bg-white rounded-2xl border border-[#ebdcd5] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#fcf8f6] border-b border-[#ebdcd5] text-neutral-500 text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Coupon Code</th>
                          <th className="py-3 px-4">Discount</th>
                          <th className="py-3 px-4">Rules & Conditions</th>
                          <th className="py-3 px-4">Redemptions</th>
                          <th className="py-3 px-4">Validity</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {coupons.map((c) => {
                          const isExpired = c.endDate && new Date(c.endDate) < new Date();
                          const isScheduled = c.startDate && new Date(c.startDate) > new Date();

                          return (
                            <tr key={c._id} className="hover:bg-neutral-50/70 transition-colors">
                              {/* Code */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-sm bg-neutral-100 px-2 py-0.5 rounded text-neutral-900 border border-neutral-200">
                                    {c.code}
                                  </span>
                                </div>
                                {c.description && (
                                  <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">{c.description}</p>
                                )}
                              </td>

                              {/* Discount */}
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-neutral-900">
                                  {c.discountType === "percentage"
                                    ? `${c.discountValue}% OFF`
                                    : c.discountType === "fixed"
                                    ? `${storeBaseCurrency} ${c.discountValue} OFF`
                                    : "Free Shipping"}
                                </span>
                                {c.discountType === "percentage" && c.maxDiscountAmount && (
                                  <p className="text-[10px] text-neutral-500">
                                    Capped at {storeBaseCurrency} {c.maxDiscountAmount}
                                  </p>
                                )}
                              </td>

                              {/* Rules */}
                              <td className="py-3.5 px-4 text-neutral-600">
                                <div className="space-y-0.5 text-[11px]">
                                  {c.minCartTotal > 0 && (
                                    <p>Min Cart: <span className="font-semibold">{storeBaseCurrency} {c.minCartTotal}</span></p>
                                  )}
                                  {c.minItemQuantity > 0 && (
                                    <p>Min Items: <span className="font-semibold">{c.minItemQuantity}</span></p>
                                  )}
                                  {c.applicableProductIds?.length > 0 && (
                                    <span className="inline-block px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200 mr-1">
                                      {c.applicableProductIds.length} Target Item{c.applicableProductIds.length > 1 ? "s" : ""}
                                    </span>
                                  )}
                                  {c.requiredProductIds?.length > 0 && (
                                    <span className="inline-block px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200 mr-1">
                                      Bundle Combo
                                    </span>
                                  )}
                                  {!c.minCartTotal && !c.minItemQuantity && !c.applicableProductIds?.length && !c.requiredProductIds?.length && (
                                    <span className="text-neutral-400">No restrictions</span>
                                  )}
                                </div>
                              </td>

                              {/* Redemptions */}
                              <td className="py-3.5 px-4 text-neutral-700">
                                <span className="font-semibold">{c.usedCount || 0}</span>
                                <span className="text-neutral-400"> / {c.maxUses || "∞"}</span>
                                <p className="text-[10px] text-neutral-500">Max {c.maxUsesPerUser || 1}/user</p>
                              </td>

                              {/* Validity */}
                              <td className="py-3.5 px-4 text-[11px] text-neutral-500">
                                {c.endDate ? (
                                  <p className={isExpired ? "text-red-500 font-semibold" : ""}>
                                    Until {new Date(c.endDate).toLocaleDateString()}
                                  </p>
                                ) : (
                                  <p className="text-neutral-400">Never expires</p>
                                )}
                                {isScheduled && (
                                  <span className="text-amber-600 font-medium">Starts {new Date(c.startDate).toLocaleDateString()}</span>
                                )}
                              </td>

                              {/* Active Toggle */}
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCouponActive(c)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                    c.isActive && !isExpired
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                      : "bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-200"
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${c.isActive && !isExpired ? "bg-emerald-500" : "bg-neutral-400"}`} />
                                  {c.isActive ? (isExpired ? "Expired" : "Active") : "Inactive"}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditCouponModal(c)}
                                    className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                                    title="Edit Coupon"
                                  >
                                    <FiEdit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCoupon(c._id, c.code)}
                                    className="p-1.5 rounded-lg border border-neutral-200 hover:bg-red-50 hover:text-red-600 text-neutral-600 transition-colors cursor-pointer"
                                    title="Delete Coupon"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── CREATE / EDIT COUPON MODAL ── */}
            {isCouponModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
                <form
                  onSubmit={handleSaveCoupon}
                  className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
                >
                  {/* Sticky Modal Header */}
                  <div className="px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-neutral-100 shrink-0 bg-white">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                        {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon"}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Set discounts, currency-compatible values, and cart conditions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCouponModalOpen(false)}
                      className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Scrollable Form Body */}
                  <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain text-xs sm:text-sm">
                    {/* Code & Discount Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Coupon Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. WELCOME10, VIP20"
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm uppercase font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Discount Type</label>
                        <select
                          value={couponForm.discountType}
                          onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                        >
                          <option value="percentage">Percentage Off (%)</option>
                          <option value="fixed">Fixed Amount Off ({storeBaseCurrency})</option>
                          <option value="free_shipping">Free Shipping</option>
                        </select>
                      </div>
                    </div>

                    {/* Discount Value & Max Cap */}
                    {couponForm.discountType !== "free_shipping" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            {couponForm.discountType === "percentage" ? "Percentage Value (%) *" : `Fixed Amount (${storeBaseCurrency}) *`}
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            required
                            value={couponForm.discountValue}
                            onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>

                        {couponForm.discountType === "percentage" && (
                          <div>
                            <label className="block font-semibold text-neutral-700 mb-1">
                              Max Discount Cap ({storeBaseCurrency}, Optional)
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder="No limit"
                              value={couponForm.maxDiscountAmount}
                              onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 10% off for all summer orders"
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    {/* Minimum Subtotal & Minimum Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Min Cart Total ({storeBaseCurrency})
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 50 (auto-converts)"
                          value={couponForm.minCartTotal}
                          onChange={(e) => setCouponForm({ ...couponForm, minCartTotal: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Min Items in Bag</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 2"
                          value={couponForm.minItemQuantity}
                          onChange={(e) => setCouponForm({ ...couponForm, minItemQuantity: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Product Specific Restrictions */}
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Applicable Product IDs (Optional, comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 660f..., 660e... (applies ONLY to matching products)"
                        value={couponForm.applicableProductIds}
                        onChange={(e) => setCouponForm({ ...couponForm, applicableProductIds: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        If provided, discount will apply only to the total value of these specific items in bag.
                      </p>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Required Bundle Product IDs (Optional, comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. combo-item-1, combo-item-2"
                        value={couponForm.requiredProductIds}
                        onChange={(e) => setCouponForm({ ...couponForm, requiredProductIds: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Customer must have all these products in cart to unlock the coupon.
                      </p>
                    </div>

                    {/* Usage Caps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Max Total Uses (Global)</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="No limit"
                          value={couponForm.maxUses}
                          onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Max Uses Per Customer</label>
                        <input
                          type="number"
                          min="1"
                          value={couponForm.maxUsesPerUser}
                          onChange={(e) => setCouponForm({ ...couponForm, maxUsesPerUser: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Validity Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={couponForm.startDate}
                          onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">End Date (Expiration)</label>
                        <input
                          type="date"
                          value={couponForm.endDate}
                          onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={couponForm.isActive}
                          onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-[#c25d65] focus:ring-0"
                        />
                        <span className="font-semibold text-neutral-800">Coupon Active and Available for Checkout</span>
                      </label>
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0 bg-white/95 backdrop-blur-xs">
                    <button
                      type="button"
                      onClick={() => setIsCouponModalOpen(false)}
                      className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingCoupon}
                      className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-[#3d2b1f] hover:bg-[#281b13] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 text-center"
                    >
                      {isSavingCoupon ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
