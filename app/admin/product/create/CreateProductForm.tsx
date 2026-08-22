"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NailProductCard from "@/components/NailProductCard/NailProductCard";
import VerticalProductCard from "@/components/verticalProductCard/verticalProductCard";
import { AdminPayload } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import {
  CiImageOn,
  CiTrash,
  CiViewList,
  CiGrid41,
  CiBoxList,
  CiEdit,
} from "react-icons/ci";
import Navbar from "@/components/Navbar/Navbar";

export interface ImageItem {
  id: string;
  type: "file" | "url";
  file?: File;
  url?: string;
  preview: string;
}

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "Custom"];
const SHAPE_PRESETS = ["Oval", "Almond", "Coffin", "Square"];
const LENGTH_PRESETS = ["Short", "Medium", "Long", "Extra Long"];

interface ProductFormProps {
  admin?: AdminPayload;
  editingProduct?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  showHeader?: boolean;
}

export default function CreateProductForm({
  admin,
  editingProduct,
  onSuccess,
  onCancel,
  showHeader = true,
}: ProductFormProps) {
  const router = useRouter();

  // Form States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [collection, setCollection] = useState("");
  const [style, setStyle] = useState("");
  const [badge, setBadge] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");

  // Deferred Images State (Local File previews + Direct URLs)
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic Swatches
  const [colors, setColors] = useState<{ hex: string; label?: string }[]>([]);
  const [newColorHex, setNewColorHex] = useState("#e8a0b0");
  const [newColorLabel, setNewColorLabel] = useState("");

  // Dynamic Sizes, Shapes & Lengths
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSizeInput, setNewSizeInput] = useState("");

  const [shapes, setShapes] = useState<string[]>([]);
  const [newShapeInput, setNewShapeInput] = useState("");

  const [lengths, setLengths] = useState<string[]>([]);
  const [newLengthInput, setNewLengthInput] = useState("");

  // Hero Featured & Showcase Toggles
  const [isHero, setIsHero] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [packageType, setPackageType] = useState<"basic" | "normal" | "nail">();

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Preview Mode States
  const [previewCardType, setPreviewCardType] = useState<
    "horizontal" | "vertical"
  >("horizontal");
  const [previewSize, setPreviewSize] = useState<"sm" | "md" | "lg">("md");

  // Load editing product data if present
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setSlug(editingProduct.slug || "");
      setIsCustomSlug(true);
      setCollection(editingProduct.collection || "");
      setStyle(editingProduct.style || "");
      setBadge(editingProduct.badge || "");
      setPrice(editingProduct.price ?? "");
      setDescription(editingProduct.description || "");
      setColors(editingProduct.colors || []);
      setSizes(editingProduct.sizes || []);
      setShapes(editingProduct.shapes || []);
      setLengths(editingProduct.lengths || []);
      setIsHero(Boolean(editingProduct.isHero));
      setIsFeatured(Boolean(editingProduct.isFeatured));
      setPackageType(editingProduct.packageType);

      if (editingProduct.images && Array.isArray(editingProduct.images)) {
        setImages(
          editingProduct.images.map((url: string, index: number) => ({
            id: `existing-${index}-${Date.now()}`,
            type: "url",
            url,
            preview: url,
          })),
        );
      }
    }
  }, [editingProduct]);

  // File Handling (Deferred - Local Previews)
  const processFiles = (fileList: FileList | File[]) => {
    const newItems: ImageItem[] = [];
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newItems.push({
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "file",
          file,
          preview: URL.createObjectURL(file),
        });
      }
    });
    setImages((prev) => [...prev, ...newItems]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Add Direct Image URL
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      const url = imageUrlInput.trim();
      setImages((prev) => [
        ...prev,
        {
          id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "url",
          url,
          preview: url,
        },
      ]);
      setImageUrlInput("");
    }
  };

  // Remove Image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const itemToRemove = prev.find((img) => img.id === id);
      if (itemToRemove && itemToRemove.type === "file") {
        URL.revokeObjectURL(itemToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Color Swatch Handlers
  const handleAddColor = () => {
    if (newColorHex) {
      if (!newColorLabel || newColorLabel === "") {
        return alert("Shade Name Required");
      }
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

  // Tag Handlers with Presets
  const addTag = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput?: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList((prev) => [...prev, trimmed]);
      if (setInput) setInput("");
    }
  };

  const removeTag = (
    tag: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setList((prev) => prev.filter((item) => item !== tag));
  };

  // Submit Handler: Upload pending local files to Cloudinary on submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError("Please add at least one product image");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Step 1: Upload any pending local files to Cloudinary
      const finalImageUrls: string[] = [];
      const pendingFilesToUpload: { index: number; file: File }[] = [];

      images.forEach((img, idx) => {
        if (img.type === "url" && img.url) {
          finalImageUrls[idx] = img.url;
        } else if (img.type === "file" && img.file) {
          pendingFilesToUpload.push({ index: idx, file: img.file });
        }
      });

      if (pendingFilesToUpload.length > 0) {
        setSubmitStep(
          `Uploading ${pendingFilesToUpload.length} image(s) to Cloudinary...`,
        );
        const formData = new FormData();
        pendingFilesToUpload.forEach((item) => {
          formData.append("images", item.file);
        });

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(
            uploadData.error || "Failed to upload pending image(s)",
          );
        }

        const uploadedUrls: string[] = uploadData.urls || [];
        pendingFilesToUpload.forEach((item, i) => {
          finalImageUrls[item.index] = uploadedUrls[i];
        });
      }

      // Step 2: Create or Update product in database
      setSubmitStep(
        editingProduct
          ? "Updating product details..."
          : "Saving product to database...",
      );

      const payload = {
        name,
        slug: slug.trim() || slugify(name),
        collection,
        style: style.trim() || undefined,
        badge: badge.trim() || undefined,
        price: Number(price),
        description,
        images: finalImageUrls.filter(Boolean),
        colors,
        sizes,
        shapes,
        lengths,
        isHero,
        isFeatured,
        packageType,
      };

      const endpoint = editingProduct
        ? `/api/admin/products/${editingProduct._id}`
        : "/api/admin/product/create";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product");
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
      setSubmitStep("");
    }
  };

  const handleResetForm = () => {
    setName("");
    setSlug("");
    setIsCustomSlug(false);
    setCollection("");
    setStyle("");
    setBadge("");
    setPrice("");
    setDescription("");
    setImages([]);
    setColors([]);
    setSizes([]);
    setShapes([]);
    setLengths([]);
    setSuccess(false);
    setError("");
  };

  // Extract preview image URLs
  const previewImageUrls = images.map((img) => img.preview);
  const primaryImageSrc = previewImageUrls[0] || "/product.png";

  return (
    <div
      className={
        showHeader
          ? "min-h-screen bg-[#faf5f6] text-[#3d2b1f]"
          : "w-full text-[#3d2b1f]"
      }
    >
      {showHeader && (
        <header>
          <Navbar brandName="Cherrybrush" className="h-20" />
        </header>
      )}

      <main className={showHeader ? "max-w-7xl mx-auto p-4 md:p-8" : "w-full"}>
        {showHeader && (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c88389] mb-1">
              Catalogue Management
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#3d2b1f]">
              Create New Product
            </h1>
          </div>
        )}

        {/* ── TOP PREVIEW SECTION ── */}
        <div className="mb-8 bg-white/95 rounded-3xl p-6 border border-[#f0e0e5] shadow-sm">
          <div className="flex flex-row sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#f5e6e8]">
            {/* Controls: Card Type & Size */}
            <div className="grid grid-cols-3 gap-10 self-end sm:self-auto">
              {/* Card Type Selector */}
              <div className="col-span-2">
                <NailProductCard
                  imageSrc={primaryImageSrc}
                  name={name || "Product Name"}
                  collection={collection || "Collection Name"}
                  style={style || undefined}
                  badge={badge || undefined}
                  description={
                    description ||
                    "A soft blush ombre with shimmer details for an effortlessly elegant look."
                  }
                  price={price !== "" ? `₹${price}` : "₹799"}
                  colors={colors}
                  shapes={shapes}
                  nailSizes={sizes}
                  lengths={lengths}
                  size={previewSize}
                />
              </div>
              <div className="col-span-1">
                <div className="w-full max-w-[280px]">
                  <VerticalProductCard
                    imageSrc={primaryImageSrc}
                    name={name || "PRODUCT NAME"}
                    collection={collection || "COLLECTION NAME"}
                    style={style || undefined}
                    badge={badge || undefined}
                    description={
                      description ||
                      "A soft blush ombre with shimmer details for an effortlessly elegant look."
                    }
                    price={price !== "" ? `₹${price}` : "₹799"}
                    colors={colors}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between shadow-xs">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="font-bold text-sm">
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span>
                <strong>Success!</strong> Product{" "}
                {editingProduct ? "updated" : "created"} successfully.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!editingProduct && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-all"
                >
                  Create Another
                </button>
              )}
              <Link
                href="/"
                className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-all"
              >
                View Store
              </Link>
            </div>
          </div>
        )}

        {/* ── MAIN FORM ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Media Uploader (Deferred Upload) */}
          <div className="bg-white/90 rounded-3xl p-6 border border-[#f0e0e5] shadow-sm">
            <h2 className="font-serif text-lg font-normal uppercase tracking-wide text-[#3d2b1f] mb-1 flex items-center gap-2">
              <CiImageOn className="w-5 h-5 text-[#c88389]" />
              <span>Product Images</span>
            </h2>
            <p className="text-[11px] text-[#6b4f3a]/70 mb-4">
              Images preview locally immediately and will be uploaded to
              Cloudinary when you submit.
            </p>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative group ${
                isDragging
                  ? "border-[#c88389] bg-[#fdf0f2] scale-[1.01]"
                  : "border-[#e8c0c8] hover:border-[#c88389] bg-[#fdf0f2]/40"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white border border-[#e8c0c8] flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform shadow-xs">
                  🖼️
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#3d2b1f]">
                  {isDragging
                    ? "Drop Files Here"
                    : "Click or Drag & Drop Images Here"}
                </p>
                <p className="text-[11px] text-[#6b4f3a]/60 mt-0.5">
                  PNG, JPG, WEBP • Uploads directly on form submission
                </p>
              </div>
            </div>

            {/* Manual Image URL Input */}
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

            {/* Image Previews Grid */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-[#e8c0c8] group shadow-sm bg-white"
                  >
                    <Image
                      src={img.preview}
                      alt={`Preview ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-[#c88389] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow">
                        Primary
                      </span>
                    )}
                    {img.type === "file" && (
                      <span className="absolute bottom-1 left-1 bg-amber-500/90 text-white text-[8px] font-bold uppercase px-1 py-0.2 rounded shadow">
                        Pending
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <CiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Basic Information */}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setName(val);
                    if (!isCustomSlug) {
                      setSlug(slugify(val));
                    }
                  }}
                  placeholder="e.g. Rose Champagne"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8c0c8] text-sm bg-white text-[#3d2b1f] focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f]">
                    Product URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isCustomSlug;
                      setIsCustomSlug(nextState);
                      if (!nextState) {
                        setSlug(slugify(name));
                      }
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#c88389] hover:underline flex items-center gap-1"
                  >
                    {isCustomSlug ? "✨ Use Auto Slug" : "✏️ Custom Slug"}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={slug}
                  readOnly={!isCustomSlug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="rose-champagne"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none ${
                    isCustomSlug
                      ? "bg-white border-[#c88389] text-[#3d2b1f] focus:ring-2 focus:ring-[#c88389]/30"
                      : "bg-[#fcf3f5] border-[#eed5dc] text-[#8a5d68] cursor-not-allowed"
                  }`}
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
                  onChange={(e) =>
                    setPrice(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="799"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8c0c8] text-sm bg-white text-[#3d2b1f] focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none"
                />
              </div>

              {/* ── Featured Hero Checkbox ── */}
              <div className="col-span-1 sm:col-span-2 p-4 rounded-2xl border border-[#e8c0c8] bg-[#fdf0f2]/60 flex items-center justify-between shadow-xs">
                <div>
                  <label
                    htmlFor="isHero"
                    className="text-xs font-bold uppercase tracking-wider text-[#a0604a] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>⭐</span> Featured Hero Product
                  </label>
                  <p className="text-[11px] text-[#6b4f3a]/80 mt-0.5">
                    Check this box to set this product as the main featured Hero
                    set on the homepage.
                  </p>
                </div>
                <input
                  id="isHero"
                  type="checkbox"
                  checked={isHero}
                  onChange={(e) => setIsHero(e.target.checked)}
                  className="w-5 h-5 accent-[#c88389] cursor-pointer"
                />
              </div>

              {/* ── Featured Showcase Product Checkbox ── */}
              <div className="col-span-1 sm:col-span-2 p-4 rounded-2xl border border-[#e8c0c8] bg-[#fff5f7]/80 flex items-center justify-between shadow-xs">
                <div>
                  <label
                    htmlFor="isFeatured"
                    className="text-xs font-bold uppercase tracking-wider text-[#c88389] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>✨</span> Featured Collection Showcase Product
                  </label>
                  <p className="text-[11px] text-[#6b4f3a]/80 mt-0.5">
                    Check this box to feature this product in the main homepage
                    carousel showcase section.
                  </p>
                </div>
                <input
                  id="isFeatured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 accent-[#c88389] cursor-pointer"
                />
              </div>

              {/* ── Set Package Type Selector ── */}
              <div className="col-span-1 sm:col-span-2 p-4 rounded-2xl border border-[#e8c0c8] bg-white shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3d2b1f] mb-1.5">
                  📦 What's Included / Package Tier Type *
                </label>
                <p className="text-[11px] text-[#6b4f3a]/80 mb-3">
                  Select what comes packaged with this product. This title will
                  link to the <strong>What's Included</strong> page.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Basic Set */}
                  <button
                    type="button"
                    onClick={() => setPackageType("basic")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      packageType === "basic"
                        ? "border-[#c88389] bg-[#fdf0f2] ring-2 ring-[#c88389]/30"
                        : "border-[#e8c0c8]/60 bg-[#fafaf7] hover:border-[#c88389]"
                    }`}
                  >
                    <p className="text-xs font-bold text-[#3d2b1f]">
                      Basic Set
                    </p>
                    <p className="text-[10px] text-[#6b4f3a] mt-0.5">
                      Includes prep tools & accessories + nails
                    </p>
                  </button>

                  {/* Normal Set */}
                  <button
                    type="button"
                    onClick={() => setPackageType("normal")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      packageType === "normal"
                        ? "border-[#c88389] bg-[#fdf0f2] ring-2 ring-[#c88389]/30"
                        : "border-[#e8c0c8]/60 bg-[#fafaf7] hover:border-[#c88389]"
                    }`}
                  >
                    <p className="text-xs font-bold text-[#3d2b1f]">
                      Normal Set (12 Nails)
                    </p>
                    <p className="text-[10px] text-[#6b4f3a] mt-0.5">
                      Standard set of 12 handcrafted nails + prep kit
                    </p>
                  </button>

                  {/* Nail Only Set */}
                  <button
                    type="button"
                    onClick={() => setPackageType("nail")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      packageType === "nail"
                        ? "border-[#c88389] bg-[#fdf0f2] ring-2 ring-[#c88389]/30"
                        : "border-[#e8c0c8]/60 bg-[#fafaf7] hover:border-[#c88389]"
                    }`}
                  >
                    <p className="text-xs font-bold text-[#3d2b1f]">
                      Nail-Only Set
                    </p>
                    <p className="text-[10px] text-[#6b4f3a] mt-0.5">
                      Nails only — no prep kit or accessories included
                    </p>
                  </button>
                </div>
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

              <div>
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
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fdf0f2] border border-[#e8c0c8] text-xs"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="font-medium text-[#3d2b1f]">
                      {c.label || c.hex}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(i)}
                      className="text-red-500 hover:text-red-700 ml-1 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Sizes, Shapes & Lengths with Autofill Presets */}
          <div className="bg-white/90 rounded-3xl p-6 border border-[#f0e0e5] shadow-sm space-y-6">
            <h2 className="font-serif text-lg font-normal uppercase tracking-wide text-[#3d2b1f]">
              Sizes, Shapes & Lengths
            </h2>

            {/* Sizes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f]">
                  Available Sizes
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#6b4f3a]/60 mr-1">
                    Presets:
                  </span>
                  {SIZE_PRESETS.map((preset) => {
                    const exists = sizes.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addTag(preset, sizes, setSizes)}
                        disabled={exists}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                          exists
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default"
                            : "bg-[#fdf0f2] text-[#c88389] border-[#e8c0c8] hover:bg-[#c88389] hover:text-white"
                        }`}
                      >
                        {exists ? `✓ ${preset}` : `+ ${preset}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(),
                    addTag(newSizeInput, sizes, setSizes, setNewSizeInput))
                  }
                  placeholder="Type size and press enter or click preset above"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#e8c0c8] text-xs bg-white outline-none focus:ring-2 focus:ring-[#c88389]/30"
                />
                <button
                  type="button"
                  onClick={() =>
                    addTag(newSizeInput, sizes, setSizes, setNewSizeInput)
                  }
                  className="px-4 py-2 rounded-xl bg-[#fdf0f2] border border-[#e8c0c8] text-[#c88389] text-xs font-bold uppercase tracking-wider hover:bg-[#f0e0e5] transition-all"
                >
                  + Add Size
                </button>
              </div>
              {sizes.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-lg bg-white border border-[#e8c0c8] text-xs font-semibold text-[#3d2b1f] flex items-center gap-1.5 shadow-sm"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeTag(s, setSizes)}
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Shapes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f]">
                  Available Shapes
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#6b4f3a]/60 mr-1">
                    Presets:
                  </span>
                  {SHAPE_PRESETS.map((preset) => {
                    const exists = shapes.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addTag(preset, shapes, setShapes)}
                        disabled={exists}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                          exists
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default"
                            : "bg-[#fdf0f2] text-[#c88389] border-[#e8c0c8] hover:bg-[#c88389] hover:text-white"
                        }`}
                      >
                        {exists ? `✓ ${preset}` : `+ ${preset}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newShapeInput}
                  onChange={(e) => setNewShapeInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(),
                    addTag(newShapeInput, shapes, setShapes, setNewShapeInput))
                  }
                  placeholder="Type shape and press enter or click preset above"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#e8c0c8] text-xs bg-white outline-none focus:ring-2 focus:ring-[#c88389]/30"
                />
                <button
                  type="button"
                  onClick={() =>
                    addTag(newShapeInput, shapes, setShapes, setNewShapeInput)
                  }
                  className="px-4 py-2 rounded-xl bg-[#fdf0f2] border border-[#e8c0c8] text-[#c88389] text-xs font-bold uppercase tracking-wider hover:bg-[#f0e0e5] transition-all"
                >
                  + Add Shape
                </button>
              </div>
              {shapes.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {shapes.map((sh) => (
                    <span
                      key={sh}
                      className="px-3 py-1 rounded-lg bg-white border border-[#e8c0c8] text-xs font-semibold text-[#3d2b1f] flex items-center gap-1.5 shadow-sm"
                    >
                      {sh}
                      <button
                        type="button"
                        onClick={() => removeTag(sh, setShapes)}
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Lengths */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f]">
                  Available Lengths
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#6b4f3a]/60 mr-1">
                    Presets:
                  </span>
                  {LENGTH_PRESETS.map((preset) => {
                    const exists = lengths.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addTag(preset, lengths, setLengths)}
                        disabled={exists}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                          exists
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default"
                            : "bg-[#fdf0f2] text-[#c88389] border-[#e8c0c8] hover:bg-[#c88389] hover:text-white"
                        }`}
                      >
                        {exists ? `✓ ${preset}` : `+ ${preset}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLengthInput}
                  onChange={(e) => setNewLengthInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(),
                    addTag(
                      newLengthInput,
                      lengths,
                      setLengths,
                      setNewLengthInput,
                    ))
                  }
                  placeholder="Type length and press enter or click preset above"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#e8c0c8] text-xs bg-white outline-none focus:ring-2 focus:ring-[#c88389]/30"
                />
                <button
                  type="button"
                  onClick={() =>
                    addTag(
                      newLengthInput,
                      lengths,
                      setLengths,
                      setNewLengthInput,
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-[#fdf0f2] border border-[#e8c0c8] text-[#c88389] text-xs font-bold uppercase tracking-wider hover:bg-[#f0e0e5] transition-all"
                >
                  + Add Length
                </button>
              </div>
              {lengths.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {lengths.map((l) => (
                    <span
                      key={l}
                      className="px-3 py-1 rounded-lg bg-white border border-[#e8c0c8] text-xs font-semibold text-[#3d2b1f] flex items-center gap-1.5 shadow-sm"
                    >
                      {l}
                      <button
                        type="button"
                        onClick={() => removeTag(l, setLengths)}
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-4 rounded-2xl bg-white border border-[#e8c0c8] text-[#6b4f3a] text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#fdf0f2] transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 rounded-2xl bg-[#c88389] hover:bg-[#b57278] active:scale-[0.99] text-white font-sans text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>{submitStep || "Processing..."}</span>
              ) : editingProduct ? (
                <span>✨ Save Changes</span>
              ) : (
                <span>✨ Save & Publish Product</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
