import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import Coupon from "@/lib/coupon.model";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/coupons/[id]
 * Update an existing coupon or toggle its active state.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();
    const body = await req.json();

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    if (body.code && body.code.trim().toUpperCase() !== coupon.code) {
      const newCode = body.code.trim().toUpperCase();
      const existing = await Coupon.findOne({ code: newCode, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: `Coupon code "${newCode}" already in use.` },
          { status: 409 }
        );
      }
      coupon.code = newCode;
    }

    if (body.description !== undefined) coupon.description = body.description.trim();
    if (body.discountType !== undefined) coupon.discountType = body.discountType;
    if (body.discountValue !== undefined) coupon.discountValue = Number(body.discountValue);
    if (body.maxDiscountAmount !== undefined)
      coupon.maxDiscountAmount = body.maxDiscountAmount ? Number(body.maxDiscountAmount) : undefined;
    if (body.minCartTotal !== undefined)
      coupon.minCartTotal = Number(body.minCartTotal) || 0;
    if (body.applicableProductIds !== undefined)
      coupon.applicableProductIds = body.applicableProductIds;
    if (body.requiredProductIds !== undefined)
      coupon.requiredProductIds = body.requiredProductIds;
    if (body.minItemQuantity !== undefined)
      coupon.minItemQuantity = Number(body.minItemQuantity) || 0;
    if (body.maxUses !== undefined)
      coupon.maxUses = body.maxUses ? Number(body.maxUses) : undefined;
    if (body.maxUsesPerUser !== undefined)
      coupon.maxUsesPerUser = Number(body.maxUsesPerUser) || 1;
    if (body.allowedUserIds !== undefined)
      coupon.allowedUserIds = body.allowedUserIds;
    if (body.referrerUserId !== undefined)
      coupon.referrerUserId = body.referrerUserId?.trim() || undefined;
    if (body.startDate !== undefined)
      coupon.startDate = body.startDate ? new Date(body.startDate) : undefined;
    if (body.endDate !== undefined)
      coupon.endDate = body.endDate ? new Date(body.endDate) : undefined;
    if (body.isActive !== undefined) coupon.isActive = Boolean(body.isActive);

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/coupons/[id]
 * Delete a coupon by ID.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Coupon "${deleted.code}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/coupons/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
