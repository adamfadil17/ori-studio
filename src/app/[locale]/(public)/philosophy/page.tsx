import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import CtaBanner from "@/components/cta-banner/cta-banner";

const PLACEHOLDER = "https://placehold.net/default.svg";

export default async function PhilosophyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const { hero, sectionEyebrow, principles, quote } = dict.philosophy;

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative h-[520px] w-full overflow-hidden md:h-[600px]">
        <Image
          src={PLACEHOLDER}
          alt="ORI Studio Architect design philosophy"
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
            href="#principles"
            className="mt-8 inline-flex items-center gap-2 border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
          >
            {hero.cta}
          </Link>
        </div>
      </section>

      {/* ---------- OUR PRINCIPLES ---------- */}
      <section
        id="principles"
        className="bg-background-main px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {sectionEyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>

          <div className="mt-8">
            {principles.map((item, index) => (
              <div
                key={item.label}
                className={`grid gap-8 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 ${
                  index !== 0 ? "border-t border-headline/10" : "pt-0"
                }`}
              >
                <div>
                  <p className="text-xs tracking-widest uppercase text-eyebrow">
                    {item.label}
                  </p>
                  <h2 className="mt-3 font-serif text-3xl leading-snug text-headline md:text-4xl">
                    {item.title}
                  </h2>
                  <p className="mt-5 max-w-lg text-sm leading-relaxed text-body">
                    {item.body}
                  </p>
                </div>

                <div className="relative aspect-square w-full overflow-hidden bg-background-main">
                  <Image
                    src={PLACEHOLDER}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- IMAGE BREAK ---------- */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <Image
          src={PLACEHOLDER}
          alt="ORI Studio Architect at work"
          fill
          className="object-cover"
        />
      </section>

      {/* ---------- QUOTE ---------- */}
      <section className="bg-background-main px-6 py-24 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <QuoteIcon />
          <blockquote className="mt-6 font-serif text-2xl leading-snug text-headline md:text-3xl">
            &ldquo;{quote.text}&rdquo;
          </blockquote>

          <div className="mt-8 flex flex-col items-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-background-main">
              <Image
                src={PLACEHOLDER}
                alt={quote.name}
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-4 font-serif text-base text-headline">
              {quote.name}
            </p>
            <p className="mt-1 text-xs tracking-widest uppercase text-body">
              {quote.role}
            </p>
          </div>
        </div>
      </section>

      <CtaBanner locale={locale as Locale} dict={dict.workWithCta} />
    </>
  );
}

function QuoteIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="mx-auto text-eyebrow"
    >
      <path
        d="M9.5 9C6.5 9 4 11.5 4 14.5S6.5 20 9.5 20c.6 0 1.2-.1 1.7-.3-.6 2.6-2.6 4.6-5.2 5.3l1 2c4.4-1.2 7.5-5 7.5-9.9V14.5C14.5 11.5 12 9 9.5 9Zm14 0c-3 0-5.5 2.5-5.5 5.5S20.5 20 23.5 20c.6 0 1.2-.1 1.7-.3-.6 2.6-2.6 4.6-5.2 5.3l1 2c4.4-1.2 7.5-5 7.5-9.9V14.5C28.5 11.5 26 9 23.5 9Z"
        fill="currentColor"
      />
    </svg>
  );
}