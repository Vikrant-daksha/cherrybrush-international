import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import Coupon from "@/lib/coupon.model";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/coupons
 * List all coupons with optional search query.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();

    const filter: any = {};
    if (query) {
      filter.$or = [
        { code: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error: any) {
    console.error("GET /api/admin/coupons error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load coupons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/coupons
 * Create a new coupon.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const code = (body.code || "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    // Check code uniqueness
    const existing = await Coupon.findOne({ code });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Coupon code "${code}" already exists.` },
        { status: 409 }
      );
    }

    const discountType = body.discountType || "percentage";
    const discountValue = Number(body.discountValue) || 0;

    if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100)) {
      return NextResponse.json(
        { success: false, error: "Percentage discount must be between 1 and 100." },
        { status: 400 }
      );
    }

    if (discountType === "fixed" && discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: "Fixed discount amount must be greater than 0." },
        { status: 400 }
      );
    }

    const newCoupon = new Coupon({
      code,
      description: body.description?.trim() || undefined,
      discountType,
      discountValue,
      maxDiscountAmount: body.maxDiscountAmount ? Number(body.maxDiscountAmount) : undefined,
      minCartTotal: body.minCartTotal ? Number(body.minCartTotal) : 0,
      applicableProductIds: Array.isArray(body.applicableProductIds) ? body.applicableProductIds : [],
      requiredProductIds: Array.isArray(body.requiredProductIds) ? body.requiredProductIds : [],
      minItemQuantity: body.minItemQuantity ? Number(body.minItemQuantity) : 0,
      maxUses: body.maxUses ? Number(body.maxUses) : undefined,
      maxUsesPerUser: body.maxUsesPerUser ? Number(body.maxUsesPerUser) : 1,
      allowedUserIds: Array.isArray(body.allowedUserIds) ? body.allowedUserIds : [],
      referrerUserId: body.referrerUserId?.trim() || undefined,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    await newCoupon.save();

    return NextResponse.json({
      success: true,
      message: `Coupon "${code}" created successfully.`,
      coupon: newCoupon,
    });
  } catch (error: any) {
    console.error("POST /api/admin/coupons error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}
