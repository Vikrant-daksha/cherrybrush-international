import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import Product from "@/lib/product.model";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Access denied. Admins only." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    await connectDB();

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Access denied. Admins only." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();

    if (body.isHero) {
      await Product.updateMany({ _id: { $ne: id }, isHero: true }, { isHero: false });
    }

    const updated = await Product.findByIdAndUpdate(id, body, { returnDocument: "after" });
    if (!updated) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}
