import { NextRequest, NextResponse } from "next/server";
import { validateAndCalculateCoupon } from "@/lib/couponService";
import { getUserSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/coupons/validate
 * Validates a coupon code against MongoDB rules and computes verified discount.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, items, subtotal, currency } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: "Please provide a coupon code." },
        { status: 400 }
      );
    }

    // Resolve optional authenticated user session
    const session = await getUserSession(req);
    const userId = session?.userId || body.userId;
    const userEmail = session?.email || body.userEmail;

    const result = await validateAndCalculateCoupon({
      code: code.trim(),
      items: Array.isArray(items) ? items : [],
      subtotal: typeof subtotal === "number" ? subtotal : 0,
      currency: currency || "USD",
      userId,
      userEmail,
    });

    if (!result.isValid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: result.error || "Coupon could not be applied.",
          discountAmount: 0,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      code: result.code,
      description: result.description,
      discountType: result.discountType,
      discountValue: result.discountValue,
      discountAmount: result.discountAmount,
      isFreeShipping: result.isFreeShipping || false,
      couponId: result.couponId,
    });
  } catch (error: any) {
    console.error("Coupon validation endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: error.message || "Failed to validate coupon.",
        discountAmount: 0,
      },
      { status: 500 }
    );
  }
}
