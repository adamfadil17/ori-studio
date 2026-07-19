import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import CtaBanner from "@/components/cta-banner/cta-banner";
import ProjectsList, {
  ProjectListItem,
} from "@/components/projects/projects-list";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PLACEHOLDER = "https://placehold.net/default.svg";

// Data proyek di bawah ini nantinya diganti query Prisma
// (Project + ProjectTranslation) sesuai locale aktif.
const ALL_PROJECTS: readonly ProjectListItem[] = [
  {
    slug: "tegalalang-courtyard-house",
    name: "Tegalalang Courtyard House",
    location: "Tegalalang, Bali, Indonesia",
    yearLabel: "2025",
    category: "RESIDENTIAL",
    services: ["ARCHITECTURE_DESIGN", "INTERIOR_DESIGN"],
  },
  {
    slug: "sanur-beach-villa",
    name: "Sanur Beach Villa",
    location: "Sanur, Bali, Indonesia",
    yearLabel: "2024",
    category: "RESIDENTIAL",
    services: ["ARCHITECTURE_DESIGN", "LANDSCAPE_DESIGN"],
  },
  {
    slug: "ubud-wellness-retreat",
    name: "Ubud Wellness Retreat",
    location: "Ubud, Bali, Indonesia",
    yearLabel: "2025",
    category: "HOSPITALITY",
    services: ["ARCHITECTURE_DESIGN", "LANDSCAPE_DESIGN"],
  },
  {
    slug: "kintamani-hills-residence",
    name: "Kintamani Hills Residence",
    location: "Kintamani, Bali, Indonesia",
    yearLabel: "2023",
    category: "RESIDENTIAL",
    services: ["ARCHITECTURE_DESIGN"],
  },
  {
    slug: "seminyak-artisan-cafe",
    name: "Seminyak Artisan Café",
    location: "Seminyak, Bali, Indonesia",
    yearLabel: "2024",
    category: "COMMERCIAL",
    services: ["INTERIOR_DESIGN", "PROJECT_MANAGEMENT"],
  },
  {
    slug: "canggu-creative-office",
    name: "Canggu Creative Office",
    location: "Canggu, Bali, Indonesia",
    yearLabel: "2025",
    category: "COMMERCIAL",
    services: ["ARCHITECTURE_DESIGN", "PROJECT_MANAGEMENT"],
  },
  {
    slug: "jimbaran-cliff-house",
    name: "Jimbaran Cliff House",
    location: "Jimbaran, Bali, Indonesia",
    yearLabel: "2026",
    category: "RESIDENTIAL",
    services: ["ARCHITECTURE_DESIGN", "LANDSCAPE_DESIGN"],
  },
  {
    slug: "nusa-dua-boutique-hotel",
    name: "Nusa Dua Boutique Hotel",
    location: "Nusa Dua, Bali, Indonesia",
    yearLabel: "2023",
    category: "HOSPITALITY",
    services: ["ARCHITECTURE_DESIGN", "INTERIOR_DESIGN"],
  },
  {
    slug: "lombok-coastal-pavilion",
    name: "Lombok Coastal Pavilion",
    location: "Lombok, West Nusa Tenggara, Indonesia",
    yearLabel: "2025",
    category: "LANDSCAPE",
    services: ["LANDSCAPE_DESIGN"],
  },
] as const;

// Proyek yang masih berjalan / belum dipublikasikan penuh — ditampilkan
// sebagai daftar sederhana di section "Further Projects".
const FURTHER_PROJECTS = [
  {
    slug: "bandung-courtyard-office",
    name: "Bandung Courtyard Office",
    location: "Bandung, West Java, Indonesia",
    yearLabel: "2025 - Present",
  },
  {
    slug: "uluwatu-family-residence",
    name: "Uluwatu Family Residence",
    location: "Uluwatu, Bali, Indonesia",
    yearLabel: "2026 - Present",
  },
  {
    slug: "labuan-bajo-eco-lodge",
    name: "Labuan Bajo Eco Lodge",
    location: "Labuan Bajo, East Nusa Tenggara, Indonesia",
    yearLabel: "2025 - Present",
  },
  {
    slug: "sayan-house",
    name: "Sayan House",
    location: "Ubud, Bali",
    yearLabel: "2023 - Present",
  },
  {
    slug: "sayan-house-2",
    name: "Sayan House",
    location: "Ubud, Bali",
    yearLabel: "2023 - Present",
  },
] as const;

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  // NOTE: perlu ditambahkan ke i18n dictionary — lihat struktur "projects"
  // yang disarankan di akhir chat.
  const { hero, featured, filters, further } = dict.projects;

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

      {/* ---------- FEATURED PROJECT (pola sama seperti di HomePage) ---------- */}
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
              {featured.eyebrow}
            </p>
            <div className="flex items-center gap-3 text-headline">
              <button type="button" aria-label="Previous featured project" className="hover:cursor-pointer">
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

          <p className="mt-5 text-sm text-body">
            Tegalalang, Bali, Indonesia <span aria-hidden="true">—</span> 2025
          </p>

          <Link
            href={`/${locale}/projects/uluwatu-clifftop-residence`}
            className="mt-6 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-headline hover:opacity-70"
          >
            {featured.cta}
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* ---------- ALL PROJECTS (filter + grid/list + pagination) ---------- */}
      <section
        id="all-projects"
        className="bg-background-main px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <ProjectsList
            locale={locale as Locale}
            projects={ALL_PROJECTS}
            labels={filters}
          />
        </div>
      </section>

      {/* ---------- FURTHER PROJECTS ---------- */}
      <section className="bg-background-main px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-3xl text-headline">
            {further.headline}
          </h2>
          <span
            className="mt-3 block h-px w-10 bg-eyebrow"
            aria-hidden="true"
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div className="relative w-full lg:aspect-auto lg:h-full overflow-hidden bg-background-alt">
              <Image
                src={PLACEHOLDER}
                alt="ORI Studio upcoming projects"
                fill
                className="object-cover"
              />
            </div>

            <div>
              {FURTHER_PROJECTS.map((project) => (
                <Link
                  key={project.slug}
                  href={`/${locale}/projects/${project.slug}`}
                  className="group flex items-center justify-between gap-4 border-b border-headline/10 py-6 first:pt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
                >
                  <div>
                    <h3 className="font-serif text-lg text-headline">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-body">
                      {project.location} <span aria-hidden="true">—</span>{" "}
                      {project.yearLabel}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="shrink-0 text-headline transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <ArrowIcon />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBanner locale={locale as Locale} dict={dict.workWithCta} />
    </>
  );
}

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={direction === "left" ? "rotate-180" : ""}
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
