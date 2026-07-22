import "server-only";

import { cookies } from "next/headers";

import { AUTH_COOKIE, verifyToken, type JwtPayload } from "./auth";
import { assertSessionCurrent } from "./auth-guard";

/** Roles allowed into the dashboard. */
export const STAFF_ROLES = ["admin", "editor"];

/**
 * Read the signed-in user from the session cookie, for Server Components and
 * server actions (middleware uses `verifyToken` directly on the request).
 * Returns null when there is no valid session.
 *
 * Also rejects a session revoked by a password change or a deleted account —
 * middleware can't check that on the Edge runtime, so this is where a dashboard
 * request actually gets turned away.
 */
export async function getSession(): Promise<JwtPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    await assertSessionCurrent(payload);
    return payload;
  } catch {
    return null; // expired, tampered, or revoked
  }
}

/** True when the current session may access the dashboard. */
export async function isStaffSession(): Promise<boolean> {
  const session = await getSession();
  return session !== null && STAFF_ROLES.includes(session.role);
}