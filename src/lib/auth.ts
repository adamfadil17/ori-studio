import * as jose from "jose";
import { NextRequest } from "next/server";

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

export function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export async function getAuthPayload(
  req: NextRequest,
): Promise<JwtPayload | null> {
  try {
    const token = extractToken(req);
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest): Promise<JwtPayload> {
  const payload = await getAuthPayload(req);
  if (!payload)
    throw new ApiError(401, "Unauthorized — invalid or missing token");
  return payload;
}

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
