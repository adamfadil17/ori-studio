import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { SERVICE_SLUGS } from "@/lib/service-slugs";

// Social links. Icons are the SVG assets in public/icons. Instagram/Pinterest
// use the studio handle "ori_studio"; the LinkedIn URL is a placeholder —
// replace with the studio's real page.
const SOCIALS = [
  {
    name: "Email",
    href: "mailto:hello@oristudio.com",
    icon: "/icons/email.svg",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/ori_studio",
    icon: "/icons/instagram.svg",
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/ori_studio",
    icon: "/icons/pinterest.svg",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ori-studio-architect",
    icon: "/icons/linkedin.svg",
  },
];

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

  // Built from the shared slug source so the footer, the home "Learn More"
  // links, and the accordion ids never drift. The label is the slug in Title
  // Case (matching the English service names).
  const serviceLinks = SERVICE_SLUGS.map((slug) => ({
    slug,
    label: slug
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" "),
  }));

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

          {/* Social media */}
          <div className="mt-6 flex items-center gap-4">
            {SOCIALS.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="inline-block transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
              >
                {/* Plain <img>, not next/image: the optimizer 400s on SVG
                    because dangerouslyAllowSVG is off. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt="" width={20} height={20} />
              </a>
            ))}
          </div>
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
                  className="transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
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
              <li key={link.slug}>
                <Link
                  href={`/${locale}/studio#${link.slug}`}
                  className="transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
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
                  className="transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
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
              className="hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
            >
              hello@oristudio.com
            </a>
            <a
              href="tel:+6281232667690"
              className="hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
            >
              +62 812 3266 7690
            </a>
          </address>
        </div>
      </div>

      <div className="bg-[#1C1C1C] px-3 py-3 text-center text-xs tracking-widest text-background-main md:px-10">
        © {new Date().getFullYear()} ORI STUDIO ARCHITECT
      </div>
    </footer>
  );
}