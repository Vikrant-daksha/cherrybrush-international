"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
  FiShield,
  FiLogOut,
  FiSave,
  FiTruck,
  FiAlertCircle,
  FiChevronRight,
} from "react-icons/fi";

export default function ProfileClient() {
  const { user, mongoUser, loading: authLoading, openAuthModal, logout } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (user || mongoUser) {
      setName(mongoUser?.name || user?.displayName || "");
      setPhone(mongoUser?.phone || (user as any)?.phoneNumber || "");
      fetchProfileStats();
    }
  }, [user, mongoUser]);

  const fetchProfileStats = async () => {
    try {
      setLoadingProfile(true);
      const email = user?.email || mongoUser?.email || "";
      if (!email) return;

      const res = await fetch("/api/user/profile", {
        headers: {
          "x-user-email": email,
        },
      });
      const data = await res.json();
      if (data.success && data.profile) {
        if (data.profile.stats) {
          setStats(data.profile.stats);
        }
        if (data.profile.name) {
          setName(data.profile.name);
        }
        if (data.profile.phone) {
          setPhone(data.profile.phone);
        }
      }
    } catch (e) {
      console.warn("Could not load profile stats:", e);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const email = user?.email || mongoUser?.email || "";
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage("Profile details saved successfully.");
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf8] text-[#3d2b1f] font-sans antialiased pb-24">
      {/* ── Sticky Top Navbar ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#ebdcd5] shadow-2xs">
        <Navbar brandName="Cherrybrush" className="h-20" />
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#a0604a]/80 mb-3">
          <Link href="/" className="hover:text-[#c88389] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#3d2b1f]">Account Profile</span>
        </div>

        {/* ── UNAUTHENTICATED STATE ── */}
        {!authLoading && !user && !mongoUser && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#ebdcd5] text-center shadow-xs max-w-lg mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#fdf0f2] border border-[#f0c5d2] text-[#c88389] flex items-center justify-center mx-auto text-2xl">
              <FiUser className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-normal text-[#3d2b1f]">
              Sign in to manage your profile
            </h2>
            <p className="text-xs sm:text-sm text-[#7a6054]">
              Sign in to view your order history, manage your contact details, and enjoy an expedited luxury checkout experience.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="px-6 py-2.5 rounded-xl bg-[#3d2b1f] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* ── AUTHENTICATED PROFILE CONTENT ── */}
        {(user || mongoUser) && (
          <div className="space-y-8">
            {/* 1. Header Profile Banner Card */}
            <div className="bg-white rounded-3xl border border-[#ebdcd5] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Avatar */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#fdf0f2] border-2 border-[#e8c0c8] shadow-sm flex items-center justify-center text-2xl font-serif font-bold text-[#c88389] shrink-0">
                  {user?.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={name || "Avatar"}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{(name || user?.email || "C")[0].toUpperCase()}</span>
                  )}
                </div>

                {/* Profile Identity Details */}
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#3d2b1f]">
                      {name || "Customer"}
                    </h1>
                    {mongoUser?.role === "admin" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                        <FiShield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#7a6054] mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                    <FiMail className="w-3.5 h-3.5 text-[#a0604a]" />
                    <span>{user?.email || mongoUser?.email}</span>
                  </p>
                  {phone && (
                    <p className="text-xs text-[#7a6054] mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                      <FiPhone className="w-3.5 h-3.5 text-[#a0604a]" />
                      <span>{phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c88389] text-white text-xs font-semibold hover:bg-[#b57278] transition-all shadow-xs"
                >
                  <FiPackage className="w-3.5 h-3.5" />
                  <span>View Orders</span>
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all cursor-pointer"
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* 2. Order Statistics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/orders"
                className="bg-white p-5 rounded-2xl border border-[#ebdcd5] hover:border-[#c88389] transition-all shadow-2xs group flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7060]">
                    Total Orders
                  </p>
                  <p className="text-2xl font-serif font-normal text-[#3d2b1f] mt-1">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#fdf0f2] text-[#c88389] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiPackage className="w-5 h-5" />
                </div>
              </Link>

              <Link
                href="/orders"
                className="bg-white p-5 rounded-2xl border border-[#ebdcd5] hover:border-[#c88389] transition-all shadow-2xs group flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7060]">
                    In Transit / Active
                  </p>
                  <p className="text-2xl font-serif font-normal text-[#3d2b1f] mt-1">
                    {stats.activeOrders}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiTruck className="w-5 h-5" />
                </div>
              </Link>

              <Link
                href="/orders"
                className="bg-white p-5 rounded-2xl border border-[#ebdcd5] hover:border-[#c88389] transition-all shadow-2xs group flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7060]">
                    Delivered
                  </p>
                  <p className="text-2xl font-serif font-normal text-[#3d2b1f] mt-1">
                    {stats.completedOrders}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
              </Link>
            </div>

            {/* 3. Personal Information Form */}
            <div className="bg-white rounded-3xl border border-[#ebdcd5] p-6 sm:p-8 shadow-xs">
              <div className="border-b border-[#f5e6e8] pb-4 mb-6">
                <h3 className="font-serif text-xl font-normal text-[#3d2b1f]">
                  Personal Information
                </h3>
                <p className="text-xs text-[#7a6054] mt-0.5">
                  Update your contact details so we can keep you informed on your shipments.
                </p>
              </div>

              {message && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6b4f3a] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#ebdcd5] bg-[#faf5f6]/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c88389]"
                    />
                  </div>

                  {/* Email (Read-Only) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6b4f3a] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || mongoUser?.email || ""}
                      disabled
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#ebdcd5] bg-neutral-100 text-neutral-500 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-[#a0604a]/70 mt-1 block">
                      Synced with your authentication login
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="max-w-sm">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6b4f3a] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#ebdcd5] bg-[#faf5f6]/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c88389]"
                  />
                  <span className="text-[10px] text-[#a0604a]/70 mt-1 block">
                    Used for courier delivery updates
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3d2b1f] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    <FiSave className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 4. Quick Navigation Bar to Store & Admin */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#faf5f6] border border-[#f0c5d2]/60 text-xs">
              <div>
                <p className="font-bold text-[#3d2b1f]">Need to place a new order?</p>
                <p className="text-[11px] text-[#8a7060]">
                  Browse our handcrafted collections of luxury press-on sets.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/collection"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#ebdcd5] text-[#3d2b1f] hover:text-[#c88389] hover:bg-white font-semibold transition-all shadow-2xs"
                >
                  <span>Explore Catalog</span>
                  <FiChevronRight className="w-3.5 h-3.5" />
                </Link>
                {mongoUser?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3d2b1f] text-white font-semibold hover:bg-black transition-all shadow-2xs"
                  >
                    <FiShield className="w-3.5 h-3.5" />
                    <span>Admin Workspace</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
