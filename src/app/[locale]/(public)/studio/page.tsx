import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import DesignProcess from "@/components/studio/design-process";
import CtaBanner from "@/components/cta-banner/cta-banner";
import ServicesAccordion from "@/components/studio/services-accordion";

const PLACEHOLDER = "https://placehold.net/default.svg";

// Grid galeri "Studio Culture" — pola col-span berselang-seling per baris,
// meniru layout di desain. Pola "besar" (md:col-span-2) baru aktif dari
// breakpoint md (tablet/iPad) ke atas; di HP semua foto ukuran seragam.
// Nanti bisa diganti foto studio asli.
const CULTURE_GALLERY_SPANS = [
  "",
  "",
  "md:col-span-2",
  "",
  "md:col-span-2",
  "",
  "md:col-span-2",
  "",
  "",
] as const;

export default async function StudioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const { hero, process, services, culture } = dict.studio;

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative h-[520px] w-full overflow-hidden md:h-[600px]">
        <Image
          src={PLACEHOLDER}
          alt="ORI Studio Architect team collaborating"
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
            href={`/${locale}/contact`}
            className="mt-8 inline-flex items-center gap-2 border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
          >
            {hero.cta}
          </Link>
        </div>
      </section>

      {/* ---------- DESIGN PROCESS ---------- */}
      <section className="bg-background-main px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {process.eyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>

          <div className="mt-8">
            <DesignProcess steps={process.steps} imageUrl={PLACEHOLDER} />
          </div>
        </div>
      </section>

      {/* ---------- OUR SERVICES (accordion) ---------- */}
      <section className="bg-background-alt px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {services.eyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>

          <div className="mt-8">
            <ServicesAccordion items={services.items} imageUrl={PLACEHOLDER} />
          </div>
        </div>
      </section>

      {/* ---------- STUDIO CULTURE ---------- */}
      <section className="bg-background-main px-6 py-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {culture.eyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>
          <h2 className="mt-6 max-w-2xl font-serif text-3xl leading-snug text-headline md:text-4xl">
            {culture.headline}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-body">
            {culture.body}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {CULTURE_GALLERY_SPANS.map((span, index) => (
              <div
                key={index}
                className={`relative h-[220px] overflow-hidden bg-background-alt sm:h-[260px] md:h-[300px] ${span}`}
              >
                <Image
                  src={PLACEHOLDER}
                  alt="ORI Studio culture"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner locale={locale as Locale} dict={dict.workWithCta} />
    </>
  );
}