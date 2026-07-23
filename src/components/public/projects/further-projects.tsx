"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Locale } from "@/i18n/config";
import type { ProjectListItem } from "./projects-list";

const PLACEHOLDER = "https://placehold.net/default.svg";

/**
 * The "further projects" block: a portrait preview beside a hoverable list.
 *
 * Hovering (or focusing) a row swaps the preview to that project's image. This
 * needs client state, so it lives apart from the server page that fetches the
 * list. The last-hovered index is kept rather than reset on mouse-leave — the
 * preview shouldn't snap back to the first item the moment the cursor drifts
 * off the list.
 */
export default function FurtherProjects({
  locale,
  projects,
}: {
  locale: Locale;
  projects: ProjectListItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
      {/* Portrait preview. self-start keeps it at its intrinsic height instead
          of stretching to match the taller list column beside it. */}
      <div className="relative aspect-[3/4] w-full self-start overflow-hidden bg-background-alt">
        {projects.map((project, index) => (
          // Each image is stacked and cross-faded so the swap doesn't flash a
          // blank frame while the next one loads.
          <Image
            key={project.slug}
            src={project.thumbnailUrl ?? PLACEHOLDER}
            alt={project.name}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className={`object-cover transition-opacity duration-500 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      <div>
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/${locale}/projects/${project.slug}`}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            aria-current={index === activeIndex ? "true" : undefined}
            className="group flex items-center justify-between gap-4 border-b border-headline/10 py-6 first:pt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
          >
            <div>
              <h3
                className={`font-serif text-lg transition-colors ${
                  index === activeIndex ? "text-eyebrow" : "text-headline"
                }`}
              >
                {project.name}
              </h3>
              <p className="mt-1 text-sm text-body">
                {project.location} <span aria-hidden="true">—</span>{" "}
                {project.yearLabel}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="shrink-0 text-eyebrow transition-transform duration-300 group-hover:translate-x-1"
            >
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}