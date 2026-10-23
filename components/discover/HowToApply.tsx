"use client";

const steps = [
  { number: "01", label: "PREP" },
  { number: "02", label: "SIZE" },
  { number: "03", label: "APPLY" },
  { number: "04", label: "PRESS & HOLD" },
];

export default function HowToApply() {
  return (
    <section className="w-full overflow-hidden">
      <div className="w-full mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-10 bg-[#fddfdf]">
        {/* Left promo block */}
        <div className="w-full lg:w-auto lg:min-w-lg shrink-0 bg-[#f5c6c6] lg:rounded-r-xl py-12 lg:py-20 px-6 flex flex-col justify-center items-center gap-4 text-center">
          <p className="text-xs md:text-sm tracking-widest uppercase text-neutral-500 font-semibold">
            The Nail Ritual
          </p>
          <h3 className="font-serif text-3xl md:text-4xl lg:text-2xl text-neutral-800 leading-snug">
            Simple. Quick.
            <br />
            Beautiful.
          </h3>
          <button className="border border-neutral-700 text-xs tracking-widest uppercase px-6 py-2.5 md:text-sm md:px-5 md:py-2.5 lg:px-4 lg:py-2 w-fit hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer">
            Discover How
          </button>
        </div>

        {/* Steps: 2x2 grid on mobile, horizontal flex on desktop */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap justify-center items-center gap-6 sm:gap-10 lg:gap-16 flex-1 px-4 py-8 lg:py-0 w-full">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-2">
              <span className="text-xs tracking-widest text-neutral-400 font-bold">
                {step.number}
              </span>
              {/* Image placeholder */}
              <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-54 md:h-54 lg:w-48 lg:h-48 bg-black rounded-xl" />
              <span className="text-[11px] sm:text-xs tracking-widest uppercase text-neutral-600 font-medium text-center">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
