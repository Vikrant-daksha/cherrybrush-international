import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import ShippingMethod from "@/lib/shipping.model";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/shipping/[id]
 * Deletes a shipping method.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const deleted = await ShippingMethod.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Shipping method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shipping method deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/shipping/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete shipping method" },
      { status: 500 }
    );
  }
}
