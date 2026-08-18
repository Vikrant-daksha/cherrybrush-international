import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/user.model";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 2. Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Verify Admin Role (Must be manually set to 'admin' in DB)
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Access denied. Your account is registered as a standard user. You must manually change your role to 'admin' in MongoDB to access the admin portal.",
        },
        { status: 403 }
      );
    }

    // 4. Generate JWT Token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 5. Create Response and set secure HTTP-Only Cookie
    const response = NextResponse.json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true, // Cannot be accessed by client JS (XSS safe)
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
