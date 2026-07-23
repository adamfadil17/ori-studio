/**
 * One-off import of the placeholder journal content into real database rows,
 * the article counterpart to seed-projects.ts.
 *
 * Idempotent: an article whose EN slug already exists is skipped, so re-running
 * never duplicates or overwrites edits made in the dashboard.
 *
 *   npx tsx --env-file=.env prisma/seed-articles.ts
 */

import { prisma } from "../src/lib/prisma";
import { ARTICLE_DETAILS } from "../src/lib/data/article-data";
import { toSlug } from "../src/lib/slug";
import type { Prisma } from "../src/generated/prisma";

/** Same placeholder the journal pages were already rendering. */
const PLACEHOLDER = "https://placehold.net/default.svg";

/** The first few carry the homepage's journal preview. */
const FEATURED = new Set([
  "the-beauty-of-shadow",
  "tropical-modernism-in-bali",
]);

/**
 * "May 12, 2024" → that calendar day at UTC midnight.
 *
 * The `UTC` suffix matters: without it the string parses as local midnight,
 * which in UTC+8 is the *previous* day in UTC — and the pages render the date
 * in UTC, so every article would display one day early.
 *
 * Falls back to today rather than throwing; one unparseable date should not
 * stop the whole import.
 */
export function parsePublished(label: string): Date {
  const parsed = new Date(`${label} UTC`);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const loose = new Date(label);
  return Number.isNaN(loose.getTime()) ? new Date() : loose;
}

async function categoryIdFor(name: string): Promise<string> {
  const slug = toSlug(name);
  const existing = await prisma.articleCategory.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) return existing.id;

  const created = await prisma.articleCategory.create({ data: { name, slug } });
  console.log(`  + kategori "${name}"`);
  return created.id;
}

async function main() {
  let created = 0;
  let skipped = 0;

  for (const detail of Object.values(ARTICLE_DETAILS)) {
    const taken = await prisma.articleTranslation.findUnique({
      where: { slug_locale: { slug: detail.slug, locale: "EN" } },
      select: { id: true },
    });
    if (taken) {
      skipped += 1;
      continue;
    }

    await prisma.article.create({
      data: {
        featured: FEATURED.has(detail.slug),
        publishedAt: parsePublished(detail.publishedLabel),
        categoryId: await categoryIdFor(detail.category),
        image: PLACEHOLDER,
        imageAlt: detail.title,
        translations: {
          create: {
            locale: "EN",
            title: detail.title,
            slug: detail.slug,
            excerpt: detail.excerpt ?? null,
            // Tiptap document, stored as-is in the Json column.
            content: detail.content as unknown as Prisma.InputJsonValue,
          },
        },
      },
    });

    created += 1;
    console.log(`✓ ${detail.title}`);
  }

  console.log(
    `\nSelesai: ${created} artikel dibuat, ${skipped} dilewati (slug sudah ada).`,
  );
}

main()
  .catch((error) => {
    console.error("✖ Gagal:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());