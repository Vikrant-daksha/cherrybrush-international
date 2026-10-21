import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import User from "@/lib/user.model";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Returns list of all users for the admin dashboard (excluding password hash).
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
    const query = searchParams.get("query");
    const role = searchParams.get("role");

    const filter: any = {};
    if (role && role !== "all") {
      filter.role = role;
    }

    if (query) {
      const regex = new RegExp(query.trim(), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone || u.phoneNumber || "—",
      role: u.role || "user",
      ordersCount: Array.isArray(u.orders) ? u.orders.length : 0,
      cartCount: Array.isArray(u.cart) ? u.cart.length : 0,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load users" },
      { status: 500 }
    );
  }
}
