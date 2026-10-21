import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/order.model";
import { getUserSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/orders
 * Secure endpoint to fetch orders belonging exclusively to the authenticated customer.
 * Strict multi-tenant isolation ensures users can NEVER inspect other users' orders.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 1. Resolve customer identity from secure HTTP-only session cookie
    const session = await getUserSession(req);

    // Fallback: Check custom request header from authenticated Firebase client
    const headerEmail = req.headers.get("x-user-email");
    const headerUserId = req.headers.get("x-user-id");

    const userEmail = (session?.email || headerEmail || "")
      .toLowerCase()
      .trim();
    const userId = session?.userId || headerUserId || "";

    if (!userEmail && !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Please sign in to view your orders.",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    // 2. Strict Customer Isolation Filter
    const isolationClauses: any[] = [];
    if (userEmail) {
      isolationClauses.push({ "customer.email": userEmail });
    }
    if (userId) {
      isolationClauses.push({ "customer.userId": userId });
    }

    const filter: any = {
      $or: isolationClauses,
    };

    if (status && status !== "all") {
      filter.orderStatus = status;
    }

    if (query) {
      const trimmed = query.trim();
      const searchRegex = new RegExp(trimmed, "i");
      filter.$and = [
        {
          $or: [{ orderNumber: searchRegex }, { "items.name": searchRegex }],
        },
      ];
    }

    // 3. Fetch orders sorted newest first
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("GET /api/user/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load orders" },
      { status: 500 },
    );
  }
}
