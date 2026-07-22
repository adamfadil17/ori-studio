import { TrendingDown, TrendingUp } from "lucide-react";

import type { DashboardStats } from "@/lib/stats";
import { humanizeEnum } from "@/lib/format";
import type { SubmissionStatus } from "@/lib/types";

import { BAR_HUE, SERIES_COLOR, TYPE_LABEL, shortDate } from "./chart-tokens";

// ── Stat tile ──────────────────────────────────────────────────────
// A headline number is a tile, not a one-bar chart.

export function StatTile({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: number | string;
  hint?: string;
  delta?: { current: number; previous: number };
}) {
  let deltaNode = null;
  if (delta) {
    const { current, previous } = delta;
    if (previous === 0 && current === 0) {
      deltaNode = <span className="text-xs text-body/70">No change</span>;
    } else if (previous === 0) {
      deltaNode = (
        <span
          className="inline-flex items-center gap-1 text-xs"
          style={{ color: "#006300" }}
        >
          <TrendingUp size={13} strokeWidth={1.8} aria-hidden="true" />
          New activity
        </span>
      );
    } else {
      const pct = Math.round(((current - previous) / previous) * 100);
      const up = pct >= 0;
      const Trend = up ? TrendingUp : TrendingDown;
      // Icon + text, so the direction never rests on colour alone.
      deltaNode = (
        <span
          className="inline-flex items-center gap-1 text-xs"
          style={{ color: up ? "#006300" : "#B3322F" }}
        >
          <Trend size={13} strokeWidth={1.8} aria-hidden="true" />
          {Math.abs(pct)}% vs prev 30d
        </span>
      );
    }
  }

  return (
    <div className="bg-background-main p-5">
      <p className="text-[10px] tracking-[0.2em] uppercase text-eyebrow">
        {label}
      </p>
      <p className="mt-2 text-3xl leading-none text-headline">{value}</p>
      <div className="mt-2 flex flex-col gap-0.5">
        {hint && <span className="text-xs text-body">{hint}</span>}
        {deltaNode}
      </div>
    </div>
  );
}

// ── Status breakdown (magnitude → one hue; length carries the value) ──

const STATUS_ORDER: SubmissionStatus[] = [
  "NEW",
  "REVIEWED",
  "QUOTED",
  "BOOKED",
  "ARCHIVED",
];

export function StatusBreakdown({
  byStatus,
}: {
  byStatus: Record<SubmissionStatus, number>;
}) {
  const peak = Math.max(1, ...STATUS_ORDER.map((s) => byStatus[s]));

  return (
    <figure className="m-0 bg-background-main p-5">
      <figcaption className="font-serif text-lg text-headline">
        Pipeline by status
      </figcaption>

      <dl className="mt-4 flex flex-col gap-3">
        {STATUS_ORDER.map((status) => {
          const value = byStatus[status];
          return (
            <div
              key={status}
              className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3"
            >
              <dt className="text-[10px] tracking-[0.15em] uppercase text-body">
                {humanizeEnum(status)}
              </dt>
              <div
                className="h-2 w-full rounded-full"
                style={{ background: "rgba(51,39,31,0.07)" }}
              >
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(value / peak) * 100}%`,
                    background: BAR_HUE,
                    minWidth: value > 0 ? "0.5rem" : 0,
                  }}
                />
              </div>
              {/* Value always visible — no hover needed to read the chart */}
              <dd
                className="text-right text-xs text-headline"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {value}
              </dd>
            </div>
          );
        })}
      </dl>
    </figure>
  );
}

// ── Recent submissions (doubles as the table view) ─────────────────

export function RecentSubmissions({
  recent,
}: {
  recent: DashboardStats["recent"];
}) {
  return (
    <figure className="m-0 overflow-hidden bg-background-main">
      <figcaption className="px-5 pt-5 font-serif text-lg text-headline">
        Latest submissions
      </figcaption>

      {recent.length === 0 ? (
        <p className="px-5 pb-5 pt-3 text-sm text-body">No submissions yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-y border-headline/10 text-[10px] tracking-[0.15em] uppercase text-body">
                <th className="px-5 py-2 text-left font-normal">Type</th>
                <th className="px-3 py-2 text-left font-normal">Name</th>
                <th className="px-3 py-2 text-left font-normal">Subject</th>
                <th className="px-5 py-2 text-right font-normal">Received</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr
                  key={`${item.type}-${item.id}`}
                  className="border-b border-headline/5"
                >
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2 text-xs text-body">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ background: SERIES_COLOR[item.type] }}
                      />
                      {TYPE_LABEL[item.type]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-headline">{item.name}</td>
                  <td className="px-3 py-3 text-body">{item.subject}</td>
                  <td
                    className="px-5 py-3 text-right text-xs text-body"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {shortDate(item.createdAt.slice(0, 10))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
