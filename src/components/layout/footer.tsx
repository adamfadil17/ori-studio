import Link from "next/link";
import type { Locale } from "@/i18n/config";

interface FooterDictionary {
  description: string;
  columns: {
    about: string;
    philosophy: string;
    services: string;
    contact: string;
  };
}

interface FooterProps {
  locale: Locale;
  dict: FooterDictionary;
}

export default function Footer({ locale, dict }: FooterProps) {
  const columns = [
    {
      title: dict.columns.about,
      links: [
        { label: "Projects", href: "/projects" },
        { label: "Studio", href: "/studio" },
      ],
    },
    {
      title: dict.columns.philosophy,
      links: [
        { label: "Journal", href: "/journal" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: dict.columns.services,
      links: [
        { label: "Architecture Design", href: "/studio#architecture-design" },
        { label: "Interior Design", href: "/studio#interior-design" },
        { label: "Landscape Design", href: "/studio#landscape-design" },
        { label: "Project Management", href: "/studio#project-management" },
        { label: "Consultation", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="bg-headline text-background-main">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:px-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr]">
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

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-xs tracking-widest uppercase opacity-60">
              {column.title}
            </h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {column.links.map((link) => (
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
        ))}

        {/* Contact */}
        <div>
          <h3 className="text-xs tracking-widest uppercase opacity-60">
            {dict.columns.contact}
          </h3>
          <address className="mt-4 flex flex-col gap-3 text-sm not-italic opacity-90">
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

      <div className="border-t border-background-main/10 px-6 py-6 text-center text-xs tracking-widest opacity-60 md:px-10">
        © {new Date().getFullYear()} ORI STUDIO ARCHITECT
      </div>
    </footer>
  );
}
