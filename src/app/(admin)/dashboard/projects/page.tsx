import Link from "next/link";

import FilterBar from "@/components/admin/ui/filter-bar";
import { LocaleBadges, StateBadge } from "@/components/admin/ui/list-badges";
import ProjectGridCard from "@/components/admin/projects/project-grid-card";
import ProjectRowActions from "@/components/admin/projects/project-row-actions";
import ViewToggle, { parseView } from "@/components/admin/ui/view-toggle";
import Pagination from "@/components/ui/pagination";
import { formatLocation } from "@/lib/types";
import {
  getProjectFilterOptions,
  listProjectsForAdmin,
} from "@/lib/projects";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;

function yearLabel(start: number, end: number | null) {
  return end && end !== start ? `${start}–${end}` : `${start}`;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    view?: string;
    category?: string;
    location?: string;
    state?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const search = params.q?.trim() || undefined;
  const view = parseView(params.view);
  const category = params.category || undefined;
  const location = params.location || undefined;
  const state = params.state === "published" || params.state === "draft"
    ? params.state
    : undefined;

  const [{ data, total, totalPages }, options] = await Promise.all([
    listProjectsForAdmin({
      page,
      limit: PAGE_SIZE,
      search,
      category,
      location,
      published: state === undefined ? undefined : state === "published",
    }),
    getProjectFilterOptions(),
  ]);

  // Declared ONCE so a newly added filter can't be forgotten in one of the
  // links: the view toggle carries the filters, pagination carries those plus
  // the current view.
  const filterQuery = { q: search, category, location, state };
  const query = {
    ...filterQuery,
    view: view === "grid" ? "grid" : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-eyebrow">
            Content
          </p>
          <h1 className="mt-3 font-serif text-3xl text-headline">Projects</h1>
          <p className="mt-2 text-sm text-body">
            {total} {total === 1 ? "project" : "projects"} total
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="bg-eyebrow px-6 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90"
        >
          New project
        </Link>
      </div>

      <div className="mt-6 border-b border-headline/10 pb-6">
        <FilterBar
          basePath="/dashboard/projects"
          search={search}
          searchPlaceholder="Search by name…"
          searchAriaLabel="Search projects by name"
          extraParams={{ view: view === "grid" ? "grid" : undefined }}
          trailing={
            <ViewToggle
              current={view}
              basePath="/dashboard/projects"
              query={filterQuery}
            />
          }
          filters={[
            {
              name: "category",
              label: "Sector",
              value: category ?? "",
              // Already {value: id, label: name} from the lookup tables.
              options: options.categories,
            },
            {
              name: "location",
              label: "Location",
              value: location ?? "",
              options: options.locations,
            },
            {
              name: "state",
              label: "State",
              value: state ?? "",
              options: [
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
              ],
            },
          ]}
        />
      </div>

      {data.length === 0 ? (
        <p className="mt-8 border border-dashed border-headline/15 px-4 py-12 text-center text-sm text-body">
          {search || category || location || state
            ? "No projects match the current filters."
            : "No projects yet. Create the first one."}
        </p>
      ) : view === "grid" ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((project) => {
            const en = project.translations.find((t) => t.locale === "EN");
            const hero =
              project.images.find((img) => img.type === "HERO") ??
              project.images[0];
            return (
              <ProjectGridCard
                key={project.id}
                project={{
                  id: project.id,
                  name: en?.name ?? "(untitled)",
                  hasId: project.translations.some((t) => t.locale === "ID"),
                  featured: project.featured,
                  published: project.publishedAt !== null,
                  category: project.category.name,
                  location: formatLocation(project.location),
                  yearLabel: yearLabel(project.yearStart, project.yearEnd),
                  thumbnailUrl: hero?.url,
                  thumbnailAlt: hero?.alt ?? undefined,
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto bg-background-main">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-headline/10 text-[10px] tracking-[0.15em] uppercase text-body">
                <th className="px-4 py-3 text-left font-normal">Name</th>
                <th className="px-3 py-3 text-left font-normal">Category</th>
                <th className="px-3 py-3 text-left font-normal">Location</th>
                <th className="px-3 py-3 text-left font-normal">Year</th>
                <th className="px-3 py-3 text-left font-normal">State</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((project) => {
                const en = project.translations.find((t) => t.locale === "EN");
                const hasId = project.translations.some(
                  (t) => t.locale === "ID",
                );
                const published = project.publishedAt !== null;
                return (
                  <tr
                    key={project.id}
                    className="border-b border-headline/5 align-top"
                  >
                    <td className="px-4 py-3">
                      <span className="block text-headline">
                        {en?.name ?? "(untitled)"}
                      </span>
                      <span className="mt-0.5 block">
                        <LocaleBadges
                          hasId={hasId}
                          featured={project.featured}
                        />
                      </span>
                    </td>
                    <td className="px-3 py-3 text-body">
                      {project.category.name}
                    </td>
                    <td className="px-3 py-3 text-body">
                      {formatLocation(project.location)}
                    </td>
                    <td
                      className="px-3 py-3 text-body"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {yearLabel(project.yearStart, project.yearEnd)}
                    </td>
                    <td className="px-3 py-3">
                      <StateBadge published={published} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProjectRowActions
                        id={project.id}
                        name={en?.name ?? "this project"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/dashboard/projects"
        query={query}
      />
    </div>
  );
}
