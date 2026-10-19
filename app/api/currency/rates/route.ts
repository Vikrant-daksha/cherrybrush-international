import { NextRequest, NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/exchangeRates";
import { getStoreBaseCurrency } from "@/lib/storeSettings";

/**
 * GET /api/currency/rates
 * Returns exchange rates from MongoDB. If document is older than 24 hours, auto-refreshes.
 *
 * Query params (optional):
 * ?base=USD
 * ?force=true
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeBase = await getStoreBaseCurrency();
    const base = searchParams.get("base") || "USD";
    const force = searchParams.get("force") === "true";

    const result = await getExchangeRates(base, force);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        storeBaseCurrency: storeBase,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/currency/rates:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/currency/rates
 * Forces an immediate refresh from the external API and overwrites the MongoDB document.
 * Perfect for Vercel Cron or webhook triggers.
 */
export async function POST(request: NextRequest) {
  try {
    let base = "USD";

    // Allow passing { base: "EUR" } in JSON body if provided
    try {
      const body = await request.json();
      if (body?.base) base = body.base;
    } catch {
      // No JSON body provided, default to USD
    }

    const result = await getExchangeRates(base, true);

    return NextResponse.json({
      success: true,
      message: `Exchange rates for ${base.toUpperCase()} refreshed and saved to MongoDB.`,
      data: result,
    });
  } catch (error: any) {
    console.error("Error in POST /api/currency/rates:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to refresh exchange rates" },
      { status: 500 }
    );
  }
}
