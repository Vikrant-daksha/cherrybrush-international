"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CiLock, CiMail } from "react-icons/ci";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials");
      }

      // Successfully authenticated, navigate to create product page
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf0f2] via-[#faf5f6] to-[#f5e6e8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-[#f0e0e5] shadow-[0_16px_56px_rgba(160,100,120,0.12)]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#fdf0f2] border border-[#e8c0c8] mb-4 shadow-sm">
            <span className="text-2xl">🍒</span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c88389] mb-1">
            Cherrybrush Portal
          </p>
          <h1 className="font-serif text-3xl font-normal text-[#3d2b1f] uppercase tracking-wide">
            Admin Access
          </h1>
          <p className="text-xs text-[#6b4f3a]/70 mt-1.5">
            Sign in with verified administrator credentials
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0604a]">
                <CiMail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cherrybrush.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e8c0c8]/80 bg-white/80 text-sm text-[#3d2b1f] placeholder:text-[#a0604a]/40 focus:outline-none focus:ring-2 focus:ring-[#c88389]/40 focus:border-[#c88389] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0604a]">
                <CiLock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e8c0c8]/80 bg-white/80 text-sm text-[#3d2b1f] placeholder:text-[#a0604a]/40 focus:outline-none focus:ring-2 focus:ring-[#c88389]/40 focus:border-[#c88389] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-[#c88389] text-white font-sans text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#b57278] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              "Sign In to Admin Portal"
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-[#f0e0e5]">
          <p className="text-xs text-[#6b4f3a]/80">
            Need an admin account?{" "}
            <a
              href="/admin/register"
              className="font-bold text-[#c88389] hover:underline"
            >
              Register Here →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
