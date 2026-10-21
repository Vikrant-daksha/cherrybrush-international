import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/user.model";
import Order from "@/lib/order.model";
import { getUserSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/profile
 * Retrieves authenticated customer profile and order statistics.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getUserSession(req);
    const headerEmail = req.headers.get("x-user-email");
    const userEmail = (session?.email || headerEmail || "").toLowerCase().trim();

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: userEmail }).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    // Compute live order statistics
    const ordersCount = await Order.countDocuments({
      "customer.email": userEmail,
    });
    const pendingCount = await Order.countDocuments({
      "customer.email": userEmail,
      orderStatus: { $in: ["pending", "processing", "shipped"] },
    });
    const completedCount = await Order.countDocuments({
      "customer.email": userEmail,
      orderStatus: "delivered",
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || (user as any).phoneNumber || "",
        role: user.role,
        createdAt: (user as any).createdAt,
        stats: {
          totalOrders: ordersCount,
          activeOrders: pendingCount,
          completedOrders: completedCount,
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Allows updating personal details (name, phone).
 */
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const session = await getUserSession(req);
    const headerEmail = req.headers.get("x-user-email");
    const userEmail = (session?.email || headerEmail || "").toLowerCase().trim();

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone } = body;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (name && typeof name === "string") {
      user.name = name.trim();
    }
    if (phone !== undefined && typeof phone === "string") {
      user.phone = phone.trim();
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
