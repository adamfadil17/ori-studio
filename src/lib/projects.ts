import { Prisma } from "@/generated/prisma";

import { prisma } from "./prisma";
import { ensureUniqueSlug, toSlug } from "./slug";
import type { Locale } from "./types";

/** Consistent shape for every project response: translations + ordered images. */
export const PROJECT_INCLUDE = {
  translations: true,
  category: true,
  location: true,
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

/** "2024–2025", or just "2025" when there is no distinct end year. */
export function projectYearLabel(start: number, end?: number | null): string {
  return end && end !== start ? `${start}–${end}` : String(start);
}

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof PROJECT_INCLUDE;
}>;

/**
 * Flatten a project into the shape the public listing cards want, resolving the
 * requested locale and falling back to EN — a project with no Indonesian
 * translation yet should still appear on /id, not vanish from the grid.
 */
export function toPublicListItem(project: ProjectWithRelations, locale: Locale) {
  const translation =
    project.translations.find((t) => t.locale === locale) ??
    project.translations.find((t) => t.locale === "EN") ??
    project.translations[0];

  const hero = project.images.find((img) => img.type === "HERO");

  return {
    slug: translation?.slug ?? project.id,
    name: translation?.name ?? "(untitled)",
    location: [
      project.location.city,
      project.location.province,
      project.location.country,
    ]
      .filter(Boolean)
      .join(", "),
    yearLabel: projectYearLabel(project.yearStart, project.yearEnd),
    category: project.category.name,
    services: project.services,
    thumbnailUrl: hero?.url,
  };
}

/**
 * Every published project, for the public listing. Featured first, then newest
 * — the listing filters and paginates in the browser, so the whole set is sent.
 */
export async function listPublishedProjects(locale: Locale) {
  const rows = await prisma.project.findMany({
    where: { publishedAt: { not: null } },
    include: PROJECT_INCLUDE,
    orderBy: [{ featured: "desc" }, { yearStart: "desc" }],
  });
  return rows.map((row) => toPublicListItem(row, locale));
}

/** One slide of the featured-project carousel. */
export interface FeaturedHeroItem {
  slug: string;
  name: string;
  location: string;
  yearLabel: string;
  description: string;
  imageUrl: string | null;
}

/**
 * Featured projects for the home/projects hero carousel, each carrying the
 * description and hero image the slide shows. Newest first; an empty result
 * means the section is hidden entirely.
 */
export async function listFeaturedProjectsForHero(
  locale: Locale,
  limit = 6,
): Promise<FeaturedHeroItem[]> {
  const rows = await prisma.project.findMany({
    where: { publishedAt: { not: null }, featured: true },
    include: PROJECT_INCLUDE,
    orderBy: [{ yearStart: "desc" }],
    take: limit,
  });

  return rows.map((p) => {
    const t =
      p.translations.find((x) => x.locale === locale) ??
      p.translations.find((x) => x.locale === "EN") ??
      p.translations[0];
    const hero = p.images.find((img) => img.type === "HERO");

    return {
      slug: t?.slug ?? p.id,
      name: t?.name ?? "(untitled)",
      location: [p.location.city, p.location.province, p.location.country]
        .filter(Boolean)
        .join(", "),
      yearLabel: projectYearLabel(p.yearStart, p.yearEnd),
      description: t?.description ?? "",
      imageUrl: hero?.url ?? null,
    };
  });
}

/**
 * Work still underway, for the "further projects" strip. Published but not yet
 * complete — an empty result means the section is simply not rendered.
 */
export async function listOngoingProjects(locale: Locale, limit = 5) {
  const rows = await prisma.project.findMany({
    where: {
      publishedAt: { not: null },
      status: { in: ["IN_PROGRESS", "PLANNED"] },
    },
    include: PROJECT_INCLUDE,
    orderBy: { yearStart: "desc" },
    take: limit,
  });
  return rows.map((row) => toPublicListItem(row, locale));
}

function areaLabel(value: number | null): string {
  return value === null ? "—" : `${value.toLocaleString("en-US")} m²`;
}

/**
 * Everything the public detail page renders, in the shape it already expects.
 *
 * The slug is matched in ANY locale rather than the requested one: the seeded
 * projects only carry an English translation, and `/id/projects/<en-slug>`
 * should still resolve rather than 404 while an Indonesian version is pending.
 */
export async function getPublicProjectDetail(slug: string, locale: Locale) {
  const match = await prisma.projectTranslation.findFirst({
    where: { slug },
    select: { projectId: true },
  });
  if (!match) return null;

  const project = await prisma.project.findFirst({
    where: { id: match.projectId, publishedAt: { not: null } },
    include: PROJECT_INCLUDE,
  });
  if (!project) return null;

  const t =
    project.translations.find((x) => x.locale === locale) ??
    project.translations.find((x) => x.locale === "EN") ??
    project.translations[0];

  const locationLabel = [
    project.location.city,
    project.location.province,
    project.location.country,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: project.id,
    slug: t?.slug ?? slug,
    name: t?.name ?? "(untitled)",
    location: locationLabel,
    yearLabel: projectYearLabel(project.yearStart, project.yearEnd),
    // Both come straight from their own translation columns now.
    description: t?.description ?? "",
    philosophy: t?.philosophy ?? "",
    keyInfo: {
      year: projectYearLabel(project.yearStart, project.yearEnd),
      sector: project.category.name,
      status: project.status
        .toLowerCase()
        .split("_")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" "),
      client: project.client ?? "—",
      siteArea: areaLabel(project.siteArea),
      architect: project.architect,
      location: locationLabel,
      buildingArea: areaLabel(project.buildingArea),
      generalContractor: project.generalContractor ?? "—",
    },
    heroImages: project.images.filter((img) => img.type === "HERO"),
    galleryImages: project.images.filter((img) => img.type === "GALLERY"),
  };
}

/** Other published projects to show under a detail page. */
export async function getRelatedPublicProjects(
  excludeId: string,
  locale: Locale,
  limit = 3,
) {
  const rows = await prisma.project.findMany({
    where: { publishedAt: { not: null }, id: { not: excludeId } },
    include: PROJECT_INCLUDE,
    orderBy: [{ featured: "desc" }, { yearStart: "desc" }],
    take: limit,
  });
  return rows.map((row) => toPublicListItem(row, locale));
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
  /** Lookup row id, not a name — the filter links carry ids. */
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
    ...(category ? { categoryId: category } : {}),
    ...(location ? { locationId: location } : {}),
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
  // Read from the lookup tables rather than from the projects: a category the
  // studio created but hasn't used yet should still appear in the filter, and
  // the option value has to be the id the listing filters on.
  const [categories, locations] = await Promise.all([
    prisma.projectCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      select: { id: true, city: true, province: true, country: true },
      orderBy: [{ country: "asc" }, { province: "asc" }, { city: "asc" }],
    }),
  ]);

  return {
    categories: categories.map((c) => ({ value: c.id, label: c.name })),
    locations: locations.map((l) => ({
      value: l.id,
      label: [l.city, l.province, l.country].filter(Boolean).join(", "),
    })),
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
