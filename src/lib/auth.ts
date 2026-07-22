import * as jose from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change-me-in-production",
);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function signToken(
  payload: Omit<JwtPayload, "iat" | "exp">,
): Promise<string> {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jose.jwtVerify(token, JWT_SECRET);
  return payload as unknown as JwtPayload;
}

/** Name of the httpOnly session cookie set on login. */
export const AUTH_COOKIE = "token";

/** Cookie options for the session token (shared by login, register, logout). */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Session lifetime, kept in step with JWT_EXPIRES_IN (default 7d). */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** Attach the session cookie to a response (sign-in / sign-up). */
export function setSessionCookie<T extends NextResponse>(
  response: T,
  token: string,
): T {
  response.cookies.set(AUTH_COOKIE, token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}

/** Expire the session cookie (sign-out). Must match the attributes it was set with. */
export function clearSessionCookie<T extends NextResponse>(response: T): T {
  response.cookies.set(AUTH_COOKIE, "", {
    ...AUTH_COOKIE_OPTIONS,
    expires: new Date(0),
  });
  return response;
}

/**
 * Every place a JWT may arrive, in priority order: `Authorization: Bearer …`
 * (client-side fetches) then the httpOnly cookie (browser navigations,
 * middleware, RSC). Supporting both means the same API routes serve either style.
 */
function candidateTokens(req: NextRequest): string[] {
  const tokens: string[] = [];

  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) tokens.push(authHeader.slice(7));

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie) tokens.push(cookie);

  return tokens;
}

/** The highest-priority token present (does NOT check that it's valid). */
export function extractToken(req: NextRequest): string | null {
  return candidateTokens(req)[0] ?? null;
}

/**
 * Resolve the caller's session. Each candidate is verified in turn, so a stale
 * or malformed Bearer header can't shadow a perfectly valid session cookie —
 * that combination used to fail with a confusing 401.
 */
export async function getAuthPayload(
  req: NextRequest,
): Promise<JwtPayload | null> {
  for (const token of candidateTokens(req)) {
    try {
      return await verifyToken(token);
    } catch {
      // Try the next source rather than failing outright.
    }
  }
  return null;
}

// `requireAuth` deliberately lives in ./auth-guard, not here: it reads the
// database to honour password-change revocation, and this module is imported by
// the Edge middleware, which cannot bundle Prisma.

export function requireRole(payload: JwtPayload, ...roles: string[]): void {
  if (!roles.includes(payload.role)) {
    throw new ApiError(403, `Forbidden — required role: ${roles.join(" | ")}`);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
