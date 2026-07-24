import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "../globals.css";
import { locales, isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

const fontDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const fontBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  // Absolute base for canonical + og:image. Reuses APP_URL (the same base the
  // mailer uses) so there's one source of truth; falls back to localhost in dev.
  // With this set, root-relative image paths like "/uploads/…" resolve to
  // absolute URLs in social previews.
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "ORI Studio Architect | Bali, Indonesia",
    // Detail pages send just their name; the suffix is appended automatically.
    template: "%s — ORI Studio Architect",
  },
  description:
    "Architecture rooted in place, designed for life. ORI Studio Architect creates timeless residential, hospitality, and commercial spaces in Bali, Indonesia.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}