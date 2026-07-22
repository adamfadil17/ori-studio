import { Prisma } from "@/generated/prisma";

import { prisma } from "./prisma";

/** Never selected — the password hash must not leave this module's callers. */
const SELECT_PUBLIC = {
  id: true,
  name: true,
  email: true,
  role: true,
  created_at: true,
} satisfies Prisma.UserSelect;

/**
 * Admin listing of accounts, with optional name/email search and role filter.
 *
 * Ordered admins first so the people who can still manage the account list stay
 * visible at the top of page one.
 */
export async function listUsersForAdmin({
  page = 1,
  limit = 10,
  search,
  role,
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const where: Prisma.UserWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role ? { role } : {}),
  };

  const [total, data, adminCount] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: SELECT_PUBLIC,
      orderBy: [{ role: "asc" }, { created_at: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    // Drives the "last admin" lock in the UI — the API enforces it too, this
    // just avoids offering an action that is going to be refused.
    prisma.user.count({ where: { role: "admin" } }),
  ]);

  return {
    data,
    total,
    adminCount,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    page,
  };
}
