import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/lib/product.model";
import ProductPage, { ProductData } from "@/components/ProductPage/ProductPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper to fetch and normalize product strictly from MongoDB
async function getProductBySlug(
  slug: string,
): Promise<Partial<ProductData> | null> {
  const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();

  try {
    await connectDB();

    // 1. Try finding by exact slug
    let dbDoc: any = await Product.findOne({ slug: decodedSlug }).lean();

    // 2. Try finding by MongoDB ObjectId if slug matches hex format
    if (!dbDoc && /^[0-9a-fA-F]{24}$/.test(slug)) {
      dbDoc = await Product.findById(slug).lean();
    }

    // 3. Fallback: Search existing DB products by slugified name or ID string
    if (!dbDoc) {
      const allDocs = await Product.find({}).lean();
      dbDoc = allDocs.find(
        (p: any) =>
          (p.slug && p.slug.toLowerCase() === decodedSlug) ||
          slugify(p.name || "") === decodedSlug ||
          p._id?.toString() === slug,
      );
    }

    if (dbDoc) {
      // Normalize DB record to match ProductPage component expectations
      const mappedShapes = (dbDoc.shapes || [])
        .filter((sh: any) => typeof sh === "string" && sh.trim().length > 0)
        .map((sh: string) => {
          const lower = sh.toLowerCase();
          return {
            id: lower,
            name: sh.charAt(0).toUpperCase() + sh.slice(1),
            shapeType: lower,
          };
        });

      const mappedColors = (dbDoc.colors || [])
        .filter((c: any) => c && (c.hex?.trim?.() || c.color?.trim?.()))
        .map((c: any, i: number) => ({
          id: `c-${i}`,
          name: c.label || c.name || `Color ${i + 1}`,
          color: c.hex || c.color,
        }));

      const validLengths = (dbDoc.lengths || []).filter(
        (l: any) => typeof l === "string" && l.trim().length > 0,
      );

      const validSizes = (dbDoc.sizes || []).filter(
        (s: any) => typeof s === "string" && s.trim().length > 0,
      );

      return {
        id: dbDoc._id.toString(),
        name: dbDoc.name,
        subtitle: dbDoc.subtitle,
        collection: dbDoc.collection || undefined,
        rating: dbDoc.rating || 5,
        reviewCount: dbDoc.reviewCount || 0,
        price: dbDoc.price,
        currency: "₹",
        description: dbDoc.description,
        images:
          dbDoc.images && dbDoc.images.length > 0
            ? dbDoc.images
            : ["/product.png"],
        shapes: mappedShapes.length > 0 ? mappedShapes : undefined,
        colors: mappedColors.length > 0 ? mappedColors : undefined,
        lengths: validLengths.length > 0 ? validLengths : undefined,
        sizes: validSizes.length > 0 ? validSizes : undefined,
        packageType: dbDoc.packageType,
        style: dbDoc.style,
      };
    }
  } catch (err) {
    console.warn("DB lookup error:", err);
  }

  return null;
}

// ── Dynamic SEO Metadata ──
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Cherrybrush",
      description: "The requested press-on nail product could not be found.",
    };
  }

  return {
    title: `${product.name} | Cherrybrush`,
    description:
      product.description ||
      `Buy ${product.name} luxury press-on nails online.`,
    openGraph: {
      title: `${product.name} | Cherrybrush`,
      description: product.description,
      images:
        product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

// ── Dynamic Page Component ──
export default async function ProductBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen bg-[#fdfaf8]">
      <ProductPage product={product} />
    </div>
  );
}
