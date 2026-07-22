import { Prisma } from "@/generated/prisma";

import { prisma } from "./prisma";

/**
 * Admin listing: every position including inactive ones, active first, with
 * optional search and type/level/status filters.
 *
 * Includes the application count so an editor can see at a glance which roles
 * are drawing interest — and what a delete would detach.
 */
export async function listPositionsForAdmin({
  page = 1,
  limit = 10,
  search,
  type,
  level,
  active,
}: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  level?: string;
  /** true = active only, false = inactive only, undefined = both. */
  active?: boolean;
}) {
  const where: Prisma.OpenPositionWhereInput = {
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    ...(type ? { type: type as Prisma.OpenPositionWhereInput["type"] } : {}),
    ...(level ? { level: level as Prisma.OpenPositionWhereInput["level"] } : {}),
    ...(active === undefined ? {} : { isActive: active }),
  };

  const [total, data] = await Promise.all([
    prisma.openPosition.count({ where }),
    prisma.openPosition.findMany({
      where,
      include: { _count: { select: { careerApplications: true } } },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    page,
  };
}
