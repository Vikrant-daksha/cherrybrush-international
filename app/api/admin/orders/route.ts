import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import Order from "@/lib/order.model";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders
 * Returns all user orders with optional status filter and text search.
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
    const status = searchParams.get("status");
    const query = searchParams.get("query");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (status && status !== "all") {
      filter.orderStatus = status;
    }

    if (query) {
      const trimmed = query.trim();
      const regex = new RegExp(trimmed, "i");
      filter.$or = [
        { orderNumber: regex },
        { "customer.name": regex },
        { "customer.email": regex },
        { "customer.phone": regex },
      ];
    }

    // Execute paginated query and total count in parallel using Mongo skip and limit
    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalOrders / limit) || 1;

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load orders" },
      { status: 500 }
    );
  }
}
