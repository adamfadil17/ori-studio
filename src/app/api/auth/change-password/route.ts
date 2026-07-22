import { NextRequest } from "next/server";

import {
  changePasswordSchema,
  comparePassword,
  handleError,
  hashPassword,
  ok,
  passwordChangedAtNow,
  prisma,
  rateLimit,
  requireAuth,
  setSessionCookie,
  signToken,
  unauthorized,
} from "@/lib";

/**
 * Change your own password. Available to every signed-in account, unlike
 * PATCH /api/users/[id], which is admin-only — an editor has no other way to
 * rotate their own credentials.
 */
export async function POST(req: NextRequest) {
  try {
    // A valid session is already required, so this is not the main line of
    // defence — it just stops an unattended browser being used to guess the
    // current password at speed.
    const limited = rateLimit(req, "auth:change-password", 5, 60_000);
    if (limited) return limited;

    const payload = await requireAuth(req);
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      await req.json(),
    );

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, password: true },
    });
    if (!user) return unauthorized("Account no longer exists");

    if (!(await comparePassword(currentPassword, user.password))) {
      return unauthorized("Current password is incorrect");
    }

    // Stamped before the new token is signed so the token's `iat` is never
    // older than the change — otherwise this response would hand back a
    // session that the next request rejects.
    const changedAt = passwordChangedAtNow();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(newPassword),
        passwordChangedAt: changedAt,
      },
    });

    // Every other session for this account is now dead. Re-issue this one so
    // the person who just changed their password stays signed in here.
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return setSessionCookie(
      ok({ changedAt: changedAt.toISOString(), otherSessionsEnded: true }),
      token,
    );
  } catch (error) {
    return handleError(error);
  }
}
