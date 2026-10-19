import { NextRequest, NextResponse } from "next/server";
import { getRequestGeo } from "@/lib/geo";
import { getStoreBaseCurrency } from "@/lib/storeSettings";

/**
 * GET /api/geo
 * Inspects incoming request headers (Cloudflare, Vercel, CloudFront)
 * and returns client location data and suggested currency.
 */
export async function GET(request: NextRequest) {
  try {
    const storeBase = await getStoreBaseCurrency();
    const geo = getRequestGeo(request, storeBase);

    return NextResponse.json({
      success: true,
      data: geo,
    });
  } catch (error: any) {
    console.error("GET /api/geo error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to detect location",
      },
      { status: 500 }
    );
  }
}
