"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import CreateProductForm from "@/app/admin/product/create/CreateProductForm";
import { AdminPayload } from "@/lib/auth";
import {
  CiCirclePlus,
  CiGrid41,
  CiTrash,
  CiEdit,
  CiSearch,
  CiRedo,
  CiShop,
} from "react-icons/ci";

interface AdminProductsClientProps {
  admin: AdminPayload;
}

export default function AdminProductsClient({
  admin,
}: AdminProductsClientProps) {
  const [activeTab, setActiveTab] = useState<"manage" | "create">("manage");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Mode state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Notification toast state
  const [notification, setNotification] = useState("");

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch products");
      }
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle product deletion
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete product");
      }
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.collection && p.collection.toLowerCase().includes(q)) ||
      (p.style && p.style.toLowerCase().includes(q)) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#faf5f6] text-[#3d2b1f]">
      <header>
        <Navbar brandName="Cherrybrush" className="h-20" />
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Title & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c88389] mb-1">
              Admin Workspace
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#3d2b1f]">
              Product Catalogue
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-[#f0e0e5] shadow-xs">
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setActiveTab("manage");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "manage" && !editingProduct
                  ? "bg-[#c88389] text-white shadow-sm"
                  : "text-[#6b4f3a] hover:bg-[#fdf0f2]"
              }`}
            >
              <CiGrid41 className="w-4 h-4" />
              <span>Manage Products ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setActiveTab("create");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "create" && !editingProduct
                  ? "bg-[#c88389] text-white shadow-sm"
                  : "text-[#6b4f3a] hover:bg-[#fdf0f2]"
              }`}
            >
              <CiCirclePlus className="w-4 h-4" />
              <span>+ Add New Product</span>
            </button>
          </div>
        </div>

        {/* ── NOTIFICATION BANNER ── */}
        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
            <span>{notification}</span>
            <button
              type="button"
              onClick={() => setNotification("")}
              className="text-emerald-900 font-bold hover:underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── EDIT MODE BANNER ── */}
        {editingProduct && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <CiEdit className="w-5 h-5 text-amber-700" />
              <span>
                Editing Product: <strong>{editingProduct.name}</strong> (
                {editingProduct._id})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-3 py-1 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-100 transition-all"
            >
              Cancel Edit
            </button>
          </div>
        )}

        {/* ── TAB 1: EDIT FORM / CREATE FORM ── */}
        {(activeTab === "create" || editingProduct) && (
          <CreateProductForm
            admin={admin}
            editingProduct={editingProduct}
            onSuccess={() => {
              const updatedName = editingProduct?.name || "Product";
              setNotification(
                editingProduct
                  ? `✨ Product "${updatedName}" updated successfully!`
                  : `✨ New product created successfully!`,
              );
              fetchProducts();
              if (editingProduct) {
                setEditingProduct(null);
                setActiveTab("manage");
              }
            }}
            onCancel={() => {
              setEditingProduct(null);
              setActiveTab("manage");
            }}
            showHeader={false}
          />
        )}

        {/* ── TAB 2: MANAGE PRODUCTS LIST ── */}
        {activeTab === "manage" && !editingProduct && (
          <div className="space-y-6">
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 p-4 rounded-3xl border border-[#f0e0e5] shadow-sm">
              <div className="relative w-full sm:w-80">
                <CiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c88389]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name, collection..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e8c0c8] text-xs bg-white text-[#3d2b1f] placeholder:text-[#a0604a]/40 focus:ring-2 focus:ring-[#c88389]/30 focus:border-[#c88389] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="px-3.5 py-2.5 rounded-xl bg-[#fdf0f2] hover:bg-[#f0e0e5] border border-[#e8c0c8] text-[#c88389] text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <CiRedo className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <Link
                  href="/"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#e8c0c8] text-[#6b4f3a] text-xs font-bold flex items-center gap-1.5 hover:bg-[#fdf0f2] transition-all"
                >
                  <CiShop className="w-4 h-4 text-[#c88389]" />
                  <span>View Storefront</span>
                </Link>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                ⚠️ {error}
              </div>
            )}

            {/* Loading state */}
            {loading ? (
              <div className="text-center py-16 bg-white/60 rounded-3xl border border-[#f0e0e5]">
                <p className="text-sm font-semibold text-[#c88389] animate-pulse">
                  Loading catalogue from database...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white/90 rounded-3xl border border-[#f0e0e5] p-8">
                <p className="text-lg font-serif text-[#3d2b1f] mb-2">
                  No products found
                </p>
                <p className="text-xs text-[#6b4f3a]/60 mb-6">
                  {searchQuery
                    ? "Try a different search term."
                    : "Your database catalogue is currently empty."}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className="px-5 py-2.5 rounded-xl bg-[#c88389] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#b57278] transition-all shadow-sm"
                >
                  + Add Your First Product
                </button>
              </div>
            ) : (
              /* Products Grid Table */
              <div className="bg-white/90 rounded-3xl border border-[#f0e0e5] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#fdf0f2]/60 border-b border-[#f0e0e5] text-[11px] font-bold uppercase tracking-wider text-[#3d2b1f]">
                        <th className="py-3.5 px-4">Product</th>
                        <th className="py-3.5 px-4">Collection</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Variants</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5e6e8] text-xs">
                      {filteredProducts.map((p) => (
                        <tr
                          key={p._id}
                          className="hover:bg-[#fdf0f2]/30 transition-colors group"
                        >
                          {/* Image & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#e8c0c8] bg-[#fdf0f2] flex-shrink-0">
                                <Image
                                  src={p.images?.[0] || "/product.png"}
                                  unoptimized
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-[#3d2b1f] line-clamp-1">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-[#6b4f3a]/60 font-mono">
                                  /collection/{p.slug || p._id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Collection & Style */}
                          <td className="py-3 px-4">
                            <p className="font-medium text-[#3d2b1f]">
                              {p.collection}
                            </p>
                            {p.style && (
                              <p className="text-[10px] text-[#c88389] font-medium">
                                {p.style}
                              </p>
                            )}
                          </td>

                          {/* Price & Badge */}
                          <td className="py-3 px-4">
                            <p className="font-serif font-bold text-[#3d2b1f] text-sm">
                              ₹{p.price}
                            </p>
                            {p.badge && (
                              <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#fdf0f2] text-[#c88389] border border-[#e8c0c8]">
                                {p.badge}
                              </span>
                            )}
                          </td>

                          {/* Variants summary */}
                          <td className="py-3 px-4 text-[10px] text-[#6b4f3a]/80">
                            <div className="space-y-0.5">
                              {p.shapes?.length > 0 && (
                                <div>Shapes: {p.shapes.join(", ")}</div>
                              )}
                              {p.sizes?.length > 0 && (
                                <div>Sizes: {p.sizes.join(", ")}</div>
                              )}
                              {p.lengths?.length > 0 && (
                                <div>Lengths: {p.lengths.join(", ")}</div>
                              )}
                              {!p.shapes?.length &&
                                !p.sizes?.length &&
                                !p.lengths?.length && (
                                  <span className="text-[#a0604a]/40 italic">
                                    No variants
                                  </span>
                                )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingProduct(p)}
                                className="px-3 py-1.5 rounded-lg bg-[#fdf0f2] border border-[#e8c0c8] text-[#c88389] hover:bg-[#c88389] hover:text-white font-bold flex items-center gap-1 transition-all"
                              >
                                <CiEdit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to delete "${p.name}"?`,
                                    )
                                  ) {
                                    handleDelete(p._id);
                                  }
                                }}
                                disabled={deletingId === p._id}
                                className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                              >
                                <CiTrash className="w-3.5 h-3.5" />
                                <span>
                                  {deletingId === p._id ? "..." : "Delete"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
