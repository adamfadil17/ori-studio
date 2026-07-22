import Link from "next/link";

import FilterBar from "@/components/admin/ui/filter-bar";
import PositionRowActions from "@/components/admin/positions/position-row-actions";
import Pagination from "@/components/ui/pagination";
import { humanizeEnum } from "@/lib/format";
import { listPositionsForAdmin } from "@/lib/positions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const TYPES = ["FULL_TIME", "PART_TIME_FREELANCE", "CONTRACT", "INTERNSHIP"];
const LEVELS = ["ENTRY", "MID_SENIOR", "SENIOR", "ALL_LEVELS"];

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    type?: string;
    level?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const search = params.q?.trim() || undefined;
  const type = TYPES.includes(params.type ?? "") ? params.type : undefined;
  const level = LEVELS.includes(params.level ?? "") ? params.level : undefined;
  const status =
    params.status === "active" || params.status === "inactive"
      ? params.status
      : undefined;

  const { data, total, totalPages } = await listPositionsForAdmin({
    page,
    limit: PAGE_SIZE,
    search,
    type,
    level,
    active: status === undefined ? undefined : status === "active",
  });

  // Declared once so a new filter can't be forgotten in one of the links.
  const query = { q: search, type, level, status };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-eyebrow">
            Careers
          </p>
          <h1 className="mt-3 font-serif text-3xl text-headline">
            Open Positions
          </h1>
          <p className="mt-2 text-sm text-body">
            {total} {total === 1 ? "position" : "positions"} total
          </p>
        </div>
        <Link
          href="/dashboard/positions/new"
          className="bg-eyebrow px-6 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90"
        >
          New position
        </Link>
      </div>

      <div className="mt-6 border-b border-headline/10 pb-6">
        <FilterBar
          basePath="/dashboard/positions"
          search={search}
          searchPlaceholder="Search by title…"
          searchAriaLabel="Search positions by title"
          filters={[
            {
              name: "type",
              label: "Type",
              value: type ?? "",
              options: TYPES.map((t) => ({ value: t, label: humanizeEnum(t) })),
            },
            {
              name: "level",
              label: "Level",
              value: level ?? "",
              options: LEVELS.map((l) => ({ value: l, label: humanizeEnum(l) })),
            },
            {
              name: "status",
              label: "Status",
              value: status ?? "",
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
        />
      </div>

      {data.length === 0 ? (
        <p className="mt-8 border border-dashed border-headline/15 px-4 py-12 text-center text-sm text-body">
          {search || type || level || status
            ? "No positions match the current filters."
            : "No positions yet. Create the first one."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto bg-background-main">
          <table className="w-full min-w-2xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-headline/10 text-[10px] tracking-[0.15em] uppercase text-body">
                <th className="px-4 py-3 text-left font-normal">Title</th>
                <th className="px-3 py-3 text-left font-normal">Type</th>
                <th className="px-3 py-3 text-left font-normal">Level</th>
                <th className="px-3 py-3 text-right font-normal">
                  Applications
                </th>
                <th className="px-3 py-3 text-left font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((position) => (
                <tr
                  key={position.id}
                  className="border-b border-headline/5 align-top"
                >
                  <td className="px-4 py-3 text-headline">{position.title}</td>
                  <td className="px-3 py-3 text-body">
                    {humanizeEnum(position.type)}
                  </td>
                  <td className="px-3 py-3 text-body">
                    {humanizeEnum(position.level)}
                  </td>
                  <td
                    className="px-3 py-3 text-right text-body"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {position._count.careerApplications}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-[10px] tracking-widest uppercase ${
                        position.isActive
                          ? "bg-headline text-background-main"
                          : "border border-headline/25 text-body"
                      }`}
                    >
                      {position.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PositionRowActions
                      id={position.id}
                      title={position.title}
                      applicationCount={position._count.careerApplications}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/dashboard/positions"
        query={query}
      />
    </div>
  );
}
