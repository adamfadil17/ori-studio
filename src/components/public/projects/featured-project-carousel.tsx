"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { Locale } from "@/i18n/config";
import type { FeaturedHeroItem } from "@/lib/projects";

const PLACEHOLDER = "https://placehold.net/default.svg";

/**
 * The featured-project hero, shared by the home and projects pages.
 *
 * The prev/next arrows used to be dead static buttons; here they cycle through
 * the featured projects. The whole thing is client-side because that stepping
 * needs state — the list itself is fetched on the server and passed in.
 */
export default function FeaturedProjectCarousel({
  locale,
  items,
  eyebrowLabel,
  ctaLabel,
}: {
  locale: Locale;
  items: FeaturedHeroItem[];
  eyebrowLabel: string;
  ctaLabel: string;
}) {
  const [index, setIndex] = useState(0);

  // Guarded by the caller too, but keeps the component safe on its own.
  if (items.length === 0) return null;

  const active = items[index];
  const many = items.length > 1;

  // Wrap around so both arrows always lead somewhere.
  const go = (delta: number) =>
    setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <section className="grid bg-background-alt md:grid-cols-2">
      <div className="relative aspect-[4/3] w-full md:aspect-auto">
        <Image
          key={active.slug}
          src={active.imageUrl ?? PLACEHOLDER}
          alt={active.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-center px-6 py-16 md:px-16">
        <div className="flex items-center justify-between">
          <p className="text-xs tracking-widest uppercase text-eyebrow">
            {eyebrowLabel}
          </p>

          {/* Hidden rather than shown-but-inert when there's only one featured
              project — a control that does nothing is worse than no control. */}
          {many && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous featured project"
                className="text-eyebrow transition-opacity hover:opacity-60 hover:cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next featured project"
                className="text-eyebrow transition-opacity hover:opacity-60 hover:cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <h2 className="mt-4 font-serif text-3xl text-headline md:text-4xl">
          {active.name}
        </h2>
        <span className="mt-4 h-px w-10 bg-headline/30" aria-hidden="true" />

        {active.description && (
          <p className="mt-5 max-w-md text-sm leading-relaxed text-body">
            {active.description}
          </p>
        )}

        <p className="mt-5 text-sm text-body">
          {active.location} <span aria-hidden="true">—</span> {active.yearLabel}
        </p>

        <Link
          href={`/${locale}/projects/${active.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-eyebrow hover:opacity-70"
        >
          {ctaLabel}
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}