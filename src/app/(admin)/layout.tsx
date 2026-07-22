import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";

import "../globals.css";

// Independent ROOT layout for the admin panel. There is no `app/layout.tsx`,
// so this file and `app/[locale]/layout.tsx` are each root layouts for their
// own branch — the admin shell is completely separate from the public site
// (no locale prefix, no public header/footer).
//
// Note: navigating between the two branches triggers a full page load, which is
// expected and fine here (public site ↔ admin panel).

// Headings use the brand serif; the rest of the panel is Inter.
const fontDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fontBody = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Admin — ORI Studio",
  // The panel sits on a public path, so keep it out of search results.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background-main font-sans text-headline">
        {children}
      </body>
    </html>
  );
}