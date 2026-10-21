import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "FallBackSecretKey";
export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME || "cherry_admin_token";

export interface AdminPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Generate a signed JWT token
 */
export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract and verify admin session from Request cookies
 */
export async function getAdminSession(
  req?: NextRequest,
): Promise<AdminPayload | null> {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    }

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") return null;

    return payload;
  } catch {
    return null;
  }
}

export const USER_AUTH_COOKIE_NAME = "cherry_user_session";

export interface UserSessionPayload {
  userId: string;
  email: string;
  name?: string;
  role?: string;
}

/**
 * Generate a signed JWT token for regular customer sessions
 */
export function signUserToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
  });
}

/**
 * Verify and decode a customer JWT token
 */
export function verifyUserToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract and verify customer session from Request cookies
 */
export async function getUserSession(
  req?: NextRequest,
): Promise<UserSessionPayload | null> {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(USER_AUTH_COOKIE_NAME)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(USER_AUTH_COOKIE_NAME)?.value;
    }

    if (!token) return null;

    return verifyUserToken(token);
  } catch {
    return null;
  }
}
