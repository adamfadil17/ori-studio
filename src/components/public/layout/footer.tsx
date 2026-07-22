import Link from "next/link";
import type { Locale } from "@/i18n/config";

interface FooterDictionary {
  description: string;
  columns: {
    mainMenu: string;
    services: string;
    contact: string;
  };
}

interface FooterProps {
  locale: Locale;
  dict: FooterDictionary;
}

export default function Footer({ locale, dict }: FooterProps) {
  const mainMenuLinks = [
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Studio", href: "/studio" },
    { label: "Philosophy", href: "/philosophy" },
    { label: "Journal", href: "/journal" },
  ];

  const contactLinks = [
    { label: "Project", href: "/contact?tab=inquiry#contact-form" },
    { label: "Partnership", href: "/contact?tab=partnership#contact-form" },
    { label: "Career", href: "/contact?tab=career#contact-form" },
  ];

  const serviceLinks = [
    { label: "Architecture Design", href: "/studio#architecture-design" },
    { label: "Interior Design", href: "/studio#interior-design" },
    { label: "Landscape Design", href: "/studio#landscape-design" },
    { label: "Project Management", href: "/studio#project-management" },
  ];

  return (
    <footer className="bg-background-alt text-body">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:px-10 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        {/* Logo & description */}
        <div>
          <span className="block font-serif text-2xl">ORI</span>
          <span className="mt-1 block text-[10px] tracking-[0.2em] opacity-70">
            STUDIO ARCHITECT
          </span>
          <p className="mt-6 max-w-xs text-sm leading-relaxed opacity-80">
            {dict.description}
          </p>
        </div>

        {/* Main Menu */}
        <nav aria-label={dict.columns.mainMenu}>
          <h3 className="text-xs tracking-widest uppercase opacity-60">
            {dict.columns.mainMenu}
          </h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {mainMenuLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={`/${locale}${link.href}`}
                  className="transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Services */}
        <nav aria-label={dict.columns.services}>
          <h3 className="text-xs tracking-widest uppercase opacity-60">
            {dict.columns.services}
          </h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={`/${locale}${link.href}`}
                  className="transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact — sub-menu (Project/Partnership) + info kontak */}
        <div>
          <h3 className="text-xs tracking-widest uppercase opacity-60">
            {dict.columns.contact}
          </h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {contactLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={`/${locale}${link.href}`}
                  className="transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <address className="mt-6 flex flex-col gap-3 text-sm not-italic opacity-90">
            <span>
              Jalan Trengguli IV Gang IVB No. 11 Denpasar Timur, Bali 80239,
              Indonesia
            </span>
            <a
              href="mailto:hello@oristudio.com"
              className="hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
            >
              hello@oristudio.com
            </a>
            <a
              href="tel:+6281232667690"
              className="hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
            >
              +62 812 3266 7690
            </a>
          </address>
        </div>
      </div>

      <div className="bg-eyebrow px-6 py-6 text-center text-xs tracking-widest text-background-main md:px-10">
        © {new Date().getFullYear()} ORI STUDIO ARCHITECT
      </div>
    </footer>
  );
}