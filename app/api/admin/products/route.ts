import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import Product from "@/lib/product.model";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Access denied. Admins only." },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
