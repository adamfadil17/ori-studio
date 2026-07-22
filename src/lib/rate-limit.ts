import { NextResponse, type NextRequest } from "next/server";

import type { ApiResponse } from "./api-response";

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory fixed-window counter. Good enough for a single self-hosted Node
// instance; for serverless/multi-instance, back this with Redis/Upstash.
const store = new Map<string, Bucket>();

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Fixed-window rate limit keyed by `<key>:<ip>`. Returns a 429 `NextResponse`
 * when the caller is over the limit, or `null` when the request may proceed.
 *
 *   const limited = rateLimit(req, "contact:inquiry");
 *   if (limited) return limited;
 */
export function rateLimit(
  req: NextRequest,
  key: string,
  limit = 5,
  windowMs = 60_000,
): NextResponse<ApiResponse> | null {
  const id = `${key}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = store.get(id);

  if (!bucket || now > bucket.resetAt) {
    store.set(id, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  bucket.count += 1;
  return null;
}
