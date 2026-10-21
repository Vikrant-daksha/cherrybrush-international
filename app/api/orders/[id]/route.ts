import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/lib/order.model";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders/[id]
 * Fetch a single order snapshot by MongoDB _id, orderNumber, or idempotencyKey.
 * Includes computed resume state for checkout restoration.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID or order number is required." },
        { status: 400 }
      );
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId
      ? { $or: [{ _id: id }, { orderNumber: id }, { idempotencyKey: id }] }
      : { $or: [{ orderNumber: id }, { idempotencyKey: id }] };

    const order: any = await Order.findOne(query).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    const isPaid = order.payment?.status === "completed" || order.orderStatus === "paid";
    const isCancelled = order.orderStatus === "cancelled";

    let resumeStep: "completed" | "payment" | "shipping" | "cancelled" = "shipping";
    if (isPaid) {
      resumeStep = "completed";
    } else if (isCancelled) {
      resumeStep = "cancelled";
    } else if (order.payment?.paypalOrderId) {
      resumeStep = "payment";
    }

    return NextResponse.json({
      success: true,
      order,
      resumeState: {
        isPaid,
        canResume: !isPaid && !isCancelled,
        resumeStep,
        paypalOrderId: order.payment?.paypalOrderId || null,
      },
    });
  } catch (error: any) {
    console.error("Get order details error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve order." },
      { status: 500 }
    );
  }
}
