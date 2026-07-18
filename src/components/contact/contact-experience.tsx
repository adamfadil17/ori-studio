"use client";

import { useState } from "react";
import PartnershipForm from "./partnership-form";
import CareerForm from "./career-form";
import ProjectInquiryForm from "./project-inquiry";
import FaqAccordion from "../layout/faq-acccordion";

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
                className={`relative pb-4 text-sm tracking-wide transition-colors ${
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
          <div className="grid gap-14 py-16 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
            <div>
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
                  <MailIcon />
                  {dict.sidebar.email}
                </a>
                <a
                  href={`tel:${dict.sidebar.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 hover:opacity-70"
                >
                  <PhoneIcon />
                  {dict.sidebar.phone}
                </a>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-headline">
                <span className="flex items-center gap-2">
                  <InstagramIcon />
                  {dict.sidebar.instagram}
                </span>
                <span className="flex items-center gap-2">
                  <PinterestIcon />
                  {dict.sidebar.pinterest}
                </span>
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

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="3"
        width="12"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M2.5 4l5.5 4 5.5-4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 2.5c.5 0 1.5 0 2 1l.5 1.5c.2.5 0 1-.3 1.3l-.7.7c.5 1.5 1.8 2.8 3.3 3.3l.7-.7c.3-.3.8-.5 1.3-.3l1.5.5c1 .5 1 1.5 1 2 0 1-1 2-2 2-4 0-8-4-8-8 0-1 1-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11.5" cy="4.5" r="0.7" fill="currentColor" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M6.5 11.5c.3-1 .8-3.2 1-4C7.7 6.7 8.5 6 9.3 6.3c.7.3 1 1 .8 1.9-.2 1-.5 2.2-1.7 2.2-.6 0-1-.4-1.1-1"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
