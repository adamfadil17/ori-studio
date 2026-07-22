import { NextRequest } from "next/server";

import { badRequest, getAuthPayload, handleError, notFound, ok } from "@/lib";
import { getArticleBySlug } from "@/lib/articles";
import { LOCALES, type Locale } from "@/lib/types";

const CONTENT_ROLES = ["admin", "editor"];

/**
 * GET /api/articles/by-slug/[slug]?locale=EN — resolve a public slug to its
 * article. Keeps the URL slug-based while the backend gets the real id.
 * Admin/editor may preview drafts.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const localeParam = (
      req.nextUrl.searchParams.get("locale") ?? "EN"
    ).toUpperCase();
    if (!LOCALES.includes(localeParam as Locale)) {
      return badRequest(`Unknown locale — expected one of ${LOCALES.join(", ")}`);
    }

    const payload = await getAuthPayload(req);
    const includeUnpublished = Boolean(
      payload && CONTENT_ROLES.includes(payload.role),
    );

    const article = await getArticleBySlug(slug, localeParam as Locale, {
      includeUnpublished,
    });
    if (!article) return notFound("Article");

    return ok(article);
  } catch (error) {
    return handleError(error);
  }
}