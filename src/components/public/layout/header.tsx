"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { useHeaderTheme } from "./header-theme";

interface NavDictionary {
  home: string;
  about: string;
  projects: string;
  studio: string;
  philosophy: string;
  journal: string;
  contact: string;
}

interface HeaderProps {
  locale: Locale;
  nav: NavDictionary;
}

export default function Header({ locale, nav }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { mode } = useHeaderTheme();

  // Semua halaman publik yang punya hero image di bagian atas biarkan header
  // mulai transparan lalu solid begitu discroll ("auto"). Halaman tanpa hero
  // (mis. Project Detail) declare mode "solid" lewat <SetHeaderMode /> supaya
  // header selalu solid sejak awal, nggak pernah transparan.
  useEffect(() => {
    if (mode === "solid") return;

    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mode]);

  const navItems = [
    { label: nav.home, href: "" },
    { label: nav.about, href: "/about" },
    { label: nav.projects, href: "/projects" },
    { label: nav.studio, href: "/studio" },
    { label: nav.philosophy, href: "/philosophy" },
    { label: nav.journal, href: "/journal" },
    { label: nav.contact, href: "/contact" },
  ];

  // Ganti locale di path aktif tanpa mengubah sisa path (mis. /en/projects -> /id/projects)
  const pathWithoutLocale = pathname.replace(/^\/(en|id)/, "") || "/";
  const localeHref = (target: Locale) =>
    `/${target}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;

  // href "" = Home, aktif kalau path persis root. Item lain aktif kalau path
  // persis sama atau ada di bawahnya (mis. /journal aktif untuk /journal/slug).
  function isActive(href: string) {
    if (href === "") return pathWithoutLocale === "/";
    return (
      pathWithoutLocale === href || pathWithoutLocale.startsWith(`${href}/`)
    );
  }

  // Warna bar gelap disamakan dengan bar © di footer: bg-eyebrow + teks
  // background-main. Karena eyebrow (#646651) jauh lebih terang dari headline
  // (#33271f), teks di sini dibiarkan opacity penuh — begitu diredupkan,
  // kontrasnya jatuh di bawah WCAG AA. Footer pun tidak meredupkan apa pun di
  // dalam bar gelapnya.
  const bgClass =
    mode === "solid" || isScrolled || mobileOpen
      ? "bg-eyebrow shadow-sm"
      : "bg-transparent";
  const textColor = "text-background-main";
  // Ring eyebrow akan lenyap di atas bg-eyebrow, jadi fokusnya pakai warna teks.
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background-main";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300 ${bgClass}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className={`flex flex-col leading-none ${textColor}`}
        >
          <span className="font-serif text-2xl tracking-wide">ORI</span>
          <span className="mt-1 text-[10px] tracking-[0.2em]">
            STUDIO ARCHITECT
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:block">
          <ul
            className={`flex items-center gap-8 text-xs tracking-widest uppercase ${textColor}`}
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={`/${locale}${item.href}`}
                    aria-current={active ? "page" : undefined}
                    className={`inline-block py-2 transition-opacity hover:opacity-70 ${focusRing} focus-visible:ring-offset-2`}
                  >
                    <span
                      className={`border-b pb-1.5 ${
                        active ? "border-current" : "border-transparent"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Locale switcher */}
        <div
          className={`hidden items-center gap-2 text-xs tracking-widest lg:flex ${textColor}`}
        >
          {/* Locale aktif dibedakan lewat ketebalan huruf, bukan peredupan:
              opacity-60 di atas eyebrow cuma mencapai 3,1:1. */}
          <Link
            href={localeHref("en")}
            aria-current={locale === "en" ? "true" : undefined}
            className={
              locale === "en"
                ? "font-semibold"
                : "transition-opacity hover:opacity-70"
            }
          >
            EN
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={localeHref("id")}
            aria-current={locale === "id" ? "true" : undefined}
            className={
              locale === "id"
                ? "font-semibold"
                : "transition-opacity hover:opacity-70"
            }
          >
            ID
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className={`-mr-2 rounded-full p-2 lg:hidden ${textColor}`}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X
              className="h-6 w-6 shrink-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          ) : (
            <Menu
              className="h-6 w-6 shrink-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="bg-eyebrow px-6 pb-8 lg:hidden">
          <ul className="flex flex-col gap-5 text-sm tracking-widest uppercase text-background-main">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={`/${locale}${item.href}`}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="inline-block"
                  >
                    <span
                      className={`border-b pb-1 ${
                        active ? "border-current" : "border-transparent"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex gap-2 text-sm text-background-main">
            <Link href={localeHref("en")}>EN</Link>
            <span aria-hidden="true">/</span>
            <Link href={localeHref("id")}>ID</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
