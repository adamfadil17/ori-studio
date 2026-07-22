import "server-only";

import { humanizeEnum } from "./format";
import { prisma } from "./prisma";
import type {
  SubmissionListItem,
  SubmissionStatus,
  SubmissionType,
} from "./types";

export const TREND_DAYS = 30;

export interface TrendPoint {
  date: string; // YYYY-MM-DD (UTC)
  PROJECT_INQUIRY: number;
  PARTNERSHIP: number;
  CAREER: number;
  total: number;
}

export interface DashboardStats {
  submissions: {
    total: number;
    /** Untriaged — still NEW. */
    unread: number;
    /** Last 30 days vs the 30 days before, for the trend delta. */
    last30: number;
    prev30: number;
  };
  content: {
    projects: { total: number; published: number };
    articles: { total: number; published: number };
    positions: { total: number; active: number };
  };
  byType: Record<SubmissionType, number>;
  byStatus: Record<SubmissionStatus, number>;
  trend: TrendPoint[];
  recent: SubmissionListItem[];
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function startOfUtcDay(d: Date): Date {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function shiftDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

/**
 * Everything the dashboard overview needs, in one pass.
 * Server-only: called directly from the dashboard Server Component.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = startOfUtcDay(new Date());
  const windowStart = shiftDays(today, -(TREND_DAYS - 1)); // 30-day trend window
  const prevWindowStart = shiftDays(today, -(TREND_DAYS * 2 - 1)); // + previous period

  const createdSince = { createdAt: { gte: prevWindowStart } };

  const [
    inquiryStatus,
    partnershipStatus,
    careerStatus,
    projectTotal,
    projectPublished,
    articleTotal,
    articlePublished,
    positionTotal,
    positionActive,
    inquiryDates,
    partnershipDates,
    careerDates,
    recentInquiries,
    recentPartnerships,
    recentCareers,
  ] = await Promise.all([
    prisma.contactInquiry.groupBy({ by: ["status"], _count: true }),
    prisma.contactPartnership.groupBy({ by: ["status"], _count: true }),
    prisma.contactCareer.groupBy({ by: ["status"], _count: true }),

    prisma.project.count(),
    prisma.project.count({ where: { publishedAt: { not: null } } }),
    prisma.article.count(),
    prisma.article.count({ where: { publishedAt: { not: null } } }),
    prisma.openPosition.count(),
    prisma.openPosition.count({ where: { isActive: true } }),

    prisma.contactInquiry.findMany({
      where: createdSince,
      select: { createdAt: true },
    }),
    prisma.contactPartnership.findMany({
      where: createdSince,
      select: { createdAt: true },
    }),
    prisma.contactCareer.findMany({
      where: createdSince,
      select: { createdAt: true },
    }),

    prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.contactPartnership.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.contactCareer.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  // ── Counts by status / type ──────────────────────────────────────
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
    PROJECT_INQUIRY: sum(inquiryStatus),
    PARTNERSHIP: sum(partnershipStatus),
    CAREER: sum(careerStatus),
  };
  const total =
    byType.PROJECT_INQUIRY + byType.PARTNERSHIP + byType.CAREER;

  // ── Daily trend, bucketed in UTC ─────────────────────────────────
  const buckets = new Map<string, TrendPoint>();
  for (let i = 0; i < TREND_DAYS; i++) {
    const key = dayKey(shiftDays(windowStart, i));
    buckets.set(key, {
      date: key,
      PROJECT_INQUIRY: 0,
      PARTNERSHIP: 0,
      CAREER: 0,
      total: 0,
    });
  }

  let last30 = 0;
  let prev30 = 0;

  const tally = (rows: { createdAt: Date }[], type: SubmissionType) => {
    for (const row of rows) {
      if (row.createdAt >= windowStart) {
        last30 += 1;
        const point = buckets.get(dayKey(row.createdAt));
        if (point) {
          point[type] += 1;
          point.total += 1;
        }
      } else {
        prev30 += 1;
      }
    }
  };

  tally(inquiryDates, "PROJECT_INQUIRY");
  tally(partnershipDates, "PARTNERSHIP");
  tally(careerDates, "CAREER");

  // ── Latest submissions across all three channels ─────────────────
  const recent: SubmissionListItem[] = [
    ...recentInquiries.map((r) => ({
      id: r.id,
      type: "PROJECT_INQUIRY" as const,
      status: r.status,
      name: r.fullName,
      email: r.email,
      phoneNumber: r.phoneNumber,
      subject: r.serviceTypeOther || humanizeEnum(r.serviceType),
      createdAt: r.createdAt.toISOString(),
    })),
    ...recentPartnerships.map((r) => ({
      id: r.id,
      type: "PARTNERSHIP" as const,
      status: r.status,
      name: r.companyName,
      email: r.email,
      phoneNumber: r.phoneNumber,
      subject: r.partnershipOther || humanizeEnum(r.partnershipType),
      createdAt: r.createdAt.toISOString(),
    })),
    ...recentCareers.map((r) => ({
      id: r.id,
      type: "CAREER" as const,
      status: r.status,
      name: r.fullName,
      email: r.email,
      phoneNumber: r.phoneNumber,
      subject: r.positionOfInterest,
      createdAt: r.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);

  return {
    submissions: { total, unread: byStatus.NEW, last30, prev30 },
    content: {
      projects: { total: projectTotal, published: projectPublished },
      articles: { total: articleTotal, published: articlePublished },
      positions: { total: positionTotal, active: positionActive },
    },
    byType,
    byStatus,
    trend: [...buckets.values()],
    recent,
  };
}
