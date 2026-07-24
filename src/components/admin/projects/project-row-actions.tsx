"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useConfirm } from "@/components/admin/ui/confirm-dialog";
import { toast, toastError } from "@/lib/toast";

export default function ProjectRowActions({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  async function remove() {
    // Deleting cascades translations + images, so spell that out.
    const ok = await confirm({
      title: `Delete “${name}”?`,
      description:
        "This removes its translations and images, and cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    setBusy(true);
    try {
      await axios.delete(`/api/projects/${id}`);
      toast.success(`“${name}” deleted`);
      router.refresh();
    } catch (err) {
      toastError(err, "Delete failed");
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <Link
        href={`/dashboard/projects/${id}/edit`}
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
