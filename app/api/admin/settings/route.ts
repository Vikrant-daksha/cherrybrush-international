import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getStoreBaseCurrency, setStoreBaseCurrency } from "@/lib/storeSettings";

/**
 * GET /api/admin/settings
 * Retrieves current admin store settings (base currency).
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const baseCurrency = await getStoreBaseCurrency();

    return NextResponse.json({
      success: true,
      data: {
        baseCurrency,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Updates admin store settings (base currency).
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { baseCurrency } = body;

    if (!baseCurrency || typeof baseCurrency !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid baseCurrency provided" },
        { status: 400 }
      );
    }

    const updatedBase = await setStoreBaseCurrency(baseCurrency);

    return NextResponse.json({
      success: true,
      message: `Store base currency updated to ${updatedBase}`,
      data: {
        baseCurrency: updatedBase,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
