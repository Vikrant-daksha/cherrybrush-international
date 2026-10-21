import { NextRequest, NextResponse } from "next/server";
import { getPayPalOrderDetails } from "@/lib/paypal";

export const dynamic = "force-dynamic";

/**
 * GET /api/paypal/order-status/[id]
 *
 * RESTful endpoint to query real-time order state directly from PayPal.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "PayPal order ID is required." },
        { status: 400 }
      );
    }

    const details = await getPayPalOrderDetails(id);

    return NextResponse.json({
      success: true,
      paypalOrder: details,
    });
  } catch (error: any) {
    console.error("Fetch PayPal order status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve PayPal order details.",
      },
      { status: 500 }
    );
  }
}
