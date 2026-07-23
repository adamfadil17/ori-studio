import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { ArrowRight } from "lucide-react";

export interface ProjectCardProps {
  locale: Locale;
  slug: string;
  name: string;
  location: string;
  /** Contoh: "2025" atau "2023-2025" */
  yearLabel: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  /** "grid" = kartu vertikal (default), "list" = baris horizontal untuk list view */
  layout?: "grid" | "list";
}

export default function ProjectCardView({
  locale,
  slug,
  name,
  location,
  yearLabel,
  thumbnailUrl = "https://placehold.net/default.svg",
  thumbnailAlt,
  layout = "grid",
}: ProjectCardProps) {
  if (layout === "list") {
    return (
      <Link
        href={`/${locale}/projects/${slug}`}
        className="group flex items-center gap-6 border-t border-headline/10 py-6 first:border-t-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
      >
        <div className="relative h-20 w-24 shrink-0 overflow-hidden bg-background-alt sm:h-24 sm:w-32">
          <Image
            src={thumbnailUrl}
            alt={thumbnailAlt ?? name}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg text-headline">{name}</h3>
            <p className="mt-1 text-sm text-body">
              {location} <span aria-hidden="true">—</span> {yearLabel}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="shrink-0 text-eyebrow transition-transform duration-300 group-hover:translate-x-1"
          >
            <ArrowRight
              className="h-[18px] w-[18px]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${locale}/projects/${slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow focus-visible:ring-offset-4"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-background-alt">
        <Image
          src={thumbnailUrl}
          alt={thumbnailAlt ?? name}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <h3 className="font-serif text-base text-headline">{name}</h3>
          <p className="mt-1 text-xs text-body">
            {location} <span aria-hidden="true">—</span> {yearLabel}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="mt-1 shrink-0 text-eyebrow transition-transform duration-300 group-hover:translate-x-1"
        >
          <ArrowRight
            className="h-[18px] w-[18px]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
