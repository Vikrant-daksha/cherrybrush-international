"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function SignUpPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/");
    } else {
      openAuthModal("signup");
    }
  }, [user, openAuthModal, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-[#3d2b1f] mb-2">Create Your Account</h1>
      <p className="text-sm text-[#8a7060] mb-6">Opening registration form...</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#c88389] hover:underline"
      >
        <FiArrowLeft className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
}
