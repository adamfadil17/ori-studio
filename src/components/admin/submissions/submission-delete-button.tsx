"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SubmissionDeleteButton({
  kind,
  id,
  name,
  /** Where to go after deleting — the list refreshes in place, the detail page navigates away. */
  redirectTo,
}: {
  kind: string;
  id: string;
  name: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    // Submissions are a record of a real person contacting the studio — no
    // recycle bin, so make the consequence explicit.
    if (
      !window.confirm(
        `Delete the submission from “${name}”? This permanently removes their message and cannot be undone.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await axios.delete(`/api/submissions/${kind}/${id}`);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.error ?? "Delete failed")
          : "Delete failed",
      );
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="text-xs text-red-700">{error}</span>}
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="text-xs tracking-widest uppercase text-red-800 transition-opacity hover:opacity-70 hover:cursor-pointer disabled:opacity-50"
      >
        {busy ? "…" : "Delete"}
      </button>
    </span>
  );
}
