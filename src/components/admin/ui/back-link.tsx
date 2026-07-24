"use client";

import { ArrowLeft } from "lucide-react";

import { GuardedLink } from "./unsaved-changes";

/**
 * "← Section" link used at the top of every admin sub-page.
 *
 * Guarded, because it sits directly above the create/edit forms — the easiest
 * way to walk away from unsaved work by accident.
 */
export default function BackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <GuardedLink
      href={href}
      className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-body transition-opacity hover:opacity-70"
    >
      <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
      {children}
    </GuardedLink>
  );
}