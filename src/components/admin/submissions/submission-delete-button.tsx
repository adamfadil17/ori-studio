"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { toast, toastError } from "@/lib/toast";

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
    try {
      await axios.delete(`/api/submissions/${kind}/${id}`);
      toast.success(`Submission from “${name}” deleted`);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      toastError(err, "Delete failed");
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
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
