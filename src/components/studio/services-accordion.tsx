"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  PencilRuler,
  Sofa,
  Trees,
  ClipboardList,
} from "lucide-react";

interface ServiceItem {
  title: string;
  description: string;
}

interface ServicesAccordionProps {
  items: readonly ServiceItem[];
  imageUrl?: string;
}

// Urutan icon & slug mengikuti urutan dict.studio.services.items
// (Architecture Design, Interior Design, Landscape Design, Project Management)
// — sama seperti icon set di section Services homepage, biar konsisten.
// Slug ini HARUS sama persis dengan anchor link Services di Footer
// (mis. "/studio#architecture-design").
const ICONS = [PencilRuler, Sofa, Trees, ClipboardList];
const SLUGS = [
  "architecture-design",
  "interior-design",
  "landscape-design",
  "project-management",
];

export default function ServicesAccordion({
  items,
  imageUrl = "https://placehold.net/default.svg",
}: ServicesAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Kalau URL punya hash yang cocok sama salah satu slug (mis. dari link
  // Footer "/studio#interior-design"), otomatis buka item itu dan scroll
  // ke posisinya.
  //
  // Ini butuh 2 mekanisme berbeda:
  // 1. Saat halaman ini baru di-mount dengan hash sudah ada di URL (mis.
  //    navigasi dari halaman lain, atau refresh/buka langsung /studio#slug).
  // 2. Saat user SUDAH berada di halaman ini lalu klik link hash lain.
  //    Next.js <Link> pakai history.pushState() untuk navigasi client-side,
  //    dan pushState() TIDAK PERNAH memicu event "hashchange" (beda dari
  //    klik <a> biasa) — jadi kita intercept klik-nya langsung di sini,
  //    bukan menunggu event yang nggak akan pernah muncul.
  useEffect(() => {
    function openAndScrollTo(hash: string) {
      const index = SLUGS.indexOf(hash);
      if (index === -1) return;

      setOpenIndex(index);
      requestAnimationFrame(() => {
        document
          .getElementById(hash)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    // Mekanisme 1: cek hash begitu component mount.
    if (window.location.hash) {
      openAndScrollTo(window.location.hash.replace("#", ""));
    }

    // Mekanisme 2: intercept klik ke link berisi hash (mis. dari Footer),
    // termasuk yang di-handle Next.js Link via pushState.
    function handleDocumentClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest("a[href*='#']");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const hash = href.slice(hashIndex + 1);
      if (SLUGS.indexOf(hash) === -1) return;

      // Beri jeda singkat supaya URL & DOM sempat settle dulu setelah
      // navigasi Next.js selesai, sebelum kita set state & scroll.
      setTimeout(() => openAndScrollTo(hash), 50);
    }

    // Tetap dengarkan hashchange juga untuk kasus edge (klik <a> native,
    // atau location.hash di-set manual) — nggak ada ruginya dipasang dua-duanya.
    function handleHashChange() {
      openAndScrollTo(window.location.hash.replace("#", ""));
    }

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="bg-background-main">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const Icon = ICONS[index % ICONS.length];
        const slug = SLUGS[index % SLUGS.length];

        return (
          <div
            key={item.title}
            id={slug}
            className={`scroll-mt-28 ${
              index !== 0 ? "border-t border-headline/10" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow md:px-10"
            >
              <span className="flex items-center gap-4">
                <Icon
                  className="h-[22px] w-[22px] text-headline"
                  strokeWidth={1.2}
                  aria-hidden="true"
                />
                <span className="font-serif text-lg text-headline md:text-xl">
                  {item.title}
                </span>
              </span>
              <ChevronDown
                className={`h-[18px] w-[18px] shrink-0 text-headline transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.3}
                aria-hidden="true"
              />
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