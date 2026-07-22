import { NextRequest } from "next/server";

import { handleError, ok, prisma, requireAuth, requireRole } from "@/lib";

/**
 * GET /api/articles/filters — distinct categories for the journal filter UI.
 * Published set by default; admin/editor may pass `?includeUnpublished=true`.
 */
export async function GET(req: NextRequest) {
  try {
    const includeUnpublished =
      req.nextUrl.searchParams.get("includeUnpublished") === "true";

    if (includeUnpublished) {
      const payload = await requireAuth(req);
      requireRole(payload, "admin", "editor");
    }

    const rows = await prisma.article.findMany({
      where: includeUnpublished ? {} : { publishedAt: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return ok({ categories: rows.map((r) => r.category) });
  } catch (error) {
    return handleError(error);
  }
}
