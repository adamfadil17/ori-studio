"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function PositionRowActions({
  id,
  title,
  applicationCount,
}: {
  id: string;
  title: string;
  applicationCount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    // Applications survive the delete (the FK is set to null) but lose their
    // link to the role — say so plainly rather than just "are you sure?".
    const warning =
      applicationCount > 0
        ? `\n\n${applicationCount} application${
            applicationCount === 1 ? "" : "s"
          } will be kept but no longer linked to this role.`
        : "";

    if (!window.confirm(`Delete “${title}”? This cannot be undone.${warning}`)) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await axios.delete(`/api/open-positions/${id}`);
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
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-xs text-red-700">{error}</span>}
      <Link
        href={`/dashboard/positions/${id}/edit`}
        className="text-xs tracking-widest uppercase text-eyebrow hover:opacity-70"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="text-xs tracking-widest uppercase text-red-800 transition-opacity hover:opacity-70 hover:cursor-pointer disabled:opacity-50"
      >
        {busy ? "…" : "Delete"}
      </button>
    </div>
  );
}
