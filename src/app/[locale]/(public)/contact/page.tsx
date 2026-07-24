import Image from "next/image";
import CtaBanner from "@/components/public/layout/cta-banner";
import ContactExperience, {
  type ContactTab,
} from "@/components/public/contact/contact-experience";
import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";

const PLACEHOLDER = "https://placehold.net/default.svg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const dict = await getDictionary(locale as Locale);
  return staticPageMetadata(locale, "/contact", dict.contact.meta);
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const { tab } = await searchParams;
  const validTabs: ContactTab[] = ["inquiry", "partnership", "career"];
  const initialTab: ContactTab = validTabs.includes(tab as ContactTab)
    ? (tab as ContactTab)
    : "inquiry";

  const dict = await getDictionary(locale as Locale);
  const { hero } = dict.contact;

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative h-[520px] w-full overflow-hidden md:h-[600px]">
        <Image
          src={PLACEHOLDER}
          alt="ORI Studio Architect — contact"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/40" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-start justify-center px-6 md:px-10">
          <p className="text-xs tracking-widest uppercase text-background-main">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-2xl whitespace-pre-line font-serif text-4xl leading-tight text-background-main md:text-5xl">
            {hero.headline}
          </h1>
          <p className="mt-5 max-w-md text-sm text-background-main/85">
            {hero.subheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-3">
            <a
              href="?tab=inquiry#contact-form"
              className="border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
            >
              {hero.linkInquiry}
            </a>
            <a
              href="?tab=partnership#contact-form"
              className="border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
            >
              {hero.linkPartnership}
            </a>
            <a
              href="?tab=career#contact-form"
              className="border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
            >
              {hero.linkCareer}
            </a>
          </div>
        </div>
      </section>

      {/* ---------- TABS + FORM + FAQ ---------- */}
      <ContactExperience dict={dict.contact} initialTab={initialTab} />

      <CtaBanner
        locale={locale as Locale}
        dict={dict.contact.cta}
        href="/projects"
      />
    </>
  );
}
