import type { NextRequest } from "next/server";

import { ApiError, getAuthPayload, type JwtPayload } from "./auth";
import { prisma } from "./prisma";

/**
 * Session checks that need the database, kept out of `./auth` so the Edge
 * middleware — which imports that module — doesn't pull Prisma into its bundle.
 *
 * The consequence is that middleware can only verify the token's signature. A
 * revoked session still passes it and is caught one layer in: API routes
 * through `requireAuth`, dashboard pages through `getSession` in ./session.
 */

/**
 * Reject a token that is no longer backed by a current account.
 *
 * Covers two cases a stateless JWT can't express on its own:
 *   - the account was deleted while the token was still inside its 7 days
 *   - the password changed, which must log every older session out
 *
 * `iat` is in whole seconds, so `passwordChangedAt` is stored truncated to the
 * second (see `passwordChangedAtNow`). A token minted in the same second as the
 * change therefore survives — that's the token we just handed the user for
 * their new password, and rejecting it would log them out of the very request
 * that changed it.
 */
export async function assertSessionCurrent(payload: JwtPayload): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { passwordChangedAt: true },
  });

  if (!user) {
    throw new ApiError(401, "Unauthorized — this account no longer exists");
  }

  if (
    user.passwordChangedAt &&
    payload.iat !== undefined &&
    payload.iat * 1000 < user.passwordChangedAt.getTime()
  ) {
    throw new ApiError(
      401,
      "Session ended — the password for this account was changed",
    );
  }
}

/** Timestamp to write whenever a password changes, floored to the second. */
export function passwordChangedAtNow(): Date {
  return new Date(Math.floor(Date.now() / 1000) * 1000);
}

/**
 * The guard every authenticated API route uses: valid token *and* a session
 * that hasn't been revoked.
 */
export async function requireAuth(req: NextRequest): Promise<JwtPayload> {
  const payload = await getAuthPayload(req);
  if (!payload) {
    throw new ApiError(401, "Unauthorized — invalid or missing token");
  }
  await assertSessionCurrent(payload);
  return payload;
}
