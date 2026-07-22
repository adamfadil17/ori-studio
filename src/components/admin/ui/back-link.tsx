import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** "← Section" link used at the top of every admin sub-page. */
export default function BackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-body transition-opacity hover:opacity-70"
    >
      <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
      {children}
    </Link>
  );
}
