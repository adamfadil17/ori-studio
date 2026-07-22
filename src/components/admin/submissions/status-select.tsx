"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import axios from "axios";

import { humanizeEnum } from "@/lib/format";
import type { SubmissionStatus } from "@/lib/types";

const STATUSES: SubmissionStatus[] = [
  "NEW",
  "REVIEWED",
  "QUOTED",
  "BOOKED",
  "ARCHIVED",
];

/**
 * Inline triage control — changing the value saves immediately, so an admin can
 * work down the inbox without opening each submission.
 */
export default function StatusSelect({
  kind,
  id,
  status,
}: {
  kind: string;
  id: string;
  status: SubmissionStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function change(next: string) {
    setPending(true);
    setError(false);
    try {
      await axios.patch(`/api/submissions/${kind}/${id}`, { status: next });
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="relative inline-flex items-center">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        aria-label="Submission status"
        className={`cursor-pointer appearance-none border bg-transparent py-1 pl-2 pr-6 text-[10px] tracking-widest uppercase focus-visible:outline-none disabled:opacity-50 ${
          error
            ? "border-red-700 text-red-700"
            : status === "NEW"
              ? "border-eyebrow bg-eyebrow text-background-main"
              : "border-headline/25 text-body"
        }`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="bg-background-main text-headline">
            {humanizeEnum(s)}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-1.5 h-3 w-3 ${
          status === "NEW" && !error ? "text-background-main" : "text-body"
        }`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </span>
  );
}
