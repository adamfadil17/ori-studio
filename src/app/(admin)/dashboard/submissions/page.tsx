import Link from "next/link";

import FilterBar from "@/components/admin/ui/filter-bar";
import StatusSelect from "@/components/admin/submissions/status-select";
import SubmissionDeleteButton from "@/components/admin/submissions/submission-delete-button";
import { SERIES_COLOR, TYPE_LABEL } from "@/components/admin/dashboard/chart-tokens";
import Pagination from "@/components/ui/pagination";
import { formatDate, humanizeEnum } from "@/lib/format";
import {
  ALL_SUBMISSION_TYPES,
  TYPE_TO_KIND,
  listSubmissions,
} from "@/lib/submissions";
import type { SubmissionStatus, SubmissionType } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;

const STATUSES: SubmissionStatus[] = [
  "NEW",
  "REVIEWED",
  "QUOTED",
  "BOOKED",
  "ARCHIVED",
];

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    type?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const search = params.q?.trim() || undefined;
  const type = ALL_SUBMISSION_TYPES.includes(params.type as SubmissionType)
    ? (params.type as SubmissionType)
    : undefined;
  const status = STATUSES.includes(params.status as SubmissionStatus)
    ? (params.status as SubmissionStatus)
    : undefined;

  const { data, total, totalPages, counts } = await listSubmissions({
    type,
    status,
    search,
    page,
    limit: PAGE_SIZE,
  });

  // Declared once so a new filter can't be forgotten in one of the links.
  const query = { q: search, type, status };

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-xs tracking-widest uppercase text-eyebrow">Inbox</p>
        <h1 className="mt-3 font-serif text-3xl text-headline">Submissions</h1>
        <p className="mt-2 text-sm text-body">
          {counts.total} total across inquiries, partnerships and careers
        </p>
      </div>

      {/* Status summary — each figure is a shortcut into that queue */}
      <div className="mt-6 grid gap-px bg-headline/10 sm:grid-cols-3 lg:grid-cols-5">
        {STATUSES.map((s) => {
          const active = status === s;
          const href = `/dashboard/submissions${active ? "" : `?status=${s}`}`;
          return (
            <Link
              key={s}
              href={href}
              aria-current={active}
              className={`p-4 transition-colors ${
                active
                  ? "bg-eyebrow text-background-main"
                  : "bg-background-main hover:bg-eyebrow/5"
              }`}
            >
              <span
                className={`block text-[10px] tracking-[0.2em] uppercase ${
                  active ? "text-background-main/70" : "text-eyebrow"
                }`}
              >
                {humanizeEnum(s)}
              </span>
              <span
                className="mt-1 block text-2xl leading-none"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {counts.byStatus[s]}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 border-b border-headline/10 pb-6">
        <FilterBar
          basePath="/dashboard/submissions"
          search={search}
          searchPlaceholder="Search by name or email…"
          searchAriaLabel="Search submissions by name or email"
          filters={[
            {
              name: "type",
              label: "Channel",
              value: type ?? "",
              options: ALL_SUBMISSION_TYPES.map((t) => ({
                value: t,
                label: `${TYPE_LABEL[t]} (${counts.byType[t]})`,
              })),
            },
            {
              name: "status",
              label: "Status",
              value: status ?? "",
              options: STATUSES.map((s) => ({
                value: s,
                label: humanizeEnum(s),
              })),
            },
          ]}
        />
      </div>

      {data.length === 0 ? (
        <p className="mt-8 border border-dashed border-headline/15 px-4 py-12 text-center text-sm text-body">
          {search || type || status
            ? "No submissions match the current filters."
            : "No submissions yet. They arrive from the contact page."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto bg-background-main">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-headline/10 text-[10px] tracking-[0.15em] uppercase text-body">
                <th className="px-4 py-3 text-left font-normal">From</th>
                <th className="px-3 py-3 text-left font-normal">Subject</th>
                <th className="px-3 py-3 text-left font-normal">Received</th>
                <th className="px-3 py-3 text-left font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const kind = TYPE_TO_KIND[item.type];
                return (
                  <tr
                    key={`${item.type}-${item.id}`}
                    className="border-b border-headline/5 align-top"
                  >
                    <td className="px-4 py-3">
                      <span className="block text-headline">{item.name}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-body">
                        <span
                          aria-hidden="true"
                          className="inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{ background: SERIES_COLOR[item.type] }}
                        />
                        {TYPE_LABEL[item.type]} · {item.email}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-body">{item.subject}</td>
                    <td
                      className="px-3 py-3 text-body"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusSelect
                        kind={kind}
                        id={item.id}
                        status={item.status}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-3">
                        <Link
                          href={`/dashboard/submissions/${kind}/${item.id}`}
                          className="text-xs tracking-widest uppercase text-eyebrow hover:opacity-70"
                        >
                          View
                        </Link>
                        <SubmissionDeleteButton
                          kind={kind}
                          id={item.id}
                          name={item.name}
                        />
                      </span>
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
        basePath="/dashboard/submissions"
        query={query}
      />

      {total > 0 && (
        <p className="mt-4 text-xs text-body">
          Showing {data.length} of {total} matching submissions.
        </p>
      )}
    </div>
  );
}
