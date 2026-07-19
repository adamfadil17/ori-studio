import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

interface CtaBannerDictionary {
  eyebrow: string;
  headline: string;
  subheadline: string;
  cta: string;
}

interface CtaBannerProps {
  locale: Locale;
  dict: CtaBannerDictionary;
  /** Path relatif setelah locale, mis. "/contact" */
  href?: string;
  imageUrl?: string;
}

export default function CtaBanner({
  locale,
  dict,
  href = "/contact",
  imageUrl = "https://placehold.net/default.svg",
}: CtaBannerProps) {
  return (
    <section className="relative mx-6 mb-6 overflow-hidden md:mx-10 md:mb-10">
      <div className="relative h-[420px] w-full">
        <Image
          src={imageUrl}
          alt={dict.headline}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-xs tracking-widest uppercase text-background-main">
            {dict.eyebrow}
          </p>
          <h2 className="mt-4 max-w-xl font-serif text-3xl leading-snug text-background-main md:text-4xl">
            {dict.headline}
          </h2>
          <p className="mt-4 max-w-md text-sm text-background-main/85">
            {dict.subheadline}
          </p>
          <Link
            href={`/${locale}${href}`}
            className="mt-8 inline-flex items-center gap-2 border-b border-background-main pb-1 text-xs tracking-widest uppercase text-background-main hover:opacity-80"
          >
            {dict.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}