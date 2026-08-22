"use client";

const steps = [
  { number: "01", label: "PREP" },
  { number: "02", label: "SIZE" },
  { number: "03", label: "APPLY" },
  { number: "04", label: "PRESS & HOLD" },
];

export default function HowToApply() {
  return (
    <section className="w-full">
      <div className="w-full mx-auto flex flex-col md:flex-row items-center gap-10 bg-[#fddfdf]">
        {/* Left promo block */}
        <div className="shrink-0 bg-[#f5c6c6] rounded-br-xl rounded-tr-xl py-20 flex flex-col justify-center items-center gap-4 min-w-lg">
          <p className="text-md md:text-xs tracking-widest uppercase text-neutral-500">
            The Nail Ritual
          </p>
          <h3 className="font-serif text-4xl md:text-2xl text-neutral-800 leading-snug">
            Simple. Quick.
            <br />
            Beautiful.
          </h3>
          <button className="border border-neutral-700 text-xs tracking-widest uppercase px-8 py-4 md:px-4 md:py-2 w-fit hover:bg-neutral-800 hover:text-white transition-colors">
            Discover How
          </button>
        </div>

        {/* Steps */}
        <div className="flex flex-wrap justify-center gap-10 sm:gap-28 flex-1 pb-10 md:pb-0">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-2">
              <span className="text-xs tracking-widest text-neutral-400">
                {step.number}
              </span>
              {/* Image placeholder */}
              <div className="w-80 h-80 md:w-48 md:h-48 bg-black rounded-lg" />
              <span className="text-xs tracking-widest uppercase text-neutral-600">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
