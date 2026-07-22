import { Prisma } from "@/generated/prisma";

import { prisma } from "./prisma";
import { ensureUniqueSlug, toSlug } from "./slug";
import type { Locale } from "./types";

/** Consistent shape for every article response: its translations. */
export const ARTICLE_INCLUDE = {
  translations: true,
} satisfies Prisma.ArticleInclude;

/**
 * Resolve a public URL slug to its article. The URL stays human/SEO-friendly
 * (`/en/journal/designing-for-tropical-climates`) while the backend works with
 * the real `article.id` from here on.
 *
 * Slugs are unique per locale (`@@unique([slug, locale])`), so the locale from
 * the route is required. Drafts are excluded unless `includeUnpublished`
 * (admin preview). All translations come back, so the language switcher can
 * find the counterpart slug.
 */
export async function getArticleBySlug(
  slug: string,
  locale: Locale,
  options: { includeUnpublished?: boolean } = {},
) {
  const translation = await prisma.articleTranslation.findUnique({
    where: { slug_locale: { slug, locale } },
    select: { articleId: true },
  });
  if (!translation) return null;

  return prisma.article.findFirst({
    where: {
      id: translation.articleId,
      ...(options.includeUnpublished ? {} : { publishedAt: { not: null } }),
    },
    include: ARTICLE_INCLUDE,
  });
}

/**
 * Admin listing: every article including drafts, most recently updated first,
 * with optional search (matches any locale's title) and category filter.
 */
export async function listArticlesForAdmin({
  page = 1,
  limit = 10,
  search,
  category,
  published,
}: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  /** true = published only, false = drafts only, undefined = both. */
  published?: boolean;
}) {
  const where: Prisma.ArticleWhereInput = {
    ...(search
      ? {
          translations: {
            some: { title: { contains: search, mode: "insensitive" } },
          },
        }
      : {}),
    ...(category ? { category } : {}),
    ...(published === undefined
      ? {}
      : { publishedAt: published ? { not: null } : null }),
  };

  const [total, data] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      include: ARTICLE_INCLUDE,
      orderBy: [{ updatedAt: "desc" }],
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

/**
 * Distinct categories for the admin filter bar — drafts included, unlike the
 * public /filters endpoint.
 */
export async function getArticleFilterOptions() {
  const rows = await prisma.article.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return { categories: rows.map((r) => r.category) };
}

/** Is this slug already used by another article for the given locale? */
export async function isArticleSlugTaken(
  slug: string,
  locale: Locale,
  excludeArticleId?: string,
): Promise<boolean> {
  const found = await prisma.articleTranslation.findFirst({
    where: {
      slug,
      locale,
      ...(excludeArticleId ? { articleId: { not: excludeArticleId } } : {}),
    },
    select: { id: true },
  });
  return found !== null;
}

/**
 * Resolve the final slug for a translation: admin override if given, else
 * derived from the title — then guaranteed unique per locale.
 */
export async function resolveArticleSlug(
  input: { title: string; slug?: string | null },
  locale: Locale,
  excludeArticleId?: string,
): Promise<string> {
  const base = toSlug(input.slug?.trim() || input.title);
  return ensureUniqueSlug(base, (candidate) =>
    isArticleSlugTaken(candidate, locale, excludeArticleId),
  );
}
