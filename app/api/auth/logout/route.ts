import { NextResponse } from "next/server";
import { USER_AUTH_COOKIE_NAME, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.delete(USER_AUTH_COOKIE_NAME);
  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}
