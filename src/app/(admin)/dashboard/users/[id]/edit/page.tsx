import { notFound } from "next/navigation";

import BackLink from "@/components/admin/ui/back-link";
import UserForm, {
  type UserFormInitial,
} from "@/components/admin/users/user-form";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "admin") notFound();

  const { id } = await params;

  const [user, adminCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    }),
    prisma.user.count({ where: { role: "admin" } }),
  ]);
  if (!user) notFound();

  const initial: UserFormInitial = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/users">Users</BackLink>
      <h1 className="mt-4 font-serif text-3xl text-headline">{user.name}</h1>
      <p className="mt-2 text-sm text-body">
        {user.email} · joined {formatDate(user.created_at)}
      </p>

      <UserForm
        initial={initial}
        currentUserId={session.userId}
        isLastAdmin={user.role === "admin" && adminCount <= 1}
      />
    </div>
  );
}
