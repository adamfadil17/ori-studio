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

    // Only categories that actually have something to show: an empty filter
    // option on the public journal would look broken.
    const rows = await prisma.articleCategory.findMany({
      where: {
        articles: {
          some: includeUnpublished ? {} : { publishedAt: { not: null } },
        },
      },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });

    return ok({ categories: rows });
  } catch (error) {
    return handleError(error);
  }
}
