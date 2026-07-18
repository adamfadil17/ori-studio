"use client";

import Image from "next/image";
import { useState } from "react";

interface ServiceItem {
  title: string;
  description: string;
}

interface ServicesAccordionProps {
  items: readonly ServiceItem[];
  imageUrl?: string;
}

const ICONS = [ArchitectureIcon, InteriorIcon, LandscapeIcon, ManagementIcon];

export default function ServicesAccordion({
  items,
  imageUrl = "https://placehold.net/default.svg",
}: ServicesAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-background-main">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const Icon = ICONS[index % ICONS.length];

        return (
          <div
            key={item.title}
            className={index !== 0 ? "border-t border-headline/10" : ""}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow md:px-10"
            >
              <span className="flex items-center gap-4">
                <Icon />
                <span className="font-serif text-lg text-headline md:text-xl">
                  {item.title}
                </span>
              </span>
              <ChevronIcon isOpen={isOpen} />
            </button>

            <div
              className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid gap-6 px-6 pb-8 md:grid-cols-[280px_1fr] md:px-10">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-alt">
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-body">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 text-headline transition-transform duration-300 ${
        isOpen ? "rotate-180" : ""
      }`}
    >
      <path
        d="M4.5 7l4.5 4.5L13.5 7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArchitectureIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="16"
        height="16"
        rx="2"
        stroke="#33271F"
        strokeWidth="1.2"
      />
      <path d="M3 9h16M9 3v16" stroke="#33271F" strokeWidth="1.2" />
    </svg>
  );
}

function InteriorIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1"
        stroke="#33271F"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="12"
        width="16"
        height="4"
        rx="1"
        stroke="#33271F"
        strokeWidth="1.2"
      />
      <path
        d="M4 16v2M18 16v2"
        stroke="#33271F"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LandscapeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 4c2 2 3 4 3 6a3 3 0 1 1-6 0c0-2 1-4 3-6Z"
        stroke="#33271F"
        strokeWidth="1.2"
      />
      <path
        d="M11 13v6M7 19h8"
        stroke="#33271F"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ManagementIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="12" r="7" stroke="#33271F" strokeWidth="1.2" />
      <path
        d="M11 8v4l3 2"
        stroke="#33271F"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M9 3h4"
        stroke="#33271F"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
