import { redirect } from "next/navigation";

import ChangePasswordForm from "@/components/admin/account/change-password-form";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Everyone's own account page — the only password path an editor has, since
 * /dashboard/users is admin-only.
 */
export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, role: true, created_at: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs tracking-widest uppercase text-eyebrow">Account</p>
      <h1 className="mt-3 font-serif text-3xl text-headline">{user.name}</h1>
      <p className="mt-2 text-sm text-body">
        {user.email} · {user.role} · joined {formatDate(user.created_at)}
      </p>

      <ChangePasswordForm />
    </div>
  );
}
