import Link from "next/link";
import Image from "next/image";
import CustomWardrobe from "@/components/CustomWardrobe/CustomWardrobe";
import WardrobeScroll from "@/components/WardrobeScroll/WardrobeScroll";
import styles from "../page.module.css";

const BEST_SELLERS = [
  { name: "Oud Royale", price: "$280" },
  { name: "Silk Jasmine", price: "$165" },
  { name: "Sandalwood Warm", price: "$195" },
  { name: "Velvet Amber", price: "$210" },
  { name: "Noir Neroli", price: "$175" },
  { name: "Royal Patchouli", price: "$225" },
  { name: "Bitter Oud", price: "$290" },
  { name: "Soleil Musc", price: "$205" },
  { name: "White Wood", price: "$185" },
  { name: "Gold Leather", price: "$240" },
];

const TRENDING = [
  { name: "Sweet Peach", price: "$270" },
  { name: "Citrus Bergamot", price: "$150" },
  { name: "Amber Wood", price: "$230" },
  { name: "Vanilla Spice", price: "$195" },
  { name: "Rose Damas", price: "$250" },
  { name: "Fucking Fabulous", price: "$320" },
  { name: "Neroli Blossom", price: "$180" },
  { name: "Tobacco Gold", price: "$240" },
  { name: "Musk Imperial", price: "$215" },
  { name: "Saffron Oud", price: "$295" },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      <div className="flex gap-4 justify-around py-4 bg-neutral-900 text-white text-xs uppercase tracking-widest">
        <Link href="/" className="hover:text-[#c88389]">
          Design with no 3d
        </Link>
        <Link href="/" className="hover:text-[#c88389]">
          Redesign without 3d
        </Link>
      </div>
      <div id="hero-section" className="relative w-full h-[90vh] overflow-clip">
        <div className="absolute left-[10vh] top-1/3 z-10">
          <div className="text-7xl">PRESS ON</div>

          <div className="text-7xl">ALWAYS PERFECT.</div>
          <div className="text-xl">PREMIUM PRESS ON NAILS.</div>
          <div className="text-xl">DESIGNED FOR YOU.</div>
          <button className="mt-6 p-5 border border-amber-950">
            SHOP COLLECTION
          </button>
          <div className="text-xl "></div>
        </div>
        <Image
          src="/hero-white.png"
          alt="CherryBrush Luxury Hero"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="mt-80 text-center">
        <div className="uppercase text-5xl">EXPLORE OUR COLLECTIONS</div>
      </div>
      {/* ── Interactive Wardrobe Showcase ── */}
      <section className={styles.wardrobeSection} id="shop">
        <CustomWardrobe />
      </section>

      {/* ── Bestsellers Showcase ── */}
      <section className={styles.wardrobeSection} style={{ marginTop: "80px" }}>
        <WardrobeScroll products={BEST_SELLERS} />
      </section>

      {/* ── Trending Showcase ── */}
      <section
        className={styles.wardrobeSection}
        style={{ marginTop: "80px", marginBottom: "80px" }}
      >
        <WardrobeScroll products={TRENDING} headerText="TRENDING NOW" />
      </section>
    </main>
  );
}
