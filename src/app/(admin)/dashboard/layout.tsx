import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/admin-shell";
import { getSession, STAFF_ROLES } from "@/lib/session";

/**
 * Chrome for every /dashboard/* route (sidebar + header). Lives here rather
 * than in the (admin) root layout so /login stays bare.
 *
 * Middleware already gates these routes; re-checking here is defence in depth
 * and gives the shell the signed-in user without an extra round-trip.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session || !STAFF_ROLES.includes(session.role)) redirect("/login");

  return (
    <AdminShell email={session.email} role={session.role}>
      {children}
    </AdminShell>
  );
}
