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
    answer:
      "When applied with our premium nail glue, they can last up to 2-3 weeks. For temporary wear (3-5 days), use our high-durability adhesive tabs, which are perfect for weekend events or changing looks quickly.",
  },
  {
    question: "Are the nails reusable?",
    answer:
      "Yes! CherryBrush press-on nails are designed for multiple uses. If removed gently (using warm water, soap, and oil), any dried glue residue can be gently buffed off the back of the nail, making them ready for your next application.",
  },
  {
    question: "How do I find my perfect nail size?",
    answer:
      "Every CherryBrush set includes 24 premium nails in 12 different sizes to ensure a perfect fit for any nail shape. No measuring is required, though you can use our sizing card for reference.",
  },
  {
    question: "Will press-ons damage my natural nails?",
    answer:
      "Not at all! Unlike traditional salon acrylics or gels that require harsh drilling and acetone soaking, CherryBrush press-ons apply with non-toxic glue and lift away gently without stripping your natural nail layers.",
  },
  {
    question: "What is included in each CherryBrush kit?",
    answer:
      "Each box comes with a complete application kit containing 24 premium nails, dual-sided adhesive tabs, professional nail glue, a wooden prep stick, a mini nail buffer/file, and prep pads.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#fafaf7] select-none">
      <div className="w-full flex flex-col gap-24">
        {/* ── PART 1: WHY PRESS-ONS COMPARISON BLOCK ── */}
        <div className="flex flex-col lg:flex-row items-center bg-[#fafaf7] py-20 overflow-hidden border-t border-t-[#6b4f3a]/15 shadow-[0_4px_24px_rgba(107,79,58,0.03)]">
          {/* Left image with elegant curve matching the visual design */}
          <div className="w-full lg:w-2/5 h-[350px] lg:h-[480px] relative overflow-hidden shrink-0">
            <Image
              src="/sample_processed.png"
              alt="Elegant Hand with CherryBrush Nails"
              unoptimized
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
            <div className="grid grid-cols-3 justify-center items-center text-xs sm:text-sm font-monstrat tracking-[0.10rem]">
              <div className="">
                <div className="text-xl mb-6">Our Press Ons</div>
                <div className="mb-3">Salon quality</div>
                <div className="mb-3">Reusable</div>
                <div className="mb-3">Gentle on nails</div>
                <div className="mb-3">Affordable</div>
                <div className="mb-3">Apply in minutes</div>
              </div>
              <div className="self-stretch relative flex items-center justify-center">
                {/* Full-height vertical line touching top and bottom */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#f0c5d2]" />

                {/* Soft pastel VS badge */}
                <div className="relative z-10 w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#fae4e8] border border-[#f0c5d2]/60 flex items-center justify-center font-serif italic text-xs md:text-sm tracking-wider text-[#a85a6a] shadow-sm">
                  vs.
                </div>
              </div>
              <div>
                <div className="text-xl mb-6">Other</div>
                <div className="mb-3">Expensive</div>
                <div className="mb-3">Time consuming</div>
                <div className="mb-3">Can damage nails</div>
                <div className="mb-3">High maintenance</div>
                <div className="mb-3">Hours at the salon</div>
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
                      isOpen
                        ? "max-h-56 opacity-100 pb-6"
                        : "max-h-0 opacity-0 pointer-events-none"
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
