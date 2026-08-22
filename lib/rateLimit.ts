interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_REQUESTS = 100; // 100 requests
const WINDOW_MS = 60 * 1000; // 1 minute (60,000 ms)

// Cleanup stale IP records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter(
        (time) => now - time < WINDOW_MS,
      );
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Enforces a sliding window rate limit of 100 requests per minute per IP.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const clientRecord = rateLimitMap.get(ip) || { timestamps: [] };

  // Filter out timestamps older than 60 seconds
  const validTimestamps = clientRecord.timestamps.filter(
    (time) => now - time < WINDOW_MS,
  );

  const requestCount = validTimestamps.length;
  const oldestTimestamp = validTimestamps[0] || now;
  const resetSeconds = Math.ceil((oldestTimestamp + WINDOW_MS - now) / 1000);

  if (requestCount >= MAX_REQUESTS) {
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  // Record current timestamp
  validTimestamps.push(now);
  rateLimitMap.set(ip, { timestamps: validTimestamps });

  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - validTimestamps.length,
    resetSeconds: Math.max(1, resetSeconds),
  };
}
