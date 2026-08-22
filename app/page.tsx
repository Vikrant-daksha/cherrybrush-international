import React from "react";
import Link from "next/link";
import Polaroid from "@/components/Polaroid/Polaroid";
import NailProductCard from "@/components/NailProductCard/NailProductCard";
import VerticalProductCard from "@/components/verticalProductCard/verticalProductCard";
import ChooseYourMood from "@/components/discover/ChooseYourMood";
import HowToApply from "@/components/discover/HowToApply";
import LovedByGirls from "@/components/discover/LovedByGirls";
import FAQ from "@/components/discover/FAQ";
import DragScrollContainer from "@/components/common/DragScrollContainer";
import MarqueeCarousel from "@/components/common/MarqueeCarousel";
import { connectDB } from "@/lib/db";
import Product from "@/lib/product.model";

interface ProductItem {
  isHero: boolean;
  isFeatured: boolean;
  _id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  collection: string;
  images: string[];
  lengths?: string[];
  sizes?: string[];
  colors?: { hex: string; label?: string }[];
  shapes?: string[];
  style?: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  packageType?: string;
}

async function getProducts(): Promise<ProductItem[]> {
  try {
    await connectDB();
    const docs = await Product.find({}).sort({ createdAt: -1 }).lean();
    return docs.map((doc: any) => ({
      _id: doc._id.toString(),
      name: doc.name || "",
      slug: doc.slug || doc._id.toString(),
      description: doc.description || "",
      price: doc.price || 0,
      collection: doc.collection || "Press-On Nails",
      images:
        doc.images && doc.images.length > 0 ? doc.images : ["/product.png"],
      lengths: doc.lengths || [],
      sizes: doc.sizes || [],
      colors: doc.colors || [],
      shapes: doc.shapes || [],
      style: doc.style || "",
      badge: doc.badge || "",
      rating: doc.rating ?? 5,
      reviewCount: doc.reviewCount ?? 0,
      isHero: doc.isHero || false,
      isFeatured: doc.isFeatured || false,
      packageType: doc.packageType || "",
    }));
  } catch (error) {
    console.error("Error fetching products from MongoDB:", error);
    return [];
  }
}

const Home = async () => {
  const products = await getProducts();
  const heroProduct = products?.find((p) => p.isHero);
  const heroProduct2 =
    products?.find((p) => p._id !== heroProduct?._id) || heroProduct;

  const featuredProducts = products?.filter((p) => p.isFeatured);
  const displayFeaturedProducts =
    featuredProducts && featuredProducts.length > 0
      ? featuredProducts
      : products;

  const heroHref1 = heroProduct
    ? `/collection/${heroProduct.slug || heroProduct._id}`
    : "/collection";
  const heroHref2 = heroProduct2
    ? `/collection/${heroProduct2.slug || heroProduct2._id}`
    : "/collection";

  return (
    <>
      {/* ── Hero Section ── */}
      <div
        id="hero-section"
        className="relative w-full min-h-[85vh] md:h-[85vh] select-none overflow-hidden flex flex-col md:flex-row"
      >
        {/* Text and Button Container */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 text-white z-10 relative py-12 md:py-0">
          <h1 className="font-serif text-5xl md:text-8xl font-light leading-[1.12]">
            <div className="-mb-4">Made to</div>
            <div className="-mb-4">Match</div>
            <div className="-mb-4">Every</div>
            <div className="-mb-4">Version</div>
            <div className="-mb-4">of You.</div>
          </h1>

          <p className="font-sans text-md md:text-xl text-white/90 tracking-wide mt-8 leading-relaxed font-normal">
            Effortless nails.
            <br />
            Endless compliments.
          </p>

          <div className="flex flex-row flex-wrap gap-4 mt-8">
            <Link
              href={heroHref1}
              className="px-6 py-3.5 bg-[#c88389] hover:bg-[#b57379] text-white uppercase text-[14px] tracking-[0.08em] font-semibold transition-all duration-300 shadow-md inline-block"
            >
              Shop Featured Set
            </Link>
            <Link
              href="/collection"
              className="px-6 py-3.5 border border-white/30 hover:border-white/60 hover:bg-white/10 text-white uppercase text-[14px] tracking-[0.08em] font-semibold transition-all duration-300 inline-block"
            >
              Explore Collection
            </Link>
          </div>
        </div>

        {/* Dynamic Clickable Hero Polaroid Showcase */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center z-10 relative">
          <img
            src="sample_processed.png"
            alt="Hero Background"
            loading="eager"
            className="absolute object-contain h-full right-42 top-24 z-10 filter drop-shadow-[0_20px_45px_rgba(61,43,31,0.42)] pointer-events-none"
          />

          {/* Top Polaroid (Clickable -> Product Page 1) */}
          <Link
            href={heroHref1}
            className="absolute top-32 right-48 group hover:scale-100 transition-transform duration-300"
          >
            <Polaroid
              imageSrc={heroProduct?.images?.[0] || "/product.png"}
              imageAlt={heroProduct?.name || "Cherry Satin"}
              caption={heroProduct?.name || "Cherry Satin"}
              rotate="left-hard"
              className="w-78"
            />
          </Link>

          {/* Bottom Polaroid (Clickable -> Product Page 2) */}
          <Link
            href={heroHref2}
            className="absolute bottom-14 right-40 group hover:scale-100 transition-transform duration-300"
          >
            <Polaroid
              imageSrc={heroProduct2?.images?.[0] || "/product.png"}
              imageAlt={heroProduct2?.name || "Cherry Satin"}
              caption={heroProduct2?.name || "Cherry Satin"}
              rotate="right-soft"
              className="w-78"
            />
          </Link>
        </div>
      </div>

      <section>
        <ChooseYourMood />
      </section>

      {/* ── Section 1: End-to-End Marquee Carousel + Floating Side Arrows ── */}
      <section className="py-16 bg-[#fafaf7] overflow-hidden">
        <div className="px-8 md:px-16 mb-8 flex items-end justify-between">
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#c88389] font-semibold mb-1">
              Handcrafted with love
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-[#3d2b1f] tracking-wide">
              Featured Sets
            </h2>
          </div>
          <button className="font-sans text-xs tracking-widest uppercase text-[#a88a6a] hover:text-[#3d2b1f] transition-colors border-b border-[#a88a6a]/40 hover:border-[#3d2b1f]/40 pb-0.5">
            View All
          </button>
        </div>

        <MarqueeCarousel speed={0.8} className="px-20">
          {displayFeaturedProducts?.map((p) => (
            <div
              key={p._id}
              className="flex-shrink-0 w-[88vw] sm:w-[580px] md:w-[680px] lg:w-[740px] aspect-[1.65/1] transition-transform hover:-translate-y-1 block"
            >
              <NailProductCard
                href={`/collection/${p.slug || p._id}`}
                imageSrc={p.images?.[0] || "/product.png"}
                name={p.name}
                collection={p.collection}
                style={p?.style}
                description={p.description}
                shapes={p?.shapes}
                nailSizes={p?.sizes}
                lengths={p?.lengths}
                price={`₹${p.price}`}
                badge={p?.badge}
                rating={p?.rating ?? 4.5}
                reviewCount={p?.reviewCount ?? 0}
                packageType={p?.packageType}
                colors={p.colors || []}
                extraColorsCount={
                  (p.colors?.length || 0) > 4 ? (p.colors?.length || 0) - 4 : 0
                }
              />
            </div>
          ))}
        </MarqueeCarousel>
      </section>

      {/* ── Section 2: Touch Drag + Floating Side Arrows (25 Products) ── */}
      <section className="py-12 bg-[#fdfaf8]">
        <div className="px-8 md:px-16 mb-8 flex items-end justify-between">
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#c88389] font-semibold mb-1">
              Popular Picks
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-[#3d2b1f] tracking-wide">
              Trending Designs
            </h2>
          </div>
          <button className="font-sans text-xs tracking-widest uppercase text-[#a88a6a] hover:text-[#3d2b1f] transition-colors border-b border-[#a88a6a]/40 hover:border-[#3d2b1f]/40 pb-0.5">
            Explore All
          </button>
        </div>

        <DragScrollContainer className="flex gap-6 pb-4 px-8 md:px-16">
          {products?.slice(0, 25).map((p) => (
            <div
              key={p._id}
              className="w-72 flex-shrink-0 block transition-transform hover:-translate-y-1"
            >
              <VerticalProductCard
                href={`/collection/${p.slug || p._id}`}
                imageSrc={p.images?.[0] || "/product.png"}
                imageAlt={p.name}
                name={p.name}
                collection={p.collection}
                style={p?.style}
                description={p.description}
                shapes={p?.shapes}
                lengths={p?.lengths}
                sizes={p?.sizes}
                price={`₹${p.price}`}
                badge={p?.badge}
                rating={p?.rating ?? 5}
                reviewCount={p?.reviewCount ?? 0}
                packageType={p?.packageType}
                colors={p.colors || []}
                extraColorsCount={
                  (p.colors?.length || 0) > 2 ? (p.colors?.length || 0) - 2 : 0
                }
              />
            </div>
          ))}
        </DragScrollContainer>
      </section>

      {/* ── Additional Sections ── */}
      <section>
        <HowToApply />
      </section>
      <section>
        <LovedByGirls />
      </section>
      <section>
        <FAQ />
      </section>
    </>
  );
};

export default Home;
