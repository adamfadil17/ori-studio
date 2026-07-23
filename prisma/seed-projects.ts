/**
 * One-off import of the placeholder project content into real database rows.
 *
 * The public pages used to read `src/lib/data/project-data.ts` directly. Rather
 * than throwing that content away when those pages switched to Prisma, this
 * lifts it into Project / ProjectTranslation / ProjectImage so the site still
 * has something to show and every item becomes editable from the dashboard.
 *
 * Idempotent: a project whose EN slug already exists is skipped, so re-running
 * never duplicates or overwrites edits made in the dashboard.
 *
 *   npx tsx --env-file=.env prisma/seed-projects.ts
 */

import { prisma } from "../src/lib/prisma";
import { PROJECT_DETAILS } from "../src/lib/data/project-data";
import { toSlug } from "../src/lib/slug";
import type { ServiceType } from "../src/lib/types";

/**
 * Services live on the listing page's own array rather than in the detail
 * module, and that array is a local const in a page component — so the mapping
 * is repeated here instead of imported.
 */
const SERVICES: Record<string, ServiceType[]> = {
  "tegalalang-courtyard-house": ["ARCHITECTURE_DESIGN", "INTERIOR_DESIGN"],
  "sanur-beach-villa": ["ARCHITECTURE_DESIGN", "LANDSCAPE_DESIGN"],
  "ubud-wellness-retreat": ["ARCHITECTURE_DESIGN", "LANDSCAPE_DESIGN"],
  "kintamani-hills-residence": ["ARCHITECTURE_DESIGN"],
  "seminyak-artisan-cafe": ["INTERIOR_DESIGN", "PROJECT_MANAGEMENT"],
  "canggu-creative-office": ["ARCHITECTURE_DESIGN", "PROJECT_MANAGEMENT"],
  "jimbaran-cliff-house": ["ARCHITECTURE_DESIGN", "LANDSCAPE_DESIGN"],
  "nusa-dua-boutique-hotel": ["ARCHITECTURE_DESIGN", "INTERIOR_DESIGN"],
  "lombok-coastal-pavilion": ["LANDSCAPE_DESIGN"],
};

/** The first few carry the homepage's featured strip. */
const FEATURED = new Set([
  "tegalalang-courtyard-house",
  "ubud-wellness-retreat",
  "jimbaran-cliff-house",
]);

const STATUS_MAP: Record<string, "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "PLANNED"> = {
  Completed: "COMPLETED",
  "In Progress": "IN_PROGRESS",
  "On Hold": "ON_HOLD",
  Planned: "PLANNED",
};

/** "2024–2025" (en dash) or "2025" → [start, end|null]. */
function parseYears(label: string): [number, number | null] {
  const years = label.match(/\d{4}/g)?.map(Number) ?? [];
  if (years.length === 0) return [new Date().getFullYear(), null];
  return [years[0], years[1] ?? null];
}

/** "1,100 m²" → 1100 */
function parseArea(label: string): number | null {
  const digits = label.replace(/[^\d.]/g, "");
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) ? value : null;
}

/** "Tegalalang, Bali, Indonesia" → the three parts. */
function parseLocation(label: string) {
  const [city = "", province = "", country = ""] = label
    .split(",")
    .map((part) => part.trim());
  return { city, province, country };
}

async function categoryIdFor(name: string): Promise<string> {
  const slug = toSlug(name);
  const existing = await prisma.projectCategory.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) return existing.id;

  const created = await prisma.projectCategory.create({ data: { name, slug } });
  console.log(`  + kategori "${name}"`);
  return created.id;
}

async function locationIdFor(label: string): Promise<string> {
  const parts = parseLocation(label);
  const existing = await prisma.location.findFirst({ where: parts });
  if (existing) return existing.id;

  const created = await prisma.location.create({
    data: { ...parts, slug: toSlug(label) },
  });
  console.log(`  + lokasi "${label}"`);
  return created.id;
}

async function main() {
  const entries = Object.values(PROJECT_DETAILS);
  let created = 0;
  let skipped = 0;

  for (const detail of entries) {
    const taken = await prisma.projectTranslation.findUnique({
      where: { slug_locale: { slug: detail.slug, locale: "EN" } },
      select: { id: true },
    });
    if (taken) {
      skipped += 1;
      continue;
    }

    const [yearStart, yearEnd] = parseYears(detail.keyInfo.year);

    await prisma.project.create({
      data: {
        featured: FEATURED.has(detail.slug),
        // Imported content is meant to be visible straight away.
        publishedAt: new Date(),
        categoryId: await categoryIdFor(detail.keyInfo.sector),
        locationId: await locationIdFor(detail.location),
        services: SERVICES[detail.slug] ?? ["ARCHITECTURE_DESIGN"],
        yearStart,
        yearEnd,
        client: detail.keyInfo.client || null,
        siteArea: parseArea(detail.keyInfo.siteArea),
        buildingArea: parseArea(detail.keyInfo.buildingArea),
        status: STATUS_MAP[detail.keyInfo.status] ?? "COMPLETED",
        architect: detail.keyInfo.architect || "ORI Studio",
        generalContractor: detail.keyInfo.generalContractor || null,
        translations: {
          create: {
            locale: "EN",
            name: detail.name,
            slug: detail.slug,
            // description and philosophy are their own columns now, not one
            // blob split by a blank line.
            description: detail.description,
            philosophy: detail.philosophyBody,
          },
        },
        images: {
          create: [
            ...detail.heroImages.map((img, index) => ({
              url: img.url,
              alt: img.alt ?? `${detail.name} — hero ${index + 1}`,
              type: "HERO" as const,
              order: index,
            })),
            ...detail.galleryImages.map((img, index) => ({
              url: img.url,
              alt: img.alt ?? `${detail.name} — gallery ${index + 1}`,
              type: "GALLERY" as const,
              order: index,
            })),
          ],
        },
      },
    });

    created += 1;
    console.log(`✓ ${detail.name}`);
  }

  console.log(
    `\nSelesai: ${created} proyek dibuat, ${skipped} dilewati (slug sudah ada).`,
  );
}

main()
  .catch((error) => {
    console.error("✖ Gagal:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());