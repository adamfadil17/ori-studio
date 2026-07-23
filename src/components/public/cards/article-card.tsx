import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";

export interface ArticleCardProps {
  locale: Locale;
  slug: string;
  title: string;
  category: string;
  /** Sudah diformat, mis. "MAY 12, 2024" */
  publishedLabel: string;
  imageUrl?: string;
  imageAlt?: string;
}

export default function ArticleCard({
  locale,
  slug,
  title,
  category,
  publishedLabel,
  imageUrl = "https://placehold.net/default.svg",
  imageAlt,
}: ArticleCardProps) {
  return (
    <Link
      href={`/${locale}/journal/${slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow focus-visible:ring-offset-4"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-alt">
        <Image
          src={imageUrl}
          alt={imageAlt ?? title}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="pt-4">
        <p className="flex items-center gap-2 text-[11px] tracking-widest text-body">
          <span>{publishedLabel.toUpperCase()}</span>
          <span aria-hidden="true">&bull;</span>
          <span>{category.toUpperCase()}</span>
        </p>

        <h3 className="mt-2 font-serif text-base leading-snug text-headline">
          {title}
        </h3>

        <span className="mt-4 inline-flex items-center gap-1.5 text-xs tracking-widest text-eyebrow">
          READ MORE
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}