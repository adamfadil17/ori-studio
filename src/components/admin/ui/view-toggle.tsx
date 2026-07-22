import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";

/** Narrow an arbitrary `?view=` value to a supported mode. */
export function parseView(value: string | undefined): ViewMode {
  return value === "grid" ? "grid" : "list";
}

/**
 * Grid / list switch for the admin list pages. Mirrors the public lists, but
 * the choice lives in the URL (`?view=grid`) rather than client state — these
 * pages are Server Components, and it keeps the view bookmarkable and stable
 * across pagination.
 */
export default function ViewToggle({
  current,
  basePath,
  query = {},
}: {
  current: ViewMode;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  const hrefFor = (view: ViewMode) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) qs.set(key, value);
    }
    // "list" is the default, so it needs no param.
    if (view === "grid") qs.set("view", "grid");
    const str = qs.toString();
    return `${basePath}${str ? `?${str}` : ""}`;
  };

  const cls = (active: boolean) =>
    `transition-colors ${
      active ? "text-eyebrow" : "text-eyebrow/50 hover:text-eyebrow/80"
    }`;

  return (
    // Placement is the caller's job (FilterBar puts this at the end of the
    // search row) — this only lays out the two icons.
    <div className="flex items-center gap-3">
      <Link
        href={hrefFor("grid")}
        aria-label="Grid view"
        aria-current={current === "grid"}
        className={cls(current === "grid")}
      >
        <LayoutGrid className="h-4.5 w-4.5" strokeWidth={1.5} aria-hidden="true" />
      </Link>
      <Link
        href={hrefFor("list")}
        aria-label="List view"
        aria-current={current === "list"}
        className={cls(current === "list")}
      >
        <List className="h-4.5 w-4.5" strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </div>
  );
}
