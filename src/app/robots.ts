import type { MetadataRoute } from "next";

// Same absolute base as metadataBase / sitemap, trailing slash stripped.
const BASE = (process.env.APP_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);

/**
 * Generates /robots.txt.
 *
 * Disallows the admin panel, its login, and the API (mutations + the private CV
 * download live there — none are public content pages). Everything else,
 * including the localized public pages and `/uploads` images, is crawlable.
 *
 * Note: `Disallow` is crawl guidance, not access control — the admin is
 * protected by auth in the middleware, not by this file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/login", "/api"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}