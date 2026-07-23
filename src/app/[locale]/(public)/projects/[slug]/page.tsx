import Image from "next/image";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import ProjectCardView from "@/components/public/projects/project-card-view";
import CtaBanner from "@/components/public/layout/cta-banner";
import {
  getPublicProjectDetail,
  getRelatedPublicProjects,
} from "@/lib/projects";
import type { Locale as DbLocale } from "@/lib/types";
import GalleryMosaic from "@/components/public/projects/gallery-mossaic";
import SetHeaderMode from "@/components/public/layout/set-header-mode";

const PLACEHOLDER = "https://placehold.net/default.svg";

// Read fresh on every request so an edit made in the dashboard shows at once,
// instead of Next.js serving a statically cached copy.
export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  // Route locale is lowercase ("en"); the Prisma enum is uppercase ("EN").
  const dbLocale = locale.toUpperCase() as DbLocale;
  const project = await getPublicProjectDetail(slug, dbLocale);
  if (!project) notFound();

  const dict = await getDictionary(locale as Locale);
  const {
    keyInformation,
    labels,
    relatedProjects: relatedLabel,
  } = dict.projectDetail;
  const related = await getRelatedPublicProjects(project.id, dbLocale);

  const keyInfoRows: Array<[string, string]> = [
    [labels.year, project.keyInfo.year],
    [labels.sector, project.keyInfo.sector],
    [labels.status, project.keyInfo.status],
    [labels.client, project.keyInfo.client],
    [labels.siteArea, project.keyInfo.siteArea],
    [labels.architect, project.keyInfo.architect],
    [labels.location, project.keyInfo.location],
    [labels.buildingArea, project.keyInfo.buildingArea],
    [labels.generalContractor, project.keyInfo.generalContractor],
  ];

  return (
    <>
      {/* Halaman ini tidak punya hero image di belakang header, jadi header
          harus selalu solid sejak awal (bukan transparan-lalu-solid). */}
      <SetHeaderMode mode="solid" />

      {/* pt- di sini mengkompensasi Header yang fixed, karena section pertama
          di halaman ini bukan hero full-bleed seperti halaman lain. */}
      <div className="pt-24 md:pt-28">
        {/* ---------- HERO IMAGE (heroImages[0] dari 2 gambar) ---------- */}
        <section className="px-6 pt-6 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-background-alt shadow-xl md:aspect-[21/9]">
              <Image
                src={project.heroImages[0]?.url ?? PLACEHOLDER}
                alt={project.heroImages[0]?.alt ?? project.name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                <h1 className="font-serif text-2xl text-background-main md:text-3xl">
                  {project.name}
                </h1>
                <p className="mt-1 text-sm text-background-main/85">
                  {project.yearLabel}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- DESCRIPTION ---------- */}
        <section className="bg-background-main px-6 py-16 md:px-10">
          <div className="mx-auto max-w-4xl">
            <p className="font-serif text-2xl leading-relaxed text-body md:text-3xl">
              {project.description}
            </p>
          </div>
        </section>

        {/* ---------- KEY INFORMATION ---------- */}
        <section className="bg-background-main px-6 pb-24 md:px-10">
          <div className="mx-auto max-w-4xl bg-background-alt p-8 md:p-12">
            <h2 className="font-serif text-2xl text-headline">
              {keyInformation}
            </h2>
            <span
              className="mt-3 block h-px w-10 bg-headline/30"
              aria-hidden="true"
            />

            <dl className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-3">
              {keyInfoRows.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs tracking-widest uppercase text-eyebrow">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-headline">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------- FULL-WIDTH IMAGE (heroImages[1] dari 2 gambar) ---------- */}
        <section className="relative h-[420px] w-full overflow-hidden bg-background-alt md:h-[520px]">
          <Image
            src={project.heroImages[1]?.url ?? PLACEHOLDER}
            alt={project.heroImages[1]?.alt ?? project.name}
            fill
            className="object-cover"
          />
        </section>

        {/* ---------- PHILOSOPHY + IMAGE GALLERY (5 Gallery Image) ---------- */}
        <section className="bg-background-main px-6 py-24 md:px-10">
          <div className="mx-auto max-w-7xl">
            {/* The old dummy data carried this heading per project; it was the
                same word every time, so it lives here now rather than in the
                database as a field an editor would have to retype. */}
            <h2 className="font-serif text-3xl text-headline">
              {locale === "id" ? "Filosofi" : "Philosophy"}
            </h2>
            <span
              className="mt-3 block h-px w-10 bg-headline/30"
              aria-hidden="true"
            />

            <p className="mt-6 font-serif text-2xl leading-relaxed text-body md:text-3xl">
              {project.philosophy}
            </p>

            <GalleryMosaic
              images={project.galleryImages.map((img) => img.url)}
              alt={project.name}
            />
          </div>
        </section>

        {/* ---------- RELATED PROJECTS ---------- */}
        <section className="bg-background-main px-6 pb-24 md:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-serif text-3xl text-headline">
              {relatedLabel}
            </h2>
            <span
              className="mt-3 block h-px w-10 bg-headline/30"
              aria-hidden="true"
            />

            <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProjectCardView
                  key={item.slug}
                  locale={locale as Locale}
                  slug={item.slug}
                  name={item.name}
                  location={item.location}
                  yearLabel={item.yearLabel}
                  thumbnailUrl={PLACEHOLDER}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <CtaBanner
        locale={locale as Locale}
        dict={dict.projectDetail.cta}
        href="/contact?tab=inquiry#contact-form"
      />
    </>
  );
}
