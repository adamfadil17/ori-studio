import Link from "next/link";
import { notFound } from "next/navigation";

import FilterBar from "@/components/admin/ui/filter-bar";
import UserRowActions from "@/components/admin/users/user-row-actions";
import Pagination from "@/components/ui/pagination";
import { formatDate } from "@/lib/format";
import { getSession } from "@/lib/session";
import { listUsersForAdmin } from "@/lib/users";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

const ROLES = ["admin", "editor", "user"];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  user: "User",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}) {
  const session = await getSession();
  // The sidebar hides this link for editors and the API rejects them, but the
  // page renders account data — don't rely on those alone.
  if (session?.role !== "admin") notFound();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const search = params.q?.trim() || undefined;
  const role = ROLES.includes(params.role ?? "") ? params.role : undefined;

  const { data, total, totalPages, adminCount } = await listUsersForAdmin({
    page,
    limit: PAGE_SIZE,
    search,
    role,
  });

  const query = { q: search, role };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-eyebrow">
            Access
          </p>
          <h1 className="mt-3 font-serif text-3xl text-headline">Users</h1>
          <p className="mt-2 text-sm text-body">
            {total} {total === 1 ? "account" : "accounts"} total
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="bg-eyebrow px-6 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90"
        >
          New account
        </Link>
      </div>

      <div className="mt-6 border-b border-headline/10 pb-6">
        <FilterBar
          basePath="/dashboard/users"
          search={search}
          searchPlaceholder="Search by name or email…"
          searchAriaLabel="Search users by name or email"
          filters={[
            {
              name: "role",
              label: "Role",
              value: role ?? "",
              options: ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
            },
          ]}
        />
      </div>

      {data.length === 0 ? (
        <p className="mt-8 border border-dashed border-headline/15 px-4 py-12 text-center text-sm text-body">
          {search || role
            ? "No accounts match the current filters."
            : "No accounts yet."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto bg-background-main">
          <table className="w-full min-w-2xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-headline/10 text-[10px] tracking-[0.15em] uppercase text-body">
                <th className="px-4 py-3 text-left font-normal">Name</th>
                <th className="px-3 py-3 text-left font-normal">Email</th>
                <th className="px-3 py-3 text-left font-normal">Role</th>
                <th className="px-3 py-3 text-left font-normal">Created</th>
                <th className="px-4 py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => {
                const isSelf = user.id === session.userId;
                return (
                  <tr
                    key={user.id}
                    className="border-b border-headline/5 align-top"
                  >
                    <td className="px-4 py-3 text-headline">
                      {user.name}
                      {isSelf && (
                        <span className="ml-2 text-[10px] tracking-widest uppercase text-eyebrow">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-body">{user.email}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-[10px] tracking-widest uppercase ${
                          user.role === "admin"
                            ? "bg-headline text-background-main"
                            : user.role === "editor"
                              ? "border border-headline/25 text-headline"
                              : "border border-headline/15 text-body"
                        }`}
                      >
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-body">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserRowActions
                        id={user.id}
                        name={user.name}
                        email={user.email}
                        isSelf={isSelf}
                        isLastAdmin={user.role === "admin" && adminCount <= 1}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/dashboard/users"
        query={query}
      />
    </div>
  );
}
