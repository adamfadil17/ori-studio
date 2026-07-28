import { Prisma } from "@/generated/prisma";

import { prisma } from "./prisma";
import { humanizeEnum } from "./format";
import type { PublicPosition } from "./types";

/**
 * Public careers section: active positions only, enums humanized for display
 * (`FULL_TIME` → "Full Time"). Returns the lean {@link PublicPosition} shape the
 * contact-page components consume.
 */
export async function listActivePositions(): Promise<PublicPosition[]> {
  const rows = await prisma.openPosition.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: "desc" }],
  });
  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    type: humanizeEnum(p.type),
    level: humanizeEnum(p.level),
    desc: p.description,
  }));
}

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
