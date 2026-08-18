import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/lib/user.model";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if account already exists with this email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default role: "user" (NEVER admin by default)
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully with standard user role. You must manually grant role: 'admin' in MongoDB to access the admin portal.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
