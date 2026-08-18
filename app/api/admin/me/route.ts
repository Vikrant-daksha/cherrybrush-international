import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access only" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin session" },
      { status: 500 }
    );
  }
}
