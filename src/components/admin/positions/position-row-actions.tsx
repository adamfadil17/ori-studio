"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { toast, toastError } from "@/lib/toast";

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
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  async function remove() {
    // Applications survive the delete (the FK is set to null) but lose their
    // link to the role — say so plainly rather than just "are you sure?".
    const warning =
      applicationCount > 0
        ? ` ${applicationCount} application${
            applicationCount === 1 ? "" : "s"
          } will be kept but no longer linked to this role.`
        : "";

    const ok = await confirm({
      title: `Delete “${title}”?`,
      description: `This cannot be undone.${warning}`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    setBusy(true);
    try {
      await axios.delete(`/api/open-positions/${id}`);
      toast.success(`“${title}” deleted`);
      router.refresh();
    } catch (err) {
      toastError(err, "Delete failed");
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-3">
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
