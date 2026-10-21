import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import Order from "@/lib/order.model";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orders/[id]
 * Fetch single order snapshot details.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId
      ? { $or: [{ _id: id }, { orderNumber: id }] }
      : { orderNumber: id };

    const order = await Order.findOne(query).lean();
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order status (pending, processing, paid, shipped, delivered, cancelled) or admin notes.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const allowedStatuses = [
      "pending",
      "processing",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];

    const updateFields: any = {};
    if (body.orderStatus) {
      if (!allowedStatuses.includes(body.orderStatus)) {
        return NextResponse.json(
          { success: false, error: "Invalid order status value" },
          { status: 400 }
        );
      }
      updateFields.orderStatus = body.orderStatus;
    }

    if (body.adminNotes !== undefined) {
      updateFields.adminNotes = String(body.adminNotes).trim();
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId
      ? { $or: [{ _id: id }, { orderNumber: id }] }
      : { orderNumber: id };

    const updated = await Order.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
