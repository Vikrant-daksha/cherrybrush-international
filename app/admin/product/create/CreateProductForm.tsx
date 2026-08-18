"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NailProductCard from "@/components/NailProductCard/NailProductCard";
import { AdminPayload } from "@/lib/auth";
import {
  CiImageOn,
  CiTrash,
  CiCirclePlus,
  CiLogout,
  CiShop,
  CiViewList,
} from "react-icons/ci";

export default function CreateProductForm({ admin }: { admin: AdminPayload }) {
  const router = useRouter();

  // Form States
  const [name, setName] = useState("");
  const [collection, setCollection] = useState("");
  const [style, setStyle] = useState("");
  const [badge, setBadge] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  
  // Dynamic Swatches
  const [colors, setColors] = useState<{ hex: string; label?: string }[]>([]);
  const [newColorHex, setNewColorHex] = useState("#e8a0b0");
  const [newColorLabel, setNewColorLabel] = useState("");

  // Dynamic Sizes & Shapes (No hardcoded defaults)
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSizeInput, setNewSizeInput] = useState("");

  const [shapes, setShapes] = useState<string[]>([]);
  const [newShapeInput, setNewShapeInput] = useState("");

  // UI States
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [previewSize, setPreviewSize] = useState<"sm" | "md" | "lg">("md");

  // Handle Cloudinary File Uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image(s)");
      }

      setImages((prev) => [...prev, ...data.urls]);
    } catch (err: any) {
      setError(err.message || "Image upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Add Image URL Manually
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Color Swatch Handlers
  const handleAddColor = () => {
    if (newColorHex) {
      setColors((prev) => [
        ...prev,
        { hex: newColorHex, label: newColorLabel.trim() || undefined },
      ]);
      setNewColorLabel("");
    }
  };

  const handleRemoveColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  // Size Tag Handlers
  const handleAddSize = () => {
    if (newSizeInput.trim() && !sizes.includes(newSizeInput.trim())) {
      setSizes((prev) => [...prev, newSizeInput.trim()]);
      setNewSizeInput("");
    }
  };

  const handleRemoveSize = (tag: string) => {
    setSizes((prev) => prev.filter((s) => s !== tag));
  };

  // Shape Tag Handlers
  const handleAddShape = () => {
    if (newShapeInput.trim() && !shapes.includes(newShapeInput.trim())) {
      setShapes((prev) => [...prev, newShapeInput.trim()]);
      setNewShapeInput("");
    }
  };

  const handleRemoveShape = (tag: string) => {
    setShapes((prev) => prev.filter((s) => s !== tag));
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // Submit Product Creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError("Please upload or add at least one product image");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/product/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          collection,
          style: style.trim() || undefined,
          badge: badge.trim() || undefined,
          price: Number(price),
          description,
          images,
          colors,
          sizes: sizes.length > 0 ? sizes : undefined,
          shapes: shapes.length > 0 ? shapes : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create product");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName("");
    setCollection("");
    setStyle("");
    setBadge("");
    setPrice("");
    setDescription("");
    setImages([]);
    setColors([]);
    setSizes([]);
    setShapes([]);
    setSuccess(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#faf5f6] text-[#3d2b1f]">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#f0e0e5] px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-2 font-serif text-xl font-bold tracking-wider text-[#3d2b1f]">
            <span>🍒</span>
            <span>CHERRYBRUSH</span>
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#fdf0f2] text-[#c88389] border border-[#e8c0c8]">
            ADMIN PORTAL
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="hidden md:inline-block text-[#6b4f3a]/80">
            Logged in as <strong className="text-[#3d2b1f]">{admin.name || admin.email}</strong>
          </span>
          <Link
            href="/home"
            className="px-3.5 py-1.5 rounded-xl border border-[#e8c0c8] bg-white hover:bg-[#fdf0f2] transition-all flex items-center gap-1 font-medium"
          >
            <CiShop className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-[#fdf0f2] hover:bg-red-50 text-red-700 border border-red-200 transition-all flex items-center gap-1 font-medium"
          >
            <CiLogout className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c88389] mb-1">
            Catalogue Management
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#3d2b1f]">
            Create New Product
          </h1>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="font-bold text-sm">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span><strong>Success!</strong> Product created and saved to MongoDB.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetForm}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-all"
              >
                Create Another
              </button>
              <Link
                href="/home"
                className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-all"
              >
                View on Store
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Form Controls (7 cols) ── */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            {/* Section 1: Media & Cloudinary Upload */}
            <div className="bg-white/90 rounded-3xl p-6 border border-[#f0e0e5] shadow-sm">
              <h2 className="font-serif text-lg font-normal uppercase tracking-wide text-[#3d2b1f] mb-4 flex items-center gap-2">
                <CiImageOn className="w-5 h-5 text-[#c88389]" />
                <span>Product Images (Cloudinary)</span>
              </h2>

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-[#e8c0c8] hover:border-[#c88389] rounded-2xl p-6 text-center bg-[#fdf0f2]/50 transition-all cursor-pointer relative group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#e8c0c8] flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                    {uploading ? "⏳" : "☁️"}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#3d2b1f]">
                    {uploading ? "Uploading to Cloudinary..." : "Click or Drag to Upload Images"}
                  </p>
                  <p className="text-[11px] text-[#6b4f3a]/60 mt-0.5">
                    Supports PNG, JPG, WEBP • Automatically optimized on CDN
                  </p>
                </div>
              </div>

              {/* Manual URL Input */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste direct image URL (https://...)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e8c0c8] text-xs bg-white text-[#3d2b1f] placeholder:text-[#a0604a]/40 focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2.5 rounded-xl bg-[#fdf0f2] hover:bg-[#f0e0e5] text-[#c88389] font-bold text-xs uppercase tracking-wider border border-[#e8c0c8] transition-all"
                >
                  Add URL
                </button>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#e8c0c8] group shadow-sm bg-white">
                      <Image src={url} alt={`Upload ${i + 1}`} fill className="object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 bg-[#c88389] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <CiTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Essential Details */}
            <div className="bg-white/90 rounded-3xl p-6 border border-[#f0e0e5] shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-normal uppercase tracking-wide text-[#3d2b1f] mb-2">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rose Champagne"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8c0c8] text-sm bg-white text-[#3d2b1f] focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
                    Collection *
                  </label>
                  <input
                    type="text"
                    required
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    placeholder="e.g. Rose Collection"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8c0c8] text-sm bg-white text-[#3d2b1f] focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="799"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8c0c8] text-sm bg-white text-[#3d2b1f] focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
                    Style / Finish
                  </label>
                  <input
                    type="text"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="e.g. Glitter Ombre, Matte"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8c0c8] text-sm bg-white text-[#3d2b1f] focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. BEST SELLER, NEW, LIMITED EDITION"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8c0c8] text-sm bg-white text-[#3d2b1f] focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1">
                  Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A soft blush ombre with shimmer details for an effortlessly elegant look."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8c0c8] text-sm bg-white text-[#3d2b1f] focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Section 3: Color Swatches */}
            <div className="bg-white/90 rounded-3xl p-6 border border-[#f0e0e5] shadow-sm">
              <h2 className="font-serif text-lg font-normal uppercase tracking-wide text-[#3d2b1f] mb-3">
                Color Swatches
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-[#e8c0c8] cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={newColorLabel}
                  onChange={(e) => setNewColorLabel(e.target.value)}
                  placeholder="Color Name (e.g. Rose Pink)"
                  className="flex-1 min-w-[160px] px-3.5 py-2 rounded-xl border border-[#e8c0c8] text-xs bg-white outline-none focus:ring-2 focus:ring-[#c88389]/30"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-4 py-2 rounded-xl bg-[#c88389] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b57278] transition-all"
                >
                  Add Swatch
                </button>
              </div>

              {colors.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fdf0f2] border border-[#e8c0c8] text-xs">
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="font-medium text-[#3d2b1f]">{c.label || c.hex}</span>
                      <button type="button" onClick={() => handleRemoveColor(i)} className="text-red-500 hover:text-red-700 ml-1 font-bold">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Sizes & Shapes (Zero Hardcoded Defaults) */}
            <div className="bg-white/90 rounded-3xl p-6 border border-[#f0e0e5] shadow-sm space-y-6">
              <h2 className="font-serif text-lg font-normal uppercase tracking-wide text-[#3d2b1f]">
                Custom Sizes & Shapes
              </h2>

              {/* Sizes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1.5">
                  Available Sizes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSizeInput}
                    onChange={(e) => setNewSizeInput(e.target.value)}
                    placeholder="e.g. XS, S, M, L, Custom"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#e8c0c8] text-xs bg-white outline-none focus:ring-2 focus:ring-[#c88389]/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-4 py-2 rounded-xl bg-[#fdf0f2] border border-[#e8c0c8] text-[#c88389] text-xs font-bold uppercase tracking-wider hover:bg-[#f0e0e5] transition-all"
                  >
                    + Add Size
                  </button>
                </div>
                {sizes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <span key={s} className="px-3 py-1 rounded-lg bg-white border border-[#e8c0c8] text-xs font-semibold text-[#3d2b1f] flex items-center gap-1.5 shadow-sm">
                        {s}
                        <button type="button" onClick={() => handleRemoveSize(s)} className="text-red-500 font-bold hover:text-red-700">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Shapes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f] mb-1.5">
                  Available Shapes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newShapeInput}
                    onChange={(e) => setNewShapeInput(e.target.value)}
                    placeholder="e.g. Almond, Square, Coffin, Stiletto"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#e8c0c8] text-xs bg-white outline-none focus:ring-2 focus:ring-[#c88389]/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddShape}
                    className="px-4 py-2 rounded-xl bg-[#fdf0f2] border border-[#e8c0c8] text-[#c88389] text-xs font-bold uppercase tracking-wider hover:bg-[#f0e0e5] transition-all"
                  >
                    + Add Shape
                  </button>
                </div>
                {shapes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {shapes.map((sh) => (
                      <span key={sh} className="px-3 py-1 rounded-lg bg-white border border-[#e8c0c8] text-xs font-semibold text-[#3d2b1f] flex items-center gap-1.5 shadow-sm">
                        {sh}
                        <button type="button" onClick={() => handleRemoveShape(sh)} className="text-red-500 font-bold hover:text-red-700">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full py-4 rounded-2xl bg-[#c88389] hover:bg-[#b57278] active:scale-[0.99] text-white font-sans text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? "Publishing Product to MongoDB..." : "✨ Save & Publish Product"}
            </button>
          </form>

          {/* ── Right Column: Live Storefront Card Preview (5 cols) ── */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="bg-white/90 rounded-3xl p-5 border border-[#f0e0e5] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CiViewList className="w-5 h-5 text-[#c88389]" />
                  <h3 className="font-serif text-sm uppercase tracking-wider font-bold text-[#3d2b1f]">
                    Live Storefront Preview
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-[#fdf0f2] p-1 rounded-xl border border-[#e8c0c8]">
                  {(["sm", "md", "lg"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPreviewSize(s)}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        previewSize === s ? "bg-[#c88389] text-white shadow" : "text-[#6b4f3a] hover:bg-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Card */}
              <div className="flex items-center justify-center p-2">
                <NailProductCard
                  imageSrc={images[0] || "/product.png"}
                  name={name || "Product Name"}
                  collection={collection || "Collection Name"}
                  style={style || undefined}
                  badge={badge || undefined}
                  description={description || "A soft blush ombre with shimmer details for an effortlessly elegant look."}
                  price={price !== "" ? `₹${price}` : "₹799"}
                  colors={colors}
                  size={previewSize}
                />
              </div>

              <p className="text-[11px] text-center text-[#6b4f3a]/60 mt-4">
                ⚡ What you see above updates in real time as you edit.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
