import { NextRequest } from "next/server";

export interface GeoLocationResult {
  country: string; // 2-letter ISO country code (e.g., "US", "IN", "GB")
  city?: string;
  region?: string;
  ip: string;
  currency: string; // Recommended currency code (e.g., "USD", "INR", "GBP")
  provider: "vercel" | "cloudflare" | "cloudfront" | "custom" | "fallback";
}

/**
 * Mapping of ISO 3166-1 alpha-2 country codes to their official or primary currency.
 */
const COUNTRY_TO_CURRENCY_MAP: Record<string, string> = {
  // North America
  US: "USD",
  CA: "CAD",
  MX: "MXN",

  // United Kingdom & Eurozone
  GB: "GBP",
  AT: "EUR", // Austria
  BE: "EUR", // Belgium
  CY: "EUR", // Cyprus
  EE: "EUR", // Estonia
  FI: "EUR", // Finland
  FR: "EUR", // France
  DE: "EUR", // Germany
  GR: "EUR", // Greece
  IE: "EUR", // Ireland
  IT: "EUR", // Italy
  LV: "EUR", // Latvia
  LT: "EUR", // Lithuania
  LU: "EUR", // Luxembourg
  MT: "EUR", // Malta
  NL: "EUR", // Netherlands
  PT: "EUR", // Portugal
  SK: "EUR", // Slovakia
  SI: "EUR", // Slovenia
  ES: "EUR", // Spain
  HR: "EUR", // Croatia

  // Other European Countries
  CH: "CHF", // Switzerland
  SE: "SEK", // Sweden
  NO: "NOK", // Norway
  DK: "DKK", // Denmark
  PL: "PLN", // Poland
  CZ: "CZK", // Czech Republic
  HU: "HUF", // Hungary
  RO: "RON", // Romania

  // Asia & Oceania
  IN: "INR", // India
  AU: "AUD", // Australia
  NZ: "NZD", // New Zealand
  SG: "SGD", // Singapore
  JP: "JPY", // Japan
  HK: "HKD", // Hong Kong
  KR: "KRW", // South Korea
  CN: "CNY", // China
  MY: "MYR", // Malaysia
  TH: "THB", // Thailand
  PH: "PHP", // Philippines
  ID: "IDR", // Indonesia
  VN: "VND", // Vietnam
  PK: "PKR", // Pakistan
  BD: "BDT", // Bangladesh
  LK: "LKR", // Sri Lanka
  NP: "NPR", // Nepal

  // Middle East
  AE: "AED", // United Arab Emirates
  SA: "SAR", // Saudi Arabia
  QA: "QAR", // Qatar
  KW: "KWD", // Kuwait
  BH: "BHD", // Bahrain
  OM: "OMR", // Oman
  IL: "ILS", // Israel
  TR: "TRY", // Turkey
  JO: "JOD", // Jordan

  // Africa
  ZA: "ZAR", // South Africa
  EG: "EGP", // Egypt
  NG: "NGN", // Nigeria
  KE: "KES", // Kenya
  GH: "GHS", // Ghana
  MA: "MAD", // Morocco

  // South America
  BR: "BRL", // Brazil
  CL: "CLP", // Chile
  CO: "COP", // Colombia
};

/**
 * Extracts geographical location data from HTTP request headers.
 * Supports Vercel Edge, Cloudflare Workers/CDN, AWS CloudFront, and custom proxies.
 *
 * @param headers - Standard Web Headers or Next.js headers object
 * @param fallbackCurrency - Currency to default to if no country detected (default: "USD")
 */
export function extractGeoFromHeaders(
  headers: Headers | { get: (name: string) => string | null | undefined },
  fallbackCurrency: string = "USD"
): GeoLocationResult {
  // ── 1. Client IP Address ──
  // Cloudflare: cf-connecting-ip
  // Vercel / Standard Proxy: x-real-ip, x-forwarded-for
  const cfIp = headers.get("cf-connecting-ip");
  const xRealIp = headers.get("x-real-ip");
  const xForwardedFor = headers.get("x-forwarded-for");
  const clientIp =
    cfIp ||
    xRealIp ||
    (xForwardedFor ? xForwardedFor.split(",")[0].trim() : "127.0.0.1");

  // ── 2. Cloudflare Geolocation Headers ──
  // Cloudflare automatically appends these headers when proxied through their network:
  // - cf-ipcountry (e.g., "US", "IN", "GB", "XX", "T1")
  // - cf-ipcity (e.g., "London", "Mumbai")
  // - cf-region or cf-region-code
  const cfCountry = headers.get("cf-ipcountry");
  const cfCity = headers.get("cf-ipcity");
  const cfRegion = headers.get("cf-region") || headers.get("cf-region-code");

  if (cfCountry && cfCountry.length === 2 && cfCountry !== "XX" && cfCountry !== "T1") {
    const countryUpper = cfCountry.toUpperCase();
    const currency = COUNTRY_TO_CURRENCY_MAP[countryUpper] || fallbackCurrency;
    return {
      country: countryUpper,
      city: cfCity || undefined,
      region: cfRegion || undefined,
      ip: clientIp,
      currency,
      provider: "cloudflare",
    };
  }

  // ── 3. Vercel Geolocation Headers ──
  // Vercel Edge network automatically injects:
  // - x-vercel-ip-country (e.g., "US", "IN")
  // - x-vercel-ip-city (e.g., "San Francisco")
  // - x-vercel-ip-country-region (e.g., "CA")
  const vercelCountry = headers.get("x-vercel-ip-country");
  const vercelCity = headers.get("x-vercel-ip-city");
  const vercelRegion = headers.get("x-vercel-ip-country-region");

  if (vercelCountry && vercelCountry.length === 2) {
    const countryUpper = vercelCountry.toUpperCase();
    const currency = COUNTRY_TO_CURRENCY_MAP[countryUpper] || fallbackCurrency;
    return {
      country: countryUpper,
      city: vercelCity ? decodeURIComponent(vercelCity) : undefined,
      region: vercelRegion || undefined,
      ip: clientIp,
      currency,
      provider: "vercel",
    };
  }

  // ── 4. AWS CloudFront / Alternative CDN ──
  const cloudfrontCountry = headers.get("cloudfront-viewer-country");
  if (cloudfrontCountry && cloudfrontCountry.length === 2) {
    const countryUpper = cloudfrontCountry.toUpperCase();
    const currency = COUNTRY_TO_CURRENCY_MAP[countryUpper] || fallbackCurrency;
    return {
      country: countryUpper,
      ip: clientIp,
      currency,
      provider: "cloudfront",
    };
  }

  // ── 5. Localhost / Direct fallback ──
  return {
    country: "US",
    ip: clientIp,
    currency: fallbackCurrency,
    provider: "fallback",
  };
}

/**
 * Helper to detect location directly from a NextRequest instance
 */
export function getRequestGeo(
  request: NextRequest,
  fallbackCurrency: string = "USD"
): GeoLocationResult {
  return extractGeoFromHeaders(request.headers, fallbackCurrency);
}
