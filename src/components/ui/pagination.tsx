"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * Shared pager for both the public lists and the admin dashboard.
 *
 * Two modes, because the two sides paginate differently:
 *  - `onPageChange` — public lists filter/paginate already-loaded data in the
 *    client, so a callback is all they need.
 *  - `basePath` (+ `query`) — admin lists paginate through the URL (`?page=2`)
 *    so pages stay deep-linkable and survive a refresh. Props are plain strings
 *    because a Server Component can't hand a function to a Client Component.
 */
type PaginationProps = {
  currentPage: number;
  totalPages: number;
} & (
  | { onPageChange: (page: number) => void; basePath?: never; query?: never }
  | {
      basePath: string;
      query?: Record<string, string | undefined>;
      onPageChange?: never;
    }
);

const CELL = "flex h-9 w-9 items-center justify-center transition-colors";
const ICON = { className: "h-4 w-4", strokeWidth: 1.5, "aria-hidden": true } as const;

export default function Pagination(props: PaginationProps) {
  const { currentPage, totalPages } = props;
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);

  const hrefFor = (page: number) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(props.query ?? {})) {
      if (value) qs.set(key, value);
    }
    if (page > 1) qs.set("page", String(page));
    const str = qs.toString();
    return `${props.basePath}${str ? `?${str}` : ""}`;
  };

  /** One control — a button in callback mode, a link in URL mode. */
  const control = (
    page: number,
    label: string,
    disabled: boolean,
    children: ReactNode,
  ) => {
    const className = `${CELL} text-eyebrow transition-opacity hover:opacity-60 hover:cursor-pointer disabled:cursor-not-allowed disabled:text-eyebrow/25`;

    if (props.onPageChange) {
      return (
        <button
          type="button"
          onClick={() => props.onPageChange?.(page)}
          disabled={disabled}
          aria-label={label}
          className={className}
        >
          {children}
        </button>
      );
    }

    // A disabled link isn't a thing — render inert text instead so it can't be
    // focused or followed.
    if (disabled) {
      return (
        <span aria-label={label} aria-disabled="true" className={`${CELL} text-eyebrow/25`}>
          {children}
        </span>
      );
    }
    return (
      <Link href={hrefFor(page)} aria-label={label} className={className}>
        {children}
      </Link>
    );
  };

  const pageCell = (page: number) => {
    const active = page === currentPage;
    const className = `${CELL} hover:cursor-pointer ${
      active
        ? "bg-eyebrow text-background-main"
        : "text-eyebrow transition-opacity hover:opacity-60"
    }`;

    if (props.onPageChange) {
      return (
        <button
          key={page}
          type="button"
          onClick={() => props.onPageChange?.(page)}
          aria-current={active}
          className={className}
        >
          {page}
        </button>
      );
    }
    return (
      <Link
        key={page}
        href={hrefFor(page)}
        aria-current={active}
        className={className}
      >
        {page}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-14 flex items-center justify-center gap-1 text-xs text-eyebrow"
    >
      {control(1, "First page", currentPage === 1, <ChevronsLeft {...ICON} />)}
      {control(
        currentPage - 1,
        "Previous page",
        currentPage === 1,
        <ChevronLeft {...ICON} />,
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-body">
            …
          </span>
        ) : (
          pageCell(p)
        ),
      )}

      {control(
        currentPage + 1,
        "Next page",
        currentPage === totalPages,
        <ChevronRight {...ICON} />,
      )}
      {control(
        totalPages,
        "Last page",
        currentPage === totalPages,
        <ChevronsRight {...ICON} />,
      )}
    </nav>
  );
}

/** 1 … 4 5 6 … 20 — keeps the control to a fixed width on long lists. */
function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
