/** Published / Draft pill, shared by the table rows and the grid cards. */
export function StateBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] tracking-widest uppercase ${
        published
          ? "bg-eyebrow text-background-main"
          : "border border-eyebrow/40 text-body"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

/**
 * Which locales exist, plus the featured flag. Surfacing "ID missing" here is
 * the quickest way for an editor to spot half-translated content.
 */
export function LocaleBadges({
  hasId,
  featured,
}: {
  hasId: boolean;
  featured: boolean;
}) {
  return (
    <span className="flex flex-wrap gap-2 text-[10px] tracking-widest uppercase text-eyebrow">
      <span>EN</span>
      {hasId ? <span>ID</span> : <span className="text-body/50">ID missing</span>}
      {featured && <span>Featured</span>}
    </span>
  );
}
