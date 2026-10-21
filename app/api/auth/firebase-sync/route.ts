import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/user.model";
import { signUserToken, USER_AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { uid, email, name, phone, photoURL } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for account synchronization" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email in MongoDB
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new MongoDB user document
      user = await User.create({
        name: name || email.split("@")[0],
        email: normalizedEmail,
        phone: phone || undefined,
        password: `firebase_${uid}`, // Placeholder for OAuth/Firebase users
        role: "user",
        orders: [],
        cart: [],
      });
    } else {
      // Update phone or name if provided and not previously set
      let modified = false;
      if (phone && !user.phone) {
        user.phone = phone;
        modified = true;
      }
      if (name && (!user.name || user.name === email.split("@")[0])) {
        user.name = name;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    }

    const userSessionToken = signUserToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || user.phoneNumber,
        role: user.role,
        ordersCount: user.orders?.length || 0,
      },
    });

    response.cookies.set({
      name: USER_AUTH_COOKIE_NAME,
      value: userSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("Firebase sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync user with database" },
      { status: 500 }
    );
  }
}
