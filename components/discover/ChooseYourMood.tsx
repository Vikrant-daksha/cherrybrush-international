"use client";

const moods = [
  { label: "SOFT GIRL" },
  { label: "CLEAN GIRL" },
  { label: "COQUETTE" },
  { label: "IT GIRL" },
  { label: "DATE NIGHT" },
  { label: "MAIN CHARACTER" },
];

export default function ChooseYourMood() {
  return (
    <section className="py-12 px-4 text-center">
      <h2 className="text-2xl font-serif tracking-widest uppercase mb-1">
        Choose Your Mood
      </h2>
      <p className="text-sm text-neutral-400 mb-10">
        What are you feeling today?
      </p>

      <div className="flex flex-wrap justify-center gap-6">
        {moods.map((mood) => (
          <div
            key={mood.label}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            {/* Arch-shaped image placeholder */}
            <div
              className="w-56 h-72 bg-neutral-200 overflow-hidden transition-transform duration-300 group-hover:-translate-y-1"
              style={{ borderRadius: "9999px 9999px 1000px 1000px" }}
            />
            <span className="text-xs tracking-widest uppercase text-neutral-600">
              {mood.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
