"use client";

import { useState } from "react";

import type { TrendPoint } from "@/lib/stats";
import type { SubmissionType } from "@/lib/types";
import {
  BASELINE,
  GRID,
  INK_MUTED,
  SERIES_COLOR,
  STACK_ORDER,
  TYPE_LABEL,
  shortDate,
} from "./chart-tokens";

// Client component purely for the hover layer. (SVG <title> can't be used for
// tooltips here — React 19 hoists <title> as document metadata and strips its
// children, so the native tooltip silently renders empty.)
export default function SubmissionsTrend({
  trend,
  byType,
}: {
  trend: TrendPoint[];
  byType: Record<SubmissionType, number>;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const windowTotal = trend.reduce((acc, p) => acc + p.total, 0);

  // Geometry in viewBox units; the SVG scales to its container.
  const W = 620;
  const H = 190;
  const PAD = { top: 12, right: 8, bottom: 24, left: 30 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const peak = Math.max(1, ...trend.map((p) => p.total));
  const yMax = peak <= 4 ? peak : Math.ceil(peak / 2) * 2;
  const band = plotW / trend.length;
  const barW = Math.max(4, band - 5);
  const yOf = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  const ticks = [...new Set([0, Math.round(yMax / 2), yMax])];
  const labelIdx = [0, Math.floor(trend.length / 2), trend.length - 1];
  const active = hover === null ? null : trend[hover];

  return (
    <figure className="m-0 bg-background-main p-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg text-headline">
          Submissions · last 30 days
        </h2>
        <span className="text-xs text-body">{windowTotal} total</span>
      </figcaption>

      {/* Legend — always present for ≥2 series; counts double as direct labels */}
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        {STACK_ORDER.map((type) => (
          <li key={type} className="flex items-center gap-2 text-xs text-body">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: SERIES_COLOR[type] }}
            />
            {TYPE_LABEL[type]}
            <span className="text-headline">{byType[type]}</span>
          </li>
        ))}
      </ul>

      {windowTotal === 0 ? (
        <p className="mt-6 border border-dashed border-headline/15 px-4 py-8 text-center text-sm text-body">
          No submissions in the last 30 days.
        </p>
      ) : (
        <div className="relative mt-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`Stacked bar chart of ${windowTotal} submissions per day over the last 30 days, split by inquiry, partnership, and career.`}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={yOf(t)}
                  y2={yOf(t)}
                  stroke={t === 0 ? BASELINE : GRID}
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 6}
                  y={yOf(t) + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill={INK_MUTED}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {t}
                </text>
              </g>
            ))}

            {/* Hovered day: recessive band behind the bars */}
            {hover !== null && (
              <rect
                x={PAD.left + hover * band}
                y={PAD.top}
                width={band}
                height={plotH}
                fill="rgba(51,39,31,0.05)"
              />
            )}

            {/* Stacked bars — 2px surface gap between segments */}
            {trend.map((point, i) => {
              const x = PAD.left + i * band + (band - barW) / 2;
              let cursor = 0;
              return (
                <g key={point.date}>
                  {STACK_ORDER.map((type) => {
                    const value = point[type];
                    if (value === 0) return null;
                    const yTop = yOf(cursor + value);
                    const rawH = yOf(cursor) - yTop;
                    cursor += value;
                    return (
                      <rect
                        key={type}
                        x={x}
                        y={yTop}
                        width={barW}
                        height={Math.max(2, rawH - 2)}
                        rx={2}
                        fill={SERIES_COLOR[type]}
                        opacity={hover === null || hover === i ? 1 : 0.45}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Hit targets — full plot height, wider than the mark */}
            {trend.map((point, i) => (
              <rect
                key={`hit-${point.date}`}
                x={PAD.left + i * band}
                y={PAD.top}
                width={band}
                height={plotH}
                fill="transparent"
                tabIndex={0}
                aria-label={`${shortDate(point.date)}: ${point.total} ${
                  point.total === 1 ? "submission" : "submissions"
                }`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                style={{ outline: "none" }}
              />
            ))}

            {labelIdx.map((i) => (
              <text
                key={i}
                x={PAD.left + i * band + band / 2}
                y={H - 8}
                textAnchor={
                  i === 0 ? "start" : i === trend.length - 1 ? "end" : "middle"
                }
                fontSize="9"
                fill={INK_MUTED}
              >
                {shortDate(trend[i].date)}
              </text>
            ))}
          </svg>

          {/* Tooltip */}
          {active && (
            <div
              role="status"
              className="pointer-events-none absolute top-0 z-10 min-w-[9rem] -translate-x-1/2 border border-headline/10 bg-background-alt px-3 py-2 shadow-sm"
              style={{
                left: `${(((hover as number) + 0.5) * band + PAD.left) / W * 100}%`,
              }}
            >
              <p className="text-[10px] tracking-widest uppercase text-eyebrow">
                {shortDate(active.date)}
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {STACK_ORDER.map((type) => (
                  <li
                    key={type}
                    className="flex items-center justify-between gap-3 text-xs text-body"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: SERIES_COLOR[type] }}
                      />
                      {TYPE_LABEL[type]}
                    </span>
                    <span
                      className="text-headline"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {active[type]}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 border-t border-headline/10 pt-1 text-xs text-headline">
                Total {active.total}
              </p>
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
