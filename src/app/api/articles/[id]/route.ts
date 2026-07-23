import { NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma";
import {
  getAuthPayload,
  handleError,
  noContent,
  notFound,
  ok,
  prisma,
  requireAuth,
  requireRole,
  updateArticleSchema,
} from "@/lib";
import { ARTICLE_INCLUDE, resolveArticleSlug } from "@/lib/articles";

const CONTENT_ROLES = ["admin", "editor"];

/**
 * GET /api/articles/[id] — read one article.
 * Drafts (publishedAt = null) are only visible to admin/editor.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: ARTICLE_INCLUDE,
    });
    if (!article) return notFound("Article");

    if (article.publishedAt === null) {
      const payload = await getAuthPayload(req);
      if (!payload || !CONTENT_ROLES.includes(payload.role)) {
        return notFound("Article");
      }
    }

    return ok(article);
  } catch (error) {
    return handleError(error);
  }
}

/** PATCH /api/articles/[id] — admin/editor: update fields + translations. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    const dto = updateArticleSchema.parse(await req.json());

    const existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true, publishedAt: true },
    });
    if (!existing) return notFound("Article");

    const data: Prisma.ArticleUpdateInput = {};
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.categoryId !== undefined) {
      data.category = { connect: { id: dto.categoryId } };
    }
    if (dto.image !== undefined) data.image = dto.image;
    if (dto.imageAlt !== undefined) data.imageAlt = dto.imageAlt ?? null;
    // Publish toggle: keep the original publish date when re-publishing.
    if (dto.published !== undefined) {
      data.publishedAt = dto.published ? (existing.publishedAt ?? new Date()) : null;
    }

    // Resolve slugs before the transaction (excluding this article).
    const translations = dto.translations
      ? await Promise.all(
          dto.translations.map(async (t) => ({
            locale: t.locale,
            title: t.title,
            slug: await resolveArticleSlug(t, t.locale, id),
            excerpt: t.excerpt ?? null,
            content: t.content as unknown as Prisma.InputJsonValue,
          })),
        )
      : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.article.update({ where: { id }, data });

      // Upsert translations by locale (add or edit, never orphan).
      if (translations) {
        for (const t of translations) {
          await tx.articleTranslation.upsert({
            where: { articleId_locale: { articleId: id, locale: t.locale } },
            create: { articleId: id, ...t },
            update: {
              title: t.title,
              slug: t.slug,
              excerpt: t.excerpt,
              content: t.content,
            },
          });
        }
      }
    });

    const article = await prisma.article.findUnique({
      where: { id },
      include: ARTICLE_INCLUDE,
    });

    return ok(article);
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/articles/[id] — admin/editor: delete (cascades translations). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const payload = await requireAuth(req);
    requireRole(payload, "admin", "editor");

    await prisma.article.delete({ where: { id } });

    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
