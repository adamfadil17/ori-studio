import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import CtaBanner from "@/components/cta-banner/cta-banner";
import ArticleList, {
  ArticleListItem,
} from "@/components/journal/article-list";

const PLACEHOLDER = "https://placehold.net/default.svg";

// Data artikel di bawah ini nantinya diganti query Prisma
// (Article + ArticleTranslation) sesuai locale aktif.
const ALL_ARTICLES: readonly ArticleListItem[] = [
  {
    slug: "the-beauty-of-shadow",
    title: "The Beauty of Shadow",
    category: "Inspiration",
    publishedLabel: "May 12, 2024",
  },
  {
    slug: "tropical-modernism-in-bali",
    title: "Tropical Modernism in Bali",
    category: "Journal",
    publishedLabel: "Apr 28, 2024",
  },
  {
    slug: "material-notes-limestone-wood",
    title: "Material Notes: Limestone & Wood",
    category: "Material",
    publishedLabel: "May 10, 2024",
  },
  {
    slug: "designing-for-meaningful-living",
    title: "Designing for Meaningful Living",
    category: "Philosophy",
    publishedLabel: "May 27, 2024",
  },
  {
    slug: "the-quiet-power-of-natural-light",
    title: "The Quiet Power of Natural Light",
    category: "Inspiration",
    publishedLabel: "Jun 3, 2024",
  },
  {
    slug: "notes-on-courtyard-living",
    title: "Notes on Courtyard Living",
    category: "Journal",
    publishedLabel: "Jun 18, 2024",
  },
  {
    slug: "working-with-reclaimed-teak",
    title: "Working with Reclaimed Teak",
    category: "Material",
    publishedLabel: "Jul 2, 2024",
  },
  {
    slug: "designing-for-slow-mornings",
    title: "Designing for Slow Mornings",
    category: "Philosophy",
    publishedLabel: "Jul 15, 2024",
  },
  {
    slug: "the-craft-behind-every-detail",
    title: "The Craft Behind Every Detail",
    category: "Inspiration",
    publishedLabel: "Jul 29, 2024",
  },
] as const;

export default async function JournalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  // NOTE: perlu ditambahkan ke i18n dictionary — lihat struktur "journal"
  // yang disarankan di akhir chat.
  const { hero, featured, explore, filters } = dict.journal;

  const featuredArticles = ALL_ARTICLES.slice(0, 2);

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

      {/* ---------- FEATURED READ (pola sama seperti Featured Project) ---------- */}
      <section className="bg-background-main px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
                {featured.eyebrow}
                <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
              </p>
              <h2 className="mt-4 max-w-xl font-serif text-3xl leading-snug text-headline md:text-4xl">
                {featured.headline}
              </h2>
              <span
                className="mt-4 block h-px w-10 bg-headline/30"
                aria-hidden="true"
              />
            </div>

            <div className="flex shrink-0 items-center gap-3 text-headline">
              <button type="button" aria-label="Previous featured article">
                <ArrowIcon direction="left" />
              </button>
              <button type="button" aria-label="Next featured article">
                <ArrowIcon />
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {featuredArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/${locale}/journal/${article.slug}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow focus-visible:ring-offset-4"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-background-alt">
                  <Image
                    src={PLACEHOLDER}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="pt-4">
                  <p className="flex items-center gap-2 text-[11px] tracking-widest text-body">
                    <span>{article.publishedLabel.toUpperCase()}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>{article.category.toUpperCase()}</span>
                  </p>
                  <h3 className="mt-2 font-serif text-lg leading-snug text-headline">
                    {article.title}
                  </h3>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs tracking-widest text-headline">
                    READ MORE
                    <ArrowIcon direction="right" small />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
              articles={ALL_ARTICLES}
              labels={filters}
            />
          </div>
        </div>
      </section>

      <CtaBanner locale={locale as Locale} dict={dict.workWithCta} />
    </>
  );
}

function ArrowIcon({
  direction = "right",
  small = false,
}: {
  direction?: "left" | "right";
  small?: boolean;
}) {
  const size = small ? 14 : 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-300 ${
        direction === "left" ? "rotate-180" : "group-hover:translate-x-1"
      }`}
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
