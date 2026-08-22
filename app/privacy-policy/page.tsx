import React from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";
import { FiShield, FiRefreshCw, FiLock, FiMail } from "react-icons/fi";

export const metadata = {
  title: "Privacy & No Return Policy | CherryBrush",
  description:
    "Read CherryBrush privacy practices and our strict no-return policy for hygienic handcrafted press-on nails.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-6 md:px-12 lg:px-16 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#c88389] font-bold mb-2">
            Store Terms & Privacy Standards
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-[#3d2b1f] tracking-wide">
            Privacy & Return Policy
          </h1>
          <p className="font-sans text-xs text-[#8a7060] mt-2">
            Last Updated: August 2026
          </p>
        </div>

        {/* 🚨 Highlighted NO RETURN POLICY Alert Banner */}
        <div className="mb-10 p-6 rounded-3xl bg-[#fdf0f2] border border-[#e8c0c8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c88389] text-white flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
            <FiRefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-normal text-[#3d2b1f]">
              Strict No-Return & No-Exchange Policy
            </h2>
            <p className="font-sans text-xs text-[#6b4f3a] mt-1 leading-relaxed">
              Due to strict sanitary, hygiene, and health safety regulations regarding personal cosmetics and wear, <strong>all sales of NAILÉ press-on nail sets are strictly final</strong>. We do not accept returns, refunds, or exchanges once an order has shipped. Please review your nail sizes carefully before ordering.
            </p>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl border border-[#e8c0c8]/60 p-8 md:p-12 shadow-xs space-y-10 text-[#3d2b1f] font-sans text-sm leading-relaxed">
          {/* Section 1: Overview */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FiShield className="text-[#c88389] w-5 h-5" />
              <h3 className="font-serif text-2xl font-normal text-[#3d2b1f]">
                1. Data Privacy & Information Collection
              </h3>
            </div>
            <p className="text-xs text-[#6b4f3a] leading-relaxed">
              At NAILÉ, we treat your personal information with utmost care. When you make a purchase or browse our website, we collect personal details provided by you such as your name, shipping address, email address, phone number, and payment confirmation.
            </p>
          </section>

          <hr className="border-[#e8c0c8]/40" />

          {/* Section 2: Order Processing */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FiLock className="text-[#c88389] w-5 h-5" />
              <h3 className="font-serif text-2xl font-normal text-[#3d2b1f]">
                2. How We Use Your Information
              </h3>
            </div>
            <p className="text-xs text-[#6b4f3a] leading-relaxed">
              Your information is used strictly to fulfill your handcrafted orders, process payments, arrange delivery, and communicate tracking updates. We never sell, rent, or trade your personal data to third parties.
            </p>
          </section>

          <hr className="border-[#e8c0c8]/40" />

          {/* Section 3: Damaged Items */}
          <section>
            <h3 className="font-serif text-2xl font-normal text-[#3d2b1f] mb-3">
              3. Damaged or Defective Items
            </h3>
            <p className="text-xs text-[#6b4f3a] leading-relaxed">
              While we strictly enforce a no-return policy for hygiene reasons, if your item arrives physically damaged or defective, please contact us within 48 hours of delivery at <a href="mailto:support@cherrybrush.com" className="text-[#c88389] font-bold underline">support@cherrybrush.com</a> with photo proof. We will inspect and arrange a free replacement if verified.
            </p>
          </section>

          <hr className="border-[#e8c0c8]/40" />

          {/* Section 4: Contact */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FiMail className="text-[#c88389] w-5 h-5" />
              <h3 className="font-serif text-2xl font-normal text-[#3d2b1f]">
                4. Questions & Support
              </h3>
            </div>
            <p className="text-xs text-[#6b4f3a] leading-relaxed">
              If you have any questions regarding our Privacy Policy or order guidelines, feel free to reach out to our customer care team at any time.
            </p>
            <div className="mt-4">
              <Link
                href="/#contact"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#c88389] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#b57379] transition-all shadow-xs"
              >
                Contact Customer Care
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
