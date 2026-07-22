"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UserRowActions({
  id,
  name,
  email,
  /** True for the signed-in admin's own row. */
  isSelf,
  /** True when this is the only admin account left. */
  isLastAdmin,
}: {
  id: string;
  name: string;
  email: string;
  isSelf: boolean;
  isLastAdmin: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Both are refused by the API as well; hiding them here just avoids
  // offering an action that can only fail.
  const canDelete = !isSelf && !isLastAdmin;

  async function remove() {
    if (
      !window.confirm(
        `Delete ${name} (${email})? They lose dashboard access immediately. This cannot be undone.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await axios.delete(`/api/users/${id}`);
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
        href={`/dashboard/users/${id}/edit`}
        className="text-xs tracking-widest uppercase text-eyebrow hover:opacity-70"
      >
        Edit
      </Link>
      {canDelete ? (
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="text-xs tracking-widest uppercase text-red-800 transition-opacity hover:opacity-70 hover:cursor-pointer disabled:opacity-50"
        >
          {busy ? "…" : "Delete"}
        </button>
      ) : (
        <span
          className="text-xs tracking-widest uppercase text-body/40"
          title={
            isSelf
              ? "You cannot delete your own account"
              : "The last admin cannot be deleted"
          }
        >
          Delete
        </span>
      )}
    </div>
  );
}
