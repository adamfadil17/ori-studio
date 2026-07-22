"use client";

import Image from "next/image";
import { useState } from "react";

interface HeroGalleryProps {
  images: string[];
  name: string;
  yearLabel: string;
}

export default function HeroGallery({
  images,
  name,
  yearLabel,
}: HeroGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (index: number) => {
    setActiveIndex((index + images.length) % images.length);
  };

  return (
    <div className="relative h-[420px] w-full overflow-hidden bg-background-alt md:h-[520px]">
      <Image
        src={images[activeIndex]}
        alt={`${name} — photo ${activeIndex + 1}`}
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

      <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
        <h1 className="font-serif text-2xl text-background-main md:text-3xl">
          {name}
        </h1>
        <p className="mt-1 text-sm text-background-main/80">{yearLabel}</p>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 right-6 flex items-center gap-2 md:bottom-10 md:right-10">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous photo"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background-main/90 text-headline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next photo"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-background-main/90 text-headline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
          >
            <ArrowIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={direction === "left" ? "rotate-180" : ""}
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
