import { NextRequest } from "next/server";

import { handleError, ok, prisma, requireAuth, requireRole } from "@/lib";

/**
 * GET /api/projects/filters — distinct filter options for the listing UI
 * (categories, locations, years). Published set by default; admin/editor may
 * pass `?includeUnpublished=true` to include drafts.
 */
export async function GET(req: NextRequest) {
  try {
    const includeUnpublished =
      req.nextUrl.searchParams.get("includeUnpublished") === "true";

    if (includeUnpublished) {
      const payload = await requireAuth(req);
      requireRole(payload, "admin", "editor");
    }

    const visible = includeUnpublished ? {} : { publishedAt: { not: null } };

    // Categories and locations come from their own tables, filtered to those
    // with visible projects — an option that matches nothing would be a dead
    // end on the public listing.
    const [projects, categories, locationRows] = await Promise.all([
      prisma.project.findMany({
        where: visible,
        select: { yearStart: true, yearEnd: true },
      }),
      prisma.projectCategory.findMany({
        where: { projects: { some: visible } },
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.location.findMany({
        where: { projects: { some: visible } },
        select: {
          id: true,
          city: true,
          province: true,
          country: true,
          slug: true,
        },
        orderBy: [{ country: "asc" }, { province: "asc" }, { city: "asc" }],
      }),
    ]);

    const locations = locationRows.map((l) => ({
      ...l,
      label: [l.city, l.province, l.country].filter(Boolean).join(", "),
    }));

    const years = new Set<number>();
    for (const p of projects) {
      years.add(p.yearStart);
      if (p.yearEnd) years.add(p.yearEnd);
    }

    return ok({
      categories,
      locations,
      years: [...years].sort((a, b) => b - a),
    });
  } catch (error) {
    return handleError(error);
  }
}
