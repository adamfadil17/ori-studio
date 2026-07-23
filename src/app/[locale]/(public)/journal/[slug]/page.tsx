import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import CtaBanner from "@/components/public/layout/cta-banner";
import { getPublicArticleDetail } from "@/lib/articles";
import type { Locale as DbLocale } from "@/lib/types";
import SetHeaderMode from "@/components/public/layout/set-header-mode";
import TiptapContent from "@/components/public/journal/tiptap-content";

const PLACEHOLDER = "https://placehold.net/default.svg";

// Read fresh per request so dashboard edits show at once, not a cached copy.
export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  // Route locale is lowercase ("en"); the Prisma enum is uppercase ("EN").
  const article = await getPublicArticleDetail(
    slug,
    locale.toUpperCase() as DbLocale,
  );
  if (!article) notFound();

  const dict = await getDictionary(locale as Locale);
  const { labels, cta } = dict.articleDetail;

  return (
    <>
      {/* Halaman ini tidak punya hero gelap di belakang header. */}
      <SetHeaderMode mode="solid" />

      <div className="pt-24 md:pt-28">
        {/* ---------- HERO (category + title + excerpt, centered) ---------- */}
        <section className="bg-background-main px-6 pb-16 pt-16 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs tracking-widest uppercase text-eyebrow">
              {article.category}
            </p>
            <h1 className="mt-4 font-serif text-3xl leading-snug text-headline md:text-4xl">
              {article.title}
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-body">
              {article.excerpt}
            </p>
          </div>
        </section>

        {/* ---------- FULL-WIDTH IMAGE ---------- */}
        <section className="relative h-[360px] w-full overflow-hidden bg-background-alt md:h-[460px]">
          <Image
            src={PLACEHOLDER}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </section>

        {/* ---------- CONTENT + SIDEBAR ---------- */}
        <section className="bg-background-main px-6 py-16 md:px-10">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_320px]">
            <article className="max-w-2xl">
              <TiptapContent doc={article.content} />
            </article>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-background-alt p-8">
                <p className="text-xs tracking-widest uppercase text-eyebrow">
                  {labels.category}
                </p>
                <p className="mt-1 font-serif text-lg text-headline">
                  {article.category}
                </p>

                <p className="mt-6 text-xs tracking-widest uppercase text-eyebrow">
                  {labels.publishedAt}
                </p>
                <p className="mt-1 font-serif text-lg text-headline">
                  {article.publishedLabel}
                </p>

                <p className="mt-8 text-sm font-medium text-headline">
                  {cta.heading}
                </p>
                <Link
                  href={`/${locale}/contact`}
                  className="mt-4 inline-flex w-full items-center justify-center bg-eyebrow px-6 py-3 text-xs tracking-widest uppercase text-background-main hover:opacity-90"
                >
                  {cta.button}
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>

      <CtaBanner
        locale={locale as Locale}
        dict={dict.articleDetail.bannerCta}
        href="/journal"
      />
    </>
  );
}
