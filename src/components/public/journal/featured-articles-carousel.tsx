"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { Locale } from "@/i18n/config";
import type { ArticleListItem } from "./article-list";

const PLACEHOLDER = "https://placehold.net/default.svg";
const PER_SLIDE = 2;

/**
 * The journal's "Featured Read" strip: two article cards per slide, paged by
 * the prev/next arrows. When the featured count is odd, the final slide shows a
 * single card rather than padding with a blank.
 *
 * Client-side because the paging needs state; the featured list is fetched on
 * the server and passed in.
 */
export default function FeaturedArticlesCarousel({
  locale,
  items,
  eyebrowLabel,
  headlineLabel,
}: {
  locale: Locale;
  items: ArticleListItem[];
  eyebrowLabel: string;
  headlineLabel: string;
}) {
  const [page, setPage] = useState(0);

  if (items.length === 0) return null;

  const pageCount = Math.ceil(items.length / PER_SLIDE);
  // Guards against a stale page index if the list ever shrinks under it.
  const current = Math.min(page, pageCount - 1);
  const slide = items.slice(current * PER_SLIDE, current * PER_SLIDE + PER_SLIDE);

  // Wrap around so both arrows always lead somewhere.
  const go = (delta: number) =>
    setPage((p) => (p + delta + pageCount) % pageCount);

  return (
    <section className="bg-background-main px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
              {eyebrowLabel}
              <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
            </p>
            <h2 className="mt-4 max-w-xl font-serif text-3xl leading-snug text-headline md:text-4xl">
              {headlineLabel}
            </h2>
            <span
              className="mt-4 block h-px w-10 bg-headline/30"
              aria-hidden="true"
            />
          </div>

          {/* Arrows only when there is more than one slide to move between. */}
          {pageCount > 1 && (
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous featured articles"
                className="text-eyebrow transition-opacity hover:opacity-60 hover:cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next featured articles"
                className="text-eyebrow transition-opacity hover:opacity-60 hover:cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {slide.map((article) => (
            <Link
              key={article.slug}
              href={`/${locale}/journal/${article.slug}`}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow focus-visible:ring-offset-4"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-background-alt">
                <Image
                  src={article.imageUrl ?? PLACEHOLDER}
                  alt={article.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="pt-4">
                <p className="flex items-center gap-2 text-[11px] tracking-widest text-body">
                  <span>{article.publishedLabel.toUpperCase()}</span>
                  <span aria-hidden="true">&bull;</span>
                  <span>{article.category.toUpperCase()}</span>
                </p>
                <h3 className="mt-2 font-serif text-lg leading-snug text-headline">
                  {article.title}
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
          ))}
        </div>
      </div>
    </section>
  );
}