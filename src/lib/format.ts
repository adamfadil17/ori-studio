const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * `12 Mar 2026`, or an em dash when there is no date.
 *
 * Deliberately UTC rather than `toLocaleDateString`: these render in Server
 * Components, and a timezone-dependent result would mismatch on hydration.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** `12 Mar 2026 · 09:41 UTC` — for timestamps where the hour matters. */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${formatDate(d)} · ${d.toISOString().slice(11, 16)} UTC`;
}

/** Turn an enum token into a readable label: `ARCHITECTURE_DESIGN` → "Architecture Design". */
export function humanizeEnum(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  return String(value)
    .toLowerCase()
    .split(/[_\s]+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");
}
