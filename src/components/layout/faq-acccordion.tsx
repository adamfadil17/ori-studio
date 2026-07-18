"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  eyebrow: string;
  headline: string;
  subheadline: string;
  items: FaqItem[];
  imageUrl?: string;
}

/**
 * `key={activeTab}` di pemanggil komponen ini (lihat contact-experience.tsx)
 * memastikan komponen remount setiap kali tab berganti, sehingga openIndex
 * otomatis reset ke 0 (item pertama terbuka) untuk setiap set FAQ baru.
 */
export default function FaqAccordion({
  eyebrow,
  headline,
  subheadline,
  items,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 md:px-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
            {eyebrow}
            <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
          </p>
          <h2 className="mt-6 font-serif text-3xl leading-snug text-headline">
            {headline}
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-body">
            {subheadline}
          </p>
        </div>

        <div>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className={isOpen ? "bg-background-alt" : ""}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
                >
                  <span className="font-serif text-base text-headline md:text-lg">
                    {item.question}
                  </span>
                  <span className="shrink-0 text-headline" aria-hidden="true">
                    {isOpen ? <MinusIcon /> : <PlusIcon />}
                  </span>
                </button>

                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-body">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h10"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
