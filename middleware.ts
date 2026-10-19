import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { extractGeoFromHeaders } from "@/lib/geo";

export function middleware(request: NextRequest) {
  // Extract client IP address reliably from headers
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "127.0.0.1";

  const rateResult = checkRateLimit(ip);

  // If client exceeds 100 requests per minute, reject with HTTP 429
  if (!rateResult.success) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message:
          "API rate limit exceeded. You are allowed a maximum of 100 requests per minute.",
        retryAfterSeconds: rateResult.resetSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateResult.resetSeconds),
          "X-RateLimit-Limit": String(rateResult.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateResult.resetSeconds),
        },
      },
    );
  }

  // Detect visitor country and currency from Cloudflare / Vercel headers
  const geo = extractGeoFromHeaders(request.headers);

  // Continue to route & append metadata to response headers
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(rateResult.limit));
  response.headers.set("X-RateLimit-Remaining", String(rateResult.remaining));
  response.headers.set("X-RateLimit-Reset", String(rateResult.resetSeconds));
  response.headers.set("X-User-Country", geo.country);
  response.headers.set("X-User-Currency", geo.currency);

  return response;
}

export const config = {
  matcher: [
    // Apply rate limiting to all /api routes and dynamic pages, skipping static assets
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
