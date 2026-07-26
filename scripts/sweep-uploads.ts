/**
 * Upload sweeper — run by system crontab (hourly). Cleans the tmp roots:
 *
 *   1. reconcile-promote: a tmp file the DB still references means `promote`
 *      never ran (crash between DB write and move) — promote it now.
 *   2. sweep: a tmp file the DB does not reference AND older than the TTL is an
 *      abandoned upload or a trashed file — delete it. Fresh unreferenced files
 *      are left alone (grace window, so an in-flight submit is never raced).
 *
 * Runs OUTSIDE Next, so it imports `@/lib/storage-fs` (no `server-only`) rather
 * than `@/lib/storage`. Reuses the same URL↔path mapping as the app.
 *
 *   Local:   npm run sweep         (tsx scripts/sweep-uploads.ts)
 *   Crontab: see deploy notes (Tahap 4)
 */
import { prisma } from "@/lib/prisma";
import { sweepTmp, UPLOADS_TTL_HOURS } from "@/lib/storage-fs";

async function main() {
  // Every URL the DB currently references, across the three file-owning models.
  const [images, articles, careers] = await Promise.all([
    prisma.projectImage.findMany({ select: { url: true } }),
    prisma.article.findMany({ select: { image: true } }),
    prisma.contactCareer.findMany({ select: { cvUrl: true } }),
  ]);

  const referenced = new Set<string>([
    ...images.map((i) => i.url),
    ...articles.map((a) => a.image),
    ...careers.map((c) => c.cvUrl),
  ]);

  const report = await sweepTmp(referenced);

  console.log(
    `[sweep] ttl=${UPLOADS_TTL_HOURS}h  referenced=${referenced.size}  ` +
      `promoted=${report.promoted.length}  deleted=${report.deleted.length}  ` +
      `keptFresh=${report.keptFresh}`,
  );
  if (report.promoted.length) {
    console.log("[sweep] reconciled (tmp→committed):", report.promoted.join(", "));
  }
}

main()
  .catch((err) => {
    console.error("[sweep] failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
