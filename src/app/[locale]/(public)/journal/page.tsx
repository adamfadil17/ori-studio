import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import CtaBanner from "@/components/public/layout/cta-banner";
import ArticleList from "@/components/public/journal/article-list";
import FeaturedArticlesCarousel from "@/components/public/journal/featured-articles-carousel";
import { listFeaturedArticles, listPublishedArticles } from "@/lib/articles";
import type { Locale as DbLocale } from "@/lib/types";

const PLACEHOLDER = "https://placehold.net/default.svg";

// Read fresh per request so a dashboard edit shows at once, not a cached copy.
export const dynamic = "force-dynamic";

// Data artikel di bawah ini nantinya diganti query Prisma
// (Article + ArticleTranslation) sesuai locale aktif.

export default async function JournalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const { hero, featured, explore, filters } = dict.journal;

  // Route locale is lowercase ("en"); the Prisma enum is uppercase ("EN").
  const dbLocale = locale.toUpperCase() as DbLocale;
  const [articles, featuredArticles] = await Promise.all([
    listPublishedArticles(dbLocale),
    listFeaturedArticles(dbLocale),
  ]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative h-[520px] w-full overflow-hidden md:h-[600px]">
        <Image
          src={PLACEHOLDER}
          alt="ORI Studio Architect — journal"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/40" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-start justify-center px-6 md:px-10">
          <p className="text-xs tracking-widest uppercase text-background-main">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-background-main md:text-5xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-md text-sm text-background-main/85">
            {hero.subheadline}
          </p>
          <Link
            href="#all-articles"
            className="mt-8 inline-flex items-center gap-2 border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
          >
            {hero.cta}
          </Link>
        </div>
      </section>

      {/* ---------- FEATURED READ ---------- */}
      {/* Driven by the `featured` column; two cards per slide, arrows page
          through the rest. Hidden entirely when nothing is flagged. */}
      <FeaturedArticlesCarousel
        locale={locale as Locale}
        items={featuredArticles}
        eyebrowLabel={featured.eyebrow}
        headlineLabel={featured.headline}
      />

      {/* ---------- EXPLORE THE JOURNAL (filter + grid/list + pagination) ---------- */}
      <section
        id="all-articles"
        className="bg-background-main px-6 pb-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {explore.eyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-snug text-headline md:text-4xl">
            {explore.headline}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-body">
            {explore.body}
          </p>

          <div className="mt-10">
            <ArticleList
              locale={locale as Locale}
              articles={articles}
              labels={filters}
            />
          </div>
        </div>
      </section>

      <CtaBanner
        locale={locale as Locale}
        dict={dict.journal.cta}
        href="/projects"
      />
    </>
  );
}
