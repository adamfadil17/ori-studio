import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { getSitemapArticles } from "@/lib/articles";
import { getSitemapProjects } from "@/lib/projects";

// Regenerate at most once an hour (ISR). Serving between regenerations is a
// cached file, and each regeneration is just two light queries — triggered only
// when the sitemap is requested after the window — so new/edited content shows
// up within the hour at negligible cost.
export const revalidate = 3600; // 60 * 60

// Absolute base, same source as metadataBase. Trailing slash stripped so
// paths join cleanly.
const BASE = (process.env.APP_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

// Public routes whose content comes from the i18n dictionaries, so they exist
// in every locale. Home is the empty path ("" → "/en", "/id").
const STATIC_PATHS = [
  "",
  "/about",
  "/projects",
  "/studio",
  "/philosophy",
  "/journal",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, articles] = await Promise.all([
    getSitemapProjects(),
    getSitemapArticles(),
  ]);

  const now = new Date();

  // Static pages: every path in both locales.
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: now,
    })),
  );

  // Dynamic pages: one entry per existing translation, so only real (canonical)
  // locale URLs are listed — never an EN-only project's /id fallback.
  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE}/${p.locale}/projects/${p.slug}`,
    lastModified: p.lastModified,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/${a.locale}/journal/${a.slug}`,
    lastModified: a.lastModified,
  }));

  return [...staticEntries, ...projectEntries, ...articleEntries];
}