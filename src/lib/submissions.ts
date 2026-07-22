import { humanizeEnum } from "./format";
import { prisma } from "./prisma";
import type {
  SubmissionCounts,
  SubmissionListItem,
  SubmissionStatus,
  SubmissionType,
} from "./types";
import type { SubmissionKind } from "./validators";

/** URL slug ⇄ discriminator. The three channels live in their own tables. */
export const KIND_TO_TYPE: Record<SubmissionKind, SubmissionType> = {
  inquiry: "PROJECT_INQUIRY",
  partnership: "PARTNERSHIP",
  career: "CAREER",
};

export const TYPE_TO_KIND: Record<SubmissionType, SubmissionKind> = {
  PROJECT_INQUIRY: "inquiry",
  PARTNERSHIP: "partnership",
  CAREER: "career",
};

export const ALL_SUBMISSION_TYPES: SubmissionType[] = [
  "PROJECT_INQUIRY",
  "PARTNERSHIP",
  "CAREER",
];

type Filter = { status?: SubmissionStatus; search?: string };

const textSearch = (search: string | undefined, fields: string[]) =>
  search
    ? {
        OR: fields.map((f) => ({
          [f]: { contains: search, mode: "insensitive" as const },
        })),
      }
    : {};

/**
 * Fetch a single channel as normalized list rows, plus its filtered total.
 * `take` bounds each query so the merged global ordering stays correct for the
 * requested page without pulling whole tables.
 */
async function collect(
  type: SubmissionType,
  { status, search }: Filter,
  take: number,
): Promise<{ items: SubmissionListItem[]; total: number }> {
  const statusWhere = status ? { status } : {};

  switch (type) {
    case "PROJECT_INQUIRY": {
      const where = {
        ...statusWhere,
        ...textSearch(search, ["fullName", "email"]),
      };
      const [total, rows] = await Promise.all([
        prisma.contactInquiry.count({ where }),
        prisma.contactInquiry.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take,
        }),
      ]);
      return {
        total,
        items: rows.map((r) => ({
          id: r.id,
          type: "PROJECT_INQUIRY",
          status: r.status,
          name: r.fullName,
          email: r.email,
          phoneNumber: r.phoneNumber,
          subject: r.serviceTypeOther || humanizeEnum(r.serviceType),
          createdAt: r.createdAt.toISOString(),
        })),
      };
    }
    case "PARTNERSHIP": {
      const where = {
        ...statusWhere,
        ...textSearch(search, ["companyName", "email"]),
      };
      const [total, rows] = await Promise.all([
        prisma.contactPartnership.count({ where }),
        prisma.contactPartnership.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take,
        }),
      ]);
      return {
        total,
        items: rows.map((r) => ({
          id: r.id,
          type: "PARTNERSHIP",
          status: r.status,
          name: r.companyName,
          email: r.email,
          phoneNumber: r.phoneNumber,
          subject: r.partnershipOther || humanizeEnum(r.partnershipType),
          createdAt: r.createdAt.toISOString(),
        })),
      };
    }
    case "CAREER": {
      const where = {
        ...statusWhere,
        ...textSearch(search, ["fullName", "email"]),
      };
      const [total, rows] = await Promise.all([
        prisma.contactCareer.count({ where }),
        prisma.contactCareer.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take,
        }),
      ]);
      return {
        total,
        items: rows.map((r) => ({
          id: r.id,
          type: "CAREER",
          status: r.status,
          name: r.fullName,
          email: r.email,
          phoneNumber: r.phoneNumber,
          subject: r.positionOfInterest,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    }
  }
}

/** Whole-inbox counts for dashboard badges (independent of the active filter). */
export async function computeSubmissionCounts(): Promise<SubmissionCounts> {
  const [inq, part, car] = await Promise.all([
    prisma.contactInquiry.groupBy({ by: ["status"], _count: true }),
    prisma.contactPartnership.groupBy({ by: ["status"], _count: true }),
    prisma.contactCareer.groupBy({ by: ["status"], _count: true }),
  ]);

  const byStatus: Record<SubmissionStatus, number> = {
    NEW: 0,
    REVIEWED: 0,
    QUOTED: 0,
    BOOKED: 0,
    ARCHIVED: 0,
  };
  const sum = (groups: { status: SubmissionStatus; _count: number }[]) => {
    let total = 0;
    for (const g of groups) {
      byStatus[g.status] += g._count;
      total += g._count;
    }
    return total;
  };

  const byType: Record<SubmissionType, number> = {
    PROJECT_INQUIRY: sum(inq),
    PARTNERSHIP: sum(part),
    CAREER: sum(car),
  };

  return {
    total: byType.PROJECT_INQUIRY + byType.PARTNERSHIP + byType.CAREER,
    byType,
    byStatus,
  };
}

/**
 * Unified inbox across the three contact channels.
 *
 * With no `type` filter the three tables are merged in memory: each is capped
 * at `page * limit` rows so the global ordering for the requested page is
 * correct without reading whole tables. Fine at a studio's volume; revisit with
 * a materialised view if submissions ever reach tens of thousands.
 */
export async function listSubmissions({
  type,
  status,
  search,
  page = 1,
  limit = 15,
}: {
  type?: SubmissionType;
  status?: SubmissionStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const types = type ? [type] : ALL_SUBMISSION_TYPES;
  const take = page * limit;

  const [collected, counts] = await Promise.all([
    Promise.all(types.map((t) => collect(t, { status, search }, take))),
    computeSubmissionCounts(),
  ]);

  const total = collected.reduce((acc, r) => acc + r.total, 0);
  const merged = collected
    .flatMap((r) => r.items)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const start = (page - 1) * limit;

  return {
    data: merged.slice(start, start + limit),
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    page,
    counts,
  };
}

/** Load one submission by kind + id, stamped with its `type` discriminator. */
export async function getSubmissionByKind(kind: SubmissionKind, id: string) {
  switch (kind) {
    case "inquiry": {
      const r = await prisma.contactInquiry.findUnique({ where: { id } });
      return r && { ...r, type: "PROJECT_INQUIRY" as const };
    }
    case "partnership": {
      const r = await prisma.contactPartnership.findUnique({ where: { id } });
      return r && { ...r, type: "PARTNERSHIP" as const };
    }
    case "career": {
      const r = await prisma.contactCareer.findUnique({
        where: { id },
        include: { openPosition: true },
      });
      return r && { ...r, type: "CAREER" as const };
    }
  }
}
