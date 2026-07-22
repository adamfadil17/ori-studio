import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { JOURNAL_ARTICLES } from "@/lib/data/article-data";
import ArticleCard from "@/components/public/cards/article-card";
import CtaBanner from "@/components/public/layout/cta-banner";

const PLACEHOLDER = "https://placehold.net/default.svg";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const { hero, story, journey, values, team } = dict.about;
  const { stats } = dict.home.approach;
  const { journal } = dict.home;

  const ABOUT_JOURNAL_ARTICLES = JOURNAL_ARTICLES.slice(0, 4);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative h-[520px] w-full overflow-hidden md:h-[600px]">
        <Image
          src={PLACEHOLDER}
          alt="ORI Studio Architect team at work"
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
            href={`/${locale}/studio`}
            className="mt-8 inline-flex items-center gap-2 border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
          >
            {hero.cta}
          </Link>
        </div>
      </section>

      {/* ---------- OUR STORY ---------- */}
      <section className="bg-background-main px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
              {story.eyebrow}
              <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
            </p>
            <h2 className="mt-6 font-serif text-3xl leading-snug text-headline md:text-4xl">
              {story.headline}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-body">
              {story.body}
            </p>
            <Link
              href={`/${locale}/philosophy`}
              className="mt-8 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-eyebrow hover:opacity-70"
            >
              {story.cta}
              <ArrowRight
                className="h-4 w-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Staggered image pair — tidak overlap, ada gap antar gambar */}
          <div className="relative h-[420px] w-full sm:h-[480px]">
            <div className="absolute left-0 top-0 h-[45%] w-[72%] overflow-hidden bg-background-alt">
              <Image
                src={PLACEHOLDER}
                alt="ORI Studio project detail"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 h-[44%] w-[72%] overflow-hidden bg-background-alt">
              <Image
                src={PLACEHOLDER}
                alt="ORI Studio material detail"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- OUR JOURNEY ---------- */}
      <section className="bg-background-main px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {journey.eyebrow}
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-background-alt p-8">
                <p className="font-serif text-4xl text-headline">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-body">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- OUR VALUES & PRINCIPLES ---------- */}
      <section className="bg-background-main px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {values.eyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="relative aspect-square w-full overflow-hidden bg-background-alt lg:sticky lg:top-28">
              <Image
                src={PLACEHOLDER}
                alt="ORI Studio design values"
                fill
                className="object-cover"
              />
            </div>

            <dl>
              {values.items.map((item, index) => (
                <div
                  key={item.number}
                  className={`py-8 ${
                    index !== 0 ? "border-t border-headline/10" : "pt-0"
                  }`}
                >
                  <dt className="flex items-baseline gap-3">
                    <span className="font-serif text-lg text-eyebrow">
                      {item.number}
                    </span>
                    <span className="font-serif text-xl text-headline">
                      {item.title}
                    </span>
                  </dt>
                  <dd className="mt-3 max-w-lg text-sm leading-relaxed text-body">
                    {item.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- OUR TEAM ---------- */}
      <section className="bg-background-main px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {team.eyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.members.map((member) => (
              <div key={member.name}>
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-background-alt">
                  <Image
                    src={PLACEHOLDER}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 font-serif text-lg text-headline">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs tracking-widest uppercase text-body">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- JOURNAL ---------- */}
      <section className="bg-background-main px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
              {journal.eyebrow}
              <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
            </p>
            <Link
              href={`/${locale}/journal`}
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-eyebrow hover:opacity-70"
            >
              {journal.cta}
              <ArrowRight
                className="h-4 w-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT_JOURNAL_ARTICLES.map((article) => (
              <ArticleCard
                key={article.slug}
                locale={locale as Locale}
                slug={article.slug}
                title={article.title}
                category={article.category}
                publishedLabel={article.publishedLabel}
                imageUrl={PLACEHOLDER}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        locale={locale as Locale}
        dict={dict.about.cta}
        href="/contact?tab=inquiry#contact-form"
      />
    </>
  );
}
