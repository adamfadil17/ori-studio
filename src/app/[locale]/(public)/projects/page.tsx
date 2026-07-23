import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import CtaBanner from "@/components/public/layout/cta-banner";
import ProjectsList from "@/components/public/projects/projects-list";
import FurtherProjects from "@/components/public/projects/further-projects";
import FeaturedProjectCarousel from "@/components/public/projects/featured-project-carousel";
import {
  listFeaturedProjectsForHero,
  listOngoingProjects,
  listPublishedProjects,
} from "@/lib/projects";
import type { Locale as DbLocale } from "@/lib/types";

const PLACEHOLDER = "https://placehold.net/default.svg";

// Listing dan strip "further" dibaca langsung dari database.
export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const { hero, featured, filters, further } = dict.projects;

  // Route locale is lowercase ("en"), the Prisma enum is uppercase ("EN").
  const dbLocale = locale.toUpperCase() as DbLocale;
  const [projects, ongoing, featuredHero] = await Promise.all([
    listPublishedProjects(dbLocale),
    listOngoingProjects(dbLocale),
    listFeaturedProjectsForHero(dbLocale),
  ]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative h-[520px] w-full overflow-hidden md:h-[600px]">
        <Image
          src={PLACEHOLDER}
          alt="ORI Studio Architect — our work"
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
            href="#all-projects"
            className="mt-8 inline-flex items-center gap-2 border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
          >
            {hero.cta}
          </Link>
        </div>
      </section>

      {/* ---------- FEATURED PROJECT (carousel, sama seperti di HomePage) ---------- */}
      {featuredHero.length > 0 && (
        <FeaturedProjectCarousel
          locale={locale as Locale}
          items={featuredHero}
          eyebrowLabel={featured.eyebrow}
          ctaLabel={featured.cta}
        />
      )}

      {/* ---------- ALL PROJECTS (filter + grid/list + pagination) ---------- */}
      <section
        id="all-projects"
        className="bg-background-main px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <ProjectsList
            locale={locale as Locale}
            projects={projects}
            labels={filters}
          />
        </div>
      </section>

      {/* ---------- FURTHER PROJECTS ---------- */}
      {/* Only work still in progress or planned. Hidden entirely when there is
          none, rather than leaving a heading with nothing under it. */}
      {ongoing.length > 0 && (
        <section className="bg-background-main px-6 pb-24 md:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-serif text-3xl text-headline">
              {further.headline}
            </h2>
            <span
              className="mt-3 block h-px w-10 bg-eyebrow"
              aria-hidden="true"
            />

            <FurtherProjects locale={locale as Locale} projects={ongoing} />
          </div>
        </section>
      )}

      <CtaBanner
        locale={locale as Locale}
        dict={dict.projects.cta}
        href="/contact?tab=inquiry#contact-form"
      />
    </>
  );
}
