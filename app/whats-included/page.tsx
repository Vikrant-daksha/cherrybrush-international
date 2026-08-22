import React from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Link from "next/link";
import { FiCheckCircle, FiPackage, FiInfo, FiArrowRight } from "react-icons/fi";

export const metadata = {
  title: "What's Included in Your Set | CherryBrush",
  description:
    "Explore what comes inside your CherryBrush Press-On package: Basic Set, Normal Set (12 Nails), or Nail-Only Set.",
};

export default function WhatsIncludedPage() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-6 md:px-12 lg:px-16 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#c88389] font-bold mb-2">
            Package Breakdown & Options
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-[#3d2b1f] tracking-wide">
            What's Included in Your Set?
          </h1>
          <p className="font-sans text-xs text-[#8a7060] mt-2 max-w-lg mx-auto leading-relaxed">
            Every NAILÉ press-on set is crafted with luxury standards. Choose from our 3 package tiers based on your application needs.
          </p>
        </div>

        {/* ── 3 Set Tier Cards Breakdown ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Tier 1: Basic Set */}
          <div className="bg-white rounded-3xl border border-[#e8c0c8] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-[#fdf0f2] text-[#c88389] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl border-b border-l border-[#e8c0c8]">
              Includes Prep Tools
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#fdf0f2] border border-[#e8c0c8] text-[#c88389] flex items-center justify-center text-xl mb-4">
                <FiPackage />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#3d2b1f] mb-1">
                Basic Set
              </h3>
              <p className="font-sans text-xs text-[#8a7060] mb-6">
                Complete prep kit + press-on nails for first-time wearers.
              </p>

              <div className="space-y-3 font-sans text-xs text-[#3d2b1f] border-t border-[#e8c0c8]/40 pt-4">
                <p className="font-bold text-[11px] uppercase tracking-wider text-[#c88389]">
                  What's Inside:
                </p>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Handcrafted Press-On Nails</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Nail Glue & Adhesive Tabs</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Mini Nail File & Buffer</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Wooden Cuticle Pusher</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Alcohol Prep Wipes</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#e8c0c8]/40">
              <Link
                href="/collection"
                className="w-full py-2.5 rounded-xl bg-[#fdf0f2] hover:bg-[#f0e0e5] text-[#c88389] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-[#e8c0c8]"
              >
                <span>Browse Basic Sets</span>
                <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* Tier 2: Normal Set (12 Nails) */}
          <div className="bg-[#fdf0f2]/60 rounded-3xl border-2 border-[#c88389] p-8 shadow-md flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-[#c88389] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
              Most Popular
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#c88389] text-white flex items-center justify-center text-xl mb-4 shadow-sm">
                ✨
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#3d2b1f] mb-1">
                Normal Set (12 Nails)
              </h3>
              <p className="font-sans text-xs text-[#8a7060] mb-6">
                Standard 12-piece nail set + complete salon application kit.
              </p>

              <div className="space-y-3 font-sans text-xs text-[#3d2b1f] border-t border-[#e8c0c8] pt-4">
                <p className="font-bold text-[11px] uppercase tracking-wider text-[#c88389]">
                  What's Inside:
                </p>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span><strong>12 Custom Nails</strong> (Extra sizing backup)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Full Application Prep Kit</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Professional Long-Wear Glue</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Nail Buffer & Cuticle Stick</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Step-by-step Application Guide</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#e8c0c8]">
              <Link
                href="/collection"
                className="w-full py-2.5 rounded-xl bg-[#c88389] hover:bg-[#b57379] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Browse Normal Sets</span>
                <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* Tier 3: Nail-Only Set */}
          <div className="bg-white rounded-3xl border border-[#e8c0c8] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-neutral-100 text-[#8a7060] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl border-b border-l border-[#e8c0c8]">
              Nails Only
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#fafaf7] border border-[#e8c0c8] text-[#8a7060] flex items-center justify-center text-xl mb-4">
                💅
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#3d2b1f] mb-1">
                Nail-Only Set
              </h3>
              <p className="font-sans text-xs text-[#8a7060] mb-6">
                Press-On Nails ONLY. Ideal if you already have your own prep tools.
              </p>

              <div className="space-y-3 font-sans text-xs text-[#3d2b1f] border-t border-[#e8c0c8]/40 pt-4">
                <p className="font-bold text-[11px] uppercase tracking-wider text-[#c88389]">
                  What's Inside:
                </p>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#c88389] w-4 h-4 flex-shrink-0" />
                  <span>Handcrafted Press-On Nails</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <span className="text-red-400 font-bold">✕</span>
                  <span className="line-through text-neutral-400">No Glue or Prep Tools Included</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <span className="text-red-400 font-bold">✕</span>
                  <span className="line-through text-neutral-400">No Mini File or Buffer</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#e8c0c8]/40">
              <Link
                href="/collection"
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#fafaf7] text-[#3d2b1f] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-[#e8c0c8]"
              >
                <span>Browse Nail-Only Sets</span>
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-6 rounded-3xl bg-white border border-[#e8c0c8]/60 shadow-xs flex items-center gap-4">
          <FiInfo className="w-6 h-6 text-[#c88389] flex-shrink-0" />
          <p className="font-sans text-xs text-[#6b4f3a] leading-relaxed">
            Need help deciding? Contact customer support or read our{" "}
            <Link href="/privacy-policy" className="text-[#c88389] font-bold underline">
              Privacy & No-Return Policy
            </Link>{" "}
            for store terms.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
