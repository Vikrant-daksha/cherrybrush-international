"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CiLock, CiMail, CiUser } from "react-icons/ci";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create account");
      }

      setRegisteredSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf0f2] via-[#faf5f6] to-[#f5e6e8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-[#f0e0e5] shadow-[0_16px_56px_rgba(160,100,120,0.12)]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#fdf0f2] border border-[#e8c0c8] mb-3 shadow-sm">
            <span className="text-2xl">🍒</span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c88389] mb-1">
            Cherrybrush Portal
          </p>
          <h1 className="font-serif text-3xl font-normal text-[#3d2b1f] uppercase tracking-wide">
            Register Account
          </h1>
          <p className="text-xs text-[#6b4f3a]/70 mt-1">
            Create an account to be granted admin privileges
          </p>
        </div>

        {/* Success Modal / Banner */}
        {registeredSuccess ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-[#3d2b1f] space-y-4 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-xl mx-auto">
              🛡️
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900 mb-1">
                Account Created (Role: User)
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                For security, new accounts are created with standard privileges.
                <br />
                <strong className="block mt-2 text-[#3d2b1f] bg-white/80 p-2 rounded-lg border border-amber-200 font-mono text-[11px]">
                  👉 Set <span className="text-rose-600 font-bold">role: "admin"</span> in MongoDB for <strong>{email}</strong>
                </strong>
              </p>
            </div>
            <Link
              href="/admin/login"
              className="inline-block w-full py-3 rounded-xl bg-[#c88389] hover:bg-[#b57278] text-white text-xs font-bold uppercase tracking-wider shadow transition-all"
            >
              Go to Admin Login →
            </Link>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0604a]">
                    <CiUser className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Admin Name"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#e8c0c8]/80 bg-white/80 text-sm text-[#3d2b1f] placeholder:text-[#a0604a]/40 focus:outline-none focus:ring-2 focus:ring-[#c88389]/40 focus:border-[#c88389] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
                  Email Address
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
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#e8c0c8]/80 bg-white/80 text-sm text-[#3d2b1f] placeholder:text-[#a0604a]/40 focus:outline-none focus:ring-2 focus:ring-[#c88389]/40 focus:border-[#c88389] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
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
                    placeholder="Min 6 characters"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#e8c0c8]/80 bg-white/80 text-sm text-[#3d2b1f] placeholder:text-[#a0604a]/40 focus:outline-none focus:ring-2 focus:ring-[#c88389]/40 focus:border-[#c88389] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a0604a]">
                    <CiLock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#e8c0c8]/80 bg-white/80 text-sm text-[#3d2b1f] placeholder:text-[#a0604a]/40 focus:outline-none focus:ring-2 focus:ring-[#c88389]/40 focus:border-[#c88389] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-[#c88389] text-white font-sans text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:bg-[#b57278] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center pt-4 border-t border-[#f0e0e5]">
              <p className="text-xs text-[#6b4f3a]/80">
                Already registered?{" "}
                <Link
                  href="/admin/login"
                  className="font-bold text-[#c88389] hover:underline"
                >
                  Sign In Here →
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
