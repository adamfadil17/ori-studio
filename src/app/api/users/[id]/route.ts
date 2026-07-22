import { NextRequest } from "next/server";

import {
  prisma,
  handleError,
  requireAuth,
  requireRole,
  notFound,
  ok,
  noContent,
  updateUserSchema,
  hashPassword,
  passwordChangedAtNow,
  ApiError,
} from "@/lib";

const SELECT_PUBLIC = {
  id: true,
  name: true,
  email: true,
  role: true,
  created_at: true,
};

/**
 * Refuse to remove the last admin.
 *
 * There is no password-reset or self-service recovery flow, so an account set
 * with no admin left can only be repaired by re-running the seed or editing the
 * database directly — worth a 409 rather than trusting the UI to prevent it.
 */
async function assertNotLastAdmin(id: string, action: string) {
  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!target || target.role !== "admin") return;

  const admins = await prisma.user.count({ where: { role: "admin" } });
  if (admins <= 1) {
    throw new ApiError(
      409,
      `Cannot ${action} the last remaining admin — promote another user first.`,
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    const user = await prisma.user.findUnique({
      where: { id },
      select: SELECT_PUBLIC,
    });

    if (!user) return notFound("User");
    return ok(user);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    const body = await req.json();
    const { password, ...dto } = updateUserSchema.parse(body);

    // Changing your own role mid-session would drop your access without the
    // session cookie knowing about it — refuse rather than half-apply it.
    if (dto.role && id === payload.userId && dto.role !== payload.role) {
      throw new ApiError(
        400,
        "You cannot change your own role — ask another admin.",
      );
    }

    // Your own password has exactly one door: POST /api/auth/change-password,
    // which verifies the current one first. Allowing it here would skip that
    // check, and this route can't re-issue the session cookie — the caller
    // would revoke the very token they are using.
    if (password && id === payload.userId) {
      throw new ApiError(
        400,
        "Change your own password from My Account, which asks for your current password.",
      );
    }

    if (dto.role && dto.role !== "admin") {
      await assertNotLastAdmin(id, "demote");
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...dto,
        // Absent password means "leave it alone"; present means reset it —
        // which also ends every session that account currently has open.
        ...(password
          ? {
              password: await hashPassword(password),
              passwordChangedAt: passwordChangedAtNow(),
            }
          : {}),
      },
      select: SELECT_PUBLIC,
    });

    return ok(user);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payload = await requireAuth(req);
    requireRole(payload, "admin");

    if (id === payload.userId) {
      throw new ApiError(400, "You cannot delete your own account.");
    }
    await assertNotLastAdmin(id, "delete");

    await prisma.user.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
