import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/order.model";
import { createOrderSnapshot, CreateOrderInput } from "@/lib/orderService";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders
 * Creates a new immutable Order Snapshot in MongoDB.
 * Product prices and availability are verified directly from MongoDB.
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderInput = await req.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Items array is required and cannot be empty." },
        { status: 400 }
      );
    }

    if (!body.customer?.email || !body.customer?.name) {
      return NextResponse.json(
        { success: false, error: "Customer name and email are required." },
        { status: 400 }
      );
    }

    if (
      !body.shippingAddress?.fullName ||
      !body.shippingAddress?.addressLine1 ||
      !body.shippingAddress?.city ||
      !body.shippingAddress?.postalCode ||
      !body.shippingAddress?.country
    ) {
      return NextResponse.json(
        { success: false, error: "Complete shipping address is required." },
        { status: 400 }
      );
    }

    const order = await createOrderSnapshot(body);

    return NextResponse.json(
      {
        success: true,
        message: "Order snapshot created successfully.",
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create order snapshot.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Retrieves orders list (filter by email, status, or recent).
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const status = searchParams.get("status");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    const filter: Record<string, any> = {};
    if (email) filter["customer.email"] = email.toLowerCase().trim();
    if (status) filter.orderStatus = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
