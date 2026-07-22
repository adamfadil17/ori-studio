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

    const projects = await prisma.project.findMany({
      where: includeUnpublished ? {} : { publishedAt: { not: null } },
      select: { category: true, location: true, yearStart: true, yearEnd: true },
    });

    const categories = [...new Set(projects.map((p) => p.category))].sort();
    const locations = [...new Set(projects.map((p) => p.location))].sort();

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
