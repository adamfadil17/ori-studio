import { notFound } from "next/navigation";

import BackLink from "@/components/admin/ui/back-link";
import UserForm from "@/components/admin/users/user-form";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const session = await getSession();
  if (session?.role !== "admin") notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/dashboard/users">Users</BackLink>
      <h1 className="mt-4 font-serif text-3xl text-headline">New account</h1>
      <p className="mt-2 text-sm text-body">
        Editors can manage projects, journal articles and open positions.
        Submissions and this user list stay admin-only.
      </p>

      <UserForm currentUserId={session.userId} />
    </div>
  );
}
