import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/product.model";
import { slugify } from "@/lib/slug";

export async function GET() {
  try {
    await connectDB();
    const rawProducts = await Product.find({ inStock: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean();

    const products = rawProducts.map((p: any) => ({
      ...p,
      slug: p.slug || slugify(p.name || `product-${p._id}`),
    }));

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
