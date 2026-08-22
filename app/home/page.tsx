import Link from "next/link";
import Image from "next/image";
import Wardrobe25D from "@/components/Wardrobe25D/Wardrobe25D";
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
      <div className="flex gap-4 justify-around py-3 bg-neutral-900 text-white text-xs uppercase tracking-widest">
        <Link href="/3dwood" className="hover:text-[#c88389]">
          Design with actual 3d
        </Link>
        <Link href="/" className="hover:text-[#c88389]">
          Redesign without 3d
        </Link>
      </div>

      {/* ── Hero Section ── */}
      <div id="hero-section" className="relative w-full h-[90vh] overflow-clip">
        <div className="absolute left-[10vh] top-1/3 z-10">
          <div className="text-7xl font-light">PRESS ON</div>
          <div className="text-7xl font-bold tracking-tight">
            ALWAYS PERFECT.
          </div>
          <div className="text-xl mt-4 tracking-widest uppercase text-neutral-300">
            PREMIUM PRESS ON NAILS • DESIGNED FOR YOU
          </div>
          <button className="mt-6 px-8 py-3.5 bg-[#c88389] hover:bg-[#b57379] text-white uppercase text-[13px] tracking-[0.12em] font-semibold transition-all duration-300 shadow-md">
            SHOP COLLECTION
          </button>
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

      {/* ── Section Title ── */}
      <div className="mt-28 text-center px-4">
        <p className="font-sans text-xs tracking-[0.25em] uppercase text-[#c88389] font-bold mb-2">
          Handcrafted Luxury Atelier
        </p>
        <h2 className="font-serif text-4xl md:text-5xl uppercase text-[#3d2b1f] tracking-wide">
          Explore Our Collections
        </h2>
      </div>

      {/* ── Interactive 2.5D Wardrobe Showcase ── */}
      <section className={styles.wardrobeSection} id="shop">
        <Wardrobe25D />
      </section>

      {/* ── Bestsellers Showcase ── */}
      <section className={styles.wardrobeSection} style={{ marginTop: "80px" }}>
        <WardrobeScroll products={BEST_SELLERS} headerText="BESTSELLERS" />
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
