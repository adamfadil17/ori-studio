import { HeaderThemeProvider } from "@/components/public/layout/header-theme";
import { getDictionary } from "@/i18n/get-dictionary";
import { isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import Header from "@/components/public/layout/header";
import Footer from "@/components/public/layout/footer";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <HeaderThemeProvider>
      <Header locale={locale as Locale} nav={dict.nav} />
      {children}
      <Footer locale={locale as Locale} dict={dict.footer} />
    </HeaderThemeProvider>
  );
}
