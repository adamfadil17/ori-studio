import { ApiError } from "./auth";
import { prisma } from "./prisma";
import { toSlug } from "./slug";
import {
  createArticleCategorySchema,
  createLocationSchema,
  createProjectCategorySchema,
  updateArticleCategorySchema,
  updateLocationSchema,
  updateProjectCategorySchema,
} from "./validators";

/**
 * The three studio-managed lists behind the project and article forms.
 *
 * They are handled together rather than as three parallel modules because the
 * rules are identical — unique name, derived slug, and a delete that must be
 * refused while something still points at the row. Splitting them would mean
 * three copies of that logic drifting apart.
 */

export const LOOKUP_KINDS = [
  "project-categories",
  "article-categories",
  "locations",
] as const;

export type LookupKind = (typeof LOOKUP_KINDS)[number];

export function isLookupKind(value: string): value is LookupKind {
  return (LOOKUP_KINDS as readonly string[]).includes(value);
}

/** What a lookup looks like to the dashboard and to the form dropdowns. */
export interface LookupItem {
  id: string;
  /** Ready to display: "Residential", or "Canggu, Bali, Indonesia". */
  label: string;
  slug: string;
  /** Projects or articles pointing at this row — 0 means it is safe to delete. */
  usageCount: number;
  /** Locations only — the parts, for editing. */
  city?: string;
  province?: string;
  country?: string;
}

const LABELS: Record<LookupKind, { singular: string; plural: string }> = {
  "project-categories": {
    singular: "Project category",
    plural: "project categories",
  },
  "article-categories": {
    singular: "Article category",
    plural: "article categories",
  },
  locations: { singular: "Location", plural: "locations" },
};

export function lookupLabel(kind: LookupKind) {
  return LABELS[kind];
}

function locationLabel(l: { city: string; province: string; country: string }) {
  return [l.city, l.province, l.country].filter(Boolean).join(", ");
}

// ─────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────

export async function listLookup(
  kind: LookupKind,
  search?: string,
): Promise<LookupItem[]> {
  const term = search?.trim();

  if (kind === "locations") {
    const rows = await prisma.location.findMany({
      where: term
        ? {
            OR: [
              { city: { contains: term, mode: "insensitive" } },
              { province: { contains: term, mode: "insensitive" } },
              { country: { contains: term, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: { _count: { select: { projects: true } } },
      orderBy: [{ country: "asc" }, { province: "asc" }, { city: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      label: locationLabel(r),
      slug: r.slug,
      usageCount: r._count.projects,
      city: r.city,
      province: r.province,
      country: r.country,
    }));
  }

  const where = term
    ? { name: { contains: term, mode: "insensitive" as const } }
    : undefined;

  if (kind === "project-categories") {
    const rows = await prisma.projectCategory.findMany({
      where,
      include: { _count: { select: { projects: true } } },
      orderBy: { name: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      label: r.name,
      slug: r.slug,
      usageCount: r._count.projects,
    }));
  }

  const rows = await prisma.articleCategory.findMany({
    where,
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    label: r.name,
    slug: r.slug,
    usageCount: r._count.articles,
  }));
}

export async function getLookup(
  kind: LookupKind,
  id: string,
): Promise<LookupItem | null> {
  const all = await listLookup(kind);
  return all.find((item) => item.id === id) ?? null;
}

// ─────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────

/**
 * Slug is derived from the name unless one was supplied. A collision means the
 * label collides too, so it surfaces as a duplicate-name error rather than
 * silently becoming "residential-2".
 */
function slugFor(explicit: string | undefined, source: string) {
  return explicit ?? toSlug(source);
}

export async function createLookup(kind: LookupKind, body: unknown) {
  if (kind === "locations") {
    const dto = createLocationSchema.parse(body);
    return prisma.location.create({
      data: {
        city: dto.city,
        province: dto.province,
        country: dto.country,
        slug: slugFor(dto.slug, locationLabel(dto)),
      },
    });
  }

  const schema =
    kind === "project-categories"
      ? createProjectCategorySchema
      : createArticleCategorySchema;
  const dto = schema.parse(body);
  const data = { name: dto.name, slug: slugFor(dto.slug, dto.name) };

  return kind === "project-categories"
    ? prisma.projectCategory.create({ data })
    : prisma.articleCategory.create({ data });
}

export async function updateLookup(
  kind: LookupKind,
  id: string,
  body: unknown,
) {
  if (kind === "locations") {
    const dto = updateLocationSchema.parse(body);
    const current = await prisma.location.findUnique({ where: { id } });
    if (!current) throw new ApiError(404, "Location not found");

    const next = {
      city: dto.city ?? current.city,
      province: dto.province ?? current.province,
      country: dto.country ?? current.country,
    };
    return prisma.location.update({
      where: { id },
      data: {
        ...next,
        // Renaming re-derives the slug unless one was given explicitly. Filter
        // links carry ids, not slugs, so nothing breaks when it changes.
        slug: dto.slug ?? toSlug(locationLabel(next)),
      },
    });
  }

  const schema =
    kind === "project-categories"
      ? updateProjectCategorySchema
      : updateArticleCategorySchema;
  const dto = schema.parse(body);

  const data: { name?: string; slug?: string } = {};
  if (dto.name !== undefined) {
    data.name = dto.name;
    data.slug = dto.slug ?? toSlug(dto.name);
  } else if (dto.slug !== undefined) {
    data.slug = dto.slug;
  }

  return kind === "project-categories"
    ? prisma.projectCategory.update({ where: { id }, data })
    : prisma.articleCategory.update({ where: { id }, data });
}

/**
 * The database refuses this too (the foreign keys are ON DELETE RESTRICT), but
 * that surfaces as an opaque constraint violation. Checking first lets the
 * dashboard say exactly how many items are in the way.
 */
export async function deleteLookup(kind: LookupKind, id: string) {
  const item = await getLookup(kind, id);
  if (!item) throw new ApiError(404, `${LABELS[kind].singular} not found`);

  if (item.usageCount > 0) {
    const noun =
      kind === "article-categories"
        ? item.usageCount === 1
          ? "article"
          : "articles"
        : item.usageCount === 1
          ? "project"
          : "projects";
    throw new ApiError(
      409,
      `"${item.label}" is still used by ${item.usageCount} ${noun}. Reassign them first.`,
    );
  }

  if (kind === "locations") {
    await prisma.location.delete({ where: { id } });
  } else if (kind === "project-categories") {
    await prisma.projectCategory.delete({ where: { id } });
  } else {
    await prisma.articleCategory.delete({ where: { id } });
  }
}
