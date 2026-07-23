"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

import { toast, toastError } from "@/lib/toast";
import {
  Briefcase,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  FolderKanban,
  Tags,
  UserCog,
  Users,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  /** Omit to allow all staff; set to restrict to specific roles. */
  roles?: string[];
}

// Mirrors what each API actually allows: content is admin+editor,
// submissions and users are admin-only.
const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/journal", label: "Journal", icon: Newspaper },
  { href: "/dashboard/positions", label: "Open Positions", icon: Briefcase },
  // Categories and locations behind the project/article forms.
  { href: "/dashboard/lists", label: "Lists", icon: Tags },
  { href: "/dashboard/submissions", label: "Submissions", icon: Inbox, roles: ["admin"] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["admin"] },
  // Every staff member manages their own password here — editors have no
  // other route to it, since /dashboard/users is admin-only.
  { href: "/dashboard/account", label: "My Account", icon: UserCog },
];

function isActive(pathname: string, href: string): boolean {
  // "/dashboard" should only match exactly, not every child route.
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const items = NAV.filter((item) => !item.roles || item.roles.includes(role));

  // Close the drawer on Escape. (Navigation closes it via the links' onClick,
  // rather than an effect that would trigger a cascading render.)
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  async function signOut() {
    setSigningOut(true);
    try {
      await axios.post("/api/auth/logout");
      toast.success("Signed out");
      router.replace("/login");
      router.refresh();
    } catch (err) {
      toastError(err, "Could not sign out");
      setSigningOut(false);
    }
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 px-4 py-2.5 text-xs tracking-widest uppercase transition-colors ${
              active
                ? "bg-eyebrow text-background-main"
                : "text-body hover:bg-eyebrow/5 hover:text-eyebrow"
            }`}
          >
            <Icon size={15} strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link href="/dashboard" className="block px-4 py-1">
      <span className="block text-[10px] tracking-[0.25em] uppercase text-eyebrow">
        Dashboard
      </span>
      <span className="mt-0.5 block font-serif text-lg tracking-wide text-headline">
        ORI Studio
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar (desktop) ───────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-headline/10 bg-background-alt py-6 lg:flex">
        {brand}
        <div className="mt-8">{nav}</div>
      </aside>

      {/* ── Sidebar (mobile drawer) ─────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-headline/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="relative flex h-full w-64 flex-col border-r border-headline/10 bg-background-alt py-6"
          >
            <div className="flex items-start justify-between pr-4">
              {brand}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="p-1 text-eyebrow transition-opacity hover:opacity-60 hover:cursor-pointer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="mt-8">{nav}</div>
          </aside>
        </div>
      )}

      {/* ── Main column ─────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-headline/10 bg-background-main px-5 py-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="p-1 text-eyebrow transition-opacity hover:opacity-60 hover:cursor-pointer lg:hidden"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <div className="text-right leading-tight">
              <p className="text-xs text-headline">{email}</p>
              <p className="text-[10px] tracking-widest uppercase text-eyebrow">
                {role}
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="flex items-center gap-2 border border-eyebrow/40 px-4 py-2 text-xs tracking-widest uppercase text-eyebrow transition-opacity hover:opacity-70 hover:cursor-pointer disabled:opacity-50"
            >
              <LogOut size={14} strokeWidth={1.5} />
              {signingOut ? "…" : "Sign out"}
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
