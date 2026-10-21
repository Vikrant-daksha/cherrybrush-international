import { NextRequest, NextResponse } from "next/server";
import { getEligibleShippingMethods } from "@/lib/shippingService";

export const dynamic = "force-dynamic";

/**
 * GET /api/shipping?country=US&subtotal=1500
 * Fetches active shipping methods filtered by destination country and order subtotal.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "ALL";
    const subtotal = Number(searchParams.get("subtotal") || 0);

    const options = await getEligibleShippingMethods(country, subtotal);

    return NextResponse.json({
      success: true,
      country,
      count: options.length,
      data: options,
    });
  } catch (error: any) {
    console.error("GET /api/shipping error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve shipping options" },
      { status: 500 }
    );
  }
}
