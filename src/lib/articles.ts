import { Prisma } from "@/generated/prisma";

import { prisma } from "./prisma";
import { ensureUniqueSlug, toSlug } from "./slug";
import type { Locale, TiptapJSON } from "./types";

/** Consistent shape for every article response: its translations. */
export const ARTICLE_INCLUDE = {
  translations: true,
  category: true,
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

/** "May 12, 2024" — the format the journal cards already used. */
export function articleDateLabel(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: typeof ARTICLE_INCLUDE;
}>;

/**
 * Flatten an article for the journal cards, resolving the requested locale and
 * falling back to EN — an article without an Indonesian translation yet should
 * still show on /id rather than disappear.
 */
export function toPublicArticleListItem(
  article: ArticleWithRelations,
  locale: Locale,
) {
  const t =
    article.translations.find((x) => x.locale === locale) ??
    article.translations.find((x) => x.locale === "EN") ??
    article.translations[0];

  return {
    slug: t?.slug ?? article.id,
    title: t?.title ?? "(untitled)",
    category: article.category.name,
    publishedLabel: articleDateLabel(article.publishedAt),
    imageUrl: article.image,
  };
}

/**
 * Articles flagged `featured` in the dashboard, for the journal's "Featured
 * Read" strip. Newest first; an empty result means the section is hidden.
 *
 * This is what the section should have used all along — it was slicing the top
 * of every published article instead of reading the `featured` column.
 */
export async function listFeaturedArticles(locale: Locale, limit = 12) {
  const rows = await prisma.article.findMany({
    where: { publishedAt: { not: null }, featured: true },
    include: ARTICLE_INCLUDE,
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
  });
  return rows.map((row) => toPublicArticleListItem(row, locale));
}

/** Every published article, newest first — the listing filters in the browser. */
export async function listPublishedArticles(locale: Locale) {
  const rows = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    include: ARTICLE_INCLUDE,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
  return rows.map((row) => toPublicArticleListItem(row, locale));
}

/**
 * The detail page's data, in the shape it already renders.
 *
 * As with projects, the slug is matched in ANY locale so an English-only
 * article still resolves under /id instead of 404ing.
 */
export async function getPublicArticleDetail(slug: string, locale: Locale) {
  const match = await prisma.articleTranslation.findFirst({
    where: { slug },
    select: { articleId: true },
  });
  if (!match) return null;

  const article = await prisma.article.findFirst({
    where: { id: match.articleId, publishedAt: { not: null } },
    include: ARTICLE_INCLUDE,
  });
  if (!article) return null;

  const t =
    article.translations.find((x) => x.locale === locale) ??
    article.translations.find((x) => x.locale === "EN") ??
    article.translations[0];

  return {
    id: article.id,
    slug: t?.slug ?? slug,
    title: t?.title ?? "(untitled)",
    category: article.category.name,
    excerpt: t?.excerpt ?? "",
    publishedLabel: articleDateLabel(article.publishedAt),
    image: article.image,
    imageAlt: article.imageAlt,
    content: t?.content as unknown as TiptapJSON,
  };
}

/** Other published articles to show under a detail page. */
export async function getRelatedPublicArticles(
  excludeId: string,
  locale: Locale,
  limit = 3,
) {
  const rows = await prisma.article.findMany({
    where: { publishedAt: { not: null }, id: { not: excludeId } },
    include: ARTICLE_INCLUDE,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
  return rows.map((row) => toPublicArticleListItem(row, locale));
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
    ...(category ? { categoryId: category } : {}),
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
  // From the lookup table, not from the articles — a category with no articles
  // yet should still be offered, and the value must be the id the filter uses.
  const rows = await prisma.articleCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return { categories: rows.map((c) => ({ value: c.id, label: c.name })) };
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
