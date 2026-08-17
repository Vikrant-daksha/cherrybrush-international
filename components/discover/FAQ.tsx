"use client";

import React, { useState } from "react";
import Image from "next/image";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How long do CherryBrush Press-Ons last?",
    answer: "When applied with our premium nail glue, they can last up to 2-3 weeks. For temporary wear (3-5 days), use our high-durability adhesive tabs, which are perfect for weekend events or changing looks quickly.",
  },
  {
    question: "Are the nails reusable?",
    answer: "Yes! CherryBrush press-on nails are designed for multiple uses. If removed gently (using warm water, soap, and oil), any dried glue residue can be gently buffed off the back of the nail, making them ready for your next application.",
  },
  {
    question: "How do I find my perfect nail size?",
    answer: "Every CherryBrush set includes 24 premium nails in 12 different sizes to ensure a perfect fit for any nail shape. No measuring is required, though you can use our sizing card for reference.",
  },
  {
    question: "Will press-ons damage my natural nails?",
    answer: "Not at all! Unlike traditional salon acrylics or gels that require harsh drilling and acetone soaking, CherryBrush press-ons apply with non-toxic glue and lift away gently without stripping your natural nail layers.",
  },
  {
    question: "What is included in each CherryBrush kit?",
    answer: "Each box comes with a complete application kit containing 24 premium nails, dual-sided adhesive tabs, professional nail glue, a wooden prep stick, a mini nail buffer/file, and prep pads.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#fafaf7] py-20 px-4 md:px-8 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-24">
        
        {/* ── PART 1: WHY PRESS-ONS COMPARISON BLOCK ── */}
        <div className="flex flex-col lg:flex-row items-center bg-[#fafaf7] rounded-3xl overflow-hidden border border-[#6b4f3a]/15 shadow-[0_4px_24px_rgba(107,79,58,0.03)]">
          {/* Left image with elegant curve matching the visual design */}
          <div className="w-full lg:w-2/5 h-[350px] lg:h-[480px] relative overflow-hidden shrink-0">
            <Image
              src="/sample_processed.png"
              alt="Elegant Hand with CherryBrush Nails"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-left-top"
            />
            {/* Soft pink overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#fafaf7]/10" />
          </div>

          {/* Right Comparison Grid */}
          <div className="w-full lg:w-3/5 p-8 md:p-14 flex flex-col justify-center">
            <h2 className="font-serif text-3xl md:text-4xl text-[#3d2b1f] tracking-widest uppercase mb-12 text-center lg:text-left">
              Why Press-Ons?
            </h2>

            <div className="relative flex flex-col md:flex-row justify-between items-stretch gap-8 md:gap-4">
              
              {/* Left Column: CherryBrush Press Ons */}
              <div className="flex-1 flex flex-col gap-6 text-center md:text-left">
                <h3 className="font-sans text-xs tracking-[0.2em] font-semibold text-[#c88389] uppercase">
                  CherryBrush Press Ons
                </h3>
                <ul className="flex flex-col gap-4 font-sans text-sm text-[#3d2b1f]">
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c88389]" />
                    Salon quality
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c88389]" />
                    Reusable
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c88389]" />
                    Gentle on nails
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c88389]" />
                    Affordable
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c88389]" />
                    Apply in minutes
                  </li>
                </ul>
              </div>

              {/* Vertical Divider with VS Circle */}
              <div className="relative flex flex-row md:flex-col justify-center items-center py-4 md:py-0 shrink-0">
                <div className="absolute h-[1px] w-full md:w-[1px] md:h-full bg-[#6b4f3a]/15" />
                <div className="relative z-10 w-9 h-9 rounded-full bg-[#f5efe0] border border-[#6b4f3a]/10 flex items-center justify-center font-serif text-[11px] italic tracking-widest text-[#8a7060] font-medium shadow-sm">
                  VS.
                </div>
              </div>

              {/* Right Column: Salon Nails */}
              <div className="flex-1 flex flex-col gap-6 text-center md:text-left md:pl-8">
                <h3 className="font-sans text-xs tracking-[0.2em] font-semibold text-[#8a7060] uppercase">
                  Salon Nails
                </h3>
                <ul className="flex flex-col gap-4 font-sans text-sm text-[#8a7060]">
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a7060]/40" />
                    Expensive
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a7060]/40" />
                    Time consuming
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a7060]/40" />
                    Can damage nails
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a7060]/40" />
                    High maintenance
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8a7060]/40" />
                    Hours at the salon
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* ── PART 2: FAQ DROPDOWN ACCORDIONS ── */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#c88389] font-semibold mb-2">
              Got Questions?
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-[#3d2b1f] tracking-wide">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col border-t border-[#6b4f3a]/15">
            {faqData.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="border-b border-[#6b4f3a]/15 transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full py-6 flex items-center justify-between text-left group hover:text-[#c88389] transition-colors"
                  >
                    <span className="font-sans text-sm md:text-base font-medium text-[#3d2b1f] group-hover:text-[#c88389] transition-colors">
                      {item.question}
                    </span>
                    <span className="ml-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-[#6b4f3a]/10 group-hover:border-[#c88389]/30 transition-colors">
                      <svg
                        className={`w-3 h-3 text-[#3d2b1f] group-hover:text-[#c88389] transform transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 12 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 1v10M1 6h10"
                        />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isOpen ? "max-h-56 opacity-100 pb-6" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <p className="font-sans text-xs md:text-sm text-[#8a7060] leading-relaxed pr-8">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
