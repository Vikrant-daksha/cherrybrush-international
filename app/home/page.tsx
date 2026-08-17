"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Polaroid from "@/components/Polaroid/Polaroid";
import NailProductCard from "@/components/NailProductCard/NailProductCard";
import ChooseYourMood from "@/components/discover/ChooseYourMood";
import HowToApply from "@/components/discover/HowToApply";
import LovedByGirls from "@/components/discover/LovedByGirls";
import FAQ from "@/components/discover/FAQ";
import VerticalProductCard from "@/components/verticalProductCard/verticalProductCard";

type Prouct = {
  name: string;
  image: string;
  price: string;
};

const Home = () => {
  const [spikesCount, setSpikesCount] = useState(30);
  const [spikeSize, setSpikeSize] = useState(1.5);
  const [spikeyEnabled, setSpikeyEnabled] = useState(true);

  return (
    <>
      <div
        id="hero-section"
        className="relative w-full min-h-[85vh] md:h-[85vh] select-none overflow-hidden flex flex-col md:flex-row"
      >
        <div className="flex gap-4 justify-around py-2 px-4 bg-neutral-900/80 text-white text-xs uppercase tracking-widest absolute top-4 left-4 z-50 rounded-lg">
          <Link href="/3dwood" className="hover:text-[#c88389]">Design with actual 3d</Link>
          <Link href="/" className="hover:text-[#c88389]">Design without 3d</Link>
        </div>
        {/* Text and Button Container - Width Halfed */}
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
            <button className="px-6 py-3.5 bg-[#c88389] hover:bg-[#b57379] text-white uppercase text-[14px] tracking-[0.08em] font-semibold transition-all duration-300 shadow-md">
              Shop Collection
            </button>
            <button className="px-6 py-3.5 border border-white/30 hover:border-white/60 hover:bg-white/10 text-white uppercase text-[14px] tracking-[0.08em] font-semibold transition-all duration-300">
              Find Your Set
            </button>
          </div>
        </div>

        {/* Polaroid Container - Width Halfed & Centered */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center z-10 relative">
          <Image
            src="/sample_processed.png"
            alt="Hero Background"
            width={480}
            height={600}
            priority
            className="absolute object-contain h-full right-42 top-24 z-10 filter drop-shadow-[0_20px_45px_rgba(61,43,31,0.42)]"
          />
          <div className="absolute top-32 right-48 z-0">
            <Polaroid
              imageSrc="/product.png"
              imageAlt="Signature Cherry Brush Nail Set"
              caption="Cherry Satin"
              rotate="left-hard"
              className="w-78"
            />
          </div>
          <div className="absolute bottom-14 right-40 z-4">
            <Polaroid
              imageSrc="/product.png"
              imageAlt="Signature Cherry Brush Nail Set"
              caption="Cherry Satin"
              rotate="right-soft"
              className="w-78"
            />
          </div>
        </div>
      </div>

      <section>
        <ChooseYourMood />
      </section>
      {/* Polaroid Showcase Section */}
      {/* <section className="py-20 px-8 bg-[#fafaf7] flex flex-col items-center"> */}
      {/* <h2 className="font-serif text-3xl md:text-5xl font-light text-[#3d2b1f] mb-2 tracking-wide text-center">
          Curated Favorites
        </h2>
        <p className="font-sans text-xs text-[#8a7060] tracking-widest uppercase mb-12">
          Handcrafted Press-Ons
        </p> */}

      {/* Dynamic Spikey Customizer Controls */}
      {/* <div className="mb-16 p-6 md:p-8 bg-[#f5efe0]/45 border border-[#6b4f3a]/10 rounded-xl max-w-xl w-full flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#6b4f3a]/10 pb-4">
            <h3 className="font-serif text-lg font-medium text-[#3d2b1f]">Paper Edge Customizer</h3>
            <button
              onClick={() => setSpikeyEnabled(!spikeyEnabled)}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest rounded-full transition-all duration-300 font-semibold border ${
                spikeyEnabled
                  ? "bg-[#6b4f3a] text-[#fafaf7] border-[#6b4f3a]"
                  : "bg-transparent text-[#6b4f3a] border-[#6b4f3a]/30 hover:border-[#6b4f3a]"
              }`}
            >
              {spikeyEnabled ? "Spikey Edge On" : "Smooth Edge"}
            </button>
          </div>

          {spikeyEnabled && (
            <div className="flex flex-col gap-5">
              // {/* Spike Density Slider */}
      {/* <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold tracking-wider text-[#8a7060] uppercase">
                  <span>Edge Spike Density</span>
                  <span className="text-[#3d2b1f]">{spikesCount} spikes</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="2"
                  value={spikesCount}
                  onChange={(e) => setSpikesCount(parseInt(e.target.value))}
                  className="w-full accent-[#a0604a] bg-[#e8d9c0] h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Spike Depth / Size Slider */}
      {/* <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold tracking-wider text-[#8a7060] uppercase">
                  <span>Spike Depth / Size</span>
                  <span className="text-[#3d2b1f]">{spikeSize.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={spikeSize}
                  onChange={(e) => setSpikeSize(parseFloat(e.target.value))}
                  className="w-full accent-[#a0604a] bg-[#e8d9c0] h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div> */}
      {/* )} */}
      {/* </div> */}

      {/* <div className="flex flex-wrap gap-8 justify-center max-w-6xl w-full px-4">
          <Polaroid
            imageSrc="/complete_kit.png"
            imageAlt="Handcrafted Nail Application Kit"
            caption="Signature Toolkits"
            rotate="left-soft"
            className="w-[280px]"
            spikey={spikeyEnabled}
            spikesCountX={spikesCount}
            spikesCountY={Math.round(spikesCount * 1.33)}
            spikeSize={spikeSize}
          />
          <Polaroid
            imageSrc="/product.png"
            imageAlt="Signature Cherry Brush Nail Set"
            caption="Cherry Satin"
            rotate="right-soft"
            className="w-[280px]"
            spikey={spikeyEnabled}
            spikesCountX={spikesCount}
            spikesCountY={Math.round(spikesCount * 1.33)}
            spikeSize={spikeSize}
          />
          <Polaroid
            imageSrc="/wardrobe.png"
            imageAlt="Nails displayed inside luxury wardrobe"
            caption="The Wardrobe"
            rotate="left-hard"
            className="w-[280px]"
            spikey={spikeyEnabled}
            spikesCountX={spikesCount}
            spikesCountY={Math.round(spikesCount * 1.33)}
            spikeSize={spikeSize}
          />
        </div> */}
      {/* </section> */}

      {/* ── Horizontal Product Scroll ── */}
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

        {/* Scroll Container */}
        <div
          className="flex gap-6 overflow-x-auto pb-4 px-8 md:px-16"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex-shrink-0 w-[min(680px,90vw)]">
            <NailProductCard
              imageSrc="/product.png"
              name="Rose Champagne"
              collection="Rose Collection"
              style="Glitter Ombre"
              description="A soft blush ombre with shimmer details for an effortlessly elegant look."
              price="₹799"
              badge="BEST SELLER"
              rating={4.5}
              reviewCount={1250}
              colors={[
                { hex: "#e8a0b0", label: "Rose Pink" },
                { hex: "#f5e6d0", label: "Champagne" },
                { hex: "#d4b896", label: "Warm Nude" },
                { hex: "#c09090", label: "Mauve" },
              ]}
              extraColorsCount={2}
            />
          </div>
          <div className="flex-shrink-0 w-[min(680px,90vw)]">
            <NailProductCard
              imageSrc="/complete_kit.png"
              name="Cherry Blossom"
              collection="Spring Collection"
              style="Soft Matte"
              description="Delicate petals in matte blush — minimal, dreamy, and made to last."
              price="₹649"
              badge="NEW"
              rating={4}
              reviewCount={380}
              accentColor="#a0604a"
              colors={[
                { hex: "#f5c5c5", label: "Blush" },
                { hex: "#f0d5d5", label: "Petal" },
              ]}
              extraColorsCount={1}
            />
          </div>
          <div className="flex-shrink-0 w-[min(680px,90vw)]">
            <NailProductCard
              imageSrc="/wardrobe.png"
              name="Velvet Noir"
              collection="Evening Collection"
              style="Deep Shimmer"
              description="A rich, dark shimmer for evenings that demand attention and sophistication."
              price="₹899"
              rating={5}
              reviewCount={620}
              accentColor="#6b4f3a"
              colors={[
                { hex: "#3d2b1f", label: "Noir" },
                { hex: "#6b4f3a", label: "Walnut" },
                { hex: "#a88a6a", label: "Taupe" },
              ]}
            />
          </div>
        </div>
      </section>

      <section>
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
        <div
          className="flex gap-6 overflow-x-auto pb-4 px-8 md:px-16"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <VerticalProductCard
            imageSrc="/product.png"
            imageAlt="Signature Cherry Brush Nail Set"
            name="Signature Cherry Brush Nail Set"
            collection="Signature Collection"
            style="Soft Matte"
            description="Delicate petals in matte blush — minimal, dreamy, and made to last."
            price="₹649"
            badge="NEW"
            rating={4}
            reviewCount={380}
            accentColor="#a0604a"
            colors={[
              { hex: "#f5c5c5", label: "Blush" },
              { hex: "#f0d5d5", label: "Petal" },
            ]}
            extraColorsCount={1}
          />
          <VerticalProductCard
            imageSrc="/product.png"
            imageAlt="Signature Cherry Brush Nail Set"
            name="Signature Cherry Brush Nail Set"
            collection="Signature Collection"
            style="Soft Matte"
            description="Delicate petals in matte blush — minimal, dreamy, and made to last."
            price="₹649"
            badge="NEW"
            rating={4}
            reviewCount={380}
            accentColor="#a0604a"
            colors={[
              { hex: "#f5c5c5", label: "Blush" },
              { hex: "#f0d5d5", label: "Petal" },
            ]}
            extraColorsCount={1}
          />
          <VerticalProductCard
            imageSrc="/product.png"
            imageAlt="Signature Cherry Brush Nail Set"
            name="Signature Cherry Brush Nail Set"
            collection="Signature Collection"
            style="Soft Matte"
            description="Delicate petals in matte blush — minimal, dreamy, and made to last."
            price="₹649"
            badge="NEW"
            rating={4}
            reviewCount={380}
            accentColor="#a0604a"
            colors={[
              { hex: "#f5c5c5", label: "Blush" },
              { hex: "#f0d5d5", label: "Petal" },
            ]}
            extraColorsCount={1}
          />
          <VerticalProductCard
            imageSrc="/product.png"
            imageAlt="Signature Cherry Brush Nail Set"
            name="Signature Cherry Brush Nail Set"
            collection="Signature Collection"
            style="Soft Matte"
            description="Delicate petals in matte blush — minimal, dreamy, and made to last."
            price="₹649"
            badge="NEW"
            rating={4}
            reviewCount={380}
            accentColor="#a0604a"
            colors={[
              { hex: "#f5c5c5", label: "Blush" },
              { hex: "#f0d5d5", label: "Petal" },
            ]}
            extraColorsCount={1}
          />
        </div>
      </section>
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
