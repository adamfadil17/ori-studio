import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  PencilRuler,
  Sofa,
  Trees,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import ProjectCard from "@/components/cards/project-card";
import ArticleCard from "@/components/cards/article-card";

const PLACEHOLDER = "https://placehold.net/default.svg";

// Icon per service, urutannya mengikuti urutan dict.home.services.items
// (Architecture Design, Interior Design, Landscape Design, Project Management).
const SERVICE_ICONS = [PencilRuler, Sofa, Trees, ClipboardList];

// Data proyek & artikel di bawah ini nantinya diganti query Prisma
// (Project + ProjectTranslation, Article + ArticleTranslation) sesuai locale aktif.
const FEATURED_PROJECTS = [
  {
    slug: "tegalalang-courtyard-house",
    name: "Tegalalang Courtyard House",
    location: "Tegalalang, Bali, Indonesia",
    yearLabel: "2025",
  },
  {
    slug: "sanur-beach-villa",
    name: "Sanur Beach Villa",
    location: "Sanur, Bali, Indonesia",
    yearLabel: "2024",
  },
  {
    slug: "ubud-wellness-retreat",
    name: "Ubud Wellness Retreat",
    location: "Ubud, Bali, Indonesia",
    yearLabel: "2025",
  },
] as const;

const JOURNAL_ARTICLES = [
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
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const {
    hero,
    about,
    services,
    featuredProject,
    projects,
    approach,
    journal,
  } = dict.home;

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative h-[520px] w-full overflow-hidden md:h-[600px]">
        {/* Background image */}
        <Image
          src={PLACEHOLDER}
          alt="ORI Studio Architect — featured architecture"
          fill
          priority
          className="object-cover"
        />
        {/* Overlay gelap supaya teks & header tetap kontras di atas foto */}
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
            href={`/${locale}/projects`}
            className="mt-8 inline-flex items-center gap-2 border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
          >
            {hero.cta}
          </Link>
        </div>
      </section>

      {/* ---------- ABOUT ---------- */}
      <section className="bg-background-main px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {about.eyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr_1.1fr] lg:items-start">
            <h2 className="font-serif text-3xl leading-snug text-headline md:text-4xl">
              {about.headline}
            </h2>

            <div>
              <p className="text-sm leading-relaxed text-body">{about.body}</p>
              <Link
                href={`/${locale}/philosophy`}
                className="mt-6 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-headline hover:opacity-70"
              >
                {about.cta}
                <ArrowRight
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-alt lg:aspect-auto lg:h-72">
              <Image
                src={PLACEHOLDER}
                alt="ORI Studio Architect at work"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SERVICES ---------- */}
      <section className="bg-background-main px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {services.eyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>

          <div className="mt-8 grid gap-10 bg-background-alt p-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-14">
            {services.items.map((service, index) => {
              const Icon = SERVICE_ICONS[index] ?? PencilRuler;
              return (
                <div key={service.title}>
                  <Icon
                    className="h-7 w-7 text-headline"
                    strokeWidth={1.2}
                    aria-hidden="true"
                  />
                  <h3 className="mt-5 font-serif text-xl leading-snug text-headline">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-body">
                    {service.description}
                  </p>
                  <Link
                    href={`/${locale}/studio`}
                    className="mt-4 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-headline hover:opacity-70"
                  >
                    {services.cta}
                    <ArrowRight
                      className="h-4 w-4"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- FEATURED PROJECT ---------- */}
      <section className="grid bg-background-alt md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full md:aspect-auto">
          <Image
            src={PLACEHOLDER}
            alt="Uluwatu Clifftop Residence"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center px-6 py-16 md:px-16">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-widest uppercase text-eyebrow">
              {featuredProject.eyebrow}
            </p>
            <div className="flex items-center gap-3 text-headline">
              <button
                type="button"
                aria-label="Previous featured project"
                className="hover:cursor-pointer"
              >
                <ChevronLeft
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                aria-label="Next featured project"
                className="hover:cursor-pointer"
              >
                <ChevronRight
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <h2 className="mt-4 font-serif text-3xl text-headline md:text-4xl">
            Uluwatu Clifftop Residence
          </h2>
          <span className="mt-4 h-px w-10 bg-headline/30" aria-hidden="true" />

          <p className="mt-5 max-w-md text-sm leading-relaxed text-body">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy
            text ever since 1966, when designers at Letraset and James Mosley,
            the librarian at St Bride Printing Library in London.
          </p>

          <Link
            href={`/${locale}/projects/uluwatu-clifftop-residence`}
            className="mt-6 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-headline hover:opacity-70"
          >
            {featuredProject.cta}
            <ArrowRight
              className="h-4 w-4"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

      {/* ---------- PROJECTS GRID ---------- */}
      <section className="bg-background-main px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
              {projects.eyebrow}
              <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
            </p>
            <Link
              href={`/${locale}/projects`}
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-headline hover:opacity-70"
            >
              {projects.cta}
              <ArrowRight
                className="h-4 w-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_PROJECTS.map((project) => (
              <ProjectCard
                key={project.slug}
                locale={locale as Locale}
                slug={project.slug}
                name={project.name}
                location={project.location}
                yearLabel={project.yearLabel}
                thumbnailUrl={PLACEHOLDER}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- APPROACH / STATS ---------- */}
      <section className="bg-background-alt px-6 py-24 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-main">
            <Image
              src={PLACEHOLDER}
              alt="ORI Studio design approach"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="font-serif text-3xl leading-snug text-headline md:text-4xl">
              {approach.headline}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-body">
              {approach.body}
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
              {approach.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-serif text-3xl text-headline">
                    {stat.value}
                  </dd>
                  <p className="mt-1 text-xs leading-snug text-body">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>

            <Link
              href={`/${locale}/philosophy`}
              className="mt-10 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-headline hover:opacity-70"
            >
              {approach.cta}
              <ArrowRight
                className="h-4 w-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- JOURNAL ---------- */}
      <section className="bg-background-main px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
              {journal.eyebrow}
              <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
            </p>
            <Link
              href={`/${locale}/journal`}
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-headline hover:opacity-70"
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
            {JOURNAL_ARTICLES.map((article) => (
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
    </>
  );
}