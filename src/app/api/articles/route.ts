import { NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma";
import {
  created,
  createArticleSchema,
  handleError,
  paginated,
  paginateQuery,
  parsePagination,
  prisma,
  requireAuth,
  requireRole,
} from "@/lib";
import { ARTICLE_INCLUDE, resolveArticleSlug } from "@/lib/articles";

/**
 * GET /api/articles — journal listing with filters + pagination.
 * Public: published only. Admin/editor with `?includeUnpublished=true` sees
 * drafts too. Returns full articles (all translations incl. Tiptap content);
 * the frontend resolves the active locale into an `ArticleView`.
 */
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const { page, limit, search } = parsePagination(params);

    const includeUnpublished = params.get("includeUnpublished") === "true";
    if (includeUnpublished) {
      const payload = await requireAuth(req);
      requireRole(payload, "admin", "editor");
    }

    const category = params.get("category") ?? undefined;
    const featuredParam = params.get("featured");
    const featured =
      featuredParam == null ? undefined : featuredParam === "true";

    const where: Prisma.ArticleWhereInput = {
      ...(includeUnpublished ? {} : { publishedAt: { not: null } }),
      ...(category ? { categoryId: category } : {}),
      ...(featured !== undefined ? { featured } : {}),
      ...(search
        ? { translations: { some: { title: { contains: search, mode: "insensitive" } } } }
        : {}),
    };

    const { data, meta } = await paginateQuery(
      () => prisma.article.count({ where }),
      (skip, take) =>
        prisma.article.findMany({
          where,
          include: ARTICLE_INCLUDE,
          orderBy: [
            { featured: "desc" },
            { publishedAt: { sort: "desc", nulls: "last" } },
            { createdAt: "desc" },
          ],
          skip,
          take,
        }),
      page,
      limit,
    );

    return paginated(data, meta);
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/articles — admin/editor: create an article with translations. */
export async function POST(req: NextRequest) {
  try {
    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    const dto = createArticleSchema.parse(await req.json());

    const translations = await Promise.all(
      dto.translations.map(async (t) => ({
        locale: t.locale,
        title: t.title,
        slug: await resolveArticleSlug(t, t.locale),
        excerpt: t.excerpt ?? null,
        content: t.content as unknown as Prisma.InputJsonValue,
      })),
    );

    const article = await prisma.article.create({
      data: {
        featured: dto.featured,
        publishedAt: dto.published ? new Date() : null,
        categoryId: dto.categoryId,
        image: dto.image,
        imageAlt: dto.imageAlt ?? null,
        translations: { create: translations },
      },
      include: ARTICLE_INCLUDE,
    });

    return created(article);
  } catch (error) {
    return handleError(error);
  }
}
