import type { Metadata } from "next";

/** The `meta` block each static page carries in the i18n dictionaries. */
export interface PageMeta {
  title: string;
  description: string;
}

/**
 * Metadata for a static, dictionary-driven page.
 *
 * Title/description come from the page's `meta` block (localized). Canonical and
 * hreflang are derived from the fixed path — both locales always exist for these
 * pages, so each is self-canonical and declares its EN/ID pair. `metadataBase`
 * (set in the root layout) turns these relative paths into absolute URLs.
 *
 * @param locale current route locale, lowercase ("en" | "id")
 * @param path   path after the locale, e.g. "/about" (empty string for a home)
 */
export function staticPageMetadata(
  locale: string,
  path: string,
  meta: PageMeta,
): Metadata {
  const en = `/en${path}`;
  const id = `/id${path}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { en, id, "x-default": en },
    },
    openGraph: {
      type: "website",
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}