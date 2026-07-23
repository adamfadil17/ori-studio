"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import Dropdown from "@/components/ui/dropdown";

export interface FilterDef {
  /** URL param name, e.g. "category". */
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}

/**
 * Search box with an inline clear button and an explicit submit button.
 *
 * The native `input[type=search]` clear affordance is hidden
 * (`::-webkit-search-cancel-button`) because it renders differently per browser
 * and clashes with the studio's styling — we draw our own instead.
 *
 * Keyed on the applied search by the parent, so navigating (or clearing)
 * remounts it and the field always reflects the URL — no effect needed to sync.
 */
function SearchField({
  initial,
  placeholder,
  ariaLabel,
  onApply,
}: {
  initial: string;
  placeholder: string;
  ariaLabel: string;
  onApply: (term: string) => void;
}) {
  const [term, setTerm] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply(term.trim());
      }}
      className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none"
    >
      <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
        <input
          type="search"
          name="q"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="w-full border border-eyebrow/50 bg-transparent py-2 pl-3.5 pr-9 text-sm text-eyebrow placeholder:text-body/50 focus:border-eyebrow focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        {term && (
          <button
            type="button"
            onClick={() => {
              setTerm("");
              onApply(""); // clearing applies immediately — no extra click
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-body transition-colors hover:text-eyebrow hover:cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
      </div>

      <button
        type="submit"
        aria-label="Search"
        title="Search"
        className="flex h-9 w-9 shrink-0 items-center justify-center border border-eyebrow/40 text-eyebrow transition-opacity hover:opacity-70 hover:cursor-pointer"
      >
        <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      </button>
    </form>
  );
}

/**
 * Search + dropdown filters for the admin list pages.
 *
 * State lives in the URL (like `page` and `view`), so a filtered list is
 * shareable and survives a refresh. Changing a select applies immediately —
 * same feel as the public lists — which is why this is a Client Component;
 * everything it receives is plain serialisable data.
 */
export default function FilterBar({
  basePath,
  search = "",
  searchPlaceholder,
  searchAriaLabel,
  filters,
  extraParams = {},
  trailing,
}: {
  basePath: string;
  search?: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  filters: FilterDef[];
  /** Params to preserve but not edit here (e.g. `view`). */
  extraParams?: Record<string, string | undefined>;
  /** Rendered at the right of the search row — the view toggle goes here. */
  trailing?: React.ReactNode;
}) {
  const router = useRouter();

  function navigate(overrides: Record<string, string | undefined>) {
    const qs = new URLSearchParams();

    const current: Record<string, string | undefined> = {
      ...extraParams,
      q: search || undefined,
      ...Object.fromEntries(filters.map((f) => [f.name, f.value || undefined])),
      ...overrides,
    };

    for (const [key, value] of Object.entries(current)) {
      if (value) qs.set(key, value);
    }
    // Any filter change invalidates the current page number.
    qs.delete("page");

    const str = qs.toString();
    router.push(`${basePath}${str ? `?${str}` : ""}`);
  }

  const hasActiveFilter = filters.some((f) => f.value) || Boolean(search);

  // Two rows: the search (with the view toggle at its right) on top, the
  // filters beneath. Keeps the primary action prominent and lets any number of
  // filters wrap without pushing the toggle around.
  return (
    <div className="flex w-full flex-col gap-4">
      {/* Row 1 — search + trailing controls */}
      <div className="flex items-center gap-3">
        <SearchField
          // Remount when the applied search changes, so the field mirrors the URL.
          key={search}
          initial={search}
          placeholder={searchPlaceholder}
          ariaLabel={searchAriaLabel}
          onApply={(term) => navigate({ q: term || undefined })}
        />
        {trailing && <div className="ml-auto shrink-0">{trailing}</div>}
      </div>

      {/* Row 2 — filters */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {filters.map((filter) => (
          <span
            key={filter.name}
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase"
          >
            <span className="text-eyebrow">{filter.label}</span>
            <Dropdown
              ariaLabel={filter.label}
              value={filter.value}
              // "All" is the cleared state — an empty value drops the param.
              options={[{ value: "", label: "All" }, ...filter.options]}
              onChange={(value) => navigate({ [filter.name]: value })}
            />
          </span>
        ))}

        {hasActiveFilter && (
          <button
            type="button"
            onClick={() =>
              navigate({
                q: undefined,
                ...Object.fromEntries(filters.map((f) => [f.name, undefined])),
              })
            }
            className="inline-flex items-center gap-1 text-xs tracking-widest uppercase text-body transition-opacity hover:opacity-70 hover:cursor-pointer"
          >
            <X className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
