"use client";

import { useEffect, useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import PartnershipForm from "./partnership-form";
import CareerForm from "./career-form";
import ProjectInquiryForm from "./project-inquiry";
import FaqAccordion from "../layout/faq-acccordion";
import Image from "next/image";

export type ContactTab = "inquiry" | "partnership" | "career";

interface ContactExperienceDict {
  tabs: Record<ContactTab, string>;
  sidebar: {
    eyebrow: string;
    headline: string;
    email: string;
    phone: string;
    instagram: string;
    pinterest: string;
  };
  inquiry: React.ComponentProps<typeof ProjectInquiryForm>["dict"];
  partnership: React.ComponentProps<typeof PartnershipForm>["dict"];
  career: React.ComponentProps<typeof CareerForm>["dict"];
  faq: {
    eyebrow: string;
    headline: string;
    inquiry: {
      subheadline: string;
      items: { question: string; answer: string }[];
    };
    partnership: {
      subheadline: string;
      items: { question: string; answer: string }[];
    };
    career: {
      subheadline: string;
      items: { question: string; answer: string }[];
    };
  };
}

interface ContactExperienceProps {
  dict: ContactExperienceDict;
  initialTab?: ContactTab;
}

export default function ContactExperience({
  dict,
  initialTab = "inquiry",
}: ContactExperienceProps) {
  const [activeTab, setActiveTab] = useState<ContactTab>(initialTab);

  // initialTab cuma dipakai React sebagai nilai awal useState (hanya kebaca
  // sekali saat mount). Kalau user sudah di /contact lalu klik link lain yang
  // cuma ganti query string (mis. dari footer, "?tab=career"), Next.js
  // re-render page ini tapi component client ini TIDAK remount, jadi
  // activeTab perlu disinkronkan manual setiap kali initialTab berubah.
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const tabOrder: ContactTab[] = ["inquiry", "partnership", "career"];
  const activeFaq = dict.faq[activeTab];

  return (
    <>
      <section
        id="contact-form"
        className="bg-background-main px-6 pt-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          {/* Tab bar */}
          <div className="flex flex-wrap gap-x-10 gap-y-2 border-b border-headline/10">
            {tabOrder.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-current={activeTab === tab}
                className={`relative pb-4 text-sm tracking-wide transition-colors hover:cursor-pointer ${
                  activeTab === tab
                    ? "text-headline"
                    : "text-body hover:text-headline"
                }`}
              >
                {dict.tabs[tab]}
                {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-0 h-px w-full bg-headline"
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Sidebar + active form */}
          <div className="grid gap-14 py-16 lg:grid-cols-[1fr_1.6fr] lg:items-start lg:gap-20">
            <div className="lg:sticky lg:top-28">
              <p className="flex items-center gap-4 text-xs tracking-widest uppercase text-eyebrow">
                {dict.sidebar.eyebrow}
                <span className="h-px w-10 bg-eyebrow" aria-hidden="true" />
              </p>
              <h2 className="mt-6 font-serif text-3xl leading-snug text-headline">
                {dict.sidebar.headline}
              </h2>

              <div className="mt-8 space-y-4 text-sm text-headline">
                <a
                  href={`mailto:${dict.sidebar.email}`}
                  className="flex items-center gap-3 hover:opacity-70"
                >
                  <Image
                    src="/icons/email.svg"
                    width={16}
                    height={16}
                    alt="Email"
                  />
                  {dict.sidebar.email}
                </a>
                <a
                  href={`https://wa.me/${dict.sidebar.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-70"
                >
                  <Image
                    src="/icons/whatsapp.svg"
                    width={16}
                    height={16}
                    alt="Email"
                  />
                  {dict.sidebar.phone}
                </a>
                <a
                  href={`https://instagram.com/${dict.sidebar.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-70"
                >
                  <Image
                    src="/icons/instagram.svg"
                    width={16}
                    height={16}
                    alt="Email"
                  />
                  {dict.sidebar.instagram}
                </a>
                <a
                  href={`https://pinterest.com/${dict.sidebar.pinterest.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:opacity-70"
                >
                  <Image
                    src="/icons/pinterest.svg"
                    width={16}
                    height={16}
                    alt="Email"
                  />
                  {dict.sidebar.pinterest}
                </a>
              </div>
            </div>

            <div>
              {activeTab === "inquiry" && (
                <ProjectInquiryForm dict={dict.inquiry} />
              )}
              {activeTab === "partnership" && (
                <PartnershipForm dict={dict.partnership} />
              )}
              {activeTab === "career" && <CareerForm dict={dict.career} />}
            </div>
          </div>
        </div>
      </section>

      {/* key={activeTab} -> remount FaqAccordion supaya openIndex reset & data ganti total per tab */}
      <FaqAccordion
        key={activeTab}
        eyebrow={dict.faq.eyebrow}
        headline={dict.faq.headline}
        subheadline={activeFaq.subheadline}
        items={activeFaq.items}
      />
    </>
  );
}
