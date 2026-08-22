"use client";

import Polaroid from "@/components/Polaroid/Polaroid";

const galleryItems = [
  { id: 1, rotate: "left-soft" as const },
  { id: 2, rotate: "none" as const },
  { id: 3, rotate: "right-soft" as const },
  { id: 4, rotate: "left-hard" as const },
  { id: 5, rotate: "right-hard" as const },
  { id: 6, rotate: "left-soft" as const },
];

export default function LovedByGirls() {
  return (
    <section className="py-12 px-4 text-center">
      <h2 className="text-2xl font-serif tracking-widest uppercase mb-10">
        Loved by Girls All Over the World
      </h2>

      <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-12 md:gap-4">
        {galleryItems.map((item) => (
          <Polaroid
            key={item.id}
            imageSrc=""
            rotate={item.rotate}
            className="w-full md:w-1/8 "
          />
        ))}
      </div>
    </section>
  );
}
