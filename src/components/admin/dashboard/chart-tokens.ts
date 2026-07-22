import type { SubmissionType } from "@/lib/types";

// Categorical hues validated with the dataviz validator against this panel's
// cream surface (#F8F6F2) on the all-pairs list: chroma + lightness bands pass,
// worst CVD ΔE 10.1, worst normal-vision ΔE 26.8. Aqua sits at 2.61 contrast,
// so every series is also direct-labelled (legend counts, tooltip, table) —
// the documented relief for a sub-3:1 mark.
export const SERIES_COLOR: Record<SubmissionType, string> = {
  PROJECT_INQUIRY: "#C2562F", // terracotta
  PARTNERSHIP: "#4A3AA7", // violet
  CAREER: "#1BAF7A", // aqua
};

export const TYPE_LABEL: Record<SubmissionType, string> = {
  PROJECT_INQUIRY: "Inquiry",
  PARTNERSHIP: "Partnership",
  CAREER: "Career",
};

/** Fixed stacking order — colour follows the entity, never its rank. */
export const STACK_ORDER: SubmissionType[] = [
  "PROJECT_INQUIRY",
  "PARTNERSHIP",
  "CAREER",
];

/** Single hue for magnitude-only bars (length carries the value). */
export const BAR_HUE = "#8A6A4B";
export const INK_MUTED = "#8B7A69";
export const GRID = "rgba(51,39,31,0.10)";
export const BASELINE = "rgba(51,39,31,0.20)";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-07-21" → "21 Jul" */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`;
}
