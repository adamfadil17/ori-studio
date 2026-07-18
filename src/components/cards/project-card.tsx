import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

export interface ProjectCardProps {
  locale: Locale;
  slug: string;
  name: string;
  location: string;
  /** Contoh: "2025" atau "2023-2025" */
  yearLabel: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
}

export default function ProjectCard({
  locale,
  slug,
  name,
  location,
  yearLabel,
  thumbnailUrl = "https://placehold.net/default.svg",
  thumbnailAlt,
}: ProjectCardProps) {
  return (
    <Link
      href={`/${locale}/projects/${slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow focus-visible:ring-offset-4"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-alt">
        <Image
          src={thumbnailUrl}
          alt={thumbnailAlt ?? name}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex items-start justify-between gap-4 pt-5">
        <div>
          <h3 className="font-serif text-lg text-headline">{name}</h3>
          <p className="mt-1 text-sm text-body">
            {location} <span aria-hidden="true">—</span> {yearLabel}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="mt-2 shrink-0 text-headline transition-transform duration-300 group-hover:translate-x-1"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4 9h10M9 4l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
