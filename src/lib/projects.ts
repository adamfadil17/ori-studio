import { Prisma } from "@/generated/prisma";

import { prisma } from "./prisma";
import { ensureUniqueSlug, toSlug } from "./slug";
import type { Locale } from "./types";

/** Consistent shape for every project response: translations + ordered images. */
export const PROJECT_INCLUDE = {
  translations: true,
  images: { orderBy: { order: "asc" } },
} satisfies Prisma.ProjectInclude;

/**
 * Resolve a public URL slug to its project. The URL stays human/SEO-friendly
 * (`/en/projects/villa-modern-tropical-canggu`) while the backend works with
 * the real `project.id` from here on.
 *
 * Slugs are unique per locale (`@@unique([slug, locale])`), so the locale from
 * the route is required to disambiguate. Drafts are excluded unless
 * `includeUnpublished` (admin preview). The returned project carries ALL its
 * translations, so the language switcher can find the counterpart slug.
 */
export async function getProjectBySlug(
  slug: string,
  locale: Locale,
  options: { includeUnpublished?: boolean } = {},
) {
  const translation = await prisma.projectTranslation.findUnique({
    where: { slug_locale: { slug, locale } },
    select: { projectId: true },
  });
  if (!translation) return null;

  return prisma.project.findFirst({
    where: {
      id: translation.projectId,
      ...(options.includeUnpublished ? {} : { publishedAt: { not: null } }),
    },
    include: PROJECT_INCLUDE,
  });
}

/**
 * Admin listing: every project including drafts, newest first, with optional
 * search (matches any locale's name) and category filter.
 */
export async function listProjectsForAdmin({
  page = 1,
  limit = 10,
  search,
  category,
  location,
  published,
}: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  location?: string;
  /** true = published only, false = drafts only, undefined = both. */
  published?: boolean;
}) {
  const where: Prisma.ProjectWhereInput = {
    ...(search
      ? {
          translations: {
            some: { name: { contains: search, mode: "insensitive" } },
          },
        }
      : {}),
    ...(category
      ? { category: category as Prisma.ProjectWhereInput["category"] }
      : {}),
    ...(location ? { location } : {}),
    ...(published === undefined
      ? {}
      : { publishedAt: published ? { not: null } : null }),
  };

  const [total, data] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: PROJECT_INCLUDE,
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
 * Distinct values for the admin filter bar. Covers drafts too — the admin
 * filters over everything, unlike the public /filters endpoint.
 */
export async function getProjectFilterOptions() {
  const rows = await prisma.project.findMany({
    select: { category: true, location: true },
  });

  return {
    categories: [...new Set(rows.map((r) => r.category))].sort(),
    locations: [...new Set(rows.map((r) => r.location))].sort(),
  };
}

/** Is this slug already used by another project for the given locale? */
export async function isProjectSlugTaken(
  slug: string,
  locale: Locale,
  excludeProjectId?: string,
): Promise<boolean> {
  const found = await prisma.projectTranslation.findFirst({
    where: {
      slug,
      locale,
      ...(excludeProjectId ? { projectId: { not: excludeProjectId } } : {}),
    },
    select: { id: true },
  });
  return found !== null;
}

/**
 * Resolve the final slug for a translation: use the admin's override if given,
 * else derive from the name — then guarantee per-locale uniqueness.
 */
export async function resolveProjectSlug(
  input: { name: string; slug?: string | null },
  locale: Locale,
  excludeProjectId?: string,
): Promise<string> {
  const base = toSlug(input.slug?.trim() || input.name);
  return ensureUniqueSlug(base, (candidate) =>
    isProjectSlugTaken(candidate, locale, excludeProjectId),
  );
}
